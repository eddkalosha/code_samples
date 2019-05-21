/**to do : 

inprove renders (shouldComponentUpdate)
editable field 'offset'
paging tables

wiget presents next structure:

    <NettingContainer>
        <NavToolBar>
        <Netting>
            ...
            <NettingDetailsTable_>
            <NettingDetailsTable_>
        </Netting>
    </NettingContainer>
*/

BPSystem.initialize();
const ver = React.version;
const {userName,nodeId} =BPSystem;
const userData = {id:nodeId,name:userName};
const nettingGroup = "SAM123"; 
let NETTING = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.Netting));
let CURRENT_DATE =  new BPUI.ReferenceObject();
let TABLE_PAGE_COUNT = 10;

const queryMain = (account={
    					acountType:'BUYER',
    					accountID:-1,
    					nettingGroup:'SAM123'},
                   offsetRows=0, 
                   countRows=TABLE_PAGE_COUNT) =>
    ("SELECT  "+
    "i1.DueDate as NetDate, "+
    "a1.id AS AccountId, "+
    "a1.AccountNumber AS Account, "+
    "a1.Name AS AccountName, "+
    "i1.id AS InvoiceID, "+
    "i1.status AS Status, "+
    "-i1.GrandTotalAmount AS InvoiceCharges, "+
    "i1.PaymentAmount AS Payments,  "+
    "i1.CreditAmount AS Adjustments, "+
    "(-i1.GrandTotalAmount-i1.CreditAmount+i1.PaymentAmount) AS OutstandingAmount, "+
    "n1.netting_statement AS Statement, "+
    "a1.nettinggroup, "+
    "(bp1.PaymentTermDays || ' days') as  PaymentTermDays "+   
    "FROM invoice i1 "+
    "JOIN billing_profile bp1 ON i1.billingprofileid = bp1.id "+
    "JOIN account a1 ON bp1.accountid = a1.id "+
    "LEFT JOIN netting n1 ON i1.netted_id = n1.id "+
    "WHERE 1=1 "+
   // "AND a1.nettinggroup = '"+account.nettingGroup+"' "+
    "AND a1.AccountType = '"+account.acountType+"' "+
   // "AND i1.status = 'CLOSED' "+
    "ORDER BY i1.id ASC OFFSET "+(+offsetRows*+countRows)+" ROWS FETCH NEXT "+countRows+" ROWS ONLY");

const queryMainRowCount = (account={
    					acountType:'BUYER',
    					accountID:-1,
    					nettingGroup:'SAM123'}) =>
   ("SELECT COUNT(i1.id) as rowCount "+
    "FROM invoice i1 "+
    "JOIN billing_profile bp1 ON i1.billingprofileid = bp1.id "+
    "JOIN account a1 ON bp1.accountid = a1.id "+
    "LEFT JOIN netting n1 ON i1.netted_id = n1.id "+
    "WHERE 1=1 "+
  //  "AND a1.nettinggroup = '"+account.nettingGroup+"' "+
    "AND a1.AccountType = '"+account.acountType+"' "/*+
    "AND i1.status = 'CLOSED' "*/
   );

const queryNettGroups = (accountID = -1) =>( 
"SELECT distinct(NettingGroup) from Account where Account.ParentAccountId= "+accountID+""
);


const columns__ = [	
{field:'InvoiceID', label:'Invoice ID'},	
{field:'NetDate', label:'Net Date', width:'100'},	
{field:'AccountId', label:'Account Id', width:'100'},	
{field:'Account', label:'Account Number', width:'100'},	
{field:'AccountName', label:'AccountName', width:'250'},		
{field:'Status', label:'Status', width:'100'},	
{field:'InvoiceCharges', label:'Invoice Charges', width:'100'},	
{field:'Payments', label:'Payments', width:'100'},	
{field:'Adjustments', label:'Adjustments', width:'100'},	
{field:'OutstandingAmount', label:'Outstanding Amount', width:'100'},	
{field:'Statement', label:'Statement', width:'100'},
{field:'PaymentTermDays',label:'Pay terms', width:'100'}
    
];


const utils = {
    replaceIfNegativeNumber:num=>/^-[0-9]\d*(\.\d+)?$/.test(+num)? '('+(num*-1)+')':num,
    formatDate:dateString=>{
    	try{ 
            const date_ = new Date(Date.parse(dateString)); 
            return ('0' + date_.getDate()).slice(-2) + '/'
             + ('0' + (date_.getMonth()+1)).slice(-2) + '/'
             + date_.getFullYear()
    }catch(e){ console.error('Error date parsing :',e); return dateString}}
};

const NavToolBar = React.createClass({
  shouldComponentUpdate(){ return false},
  render() {
    const {onPrevStep} = this.props;
    return (<div className="container">
    		<BPUI.NavToolBar>
    				 <div align="left" className="returnToList pr-4">
                                <a 
                                onClick={()=>onPrevStep()}	
                                className="return-btn"/>
                      </div>
  			</BPUI.NavToolBar>
    </div>)
  }
});


const NettingDetailsTable_ = React.createClass({
    render() { 
    console.log('[render] NettingDetailsTable_',this.props);
    const {type,data,offsets,maxPagesCount,keyFieldName,columns,onSetStep,currentPage,selectedRowIndex,formatDateColumnIndex : FDC, formatNegativeNColumnIndex : FNI} = this.props;
    const labelType = ['Buy Side','Sell Side'];
    const columnsToHTML = columns.map((column,index)=><th className="py-4" scope="col" key={index}><div style={{width:column.width? column.width+'px':'100px'}}>{column.label}</div></th>);
    const dateToHTML_ =  data.length>0? data.map((el,index)=>
       <tr onClick={()=>this.props.onSelectRow(+el[keyFieldName])} className={`${selectedRowIndex.includes(+el[keyFieldName])?'bg-success':''}`}>
          <td><input type="checkbox" readOnly checked={selectedRowIndex.includes(+el[keyFieldName])} /></td>
          {
           columns.map((column,index)=>
             <td>
               {  FDC.includes(index)? utils.formatDate(el[column.field]): FNI.includes(index)? utils.replaceIfNegativeNumber(el[column.field]):el[column.field]}
             </td>)
          }
          <td>
            {
                (()=>{
            	 const index_ = offsets.findIndex(offsetEl=>+offsetEl.invoiceId===+el[keyFieldName]); 
                 return index_>-1? offsets[index_].offset:'-'
            	})()
            }
              
          </td>
        </tr>):null   
    return(
        <div className="">
         <h4 align="center">{labelType[type] || ""}</h4>                                                                            
        <div className="table-light-border">
    	 <div className="table-responsive">
         <table className="table" >
             <thead>
               <tr>
                 <th>NET</th>
        		 {columnsToHTML}
        		 <th>Offset</th>
               </tr>
             </thead>
             <tbody>
              {dateToHTML_}  
             </tbody>
         </table>
        </div>       
        <div className="row p-2">
          <div className="col-sm-6 text-right mt-2">Page {currentPage+1} of {maxPagesCount+1 || '1'}</div>
          <div className="col-sm-6 text-right">
            <span onClick={()=>onSetStep(currentPage-1<0?0:currentPage-1)} className={`px-3 btn ${+currentPage===0?'disabled':''}`}>&#9001;</span>
            <span onClick={()=>onSetStep(currentPage+1>maxPagesCount?maxPagesCount:currentPage+1)} className={` btn  ${+currentPage===+maxPagesCount?'disabled':''}`}>&#9002;</span>
           </div> 
       </div>
         </div>
        </div> 
       )
    }            
}); 
                   
const Netting = React.createClass({
    getInitialState(){
        return({
            twoColView:true
        })
	},
    render(){
    console.log('[render] Netting');
    console.log('[NettingComponent] props',this.props);
        const {twoColView} = this.state;
        const preLoader = (<div className="spinner py-5">
              <div className="bounce1"></div>
              <div className="bounce2"></div>
      		  <div className="bounce2"></div>
            </div>);
        const haveNoData = (<div className="row text-center py-5 my-5 alert-warning">
               <div>HAVEN'T DATA FOR NETTING</div>
               <small>Check input parameters and try again</small>            
            </div>);
           
        const {userData,currencySymbol,padgingTables,step,isWaiting,noData} = this.props;
        const {detailedData,offsets,totals,selectedRowIndexBuy,selectedRowIndexSell} = this.props.data;
        const totalsToHTML = Object.values(totals).map(el=><div className="row pt-4"><div className="col-sm-3 text-right">{el.title}</div><div className="col-sm-2 text-right">{currencySymbol}{utils.replaceIfNegativeNumber(el.value)}</div></div>)
		return(<div className="pt-3">
     		<div className="container-fluid">  
            <div className="row">
            	<div className="col-sm-3 pt-2"><img alt="" src="images/required.png"/>Net As Of Date</div><div className="col-sm-3">
              		<BPUI.InputField key="1112" className="dateselector" variable={CURRENT_DATE} placeholder="Click for select..." layout="plain" type="DATE_SELECTOR" onUpdate={(date,val2,val3)=>{this.props.onDateChange(date)}}/>                                    
                </div>
            </div>
            <div className={`row pt-4 ${step<1?'disabled':''}`}>
                 <div className="col-sm-3 pt-2">
                	<img alt="" src="images/required.png"/> 
                    <span>Company</span>
                </div>
             	<div className="col-sm-3">
                    <BPUI.InputField variable={NETTING} className="input nnn"  placeholder="Click for select..."field="account_id" onUpdate={(id,type,object)=>{this.props.onChangeAccount(id)}} layout="plain" />
                </div>
            </div>
               <div className={`row pt-4 ${ (step<2) ?'disabled':''}`}>
                 <div className="col-sm-3 pt-2">
                	<img alt="" src="images/required.png"/>
                    <span>Netting Group Code</span>     
                </div>
             	<div className="col-sm-3">
                	<BPUI.InputField  type="SELECT1" style={{width:'100%'}} variable={NETTING} field="netting_group" onUpdate={(id,type,object)=>{this.props.onChangeGroup(id)}}  layout="plain" />
                </div>
            </div>
            {noData? haveNoData:  isWaiting? preLoader:
            <div>
            <div className="row ">
               <div className="divider"><div className="dividerText">Netting</div> </div> 
            </div>
            
            {totalsToHTML}
             <div className="row pt-2">
               <div className="divider"><div className="dividerText">
                <button className="">Net</button>
                 <button disabled={selectedRowIndexBuy.length===0 && selectedRowIndexSell.length===0 } className="ml-1" onClick={()=>this.props.onSelectionReset()}>Reset</button>                
                 </div> 
               </div>                    
            </div> 
             <div className="row">
              <div className="col-sm-12 formInfo text-blue">1.Select lines of Buy and Sell tables for netting calculation
                                   <br/><br/>2. Click 'Net' button for save Netting results
                                   </div>
             
                                   .
              <div className="col-sm-12 mt-3"><label className="switch"><input checked={twoColView} onChange={()=>this.setState({twoColView:!twoColView})} type="checkbox"/><span className="slider round"></span></label> </div>    
            <div className="col-sm-12" style={{opacity:0.6}}>{twoColView?'Switch to 1-column view':'Switch to 2-column view'}</div>
                <div className={`${twoColView? 'col-sm-6':'col-sm-12'} text-center`}>
                <NettingDetailsTable_ 
                   type={0}
                   maxPagesCount={padgingTables.maxBuy}
                   currentPage={padgingTables.currentBuy}
                   keyFieldName={'InvoiceID'}
                   data={detailedData.buy}
                   offsets={offsets.buy}
                   formatDateColumnIndex={[1]}
                   formatNegativeNColumnIndex={[5,6,7,8,9]}
                   columns={columns__}
                   onSelectRow={(rowIndex)=>this.props.onSelectRowBuy(rowIndex)}
                   selectedRowIndex={selectedRowIndexBuy}
                   onSetStep = {page=>this.props.onSetPageBuy(page)}
                />
               </div>
               <div className={`${twoColView? 'col-sm-6':'col-sm-12'} text-center`}>
                <NettingDetailsTable_ 
                   type={1}
                   maxPagesCount={padgingTables.maxSell}
                   currentPage={padgingTables.currentSell}
                   keyFieldName={'InvoiceID'}
                   data={detailedData.sell}
                   offsets={offsets.sell}
                   formatDateColumnIndex={[1]}
                   formatNegativeNColumnIndex={[5,6,7,8,9]}
                   columns={columns__}
                   onSelectRow={(rowIndex)=>this.props.onSelectRowSell(rowIndex)}      
                   selectedRowIndex={selectedRowIndexSell}
                   onSetStep = {page=>this.props.onSetPageSell(page)}      
                />
               </div>                          
             </div>    
               </div>
                  }          
      	</div>
    </div>)
	}
});


//data cotainer                                         
const NettingContainer = React.createClass({  
    getInitialState() {
    return {
         accountBuy:{
    		 acountType:'BUYER',
    			 accountID:-1,
    			 nettingGroup:'SAM123'}, 
           accountSell:{
    		 acountType:'SELLER',
    		 accountID:-1,
    		 nettingGroup:'SAM123'},
         netDate:-1,
         nettingAccount:-1,
         nettingGroup:-1,
    	 userData:{},
    	 isWaiting:true,
         noData:true,
         padgingTables:{
             currentBuy:0,
             currentSell:0,
             maxBuy:0,
             maxSell:0
         },
    	 detailedData:{buy:[],sell:[]},
    	 selectedRowIndexBuy:[],selectedRowIndexSell:[],
         offsets:{
             buy:[],
             sell:[],
         },
         totals:{
             buyInvoiceTotal:{title:'Buy Side Invoice Total', value:0},
             sellInvoiceTotal:{title:'Sell Side Invoice Total', value:0},
             netAmount:{title:'Net Amount', value:0},
             offsetAmount:{title:'Offset Amount', value:0},
            }
        }
    },
     shouldComponentUpdate(nextProps, nextState){
    	console.log('should update',this.state, nextState);
        if ((this.state.nettingAccount !== nextState.nettingAccount) ||
         	(this.state.nettingGroup !== nextState.nettingGroup)||
            (this.state.netDate !== nextState.netDate))
        {
        	return false
        } else
            return true
    },
    prevStep(){
        let newStep = this.state.step-1;
        this.setState({
            step:newStep<0?0:newStep
        });
    },
    onDateChange(date){
        this.setState({netDate:date},()=>this.getDataBuySell())
    },
    onAccChange(id){
        console.log('acc id changed',+id);
        this.setState({nettingAccount:id},()=>this.getDataBuySell())
    },
    onGroupChange(id){
        console.log('group changed',id)
    	this.setState({nettingGroup:id},()=>this.getDataBuySell())
    },
    async setPage(page,type){
     //type 0 - buy, 1 - sell
       console.log('set step',[page,type]);
      const {accountBuy,accountSell} = this.state;
        
      await this.setState({
          padgingTables: type===0?
          {...this.state.padgingTables,currentBuy:page}:
          {...this.state.padgingTables,currentSell:page}
         });

       const [res] = await Promise.all([
           BPConnection.BrmAggregate.queryAsync(queryMain(type===0?accountBuy:accountSell,page)).collection()
       ]);
        
       let dataRef = new BPUI.ReferenceObject(res).get().list();
        if (type===0){
            this.setState({detailedData: {...this.state.detailedData,buy:dataRef}});
        }else
        {
            this.setState({detailedData: {...this.state.detailedData,sell:dataRef}})
        }
    },
    async getDataBuySell(date=null,accountID = null, nettingGroup = null){
        this.setState({isWaiting:true, noData:false})
        try{
            const {accountBuy,accountSell,nettingAccount} = this.state;
            //can be called count queries first, then main queries 
            const [collectionBuy,collectionSell, buyCount, sellCount, accId] = await Promise.all([
                BPConnection.BrmAggregate.queryAsync(queryMain(accountBuy)).collection(),
                BPConnection.BrmAggregate.queryAsync(queryMain(accountSell)).collection(),
                BPConnection.BrmAggregate.queryAsync(queryMainRowCount(accountBuy)).single(),
                BPConnection.BrmAggregate.queryAsync(queryMainRowCount(accountSell)).single()
              ]);
           	console.error('[Container]:::COLLECTIONS:::');
            console.log(collectionBuy,collectionSell,buyCount,sellCount);
            let buyDataRef = new BPUI.ReferenceObject(collectionBuy).get().list();
            let sellDataRef = new BPUI.ReferenceObject(collectionSell).get().list(); 
            this.setState({
                detailedData :{
                    buy:buyDataRef,
                    sell:sellDataRef
                              },
                 padgingTables:{
                    currentBuy:0,
                    currentSell:0,
                    maxBuy: Math.ceil(+buyCount.rowCount/TABLE_PAGE_COUNT)-1,
                    maxSell:Math.ceil(+sellCount.rowCount/TABLE_PAGE_COUNT)-1 
                }     
             });
           }catch(e){
                this.setState({noData:true});
            	console.error(e,e.responseText);
            	return false;    
          }finally{
                this.setState({isWaiting:false})     
                }
    },
    componentDidMount(){
	  this.getDataBuySell();      
      this.setState({userData});
       console.log('[didmounted] NettingContainer');
    },
    async selectRowSell(row){            
        const {selectedRowIndexSell} =this.state;   
        const listRows = selectedRowIndexSell.includes(row)?selectedRowIndexSell.filter(i=>i!== row):[row,...selectedRowIndexSell];
        await this.setState({
        	selectedRowIndexSell:listRows});
        this.calcOutputData();	  
    },
    async selectRowBuy(row){
        const {selectedRowIndexBuy} =  this.state    
        const listRows = selectedRowIndexBuy.includes(row)?selectedRowIndexBuy.filter(i=>i!== row):[row,...selectedRowIndexBuy];
        await this.setState({
        	selectedRowIndexBuy:listRows});
        this.calcOutputData();		
    },
    async selectionReset(){
      if (window.confirm('Are you sure want to reset all offsets to default calculation?')) {
      await this.setState({
      	selectedRowIndexBuy:[],
      	selectedRowIndexSell:[]});
      this.calcOutputData();
      }
    }, 
    calcOutputData(){
        let {selectedRowIndexBuy,selectedRowIndexSell,detailedData, totals} = this.state; 
        //+ add sort data by InvoiceID
        //calc totals
        const selectedDataBuy = [...detailedData.buy.filter((el,index)=>selectedRowIndexBuy.includes(+el.InvoiceID))];
        const selectedDataSell = [...detailedData.sell.filter((el,index)=>selectedRowIndexSell.includes(+el.InvoiceID))];
        const buyInvoiceTotal_ = selectedDataBuy.reduce((acc,el,arr)=>acc+=+el.OutstandingAmount,0);
        const sellInvoiceTotal_ = selectedDataSell.reduce((acc,el,arr)=>acc+=+el.OutstandingAmount,0);
 		//sell offset max total  = sell offset
        let sellInvoiceTotal_tmp = Math.abs(sellInvoiceTotal_);
        //buy offset max total  = MIN(sell offset, buy offset)
        const netAmount_ = Math.min(Math.abs(sellInvoiceTotal_),Math.abs(buyInvoiceTotal_))
        let buyInvoiceTotal_tmp = netAmount_;
        let buyOffsets = [];
        let sellOffsets = [];
        
        //offset calc (can be calculated in parallel)
        //buy section
        selectedDataBuy.map(el=>{
            let offsetBuy = 0;  
            if (Math.abs(el.OutstandingAmount)>Math.abs(sellInvoiceTotal_tmp)){
            	offsetBuy =sellInvoiceTotal_tmp ===0?0: Math.abs(+sellInvoiceTotal_tmp)
        	}
            else{
        		offsetBuy = Math.abs(+el.OutstandingAmount);
        	}
                  
            buyOffsets.push({
            	invoiceId:el.InvoiceID,
            	offset:offsetBuy
        	});
        
        	sellInvoiceTotal_tmp-=offsetBuy;     
        });
        //sell section
        selectedDataSell.map(el=>{
        	let offsetSell = 0;
            if (Math.abs(el.OutstandingAmount)>Math.abs(buyInvoiceTotal_tmp)){
            	offsetSell = Math.abs(+buyInvoiceTotal_tmp)
        	}
            else{
        		offsetSell = Math.abs(+el.OutstandingAmount);
        	}
            sellOffsets.push({
            	invoiceId:el.InvoiceID,
            	offset:offsetSell
        	});
            
        	buyInvoiceTotal_tmp-=offsetSell;
        });
        //end offset calc

        console.log('---------selected data [B,S] = ',selectedDataBuy,selectedDataSell);
		console.log('---------offsetts data [B,S] = ',buyOffsets,sellOffsets);
             
        const offsetInvoiceTotal_ = Math.abs(+sellInvoiceTotal_) - Math.abs(+buyInvoiceTotal_);
        this.setState({
            totals:{
            	...totals,
                buyInvoiceTotal:{...this.state.totals.buyInvoiceTotal, value:buyInvoiceTotal_},
            	sellInvoiceTotal:{...this.state.totals.sellInvoiceTotal, value:sellInvoiceTotal_},
            	offsetAmount:{...this.state.totals.offsetAmount, value:offsetInvoiceTotal_},
            	netAmount:{...this.state.totals.netAmount, value:netAmount_},
            },
            offsets:{
                 buy:buyOffsets,
                 sell:sellOffsets
            }
        });          
    },
    saveCalcData(){
        
    },
    render(){
    const {userData,totals,detailedData,isWaiting,padgingTables,selectedRowIndexBuy,nettingAccount,selectedRowIndexSell,netDate,offsets,noData} = this.state;
    console.log('[render] NettingContainer');
        const nettingStep = (netDate === -1)? 0: (nettingAccount===-1)? 1:2; 
    	return(
             <div>
             <NavToolBar
               onPrevStep={()=>this.prevStep()}
              />
              <Netting
                step={nettingStep}
                padgingTables = {padgingTables}
                onDateChange = {(date)=>this.onDateChange(date)}           
                onPrevStep={()=>this.prevStep()}
                onSelectionReset = {()=>this.selectionReset()} 
                onSelectRowBuy = {rowIndex=>this.selectRowBuy(rowIndex)}
                onSelectRowSell = {rowIndex=>this.selectRowSell(rowIndex)}
                onChangeAccount = {id=>this.onAccChange(id)}
                onChangeGroup = {id=>this.onGroupChange(id)}
                onSetPageBuy = {step=>this.setPage(step,0)}
                onSetPageSell = {step=>this.setPage(step,1)}
                noData={noData}
                isWaiting={isWaiting}
                data={{detailedData,
                       totals,
                       offsets,
                       selectedRowIndexBuy,
                       selectedRowIndexSell
                      }}
                userData={userData}
                currencySymbol={"$"}
               />
             </div>)
	}
});
