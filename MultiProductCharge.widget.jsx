<BPUI.Page>
 <BPUI.FormLayout submitAction={WIDGET_MODE === 'insert'?doSave:doUpdate} cancelAction={cancel}>
	<div className="main-div">
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
    {WIDGET_MODE === 'insert'?
    <div className="div-flex">
        <div className="div-flex-inner basis100">
            <BPUI.EmbeddedList  variable={activities} name="activities" width="100%"
                onCellBlur={calculateRate} onAdd={addActivity}>
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
    <div className="div-flex">
        <div className="div-flex-inner basis100">
            History data for Products:
            <BPUI.EmbeddedList canAdd={false} variable={lastactivities} name="activities" width="100%"
                onCellBlur={calculateRate}>
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
</div>
<div className="div-flex process-error hide">
<div className="div-flex-inner basis100 text-danger failed-msg">
<i className="fa fa-warning" aria-hidden="true"/> You can't Insert/Update Products on Invoice with status CLOSED or APPROVED.
</div>
</div>
 </BPUI.FormLayout>
</BPUI.Page>
___________________________________________________________________________________________________
.disabled {
  pointer-events: none
}

input[type="text"] {
  padding: 0 !important;
  margin: 0 !important;
  background: transparent !important;
}

.text-blue {
  color: #5cc3ff;
}

.return-btn {
  transform: translateY(20%) !important;
}

.footer-buttons {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.div-flex {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.basis50 {
  flex-basis: 50%;
}

.div-flex-inner {
  padding: 10px;
}

.basis100 {
  flex-basis: 100%;
}

.text-big {
  font-size: 150%;
}

.success-msg {
  padding: 6px;
  background: #aaff5c29;
}

.failed-msg {
  padding: 6px;
  background: #ff5c5c29;
}

.bg-semiblue {
  background: #dcf4fc;
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
const WIDGET_MODE = localStorage.MultiProductCharge_mode || localStorage.setItem('MultiProductCharge_mode','insert');
const accountId =  BPSystem.nodeKey; //1
const activityId =  BPSystem.nodeKey; //1
const formatDateUI = (val) => val?moment(val).format('MM/DD/YYYY'):val;
const formatDateDB = (val) => val?moment(val).format('YYYY-MM-DD'):moment(new Date()).format('YYYY-MM-DD');
const formatAmount = (amount) => amount?parseFloat(amount).toFixed(2):"0.00";

async function init() {
const res = await BPConnection.BrmAggregate.query("select a.AccountId, a.InvoiceId from Activity a where a.Id = "+activityId).single();    
const [res2,res3] = await Promise.all([//get data results in parallel
      BPConnection.BrmAggregate.query("select a.Id, a.Name from Account a where a.Id = "+res.AccountId).single(),
      BPConnection.Invoice.retrieveFiltered('Id='+res.InvoiceId).single()
    ]);
      window.lastactivities.set(BPConnection.Activity.retrieveFiltered('AccountId='+res2.Id+' AND InvoiceId='+res.InvoiceId).collection());
      accountInfo={Name:res2.Name, Id:res2.Id}; 
      invoiceDate = {start: formatDateUI(formatDateDB(res3.BillingCycleStartDate)), end: formatDateUI(formatDateDB(res3.BillingCycleEndDate))};
      document.querySelector('#account-info-name').innerHTML = res2.Name;  
      document.querySelector('#account-info-period').innerHTML = `${invoiceDate.start} - ${invoiceDate.end}`; 
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
    invoice.set(res3);
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
      //  window.location = "admin.jsp?name=BILLING_INVOICE&key=" + resultActivity[0].Id + "&mode=R"
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
		  //  window.location = "admin.jsp?name=BILLING_INVOICE&key=" + resultActivity[0].Id + "&mode=R"
		}else{
			document.querySelector('#msg-fail_').classList.remove('hide');
			console.error("Fail", resultActivity); 
		} 
	document.querySelector('#msg-info_').classList.add('hide');
}
 
function calculateRate(row, column, event, scope) {
    var activityCollection = WIDGET_MODE==='insert'? activities.get():lastactivities.get();
    var rowElement = activityCollection.elements[row];
    if ([1,2,3,4,6].includes(column) ) {
        if (column == 1 || column == 2) {
            if (rowElement.ProductId != null && rowElement.Quantity != null) {
                try {
                    var whereClause = "account_id =" + billingProfile.get().AccountId
                        + " and product_id =" + rowElement.ProductId
                        + " and quantity =" + rowElement.Quantity;
                    BPConnection.AccountProductQuote.retrieveFilteredAsync(whereClause).single()
                        .done(function (res) {
                            var rateDetails = $.parseXML(res.RateDetails);
                            rowElement.Rate = formatAmount($(rateDetails).find('RateDetailsRow > Rate').text());
                            rowElement.RatedAmount = formatAmount($(rateDetails).find('RateDetailsRow > RatedAmount').text());
                        })
                        .fail(function (fail) {
                            console.error(fail.message);
                        });
                } catch (e) {
                    console.error(e);
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
    activitiesData.forEach(el=> {
        el.AccountId = accountId;
        el.InvoiceId = invoiceId;
    });  
    window.BPActions.refreshState("activities");
}
