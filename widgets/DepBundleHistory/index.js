BPSystem.initiate();
 
const bundleId = BPSystem.nodeKey;

const SuccessIcon = (<div title="Processed" className="success-icon-circle"><i className="fa fa-check"/></div>);
const FailIcon = (<div title="Failed" className="fail-icon-circle"><i className="fa fa-times"/></div>);
const PendingIcon = (<div title="Pending..." className="default-icon-transparent"><i className="fa fa-lg fa-clock-o"/></div>);
const DownloadIcon = (<div title="Download file" className="default-icon-transparent"><i className="fa fa-lg fa-download"/></div> );
const PreviewIcon = (<div title="Preview file" className="default-icon-transparent"><i className="fa fa-lg fa-eye"/></div> );

const ENTITY_NAME = 'BUNDLE_LOG';
const REST_METHOD = 'OperationLogFile';

const columns = [ 
    {name:'Id',label:'Id'},
    {name:'Operation',label:'Operation'},
    {name:'UserName',label:'User Name'},
    {name:'Created',label:'Date'}, 
    {name:'Status',label:'Status'},
    {name:'log_file_iconed',label:'Log file'},
];  
    

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
        pagination:{
            total:0,
            current:1,
            elementsPerPage:10,
            offset:0,
            onChangePageData:this.onChangePageData
        },
    }},
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
    async getData(){
        try {
            const {offset,elementsPerPage} = this.state.pagination;
            const res = await BPConnection.BundleLog.queryAsync(`
            select  {!Bundle_LogObj.Created} as Created, 
            {!Bundle_LogObj.Id} as Id,
            {!Bundle_LogObj.Operation} as Operation, 
            {!Bundle_LogObj.OperationStatus} as Status, 
            {!Bundle_LogObj.OperationLogFile} as OperationLogFile, 
            CONCAT( CONCAT( {!Bundle_LogObj.CreatedUserIdObj.First_Name}, ' ' ), 
            {!Bundle_LogObj.CreatedUserIdObj.Last_Name} ) as UserName 
            where {!Bundle_LogObj.BundleId}=${bundleId} 
            ORDER BY {!Bundle_LogObj.Created} desc
            OFFSET ${offset}
            ROWS FETCH NEXT ${elementsPerPage} ROWS ONLY
            `).collection();
            if (res && res.elements){
                this.setState({showError:false })
                let Status = '';
                const itemsWithIcons = res.elements.map(el=>{ 
                    switch(String(el.Status).toUpperCase()){
                        case 'PROCESSED': Status=<div>{SuccessIcon}</div> ; break;
                        case 'FAILURE': Status =<div>{FailIcon}</div>; break;
                        case 'PENDING': Status = PendingIcon; break;
                        default: Status = el.Status;
                    }
                const log_file_iconed = (<div style={{whiteSpace:'no-wrap'}} className={el.OperationLogFile? '':'disabled'} onClick={()=>exportFromBase64File(el.Id,el.OperationLogFile)}>{DownloadIcon}{/*PreviewIcon*/}</div>)

                    return {...el,Status,log_file_iconed} 
                }) 
                this.setState({items:itemsWithIcons})
            }else{
                this.setState({showError:true})    
            }
        }catch(e){
            console.error(e);
            this.setState({showError:true })
        }finally{
            return true;
        }
    }, 
    refreshData() { 
        let that  = this;
        setTimeout(function run(){
            console.log('Bundle history refresh Data...')
            that.getData();
            setTimeout(run,3000)
        },3000)
    },  
    componentDidMount(){
         this.getData();
         this.refreshData()
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






  





 