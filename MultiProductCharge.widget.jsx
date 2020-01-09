<BPUI.Page>
	<div className="info-loading text-blue">Loading data...</div>
	<div className="main-div-page hide">
    <div className="div-flex my-15">
        <div className="div-flex-inner  div-flex-iner-menu">
        <BPUI.Panel style ={{width: 900 + "px"}}>
        <BPUI.PanelRow>
<BPUI.OutputField key="01112" label="Account Name" className='pr-3'  variable={invoiceInfoObj} field={'accountName'}/> 
<BPUI.OutputField key="01113"  label="Invoice period" className='pr-3'    variable={invoiceInfoObj} field={'invoicePeriod'} />   
<BPUI.OutputField key="01114"  label="Invoice ID"  className='pr-3'   variable={invoiceInfoObj} field={'invoiceId'}  />  
</BPUI.PanelRow>
 </BPUI.Panel>
        </div>
    </div>
 <BPUI.FormLayout submitAction={doSaveAndUpdate} cancelAction={cancel}>
    <div className="div-flex main-div">
        <div className="div-flex-inner basis100">
            <BPUI.EmbeddedList variable={lastactivities} name="activities" width="100%"
				onCellBlur={calculateRate_}  onDel={delActivity} onAdd={addActivity} onRowClick={checkProductType}>
				<BPUI.TableColumn index={0}  name="ProductId"  onUpdate={checkProductRatig} label="Product" type="LOOKUP" />
                <BPUI.TableColumn index={1}  name="ActivityDate" type="DATE_SELECTOR"   label="Activity Date" />
                <BPUI.TableColumn index={2} name="Quantity"   label="Quantity" />
                <BPUI.TableColumn index={3} name="Rate"  label="Rate" />
                <BPUI.TableColumn index={4} className={"disabled"} editable={false} name="Cost"  label="Cost" />
                <BPUI.TableColumn index={5} className={"disabled"} editable={false} name="TaxCost"  label="Tax" />
                <BPUI.TableColumn index={6} className={"disabled"} editable={false} name="TotalCost"  label="Total Cost" />
				<BPUI.TableColumn index={7} className={"disabled"} editable={false} name="RatingMethodType"   label="Type" />
            </BPUI.EmbeddedList>
        </div>
        <div className="div-flex-inner basis100">
            <div className="footer-buttons">
                <span id="msg-info_" className="footer-buttons-label text-blue hide">Updating data in a progress...
                </span>
                <span id="msg-succ_" className="footer-buttons-label text-success success-msg hide "><i
                        className="fa fa-check-circle"></i> Data was saved successfully!</span>
                <span id="msg-fail_" className="footer-buttons-label text-danger failed-msg hide "><i
                        className="fa fa-warning"></i> Error occurred while data saving! Check fields values in the table and try again.</span>
            </div>
        </div>
    </div>
<div className="div-flex process-error hide">
<div className="div-flex-inner basis100 text-danger failed-msg">
<i className="fa fa-warning" aria-hidden="true"/> You can't Insert/Update Products on Invoice with status CLOSED or APPROVED.
</div> 
</div>
</BPUI.FormLayout>
</div>
</BPUI.Page>
________________________________________________________________________________
.disabled{pointer-events:none}
.disabled-grayfilter{
    pointer-events:none;
    opacity:0.7;
    filter: url(filters.svg#grayscale); /* Firefox 3.5+ */
    filter: gray; /* IE5+ */
    -webkit-filter: grayscale(1); /* Webkit Nightlies & Chrome Canary */ 
 -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
  filter: grayscale(100%);
}

input[type="text"]{
padding:0 !important;
margin:0 !important;
background:transparent !important;
}

.text-blue{color: #5cc3ff;}

.return-btn{
transform: translateY(20%) !important;
}

.footer-buttons{
    display: flex;
    justify-content: center;
    align-items:center;
}

.div-flex{
display:flex;
flex-wrap:wrap;
align-items: center;
}
.basis50{
flex-basis:50%;
}
.div-flex-inner{
padding: 10px 0;
}
.basis100{
flex-basis:100%;
}
.text-big{
    font-size: 150%;
}
.success-msg{
    padding: 6px;
    background: #aaff5c29;
}

.failed-msg{
    padding: 6px;
    background: #ff5c5c29;
}
.bg-semiblue{
background: #dcf4fc;
}
.my-15{
margin:15px 0;
}
 .scrollingContainer table .gridRow div.lookup-clear{
    float: none;
    padding: 2px 12px;
    background-repeat: no-repeat;
}
.text-black{
color:#000
}
.pr-3{
    padding-left: 15px;
}

 
.div-flex-iner-menu tr td,.div-flex-iner-menu td.recordDtlFont{
    background-color: #fff;
    border-bottom: 1px solid #e9e9e9 !important;
}
td.recordDtlFont{
    background-color: #f9f9f9 !important;
}

.div-flex-inner nobr span:last-child{
      width: 100px !important;
    text-align: right;
    display: inline-block;
    white-space: nowrap;
}

tr.edited td{
    background:#dcf4fc;
}
tr.edited td:nth-child(2) div:before{
  	content: '✎';
    color: #5cc3ff;
    margin-left: -5px;
    margin-top: 0px;
    font-weight: bold;
    margin-right: 5px;
}

.info-loading{
    display: flex;
    padding: 40px;
    text-align: center;
    align-items: center;
    justify-content: center;
}
___________________________________________________________________________________________________
BPSystem.initialize();
window.billingProfile = new BPUI.ReferenceObject();
window.invoice = new BPUI.ReferenceObject();
window.account = new BPUI.ReferenceObject();
window.invoiceInfoObj = new BPUI.ReferenceObject();
invoiceInfoObj.set(new Invoice());
invoiceInfoObj.get().accountName = ' - Not found -';
invoiceInfoObj.get().invoicePeriod = ' - Not selected -';
invoiceInfoObj.get().invoiceId = ' - Not selected -';
window.lastactivities = new BPUI.ReferenceObject();
window.lastactivities_copy = new BPUI.ReferenceObject();
window.accountInfo = {Name:'- Not found -'};
window.invoiceDate = {start:'- Not selected '};
window.INVOICE_STATUS = null;
window.noCharges = true;
const formatDateUI = (val) => val?moment(val).format('MM/DD/YYYY'):val;
const formatDateDB = (val) => val?moment(val).format('YYYY-MM-DD'):moment(new Date()).format('YYYY-MM-DD');
const formatAmount = (amount) => amount?parseFloat(amount).toFixed(2):"0.00";
const DATE_TIME_FORMAT = 'MM/DD/YYYY';
const DISABLED_PRODUCTS = ['PER INVOICE', 'LATE FEE', 'DISCOUNT', 'CONDITIONAL PRODUCT CHARGE', 'TAX', 'TRIAL', 'REVENUE COMMITMENT','FORMULA'];

function formatLocalDateTime(value) {
    if (value) {
        let dateObj = (typeof value === "string" ? new Date(Number(value)) : value);
        let timeZone = BPSystem.userTimeZoneName;
        let dateTime = (timeZone ? moment(dateObj).tz(timeZone) : moment(dateObj));
        return dateTime.format(DATE_TIME_FORMAT);
    }
    return value;
}

function formatUTCDateTime(value) {
    if (value) {
        var dateObj = (typeof value === "string" ? new Date(Number(value)) : value);
        var timeZone = BPSystem.userTimeZoneName;
        var dateTime = (timeZone ? moment.utc(dateObj).tz(timeZone) : moment.utc(dateObj).utcOffset(-new Date().getTimezoneOffset()));
        return dateTime.format(DATE_TIME_FORMAT);
    }
    return value;
}

function parseDateTimeToUTC(value) {
    if (value) {
        var timeZone = BPSystem.userTimeZoneName;
        var dateTime = (timeZone ? moment.tz(value, DATE_TIME_FORMAT, timeZone).utc() : moment(value).utc());
        return dateTime.format(DATE_TIME_FORMAT);
    }
    return value;
}
async function init() {
const invoiceId_ =  await BPSystem.getSelectedEntityAsync("BILLING_INVOICE");
const invoice_ = await BPConnection.Invoice.retrieveFilteredAsync('Id='+invoiceId_).single();
const billingProfile_ = await BPConnection.BillingProfile.retrieveFilteredAsync('Id='+invoice_.BillingProfileId).single();
const account_ = await BPConnection.Account.retrieveFilteredAsync('Id='+billingProfile_.AccountId).single()
accountInfo = {Name:account_.Name, Id:account_.Id};
INVOICE_STATUS = invoice_.Status;
invoiceDate = {
    start: formatDateUI(formatDateDB(invoice_.BillingCycleStartDate)), 
    end: formatDateUI(formatDateDB(invoice_.BillingCycleEndDate))
};

invoiceInfoObj.get().accountName = account_.Name;
invoiceInfoObj.get().invoicePeriod = `${invoiceDate.start} - ${invoiceDate.end}`;
invoiceInfoObj.get().invoiceId = invoiceId_;
 
    
if (!(INVOICE_STATUS=='OPEN' || INVOICE_STATUS=='CURRENT')){
       document.querySelector('.process-error').classList.remove('hide');
       document.querySelector('.main-div').classList.add('disabled-grayfilter');
       const submitBtns = document.querySelectorAll('.main-div-page a[name="submitForm"]');
       for (let btn of submitBtns) btn.classList.add('hide'); 
}

try{
const lastactivities__ = await BPConnection.ACTIVITY.query(`
SELECT a.Id,a.ProductId,a.SubscriptionFromDate,a.SubscriptionToDate,
a.Quantity,to_char(a.Rate, 'FM999999990.00') as Rate, to_char(a.Cost, 'FM999999990.00') as Cost,
to_char(a.TaxCost, 'FM999999990.00') as TaxCost,to_char(a.TotalCost, 'FM999999990.00') as TotalCost,
to_char(a.ActivityDate,'MM/DD/YYYY') as ActivityDate ,
r.RatingMethodType
FROM Activity a, Rating_Method r
WHERE  a.AccountId=${account_.Id} 
AND a.InvoiceId=${invoice_.Id} 
AND r.Id = a.RatingMethodId
ORDER BY a.Updated DESC`).collection();
window.lastactivities.set(lastactivities__);
window.noCharges = false;
}catch(e){
    window.noCharges = true;
        //init new activity by default
        window.lastactivities.set(new BPConnection.BPCollection([{}], new Activity())); 
}
    //init account and billing profile of account
    account.set(BPSystem.toBPObject({}, new Account()));
    account.get().Id = accountInfo.Id;
    billingProfile.set(BPConnection.BillingProfile.retrieveFiltered("AccountId=" + accountInfo.Id).single());
    window.lastactivities_copy = BPSystem.toBPCollection(JSON.parse(JSON.stringify(window.lastactivities.get().elements))).elements
    //init selected invoice
    invoice.set(invoice_);
    document.querySelector('.main-div-page').classList.remove('hide');
    document.querySelector('.info-loading').classList.add('hide');
}

const cancel = () => window.add_attr_submit('SET_FORM_VIEW', 'form_type_in', 'FL');

const doSaveAndUpdate = async () => {
	document.querySelector('#msg-info_').classList.remove('hide');
	document.querySelector('#msg-fail_').classList.add('hide');
    document.querySelector('#msg-succ_').classList.add('hide');
    const accountId = account.get().Id;
    const invoiceId = invoice.get().Id;
    let upsertElements = [];
    let createdElements = window.noCharges? lastactivities.get().elements:lastactivities.get().createdelements;
    if (createdElements.length>0){
     //   alert('created = '+createdElements.length);
        upsertElements.push(...createdElements);
    }else{
      //  alert('not created');
    }
    let updatedElements = lastactivities.get().updatedelements;
    if (updatedElements.length>0){
     //   alert('updated = '+updatedElements.length); 
        upsertElements.push(...updatedElements);
    }else{
    //    alert('not updated');
    }
    let upsertElements_ = BPSystem.toBPCollection(JSON.parse(JSON.stringify(upsertElements))).elements;
    upsertElements_.forEach(el=>{
        el.AccountId = accountId;
        el.InvoiceId = invoiceId;
        delete el.Rate;
        delete el.Cost;
    });
    let deletedElements = lastactivities.get().deletedelements;
    //console.log(upsertElements_,upsertElements)
   // alert('count upsert = '+upsertElements.length);
   // console.log('upserted',upsertElements);
    if (upsertElements_.length>0 || deletedElements.length>0) {
    try {    
    let itemId = ""; 
    if (upsertElements_.length>0){
        const resp = await BPConnection.Activity.upsert(upsertElements_);
        itemId="" + resp[0].Id + "&";
    }
    if (deletedElements.length>0){
        const resp2 = await BPConnection.Activity.delete(deletedElements);
    }
    document.querySelector('#msg-succ_').classList.remove('hide');
    window.onbeforeunload = true;
    window.location = "admin.jsp?name=BILLING_INVOICE_DETAIL_NEW&"+itemId+"mode=L";
    }catch(e){
        console.log(e);
        document.querySelector('#msg-fail_').classList.remove('hide');  
    }
    }else
    {
        alert('Please make changes before submitting or click [Cancel] button')
    }
	document.querySelector('#msg-info_').classList.add('hide');
}

 

const checkFieldsFilled = (objActivities,fieldsArr = ['Quantity','Rate']) => {
    const objA = objActivities.get().elements;
    for (obj of objA){
        for(field of fieldsArr){
            if (objA[field]==='' /**empty or not a number format */){ 
                alert('Check field: '+field+' of Product'+objA.Id);
                return false;
            }
        }
    }
    return true;
}

const compareObjects = (o1, o2) => { //one-level comparing (not deep)
    if (!o1 && !o2) { return true;}
    if (!o1 || !o2) { return false;}
    const comparedProperties = ['ActivityDate','Cost','Id','ProductId','Quantity','Rate','SubscriptionFromDate','SubscriptionToDate','TaxCost','TotalCost'];
  //  console.log('comparing',o1,o2)
    for(var p in o1){
        if(o1.hasOwnProperty(p) && (comparedProperties.includes(p))){
            if(o1[p] !== o2[p]){
                console.warn('comp',p);
                return false;
            }
        }
    }
    for(var p in o2){
        if(o2.hasOwnProperty(p) && (comparedProperties.includes(p))){
            if(o1[p] !== o2[p]){
                console.warn('comp',p);
                return false;
            }
        }
    }
   // console.log('equals');
    return true;
};    

const findChangedRecords = () =>{
    let changedItemsIndex = [];
    let lastactivities_ = lastactivities.get().elements; 
    for (let i=0;i<lastactivities_.length;i++){
        let lastAct = lastactivities_[i];
        let lastAct_copy = lastactivities_copy[i];
    //    console.log(lastAct,lastAct_copy)
        if (!compareObjects(lastAct,lastAct_copy)){
            changedItemsIndex.push(i)	
        }
    }
    console.log('findChangedRecords>',changedItemsIndex);
    return changedItemsIndex;
}

const calculateRate_ = (row,column,event,scope) => {
    let activityCollection = lastactivities.get();
    const columnsCalc = [2/*,4,6*/];
    let rowElement = activityCollection.elements[row];
    const changedRecords = findChangedRecords();
    const trArr = document.querySelector('.customEmbeddedEditable').querySelectorAll('tbody>tr');    
    for (let indexRow of changedRecords){
       trArr[indexRow].classList.add('edited'); 
    } 
    if (rowElement.Quantity /*&& rowElement.Rate*/ && (columnsCalc.includes(column))) {
        try {
            var whereClause = "AccountId ="+account.get().Id
                +" and ProductId = "+ rowElement.ProductId
                +" and Quantity = "+ rowElement.Quantity;
            BPConnection.AccountProductQuote.retrieveFilteredAsync(whereClause).single()
                .done(function (res){
                   // console.log('::::::::::::Rate:::::::::::');
                   // console.log(res);
                   // console.log('::::::::::::Rate END:::::::::::');
                    var rateDetails = $.parseXML(res.RateDetails);
                    rowElement.Rate = formatAmount($(rateDetails).find('RateDetailsRow > Rate').text());
                    //rowElement.RatedAmount = formatAmount($(rateDetails).find('RateDetailsRow > RatedAmount').text());
                    rowElement.TaxCost = formatAmount(res.TaxAmount);
                    if (rowElement.Rate && rowElement.Quantity) {
                        rowElement.Cost = formatAmount(rowElement.Quantity * rowElement.Rate);
                        rowElement.RateOverride = rowElement.Rate;
                        rowElement.CostOverride = rowElement.Cost;
                        rowElement.TotalCost = formatAmount(+rowElement.Cost + (Number.isNaN(+rowElement.TaxCost)?0:+rowElement.TaxCost));  
        				return;
                    }
                })
                .fail(function (fail){console.log(fail.message);
                    //alert(fail.message);
                });
        } catch (e) {
          //  alert('ERROR: '+e);
            console.log(e);
        }
    }
    //if user change cells manually
    if (rowElement.Rate && rowElement.Quantity) {
       rowElement.Cost = formatAmount(rowElement.Quantity * rowElement.Rate);
       rowElement.RateOverride = rowElement.Rate;
       rowElement.CostOverride = rowElement.Cost;
       rowElement.TotalCost = formatAmount(+rowElement.Cost + (Number.isNaN(+rowElement.TaxCost)?0:+rowElement.TaxCost));
    }
}
 
function addActivity(index) {
    window.onbeforeunload = function(){
  return 'Are you sure you want to leave? All Data will be loss.'};
    const activitiesData = lastactivities.get();
    const accountId = account.get().Id;
    const invoiceId = invoice.get().Id;
    activitiesData.addNew({}, index + 1); // next item
    lastactivities.get().createdelements.map(el=> {
        el.AccountId = accountId;
        el.InvoiceId = invoiceId;
        el.ActivityDate = parseDateTimeToUTC(invoiceDate.start);
      //  el.SubscriptionFromDate = parseDateTimeToUTC(invoiceDate.start);
      //  el.SubscriptionToDate = parseDateTimeToUTC(invoiceDate.end);
    });  
    window.BPActions.refreshState("activities");
}
   function delActivity(index){
        if (confirm('Do you really want do delete this product?')) {
        lastactivities.get().removeFromCollection(index); 
        lastactivities_copy.splice(index, 1);
    	window.BPActions.refreshState("activities");
    }
 }
       
/*function checkProductType(index,e){
    const productTypeColumnIndex = 8;
    let parentTr = null;
    let tdArr = null;
    let typeProduct = null;
 //try{
    parentTr = e.target.parentNode;
    tdArr = parentTr.childNodes;
        debugger;
    typeProduct = tdArr[productTypeColumnIndex].innerText;
   // }catch(ex){console.log(ex); return;}
    if (DISABLED_PRODUCTS.includes(String(typeProduct).toUpperCase())){
    for (let td_ of tdArr){
     td_.classList.add('disabled'); 
    } 
}}*/
        
 function checkProductType(index,e){   
	const productTypeColumnIndex = 8; 
    const trArr1 = document.querySelectorAll('#activities_tableId tbody tr');
	for (let tr of trArr1){
	const typeProduct = tr.childNodes[productTypeColumnIndex].innerText;
        console.log(typeProduct);
        if (DISABLED_PRODUCTS.includes(String(typeProduct).toUpperCase())){
        for(let i=1;i<tr.childNodes.length-1;i++){
    	tr.childNodes[i].classList.add('disabled');
    }
}}}
	
BPUI.afterRender = () => {//fix top&bottom menus width
let menus = document.querySelectorAll('.formButtons');
for (let menu of menus) menu.setAttribute('width','100%');
}
 
init();
