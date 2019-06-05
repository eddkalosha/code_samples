/**to do : 
optimize renders
editable field 'offset'
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

const calculateWidthWidget = () => {  
        //got from function resizeContent() //core.js
        const sw = $("#sidebar-wrapper");
        const sbWidth =  sw? $(sw).width() : 0;
        const treeWidth = treeExpandState == 'EXPANDED' ? $('#treeMenu').width() : 0;
        const gridWidth = $(window).width() - treeWidth - $('#collapseTree').width() - 60 - sbWidth;
        return gridWidth;
    }
        
        BPSystem.initialize();
        const ver = React.version;
        const {userName,nodeId} =BPSystem;
        const FIELD_APPROVE_INVOICE = "InvoiceStatus";
        const FIELD_KEY = "InvoiceID";
        const ALLOWED_INVOICES = ["OPEN","CLOSED","APPROVED"];
        const CURRENCY_SYMBOL = "$";
        const  TABLE_PAGE_COUNT = 100;
        let NETTING = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.Netting));
        let CURRENT_DATE =  new BPUI.ReferenceObject(moment(new Date()).format('MM/DD/YYYY') );
        let NETTING_GROUPS =  new BPUI.ReferenceObject();
        let WIDGET_WIDTH = calculateWidthWidget()+'px';
            let UPDATE_RESIZE_TIMEOUT = 500;//ms delay for window.resize re-calc width of component
            let UPDATE_RESIZE_QUEED = null; 
    
        
        const queryMain = (account={
                            accountType:'',
                            accountID:-1,
                               nettingGroup:''},
                            offsetRows=0, 
                            countRows=TABLE_PAGE_COUNT) =>
            ("SELECT  "+
            "i1.DueDate as NetDate, "+
            "a1.id AS AccountId, "+
            "a1.AccountNumber AS Account, "+
            "a1.Name AS AccountName, "+
            "i1.billingprofileid as bProfileID, "+
            "i1.id AS InvoiceID, "+
           // "i1.status AS Status, "+
            "i1.GrandTotalAmount AS InvoiceCharges, "+
            "i1.PaymentAmount AS Payments,  "+
            "i1.CreditAmount AS Adjustments, "+
            "(i1.GrandTotalAmount-i1.CreditAmount+i1.PaymentAmount) AS OutstandingAmount, "+
            "n1.netting_statement AS Statement, "+
            "a1.nettinggroup, "+
            "(bp1.PaymentTermDays || ' days') as  PaymentTermDays, "+  
            "CASE WHEN i1.status = 'CURRENT' THEN 'OPEN' "+ 
                    "WHEN i1.status = 'CLOSED' and i1.ApprovalStatus <> 'APPROVED' THEN 'CLOSED' "+ 
                    "WHEN i1.status = 'CLOSED' and i1.ApprovalStatus = 'APPROVED' and i1.netted_id IS NULL THEN 'APPROVED' "+
                    "ELSE 'NETTED' END as InvoiceStatus "+
            "FROM invoice i1 "+
            "JOIN billing_profile bp1 ON i1.billingprofileid = bp1.id "+
            "JOIN account a1 ON bp1.accountid = a1.id "+
            "LEFT JOIN netting n1 ON i1.netted_id = n1.id "+
            "WHERE 1=1 "+
               (account.nettingGroup =='Unassigned'?" AND a1.AccountNumber  = "+account.accountID+" ":" AND a1.nettinggroup = '"+account.nettingGroup+"' ")+
            "AND a1.AccountType = '"+account.accountType+"' "+
           // "AND i1.status = 'CLOSED' "+
            "ORDER BY i1.id ASC OFFSET "+(+offsetRows*+countRows)+" ROWS FETCH NEXT "+countRows+" ROWS ONLY");
        
        const queryMainRowCount = (account={
                                    accountType:'',
                                    accountID:-1,
                                    nettingGroup:''}) =>
           ("SELECT COUNT(i1.id) as rowCount "+
            "FROM invoice i1 "+
            "JOIN billing_profile bp1 ON i1.billingprofileid = bp1.id "+
            "JOIN account a1 ON bp1.accountid = a1.id "+
            "LEFT JOIN netting n1 ON i1.netted_id = n1.id "+
            "WHERE 1=1 "+
            (account.nettingGroup =='Unassigned'?" AND a1.AccountNumber  = "+account.accountID+" ":"AND a1.nettinggroup = '"+account.nettingGroup+"' ")+
            "AND a1.AccountType = '"+account.accountType+"' "//+
           // "AND i1.status = 'CLOSED' "
           );
        
        const queryNettGroups = (accountID = -1) =>( 
        "SELECT DISTINCT NVL(a1.nettinggroup,'Unassigned') as NettingGroup, a.id as GroupID "+
        "FROM account a "+
        "JOIN account a1 ON a.id = a1.parentaccountid "+
        "WHERE 1=1 "+
        "AND a1.accounttypeid = 722 "+  
        "AND a.id = "+accountID+" " 
        );
        
        const queryTypes = {
            GET_INVOICES_BUY: String('GET_INVOICES_BUY'),
            GET_INVOICES_SELL: String('GET_INVOICES_SELL'),
            GET_PAGESCOUNT_BUY: String('GET_PAGESCOUNT_BUY'),
            GET_PAGESCOUNT_SELL: String('GET_PAGESCOUNT_SELL'),
            GET_NETTING_GROUPS: String('GET_NETTING_GROUPS'),
        };
        
        const columns__ = [
               
        {field:'InvoiceID', label:'Invoice ID'},
        {field:'NetDate', label:'Net Date', width:'100'},
       // {field:'InvoiceStatus', label:'Invoice s'},	
        {field:'AccountId', label:'Account Id', width:'100'},	
        {field:'Account', label:'Account Number', width:'100'},
        //{field:'bProfileID', label:'bProfileID ', width:'100'}, 	
        {field:'AccountName', label:'Account Name', width:'250'},		
        {field:'InvoiceStatus', label:'Status', width:'100'},	
        {field:'InvoiceCharges', label:'Invoice Charges', width:'100'},	
        {field:'Payments', label:'Payments', width:'100'},	
        {field:'Adjustments', label:'Adjustments', width:'100'},
        {field:'Offset', label:'Offset', width:'100'},
        //{field:'OutstandingAmount', label:'Outstanding Amount', width:'100'},
        {field:'OutstandingAmountTotal', label:'Outstanding Amount', width:'100'},	
        {field:'PaymentTermDays',label:'Pay terms', width:'100'},
        {field:'Statement', label:'Statement', width:'100'}
        ];
        
        Array.prototype.insert = function (index,item){
            this.splice( index, 0, item );
        };
        String.prototype.formatNumber = function(n = 2,x = 3){
            if (Number.isNaN(+this)) { return (this || "").toString()}
            const this_ = +this; 
            const re = '\\d(?=(\\d{' + (x) + '})+' + (n > 0 ? '\\.' : "$") + ')';
            return this_.toFixed(Math.max(0, ~~n)).replace(new RegExp(re,'g'),"$"+'&,');
        }
        String.prototype.formatDate = function(){
                try{ 
                    const date_ = new Date(Date.parse(this)); 
                    return ('0' + (date_.getMonth()+1)).slice(-2) + '/'+
                        ('0' + date_.getDate()).slice(-2) + '/'
                     + date_.getFullYear()
            }catch(e){ console.error(e); return dateString}
        };
        String.prototype.replaceIfNegativeNumber = function(){
            return /^-/.test(this)? '('+(this.replace('-',''))+')':this.toString()
        };
        Number.prototype.replaceIfNegativeNumber = function(){
            return /^-[0-9]\d*(\.\d+)?$/.test(+this)? '('+(this*-1)+')':this.toString()
        };
        
        const settings = {
            labels:{
                tableTypeBuy:('Buy Side'),
                tableTypeSell:('Sell Side'),
                haventOffset:('-'),
                netSelectColumnName:('NET'),
                OffsetColumnName:('Offset'),
                noDataPrimary:('Select Account and Netting Group Code'),
                noDataSecondary:('to see buy and sell side invoices'),
                netDate:('Net As of Date'),
                company:('Company'),
                groupCode:('Netting Group Code'),
                nettingTotals:('Netting Totals'),
                submitBtn:('Save netting'),
                resetBtn:('Reset'),
                resetDlg:('Are you sure want to reset all offsets to default calculation?'),
                helpText:('1.Select lines of Buy and Sell tables for netting calculation 2. Click [Save netting] button in Netting Totals section for save Netting results'),
                toSeller:('to the Seller'),
                toBuyer:('to the Buyer'),
                userInput:('Input parameters'),
                switchtoOne:('Switch to 1-column view'),
                switchtoTwo:('Switch to 2-column view'),
                step1Title:('Step 1'),
                step1Descr:('Select Date, Company and Netting Group Code. Then you will see netting data.'),
                step2Title:('Netting Totals'),
                step2Descr:('Click [Save netting] button for save Netting results.'),
                tablesSelect:('Choose/Unchoose the lines of this table for netting. For that click on checkbox for each line you want add for calculation. Totals of netting will be re-calculated automatically.')
            }
        };
        
        const NavToolBar = React.createClass({
          shouldComponentUpdate(){ return false},
          render() {
            return (<div className="container-fluid">
                    <BPUI.NavToolBar>
                             <div align="left" className="returnToList pr-4">
                                  <a 
                                  href="javascript:add_attr_submit('SET_FORM_VIEW', 'form_type_in', 'FL')"	
                                  className="return-btn"/>
                              </div>
                      </BPUI.NavToolBar>
            </div>)
          }
        });
        
        
        const NettingDetailsTable_ = React.createClass({
            render() { 
            console.log('[render] NettingDetailsTable_',this.props);
            const {type,data,offsets,maxPagesCount,keyFieldName,columns,onSetStep,currentPage,
                selectedRowIndex,formatDateColumnIndex : FDC, formatNegativeNColumnIndex : FNI,
                currencyColumnIndex, currencySymbol
                } = this.props;
            const {labels} = settings;
            const labelType = [[labels.tableTypeBuy],[labels.tableTypeSell]];
            const columnsToHTML = columns.map((column,index)=><th className="py-4_" scope="col" key={index}><div style={{width:column.width? column.width+'px':'100px'}}>{column.label}</div></th>);
            const dataTmp = data.length>0? [...data].map(el=> {
                //calculation of offset field
                const index_ = offsets.findIndex(offsetEl=>+offsetEl.invoiceId===+el[keyFieldName]);
                const offsetValue =  index_>-1? offsets[index_].offset:0;
                const totalAmountValue = index_>-1? offsets[index_].OutstandingAmountTotal:el.OutstandingAmount ;
                    return ({...el, 
                        Offset:offsetValue,
                        OutstandingAmountTotal:totalAmountValue
                    })})
                :[];
        
            const dataToHTML_ =  dataTmp.map((el,index)=> (
                          <tr className={`${ ALLOWED_INVOICES.includes(el[FIELD_APPROVE_INVOICE])? selectedRowIndex.includes(+el[keyFieldName])?'bg-selected':'':'disabled'}`}>
                                  <td onClick={()=>this.props.onSelectRow(+el[keyFieldName])}><input type="checkbox" readOnly checked={selectedRowIndex.includes(+el[keyFieldName])} /></td>
                                  {
                                   columns.map((column,index)=>
                                     <td>
                                         <div className={`${currencyColumnIndex.includes(index)? 'has-currency':'' } field`}>
                                             {
                                              currencyColumnIndex.includes(index)? <span className="currency">{currencySymbol}</span>:null   
                                             }
                                             <span className="value">
                                            {  FDC.includes(index)? String(el[column.field]).formatDate()
                                            : FNI.includes(index)? String(el[column.field]).formatNumber().replaceIfNegativeNumber()
                                                :el[column.field]
                                            }
                                            </span>
                                        </div>
                                     </td>)
                                  }
                           </tr>)
             );   
            return(
                <div className="detail-table">
                <div className="row p-0 m-0">
                    <div className="divider pb-0">
                        <div className="dividerText py-2">{labelType[type] || null}
                        <BPUI.HelpText name={'tooltip'} shortHelp={labelType[type]+' table'} longHelp={[labels.tablesSelect]}/>
                        </div> 
                        
                    </div> 
                </div>                                                                           
                <div className="table-light-border">
                 <div className="table-responsive">
                    <table className="table" >
                        <thead>
                        <tr>
                            <th>{[labels.netSelectColumnName]}</th>
                            {columnsToHTML}
                        </tr>
                        </thead>
                        <tbody>
                        {dataToHTML_}  
                        </tbody>
                    </table>
                </div>       
                <div className="row p-2">
                  <div className="col-sm-6 text-right mt-2">Page {currentPage+1} of {maxPagesCount+1 || '1'}</div>
                  <div className="col-sm-6 text-right">
                    <span onClick={()=>onSetStep(currentPage-1<0?0:currentPage-1)} className={`px-3 btn ${+currentPage===0?'disabled':''}`}><i className="fa fa-chevron-left"></i></span>
                    <span onClick={()=>onSetStep(currentPage+1>maxPagesCount?maxPagesCount:currentPage+1)} className={` btn  ${+currentPage===+maxPagesCount?'disabled':''}`}><i className="fa fa-chevron-right"></i> </span>
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
            console.log('[NettingComponent] props',this.props);
                const {twoColView} = this.state;
                const {labels} = settings;
                const preLoader = (<div className="col-sm-12">
                    <div className="spinner py-5">
                      <div className="bounce1"></div>
                      <div className="bounce2"></div>
                        <div className="bounce2"></div>
                    </div></div>);
                const haveNoData = (<div className="col-sm-12 text-center py-5 my-5 alert-warning">
                       <div>{[labels.noDataPrimary]}</div>
                       <small>{[labels.noDataSecondary]}</small>            
                    </div>);
                   
                let {padgingTables,step,isWaiting,noData,data,currencySymbol} = this.props ;
                padgingTables = padgingTables || {padgingTables:{maxBuy:0,currentBuy:0,maxSell:0,currentSell:0}};
                const {nettingGroups,detailedData,offsets,totals,selectedRowIndexBuy,selectedGroup,selectedRowIndexSell} = data || {selectedRowIndexBuy:[],selectedRowIndexSell:[],detailedData:{buy:[],sell:[]},offsets:{buy:[],sell:[]}};
                const totalsToHTML = Object.values(totals || []).map(el=>
                    <div className="row p-0 m-0 pt-4">
                        <div className="col-sm-6 text-right">{el.title}</div>
                        <div className="col-sm-6 has-currency"><span className="currency">{currencySymbol}</span><span className="value">{String(el.value).formatNumber().replaceIfNegativeNumber()}</span></div>
                    </div>);
                const nettingGroupsToHTML = (nettingGroups || []).map((el,i)=><option key={i} value={el.GroupID}>{el.NettingGroup}</option>);
                return(<div className="pt-3">
                     <div className="row">
                    <section className="section-user-input px-2 col-sm-6"> 
                    <div className="row p-0 m-0">
                       <div className="divider"><div className="dividerText py-2">{[labels.userInput]}<BPUI.HelpText name={'tooltip'} shortHelp={[labels.step1Title]} longHelp={[labels.step1Descr]}/></div> </div> 
                    </div> 
                        <div className="row  p-0 m-0">
                            <div className="col-sm-6 pt-2"><img alt="" src="images/required.png"/>{[labels.netDate]}</div>
                            <div className="col-sm-6">
                                <BPUI.InputField key="1112" format="mm/dd/yy" className="dateselector" variable={CURRENT_DATE} placeholder="Click for select..." layout="plain" type="DATE_SELECTOR" onUpdate={(date,val2,val3)=>{this.props.onDateChange(date)}}/>                                    
                            </div>
                        </div>
                        <div className={`row p-0 m-0 pt-4 ${step<1?'disabled':''}`}>
                            <div className="col-sm-6 pt-2">
                                <img alt="" src="images/required.png"/> 
                                <span>{[labels.company]}</span>
                            </div>
                            <div className="col-sm-6 lookup23__">
                                <BPUI.InputField variable={NETTING} className="input nnn"  placeholder="Click for select..."field="account_id" onUpdate={(id,type,object)=>{this.props.onChangeAccount(id)}} layout="plain" />
                            </div>
                        </div>
                        <div className={`row p-0 m-0 pt-4 ${ (step<2) ?'disabled':''}`}>
                            <div className="col-sm-6 pt-2">
                                <img alt="" src="images/required.png"/>
                                <span>{[labels.groupCode]}</span>     
                            </div>
                            <div className="col-sm-6 no-span">
                                <select className="w-100" value={selectedGroup} onChange={(e)=>{this.props.onChangeGroup(e.target.value)}}>
                                    <option value='-1'>- Not selected -</option>
                                    {nettingGroupsToHTML}
                                </select>
                            </div>
                        </div>
                    </section>
                    <section className={`section-totals col-sm-6 px-2 ${(noData || isWaiting)?'disabled':'' }`}>
                        <div className="grey-block  pb-3">
                            <div className="row p-0 m-0">
                            <div className="divider"><div className="dividerText py-2">{[labels.nettingTotals]}<BPUI.HelpText name={'tooltip'} shortHelp={[labels.step2Title]} longHelp={[labels.step2Descr]}/></div> </div> 
                            </div>
                            {totalsToHTML}
                            {
                                +totals.offsetAmount.value===0?'':
                                    <div className="row p-0 m-0 pt-4 text-center">
                                        <div className="col-sm-6"/>
                                        <div className="col-sm-6 text-right"><h3>{ +totals.offsetAmount.value>0?[labels.toSeller]:[labels.toBuyer] }</h3></div>
                                    </div>
                            }
                            <div className="row p-0 m-0 pt-2">
                            <div className="col-sm-12 text-right"> 
                                <button className="btn btn-outline-blue " disabled={selectedRowIndexBuy.length===0 && selectedRowIndexSell.length===0 }  onClick={()=>this.props.onSelectionReset()}><i className="fa fa-undo"></i> {[labels.resetBtn]}</button>                
                                <button onClick={()=>this.props.onSaveData()} className="btn ml-1"><i className="fa fa-cloud-upload"></i> {[labels.submitBtn]}</button>
                            </div>                    
                            </div>
                        </div>
                    </section>
                    {noData? haveNoData:  isWaiting? preLoader:
                    <section className="section-detail-tables col-sm-12"> 
                     <div className="row">
                      {/*<div className="col-sm-12 formInfo text-blue">{[labels.helpText]} </div> */}
                      <div className="col-sm-12 mt-3"><label className="switch"><input checked={twoColView} onChange={()=>this.setState({twoColView:!twoColView})} type="checkbox"/><span className="slider round"></span></label> </div>    
                          <div className="col-sm-12" style={{opacity:0.6}}>{twoColView?[labels.switchtoOne]: [labels.switchtoTwo]}</div>
                        <div className={`${twoColView? 'col-sm-6':'col-sm-12'} text-center px-2`}>
                        <NettingDetailsTable_ 
                           type={0}
                           maxPagesCount={padgingTables.maxBuy}
                           currentPage={padgingTables.currentBuy}
                           keyFieldName={FIELD_KEY}
                           data={detailedData.buy}
                           offsets={offsets.buy} 
                           formatDateColumnIndex={[1]}
                           offsetColumnIndex = {13}
                           netColumnIndex = {0}
                           currencySymbol={currencySymbol} 
                           currencyColumnIndex={[6,7,8,9,10]} 
                           formatNegativeNColumnIndex={[6,7,8,9,10]}
                           columns={columns__}
                           onSelectRow={(rowIndex)=>this.props.onSelectRowBuy(rowIndex)}
                           selectedRowIndex={selectedRowIndexBuy}
                           onSetStep = {page=>this.props.onSetPageBuy(page)}
                        />
                       </div>
                       <div className={`${twoColView? 'col-sm-6':'col-sm-12'} text-center px-2`}>
                        <NettingDetailsTable_ 
                           type={1}
                           maxPagesCount={padgingTables.maxSell}
                           currentPage={padgingTables.currentSell}
                           keyFieldName={FIELD_KEY}
                           data={detailedData.sell}
                           offsets={offsets.sell}
                           formatDateColumnIndex={[1]}
                           offsetColumnIndex = {13}
                           netColumnIndex = {0}
                           currencySymbol={currencySymbol} 
                           currencyColumnIndex={[6,7,8,9,10,11]}
                           formatNegativeNColumnIndex={[6,7,8,9,10,11]}
                           columns={columns__}
                           onSelectRow={(rowIndex)=>this.props.onSelectRowSell(rowIndex)}      
                           selectedRowIndex={selectedRowIndexSell}
                           onSetStep = {page=>this.props.onSetPageSell(page)} 
                               
                        />
                       </div>                          
                     </div>
                    </section>  
                }  
                               
                      </div>
            </div>)
            }
        });
        //data cotainer                                         
        const NettingContainer = React.createClass({  
            getInitialState() {
            return {
                 netDate:CURRENT_DATE.getValue(),
                 nettingAccount:-1,             
                 nettingGroup:-1,
                 nettingGroups:[],
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
            prevStep(){
                let newStep = this.state.step-1;
                this.setState({
                    step:newStep<0?0:newStep
                });
            },
            async onDateChange(date){
              await  this.setState({netDate:date});
              this.checkParams__then(this.getDataInvoices)
            },
            async onAccChange(id){
               //dont call data load here, cause groupID depends on accountID
               await this.setState({nettingAccount:id,nettingGroup:-1,noData:true});
              this.getData(queryTypes.GET_NETTING_GROUPS,{id})
            },
            async onGroupChange(id){
              await this.setState({nettingGroup:id});
              this.checkParams__then(this.getDataInvoices)
            },
            checkParams__then(callback){
                //check state parameters for know when to load all data with params
                const {netDate,nettingAccount,nettingGroup} = this.state;
                if (netDate===-1 || nettingAccount===-1 || nettingGroup===-1) {
                   console.warn('params are not ready');
                }else{
                callback()
                }
            },
                
            async setPage(page=0,type=0){
             //type 0 - buy, 1 - sell
              console.log('set step',[page,type]);
              const {padgingTables} = this.state;
              const res = await this.getData(type===0?queryTypes.GET_INVOICES_BUY:queryTypes.GET_INVOICES_SELL,{},page);
                if (res){ // if data have been received -> change page
                  this.setState({
                  padgingTables: type===0?
                  {...padgingTables,currentBuy:page}:
                  {...padgingTables,currentSell:page}
                 });
                }
            },
                
            async getData(type='',params={},offsetRows=0, countRows=TABLE_PAGE_COUNT){
                const {netDate, nettingAccount, nettingGroup, nettingGroups} = this.state;
                const groupObject = nettingGroups.find(el=>el.GroupID===nettingGroup);
                const groupName  = groupObject? groupObject.NettingGroup:'';
                const accountBuy ={
                    accountType:'BUYER',
                    accountID:nettingAccount,
                    nettingGroup:groupName
                },accountSell = {
                    accountType:'SELLER',
                    accountID:nettingAccount,
                    nettingGroup:groupName
                }
                try {
                switch(type){
                  case queryTypes.GET_INVOICES_BUY:{
                    
                        const [res] = await Promise.all([BPConnection.BrmAggregate.queryAsync(queryMain(accountBuy,offsetRows)).collection()]);
                      const resList =  res.elements;
                      await this.setState({detailedData:{...this.state.detailedData,buy:resList}});
                     
                    break;}
                  case queryTypes.GET_INVOICES_SELL:{
                    
                      const [res] = await Promise.all([BPConnection.BrmAggregate.queryAsync(queryMain(accountSell,offsetRows)).collection()]);
                      const resList =  res.elements;
                      await this.setState({detailedData:{...this.state.detailedData,sell:resList}});
           
                      break;}
                  case queryTypes.GET_PAGESCOUNT_BUY:{ 
                       const [res] = await Promise.all([BPConnection.BrmAggregate.queryAsync(queryMainRowCount(accountBuy)).single()]);
                      await this.setState({padgingTables:{...this.state.padgingTables,maxBuy: Math.ceil(+res.rowCount/TABLE_PAGE_COUNT)-1}});
                
                      break;}
                  case queryTypes.GET_PAGESCOUNT_SELL:{
                 const [res] = await Promise.all([BPConnection.BrmAggregate.queryAsync(queryMainRowCount(accountSell)).single()]);
                      await this.setState({padgingTables:{...this.state.padgingTables,maxSell: Math.ceil(+res.rowCount/TABLE_PAGE_COUNT)-1}});
  
                      break;}
                  case queryTypes.GET_NETTING_GROUPS:{ 
                          const [res] = await Promise.all([BPConnection.BrmAggregate.queryAsync(queryNettGroups(params.id)).collection()]);
                      const resList = res.elements;
                      await this.setState({nettingGroups:resList});
   
                      break;}
                  default : return false;
                  
                }}
                catch (e){ return false}
                return true;
            }, 
            async getDataInvoices(){
              //aggregate results of data Buy and Sell with pagesCounts for detailed tables
              await this.setState({isWaiting:true, noData:false});
              const [buyInv,sellInv, buyCount, sellCount] = await Promise.all([
                        this.getData(queryTypes.GET_INVOICES_BUY),
                        this.getData(queryTypes.GET_INVOICES_SELL),
                        this.getData(queryTypes.GET_PAGESCOUNT_BUY),
                        this.getData(queryTypes.GET_PAGESCOUNT_SELL)
              ]);   
              console.log('get data invoices',[buyInv,sellInv])       
              await this.setState({
                  isWaiting:false, 
                  noData:!(buyInv&&sellInv&&buyCount&&sellCount)
                });
              this.selectAllData();
            },       
            componentDidMount(){
                 $(window).on("resize",  ()=>{
                        if (UPDATE_RESIZE_QUEED) clearTimeout(UPDATE_RESIZE_QUEED);
                        UPDATE_RESIZE_QUEED = setTimeout(() =>  this.forceUpdate(), UPDATE_RESIZE_TIMEOUT);
                        });
               // const savedStateData = window.localStorage.widget_state_data;
              //  if (savedStateData) this.setState(JSON.parse(savedStateData))
              console.log('[didmounted] NettingContainer');
            },
            componentWillUnmount() {
                $(window).off("resize", ()=>this.forceUpdate());
              //window.removeEventListener('resize',()=> this.forceUpdate())
            },
            componentDidUpdate(props,state){
             //save state 
              //window.localStorage.setItem('widget_state_data',JSON.stringify(state));
            },
            async selectRowSell(row){            
                const {selectedRowIndexSell} =this.state;   
                const listRows = selectedRowIndexSell.includes(row)?selectedRowIndexSell.filter(i=>i!== row):[row,...selectedRowIndexSell];
                await this.setState({selectedRowIndexSell:listRows});
                this.calcOutputData();	  
            },
            async selectRowBuy(row){
                const {selectedRowIndexBuy} =  this.state    
                const listRows = selectedRowIndexBuy.includes(row)?selectedRowIndexBuy.filter(i=>i!== row):[row,...selectedRowIndexBuy];
                await this.setState({selectedRowIndexBuy:listRows});
                this.calcOutputData();		
            },
            async selectAllData(){
            //select all data for calculations by default
                const {detailedData} = this.state;
                  const dataBuy = detailedData.buy
                    .filter(el=>ALLOWED_INVOICES.includes(el[FIELD_APPROVE_INVOICE]))
                    .map(el=>(+el.InvoiceID));
                const dataSell = detailedData.sell
                    .filter(el=>ALLOWED_INVOICES.includes(el[FIELD_APPROVE_INVOICE]))
                    .map(el=>(+el.InvoiceID)); 
                await this.setState({
                    selectedRowIndexBuy:dataBuy,
                    selectedRowIndexSell:dataSell,
                });
                this.calcOutputData();
            },     
            async selectionReset(){
              if (window.confirm([settings.labels.resetDlg])) {
              await this.setState({
                  selectedRowIndexBuy:[],
                  selectedRowIndexSell:[]});
              this.calcOutputData();
              }
            }, 
            calcOutputData(){
                let {selectedRowIndexBuy,selectedRowIndexSell,detailedData, totals} = this.state; 
                //calc totals
                const selectedDataBuy = [...detailedData.buy
                    .filter((el,index)=>selectedRowIndexBuy.includes(+el.InvoiceID) && ALLOWED_INVOICES.includes(el[FIELD_APPROVE_INVOICE]))
                    .sort((prev, next)=>+prev.InvoiceID < +next.InvoiceID)];
                const selectedDataSell = [...detailedData.sell
                    .filter((el,index)=>selectedRowIndexSell.includes(+el.InvoiceID) && ALLOWED_INVOICES.includes(el[FIELD_APPROVE_INVOICE]))
                    .sort((prev, next)=>+prev.InvoiceID < +next.InvoiceID)];
                const buyInvoiceTotal_ = selectedDataBuy.reduce((acc,el,arr)=>acc+=+el.OutstandingAmount,0);
                const sellInvoiceTotal_ = selectedDataSell.reduce((acc,el,arr)=>acc+=+el.OutstandingAmount,0);
                 //sell offset max total  = sell offset
                let sellInvoiceTotal_tmp = Math.abs(+sellInvoiceTotal_);
                //buy offset max total  = MIN(sell offset, buy offset)
                const netAmount_ = Math.min(Math.abs(+sellInvoiceTotal_),Math.abs(+buyInvoiceTotal_))
                let buyInvoiceTotal_tmp = netAmount_;
                let buyOffsets = [];
                let sellOffsets = [];
                //offset calc (can be calculated in parallel)
                //buy section
                selectedDataBuy.map(el=>{
                    let offsetBuy = 0;  
                    if (Math.abs(+el.OutstandingAmount)>Math.abs(+sellInvoiceTotal_tmp)){
                        offsetBuy =sellInvoiceTotal_tmp ===0?0: Math.abs(+sellInvoiceTotal_tmp)
                    }
                    else{
                        offsetBuy = Math.abs(+el.OutstandingAmount); 
                    }
                          
                    buyOffsets.push({
                        invoiceId:el.InvoiceID,
                        billingId:el.bProfileID,
                        OutstandingAmountTotal:(+el.OutstandingAmount - +offsetBuy),
                        offset:-offsetBuy //add with negative sign (buy side)
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
                        billingId:el.bProfileID,
                        OutstandingAmountTotal:(+el.OutstandingAmount + +offsetSell),
                        offset:offsetSell //add with positive sign (sell side)
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
            async saveCalcData(){
            //+ add check if not empty data
            /** 
             *  1. insert data (totals) into netting_results
             *  2. get ID of total_result
             *  3. insert data (invoices) into payments table (create Payments) with ID of step 2
             *  4. get ID's of Payments
             *  5. insert data (invoices) into payments_allocation with payments ID of them from step 3
             *  6. upsert data in invoice table (ID, netted_id)
             */
            const lookupText = document.querySelector('.lookup23__ input[type="text"]');
            const companyLabel  = lookupText? lookupText.value : '';    
             const nettingResults  = {
                account_id: this.state.nettingAccount,
                company:companyLabel,
                due_date:moment(this.state.netDate).format('YYYY-MM-DD'),
                netting_group:this.state.nettingGroup,
                buy_total:this.state.totals.buyInvoiceTotal.value,
                sell_total:this.state.totals.sellInvoiceTotal.value,
                sell_pay_term:60,
                buy_pay_term:30,
                netted_amount:this.state.totals.netAmount.value,
                netted_as_of_date:moment(this.state.netDate).format('YYYY-MM-DD'),
                reversal_date:null,
                netted_status: 'PROCESSED',
                netting_statement: null
             };
                
            let resStatus = null;  
                try{
            // * * * * * *  step 1
            const createNettingResult = await BPConnection.netting.create(nettingResults);
            const invoicesArr = this.state.offsets.buy.concat(this.state.offsets.sell);
            // * * * * * *  step 2
            const nettedId_ = createNettingResult[0].Id;
            console.log('[Save data] netted_result -> OK');
            // * * * * * *  step 3
            const addPaymentsToInvoices = await BPConnection.Payment.create(
             invoicesArr.map(el=>({
                        Amount:el.offset,
                        BillingProfileId:el.billingId,
                        netted_id:nettedId_,
                        Autoallocate:1, 
                        PaymentType:'CASH',
                        PaymentNote:'##### Netting test',
                        PaymentDate:moment(new Date()).format('YYYY-MM-DD')
                })));
            // * * * * * *  step 4
            const paymentsId = addPaymentsToInvoices.map((el,index)=>({
                    PaymentItemId:el.Id,
                    InvoiceId:invoicesArr[index].invoiceId,
                    Amount:invoicesArr[index].offset
                })); 
            console.log('[Save data] invoices payments -> ',invoicesArr.length===paymentsId.length);
            if (invoicesArr.length===paymentsId.length) {
          // * * * * * *  step 5
                const addAllocationsToInvoices = await  BPConnection.PaymentAllocation.create(paymentsId);
            console.log('[Save data] invoices allocation -> OK');
           // * * * * * *  step 6
           const updateInvoiceTable = await BPConnection.INVOICE.upsert(invoicesArr.map(el=>({
                Id:el.invoiceId,
                netted_id:nettedId_ 
           })))
           console.log('[Save data] update invoices -> OK');
                resStatus = true;
                } else {
                        resStatus = false;       
                }
                }catch(e){
            resStatus = false;    
                }
        
            window.BPActions.showDialog(resStatus?"modalDlg_success":"modalDlg_error", {
              resizable: false, 
              draggable: true, 
              title: "Netting data was send", 
              modal: true, 
              width: 390, 
              maxHeight: (window.innerHeight * 2 / 2), 
              dialogClass: 'dialog-lookup', 
              maxWidth: 450,
              buttons: [{
                text: "OK",
                click:  ()=> {
                    window.BPActions.closeDialog(resStatus?"modalDlg_success":"modalDlg_error");
                    if (resStatus){
                        this.getDataInvoices();
                    }
                }}]                                            
            });
            },
            render(){
            const {totals,detailedData,isWaiting,padgingTables,selectedRowIndexBuy,nettingAccount,selectedRowIndexSell,netDate,offsets,noData,nettingGroups,nettingGroup} = this.state;
            console.log('[render] NettingContainer',this.state);
            const nettingStep = (netDate === -1)? 0: (nettingAccount===-1)? 1:2;
            WIDGET_WIDTH = calculateWidthWidget()+'px';   
                return(
                     <div className="netting-container netting-container-wrapper" style={{width:WIDGET_WIDTH}}>
                     <NavToolBar />
                      <Netting
                        step={nettingStep}
                        padgingTables = {padgingTables}
                        onDateChange = {(date)=>this.onDateChange(date)}           
                        onSaveData={()=>this.saveCalcData()}
                        onSelectionReset = {()=>this.selectionReset()} 
                        onSelectRowBuy = {rowIndex=>this.selectRowBuy(rowIndex)}
                        onSelectRowSell = {rowIndex=>this.selectRowSell(rowIndex)}
                        onChangeAccount = {id=>this.onAccChange(id)}
                        onChangeGroup = {id=>this.onGroupChange(id)}
                        onSetPageBuy = {step=>this.setPage(step,0)}
                        onSetPageSell = {step=>this.setPage(step,1)}
                        noData={noData}
                        isWaiting={isWaiting}
                        currencySymbol={CURRENCY_SYMBOL}
                        data={{detailedData,
                               totals,
                               offsets,
                               selectedRowIndexBuy,
                               selectedRowIndexSell,
                               nettingGroups,
                               selectedGroup:nettingGroup
                              }}
                       />
                     </div>)
            }
        });
              
