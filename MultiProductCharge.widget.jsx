<BPUI.Page>  
<BPUI.Divider Name="Account Info" style ={{width: 1000 + "px"}}>Account Name:<span className="text-blue"> {accountInfo.Name}</span> <br/><br/>Invoice period:  {invoiceDate.start} - {invoiceDate.end} <br/><br/></BPUI.Divider>
    <BPUI.FormLayout submitAction={saveInvoices} cancelAction={cancel}>
                <BPUI.Panel style ={{width: 900 + "px"}} className="formBody">
                <BPUI.PanelRow>
                    <BPUI.PanelRowColumn colSpan="4">
                        <BPUI.EmbeddedList variable={activities} name="activities" width="100%" onCellBlur={calculateRate} onAdd={addActivity} onDel={deleteCol}>
                            <BPUI.TableColumn name="ProductId" index="2" label="Product Name"/>
							<BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" index="1" displayTransform={formatDateUI} label="From Date" />
							<BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" index="1" displayTransform={formatDateUI} label="To Date" />
                            <BPUI.TableColumn name="Quantity" index="3" label="Quantity"/>
                            <BPUI.TableColumn name="Rate" index="4" label="Rate"/>
                            <BPUI.TableColumn className={"disabled"} name="RatedAmount" index="5" label="Cost"/>
							<BPUI.TableColumn name="Tax" index="6" label="Tax" />
							<BPUI.TableColumn className={"disabled"} name="TotalCost" index="7" label="Total Cost"/>
							<BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" index="8" displayTransform={formatDateUI} label="Activity Date" />
                        </BPUI.EmbeddedList>
                    </BPUI.PanelRowColumn>
                </BPUI.PanelRow>
                </BPUI.Panel>
                <BPUI.Panel>
                    <BPUI.PanelRow style ={{height: 20 + "px"}}>
                    <BPUI.PanelRowColumn />
                    </BPUI.PanelRow>
                </BPUI.Panel>
                <BPUI.Panel style ={{width: 900 + "px"}}>
                </BPUI.Panel>
    </BPUI.FormLayout>
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

___________________________________________________________________________________________________

window.billingProfile = new BPUI.ReferenceObject();
window.invoice = new BPUI.ReferenceObject();
window.account = new BPUI.ReferenceObject();
window.activities = new BPUI.ReferenceObject();//ReferenceObject test
window.activityEntity = new BPUI.ReferenceObject(BPConnection.Activity)

BPSystem.initialize();
let accountInfo = {};
let invoiceDate = {};
const accountId =  BPSystem.nodeKey; //1
const formatDateUI = (val) => val?moment(val).format('MM/DD/YYYY'):val;
const formatDateDB = (val) => val?moment(val).format('YYYY-MM-DD'):moment(new Date()).format('YYYY-MM-DD');
const formatAmount = (amount) => amount?parseFloat(amount).toFixed(2):"0.00";

// Initialize the Form Objects
function init() {
    activities.set(new BPConnection.BPCollection([{}], new Activity()));
    //default the activity dates to today
    activities.get().forEach(function (element, index, allArray) {
        element.ActivityDate = formatDateDB();
    });
    //Initialize the BillingProfile Object and fields
    try {
        accountInfo = BPConnection.Account.retrieveFiltered("Id=" + accountId).single();
        account.set(BPSystem.toBPObject({}, new Account()));
        account.get().Id = accountId;
        billingProfile.set(BPConnection.BillingProfile.retrieveFiltered("AccountId=" + accountId).single());
        invoice.set(new Invoice());
        invoice.get().BillingProfileId = billingProfile.get().Id;
    } catch (e) {
        console.error(e);
        billingProfile.set(new BillingProfile());
        invoice.set(new Invoice());
    }
    invoice.get().BillingCycleStartDate = formatDateDB();
    invoice.get().BillingCycleEndDate = formatDateDB();
    invoiceDate = {start: formatDateUI(formatDateDB()), end: formatDateUI(formatDateDB())};
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
const result = await BPConnection.Invoice.create(invoice.get());
    if (result[0].ErrorCode == "0") {
        var newActivities = activities.get().elements.map(el=>({
                InvoiceId: result[0].Id,
                AccountId: billingProfile.get().AccountId,
                ProductId: el.ProductId,
                ActivityDate: el.ActivityDate,
                Quantity: el.Quantity,
                RateOverride: el.Rate,
                CostOverride: el.RatedAmount
            }));
const resultActivity = await BPSystem.toBPCollection(newActivities, BPConnection.Activity).create(true);
    if (resultActivity){
        window.location = "admin.jsp?name=BILLING_INVOICE&key=" + resultActivity[0].Id + "&mode=R"
    }else{
        console.log("Fail", resultActivity); 
    } 
} else {
            showConfirmDialog(document.body, "Error value data " + result[0].ErrorText, function (delParam) { }, null)
        }
    }
/*
function doSave() {
    BPConnection.Invoice.create(invoice.get()).done(function (result) {
        console.log("Result", result);
        if (result[0].ErrorCode == "0") {
            var newActivities = activities.get().elements.map(function (el) {
                return {
                    InvoiceId: result[0].Id,
                    AccountId: billingProfile.get().AccountId,
                    ProductId: el.ProductId,
                    ActivityDate: el.ActivityDate,
                    Quantity: el.Quantity,
                    RateOverride: el.Rate,
                    CostOverride: el.RatedAmount
                };
            });
            //THis doesn't seem to work...
            BPSystem.toBPCollection(newActivities, BPConnection.Activity).create(true).done(function (resultActivity) {
                window.location = "admin.jsp?name=BILLING_INVOICE&key=" + result[0].Id + "&mode=R"
            }).fail(function (failError) {
                console.log("Fail", result);
            });
        } else {
            showConfirmDialog(document.body, "Error value data " + result[0].ErrorText, function (delParam) {
            }, null)
        }
    })
}*/

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
            rowElement.TotalCost = (+rowElement.RatedAmount + (Number.isNaN(+rowElement.Tax)?0:+rowElement.Tax)).toFixed(2);
            
        }
    }
}
 
const checkAccount = () =>(account && account.get() && account.get().Id);

function addActivity(index) {
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
    alert('do you wanna delete this record?')
    }
