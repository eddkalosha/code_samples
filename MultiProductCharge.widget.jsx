<BPUI.Page>
	<div className="main-div-page">
    <div className="div-flex   my-15">
        <div className="div-flex-inner basis50">
{/*
<BPUI.InputField key="01112" label="Account Name  " disabled variable={new BPUI.ReferenceObject('- Not found -')} /> 
<br /><br />
<BPUI.InputField key="01113"  label="Invoice period " disabled variable={new BPUI.ReferenceObject('- Not selected -')} /> */}
            <div className="text-big">
                Account Name: <span className="text-blue" id="account-info-name"> {accountInfo.Name} </span>
                <br /><br />
                Invoice period: <span className="text-blue" id="account-info-period"> {invoiceDate.start} -
                    {invoiceDate.end} </span>
            </div>
        </div>
    </div>
 <BPUI.FormLayout submitAction={WIDGET_MODE === 'insert'?doSave:doUpdate} cancelAction={cancel}>
    {WIDGET_MODE === 'insert'?
    <div className="div-flex main-div">
        <div className="div-flex-inner basis100">
            <BPUI.EmbeddedList  variable={activities} name="activities" width="100%"
                onCellBlur={calculateRate_} onAdd={addActivity}>
                <BPUI.TableColumn name="ProductId" index="2" label="Product Name" />
                <BPUI.TableColumn name="SubscriptionFromDate" type="DATE_SELECTOR" index="1"
                    displayTransform={formatDateUI} label="From Date" />
                <BPUI.TableColumn name="SubscriptionToDate" type="DATE_SELECTOR" index="1"
                    displayTransform={formatDateUI} label="To Date" />
                <BPUI.TableColumn name="Quantity" index="3" label="Quantity" />
                <BPUI.TableColumn name="Rate" index="4" label="Rate" />
                <BPUI.TableColumn className={"disabled"} name="RatedAmount" index="5" label="Cost" />
                <BPUI.TableColumn name="TaxCost" index="6" label="Tax" />
                <BPUI.TableColumn className={"disabled"} name="TotalCost" index="7" label="Total Cost" />
                <BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" index="8" displayTransform={formatDateUI}
                    label="Activity Date" />
            </BPUI.EmbeddedList>
        </div>
        <div className="div-flex-inner basis100">
            <div className="footer-buttons">
                <span id="msg-info" className="footer-buttons-label text-blue hide">Saving data in a progress... </span>
                <span id="msg-succ" className="footer-buttons-label text-success success-msg hide "><i
                        className="fa fa-check-circle"></i> Data was saved successfully!</span>
                <span id="msg-fail" className="footer-buttons-label text-danger failed-msg hide "><i
                        className="fa fa-warning"></i> Error occurred while data saving!</span>
            </div>
        </div>
    </div>
    :null}
    {WIDGET_MODE === 'update'?
    <div className="div-flex main-div">
        <div className="div-flex-inner basis100">
            <BPUI.EmbeddedList canAdd={false} variable={lastactivities} name="activities" width="100%"
                onCellBlur={calculateRate_}>
                <BPUI.TableColumn className={"disabled"} name="ProductId" index="2" label="Product Name" />
                <BPUI.TableColumn name="SubscriptionFromDate" type="DATE_SELECTOR" index="1"
                    displayTransform={formatDateUI} label="From Date" />
                <BPUI.TableColumn name="SubscriptionToDate" type="DATE_SELECTOR" index="1"
                    displayTransform={formatDateUI} label="To Date" />
                <BPUI.TableColumn name="Quantity" index="3" label="Quantity" />
                <BPUI.TableColumn name="Rate" index="4" label="Rate" />
                <BPUI.TableColumn className={"disabled"} name="RatedAmount" index="5" label="Cost" />
                <BPUI.TableColumn name="TaxCost" index="6" label="Tax" />
                <BPUI.TableColumn className={"disabled"} name="TotalCost" index="7" label="Total Cost" />
                <BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" index="8" displayTransform={formatDateUI}
                    label="Activity Date" />
            </BPUI.EmbeddedList>
        </div>
        <div className="div-flex-inner basis100">
            <div className="footer-buttons">
                <span id="msg-info_" className="footer-buttons-label text-blue hide">Updating data in a progress...
                </span>
                <span id="msg-succ_" className="footer-buttons-label text-success success-msg hide "><i
                        className="fa fa-check-circle"></i> Data was saved successfully!</span>
                <span id="msg-fail_" className="footer-buttons-label text-danger failed-msg hide "><i
                        className="fa fa-warning"></i> Error occurred while data saving!</span>
            </div>
        </div>
    </div>
    :null}
<div className="div-flex process-error hide">
<div className="div-flex-inner basis100 text-danger failed-msg">
<i className="fa fa-warning" aria-hidden="true"/> You can't Insert/Update Products on Invoice with status CLOSED or APPROVED.
</div> 
</div>
</BPUI.FormLayout>
</div>
</BPUI.Page>
___________________________________________________________________________________________________
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
padding: 10px;
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
___________________________________________________________________________________________________
BPSystem.initialize();
window.billingProfile = new BPUI.ReferenceObject();
window.invoice = new BPUI.ReferenceObject();
window.account = new BPUI.ReferenceObject();
window.activities = new BPUI.ReferenceObject();//ReferenceObject test
window.lastactivities = new BPUI.ReferenceObject();
window.accountInfo = {Name:'- Not found -'};
window.invoiceDate = {start:'- Not selected '};
window.INVOICE_STATUS = null;
const WIDGET_MODE = localStorage.MultiProductCharge_mode || localStorage.setItem('MultiProductCharge_mode','insert');
const accountId =  BPSystem.nodeKey; //1
const activityId =  BPSystem.nodeKey; //1
const formatDateUI = (val) => val?moment(val).format('MM/DD/YYYY'):val;
const formatDateDB = (val) => val?moment(val).format('YYYY-MM-DD'):moment(new Date()).format('YYYY-MM-DD');
const formatAmount = (amount) => amount?parseFloat(amount).toFixed(2):"0.00";

async function init() {
const invoiceId_ = 414103;//await BPSystem.getSelectedEntityAsync("BILLING_INVOICE");
const invoice_ = await BPConnection.Invoice.retrieveFilteredAsync('Id='+invoiceId_).single();
const billingProfile_ = await BPConnection.BillingProfile.retrieveFilteredAsync('Id='+invoice_.BillingProfileId).single();
const account_ = await BPConnection.Account.retrieveFilteredAsync('Id='+billingProfile_.AccountId).single()
accountInfo = {Name:account_.Name, Id:account_.Id};
INVOICE_STATUS = invoice_.Status;
invoiceDate = {
    start: formatDateUI(formatDateDB(invoice_.BillingCycleStartDate)), 
    end: formatDateUI(formatDateDB(invoice_.BillingCycleEndDate))
};
document.querySelector('#account-info-name').innerHTML = account_.Name;  
document.querySelector('#account-info-period').innerHTML = `${invoiceDate.start} - ${invoiceDate.end}`;
if (!(INVOICE_STATUS=='OPEN' || INVOICE_STATUS=='CURRENT')){
       document.querySelector('.process-error').classList.remove('hide');
       document.querySelector('.main-div').classList.add('disabled-grayfilter');
       const submitBtns = document.querySelectorAll('.main-div-page a[name="submitForm"]');
       for (let btn of submitBtns) btn.classList.add('hide'); 
}
WIDGET_MODE==='update' ? 
window.lastactivities.set(BPConnection.ACTIVITY.query('SELECT Id,ProductId,SubscriptionFromDate,SubscriptionToDate,Quantity,Rate,RatedAmount,TaxCost,TotalCost,ActivityDate from Activity WHERE  AccountId='+account_.Id+' AND InvoiceId='+invoice_.Id+' ORDER BY Updated DESC').collection()):null;

    //init new activity by default
    activities.set(new BPConnection.BPCollection([{}], new Activity()));
    //default the activity dates to today
    activities.get().forEach(function (element, index, allArray) {
        element.ActivityDate = formatDateDB(invoiceDate.start);
        element.SubscriptionFromDate = formatDateDB(invoiceDate.start);
        element.SubscriptionToDate = formatDateDB(invoiceDate.end);
    });
    //init account and billing profile of account
    account.set(BPSystem.toBPObject({}, new Account()));
    account.get().Id = accountInfo.Id;
    billingProfile.set(BPConnection.BillingProfile.retrieveFiltered("AccountId=" + accountInfo.Id).single());
    //init selected invoice
    invoice.set(invoice_);
}

init();

function cancel() {
	window.add_attr_submit('SET_FORM_VIEW', 'form_type_in', 'FL')
}

const doSave = async()=> {
document.querySelector('#msg-info').classList.remove('hide');
document.querySelector('#msg-fail').classList.add('hide');
document.querySelector('#msg-succ').classList.add('hide');
const newActivities = activities.get().elements.map(el=>({
                InvoiceId: invoice.get().Id,
                AccountId: accountInfo.Id,
                ProductId: el.ProductId,
                ActivityDate: el.ActivityDate,
                SubscriptionFromDate:el.SubscriptionFromDate,
                SubscriptionToDate:el.SubscriptionToDate,
                Quantity: el.Quantity,
                RateOverride: el.Rate,
                CostOverride: el.RatedAmount,
    			TaxCost:el.TaxCost,
    			TotalCost:el.TotalCost
            }));
const resultActivity = await BPSystem.toBPCollection(newActivities, BPConnection.Activity).create(true);
    if (resultActivity[0].ErrorCode == "0"){
        window.onbeforeunload = true;
        document.querySelector('#msg-succ').classList.remove('hide');
       // window.location = "admin.jsp?name=BILLING_INVOICE_DETAIL_NEW&key=" + resultActivity[0].Id + "&mode=L";
    }else{
        document.querySelector('#msg-fail').classList.remove('hide');
        console.error("Fail", resultActivity); 
    } 
	document.querySelector('#msg-info').classList.add('hide');
}
    
const doUpdate = async () => {
	document.querySelector('#msg-info_').classList.remove('hide');
	document.querySelector('#msg-fail_').classList.add('hide');
	document.querySelector('#msg-succ_').classList.add('hide');
	const resultActivity = await lastactivities.get().update();
		if (resultActivity[0].ErrorCode == "0"){
			window.onbeforeunload = true;
			document.querySelector('#msg-succ_').classList.remove('hide');
		   // window.location = "admin.jsp?name=BILLING_INVOICE_DETAIL_NEW&key=" + resultActivity[0].Id + "&mode=L";
		}else{
			document.querySelector('#msg-fail_').classList.remove('hide');
			console.error("Fail", resultActivity); 
		} 
	document.querySelector('#msg-info_').classList.add('hide');
}
    
function calculateRate_(row, column, event, scope) {
	let activityCollection = WIDGET_MODE==='insert'? activities.get():lastactivities.get();
    const columnsCalc = [3,4,6];
    let rowElement = activityCollection.elements[row];
    if (rowElement.Quantity && rowElement.Rate   && (columnsCalc.includes(column))) {
            rowElement.RatedAmount = (rowElement.Rate * rowElement.Quantity);
    		rowElement.RateOverride = rowElement.RatedAmount;
            rowElement.TotalCost = (+rowElement.RatedAmount + (Number.isNaN(+rowElement.TaxCost)?0:+rowElement.TaxCost));
    console.log(rowElement);
        }
}
 
const checkAccount = () =>(account && account.get() && account.get().Id);

function addActivity(index) {
    window.onbeforeunload = function(){
  return 'Are you sure you want to leave? All Data will be loss.'};
    const activitiesData = activities.get();
    const accountId = account.get().Id;
    const invoiceId = invoice.get().Id;
    activitiesData.addNew({}, index + 1); // next item
    activitiesData.forEach(el=> {
        el.AccountId = accountId;
        el.InvoiceId = invoiceId;
    });  
    window.BPActions.refreshState("activities");
}
BPUI.afterRender = () => {
//fix top&bottom menus width
let menus = document.querySelectorAll('.formButtons');
for (let menu of menus) menu.setAttribute('width','100%');
}
