/**to do : 

default props 4 destructuring assignment
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
const nettingGroup = "'SAM123'";  

const queryBuy = "SELECT  "+
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
"AND a1.nettinggroup = "+nettingGroup+" "+
"AND a1.AccountType = 'BUYER' "+
"AND i1.status = 'CLOSED' "+
"ORDER BY i1.id ASC"   ;

const querySell = "select  "+
"i1.DueDate as NetDate, "+
"a1.id AS AccountId,"+
"a1.AccountNumber AS Account,"+
"a1.Name AS AccountName,"+
"i1.id AS InvoiceID,"+
"i1.status AS Status,"+
"-i1.GrandTotalAmount AS InvoiceCharges,"+
"i1.PaymentAmount AS Payments, "+
"i1.CreditAmount AS Adjustments, "+
"(-i1.GrandTotalAmount-i1.CreditAmount+i1.PaymentAmount) AS OutstandingAmount, "+
"n1.netting_statement AS Statement, "+
"a1.nettinggroup,  "+
 "(bp1.PaymentTermDays || ' days') as  PaymentTermDays "+   
"from invoice i1 "+
"JOIN billing_profile bp1 ON i1.billingprofileid = bp1.id "+
"JOIN account a1 ON bp1.accountid = a1.id "+
"LEFT JOIN netting n1 ON i1.netted_id = n1.id "+
"WHERE 1=1 "+
"AND a1.nettinggroup = "+nettingGroup+" "+
"AND a1.AccountType = 'SELLER' "+
"AND i1.status = 'CLOSED' "+
"ORDER BY  i1.id  ASC";

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
console.log('-------queries = ', queryBuy,querySell);

const utils = {
    replaceIfNegativeNumber:num=>/^-[0-9]\d*(\.\d+)?$/.test(num)? '('+(num*-1)+')':num,
    formatDate:dateString=>{
    	try{ 
            const date_ = new Date(Date.parse(dateString)); 
            return ('0' + date_.getDate()).slice(-2) + '/'
             + ('0' + (date_.getMonth()+1)).slice(-2) + '/'
             + date_.getFullYear()
    }catch(e){ console.error('Error date parsing :',e); return dateString}}/*,
    formatField:item=>this.replaceIfNegativeNumber(item)*/
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
    const {type,data,offsets,keyFieldName,columns,selectedRowIndex,formatDateColumnIndex : FDC, formatNegativeNColumnIndex : FNI} = this.props;
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
         <div className="col-sm-6 text-right">Page 1 of N</div>
         <div className="col-sm-6 text-right"><span className="px-3 btn">&#9001;</span><span className=" btn">&#9002;</span></div> 
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
    	const {userData,currencySymbol} = this.props;
        const netting = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.Netting))
        const {detailedData,offsets,totals,selectedRowIndexBuy,selectedRowIndexSell} = this.props.data;
        const totalsToHTML = Object.values(totals).map(el=><div className="row pt-4"><div className="col-sm-3 text-right">{el.title}</div><div className="col-sm-2 text-right">{currencySymbol}{utils.replaceIfNegativeNumber(el.value)}</div></div>)
		return(<div className="pt-3">
     		<div className="container-fluid">  
            <div className="row">
            	<div className="col-sm-3 pt-2">Net As Of Date</div><div className="col-sm-3">
                <BPUI.InputField key="1112" className="dateselector" variable={new BPUI.ReferenceObject()} placeholder="Click for select..." layout="plain" type="DATE_SELECTOR" onUpdate={(date,val2,val3)=>{this.props.onDateChange(date)}}/>                                    
                </div>
            </div>
               {/*<div className="row pt-4">
                <div className="col-sm-3">Client</div><div className="col-sm-3">{userData.name}</div>
             </div> */}
            <div className="row pt-4">
                 <div className="col-sm-3 pt-2">
                	Select company
                </div>
             	<div className="col-sm-3">
                    <BPUI.InputField variable={netting}   field="account_id" onUpdate={(id,type,object)=>{this.props.onChangeAccount(id)}} layout="plain" />
                </div>
            </div>
               <div className="row pt-4">
                 <div className="col-sm-3 pt-2">
                	Select Netting Group
                </div>
             	<div className="col-sm-3">
                	<BPUI.InputField  variable={netting} field="netting_group" onUpdate={(id,type,object)=>{this.props.onChangeGroup(id)}}  layout="plain" />
                </div>
            </div>
            <div className="row ">
               <BPUI.Divider Name="Invoice Chart" >Netting </BPUI.Divider>                    
            </div>
            {totalsToHTML}
             <div className="row pt-2">
               <BPUI.Divider Name="" >
                 <button className="">Net</button>
                 <button disabled={selectedRowIndexBuy.length===0 && selectedRowIndexSell.length===0 } className="ml-1" onClick={()=>this.props.onSelectionReset()}>Reset</button>
                </BPUI.Divider>
            </div>   
            <div className="row pt-4">
              <div className="col-sm-12"><label className="switch"><input checked={twoColView} onChange={()=>this.setState({twoColView:!twoColView})} type="checkbox"/><span className="slider round"></span></label> </div>
            <div className="col-sm-12" style={{opacity:0.6}}>{twoColView?'Switch to 1-column view':'Switch to 2-column view'}</div>
                <div className={`${twoColView? 'col-sm-6':'col-sm-12'} text-center`}>
                <NettingDetailsTable_ 
                   type={0}
                   keyFieldName={'InvoiceID'}
                   data={detailedData.buy}
                   offsets={offsets.buy}
                   formatDateColumnIndex={[1]}
                   formatNegativeNColumnIndex={[5,6,7,8,9]}
                   columns={columns__}
                   onSelectRow={(rowIndex)=>this.props.onSelectRowBuy(rowIndex)}
                   selectedRowIndex={selectedRowIndexBuy}
                />
               </div>
               <div className={`${twoColView? 'col-sm-6':'col-sm-12'} text-center`}>
                <NettingDetailsTable_ 
                   type={1}
                   keyFieldName={'InvoiceID'}
                   data={detailedData.sell}
                   offsets={offsets.sell}
                   formatDateColumnIndex={[1]}
                   formatNegativeNColumnIndex={[5,6,7,8,9]}
                   columns={columns__}
                   onSelectRow={(rowIndex)=>this.props.onSelectRowSell(rowIndex)}      
                   selectedRowIndex={selectedRowIndexSell}
                />
               </div>                          
            </div> 
      	</div>
    </div>)
	}
});


//data cotainer                                         
const NettingContainer = React.createClass({  
    getInitialState() {
    return {
         netDate:new Date(),
         nettingAccount:-1,
         nettingGroup:-1,
    	 userData:{},
    	 isWaiting:true,
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
         	(this.state.nettingGroup !== nextState.nettingGroup) ||
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
    async onDateChange(date){
        const that = this;
        this.setState({netDate:date, isWaiting:true}, 
         ()=>  this.getDataBuySell(null,null,null) 
                     )
    },
    onAccChange(id){
        console.log('acc id changed',+id);
        this.setState({nettingAccount:id},
           ()=>  this.getDataBuySell(null,null,null)          
                     )
    },
    onGroupChange(id){
        console.log('group changed',id)
            this.setState({nettingGroup:id},
               ()=> this.getDataBuySell(null,null,null))
    },
    async getDataBuySell(date=null,accountID = null, nettingGroup = null){
        if (date===null && accountID === null && nettingGroup === null){
        console.log('----call get data');
        }
        try{
            this.setState({isWaiting:true});
            const [collectionBuy,collectionSell] = await Promise.all([
                BPConnection.BrmAggregate.queryAsync(queryBuy).collection(),
                BPConnection.BrmAggregate.queryAsync(querySell).collection(),
              ]);
           	console.error('[Container]:::COLLECTIONS:::');
            console.log(collectionBuy,collectionSell);
            let buyDataRef = new BPUI.ReferenceObject(collectionBuy).get().list();
            let sellDataRef = new BPUI.ReferenceObject(collectionSell).get().list();
            return({
               buy:buyDataRef,
               sell:sellDataRef
             });
           }catch(e){
            	console.error(e,e.responseText);
            	return false;    
         }finally{
           this.setState({isWaiting:false}); 
                }
                
    },
    async componentDidMount(){
	   const detailedData = await this.getDataBuySell();
        if (detailedData){  //if received and correct       
             this.setState({ 
                			detailedData,
                       		userData,
                            isWaiting:false});
       console.log('[didmounted] NettingContainer');
      }
    },
    selectRowSell(row){            
        const {selectedRowIndexSell} =  this.state    
        const listRows = selectedRowIndexSell.includes(row)?selectedRowIndexSell.filter(i=>i!== row):[row,...selectedRowIndexSell];
        this.setState({
        	selectedRowIndexSell:listRows
    	},()=>this.calcOutputData());	  
    },
    selectRowBuy(row){
        const {selectedRowIndexBuy} =  this.state    
        const listRows = selectedRowIndexBuy.includes(row)?selectedRowIndexBuy.filter(i=>i!== row):[row,...selectedRowIndexBuy];
        this.setState({
        	selectedRowIndexBuy:listRows
    	},()=>this.calcOutputData());		
    },
    selectionReset(){
      if (window.confirm('Are you sure want to reset all offsets to default calculation?')) {
      this.setState({
      	selectedRowIndexBuy:[],
      	selectedRowIndexSell:[]   
            },()=>this.calcOutputData())   
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
    const {userData,totals,detailedData,isWaiting,selectedRowIndexBuy,selectedRowIndexSell,offsets} = this.state;
    console.log('[render] NettingContainer');
    const preLoader = (<div className="spinner">
              <div className="bounce1"></div>
              <div className="bounce2"></div>
      		  <div className="bounce2"></div>
            </div>);
        
    	return(
             <div>
             <NavToolBar
               onPrevStep={()=>this.prevStep()}
              />
             {isWaiting? preLoader:
              <Netting
                onDateChange = {(date)=>this.onDateChange(date)}           
                onPrevStep={()=>this.prevStep()}
                onSelectionReset = {()=>this.selectionReset()} 
                onSelectRowBuy = {rowIndex=>this.selectRowBuy(rowIndex)}
                onSelectRowSell = {rowIndex=>this.selectRowSell(rowIndex)}
                onChangeAccount = {id=>this.onAccChange(id)}
                onChangeGroup = {id=>this.onGroupChange(id)}          
                data={{detailedData,
                       totals,
                       offsets,
                       selectedRowIndexBuy,
                       selectedRowIndexSell
                      }}
                userData={userData}
                currencySymbol={"$"}
               />
              }
             </div>)
	}
});
