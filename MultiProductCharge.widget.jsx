<BPUI.Page> 
<div className="div-flex">
<div className="div-flex-inner basis50">
<div className="text-big">
Account Name: <span className="text-blue" id="account-info-name"> {accountInfo.Name} </span> <br/><br/>
Invoice period: <span className="text-blue" id="account-info-period">   {invoiceDate.start} - {invoiceDate.end} </span>
</div>
</div>
<div className="div-flex-inner basis50">
	<button className="btn btn-lg btn-block" onClick={addActivity}> New Product</button>
</div>
<div className="div-flex-inner basis100">
<BPUI.EmbeddedList canAdd={false} variable={activities} name="activities" width="100%" onCellBlur={calculateRate}   onAdd={addActivity} onDel={deleteCol}>
                            <BPUI.TableColumn name="ProductId" index="2" label="Product Name"/>
							<BPUI.TableColumn name="SubscriptionFromDate" type="DATE_SELECTOR" index="1" displayTransform={formatDateUI} label="From Date" />
							<BPUI.TableColumn name="SubscriptionToDate" type="DATE_SELECTOR" index="1" displayTransform={formatDateUI} label="To Date" />
                            <BPUI.TableColumn name="Quantity" index="3" label="Quantity"/>
                            <BPUI.TableColumn name="Rate" index="4" label="Rate"/>
                            <BPUI.TableColumn className={"disabled"} name="RatedAmount" index="5" label="Cost"/>
							<BPUI.TableColumn name="TaxCost" index="6" label="Tax" />
							<BPUI.TableColumn className={"disabled"} name="TotalCost" index="7" label="Total Cost"/>
							<BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" index="8" displayTransform={formatDateUI} label="Activity Date" />
                        </BPUI.EmbeddedList>
</div>
<div className="div-flex-inner basis100">
<div className="footer-buttons">
<span id="msg-info" className="footer-buttons-label text-blue hide">Saving data in a progress... </span>
<span id="msg-succ" className="footer-buttons-label text-success success-msg hide "><i className="fa fa-check-circle"></i> Data was saved successfully!</span>
<span id="msg-fail" className="footer-buttons-label text-danger failed-msg hide "><i className="fa fa-check-circle"></i> Error occurred while data saving!</span>
<button onClick={doSave}> Save Product (-s)</button>
</div>
</div>

<div className="div-flex-inner basis100">
History data for Products: 
<BPUI.EmbeddedList canAdd={false} variable={lastactivities} name="activities" width="100%" onCellBlur={calculateRate}>
                            <BPUI.TableColumn className={"disabled"} name="ProductId" index="2" label="Product Name"/>
							<BPUI.TableColumn name="SubscriptionFromDate" type="DATE_SELECTOR" index="1" displayTransform={formatDateUI} label="From Date" />
							<BPUI.TableColumn name="SubscriptionToDate" type="DATE_SELECTOR" index="1" displayTransform={formatDateUI} label="To Date" />
                            <BPUI.TableColumn name="Quantity" index="3" label="Quantity"/>
                            <BPUI.TableColumn name="Rate" index="4" label="Rate"/>
                            <BPUI.TableColumn className={"disabled"} name="RatedAmount" index="5" label="Cost"/>
							<BPUI.TableColumn name="TaxCost" index="6" label="Tax" />
							<BPUI.TableColumn className={"disabled"} name="TotalCost" index="7" label="Total Cost"/>
							<BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" index="8" displayTransform={formatDateUI} label="Activity Date" />
</BPUI.EmbeddedList>
</div>
<div className="div-flex-inner basis100">
<div className="footer-buttons">
<span id="msg-info_" className="footer-buttons-label text-blue hide">Saving data in a progress... </span>
<span id="msg-succ_" className="footer-buttons-label text-success success-msg hide "><i className="fa fa-check-circle"></i> Data was saved successfully!</span>
<span id="msg-fail_" className="footer-buttons-label text-danger failed-msg hide "><i className="fa fa-check-circle"></i> Error occurred while data saving!</span>
<button> Update Product (-s)</button>
</div>
</div>
</div>
</BPUI.Page>
___________________________________________________________________________________________________
.disabled{pointer-events:none}

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
    justify-content: flex-end;
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
___________________________________________________________________________________________________
window.billingProfile = new BPUI.ReferenceObject();
window.invoice = new BPUI.ReferenceObject();
window.account = new BPUI.ReferenceObject();
window.activities = new BPUI.ReferenceObject();//ReferenceObject test
window.lastactivities = new BPUI.ReferenceObject();


BPSystem.initialize();
window.accountInfo = {Name:'- Not found -'};
window.invoiceDate = {start:'- Not selected '};
const accountId =  BPSystem.nodeKey; //1
const activityId =  BPSystem.nodeKey; //1
const formatDateUI = (val) => val?moment(val).format('MM/DD/YYYY'):val;
const formatDateDB = (val) => val?moment(val).format('YYYY-MM-DD'):moment(new Date()).format('YYYY-MM-DD');
const formatAmount = (amount) => amount?parseFloat(amount).toFixed(2):"0.00";
const UserBlock = React.createClass({
    render() {
       const {invoiceDate,accountInfo} = this.props;
      return ( <div>Account Name:<span className="text-blue" id="account-info-name"> {accountInfo.Name} </span> 
                <br/><br/><span className="text-blue" id="account-info-period">{invoiceDate.start} - {invoiceDate.end} </span> <br/><br/>
                </div>)
          }});
// Initialize the Form Objects
async function init() {
    
 
const res = await BPConnection.BrmAggregate.query("select a.AccountId, a.InvoiceId from Activity a where a.Id = "+activityId).single();
    console.log(res);
    //get results in parallel
const [res2,res3] = await Promise.all([
      BPConnection.BrmAggregate.query("select a.Id, a.Name from Account a where a.Id = "+res.AccountId).single(),
      BPConnection.BrmAggregate.query("select a.Id, a.BillingCycleStartDate,a.BillingCycleEndDate from Invoice a where a.Id = "+res.InvoiceId).single()]);
    console.log(res2,res3);
window.lastactivities.set(BPConnection.Activity.retrieveFiltered('AccountId='+res2.Id).collection());
///
accountInfo={Name:res2.Name, Id:res2.Id}; 
invoiceDate = {start: formatDateUI(formatDateDB(res3.BillingCycleStartDate)), end: formatDateUI(formatDateDB(res3.BillingCycleEndDate))};
document.querySelector('#account-info-name').innerHTML = res2.Name;  
document.querySelector('#account-info-period').innerHTML = `${invoiceDate.start} - ${invoiceDate.end}`; 
    
    activities.set(new BPConnection.BPCollection([{}], new Activity()));
    //default the activity dates to today
    activities.get().forEach(function (element, index, allArray) {
        element.ActivityDate = formatDateDB(invoiceDate.start);
        element.SubscriptionFromDate = formatDateDB(invoiceDate.start);
        element.SubscriptionToDate = formatDateDB(invoiceDate.end);
    });
    //Initialize the BillingProfile Object and fields
    try {
        account.set(BPSystem.toBPObject({}, new Account()));
        account.get().Id = accountInfo.Id;
        billingProfile.set(BPConnection.BillingProfile.retrieveFiltered("AccountId=" + accountInfo.Id).single());
        invoice.set(new Invoice());
        invoice.get().BillingProfileId = billingProfile.get().Id;
    } catch (e) {
        console.error(e);
        billingProfile.set(new BillingProfile());
        invoice.set(new Invoice());
    }
    invoice.get().BillingCycleStartDate = formatDateDB();
    invoice.get().BillingCycleEndDate = formatDateDB();
    invoice.get().ManualCloseApprovedFlag = "0"
}

init();

function cancel() {
    if (BPSystem.nodeName == 'ACCOUNT')
        recordId = BPSystem.getSelectedEntityId("Account");
    else
        BPSystem.getSelectedEntityId("Invoice");
    BPSystem.cancel();
}

const doSave = async()=> {
document.querySelector('#msg-info').classList.remove('hide');
const result = await BPConnection.Invoice.create(invoice.get());
    if (result[0].ErrorCode == "0") {
        var newActivities = activities.get().elements.map(el=>({
                InvoiceId: result[0].Id,
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
            console.log(newActivities);
const resultActivity = await BPSystem.toBPCollection(newActivities, BPConnection.Activity).create(true);
    if (resultActivity){
        console.log(resultActivity)
             window.onbeforeunload = true;
        document.querySelector('#msg-succ').classList.remove('hide');
      //  window.location = "admin.jsp?name=BILLING_INVOICE&key=" + resultActivity[0].Id + "&mode=R"
    }else{
        document.querySelector('#msg-fail').classList.remove('hide');
        console.log("Fail", resultActivity); 
    } 
} else {
            showConfirmDialog(document.body, "Error value data " + result[0].ErrorText, function (delParam) { }, null)
        }

document.querySelector('#msg-info').classList.add('hide');
    }
 
function saveInvoices() {
    invoice.get().ManualCloseApprovedFlag = "0";
    doSave();
}

function saveAndSendInvoices() {
    invoice.get().ManualCloseApprovedFlag = "1";
    doSave();
}
 

function calculateRate(row, column, event, scope) {
    var activityCollection = activities.get();
    var rowElement = activityCollection.elements[row];
    console.log("CALCULATE RATE ", column, row, event, scope);
    if ([1,2,3,4,6].includes(column) ) {
        if (column == 1 || column == 2) {
            console.log("CALCULATE RATE from product", rowElement, rowElement.ProductId, rowElement.ActivityDate);
            if (rowElement.ProductId != null && rowElement.Quantity != null) {
                try {
                    var whereClause = "account_id =" + billingProfile.get().AccountId
                        + " and product_id =" + rowElement.ProductId
                        + " and quantity =" + rowElement.Quantity;
                    BPConnection.AccountProductQuote.retrieveFilteredAsync(whereClause).single()
                        .done(function (res) {
                            console.log('::::::::::::Rate:::::::::::');
                            console.log(res);
                            console.log('::::::::::::Rate END:::::::::::');
                            var rateDetails = $.parseXML(res.RateDetails);
                            rowElement.Rate = formatAmount($(rateDetails).find('RateDetailsRow > Rate').text());
                            rowElement.RatedAmount = formatAmount($(rateDetails).find('RateDetailsRow > RatedAmount').text());
                        })
                        .fail(function (fail) {
                            console.log(fail.message);
                            alert(fail.message);
                        });
                } catch (e) {
                    alert('ERROR: ' + e);
                    console.log(e);
                }
            }
        }
        else if (rowElement.Quantity && rowElement.Rate   && ([3,4,6].includes(column))) {
            rowElement.RatedAmount = (rowElement.Rate * rowElement.Quantity).toFixed(2);
            rowElement.TotalCost = (+rowElement.RatedAmount + (Number.isNaN(+rowElement.TaxCost)?0:+rowElement.TaxCost)).toFixed(2);     
        }
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
    activitiesData.forEach( el=> {
        el.AccountId = accountId;
        el.InvoiceId = invoiceId;
    });
       
    window.BPActions.refreshState("activities");
}

BPUI.afterRender = () => {
    checkAccount();
};

const productIdUpdate = id => {
   // alert(id);
}
        
const deleteCol = () =>{
return
}
