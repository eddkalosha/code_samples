<BPUI.Page>
    <SearchForm fields={SearchDef} doSearch={doSearch}/>
        <BPUI.Panel name="bulkActionForm">
            <Line className="iconed arrow-down">
                <input type="button" onClick={doAction("actionsUp")} value="Submit"/>
                <input type="button" onClick={doCancel} value="Cancel"
                       style={{"margin-left": "5px"}}/>
            </Line>
            <MainGrid/>
            <Line className="iconed arrow-up">
                <input type="button" onClick={doAction("actionsDown")} value="Submit"/>
                <input type="button" onClick={doCancel} value="Cancel"
                       style={{"margin-left": "5px"}}/>
            </Line>
        </BPUI.Panel>
</BPUI.Page>
__________________________________________________________________________________________________________________
.bpui-data-grid {
  width: 100%; }
  .bpui-data-grid .bpui-grid-head .bpui-grid-td {
    background: #ffffff;
    padding: 10px 2px 4px 8px;
    font-size: 11px;
    color: #666;
    font-weight: 600;
    text-transform: none;
    border-bottom: 1px solid #c5dbec;
    white-space: nowrap; }
    .bpui-data-grid .bpui-grid-head .bpui-grid-td.clicable {
      cursor: pointer; }
  .bpui-data-grid tbody {
    height: 600px;
    font-size: 13px; }
    .bpui-data-grid tbody .bpui-grid-tr {
      height: 34px; }
      .bpui-data-grid tbody .bpui-grid-tr.clicable {
        cursor: pointer; }
        .bpui-data-grid tbody .bpui-grid-tr.clicable:hover td {
          background: #f0fbff; }
      .bpui-data-grid tbody .bpui-grid-tr .bpui-grid-td {
        padding: 6px 0 4px 8px;
        background: #FFFFFF;
        border-bottom: 1px solid #eaeaea; }
        .bpui-data-grid tbody .bpui-grid-tr .bpui-grid-td.expander, .bpui-data-grid tbody .bpui-grid-tr .bpui-grid-td.td-check {
          width: 16px; }
        .bpui-data-grid tbody .bpui-grid-tr .bpui-grid-td .tree {
          text-align: right;
          color: #41a7ff;
          font-size: 10px; }
        .bpui-data-grid tbody .bpui-grid-tr .bpui-grid-td .bpui-button-expand {
          width: 100%;
          color: #41a7ff;
          font-size: 16px; }
    .bpui-data-grid tbody .data-grid-td-expand {
        position:relative;
      color: #41a7ff;
      padding: 10px; }
      .bpui-data-grid tbody .data-grid-td-expand i.fa{
        border-right: 1px dashed #eaeaea;
    position: absolute;
    right: 0;
    height: 100%;
    top: 0;
      }
      .bpui-data-grid tbody .data-grid-td-expand .bpui-icon-expanded-row {
        background-image: url(js/images/ui-icons_469bdd_256x240.png);
        background-position: -80px 0;
        width: 16px;
        height: 16px; }

.widget-paginator {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background: #f5f5f5;
  width: 100%;
  font-size: 11px; }
  .widget-paginator .paginator-flex-wrapper {
    flex-basis: 30%; }
  .widget-paginator .paginator-widget-per-page .paginator-widget-per-page-label {
    font-weight: bold;
    padding-left: 10px;
    font-size: 11px;
    color: #666;
    margin-right: 3px; }
  .widget-paginator .paginator-widget-per-page .paginator-widget-per-page-select {
    font-size: 0.8em; }
  .widget-paginator .paginator-page-selector {
    display: flex;
    justify-content: center;
    align-items: stretch; }
    .widget-paginator .paginator-page-selector .page-selector-direct {
      padding: 0 3px;
      border-left: 2px solid #CCC;
      border-right: 2px solid #CCC; }
      .widget-paginator .paginator-page-selector .page-selector-direct .selector-direct-input {
        font-size: 0.8em;
        height: 20px;
        width: 30px; }
    .widget-paginator .paginator-page-selector .page-selector-button {
      position: relative;
      flex-basis: 16px;
      display: flex;
      flex-direction: row;
      align-items: center;
      cursor: pointer; }
      .widget-paginator .paginator-page-selector .page-selector-button.disabled {
        opacity: 0.35;
        cursor: default; }
        .widget-paginator .paginator-page-selector .page-selector-button.disabled:after {
          content: ''; }
      .widget-paginator .paginator-page-selector .page-selector-button:after {
        content: ' ';
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: #000;
        opacity: 0;
        transition: opacity 0.3s ease; }
      .widget-paginator .paginator-page-selector .page-selector-button:hover:after {
        opacity: 0.05; }
      .widget-paginator .paginator-page-selector .page-selector-button .page-selector-icon {
        display: block;
        width: 16px;
        height: 16px;
        background-image: url("./js/jquiery-ui/themes/redmond/images/ui-icons_6da8d5_256x240.png"); }
        .widget-paginator .paginator-page-selector .page-selector-button .page-selector-icon.first {
          background-position: -80px -160px; }
        .widget-paginator .paginator-page-selector .page-selector-button .page-selector-icon.prev {
          background-position: -48px -160px; }
        .widget-paginator .paginator-page-selector .page-selector-button .page-selector-icon.next {
          background-position: -32px -160px; }
        .widget-paginator .paginator-page-selector .page-selector-button .page-selector-icon.last {
          background-position: -64px -160px; }
  .widget-paginator .paginator-page-total {
    text-align: end;
    padding-right: 5px; }

/* BPUI.Line */
.bpui-line {
  display: flex;
  width: 100%;
  padding: 5px;
  align-items: center; }
  .bpui-line.buttons-background {
    background: #f2f4f6;
    background: none; }
  .bpui-line.left {
    justify-content: flex-start; }
  .bpui-line.right {
    justify-content: flex-end; }
  .bpui-line.center {
    justify-content: center; }
  .bpui-line.arrow-down:before, .bpui-line.arrow-up:before {
    content: ' ';
    width: 24px;
    height: 24px;
    flex-shrink: 0; }
  .bpui-line.arrow-down.arrow-down:before, .bpui-line.arrow-up.arrow-down:before {
    background: url(images/batch-arrow.png) 5px 9px no-repeat; }
  .bpui-line.arrow-down.arrow-up:before, .bpui-line.arrow-up.arrow-up:before {
    background: url(images/batch-arrow-up.png) 5px 4px no-repeat; }
  .bpui-line.info {
    border: 1px solid #e1f1ff;
    padding-top: 7px;
    padding-bottom: 7px;
    font-size: 12px; }
    .bpui-line.info:before {
      content: ' ';
      width: 16px;
      height: 16px;
      background: url(images/icon-info-small.png);
      flex-shrink: 0;
      margin-right: 8px; }
  .bpui-line > * {
    margin-right: 5px; }

/* /BPUI.Line */
/* BPUI.SearchForm */
.bpui-search-form {
  max-height: 0;
  transition: 0.3s ease;
  overflow: hidden; }
  .bpui-search-form.show {
    max-height: 1000px; }
  .bpui-search-form .search-form-form .search-form-wrapper {
    display: flex;
    flex-wrap: wrap; }
    .bpui-search-form .search-form-form .search-form-wrapper .search-form-field {
      min-width: 40%;
      display: flex;
      margin: 5px; }
      .bpui-search-form .search-form-form .search-form-wrapper .search-form-field .form-field-label {
        width: 150px;
        display: flex;
        margin: auto 0; }
      .bpui-search-form .search-form-form .search-form-wrapper .search-form-field .form-field-value-wrapper {
        flex-basis: 60%;
        max-width: 200px; }
        .bpui-search-form .search-form-form .search-form-wrapper .search-form-field .form-field-value-wrapper .field-value-input {
          width: 100%; }

/* /BPUI.SearchForm */

.bpui-data-grid tbody .bpui-grid-tr.row-checked td.bpui-grid-td,
.bpui-data-grid tbody .bpui-grid-tr.col-checked td.bpui-grid-td{
    background:#dcf4fc;
}
  

__________________________________________________________________________________________________________________
BPSystem.initialize();

var SearchDef = [
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

var tab = "simple",
    invoicesByEfile = {};

function isFilteringEnabled() {
    var criterias = getFilters();
    return criterias && criterias.length;
}

function formatDate(str, tz) {
    if ( str ) {
        var date = moment(str);
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
    $(".searchLink").show();
}


function addInvoicesToSelection(efileId, invoices) {
    if ( invoices && invoices.length ) {
        var selection = invoicesByEfile[efileId] || [];
        invoicesByEfile[efileId] = selection.concat(invoices);
    }
}

function removeInvoicesFromSelection(efileId, invoices) {
    if ( invoices && invoices.length ) {
        var selection = invoicesByEfile[efileId] || [];
        invoices.forEach(function(invoiceId) {
            var idx = selection.indexOf(invoiceId);
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
    var quote = new RegExp("'", "g"),
        binding = new RegExp("\\?"),
        criterias = [];
    SearchDef.forEach(function(elem, idx) {
        var value = $("#SearchDef" + idx).val();
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
    var selection = "" + $('#grid').getGridParam('selarrrow');
    return (selection ? selection.split(',') : []);
}

function doAction() {
    return function() {
        var efileIds = mainGridController.efileIds;
        console.log(efileIds);
        doSendEFiles(efileIds);
    }
}

function doCancel() {
    add_attr_submit('SET_FORM_VIEW', 'form_type_in', 'X');
    return false;
}

function doSendEFiles(efileIds) {
    startLoading();
    var grid = $("#grid"),
        events = {},
        eventsContent = {},
        eventsCollection = BPSystem.toBPCollection([], BPConnection.EfileEvent),
        eventsContentCollection = BPSystem.toBPCollection([], BPConnection.EfileEventContent);

    for ( var efileId in invoicesByEfile ) {
        events[efileId] = {EfileId: efileId, EfileSendToQueue: 0};
        eventsContent[efileId] = $.map(invoicesByEfile[efileId], function(invoiceId) {
            return {
                EfileEventDocumentId: invoiceId
            };
        });
    }
    efileIds = efileIds || [];
    efileIds.forEach(function(efileId) {
        events[efileId] = {EfileId: efileId, EfileSendToQueue: 0};
        delete eventsContent[efileId];
    });

    for ( var efileId in events ) {
        eventsCollection.elements = eventsCollection.elements.concat(events[efileId]);
    }

    for ( var efileId in eventsContent ) {
        eventsContentCollection.elements = eventsContentCollection.elements.concat(eventsContent[efileId]);
    }

    eventsCollection.create(true).then(function(responses) {
        for ( var idx = 0, len = eventsCollection.elements.length ; idx < len ; ++idx ) {
            eventsCollection.elements[idx].Id = responses[idx].Id;
            eventsCollection.elements[idx].EfileSendToQueue = 1;
        }
    }).then(function() {
        for ( var efileId in eventsContent ) {
            var contents = eventsContent[efileId] || [];
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
        console.log("admin.jsp?name=ELECTRONIC_FILES&key=" + eventsCollection.elements[0].Id + "&mode=R");
        //window.location = "admin.jsp?name=ELECTRONIC_FILES&key=" + eventsCollection.elements[0].Id + "&mode=R";
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
        console.log(params);
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

            console.log(this);
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
            console.log(handler);
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
        console.log('constructor end');
    }

    findFilteredSubscriptions() {
        const criterias = getFilters() || [];
        console.log('findFilteredSubscriptions');
        var query = "select "
            + "EfileId, "
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
                    console.log(efiles);
                    resolve(efiles);
                })
                .fail(reject);
        });
    }

    findSubscriptions(efileIds) {
        console.log(this);
        const {offset, elementsPerPage:size} = this.pagination;
        console.log(offset + size);
        var query = "select "
            + "AccountObj.Id as accountId, "
            + "AccountObj.Name as accountName, "
            + "EfileObj.Id as efileId, "
            + "EfileObj.EfileTemplateObj.EfileTemplateName as efileName, "
            + "count(AccountId) as accountsCount, "
            + "count(InvoiceId) as invoicesCount "
            + "from EFILE_MANUAL "
            + "where Level = 1 "
            + "and rownum > " + offset + " "
            + "and rownum <= " + (offset + size) + " ";

        if ( efileIds && efileIds.length && efileIds.join ) {
            query = query
                + "and EfileId in (" + efileIds.join(",") + ") ";
        }

        query = query
            + "and (SubtreeHasInvoices = 1 or AccountHasInvoices = 1) "
            + "group by "
            + "EfileObj.Id, "
            + "EfileObj.EfileTemplateObj.Id, "
            + "EfileObj.EfileTemplateObj.EfileTemplateName, "
            + "AccountObj.Id, "
            + "AccountObj.Name "
            + "order by AccountObj.Id ";

        return new Promise((resolve, reject)=> {
            BPConnection.EfileManual.queryAsync(query).collection().done((collection)=> {
                resolve(collection.elements);
            }).fail(reject);
        });
    }

    onCheckboxChange(item, classname,e) {
       // const t = e.currentTarget;
        console.log('onchchange',item, classname,e);
        debugger
        const t = document.querySelector(`#${classname}`)
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
        console.log('extracted selected invoices...',invoices)
        return invoices
    }

    fetchMainData() {
        console.log('fetch main');

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
        var query = "select Id, "
            + "Level, "
            + "EfileId, "
            + "AccountObj.Id, "
            + "AccountObj.Name, "
            + "AccountObj.ParentAccountId, "
            + "InvoiceObj.Id, "
            + "InvoiceObj.BillingCycleEndDate "
            + "from EFILE_MANUAL "
            + "where EfileId=" + efileId + " "
            + "and InvoiceId is not null ";

        criterias.forEach(function(criteria) {
            query = query + " and " + criteria;
        });
        query = query
            + " order by AccountObj.Id";

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
        var query = "select "
            + "Level as accountLevel, "
            + "HasChildAccounts as hasChildAccounts, "
            + "AccountHasInvoices as hasInvoices, "
            + "EfileObj.Id as efileId, "
            + "EfileObj.EfileTemplateObj.EfileTemplateName as efileName, "
            + "AccountObj.Id as accountId, "
            + "AccountObj.Name as accountName, "
            + "AccountObj.ParentAccountId as parentAccountId, "
            + "count(AccountId) as accountsCount, "
            + "count(InvoiceId) as invoicesCount "
            + "from EFILE_MANUAL "
            + "where EfileId=" + this.efileId + " "
            + "and AccountId is not null "
            + "and AccountId <> " + this.accountId + " "
            + "and (HasChildAccounts = 1 "
            + "or AccountHasInvoices = 1) "
            + "group by "
            + "Level, "
            + "HasChildAccounts, "
            + "AccountHasInvoices, "
            + "EfileObj.Id, "
            + "EfileObj.EfileTemplateObj.EfileTemplateName, "
            + "AccountObj.Id, "
            + "AccountObj.Name, "
            + "AccountObj.ParentAccountId "
            + "order by "
            + "Level, "
            + "AccountObj.Id";

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
        console.log('make tree items',items);
        const accounts = items[0].map(account=> {
            account.children = [];
            return account;
        }), invoices = items[1];
        return new Promise((resolve, reject)=> {
            console.log(accounts, invoices);
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
            console.log(result.map(item=>({
                name: item.accountName,
                accountId: item.accountId,
                children: item.children
            })));
            resolve(result);
        });
    }

    fetchMainData() {
        console.log('fetch tree');
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
