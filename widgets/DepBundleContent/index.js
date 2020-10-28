BPSystem.initiate();

const bundleId = BPSystem.nodeKey;
const SuccessIcon = (<div title="Success" className="success-icon-circle"><i className="fa fa-check"/></div>);
const FailIcon = (<div title="Failed" className="fail-icon-circle"><i className="fa fa-times"/></div>);
const PendingIcon = (<div title="Pending..." className="default-icon-transparent"><i className="fa fa-lg fa-clock-o"/></div>);
const DownloadIcon = (<div title="Download file" className="default-icon-transparent"><i className="fa fa-lg fa-download"/></div> );
const PreviewIcon = (<div title="Preview file" className="default-icon-transparent"><i className="fa fa-lg fa-eye"/></div> );
const LockIcon = (<div title="This is a system record and may not be included into a bundle, please select another record." className="default-icon-transparent"><i className="fa fa-lg fa-lock"/></div>);
window.errorsAddContent = new BPUI.ReferenceObject();
const toolBarHeight = 40;//px
const ENTITY_NAME = 'BUNDLE_CONTENT';
const REST_METHOD = 'LogFile';

const columns = [
    {name:'Id',label:'Id'},
    {name:'EntityName',label:'Component Name'},
    {name:'ExtEntityFieldValue',label:'Record'},
    {name:'Created',label:'Created'}, 
    {name:'added_by',label:'Added by'},
    {name:'Status',label:'Status'},
    {name:'log_file_iconed',label:'Log file'},
];  
 
const clickDisabledFastFix = e => {
    let trArr = e.target.parentNode.parentNode.parentNode.parentNode.querySelectorAll('tbody tr');
    for (let tr of trArr){
        let wasDisabled = false;
    try{ 
        wasDisabled = tr.childNodes[2].childNodes[0].classList.contains('disabled');
    }catch(e){ }
        if (wasDisabled){
            tr.childNodes[0].childNodes[0].checked = false;
        }
    } 
};

const getDependenciesByEntity_ = async(entityId)=>{
    try{
        return await BPConnection.BundleContent.queryAsync(`
        SELECT level as level_,
        c.entity_id,
        e.entity_name,
        e.entity_label, 
        (SELECT f.fieldname FROM entity_field f WHERE f.id = c.parentlookupentityfieldid) AS lookup_field_name,
        (SELECT f.fieldname FROM entity_field f WHERE f.id = c.externalentityfieldid) AS external_field_name, 
        CONCAT('!', CONCAT(INITCAP(entity_name), 'Obj')) AS rel_entity_name
        FROM bundle_configuration c, entity e
        WHERE c.entity_id = e.entity_id
            AND c.configuration_type = 'ENTITY_DEPENDENCE'
        CONNECT BY PRIOR cd_configuration_id = cd_configuration_parent_id
        START WITH c.entity_id = ${entityId}
        UNION
        SELECT level as level_,
                e.entity_id,
                e.entity_name,
                e.entity_label, 
                '' AS lookup_field_name,
                (SELECT f.field_name
                FROM entity_field f
                WHERE f.entity_id = e.entity_id
                    AND f.status = 'ACTIVE'
                    AND f.external_key_flag = 1
                    AND rownum = 1) AS external_field_name, 
                CONCAT('!', CONCAT(INITCAP(e.entity_name), 'Obj')) AS rel_entity_name
        FROM entity e
        WHERE e.system_flag = 0
        CONNECT BY PRIOR e.entity_id = e.parent_entity_id
        START WITH e.entity_id = ${entityId}
        ORDER BY 3
        `).collection();
    }catch(e){
        return null
    }
}

 

const exportFromBase64File = async(bundleId,fileName) => {
    if (!fileName || !bundleId) return;
    const fileDownloadResult = await fetch(`${BPSystem.bpRestApiUrl}/files/${ENTITY_NAME}/${bundleId}/${REST_METHOD}`, {headers:{sessionid:BPSystem.sessionId}});
    if(fileDownloadResult){
        //get data
        const fileDownloadData = await fileDownloadResult.json();
        const {Data:fileContent} =  fileDownloadData.fileDownloadResponse[0];
        const {FileName:fileName} =  fileDownloadData.fileDownloadResponse[0];
        //prepare & save data
        const blob = new Blob([window.atob(fileContent)]);
        let link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click(); 
    }
}

const HeaderDataWrapper = React.createClass({
    getInitialState(){return{
        loading:true,
        loadingText:null,
        showError:false, 
        items:[],
        //search objects
        searchEntity:null,
        searchFields:[],
        searchExtFn:null,
        searchLookN:null,
        searchWaiting:false,
        searchText:'',
        searchResults:[],
        readOnly:true,
        entitiesList:[],
        selectedEntities:[],
        selectedObjects:[],
        dlgShow:false,        
        selectedEntityId:-1,
        selectedEntityName:'',
        pagination:{
                total:0,
                current:1,
                elementsPerPage:10,
                offset:0,
                onChangePageData:this.onChangePageData
        },
        //public methods
        showDialog:this.showDialogAdd,
        hideDialog:this.hideDialogAdd,
        selectEntityId:this.selectEntityId,
        onSelectEntities:this.onSelectEntities,
        onSelectAllEntities:this.onSelectAllEntities,
        onGetSelectedItems:this.onGetSelectedItems,
        onDelete:this.onDelete,  
        onSubmit:this.onSubmit,
    }},
    showDialogAdd(){ 
        this.setState({dlgShow:true})
        window.BPActions.clearError('errorsAddContent');
    },
    hideDialogAdd(){
        this.setState({
            selectedEntityId:-1,
            searchText:'',
            selectedObjects:[],
            dlgShow:false,
            loadingText:null
        });
    },
    async onChangePageData({offset,elementsPerPage,currentPage}){
         await this.setState({
             ...this.state,
             pagination:{
                 ...this.state.pagination,
                        current:currentPage,
                        elementsPerPage:elementsPerPage,
                        offset
             }
         })
         this.getData(); 
    },
    async getUserPermissions(){
        try{
        const res = await BPConnection.Bundle.queryAsync(`
        SELECT 
            dr.ReadPrivilege,dr.UpdatePrivilege,dr.CreatePrivilege,
            (SELECT CASE b.STATUS WHEN 'IN PROGRESS' THEN 1 ELSE 0 END as field FROM BUNDLE b where b.Id=${bundleId}) AS EnableEdit   
            FROM USER u ,ENTITY_DOMAIN_ROLE dr , ENTITY e 
        WHERE u.Id = MyServicePointId
            AND u.RoleId = dr.RoleId 
            AND dr.EntityId = e.Id
            AND e.EntityName = 'BUNDLE'`).single()

        const {UpdatePrivilege,EnableEdit} = res;
        const readOnly = EnableEdit==1? (UpdatePrivilege==1?false:true):true;
        this.setState({readOnly});
        }catch(e){
            //
        }
    },
    async getAllIdData(){ // far faster deleting all data in by paging grid
        try{
        const res = await BPConnection.BundleContent.queryAsync(`
            SELECT b.Id 
            FROM bundle_content b 
            WHERE b.CD_BUNDLE_ID=${bundleId}`).collection();
            if(res){
                this.setState({ 
                    itemsIds:res.elements,
                    pagination:{
                        ...this.state.pagination,
                            total: res.elements.length
                    }
                })
            }
        }catch(e){

        }
    },
    async getData(){
        try {
            const {offset,elementsPerPage} = this.state.pagination;
            const res = await BPConnection.BundleContent.queryAsync(`
                SELECT 
                    b.CD_BUNDLE_CONTENT_ID as Id,
                    b.ENTITY_NAME as EntityName,
                    b.EXTERNAL_ENTITY_FIELD_VALUE as ExtEntityFieldValue,
                    (select u.First_Name||' '||u.Last_Name from user u where u.Id=b.CreatedUserId) as added_by,
                    b.CREATED as Created,
                    b.CONTENT_STATUS as ContentStatus,
                    b.LOG_FILE as LogFile 
                FROM bundle_content b 
                WHERE b.CD_BUNDLE_ID=${bundleId} 
                ORDER BY b.Id 
                OFFSET ${offset}
                ROWS FETCH NEXT ${elementsPerPage} ROWS ONLY
                `).collection();
            if (res && res.elements){
                this.setState({showError:false })
                let Status = '';
                const itemsWithIcons = res.elements.map(el=>{ 
                    switch(String(el.ContentStatus).toUpperCase()){
                        case 'PROCESSED': Status=<div>{SuccessIcon}</div> ; break;
                        case 'FAILURE': Status =<div>{FailIcon}</div>; break;
                        case 'PENDING': Status = PendingIcon; break;
                        default: Status = el.ContentStatus;
                    }
                const log_file_iconed = (<div style={{whiteSpace:'no-wrap'}} className={el.Id && el.LogFile? '':'disabled'} onClick={()=>exportFromBase64File(el.Id,el.LogFile)}>{DownloadIcon}{/*PreviewIcon*/}</div>)

                    return {...el,Status,log_file_iconed} 
                }) 
                this.setState({items:itemsWithIcons})
            }else{
                this.setState({showError:true})    
            }
        }catch(e){
            console.error(e);
            this.setState({showError:true })
        }
    },
    async getEntitiesList(){
        try{
        const res = await BPConnection.BundleContent.queryAsync(`
                        SELECT c.entity_id as Id,
                            e.entity_name as EntityName,
                            e.entity_label as EntityLabel
                        FROM bundle_configuration c, entity e
                        WHERE c.entity_id = e.entity_id
                        AND c.configuration_type = 'ENTITY_DEPENDENCE'
                        AND c.cd_configuration_parent_id is null
                        AND e.is_application_deployable = 1
                        AND e.system_flag = 1
                        UNION ALL
                        SELECT e.entity_id as Id,
                            e.entity_name as EntityName,
                            e.entity_label as EntityLabel
                        FROM entity e
                        WHERE e.is_application_deployable = 1
                        AND e.system_flag = 0
                        AND e.parent_entity_id is null
        `).collection();
        if (res && res.elements){
            this.setState({
                entitiesList:res.elements
            })
        }else{
            this.setState({showError:true })
        }}catch(e){
            console.error(e);
            this.setState({showError:true }) 
        }
    },
    async selectEntityId(selectedEntityId){
        const {entitiesList} = this.state;
        const index = entitiesList.findIndex(el=>el.Id==selectedEntityId);
        const selectedEntityName = entitiesList[index].EntityName;
        this.setState({  // to render <select> without delay
            selectedEntityId,
            selectedEntityName,
            selectedObjects:[],
            searchWaiting:false,
            searchText:'',
            searchResults:[],
        });
 
    }, 
    onGetSelectedItems(itemsSrc,checked){
        const {selectedObjects} = this.state; 
        const destArr = checked? [].concat(itemsSrc,selectedObjects).filter((item, index, self) =>
            index === self.findIndex((t) => (
            t.ExtEntityFieldName === item.ExtEntityFieldName && 
            t.ExtEntityFieldValue === item.ExtEntityFieldValue && 
            t.EntityName === item.EntityName 
            ))):
            selectedObjects.filter(function(item){
                return !itemsSrc.find(function(t) {
                  return  t.ExtEntityFieldName === item.ExtEntityFieldName && 
                  t.ExtEntityFieldValue === item.ExtEntityFieldValue && 
                  t.EntityName === item.EntityName 
                })
            })

            this.setState({selectedObjects:destArr.map(el=>{el.BundleId=bundleId; return el;})});
    },
    onSelectEntities(items, e, level){
        const checked = e.target.checked;
        const selectedEntities = checked?
            Array.from(new Set([items.Id,...this.state.selectedEntities]))//add to collection
            :
            this.state.selectedEntities.filter(el=>el!==items.Id) //remove from collection
        this.setState({selectedEntities});
    },
    onSelectAllEntities(checked){
        this.setState({selectedEntities: checked? this.state.itemsIds:[]});
    },
    async onSubmit(){
        const {selectedObjects} = this.state;
        if (selectedObjects.length>0){
            this.setState({
                loadingText:<div className="waiter fa-2x fa fa-circle-o-notch "/>
            })
            try{ 
                const res = await BPConnection.BundleContent.create(selectedObjects);
                if(res){
                    let errorCode = res || [];
                    errorCode = errorCode[0] || {};
                    errorCode = errorCode.ErrorCode;
                    if (errorCode == 0) { } else { 
                        window.BPActions.handleError(res, errorsAddContent);
                    }
                }else{

                }
            }catch(e){
                window.BPActions.handleError(e, errorsAddContent);
                console.log('Error while processing data...',e);
            }finally{
                this.hideDialogAdd();
                this.getData();
            } 
        }
        
    },
    async onDelete(){
        const {selectedEntities} = this.state;
        const delItem = async(delItem)=>{
            return await BPConnection.BundleContent.delete({
                Id:delItem,
                EmptyRecycleBin:1
            }) 
        }
        if (selectedEntities.length>0){
            if (window.confirm('Are you sure want to delete this objects from bundle content?')){
                this.setState({
                    loadingText:<div className="waiter fa fa-2x fa-circle-o-notch "/>
                })
                try{ 
                    const res = await Promise.all(selectedEntities.map(el=>delItem(el)));   
                }catch(e){

                }finally{
                    await this.setState({
                        items:[],
                        selectedEntities:[],
                        loadingText:null
                    })
                    this.getData();
                }
            }
        }
    },
    refreshData() { 
        let that  = this;
        setTimeout(function run(){
            console.log('Bundle content data refresh...')
            that.getUserPermissions();
            that.getAllIdData();
            that.getData();
            setTimeout(run,3000)
        },3000)
    },
    
    componentDidMount(){
        this.getUserPermissions();
        this.getAllIdData();
        this.getData();
        this.getEntitiesList();
        this.refreshData();
    }, 
    render(){
        const { render } = this.props;  
        return (
            <React.Fragment> 
                   { render(this.state) }     
            </React.Fragment>
        )
    }
}); 


const EntityListTree = React.createClass({
    getDefaultProps() {
        return {
            entityName: 'ACCOUNT',
            layoutName: 'DEFAULT',
            useSearch: true,
            baseField:'node_key',
            expandable:false,
            searchMountTo:null,
            showCheckboxes:true, 
            showPageNavigation: true,
            defaultElementsPerPage: 10,
            defaultListFields: [],
            additionalListFields: [],
            externalFilters: [],
            middleWare: {},
            onUpdate: () => { },
            onFieldsLoad: () => {},
            onDataLoad: () => {},
            gridSettings: {}
        }
    },
    getInitialState() {
        this.haveSystemFlagEntites  = ['ENTITY','ENTITY_FIELD','WORKFLOW_ACTION','WORKFLOW_RULE','PAGE_WIDGET','EXTENSION_WIDGET'];
        return {
            fields: [],
            data: [],
            dataGridRef: new Date().getTime(),
            searchFields: [],
            selectedObjects:[],
            searchValues: {}, 
            pageNavigation: {totalCount: 0, offset: 0, elementsPerPage: this.props.defaultElementsPerPage},
            quickSearchValue: '', quickSearchResult: [], quickSearchIsWaiting: false,
            isLoading: false,
            pageComponentPrefixName: String(new Date().getTime())
        }
    },
    componentDidMount(){
      //  document.querySelector('.fix-check .bpui-check.check-all').addEventListener('change',clickDisabledFastFix);
    },
    componentWillUnmount() {
     //   document.querySelector('.fix-check .bpui-check.check-all').removeEventListener('change',clickDisabledFastFix); 
    },
    componentWillMount(){
        const { layoutName, additionalListFields, externalFilters,
            defaultListFields, middleWare,
            level_,depEntitiesObject
        } = this.props;  

        const currEntity = depEntitiesObject.filter(el=>el.level_==level_)[0];
        const {entity_name:entityName,external_field_name,rel_entity_name:rel_entity_name_current} = currEntity;
 
        //add additional fields
        const addF = this.haveSystemFlagEntites.includes(entityName)? [{ name: 'SystemFlag__', label: ' ', query: `{${rel_entity_name_current}.SystemFlag}`, hidden: false }]:[]
        const extFn = rel_entity_name_current && external_field_name? [{ name: 'ExtFn__', label: ' ', query: `{${rel_entity_name_current}.${external_field_name}}`, hidden: true }]:[]
        //add external filters
        let extF = []; 

       switch(entityName){
           case 'CURRENCY': extF = ['{!CurrencyObj.Id} = {!CurrencyObj.Id}']; break; //hack to see all id's only for this entity
       //    case 'ENTITY': extF = ['{!EntityObj.IsApplicationDeployable}=1']; break;
        //   case 'ENTITY_FIELD': extF = ['{!Entity_FieldObj.SystemFlag}!=1'];break;
       }
        const params = {
            entityName, layoutName, additionalListFields:[].concat(additionalListFields,addF,extFn), externalFilters:[].concat(externalFilters,extF),
            defaultListFields, middleWare
        };
        const handlers = {
            data: this.setData.bind(this),
            fields: this.setFields.bind(this),
            pagination: this.setPageNavigation.bind(this),
            loading:this.onChangeLoading.bind(this)
        }
 
        this.controller = new BPUI.Tools.LayoutController(params, handlers)
        window.layoutController = this.controller
        this._setQuickSearchResults = this.setQuickSearchResults.bind(this)
        this.controller.quickSearch.ee.addHandler('update', this._setQuickSearchResults)

       this.setState({  waiting:false }) 
    },
    setData() {
        this.props.onDataLoad(this.controller.data, this.controller)
        this.setState({data: this.controller.data})
    },
    setFields(){
        const controller = this.controller
        const listFields = controller.listLayout.getFieldsForList()
        const searchFields = controller.searchLayout.getFieldsForEntityFilter()
        
        this.props.onFieldsLoad(listFields, controller)
        this.setState({fields: listFields, searchFields})
    },
    setPageNavigation(){
        this.setState({pageNavigation: this.controller.pagination})
    },
    setQuickSearchResults(){
        this.setState({quickSearchResult: this.controller.quickSearch.results, quickSearchIsWaiting: false})
    },
    onSearch(values){
        console.log('on search',values);
        this.controller.setFilters(values)
    },
    onQuickSearchChange(quickSearchValue) {
        this.controller.quickSearch.onChangeValue(quickSearchValue)
        this.setState({quickSearchValue, quickSearchIsWaiting: true})
    },
    onClickQuickSearchItem(_, item){
        const {value:quickSearchValue, id:selectedItemId} = item /*item.name ||  || item.label1*/ //check this maybe change to name | value
        this.controller.quickSearch.onChangeValue(quickSearchValue)
        this.controller.loadData()
        this.setState({quickSearchValue})
    },
    onChangeLoading(isLoading){
        this.setState({isLoading})
    },
    onCheckboxChangeWithCheck(items,checked,isAllCheckbox){
        const {depEntitiesObject,level_,onCheckboxChange,baseField}  = this.props;
        const currEntity = depEntitiesObject.filter(el=>el.level_==level_)[0];
        if (this.haveSystemFlagEntites.includes(currEntity.entity_name)){ 
            const items_ = Array.isArray(items)?items:[items];
            let items_tmp = [];
            for(let item of items_){ 
                if (item.SystemFlag__t==1 || item.SystemFlag__==1){
                    if(isAllCheckbox){
                        const itemId = item[baseField];
                        document.querySelector(`tr[data-key="data-grid-raw-${itemId}"]`).childNodes[0].childNodes[0].checked = false;
                    }else{
                        item[Object.getOwnPropertySymbols(item)[1]] = false;
                        item[Object.getOwnPropertySymbols(item)[0]].checked = false; 
                    } 
                    onCheckboxChange(item,false);
                    
                }else{ 
                    items_tmp.push(item); 
                }
            }
            onCheckboxChange(items_tmp,checked)
        }else{
             onCheckboxChange(items,checked)
        } 
    },
    onGetExpanded(item){ 
        const {level_,depEntitiesObject,baseField}=this.props;
        const value = item[baseField]; //id 
        const childEntities = depEntitiesObject.filter(el=>el.level_==level_+1);
        if (childEntities && childEntities.length>0){
            return(<BPUI.DataGrid 
                id={'grid-'+this.state.dataGridRef}
                expandable={true} 
                data={childEntities}
                baseField={'entity_id'} 
                fields={[
                    {name:'entity_id',label:'ID'},
                    {name:'entity_label',label:'Component Name'}
                ]}
                getExpanded={(component)=>this.onGetExpandedComponent(component,value)}
            />)
        }else{
            return null;
        } 
    },
    onGetExpandedComponent(item,value){ 
        const {lookup_field_name:filterField,rel_entity_name,entity_id} = item;
        const externalFilters = [(value && filterField && rel_entity_name)? `{${rel_entity_name}.${filterField}}=${value}`:``];
        console.log('component',this.props,this.state)
        return ( <EntityWrapper 
            name={`name-component-${entity_id}`}
            useSearch={false}
            externalFilters={externalFilters}
            onGetSelectedItems={(items,checked)=>this.props.onGetSelectedItems(items,checked)} 
            entityId={entity_id}
        />)
    },
    render() {
        const {showPageNavigation, gridSettings, useSearch, title,name,baseField,showCheckboxes} = this.props
        const {
            data, fields, pageNavigation: {totalCount}, searchFields, showSearch,
            quickSearchValue, quickSearchResult, quickSearchIsWaiting, isLoading,
            pageComponentPrefixName
        } = this.state;
  
        const quickSearchResults = quickSearchResult.map(el=>{ 
            el.value=el.name;   
            const labels = Array.isArray(el.label)? el.label.filter(el=>!!el) : []; 
            el.name = labels.length>0?labels.join('    '):el.value;  
            return el
        } )

        let search = ''
        if (useSearch) {
            let quickSearch = (<BPUI.Search
                                    placeholderText={'Search records...'} isWaiting={quickSearchIsWaiting}
                                    value={quickSearchValue} onClickSearch={() => this.controller.loadData()}
                                    results={quickSearchResults} onResultItemClick={this.onClickQuickSearchItem}
                                    onChange={this.onQuickSearchChange} />)
            if (title) {
                quickSearch = <BPUI.Divider className="list-form-header">
                    <div className="form-header-title">{title} </div>
                    <div className="form-header-search">{quickSearch}</div>
                </BPUI.Divider>
            }

            search = (
                <div>
                    {quickSearch}
                    {showSearch && <BPUI.EntityFilter  fields={searchFields} onClickSearch={this.onSearch}/>}
                </div>
            )
        } 

        let isTree__ = false;
        let treeData__ = [];
        const {level_:currentLevel} = this.props;
        //draw tree-view only for rate-classes 
        if (data && data.length>0 && data[0].id__parent && this.props.depEntitiesObject.filter(el=>el.level_==currentLevel)[0].entity_name === 'RATE_CLASS_PRODUCT'){
            function list_to_tree(list) {
                let map = {}, node, roots = [], i;
                for (i = 0; i < list.length; i += 1) {
                    map[list[i].node_key] = i; // initialize the map
                    list[i].children = []; // initialize the children
                }
                for (i = 0; i < list.length; i += 1) {
                    node = list[i];
                    if (node.id__parent !== "0") { 
                        list[map[node.id__parent]].children.push(node);
                    } else {
                        roots.push(node);
                    }
                }
                return roots;
            } 
           console.log('have tree here...');
           treeData__ = list_to_tree(data);
           isTree__ = true;
        } 
        const data_ = data.map(el=>{ 
            const {baseField,level_,depEntitiesObject} = this.props;
            const currEntity = depEntitiesObject.filter(el=>el.level_==level_)[0];
            const {entity_name,rel_entity_name} = currEntity;
            const el_ = {...el};
            el_.SystemFlag__t = el.SystemFlag__;
            if (this.haveSystemFlagEntites.includes(entity_name)){
                if (el_.SystemFlag__==1){ 
                    Object.keys(el_).filter(el=>el!=baseField && el!=rel_entity_name && el!='SystemFlag__t').map(value=>{el_[value]=<span className='disabled'>{el_[value]}</span>});  
                    el_.SystemFlag__=(<React.Fragment>{LockIcon}</React.Fragment>);
                }
                else{
                    el_.SystemFlag__=''
                };  
            } 
            return el_
        })  
        
        if (!(data_ && data_.length>0)){
            return null;
        }       

        //if (currentLevel is last) - don't show plus icons expandable = false
 
        return (
            <div className="bpui-entity-list-form fix-check">
              {this.props.searchMountTo? ReactDOM.createPortal(search, document.getElementById(this.props.searchMountTo)):search}
                <BPUI.DataGrid 
                    baseField={baseField} 
                    id={'grid-'+this.state.dataGridRef}
                    data={isTree__? treeData__:data_}  
                    getExpanded={(entity)=>this.onGetExpanded(entity)} 
                    onCheckAll = {(checked)=>this.onCheckboxChangeWithCheck(data,checked,true)}
                    onCheckboxChange={(item,e,level)=>this.onCheckboxChangeWithCheck(item,e.target.checked)}
                    expandable={!isTree__} 
                    tree={isTree__}
                    fields={fields}  
                    showCheckboxes={showCheckboxes}
                    gridSettings={gridSettings}
                />
                {showPageNavigation &&
                <BPUI.PageNavigation 
                    name={`${name}-${pageComponentPrefixName}`} 
                    totalElements={totalCount}
                    onChangePage={this.controller.setPage.bind(this.controller)}
                />}
                {isLoading && <BPUI.Preloader/>}
            </div>
        )
    }
});


const EntityWrapper = React.createClass({
    getInitialState(){
        return {
            entityName:null,
            childEntityId:null,
            noData:false,
            waiting:true,
            selectedObjects:[],
            depEntitiesObject:null
        }
    },
    getDefaultProps(){
        return{
            externalFilters:[],
            useSearch:true,
            level_:0,
            depEntitiesObject:null
        }
    },
    async prepareData(){
        this.setState({ waiting:true }) 
        const {entityId,level_,depEntitiesObject}  = this.props;
        if (!entityId)  {
            this.setState({noData:true,waiting:false })
            return;
        }
        try{
            let depEntitiesObject_;
            if (depEntitiesObject){
                depEntitiesObject_ = depEntitiesObject;
            }else{
                depEntitiesObject_ = await getDependenciesByEntity_(entityId)
            } 
            this.setState({
                level_:level_+1,
                depEntitiesObject:depEntitiesObject_.elements,
            })
        }catch(e){
            
        }finally{
            this.setState({ waiting:false }) 
            
        }
      },
    async componentDidMount(){
        this.prepareData();
    },
    componentDidUpdate(prevProps) {
        if(prevProps.entityId !== this.props.entityId) {
          this.setState({entityId: this.props.entityId});
          this.prepareData()
        }
    },
    onCheckboxChange(items,checked){
        const {level_,depEntitiesObject} = this.state;
        const currEntity = depEntitiesObject.filter(el=>el.level_==level_)[0];
        const {entity_name,external_field_name} = currEntity;
     
        let itemsTmp = Array.isArray(items)?items:[items]
        const itemsSrc = itemsTmp.map(item=>({
            BundleId:null,
            ExtEntityFieldName:external_field_name,
            EntityName:entity_name,
            ExtEntityFieldValue:item['ExtFn__']
        }))

        const {selectedObjects} = this.state; 
        const destArr = checked? [].concat(itemsSrc,selectedObjects).filter((item, index, self) =>
            index === self.findIndex((t) => (
            t.ExtEntityFieldName === item.ExtEntityFieldName && 
            t.ExtEntityFieldValue === item.ExtEntityFieldValue && 
            t.EntityName === item.EntityName 
            ))):
            selectedObjects.filter(function(item){
                return !itemsSrc.find(function(t) {
                  return  t.ExtEntityFieldName === item.ExtEntityFieldName && 
                  t.ExtEntityFieldValue === item.ExtEntityFieldValue && 
                  t.EntityName === item.EntityName 
                })
            })
            
        this.props.onGetSelectedItems(itemsSrc,checked)
        this.setState({selectedObjects:destArr});
    },
    render(){
        const {noData,waiting,
                level_,depEntitiesObject
        } = this.state;
        let {useSearch,searchMountTo} = this.props;   
        return(
            <div className="flex-grow-1" style={{width: `calc(100% - ${searchMountTo?'220':'1'}px)`}}>
                {searchMountTo && // just check top level
                <BPUI.NavToolBar>
                    <BPUI.Line  className="iconed arrow-down">
                        Select records to include in the Bundle and click [Submit] button.
                    </BPUI.Line>
                 </BPUI.NavToolBar>
                }
                 <div style={{maxWidth: '100%',maxHeight: `calc(100% - ${toolBarHeight}px)`,overflow: 'scroll'}}>
                {waiting && searchMountTo?ReactDOM.createPortal(<div className='disabled'><BPUI.Search placeholderText={'Search records...'} isWaiting={waiting}/></div>, document.getElementById(searchMountTo)):null}
                {waiting?<BPUI.Preloader/>:
                noData?<div><i>[No child records for this component]</i></div>:(
                (<div>
                    <EntityListTree 
                    name={this.props.name}
                    useSearch={useSearch} 
                    externalFilters={this.props.externalFilters}
                    depEntitiesObject={depEntitiesObject}
                    level_={level_}
                    searchMountTo = {searchMountTo} 
                    onGetSelectedItems={(items,checked)=>this.props.onGetSelectedItems(items,checked)}
                    onCheckboxChange={(item,checked,level)=>this.onCheckboxChange(item,checked,level)}
                />
                </div> ))
                }
                </div>
            </div>
        )
    }
}) 

 