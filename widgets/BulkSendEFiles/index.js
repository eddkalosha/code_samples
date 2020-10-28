BPSystem.initialize();

let SearchDef = [
    {label: "Invoice ID", criteria: "InvoiceId = '?'", code: 'dd'},
    {label: "Account Name", criteria: "AccountObj.Name like '%?%'", code: 'account'},
    {
        label: "Billing Cycle End Date From",
        type: "date",
        criteria: "trunc(InvoiceObj.BillingCycleEndDate) >= '?'",
        code: 'endFrom'
    },
    {
        label: "Billing Cycle End Date To",
        type: "date",
        criteria: "trunc(InvoiceObj.BillingCycleEndDate) <= '?'",
        code: 'endTo'
    },
];

let tab = "simple",
    invoicesByEfile = {};

function isFilteringEnabled() {
    let criterias = getFilters();
    return criterias && criterias.length;
}

function formatDate(str, tz) {
    if ( str ) {
        let date = moment(str);
        date = (tz ? date.utcOffset(tz) : date.utc());
        return date.format("MM/DD/YYYY");
    }
    return str;
}

function prepareDate(str) {
    if ( str ) {
        return moment(str).format("YYYY-MM-DD");
    }
    return str;
}

function formatAmount(str) {
    if ( str ) {
        return "$" + parseFloat(str).toFixed(2);
    }
    return str;
}

function bindLoading() {
    $(".loading").addClass("main-grid-loading");
}

function startLoading() {
    $(".main-grid-loading").show();
}

function stopLoading() {
    $(".main-grid-loading").hide();
}

function enableSearch() {
    searchExpandState = true;
    expandCollapseSearch(null, false);
    $("#top-tools").show();
    $(".searchLink").show();
    document.querySelector(".searchLink").click();
}


function addInvoicesToSelection(efileId, invoices) {
    if ( invoices && invoices.length ) {
        let selection = invoicesByEfile[efileId] || [];
        invoicesByEfile[efileId] = selection.concat(invoices);
    }
}

function removeInvoicesFromSelection(efileId, invoices) {
    if ( invoices && invoices.length ) {
        let selection = invoicesByEfile[efileId] || [];
        invoices.forEach(function(invoiceId) {
            let idx = selection.indexOf(invoiceId);
            if ( idx >= 0 ) {
                selection.splice(idx, 1);
            }
        });
        if ( selection.length ) {
            invoicesByEfile[efileId] = selection;
        } else {
            delete invoicesByEfile[efileId];
        }
    }
}

function getFilters() {
    let quote = new RegExp("'", "g"),
        binding = new RegExp("\\?"),
        criterias = [];
    SearchDef.forEach(function(elem, idx) {
        let value = $("#SearchDef" + idx).val();
        if ( value ) {
            value = value.replace(quote, "\"");
            criterias.push(elem.criteria.replace(binding, value));
        }
    });
    return criterias;
}

function doSearch() {
    startLoading();
    mainGridController.update();
}

function doClearSearch() {
    document.invoiceSearchForm.reset();
}


function getSelectedSubscriptions() {
    let selection = "" + $('#grid').getGridParam('selarrrow');
    return (selection ? selection.split(',') : []);
}

function doAction() {
    return function() {
        let efileIds = mainGridController.checkedEfiles; 
        doSendEFiles(efileIds);
    }
}

function doCancel() {
    add_attr_submit('SET_FORM_VIEW', 'form_type_in', 'X');
    return false;
}

function doSendEFiles(efileIds) {
    startLoading();
    let grid = $("#grid"),
        events = {},
        eventsContent = {},
        eventsCollection = BPSystem.toBPCollection([], BPConnection.EfileEvent),
        eventsContentCollection = BPSystem.toBPCollection([], BPConnection.EfileEventContent);

    for ( let efileId in invoicesByEfile ) {
        events[efileId] = {EfileId: efileId, EfileSendToQueue: 0};
        eventsContent[efileId] = invoicesByEfile[efileId].map(invoiceId=>({EfileEventDocumentId: invoiceId}));
    }
    efileIds = efileIds || [];
    efileIds.forEach(function(efileId) {
        events[efileId] = {EfileId: efileId, EfileSendToQueue: 0};
      //  delete eventsContent[efileId];
    });

    for ( let efileId in events ) {
        eventsCollection.elements = eventsCollection.elements.concat(events[efileId]);
    }

    for ( let efileId in eventsContent ) {
        eventsContentCollection.elements = eventsContentCollection.elements.concat(eventsContent[efileId]);
    }

    eventsCollection.create(true).then(function(responses) {
        for ( let idx = 0, len = eventsCollection.elements.length ; idx < len ; ++idx ) {
            eventsCollection.elements[idx].Id = responses[idx].Id;
            eventsCollection.elements[idx].EfileSendToQueue = 1;
        }
    }).then(function() {
        for ( let efileId in eventsContent ) {
            let contents = eventsContent[efileId] || [];
            contents.forEach(function(eventContent) {
                eventContent.EfileEventId = events[efileId].Id;
            });
        }
        return (eventsContentCollection.elements.length
            ? eventsContentCollection.create(true)
            : $.Deferred().resolve([]));
    }).then(function() {
        return eventsCollection.update(true);
    }).done(function() { 
        window.location = "admin.jsp?name=ELECTRONIC_FILES&key=" + eventsCollection.elements[0].Id + "&mode=R";
    }).fail(function(responses) {
        alert("Error while sending Electronic Files");
    }).always(stopLoading);
}

function flatten(arr) {
    return arr.reduce(function(flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}


/**
 * @class
 * @description Parent class for DataGrid controllers
 */
class GridController {
    /**
     * @method
     * @param params - {onUpdate - default update handler}
     * @description Constructor for class. Initialises main props.
     *
     */
    constructor(params) {
        if ( !params ) params = {};
        this._mainQueryParams = {};
        this.mainGridData = {fields: [], data: []};
        this.updateHandlers = [];
        this.sortField = void 0;
        this.pagination = {offset: 0, elementsPerPage: 50}; 
        this.addUpdateHandler(params.onUpdate);
    }

    /**
     * @method
     * @description Load new data and refreshs grid
     */
    update() {
        startLoading();
        this.fetchMainData().then(data=> {
            this.mainGridData = {data}; 
            this.refreshGrid();
            stopLoading();
        });
    }

    /**
     * @method
     * @param offset
     * @param elementsPerPage
     * @param currentPage
     * @description Updates page and reload data. Handler for Paginator.
     */
    changePage({offset, elementsPerPage, currentPage}) {
        this.pagination = {pageSize: elementsPerPage, pageNum: currentPage};
        this.update();
    }

    /**
     * @method
     * @param handler - function
     * @description Adds new functions, that'll apply on data updates
     */
    addUpdateHandler(handler) {
        if ( typeof handler === 'function' ) {
            this.updateHandlers.push(handler);
        }
    }

    /**
     * @method
     * @param args - transitional variables
     * @description Apply all handle functions, that was added by {@link addUpdateHandler}
     */
    onUpdate(...args) {
        for ( let i = 0 ; i < this.updateHandlers.length ; i++ ) {
            this.updateHandlers[i](...args);
        }
    }

    /**
     * @method
     * @returns string url
     * @description Generates url string for main query
     */
    get mainQueryUrl() {
        return `listDataSource?` + this.mainQueryParams
            .map(({key,value})=>key + "=" + encodeURIComponent(value))
            .join('&');
    }

    /**
     * @property
     * @returns {Array}
     * @description Array of params for main query. Empty array in this proto to override in child classes.
     */
    get mainQueryParams() {
        return []
    }

    /**
     * @method
     * @description Fire all handlers to update all linked grids.
     */
    refreshGrid() {
        this.onUpdate();
    }

    /**
     * @method
     * @param name
     * @description Runs sorting of grid elements and fires main grid update handlers.
     */
    sort({name}) {
        if ( !name || name === void 0 ) return;
        const fieldName = name;
        if ( !this.sortField ) this.sortField = {};
        if ( this.sortField.field !== fieldName ) {
            this.sortField = {field: fieldName, method: 'asc'};
        } else {
            this.sortField = {field: fieldName, method: this.sortField.method === 'asc' ? 'desc' : 'asc'}
        }
        this.update();
    }

    /**
     * @method
     * @returns {Promise}
     * @description Main method for data fetching
     */
    fetchMainData() {
    }
}

class MainGridController extends GridController {
    constructor(params) {
        super(params);
        this.update();
    }

    findFilteredSubscriptions() {
        const criterias = getFilters() || [];
        let query = "select "
            + "EfileId , "
            + "count(AccountId) as accountsCount "
            + "from EFILE_MANUAL "
            + "where 1=1 ";
        criterias.forEach(function(criteria) {
            query = query + " and " + criteria;
        });
        query = query + " group by EfileId";

        return new Promise((resolve, reject)=> {
            BPConnection.EfileManual.queryAsync(query).collection()
                .then((res) => {
                    const efiles = res.elements.map(efile=>efile.EfileId);
                    resolve(efiles);
                })
                .fail(reject);
        });
    }

    findSubscriptions(efileIds) {
        const {offset, elementsPerPage:size} = this.pagination;
        const query = `
        SELECT a.Id AS Id, a.Id AS accountId,
        a.Name AS accountName,
        e.Id AS efileId,
        et.EfileTemplateName AS efileName,
        count(em.AccountId) AS accountsCount,
        count(em.InvoiceId) AS invoicesCount
        FROM EFILE_MANUAL em, ACCOUNT a, EFILE e, EFILE_TEMPLATE et
        WHERE em.Level = 1
        AND em.AccountId = a.Id
        AND em.EfileId = e.Id
        AND e.EfileTemplateId = et.Id
        AND rownum >  ${offset}
        AND rownum <= ${(offset + size)}
        ${(efileIds && efileIds.length && efileIds.join )? `AND em.EfileId IN (${efileIds.join(",")})` : ``}  
        AND (SubtreeHasInvoices = 1 OR AccountHasInvoices = 1) 
        GROUP BY 
        e.Id, 
        et.Id, 
        et.EfileTemplateName, 
        a.Id, 
        a.Name 
        ORDER BY a.Id 
        `; 

        return new Promise((resolve, reject)=> {
            BPConnection.EfileManual.queryAsync(query).collection().done((collection)=> {
                resolve(collection.elements);
            }).fail(reject);
        });
    }

    onCheckboxChange(item,e,classname) {
        const t = e.currentTarget; 
        const checked = t.checked,
            efileId = item.efileId;

        const invoices = MainGridController.extractInvoicesIds(item);
        if ( checked ) {
            t.parentNode.parentNode.classList.add('row-checked');
            this.checkedEfiles.add(efileId);
            if ( invoices && invoices.length ) addInvoicesToSelection(efileId, invoices)
        } else {
            t.parentNode.parentNode.classList.remove('row-checked');
            this.checkedEfiles.delete(item.efileId);
            if ( invoices && invoices.length ) removeInvoicesFromSelection(efileId, invoices)
        }

    }

    static extractInvoicesIds(item) {
        let invoices = [];
        if ( item.invoiceId ) {
            invoices.push(item.invoiceId);
            return invoices;
        }
        if ( item.children ) {
            for ( let i = 0 ; i < item.children.length ; i++ ) {
                const child = item.children[i];
                invoices = invoices.concat(MainGridController.extractInvoicesIds(child));
            }
        } 
        return invoices
    }

    fetchMainData() { 

        this.checkedEfiles = new Set();
        return this.findFilteredSubscriptions([])
            .then(this.findSubscriptions.bind(this))
    }
}
const MainGrid = React.createClass({
    getInitialState: function() {
        return {
            fields: [
                {label: 'Account ID', name: 'accountId'},
                {label: 'Account Name', name: 'accountName'},
                {label: 'Electronic File Name', name: 'efileName'}
            ],
            data: []
        }
    },
    componentDidMount: function() {
        mainGridController.addUpdateHandler(this.update);
    },
    update: function() {
        this.setState({data: mainGridController.mainGridData.data});
    },
    render: function() {
        const {fields, data} = this.state;
        return (
            <BPUI.DataGrid fields={fields} data={data} onCheckChange={console.log}
                      showCheckboxes={true}
                      onCheckboxChange={mainGridController.onCheckboxChange.bind(mainGridController)}
                      getExpanded={(item)=>(<TreeGrid item={item}/>)} expandable={true}/>
        )
    }
});

class TreeGridController extends GridController {
    constructor(params) {
        super(params);
        const {efileId, accountId} = params;
        if ( efileId === void 0 ) throw new Error('Undefined EFile ID');
        this.efileId = efileId;
        this.accountId = accountId;
        this.update();
    }

    findFilteredSubscriptionInvoices() {
        const {efileId} = this;
        const criterias = getFilters() || [];
        let query = "SELECT Id, "
            + "Level, "
            + "EfileId, "
            + "AccountObj.Id, "
            + "AccountObj.Name, "
            + "AccountObj.ParentAccountId, "
            + "InvoiceObj.Id, "
            + "InvoiceObj.BillingCycleEndDate "
            + "FROM EFILE_MANUAL "
            + "WHERE EfileId=" + efileId + " "
            + "AND InvoiceId IS NOT NULL ";

        criterias.forEach(function(criteria) {
            query = query + " and " + criteria;
        });
        query = query
            + " ORDER BY AccountObj.Id";

        return new Promise((resolve, reject)=> {
            BPConnection.EfileManual.queryAsync(query).collection()
                .done((collection)=> {
                    resolve(collection.elements.map(invoice=> {
                        invoice.efileId = invoice.EfileId;
                        invoice.accountId = invoice.AccountObj.Id;
                        invoice.accountName = invoice.AccountObj.Name;
                        invoice.parentAccountId = invoice.AccountObj.Id;
                        invoice.accountLevel = 1 + parseInt(invoice.Level);
                        invoice.invoiceId = invoice.InvoiceObj.Id;
                        invoice.invoiceBillingCycleEndDate = formatDate(invoice.InvoiceObj.BillingCycleEndDate);
                        invoice.isLeaf = true;
                        return invoice;
                    }))
                })
                .fail(()=> {
                    resolve([])
                });
        });
    }

    findSubscriptionAccounts() {
        let query = `
            SELECT em.Level AS accountLevel,
                em.HasChildAccounts AS hasChildAccounts,
                em.AccountHasInvoices AS hasInvoices,
                e.Id as efileId,
                et.EfileTemplateName AS efileName,
                a.Id AS Id,
                a.Id AS accountId,
                a.Name AS accountName,
                a.ParentAccountId AS parentAccountId,
                count(em.AccountId) AS accountsCount,
                count(em.InvoiceId) AS invoicesCount
            FROM EFILE_MANUAL em, ACCOUNT a, EFILE e, EFILE_TEMPLATE et
            WHERE em.EfileId = ${this.efileId}
            AND em.AccountId is not null
            AND em.AccountId <> ${this.accountId}
            AND (em.HasChildAccounts = 1 or em.AccountHasInvoices = 1)
            AND em.AccountId = a.Id
            AND em.EfileId = e.Id
            AND e.EfileTemplateId = et.Id
            GROUP BY em.Level,
                    em.HasChildAccounts,
                    em.AccountHasInvoices,
                    e.Id,
                    et.EfileTemplateName,
                    a.Id,
                    a.Name,
                    a.ParentAccountId
            ORDER BY em.Level, a.Id  `;


        return new Promise((resolve, reject)=> {
            BPConnection.EfileManual.queryAsync(query)
                .collection()
                .done(collection=> {
                    resolve(collection.elements);
                })
                .fail(()=> {
                    resolve([])
                });
        })
    }

    makeTree(items) { 
        const accounts = items[0].map(account=> {
            account.children = [];
            return account;
        }), invoices = items[1];
        return new Promise((resolve, reject)=> { 
            const result = [];

            for ( let i = 0 ; i < accounts.length ; i++ ) {
                const account = accounts[i];
                if ( account.parentAccountId === this.accountId ) {
                    result.push(account)
                } else {
                    const parent = accounts.find(item=> account.parentAccountId === item.accountId);
                    if ( parent ) {
                        parent.children.push(account);
                    }
                }
            }

            for ( let i = 0 ; i < invoices.length ; i++ ) {
                const invoice = invoices[i];
                if ( invoice.accountId === this.accountId ) {
                    result.push(invoice);
                } else {
                    const parent = accounts.find(item=> invoice.parentAccountId === item.accountId);
                    if ( parent ) {
                        parent.children.push(invoice);
                    }
                }
            } 
            resolve(result);
        });
    }

    fetchMainData() { 
        return Promise.all([this.findSubscriptionAccounts(), this.findFilteredSubscriptionInvoices([])])
            .then(this.makeTree.bind(this));
    }
}

const TreeGrid = React.createClass({
    getInitialState: function() {
        return {
            fields: [
                {label: 'Account Id', name: 'accountId', sorttype: 'int', sortable: true},
                {label: 'Account Name', name: 'accountName', sortable: true},
                {label: 'Invoice Id', name: 'invoiceId', sortable: true},
                {label: 'Billing Cycle End Date', name: 'invoiceBillingCycleEndDate', sortable: true},
            ],
            data: []
        }
    },
    componentDidMount: function() {
        this.controller = new TreeGridController({
            efileId: this.props.item.efileId,
            accountId: this.props.item.accountId,
            onUpdate: this.update
        });
    },
    update: function() {
        this.setState({data: this.controller.mainGridData.data});
    },
    render: function() {
        const {fields, data} = this.state;
        return (
            <BPUI.DataGrid fields={fields} data={data} tree={true}
                      onCheckboxChange={mainGridController.onCheckboxChange.bind(mainGridController)}
                      showCheckboxes={true} treeBaseField="accountId" defaultExpandTree={true}/>
        );
    }
});

/**
 * Temporary HTML part for comfort develop
 * @constructor
 */
const Component = ()=>(
    <div id="bulkForm">
        <form name="invoiceSearchForm">
            <div className="additional-options">
                <div id="search-box">
                    <div id="searchForm">
                        <table>
                            <tr>
                            </tr>
                            <tr id="search_form">
                                <td className="formBody" align="left">
                                    <table cellPadding="1" className="search-form-fields">
                                        {$.map(SearchDef, function(elem, idx) {
                                            return <tr className="recordData">
                                                <td>
                                                    <nobr>{elem.label}</nobr>
                                                </td>
                                                <td> {elem.type && elem.type === "date"
                                                    ? <BPUI.Date id={"SearchDef" + idx} type="date" name={"SearchDef" + idx}/>
                                                    : <input id={"SearchDef" + idx} name={"SearchDef" + idx}
                                                             className="formText" type="text" defaultValue=""
                                                             maxLength="256" size="50"/>}
                                                </td>
                                            </tr>
                                        })}
                                        <tr className="recordData">
                                            <td>&nbsp;</td>
                                            <td>
                                                <table align="left">
                                                    <tr>
                                                        <td>
                                                            <nobr>
                                                                <input type="button" value="Search" onClick={doSearch}/>
                                                                <input type="button" value="Clear"
                                                                       onClick={doClearSearch}
                                                                       style={{"margin-left": "5px"}}/>
                                                            </nobr>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </form>
        <form name="bulkActionForm">
            <nav>
                <table cellPadding="3">
                    <tr>
                        <td colSpan="2"><span className="formInfo">Check E-files that you want to send and click Submit button</span>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table cellPadding="2" cellSpacing="2">
                                <tr height="23">
                                    <td align="left">
                                        <div className="batch-actions">
                                            <input type="button" onClick={doAction("actionsUp")} value="Submit"/>
                                            <input type="button" onClick={doCancel} value="Cancel"
                                                   style={{"margin-left": "5px"}}/>
                                            <img className="main-grid-loading" src="images/loading.gif"
                                                 style={{"vertical-align": "top", "width": "28px", "display": "none"}}/>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </nav>
            <MainGrid/>
            <nav>
                <table cellPadding="3">
                    <tr>
                        <td>
                            <table cellPadding="2" cellSpacing="2">
                                <tr height="23">
                                    <td align="left">
                                        <div className="batch-actions up-icon">
                                            <input type="button" onClick={doAction("actionsDown")} value="Submit"/>
                                            <input type="button" onClick={doCancel} value="Cancel"
                                                   style={{"margin-left": "5px"}}/>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </nav>
        </form>
    </div>
);

 

/**
 * @component Line
 * @description Component for standard row.
 * @example <ButtonsBar><BPUI.Button/><BPUI.Button/></ButtonsBar>
 * @prop className - additional HTML class for root element
 * @prop style - addition styles for root elelemnt
 * @prop position - 'left'|'right'|'center' - position of buttons
 */

const Line = React.createClass({
    getDefaultProps: function() {
        return {className: '', style: {}, position: 'left'}
    },
    availablePositionsSet: new Set(['left', 'center', 'right']),
    render: function() {
        const {style, className, position} = this.props;
        const divClasses = ['bpui-line'];
        if ( className ) divClasses.push(className);
        if ( this.availablePositionsSet.has(position) ) divClasses.push(position);
        return (
            <div style={style} className={divClasses.join(' ')}>
                {this.props.children}
            </div>
        )
    }
});

/**
 * Created by Vladislav.Vapnik on 28.02.18.
 * @component BPUI.SearchForm
 */

const SearchForm = React.createClass({
    getDefaultProps: function() {
        return {
            id: 'searchForm',
            inputPrefix: 'SearchDef',
            fields: [],
            controller: void 0,
            doSearch: ()=> {
            }
        };
    },
    getInitialState: function() {
        return {values: {}, show: !!this.props.showAlways};
    },
    componentDidMount: function() {
        this.initSearchButton();
    },
    componentWillUnmount: function() {
        this.disableSearchButton();
    },
    onInputChange: function(code, e) {
        const {values} = this.state;
        values[code] = e.target.value;
        this.setState({values});
    },
    doClearSearch: function() {
        this.setState({values: {}})
    },
    initSearchButton: function() {
        const searchButton = document.querySelector('#top-tools>.search') || document.querySelector('a.searchLink');
        if ( !searchButton ) console.error('Search Button not found');
        searchButton.addEventListener('click', this.onClickSearchButton);
    },
    disableSearchButton: function() {
        const searchButton = document.querySelector('#top-tools>.search') || document.querySelector('a.searchLink');
        if ( !searchButton ) console.error('Search Button not found');
        searchButton.removeEventListener('click', this.onClickSearchButton);
    },
    onClickSearchButton: function() {
        const show = !this.state.show;
        this.setState({show});
    },
    render: function() {
        const {id,inputPrefix,fields, doSearch} = this.props;
        const {values, show} = this.state;
        return (
            <div className={`bpui-search-form ${show?'show':''}`}>
                <form id={id} className="search-form-form">
                    <div className="search-form-wrapper">
                        {fields.map(({code,label, type}, idx)=> {
                            const value = values[code] || '';
                            let input;
                            if ( type && (type === 'day' || type==='date')) {
                                input = (
                                    <BPUI.Date id={inputPrefix + idx} name={inputPrefix + idx} value={value}
                                               onChange={this.onInputChange.bind(this,code)}/>
                                )
                            } else {
                                if ( type && type === 'list' ) {
                                    input = <textarea id={inputPrefix + idx} name={inputPrefix + idx}
                                                      className="field-value-input" value={value}
                                                      onChange={this.onInputChange.bind(this,code)}
                                                      maxLength="256"/>
                                } else {
                                    input = (
                                        <input id={inputPrefix + idx} name={inputPrefix + idx}
                                               className="field-value-input"
                                               type="text" value={value}
                                               onChange={this.onInputChange.bind(this,code)}
                                               maxLength="256"/>
                                    )
                                }
                            }
                            return (
                                <div className="search-form-field" key={`form-field-${code}`}>
                                    <div className="form-field-label">
                                        {label} {type === 'list' && <BPUI.HelpText shortHelp="Invoice Id(s)"
                                                                                   longHelp="Enter multiple Invoice Ids separated by new line"/>}
                                    </div>
                                    <div className="form-field-value-wrapper">
                                        {input}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="search-form-buttons">
                        <input type="button" value="Search" onClick={doSearch}/>
                        <input type="button" value="Clear"
                               onClick={this.doClearSearch}/>
                    </div>
                </form>
            </div>
        )
    }
});

const mainGridController = window.mainGridController = new MainGridController({onUpdate: console.log});
BPUI.afterRender = function() {
    enableSearch();
    bindLoading();
    startLoading();
};