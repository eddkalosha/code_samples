<BPUI.Page>
    <BPUI.FormLayout submitAction={saveInvoices} cancelAction={cancel}>
        {/*
        * CUSTOM AD-HOC INVOICE FORM
        *
        *
        */}
        {/*
        * Account and email Recipient data.
        * Loading the Account will retrieve the default email address from the Billing PRofile
        */}
        <BPUI.Divider Name="Account Info" style ={{width: 1000 + "px"}}>Account and Delivery Info</BPUI.Divider>
        <BPUI.Panel style ={{width: 900 + "px"}}>
        <BPUI.Message name="invoice" variables={invoice}/>
            <BPUI.InputField variable={billingProfile}  field="AccountId" type="LOOKUP" label="Billing Name" onUpdate={accountIdUpdate}/>
                <BPUI.OutputField name="AccountStatus" field="Status" variable={account} label="Account Status"/>
                <BPUI.OutputField name="InvoiceStatus" field="Status" variable={invoice} label="Invoice Status"/>
                <BPUI.OutputField name="ApprovalStatus" field="ApprovalStatus" variable={invoice} label="Approval Status"/>
                <BPUI.InputField name="Email" variable={billingProfile}  field="Email"/>
                <BPUI.InputField variable={invoice}  field="BillingCycleStartDate"/>
                <BPUI.InputField variable={invoice}  field="BillingCycleEndDate"/>
                {canClose()
                ? <BPUI.InputField name="ManualCloseApprovedFlag" variable={invoice} field="ManualCloseApprovedFlag" label="Close this Invoice" type="CHECKBOX" style={{display: canClose() ? '': 'hidden'}}/>
                : <div/>}
                {canApprove()
                ? <BPUI.InputField name="ApproveInvoice" variable={approveInvoice} label="Approve this Invoice" type="CHECKBOX" style={{display: canApprove() ? '': 'hidden'}}/>
                : <div/>}
                </BPUI.Panel>

                {/* Spacer Row */}
                <BPUI.Panel style ={{width: 900 + "px"}}>
                <BPUI.PanelRow style ={{height: 30 + "px"}}>
                <BPUI.PanelRowColumn />
                </BPUI.PanelRow>
                </BPUI.Panel>

                <BPUI.Panel style ={{width: 900 + "px"}}>
                <BPUI.PanelRow style ={{height: 30 + "px"}}>
                <BPUI.PanelRowColumn />
                </BPUI.PanelRow>
                </BPUI.Panel>

                {/*
                * Invoice LIne Items (AKA Activity)
                * Initialized on the javascript controller with 3 empty lines initially
                */}
                <BPUI.Divider Name="ActivityDiv">Invoice Line Items</BPUI.Divider>

                <BPUI.Panel style ={{width: 900 + "px"}}>
                <BPUI.PanelRow>
                    <BPUI.PanelRowColumn className="col-sm-11" colSpan="4">

                        <BPUI.EmbeddedList variable={activities} name="activities" width="100%" onCellBlur={calculateRate} onAdd={addActivity}>
                            <BPUI.TableColumn name="ActivityDate" type="DATE_SELECTOR" displayTransform={formatDate} index="1" label="Service Date" />
                            <BPUI.TableColumn name="ProductId" index="2" label="Product"/>
                            <BPUI.TableColumn name="Quantity" index="3" label="Quantity"/>
                            <BPUI.TableColumn name="Rate" index="4" label="Rate"/>
                            <BPUI.TableColumn name="RatedAmount" index="5" label="Amount" editable="false"/>
                        </BPUI.EmbeddedList>

                    </BPUI.PanelRowColumn>
                </BPUI.PanelRow>
                </BPUI.Panel>

               

                {/*
                * Action Buttons
                * - Add Rows in bulk. Adds 5 new Invoice Line Item (Activity) rows
                * - Clear Rows: Clears the contents of all Invoice Line Items
                * - Save: Saves the invoice with approval pending. Redirects user to the new Invoice in Record Mode.
                * - Save & Send: Saves the invoice with and Approves (sends if email is the delivery option on the BillingProfile)
                * - Cancel: Returns to the original Node with the Key in context.
                */}
                <BPUI.Panel  style ={{width: 900 + "px"}}>
			<BPUI.PanelRow style ={{height: 20 + "px"}}>  
 				<BPUI.PanelRowColumn className="col-sm-11 text-right">
				<BPUI.Button name="add" title="Add"  onClick={addLine}/>
                        <BPUI.Button name="remove" title="Remove"  onClick={removeLine}/>
                        <BPUI.Button name="clear" title="Clear" onClick={clearLines}/>
 				</BPUI.PanelRowColumn >
 			</BPUI.PanelRow>
                </BPUI.Panel>

                {/* Spacer Row */}
                <BPUI.Panel>
                    <BPUI.PanelRow style ={{height: 20 + "px"}}>
                    <BPUI.PanelRowColumn />
                    </BPUI.PanelRow>
                </BPUI.Panel>
    </BPUI.FormLayout>
</BPUI.Page>

_____________________________________________________________________________________________________________________

.body {}

.formButtons.topBar .col-sm-7{
    display: flex;
    align-items: center;
}

.formButtons.topBar .return-btn{
    transform: translateY(0%) !important;
}
.embedded-list td {
padding:0}
.embedded-list td span,
.embedded-list td input,
.embedded-list td div{
    height: 36px;
    padding: 10px;
    border: none;
    background: transparent;
    outline: none;
    width: 100%;
    line-height: 1.2em;
    font-size: 13px;
}
 

  .embedded-list td  .icon-close.textbox-clear {
        width: initial;
    top: 50%;
    right: 38px;
    padding: 0;
    font-size: initial;
    height: initial;
    /* top: 50%; */
    transform: translateY(-50%);
    }

.embedded-list td .input-group .input-group-btn {
    line-height: 29px;
    width: initial;
    padding: 0;
    height: initial;
    font-size: initial;
}

.embedded-list td .lookup{
padding:0 !important;
}
.embedded-list td .lookup input[type="text"]{
    background: initial;
    padding:0 !important;
}

_____________________________________________________________________________________________________________________
BPActions = BPActions || window.BPActions;
//BPConnection.Activity.query for metadata 
// BPConnection.AccountProductQuote.query
//Using the Window Objects enables the ability to debug using the Javascript Console
//
//window.BPSystem.bpRestApiUrl = "http://127.0.0.1:8081/rest/2.0";

window.invoice = new BPUI.ReferenceObject();
window.billingProfile = new BPUI.ReferenceObject();
window.account = new BPUI.ReferenceObject();
window.activities = new BPUI.ReferenceObject();
window.approveInvoice = new BPUI.ReferenceObject(false);
//
//Initialize the BP connection and session for database access
//
BPSystem.initialize();

function formatAmount(amount) {
    if (amount) {
        return parseFloat(amount).toFixed(2);
    } else {
        return "0.00";
    }
}

function canClose() {
    return (invoice.get() && invoice.get().Status !== 'CLOSED');
}

function canApprove() {
    return (invoice.get() && invoice.get().Status === 'CLOSED' && invoice.get().ApprovalStatus !== 'APPROVED');
}

//
// Initialize the Form Objects
//
function init() {
     var invoiceId =  BPSystem.nodeKey;

    //var invoiceId = BPSystem.getSelectedEntityId("INVOICE");
    try {
        var rows = findPageDataSync(invoiceId).elements;
        if (rows.length) {
            invoice.set(BPSystem.toBPObject({
                Id: rows[0].InvoiceId,
                BillingProfileId: rows[0].BillingProfileId,
                BillingCycleStartDate: rows[0].BillingCycleStartDate,
                BillingCycleEndDate: rows[0].BillingCycleEndDate,
                Status: rows[0].InvoiceStatus,
                ApprovalStatus: rows[0].ApprovalStatus
            }, new Invoice()));
            billingProfile.set(BPSystem.toBPObject({
                Id: rows[0].BillingProfileId,
                AccountId: rows[0].AccountId,
                Email: rows[0].Email
            }, new BillingProfile()));
            account.set(BPSystem.toBPObject({
                Id: rows[0].AccountId,
                Name: rows[0].Name,
                Status: rows[0].AccountStatus
            }, new Account()));
            activities.set(BPSystem.toBPCollection(rows.map(function(row) {
                return {
                    Id: row.ActivityId,
                    ProductId: row.ProductId,
                    SubscriptionFromDate: row.SubscriptionFromDate,
                    SubscriptionToDate: row.SubscriptionToDate,
                    ActivityDate: row.ActivityDate,
                    RatedAmount: formatAmount(row.RatedAmount),
                    Quantity: row.Quantity,
                    Rate: formatAmount(row.Rate),
                    RateOverride: formatAmount(row.RateOverride),
                    CostOverride: formatAmount(row.CostOverride)
                };
            }), new Activity()));
        }
    } catch (e) {
        console.error(e);
        BPActions.handleError(e, invoice);
    }
};

//
//recalculate rates when products or quantities change
//
function calculateRate(row,column,event,scope) {
    var activityCollection = activities.get();
    var rowElement = activityCollection.elements[row];
    console.log("CALCULATE RATE ",column,row,event,scope);
    if (column==1||column==2||column==3) {
        if (column == 1||column==2) {
            console.log("CALCULATE RATE from product", rowElement, rowElement.ProductId, rowElement.ActivityDate);
            if(rowElement.ProductId != null && rowElement.Quantity != null)
            {
                try {
                    /*BPConnection.Pricing.query("select ProductObj.Name,Rate,EffectiveDate,EndDate,CurrencyCodeObj.Id,UpperBand, CurrencyCodeObj.CurrencySign
                     from PRICING
                     where systimestamp BETWEEN EffectiveDate and EndDate  and ProductObj.Id=" + rowElement.ProductId).collection().done(function (res) {
                     rowElement.RateOverride = res.elements[0].Rate;
                     });*/
                    var whereClause = "AccountId ="+account.get().Id
                        +" and ProductId ="+ rowElement.ProductId
                        +" and Quantity ="+ rowElement.Quantity;
                    //alert(whereClause);
                    BPConnection.AccountProductQuote.retrieveFilteredAsync(whereClause).single()
                        .done(function (res){
                            console.log('::::::::::::Rate:::::::::::');
                            console.log(res);
                            console.log('::::::::::::Rate END:::::::::::');
                            var rateDetails = $.parseXML(res.RateDetails);
                            rowElement.Rate = formatAmount($(rateDetails).find('RateDetailsRow > Rate').text());
                            //alert('::::> '+ res.Rate);
                            rowElement.RatedAmount = formatAmount($(rateDetails).find('RateDetailsRow > RatedAmount').text());
                            if (column === 3 || rowElement.RateOverride) {
                                rowElement.RateOverride = rowElement.Rate;
                                rowElement.CostOverride = rowElement.RatedAmount;
                            }
                        })
                        .fail(function (fail){console.log(fail.message);
                            alert(fail.message);
                        });
                } catch (e) {
                    alert('ERROR: '+e);
                    console.log(e);
                }
            }
        }
        else if (rowElement.Quantity&&rowElement.Rate &&column==3 ) {
            rowElement.RatedAmount = (rowElement.Rate*rowElement.Quantity).toFixed(2);
        }

        if (rowElement.Id) {
            if (!activityCollection.updatedelements.filter(function(el) {return el.Id === rowElement.Id;}).length) {
                activityCollection.updatedelements.push(rowElement);
            }
        }
    }
}

function cancel()
{
    BPSystem.cancel();
}

function addLine() {
    addActivity(activities.get().elements.length - 1);
};

function removeLine() {
    activities.get().removeFromCollection(activities.get().elements.length - 1);
    BPActions.refreshState("activities");
};

function clearLines() {
    var coll = activities.get();
    for (var idx = coll.elements.length; idx; --idx) {
        coll.removeFromCollection(0);
    }
    BPActions.refreshState("activities");
};

function addActivity(index)
{
    activities.get().addNew({}, index + 1); // next item
    activities.get().forEach(function(el) {
        el.AccountId = account.get().Id;
        el.InvoiceId = invoice.get().Id;
    });
    BPActions.refreshState("activities");
}


function saveInvoices()
{
    if (!invoice.get().ManualCloseApprovedFlag) {
        $('*').css('cursor', 'wait');
        BPActions.clearError();
        activities.get().forEach(function(el) {
            el.ActivityDate = prepareDate(el.ActivityDate);
        });
        applyActions(getSaveActions());
    } else {
        saveAndSendInvoices();
    }
};

function saveAndSendInvoices() {
    $('*').css('cursor', 'wait');
    BPActions.clearError();
    activities.get().forEach(function(el) {
        el.ActivityDate = prepareDate(el.ActivityDate);
    });
    // at first we are updating all data
    var actions = ('CLOSED' == invoice.get().Status ? [] : getSaveActions());
    actions.push(function() {
        // after update we are closing invoice
        var status = 'CLOSED',
            approvalStatus = invoice.get().ApprovalStatus;

        debugger;
        if (approveInvoice.getValue()) {
            approvalStatus = 'APPROVED';
        }
        return BPConnection.Invoice.update({
            Id: invoice.get().Id,
            Status: status,
            ApprovalStatus: approvalStatus
        });
    });
    //actions.push(function() {
    // after closing invoice we can approve it
    // but it must be different transaction
    //	invoice.get().ApprovalStatus = 'APPROVED';
    //	return BPConnection.Invoice.update(invoice.get());
    //});
    applyActions(actions);
};

function accountIdUpdate() {
    //On select billingprofile id. Retrieve account to set it in invoices
    BPConnection.BillingProfile.retrieveFilteredAsync("AccountId=" + account.get().Id).single().done(function (result) {
        window.billingProfile.set(result);
    });
};

function getSaveActions() {
    var actions = [];
    actions.push(function() {
        return BPConnection.BillingProfile.update(billingProfile.get());
    });

    actions.push(function() {
        var entity = invoice.get();
        if (approveInvoice.getValue()) {
            entity.ApprovalStatus = 'APPROVED';
        }
        return BPConnection.Invoice.update(entity);
    });
    if (hasAttachment("Attachment1")) {
        actions.push(function() {
            return BPActions.uploadFile("[data-name=Attachment1] [type=file]", "INVOICE", "Attachment1", invoice.get().Id);
        });
    }
    if (hasAttachment("Attachment2")) {
        actions.push(function() {
            return BPActions.uploadFile("[data-name=Attachment2] [type=file]", "INVOICE", "Attachment2", invoice.get().Id);
        });
    }
    if (hasAttachment("Attachment3")) {
        actions.push(function() {
            return BPActions.uploadFile("[data-name=Attachment3] [type=file]", "INVOICE", "Attachment3", invoice.get().Id);
        });
    }
    if (activities.get().deletedelements.length) {
        actions.push(function() {
            return activities.get().remove();
        });
    }
    if (activities.get().createdelements.length) {
        actions.push(function() {
            return activities.get().create();
        });
    }
    if (activities.get().updatedelements.length) {
        actions.push(function() {
            return activities.get().update();
        });
    }
    return actions;
};

function formatDate(val) {
    if (val) {
        return moment(val).format('MM/DD/YYYY');
    } else {
        return val;
    }
};

function prepareDate(val) {
    if (val) {
        return moment(val).format('YYYY-MM-DDTHH:mm:ssZ');
    } else {
        return val;
    }
};

function hasAttachment(name) {
    return !!$("[data-name=" + name + "] [type=file]").val();
};

function setAttachment(entity, id, name) {
    return BPActions.uploadFile("[data-name=" + name + "] [type=file]", entity, name, id);
};


function getPageDataQuery(invoiceId) {
    var oldQuery = "select BillingProfileId, "
        + "Status, "
        + "ApprovalStatus, "
        + "ManualCloseApprovedFlag, "
        + "BillingProfileObj.Id, "
        + "BillingProfileObj.Email, "
        + "BillingProfileObj.AccountId, "
        + "BillingProfileObj.AccountObj.Id, "
        + "BillingProfileObj.AccountObj.Name, "
        + "BillingProfileObj.AccountObj.Status, "
        + "(select ProductId,"
        + "SubscriptionFromDate, "
        + "SubscriptionToDate, "
        + "RatedAmount,"
        + "ActivityDate, "
        + "Quantity, "
        + "Rate, "
        + "RateOverride, "
        + "CostOverride "
        + "from Activity.InvoiceObj "
        + "order by ActivityDate) "
        + "from INVOICE where Id=" + invoiceId;

    return "select inv.Id as InvoiceId, "
        + "inv.BillingProfileId, "
        + "to_char(inv.BillingCycleStartDate, 'YYYY-MM-DD') as BillingCycleStartDate, "
        + "to_char(inv.BillingCycleEndDate, 'YYYY-MM-DD') as BillingCycleEndDate, "
        + "inv.Status as InvoiceStatus, "
        + "inv.ApprovalStatus, "
        + "inv.ManualCloseApprovedFlag, "
        + "bp.Email, "
        + "bp.AccountId, "
        + "acc.Name, "
        + "acc.Status as AccountStatus, "
        + "act.Id as ActivityId, "
        + "act.ProductId, "
        + "to_char(act.SubscriptionFromDate, 'YYYY-MM-DD') as SubscriptionFromDate, "
        + "to_char(act.SubscriptionToDate, 'YYYY-MM-DD') as SubscriptionToDate, "
        + "to_char(act.ActivityDate, 'YYYY-MM-DD') as ActivityDate, "
        + "act.RatedAmount, "
        + "act.Quantity, "
        + "act.Rate, "
        + "act.RateOverride "
        + "from INVOICE inv "
        + "left join BILLING_PROFILE bp on inv.BillingProfileId=bp.Id "
        + "left join ACCOUNT acc on bp.AccountId=acc.Id "
        + "left join ACTIVITY act on inv.Id=act.InvoiceId "
        + "where inv.Id=" + invoiceId + " "
        + "and rownum < 1000 "
        + "order by act.ActivityDate";
};

function findPageDataSync(invoiceId) {
    return BPConnection.Invoice.query(getPageDataQuery(invoiceId)).collection();
};

function findPageDataAsync(invoiceId) {
    return BPConnection.Invoice.queryAsync(getPageDataQuery(invoiceId)).single();
};

function notifySuccess(result) {
    BPSystem.cancel('R');
};

function notifyFailure(result, message) {
    $('*').css('cursor', 'default');
    var text = message + ": " + JSON.stringify(result);
    console.log(result);
    console.warn(text);
    console.warn(result);
    BPActions.handleError(result, invoice);
    //BPActions.showError(text, "invoice", invoice);
};

function assert(value, message) {
    if (!value) console.error(message);
};

function assertDone(promise, message) {
    var deferred = $.Deferred();
    promise.done(function(result) {
        var errorCode = result || [];
        errorCode = errorCode[0] || {};
        errorCode = errorCode.ErrorCode;
        if (errorCode === "0") {
            notifySuccess(result);
            deferred.resolve(result);
        } else {
            notifyFailure(result, message);
            deferred.reject(result);
        }
    }).fail(function(result) {
        notifyFailure(result, message);
        deferred.reject(result);
    });
    return deferred.promise();
};

function applyActions(funcs) {
    var func = funcs.shift();
    if (func) {
        func().done(function(result) {
            BPActions.handleError(result);
            applyActions(funcs);
        }).fail(function(result) {
            notifyFailure(result, "Failed to perform sequence of actions");
        });
    } else {
        notifySuccess();
    }
};

window.onerror = function(e) {
    notifyFailure(e, "Javascript Error");
};

init();

BPUI.afterRender = function () {
    if(invoice.get().Status == 'CLOSED')
        BPActions.changeState("ManualCloseApprovedFlag", {type: "LABEL"});
};
