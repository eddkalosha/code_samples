/* global BPSystem,BPConnection,BPUI,React,$ */
BPSystem.initialize();
let BPActions = window.BPActions;
let BPDispatcher = window.BPDispatcher;

let DEVELOPMENT = (['PAGE_WIDGET', 'EXTENSION_WIDGET'].indexOf(BPSystem.nodeName) >= 0);

let entityId = (DEVELOPMENT ? '20' : $('[name=BILLING_PROFILE_ID]').val());

let CYBERSOURCE_SUBMIT = 'cybersource.submit';

let PAYMENT_UI_NAME = 'BILLING_INVOICE_PAYMENT';

let lastPaymentId = null;

let TRANSACTION_KEY = 'CyberSourceTxId';
let TRANSACTION_SUCCESS = 'ACCEPT';
let hideInterface = !!sessionStorage.getItem(TRANSACTION_KEY);

let ENABLE_AUTO_PAYMENT_KEY = 'WidgetEnableAuto';

let cybersource = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.BrmAggregate));
let paymentGatewaysRef = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.PaymentGateway));
let billingProfileRef = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.BillingProfile));
let newBillingProfileRef = window.newBillingProfileRef = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.BillingProfile));
let paymentRef = new BPUI.ReferenceObject(BPSystem.toBPObject({}, BPConnection.Payment));
let countries = new BPUI.ReferenceObject({value: ' ', values: [' ']});
let allCountries = new BPUI.ReferenceObject(BPSystem.toBPCollection([{}, {}], BPConnection.Country));
let countryCodeByName = {};
let invoices = new BPUI.ReferenceObject(BPSystem.toBPCollection([{}, {}], BPConnection.Invoice));

let CREDIT_CARD_SELECT_NEW = 'New Credit Card';
let creditCardSelect = window.creditCardSelect = new BPUI.ReferenceObject({value: ' ', values: [' ']});

let loadProgressCtl = new ProgressController();
let submitProgressCtl = new ProgressController();

let loadingCtl = new LoadingController('#_notexist');

/** {{{ <editor-fold desc="### AUTHORIZE.NET CONFIGURATION ###"> */

const authorizeNetJsLibPaths = {
    authorizenet_development: 'https://jstest.authorize.net/v1/Accept',
    authorizenet_production: 'https://js.authorize.net/v1/Accept',
};

 
const doMask = cardNumber => cardNumber? String(cardNumber).replace(/\s/g,'').replace(/^[\d]+(?=\d{4})/g, "************"):cardNumber;
const getOrgName = () =>{
    const pathNameClear = window.location.pathname.replace('/','');
    const slashIndex = pathNameClear.indexOf('/');
    return pathNameClear.indexOf('/')>0?pathNameClear.substring(0,slashIndex):false
  }
  const CURRENT_ORG_NAME = getOrgName();
  const CURRENT_ORG_NAME_FULL = `${window.location.origin}/${CURRENT_ORG_NAME}`
  
  const PAYMENT_GATEWAY_ID_JPM = '390';
  let PAYMENT_GATEWAY_PROFILEID_JPM = '';
  const JPM_MODULE_URL = `${CURRENT_ORG_NAME_FULL}/paymentgateways/1.0/tokenize/plugin/`;
  const JPM_TOKEN_API_URL = `${CURRENT_ORG_NAME_FULL}/paymentgateways/1.0/tokenize/`;

const createPaymentAuthorizeNet = pipeline([saveAuthorizeNetRequest,
    loadAuthorizeNetRequest,
    loadPayment,
    savePaymentAllocations,
    selectAuthorizationType(creditCardSelect, {
        TOKEN: pipeline([sendTokenBasedAuthorizeNetRequest]),
        INPUT: pipeline([addAuthorizeNetJsLib,
            createAuthorizeNetNonce,
            sendInputBasedAuthorizeNetRequest])
    }),
    notifySuccess
]);

/** </editor-fold> }}} */

/** {{{ <editor-fold desc="### BRAINTREE CONFIGURATION ###"> */

require.config({
    paths: {
        braintree: 'https://js.braintreegateway.com/web/3.31.0/js/client'
    }
});

const createPaymentBraintree = pipeline([saveBraintreeRequest,
    loadBraintreeRequest,
    loadPayment,
    savePaymentAllocations,
    selectAuthorizationType(creditCardSelect, {
        TOKEN: pipeline([sendTokenBasedBraintreeRequest]),
        INPUT: pipeline([createBraintreeNonce,
            sendInputBasedBraintreeRequest])
    }),
    notifySuccess
]);

/** </editor-fold> }}} */

/** {{{ <editor-fold desc="### CYBERSOURCE CONFIGURATION ###"> */

const createPaymentCybersource = pipeline([saveCybersourceRequest,
    loadCybersourceRequest,
    loadPayment,
    savePaymentAllocations,
    saveCybersourceTransaction,
    setDefaultSession,
    sendCybersourceRequest,
    notifySuccess
]);


const createPaymentJPM = pipeline([
    selectAuthorizationType(creditCardSelect, {
        TOKEN:pipeline([sendTokenBasedJPMRequest]),
        INPUT:pipeline([loadJPMPayment])
    }), 
    notifySuccessJPM
  ]) 


function sendTokenBasedJPMRequest(req, next) {
    return next(req);
    /*let request = {
        BillingProfileId: req.request.BillingProfileId,
        PaymentGatewayId: req.request.PaymentGatewayId,
        PaymentGatewayTransactionId: req.PaymentGatewayTransactionId,
        PaymentType: 'CREDIT CARD',
        Amount: req.request.amount,
        NeedCreatePayment: '0',
        customerId: '1',
    };
    
    return BPConnection.GatewayRequestBraintree.create(request).then(function (resp) {
        return next(req);
    });
    */
}  

function loadJPMPayment(req,next){
    function exec_createJPMToken(req,next){
    const billingProfile = newBillingProfileRef.get();
    const {CreditCardNumber,CreditCardCCV:cardCvv,
        CreditCardExpDate,CreditCardName,
        Zip:zipCode,Address1:addressLine1,Address2:addressLine2,
        City:city, Email:email,State:state, Country} = billingProfile;
    const cardNumber = String(CreditCardNumber).replace(/ /g,''); 
    const cardEmbed = false; //encrypt mode (boolean)
    const maskedCardNumber = doMask(cardNumber);  
    const [customerGivenName,customerFamilyName] = CreditCardName? CreditCardName.split(' '):' ';
    try{
      validateNumber(cardNumber)
    }catch(e){
      promise.reject(new Error(e))
    } 

    if (!PAYMENT_GATEWAY_PROFILEID_JPM || !CURRENT_ORG_NAME){
        promise.reject(new Error('Error while load payment gateway. Wrong org name or payment gateway profile ID.'))
    }
    
    const cardEncryptor = new BPUI.Tools.CardEncryptor();
    cardEncryptor
        .loadModule(`${JPM_MODULE_URL}${PAYMENT_GATEWAY_PROFILEID_JPM}`)
        .then(()=>{ 
            if (cardEncryptor.isLoaded){
                const {encryptData,getCardType} = cardEncryptor.encryptionAction;
                const cardType = getCardType(cardNumber);
                const encryptedCardData = encryptData(cardNumber,cardCvv,cardEmbed);
                const body = {
                            cardTokenization:{
                            cardType,
                            encryptedCardData,
                            expirationDate:moment(CreditCardExpDate,'MM/YYYY').startOf('month').format('YYYY-MM-DD'),
                            maskedCardNumber,
                            }, 
                            customerData:{
                                countryCode: countryCodeByName[Country],
                                zipCode,
                                addressLine1,
                                addressLine2,
                                city,
                                email,
                                state,
                                customerGivenName,
                                customerFamilyName,
                                additionalAttributes: {}
                            }
                }; 
                debugger;
                const bodyTo64 = btoa(unescape(JSON.stringify(body)));
                let tokenFieldForm = document.querySelector('[name=CC_TOKEN]');
                if (tokenFieldForm) { tokenFieldForm.value=bodyTo64;}
                promise.resolve(bodyTo64)
            }else{  
                promise.reject(new Error(`Error while initialized payment module. Module wasn't loaded correctly.`));
            }})
        .catch(e=>promise.reject(new Error(`Failed tokenization card (${e}).`)));
      } 
       var promise = $.Deferred()
       exec_createJPMToken(req,next);
       return promise;
  }


/** </editor-fold> }}} */

/**
 * Perform initial data loading.
 *
 * @type {function()}
 * @return {Promise<void>}
 */
const load = pipeline([error,
    loadingCtl.process,
    loadProgressCtl.makeStart(10),
    clearDefaultSession,
    loadCybersourceResponse,
    loadCybersourcePayment,
    loadPaymentGateways,
    loadProgressCtl.makeProgress(20, 0),
    loadBillingProfile,
    loadCountries,
    loadProgressCtl.makeProgress(70, 0),
    loadInvoices,
    loadComplete]);

/**
 * Perform form data submit.
 *
 * @type {function()}
 * @return {Promise<void>}
 */
const submit = pipeline([error,
    loadingCtl.process,
    prepareRequestFromBillingProfile,
    submitProgressCtl.makeStart(10),
    prepareRequest,
    validateRequest,
    // validatePaymentAllocations,
    fillPaymentAllocationXML,
    savePaymentFields,
    submitProgressCtl.makeProgress(30, 0),
    selectPaymentGateway(paymentGatewaysRef, {
        'AUTHORIZE.NET': createPaymentAuthorizeNet,
        'BRAINTREE': createPaymentBraintree,
        'CYBERSOURCE': createPaymentCybersource,
        'CYBERSOURCE_FLEX': createPaymentCybersource,
        'JPM':createPaymentJPM
    })]);

/**
 * Cancel payment creation.
 *
 * @type {function()}
 * @return {Promise<void>}
 */
const cancel = pipeline([error,
    loadingCtl.process,
    cancelComplete]);

function MultiException(messages) {
    this.messages = messages;
    this.message = messages.join('\n');
}

function notifySuccess(req) {
    if (req && req.request) {
        req.request.success = true;
    }
    goToPaymentHistory();
}

function notifySuccessJPM(){
    console.log('JPM SUCCESS');
    return;
}

function notifyFailure(result) {
    if (result && result.responseText) {
        result = JSON.parse(result.responseText);
        result = (result.errors ? result.errors : result);
    }
    if (console.error) {
        console.error(JSON.stringify(result));
    }
    BPActions.handleError(result);
}

function notifyPaymentGatewaysFailure() {
    const message = 'No payment gateway profiles configured. Please setup and enable one.';

    BPActions.handleError({ message });
}

function goToPaymentHistory() {
    BPSystem.navigateTo(PAYMENT_UI_NAME, lastPaymentId, 'R');
}

function nullToEmpty(val) {
    return val || '';
}

function parseAmount(val) {
    if (val) {
        let amount = val.replace(/,/g, '').replace(/^(.*?)([\d.]+)(.*?)$/g, function (match, prefixValue, amountValue, suffixValue) {
            return amountValue;
        });
        return parseFloat(amount);
    }
    return 0;
}

function formatAmount(val) {
    if (val) {
        let prefix = "";
        let suffix = "";
        let amount = val.replace(/^(.*?)([\d.]+)(.*?)$/g, function (match, prefixValue, amountValue, suffixValue) {
            prefix = prefixValue;
            suffix = suffixValue;
            return amountValue;
        });
        return prefix + parseFloat(amount).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + suffix;
    }
    return "0.00";
}

function notFoundError(promise, message) {
    return promise.then(undefined, function (error) {
        if (error.status === 404) {
            return $.Deferred().reject(new Error(message));
        }
        return error;
    });
}

function notFoundRecoverableError(promise, defaultValue, message) {
    return promise.then(undefined, function (error) {
        if (error.status === 404) {
            setTimeout(function () {
                notifyFailure(new Error(message))
            }, 1);
            return $.Deferred().resolve(defaultValue);
        }
        return error;
    });
}

function notFoundDefault(promise, defaultValue) {
    return promise.then(undefined, function (error) {
        if (error.status === 404) {
            return $.Deferred().resolve(defaultValue);
        }
        return error;
    });
}

function notFoundRetry(promiseFunc, attempts, interval) {
    let promise = $.Deferred();
    let count = attempts;
    let retryFunc = function retry() {
        promiseFunc().then(function (result) {
            promise.resolve(result);
        }, function (error) {
            if (error.status === 404) {
                if (count > 0) {
                    count -= 1;
                    setTimeout(retryFunc, interval);
                } else {
                    promise.reject(error);
                }
            } else {
                promise.reject(error);
            }
            return error;
        });
    };
    retryFunc();
    return promise;
}

function buildExpiryDate() {
    let obj = cybersource.get();
    obj.card_expiry_date = '' + nullToEmpty(obj.card_expiry_month)
        + '-20' + nullToEmpty(obj.card_expiry_year);
}

function onCardNumberInput() {
    let number = cybersource.get().card_number;
    if (number && number.length % 5 === 0) {
        let prev = number.substring(0, number.length - 1);
        if (number[number.length - 1] === ' ') {
            number = prev;
        } else {
            number = prev + ' ' + number[number.length - 1];
        }
        cybersource.get().card_number = number;
        setTimeout(function () {
            $('#card_number').caret(number.length);
        }, 10);
    }
}

function getFormFieldValue(name) {
    return $('#' + name + '_ROW input[name=' + name + ']').val();
}

function getTextAreaValue(name) {
    return $('#' + name + '_ROW textarea[name=' + name + ']').val();
}

function pipeline(steps) {
    let widget = this,
        callNext = (function (func, next) {
            return function (req) {
                if (!arguments.length) {
                    req = {};
                }
                try {
                    return func.call(widget, req, next);
                } catch (e) {
                    return $.Deferred().reject(e);
                }
            }
        }),
        next = (function (req) {
            return $.Deferred().resolve(req);
        });
    for (let idx = steps.length - 1; idx >= 0; --idx) {
        next = callNext.call(widget, steps[idx], next);
    }
    return next;
}

function error(req, next) {
    try {
        BPActions.clearError("messages");
        return next(req).fail(function (e) {
            if (e.messages) {
                e.messages.map(function (m) {
                    return new Error(m);
                }).forEach(notifyFailure);
            } else {
                notifyFailure(e);
            }
        });
    } catch (e) {
        if (e.messages) {
            e.messages.map(function (m) {
                return new Error(m);
            }).forEach(notifyFailure);
        } else {
            notifyFailure(e);
        }
        return $.Deferred().reject(e);
    }
}

function LoadingController(selector) {
    let self = this,
        depth = 0;
    this.start = function () {
        if (depth == 0) {
            $(selector).show();
        }
        depth = depth + 1;
    };

    this.process = function (req, next) {
        if (depth > 0) {
            let completion = $.Deferred();
            setTimeout(function () {
                completion.reject(new Error("In process, please wait"));
            }, 1);
            return completion;
        }
        self.start();
        return next(req).always(self.stop);
    };

    this.stop = function () {
        depth = depth - 1;
        if (depth == 0) {
            $(selector).hide();
        }
    }
}

function ProgressController() {
    let self = this;
    this.progress = 0;
    this.makeStart = function (count) {
        return function (req, next) {
            return next(req).always(function () {
                self.progress = 0;
                BPActions.refreshState('cybersource');
            })
        }
    };
    this.makeProgress = function (countBefore, countAfter) {
        return function (req, next) {
            self.progress += countBefore;
            BPActions.refreshState('cybersource');
            return next(req).then(function (arg) {
                self.progress += countAfter;
                BPActions.refreshState('cybersource');
                return arg;
            });
        }
    }
}

function loadCybersourceResponse(req, next) {
    let transactionId = sessionStorage.getItem(TRANSACTION_KEY);
    sessionStorage.removeItem(TRANSACTION_KEY);

    if (transactionId) {
        req.PaymentGatewayTransactionId = transactionId;
        req.futures = req.futures || [];
        req.indexes = req.indexes || {};
        req.indexes.GatewayResponse = req.futures.length;
        /* BPConnection.GatewayResponseCybersource.entity */
        req.futures.push(notFoundRecoverableError(notFoundRetry(function () {
            return findEcomTransactionResponse(transactionId);
        }, 10, 1000), BPSystem.toBPCollection([], BPConnection.BrmAggregate), "Payment Gateway Response cannot be found."));
    }
    return next(req);
}

function loadBillingProfile(req, next) {
    if (!req.entityId) {
        throw new Error("EntityId is missing");
    }
    req.futures = req.futures || [];
    req.indexes = req.indexes || {};
    req.indexes.BillingProfile = req.futures.length;
    req.futures.push(notFoundError(notFoundRetry(function () {
        return findBillingProfile(req.entityId);
    }, 10, 1000), "Billing Profile cannot be found."));
    return next(req).then(function (responses) {
        let billingProfile = responses[req.indexes.BillingProfile];
        let old_number = billingProfile.CreditCardNumber || '****************';
        let new_number = [];

        for (let idx = 0, len = old_number.length; idx < len; idx += 4) {
            new_number.push(old_number.substring(idx, idx + 4));
        }

        let expiryMonth = billingProfile.CreditCardExpDate ? billingProfile.CreditCardExpDate.substring(0, 2) : "";
        let expiryYear = billingProfile.CreditCardExpDate ? billingProfile.CreditCardExpDate.substring(billingProfile.CreditCardExpDate.length - 2) : "";

        cybersource.set(BPSystem.toBPObject({
            BillingProfileId: billingProfile.Id,
            currency: billingProfile.CurrencyCode,
            payment_method: "card",
            bill_to_email: billingProfile.Email,
            card_type: "001",
            locale: "en",
            bill_to_address_line1: billingProfile.Address1,
            bill_to_address_city: billingProfile.City,
            bill_to_address_country: billingProfile.Country,
            bill_to_address_state: billingProfile.State,
            bill_to_address_postal_code: billingProfile.Zip,
            amount: "",
            transaction_type: "create_payment_token",
            unsigned_field_names: "card_type,card_number,card_expiry_date,locale"
        }, BPConnection.BrmAggregate));

        if (billingProfile.CreditCardToken) {
            creditCardSelect.set({
                value: new_number.join(' ') + " - " + billingProfile.CreditCardExpDate,
                values: [new_number.join(' ') + " - " + billingProfile.CreditCardExpDate, CREDIT_CARD_SELECT_NEW]
            });
        } else {
            creditCardSelect.set({value: CREDIT_CARD_SELECT_NEW, values: [CREDIT_CARD_SELECT_NEW]});
        }

        billingProfileRef.set(billingProfile);

        BPActions.refreshState('cybersource');
        return responses;
    });
}

function loadCountries(req, next) {
    req.futures = req.futures || [];
    req.indexes = req.indexes || {};
    req.indexes.Country = req.futures.length;
    req.futures.push(findCountries());
    return next(req).then(function (responses) {
        let billingProfile = responses[req.indexes.BillingProfile];
        let countriesResponse = responses[req.indexes.Country].elements;
        let res = [];
        countriesResponse.forEach(function (country) {
            res.push(country.CountryName);
            countryCodeByName[country.CountryName] = country.Alpha2_Code;
        });
        countries.set({value: billingProfile.Country || res[0], values: res});
        allCountries.set(responses[req.indexes.Country]);
        return responses;
    });
}

function loadInvoices(req, next) {
    req.futures = req.futures || [];
    req.indexes = req.indexes || {};
    req.indexes.Invoices = req.futures.length;
    req.futures.push(notFoundDefault(findClosedInvoices(req.entityId), BPSystem.toBPCollection([{}], BPConnection.Invoice)));
    return next(req).then(function (responses) {
        let invoicesResp = responses[req.indexes.Invoices];
        invoicesResp.elements.filter(function (invoice) {
            return invoice.Id;
        }).forEach(function (invoice) {
            ['GrandTotalAmount', 'PaymentAmount', 'CreditAmount', 'BalanceDue'].forEach(function (field) {
                invoice[field] = formatAmount(invoice[field]);
            });
        });
        invoices.set(invoicesResp);
        return responses;
    });
}

function loadComplete(req) {
    return $.when.apply(null, req.futures).then(function () {
        let responses = [];
        for (let idx = 0; idx < arguments.length; ++idx) {
            responses.push(arguments[idx]);
        }
        return responses;
    });
}

function validateNumber(creditCardNumber) {
    let number = null;
    let numbers = [];
    for (let idx = 0, len = creditCardNumber.length; idx < len; ++idx) {
        number = parseInt(creditCardNumber[idx]);
        if (!isNaN(parseInt(number))) {
            numbers.push(number);
        }
    }
    if (numbers.length < 12) {
        throw new Error('Credit Card Number is not valid');
    }
    let checksum = 0;
    let checksumNumbers = numbers.reverse();
    for (idx = 0, len = checksumNumbers.length; idx < len; idx += 1) {
        if (idx % 2 === 1) {
            checksumNumbers[idx] *= 2;
            if (checksumNumbers[idx] > 9) {
                checksumNumbers[idx] -= 9;
            }
        }
        checksum += checksumNumbers[idx];
    }
    if (checksum % 10 !== 0) {
        throw new Error('Credit Card Number is not valid');
    }
}

function validateExpirationMonth(expirationMonth) {
    let number = parseInt(expirationMonth);
    if (!isNaN(number)) {
        if (number < 1 || number > 12) {
            throw new Error('Expiration Month should be great then or equal to 1 and less then or equal to 12');
        }
    } else {
        throw new Error('Expiration Month is not a number');
    }
}

function validateExpirationYear(expirationYear) {
    let number = parseInt(expirationYear);
    if (!isNaN(number)) {
        let currentYear = moment().year();
        if (number < currentYear || number > currentYear + 50) {
            throw new Error('Expiration Year should be between ' + currentYear + ' and ' + (currentYear + 50) + ' years');
        }
    } else {
        throw new Error('Expiration Year is not a number');
    }
}

function validateRequest(req, next) {
    let request = req.request;
    let errors = [];
    if (request.transaction_type !== 'create_payment_token' && !request.amount) {
        errors.push("Please specify Amount");
    }
    if (!request.PaymentNote) {
        errors.push("Please specify Notes");
    }
    if (!request.payment_token) {
        if (!request.card_number) {
            errors.push("Please specify Credit Card Number");
        } else {
            try {
                validateNumber(request.card_number);
            } catch (e) {
                errors.push(e.message);
            }
        }
        if (!request.card_cvn) {
            errors.push("Please specify CVV");
        } else if (!/^\d{3,4}$/.test(request.card_cvn)) {
            errors.push('CVV should contain 3 or 4 digits')
        }
        if (!request.card_expiry_date) {
            errors.push("Please specify Expiry Date");
        } else {
            try {
                validateExpirationMonth(request.card_expiry_month);
            } catch (e) {
                errors.push(e.message);
            }
            try {
                validateExpirationYear(request.card_expiry_year);
            } catch (e) {
                errors.push(e.message);
            }
        }
        if (!request.bill_to_forename) {
            errors.push("Please specify Name");
        }
        // if (!request.bill_to_surname) {
        //   errors.push("Please specify Last Name");
        // }
        if (!request.bill_to_address_line1) {
            errors.push("Please specify Address");
        }
        if (!request.bill_to_address_country) {
            errors.push("Please specify Country");
        }
        // if (!request.bill_to_address_state) {
        //   errors.push("Please specify State");
        // }
        if (!request.bill_to_address_city) {
            errors.push("Please specify City");
        }
        if (!request.bill_to_address_postal_code) {
            errors.push("Please specify ZIP");
        }
    }

    if (errors.length) {
        return $.Deferred().reject(new MultiException(errors));
    }

    return next(req);
}

function prepareRequestFromBillingProfile(req, next) {
    let billingProfile = newBillingProfileRef.get();

    let old_number = nullToEmpty(billingProfile.CreditCardNumber);
    let new_number = [];
    for (let idx = 0, len = old_number.length; idx < len; idx += 1) {
        if (!isNaN(parseInt(old_number[idx]))) {
            new_number.push(old_number[idx]);
        }
    }

    req.request.BillingProfileId = billingProfileRef.get().Id;
    req.request.GatewayId = getFormFieldValue('ECOM_GATEWAY_ID')
        || billingProfileRef.get().PaymentGateway
        || findDefaultPaymentGatewayId(paymentGatewaysRef);
    req.request.PaymentGatewayId = getFormFieldValue('ECOM_GATEWAY_ID')
        || billingProfileRef.get().PaymentGateway
        || findDefaultPaymentGatewayId(paymentGatewaysRef);
    req.request.Autoallocate = getFormFieldValue('AUTOALLOCATE');
    req.request.PaymentAllocationStrategy = getFormFieldValue('ALLOCATION_STRATEGY');
    req.request.PaymentNote = getTextAreaValue('PAYMENT_NOTE');
    req.request.currency = billingProfile.CurrencyCode;
    req.request.payment_method = "card";
    req.request.locale = "en";
    req.request.amount = paymentRef.get().Amount;
    req.request.transaction_type = "sale";
    req.request.unsigned_field_names = "card_type,card_number,card_expiry_date,locale";
    req.request.bill_to_address_line1 = billingProfile.Address1;
    req.request.bill_to_address_city = billingProfile.City;
    req.request.bill_to_address_country = billingProfile.Country;
    req.request.bill_to_address_state = billingProfile.State;
    req.request.bill_to_address_postal_code = billingProfile.Zip;
    req.request.bill_to_forename = billingProfile.CreditCardName ? billingProfile.CreditCardName.split(' ')[0] : "";
    req.request.bill_to_surname = billingProfile.CreditCardName ? billingProfile.CreditCardName.split(' ')[1] : "";

    req.request.bill_to_email = billingProfile.Email;
    req.request.card_number = new_number.join("");
    req.request.card_type = "001";
    req.request.card_cvn = billingProfile.CreditCardCCV;
    req.request.card_expiry_month = nullToEmpty(billingProfile.CreditCardExpDate).substring(0, 2);
    req.request.card_expiry_year = nullToEmpty(billingProfile.CreditCardExpDate).substring(nullToEmpty(billingProfile.CreditCardExpDate).length - 4);
    req.request.card_expiry_date = req.request.card_expiry_month + "-" + req.request.card_expiry_year;
    req.request.payment_token = billingProfileRef.get().CreditCardToken;
    return next(req);
}

function prepareRequest(req, next) {
    let old_number = nullToEmpty(req.request.card_number);
    let new_number = [];
    for (let idx = 0, len = old_number.length; idx < len; ++idx) {
        if (!isNaN(parseInt(old_number[idx]))) {
            new_number.push(old_number[idx]);
        }
    }
    req.request.card_number = new_number.join("");


    switch (new_number[0]) {
        case "3":
            req.request.card_type = "003";
            break;
        case "4":
            req.request.card_type = "001";
            break;
        case "5":
            req.request.card_type = "002";
            break;
    }

    if (creditCardSelect.getValue() === CREDIT_CARD_SELECT_NEW) {
        delete req.request.payment_token;
    }

    if (req.request.payment_token) {
        req.request.card_type = "";
        req.request.card_cvn = "";
        req.request.card_number = "";
        req.request.card_expiry_date = "";
        req.request.bill_to_forename = "";
        req.request.bill_to_surname = "";
        req.request.bill_to_email = "";
        req.request.bill_to_address_line1 = "";
        req.request.bill_to_address_city = "";
        req.request.bill_to_address_state = "";
        req.request.bill_to_address_country = "";
        req.request.bill_to_address_postal_code = "";
        req.request.transaction_type = "sale";
    }

    req.request.Autoallocate = $('[name=AUTOALLOCATE]').val();
    req.request.Note = $('[name=PAYMENT_NOTE]').val();
    req.request.NeedCreatePayment = (req.request.transaction_type !== 'create_payment_token' ? "1" : "0");

    return next(req);
}

function cleanCybersourceRequest(request) {
    let signedFields = (request.signed_field_names || '').split(',');
    let unsignedFields = (request.unsigned_field_names || '').split(',');
    return signedFields.concat(unsignedFields).reduce(function (obj, field) {
        obj[field] = request[field];
        return obj;
    }, {signature: request.signature});
}

function saveCybersourceRequest(req, next) {
    if (!req.request.payment_token) {
        let country = getCountry(allCountries.get().elements, req.request.bill_to_address_country)
            || {};
        req.request.bill_to_address_country = nullToEmpty(country.Alpha2_Code);

        if (!req.request.bill_to_address_country) {
            return $.Deferred().reject(
                new Error('Country must be an official country name or ISO alpha 2 or alpha 3 code'));
        }
    }
    // BPConnection.GATEWAY_REQUEST_CYBERSOURCE.entity
    return BPConnection.GatewayRequestCybersource.create(req.request).then(function (resp) {
        req.GatewayRequestId = resp[0].Id;
        return next(req);
    });
}

function loadCybersourceRequest(req, next) {
    return BPConnection.GatewayRequestCybersource.retrieveAsync(req.GatewayRequestId).then(function (gatewayRequest) {
        if (!req.request.payment_token) {
            delete gatewayRequest.payment_token;
        }
        $.extend(req.request, gatewayRequest);
        req.PaymentGatewayTransactionId = req.request.reference_number;
        return next(req);
    });
}

function saveCybersourceTransaction(req, next) {
    sessionStorage.setItem(TRANSACTION_KEY, req.request.reference_number);
    return next(req);
}

function loadCybersourcePayment(req, next) {
    if (req.PaymentGatewayTransactionId) {
        return loadPayment(req, notifySuccess);
    }
    return next(req);
}

function saveAutoPayment(req, next) {
    if (req.request.enable_auto_payment === "1") {
        sessionStorage.setItem(ENABLE_AUTO_PAYMENT_KEY, "true");
    }
    return next(req);
}

function savePaymentFields(req, next) {
    let billingProfile = newBillingProfileRef.get() || {};
    let payment = paymentRef.get() || {};
    let fields = {
        'CC_AMOUNT': 'Amount',
        'CC_NAME': 'CreditCardName',
        'CC_NUMBER': 'CreditCardNumber',
        'CC_CVV': 'CreditCardCVV',
        'CC_EXP_DATE': 'CreditCardExpDate',
        'CC_ADDR': 'Address1',
        'CC_CITY': 'City',
        'CC_STATE': 'State',
        'CC_COUNTRY': 'Country',
        'CC_ZIP': 'Zip',
    };
    [billingProfile, payment].forEach(function (entity) {
        Object.keys(fields).forEach(function (field) {
            let name = fields[field];
            if (typeof entity[name] !== 'undefined') {
                $("input[name=" + field + "]").val(entity[name]);
            }
        });
    });
    return next(req);
}

function saveBillingProfile(req, next) {
    let enableAutoPayment = sessionStorage.getItem(ENABLE_AUTO_PAYMENT_KEY);
    sessionStorage.removeItem(ENABLE_AUTO_PAYMENT_KEY);

    return next(req).then(function (responses) {
        let billingProfile = responses[req.indexes.BillingProfile];
        if (req.isTransactionSucceed && enableAutoPayment === 'true') {
            return BPConnection.BillingProfile.update({
                Id: billingProfile.Id,
                BillingMethod: 'CREDIT CARD',
            }).then(function () {
                billingProfile.BillingMethod = 'CREDIT CARD';
                return responses;
            });
        } else {
            return responses;
        }
    });
}

function validatePaymentAllocations(req, next) {
    let errors = invoices.get().elements.map(function (invoice) {
        invoice.OverpayAmount = parseAmount(invoice.CurrentPaymentAllocationAmount)
            + parseAmount(invoice.PaymentAllocationPendingAmount)
            - parseAmount(invoice.BalanceDue);
        return invoice;
    }).filter(function (invoice) {
        return invoice.OverpayAmount > 0;
    }).map(function (invoice) {
        return "Invoice " + invoice.Id + " is overpaid with amount " + invoice.OverpayAmount;
    });
    let spentAmount = invoices.get().elements.reduce(function (accum, invoice) {
        return accum + parseAmount(invoice.CurrentPaymentAllocationAmount);
    }, 0);
    if (spentAmount > parseFloat(paymentRef.get().Amount)) {
        errors.unshift("Allocations amount is greater then payment amount");
    }
    if (errors.length) {
        return $.Deferred().reject(new MultiException(errors));
    }
    return next(req);
}

function fillPaymentAllocationXML(req,next){
    const allocation = invoices.get().elements.map((invoice) =>({
        InvoiceId: invoice.Id,
        Amount: "0",
        PendingAmount: invoice.CurrentPaymentAllocationAmount,
        PaymentItemId: req.PaymentId,
    }))
      .filter((alloc)=> {
          try {
              return alloc.PendingAmount && parseFloat(alloc.PendingAmount) > 0;
          } catch (e) {
              return false;
          }
      })
      .map(el=>`<INVOICE_PAYMENTS_ROW>
<INVOICE_ID_HIDDEN>${el.InvoiceId}</INVOICE_ID_HIDDEN>
<PAYMENT_AMOUNT>${el.PendingAmount}</PAYMENT_AMOUNT>
<PAYMENT_ITEM_ID>${el.PaymentItemId}</PAYMENT_ITEM_ID>
</INVOICE_PAYMENTS_ROW>`).join();
    const input = document.querySelector('input[name="INVOICE_PAYMENTS"]');
    if(!input){
        console.error('Invoice Payments input is not found');
        return
    }
    input.value = allocation;
    return next(req)
}

function savePaymentAllocations(req, next) {
    const input = document.querySelector('input[name="INVOICE_PAYMENTS"]');
    if(input){
        input.value = ''
    }
    let allocs = invoices.get().elements.map(function (invoice) {
        return {
            InvoiceId: invoice.Id,
            Amount: "0",
            PendingAmount: invoice.CurrentPaymentAllocationAmount,
            PaymentItemId: req.PaymentId,
        }
    }).filter(function (alloc) {
        try {
            return alloc.PendingAmount && parseFloat(alloc.PendingAmount) > 0;
        } catch (e) {
            return false;
        }
    });
    if (allocs.length) {
        return BPConnection.PaymentAllocation.create(allocs).then(function () {
            return next(req);
        });
    } else {
        return next(req);
    }
}

function setDefaultSession(req, next) {
  let future = $.Deferred();
  $.ajax({
    url: 'listDataSource',
    dataType: 'text',
    data: {
      action_in: 'set_default_session'
    },
    success: function() {
      next(req).then(future.resolve, future.reject);
    },
    error: function() {
      next(req).then(future.resolve, future.reject);
    },
  });
  return future;
}

function clearDefaultSession(req, next) {
  let future = $.Deferred();
  $.ajax({
    url: 'listDataSource',
    dataType: 'text',
    data: {
      action_in: 'clear_default_session'
    },
    success: function() {
      next(req).then(future.resolve, future.reject);
    },
    error: function() {
      next(req).then(future.resolve, future.reject);
    },
  });
  return future;
}

function sendCybersourceRequest(req) {
    cybersourceSubmit("cybersource", cleanCybersourceRequest(req.request));
    let deferred = $.Deferred();

    setTimeout(function () {
        deferred.reject(new Error('Timeout'));
    }, 10000);

    return deferred;
}

function cancelComplete() {
    BPSystem.cancel();
    return $.Deferred().resolve({});
}

function findBillingProfile(billingProfileId) {
    let query = "select Id, "
        + "BillingMethod, "
        + "PaymentGateway, "
        + "CreditCardName, "
        + "CreditCardToken, "
        + "CreditCardNumber, "
        + "CreditCardExpDate, "
        + "CurrencyCode, "
        + "CurrencyCodeObj.CurrencySign "
        + "from BILLING_PROFILE where Id=" + billingProfileId;
    return BPConnection.BillingProfile.queryAsync(query).single();
}

function findCountries() {
    let query = "select Code, Alpha2_Code, CountryName from COUNTRY order by CountryName asc";
    return BPConnection.Country.queryAsync(query).collection();
}

function getCountry(countries, value) {
    if (value && countries.length) {
        let normalizedValue = value.replace(/\s+/g, '').toUpperCase();
        return countries.filter(function (it) {
            return it.Code === normalizedValue || it.Alpha2_Code === normalizedValue
                || (it.CountryName && it.CountryName.replace(/\s+/g, '').toUpperCase() === normalizedValue);
        })[0];
    }
    return undefined;
}

function findEcomTransactionResponse(transactionId) {
    let query = "select f2.FieldName, f2.FieldValue, tx.PaymentItemId "
        + "from ECOM_TRANSACTION_RESP_FIELD f1 "
        + "join ECOM_TRANSACTION_RESP_FIELD f2 on f1.EcomTransactionResponseId=f2.EcomTransactionResponseId "
        + "join ECOM_TRANSACTION_RESPONSE resp on f1.EcomTransactionResponseId=resp.Id "
        + "join ECOM_TRANSACTION tx on tx.Id=resp.EcomTransactionRequestId "
        + "where f1.FieldName='req_reference_number' "
        + "and f1.FieldValue='" + transactionId + "' "
        + "and f2.FieldName in ('decision', 'message', 'invalid_fields')";
    return BPConnection.BrmAggregate.queryAsync(query).collection();
}

function findPayment(txId) {
    let query = "select Id, CreditCardTransactionStatus, GatewayTransactionId from PAYMENT "
        + "where GatewayTransactionId='" + txId + "'";
    return BPConnection.Payment.queryAsync(query).single();
}

function loadPayment(req, next) {
    return notFoundError(findPayment(req.PaymentGatewayTransactionId), "Payment cannot be found for this Gateway Request").then(function (payment) {
        req.PaymentId = payment.Id;
        req.PaymentStatus = payment.CreditCardTransactionStatus;
        lastPaymentId = payment.Id;
        return next(req);
    });
}

function findClosedInvoices(billingProfileId) {
    let query = "select inv.Id,"
        + "to_char(inv.DueDate, 'MM/DD/YYYY') as DueDate,"
        + "cur.CurrencySign || inv.GrandTotalAmount as GrandTotalAmount,"
        + "cur.CurrencySign || inv.PaymentAmount as PaymentAmount,"
        + "cur.CurrencySign || inv.CreditAmount as CreditAmount,"
        + "cur.CurrencySign || (inv.GrandTotalAmount - inv.PaymentAmount - inv.CreditAmount) as BalanceDue,"
        + "sum(alloc.Amount) as PaymentAllocationAmount, "
        + "sum(alloc.PendingAmount) as PaymentAllocationPendingAmount, "
        + "0 as CurrentPaymentAllocationAmount "
        + "from INVOICE inv "
        + "join BILLING_PROFILE bp on bp.Id=inv.BillingProfileId "
        + "join CURRENCY cur on cur.Id = bp.CurrencyCode "
        + "left join PAYMENT_ALLOCATION alloc on alloc.InvoiceId=inv.Id "
        + "where inv.Status = 'CLOSED' "
        + "and inv.PaymentStatus <> 'PAID' "
        + "and bp.Id=" + billingProfileId + " "
        + "group by inv.Id,"
        + "inv.DueDate,"
        + "cur.CurrencySign,"
        + "inv.GrandTotalAmount,"
        + "inv.PaymentAmount,"
        + "inv.CreditAmount "
        + "order by inv.DueDate";
    return BPConnection.Invoice.queryAsync(query).collection();
}

function createCreditCardPaymentNonce(req, next) {
    let authData = {
        apiLoginID: '7QGhp383nq',
        clientKey: '68As3vWpYL75cZF2qbF3k5AbD4yFwV8WqG366cykpcbCAp8YZFvPsr8q3xt3emFQ',
    };
    let cardData = {
        cardNumber: req.request.card_number,
        cardCode: req.request.card_cvn,
        month: req.request.card_expiry_month,
        year: req.request.card_expiry_year,
    };
    if (!window.Accept) {
        throw new Error('Accept.js library for Authorize.Net is not loaded');
    }
    let future = $.Deferred();
    window.Accept.dispatchData({authData: authData, cardData: cardData}, function (response) {
        if (response.messages.resultCode === 'Error') {
            future.reject(new Error(response.messages));
        } else {
            req.opaqueData = response.opaqueData;
            next(req).then(function (resp) {
                future.resolve(resp);
            }, function (err) {
                future.reject(err);
            });
        }
    });
    return future;
}

function saveBraintreeRequest(req, next) {
    let billingProfile = billingProfileRef.get();
    let payment = paymentRef.get();
    let PaymentAllocationStrategy = req.request.PaymentAllocationStrategy;
    
    return BPConnection.GatewayRequestBraintree.create({
        PaymentAllocationStrategy,
        BillingProfileId: billingProfile.Id,
        PaymentGatewayId: 290,
        Amount: payment.Amount,
        customerId: '1'
    }).then(function (resp) {
        req.request.GatewayRequestId = resp[0].Id;
        return next(req);
    });
    // return next(req);
}

function prepareCreditCardRequest(req, next) {
    if (CREDIT_CARD_SELECT_NEW === creditCardSelect.getValue()) {
        return createCreditCardPaymentNonce(req, next);
    } else {
        return next(req);
    }
}

function saveCreditCardRequest(req, next) {
    let billingProfile = billingProfileRef.get();
    let payment = paymentRef.get();
    let request = {
        BillingProfileId: billingProfile.Id,
        amount: payment.Amount,
        NeedCreatePayment: '1',
        PaymentAllocationStrategy: req.request.PaymentAllocationStrategy,
        AutoAllocate: $('[name=AUTOALLOCATE]').val(),
        Note: $('[name=PAYMENT_NOTE]').val(),
        PaymentType: 'CREDIT CARD',
    };
    if (CREDIT_CARD_SELECT_NEW === creditCardSelect.getValue()) {
        $.extend(request, {
            opaqueDataDescriptor: req.opaqueData.dataDescriptor,
            opaqueDataValue: req.opaqueData.dataValue,
            address: billingProfile.Address1,
            city: billingProfile.City,
            state: billingProfile.State,
            zip: billingProfile.Zip,
            country: billingProfile.Country,
            email: billingProfile.Email,
        })
    } else {
        $.extend(request, {
            customerProfileId: billingProfile.CreditCardToken.split(':')[0],
            customerPaymentProfileId: billingProfile.CreditCardToken.split(':')[1],
        });
    }
    req.request = request;
    return BPConnection.GatewayRequestAuthorizenet.create(request).then(function (resp) {
        req.GatewayRequestId = resp[0].Id;
        return next(req);
    });
}

function saveCreditCardRequestWithPayment(req, next) {
    return BPConnection.GatewayRequestAuthorizenet.create($.extend({}, req.request, {
        NeedCreatePayment: '0',
        PaymentAllocationStrategy: req.request.PaymentAllocationStrategy,
        refId: req.PaymentGatewayTransactionId
    })).then(function (resp) {
        req.GatewayRequestId = resp[0].Id;
        return next(req);
    });
}

function loadCreditCardRequest(req, next) {
    let query = "select PaymentGatewayProfileId,refId,transId,resultCode,messageText from GATEWAY_REQUEST_AUTHORIZENET where Id=" + req.GatewayRequestId;
    return BPConnection.GatewayRequestAuthorizenet.queryAsync(query).single().then(function (resp) {
        req.GatewayRequest = resp;
        req.request.PaymentGatewayProfileId = resp.PaymentGatewayProfileId;
        return next(req);
    });
}

function loadCreditCardPayment(req, next) {
    return notFoundError(findPayment(req.GatewayRequest.refId, req.GatewayRequest.transId), "Payment cannot be found for this Gateway Request").then(function (payment) {
        req.PaymentId = payment.Id;
        req.PaymentStatus = payment.CreditCardTransactionStatus;
        req.PaymentGatewayTransactionId = payment.GatewayTransactionId;
        lastPaymentId = payment.Id;
        return next(req);
    });
}

function checkCreditCardPayment(req, next) {
    if (req.PaymentStatus === 'PENDING') {
        return next(req);
    }
    notifySuccess();
}

function checkCreditCardRequest(req, next) {
    notifySuccess();
}

/** <editor-fold desc="### AUTHORIZE.NET IMPLEMENTATION ###"> */

function isAuthorizeNetProductionApiUrl(url) {
    return url.search(/^https:\/\/api\.authorize\.net/) >= 0;
}

function getAuthorizeNetEnvironmentByApiUrl(url) {
    return (isAuthorizeNetProductionApiUrl(url) ? 'production' : 'development');
}

function addAuthorizeNetJsLib(req, next) {
    const future = $.Deferred();
    const script = document.createElement('script');
    const env = getAuthorizeNetEnvironmentByApiUrl(req.GatewayRequest.apiUrl);
    script.src = authorizeNetJsLibPaths['authorizenet_' + env] + '.js';
    script.async = false;
    script.onload = function () {
        setTimeout(function () {
            next(req)
                .done(future.resolve.bind(null))
                .fail(future.reject.bind(null));
        }, 500);
    };
    const error = new Error('Accept.js loading failed');
    script.onerror = function () {
        future.reject(error);
    };
    document.body.appendChild(script);
    return future;
}

function createAuthorizeNetNonce(req, next) {
    let authData = {
        apiLoginID: req.GatewayRequest.merchantName,
        clientKey: req.GatewayRequest.clientKey,
    };
    let cardData = {
        cardNumber: req.request.card_number,
        cardCode: req.request.card_cvn,
        month: req.request.card_expiry_month,
        year: req.request.card_expiry_year,
    };
    let future = $.Deferred();

    window.Accept.dispatchData({authData: authData, cardData: cardData}, function (response) {
        if (response.messages.resultCode === 'Error') {
            future.reject(new Error(JSON.stringify(response)));
        } else {
            req.opaqueData = response.opaqueData;
            next(req).then(function (resp) {
                future.resolve(resp);
            }, function (err) {
                future.reject(err);
            })
        }
    });
    return future;
}

function saveAuthorizeNetRequest(req, next) {
    let request = {
        BillingProfileId: req.request.BillingProfileId,
        GatewayId: req.request.PaymentGatewayId,
        amount: req.request.amount,
        NeedCreatePayment: '1',
        PaymentAllocationStrategy: req.request.PaymentAllocationStrategy,
        AutoAllocate: req.request.AutoAllocate,
        Note: req.request.PaymentNote,
        PaymentType: 'CREDIT CARD',
    };
    return BPConnection.GatewayRequestAuthorizenet.create(request).then(function (resp) {
        req.GatewayRequestId = resp[0].Id;
        return next(req);
    });
}

function sendTokenBasedAuthorizeNetRequest(req, next) {
    console.log('token');
    let request = {
        BillingProfileId: req.request.BillingProfileId,
        GatewayId: req.request.PaymentGatewayId,
        PaymentType: 'CREDIT CARD',
        amount: req.request.amount,
        NeedCreatePayment: '0',
        PaymentAllocationStrategy: req.request.PaymentAllocationStrategy,
        refId: req.PaymentGatewayTransactionId,
        customerProfileId: '1',
        customerPaymentProfileId: '1',
    };
    return BPConnection.GatewayRequestAuthorizenet.create(request).then(function (resp) {
        return next(req);
    });
}

function sendInputBasedAuthorizeNetRequest(req, next) {
    console.log('new');
    let request = {
        BillingProfileId: req.request.BillingProfileId,
        GatewayId: req.request.PaymentGatewayId,
        PaymentType: 'CREDIT CARD',
        amount: req.request.amount,
        NeedCreatePayment: '0',
        PaymentAllocationStrategy: req.request.PaymentAllocationStrategy,
        refId: req.PaymentGatewayTransactionId,
        opaqueDataDescriptor: req.opaqueData.dataDescriptor,
        opaqueDataValue: req.opaqueData.dataValue,
        address: req.request.bill_to_address_line1,
        city: req.request.bill_to_address_city,
        state: req.request.bill_to_address_state,
        zip: req.request.bill_to_address_postal_code,
        country: req.request.bill_to_address_country,
        email: req.request.bill_to_email,
    };
    return BPConnection.GatewayRequestAuthorizenet.create(request).then(function (resp) {
        return next(req);
    });
}

function loadAuthorizeNetRequest(req, next) {
    let query = "select apiUrl,merchantName,clientKey,refId,transId from GATEWAY_REQUEST_AUTHORIZENET where Id="
        + req.GatewayRequestId;
    return BPConnection.GatewayRequestAuthorizenet.queryAsync(query).single().then(function (resp) {
        req.GatewayRequest = resp;
        req.PaymentGatewayTransactionId = resp.refId;
        return next(req);
    });
}

/** </editor-fold> */

/** <editor-fold desc="### BRAINTREE IMPLEMENTATION ###"> */

function createBraintreeNonce(req, next) {
    let request = {
        creditCard: {
            number: req.request.card_number,
            cvv: req.request.card_cvn,
            expirationDate: req.request.card_expiry_month + '/' + req.request.card_expiry_year,
            billingAddress: {
                postalCode: req.request.bill_to_address_postal_code,
            },
        }
    };

    let promise = $.Deferred();

    require(['braintree'], function (bt) {
        bt.create({authorization: req.GatewayRequest.tokenizationKey}, function (clientErr, client) {
            if (clientErr) {
                promise.reject(clientErr);
            } else {
                client.request({
                    endpoint: 'payment_methods/credit_cards',
                    method: 'post',
                    data: request,
                }, function (nonceErr, response) {
                    if (nonceErr) {
                        promise.reject(nonceErr)
                    } else {
                        req.request.paymentMethodNonce = response.creditCards[0].nonce;
                        next(req)
                            .done(promise.resolve.bind(promise))
                            .fail(promise.reject.bind(promise));
                    }
                });
            }
        });
    });

    return promise;
}

function saveBraintreeRequest(req, next) {
    let request = {
        BillingProfileId: req.request.BillingProfileId,
        PaymentGatewayId: req.request.PaymentGatewayId,
        PaymentAllocationStrategy: req.request.PaymentAllocationStrategy,
        Amount: req.request.amount,
        NeedCreatePayment: '1',
        AutoAllocate: req.request.AutoAllocate,
        Note: req.request.PaymentNote,
        PaymentType: 'CREDIT CARD',
    };
    return BPConnection.GatewayRequestBraintree.create(request).then(function (resp) {
        req.GatewayRequestId = resp[0].Id;
        return next(req);
    });
}

function loadBraintreeRequest(req, next) {
    let query = "select tokenizationKey, PaymentGatewayTransactionId from GATEWAY_REQUEST_BRAINTREE where Id=" + req.GatewayRequestId;
    return BPConnection.GatewayRequestBraintree.queryAsync(query).single().then(function (resp) {
        req.GatewayRequest = resp;
        req.PaymentGatewayTransactionId = resp.PaymentGatewayTransactionId;
        return next(req);
    })
}

function sendTokenBasedBraintreeRequest(req, next) {
    let request = {
        BillingProfileId: req.request.BillingProfileId,
        PaymentGatewayId: req.request.PaymentGatewayId,
        PaymentGatewayTransactionId: req.PaymentGatewayTransactionId,
        PaymentAllocationStrategy: req.request.PaymentAllocationStrategy,
        PaymentType: 'CREDIT CARD',
        Amount: req.request.amount,
        NeedCreatePayment: '0',
        customerId: '1',
    };
    return BPConnection.GatewayRequestBraintree.create(request).then(function (resp) {
        return next(req);
    });
}



function sendInputBasedBraintreeRequest(req, next) {
    let request = {
        BillingProfileId: req.request.BillingProfileId,
        PaymentGatewayId: req.request.PaymentGatewayId,
        PaymentGatewayTransactionId: req.PaymentGatewayTransactionId,
        PaymentType: 'CREDIT CARD',
        Amount: req.request.amount,
        NeedCreatePayment: '0',
        Address1: req.request.bill_to_address_line1,
        City: req.request.bill_to_address_city,
        State: req.request.bill_to_address_state,
        Zip: req.request.bill_to_address_postal_code,
        Country: req.request.bill_to_address_country,
        Email: req.request.bill_to_email,
        paymentMethodNonce: req.request.paymentMethodNonce,
    };
    return BPConnection.GatewayRequestBraintree.create(request).then(function (resp) {
        return next(req);
    });
}

/** </editor-fold> */

function findPaymentGateways() {
    let query = "select p.Id,"
        + "p.GATEWAY_NAME as GatewayName,"
        + "p.IS_DEFAULT as IsDefault "
        + "from PAYMENT_GATEWAY p "
        + "where p.Status='ACTIVE' "
        + "and p.GATEWAY_TYPE='CREDIT CARD'"
      //  + "and p.ProcessType='CLIENT'";
    return BPConnection.PaymentGateway
        .queryAsync(query)
        .collection()
        .fail(notifyPaymentGatewaysFailure);
}

function loadPaymentGateways(req, next) {
    req.futures = req.futures || [];
    let idx = req.futures.length;
    req.futures.push(notFoundDefault(findPaymentGateways(), BPSystem.toBPCollection([], BPConnection.PaymentGateway)));
    return next(req).then(function (responses) {
        paymentGatewaysRef.set(responses[idx]);
        return responses;
    });
}

function selectPaymentGateway(gatewaysRef, gatewayAdapters, gatewayDefault) {
    return function (req, next) {
        let id = req.request.PaymentGatewayId;
        let gateways = gatewaysRef.get().elements || [];
        let selectedGateway = gatewayAdapters[gateways.filter(function (gateway) {
            return gateway.Id === id;
        }).map(function (gateway) {
            return gateway.GatewayName;
        })[0]];
        if (selectedGateway) {
            return selectedGateway(req).then(function () {
                return next(req);
            })
        } else if (gatewayDefault) {
            return gatewayDefault(req).then(function () {
                return next(req);
            })
        } else {
            return next(req);
        }
    }
}

function findDefaultPaymentGatewayId(gatewaysRef) {
    let value = gatewaysRef.get();
    let gateways = (value ? (value.elements ? value.elements : [value]) : []);
    return gateways
        .filter(function (gateway) {
            return "1" === gateway.IsDefault;
        })
        .map(function (gateway) {
            return gateway.Id;
        })[0];
}

function canUseToken(paymentGateways, billingProfile, paymentGatewayId) {
    return (billingProfile.PaymentGateway
        ? billingProfile.PaymentGateway === paymentGatewayId
        : !!paymentGateways.filter(function (paymentGateway) {
            return paymentGateway.Id === paymentGatewayId && paymentGateway.IsDefault;
        })[0])
}

function selectAuthorizationType(selectRef, gatewayAdapters) {
    return function (req, next) {
        let selection = (selectRef.getValue() === CREDIT_CARD_SELECT_NEW
            ? gatewayAdapters['INPUT']
            : gatewayAdapters['TOKEN']);
        if (selection) {
            return selection(req).then(function () {
                return next(req);
            });
        } else {
            return next(req);
        }
    }
}

function cybersourceSubmit(name, params) {
    BPDispatcher.dispatch({
        type: CYBERSOURCE_SUBMIT,
        name: name,
        data: params
    });
}

function doCancel() {
    cancel();
}

let SilentOrderForm = React.createClass({
    componentDidMount: function () {
        this.dispatcherIndex();
    },
    dispatcherIndex: function () {
        const that = this;
        let dispatcherId =
            BPDispatcher.register(function (payload) {
                if (payload.name == that.props.name) {
                    switch (payload.type) {
                        case CYBERSOURCE_SUBMIT:
                            that._submit(payload.data);
                            break;
                    }
                }
            });
        this.setState({dispatcher: dispatcherId});
    },
    componentWillUnmount: function () {
        BPDispatcher.unregister(this.state.dispatcher);
    },
    render: function () {
        return <form name={this.props.name} ref="form" method="post" action={this.props.url}>
        </form>
    },
    _submit: function (params) {
        let $form = $(ReactDOM.findDOMNode(this.refs.form));
        $form.empty();
        for (let name in params) {
            if (Object.prototype.hasOwnProperty.call(params, name)) {
                $form.append('<input type="hidden" name="' + name + '" value="' + nullToEmpty(params[name]) + '"/>')
            }
        }
        $form.submit();
    },
});

let PaymentForm = React.createClass({
    getInitialState: function () {
        return {};
    },
    componentDidMount: function () {
        const that = this;
        this.state.dispatcher =
            BPDispatcher.register(function (payload) {
                if (payload.name === that.props.name) {
                    switch (payload.type) {
                        case BPActions.CONSTANTS.REFRESH_STATE:
                            that.forceUpdate();
                            break;
                        default: // do nothing
                            break;
                    }
                }
            })
    },
    componentWillUnmount: function () {
        BPDispatcher.unregister(this.state.dispatcher);
    },
    render: function () {
        return (CREDIT_CARD_SELECT_NEW === creditCardSelect.getValue()
                ? <BPUI.Panel className="table-view">
                    <BPUI.PanelRow>
                        <BPUI.PanelRowColumn colSpan={2}>
                            {loadProgressCtl.progress > 0
                                ? <div className="progress">
                                    <div className="progress-bar progress-bar-striped active" role="progressbar"
                                         aria-valuenow={loadProgressCtl.progress} aria-valuemin="0" aria-valuemax="100"
                                         style={{width: "" + loadProgressCtl.progress + "%"}}/>
                                </div>
                                : <div/>}
                        </BPUI.PanelRowColumn>
                    </BPUI.PanelRow>
                    <BPUI.Message name="messages"/>
                    <BPUI.InputField variable={paymentRef} field="Amount" label="Amount" type="number" min="0.01"
                                     required/>
                    <BPUI.InputField type="SELECT1" variable={creditCardSelect} label="Choose Card"
                                     onUpdate={this.onCreditCardSelectionUpdate}/>
                    <BPUI.InputField variable={newBillingProfileRef} field="CreditCardNumber" label="Credit Card Number"
                                     pattern="[\d\s]{16,24}" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="CreditCardExpDate"
                                     label="Expiration Date (MM/YYYY)" pattern="[01]\d/20\d{2}" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="CreditCardCCV" label="CVV" type="password"
                                     autoComplete="new-password" pattern="\d{3,6}" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="CreditCardName" label="Card Holder Name"
                                     pattern="\S+\s+.+" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="Address1" label="Address" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="City" label="City" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="State" label="State" required={false}/>
                    <BPUI.InputField variable={newBillingProfileRef} field="Country" label="Country" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="Zip" label="Zip" required/>
                    <BPUI.InputField variable={newBillingProfileRef} field="Email" label="Email" type="email" required/>
                    <SilentOrderForm name="cybersource" url="https://testsecureacceptance.cybersource.com/silent/pay">
                    </SilentOrderForm>
                </BPUI.Panel>
                : <BPUI.Panel className="table-view">
                    <BPUI.PanelRow>
                        <BPUI.PanelRowColumn colSpan={2}>
                            {loadProgressCtl.progress > 0
                                ? <div className="progress">
                                    <div className="progress-bar progress-bar-striped active" role="progressbar"
                                         aria-valuenow={loadProgressCtl.progress} aria-valuemin="0" aria-valuemax="100"
                                         style={{width: "" + loadProgressCtl.progress + "%"}}/>
                                </div>
                                : <div/>}
                        </BPUI.PanelRowColumn>
                    </BPUI.PanelRow>
                    <BPUI.Message name="messages"/>
                    <BPUI.InputField variable={paymentRef} field="Amount" label="Amount" type="number" min="0.01"
                                     required/>
                    <BPUI.InputField type="SELECT1" variable={creditCardSelect} label="Choose Card"
                                     onUpdate={this.onCreditCardSelectionUpdate}/>
                    <SilentOrderForm name="cybersource" url="https://testsecureacceptance.cybersource.com/silent/pay">
                    </SilentOrderForm>
                </BPUI.Panel>
        );
    },
    onCreditCardSelectionUpdate: function () {
        this.forceUpdate();
    },
});

let submitAllowed = false;

function beforeSubmit() {
    let request = $.extend(true, {}, cybersource.get());
    delete request.type;
    delete request.tree;
    delete request.current;
    if (!submitAllowed
        && $('.table-view').is(':visible')) {
        submit({request: request}).fail(function () {
            resetClickCounter();
            $('*').css('cursor', '');
        }).done(function () {
            submitAllowed = true;
            resetClickCounter();
            if (!request.success) {
                makeXMLsubmit();
            }
        });
        throw new Error("Breaking redirect");
    }
}

BPUI.afterRender = function () {
    getGatewayProfileJPM();
    if ($('.table-view').is(':visible')) {
        BPActions.overrideSubmitButton({beforeSubmit: beforeSubmit});
        load({entityId: entityId}).always(runTests);
    }
};

/** <editor-fold description="### DEVELOPMENT UTILITIES ###" */

const Reporter = React.createClass({
    render: function () {
        return (DEVELOPMENT
            ? <BPUI.Panel width="100%">
                <BPUI.PanelRow width="100%">
                    <BPUI.PanelRowColumn colSpan="2">
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mocha/5.0.5/mocha.css"/>
                        <div id="mocha"/>
                    </BPUI.PanelRowColumn>
                </BPUI.PanelRow>
            </BPUI.Panel>
            : <div style={{display: 'none'}}/>);
    }
});

function runTests() {
    if (DEVELOPMENT) {
        require.config({
            paths: {
                mocha: 'https://cdnjs.cloudflare.com/ajax/libs/mocha/5.0.5/mocha',
                chai: 'https://cdnjs.cloudflare.com/ajax/libs/chai/4.1.2/chai'
            },
        });

        require(['chai', 'mocha'], function (chai) {
            const {expect} = chai;
            const mocha = window.mocha;
            mocha.setup('bdd');
            mocha.timeout(60000);
            mocha.suite.suites = [];

            const {describe, it} = window;

            function withDeferred(deferred, func, callback) {
                deferred.done(function () {
                    try {
                        func.apply(null, arguments);
                        callback();
                    } catch (e) {
                        console.error(e);
                        if (!(e instanceof Error)) {
                            callback(new Error(JSON.stringify(e)))
                        } else {
                            callback(e);
                        }
                    }
                }).fail(function (e) {
                    console.error(e);
                    if (!(e instanceof Error)) {
                        callback(new Error(JSON.stringify(e)))
                    } else {
                        callback(e);
                    }
                });
            }

            const successfulRequest = {
                request: {
                    BillingProfileId: 20,
                    AutoAllocate: 1,
                    Note: 'Test Payment',
                    amount: 1,
                    card_number: '4111111111111111',
                    card_cvn: '123',
                    card_expiry_month: '12',
                    card_expiry_year: '20',
                    bill_to_address_line1: 'TestAddr1',
                    bill_to_address_city: 'Sydney',
                    bill_to_address_state: 'TSTS',
                    bill_to_address_country: 'Australia',
                    bill_to_address_postal_code: '123456',
                    bill_to_email: 'test@mail.com',
                }
            };

            describe('AuthorizeNet Payment Gateway', function () {
                it('should be able to create payment', function (callback) {
                    let request = JSON.parse(JSON.stringify(successfulRequest));
                    request.request.PaymentGatewayId = 1;
                    withDeferred(createPaymentAuthorizeNet(request), function (token) {
                        expect(token).to.be.ok;
                    }, callback);
                });
            });

            describe.only('Braintree Payment Gateway', function () {
                it('should be able to create payment', function (callback) {
                    let request = JSON.parse(JSON.stringify(successfulRequest));
                    request.request.PaymentGatewayId = 290;
                    withDeferred(createPaymentBraintree(request), function (resp) {
                        expect(resp).to.be.ok;
                        expect(resp.PaymentStatus).to.be.eq('PENDING');
                    }, callback);
                });

                it('should be able to create and commit payment using input data', function (callback) {
                    let request = JSON.parse(JSON.stringify(successfulRequest));
                    request.request.PaymentGatewayId = 290;
                    withDeferred(createPaymentBraintree(request).then(commitPaymentByInputBraintree), function (resp) {
                        expect(resp).to.be.ok;
                        expect(resp.PaymentStatus).to.be.eq('PENDING');
                    }, callback);
                });
            });

            describe('Cybersource Payment Gateway', function () {
                it('should be able to create payment', function (callback) {
                    let request = JSON.parse(JSON.stringify(successfulRequest));
                    request.request.card_expiry_year = '2020';
                    withDeferred(tokenizeCybersource(request), function (token) {
                        expect(token).to.be.ok;
                    }, callback);
                });
            });

            mocha.run();
        });
    }
}

/** </editor-fold> */

const Preloader = React.createClass({
    render: function () {
        return (
            <div className="bpui-preloader">
                <div className="bpui-preloader-overlay"/>
                <div className="bpui-preloader-spinner">
                    <span className="preloader-spinner-text">Loading</span>
                    <span className="preloader-spinner-dots">...</span>
                </div>
            </div>
        );
    }
});


 
const getGatewayProfileJPM = async() =>{
    try{
      const queryGateway = await window.BPConnection.PAYMENT_GATEWAY_PROFILE.queryAsync(`
            SELECT MAX(pp.Id) AS Id 
            FROM PAYMENT_GATEWAY_PROFILE pp 
            WHERE pp.PaymentGatewayId=${PAYMENT_GATEWAY_ID_JPM} 
            AND pp.Status='ACTIVE'
            `).single();
      PAYMENT_GATEWAY_PROFILEID_JPM = queryGateway.Id;
      }catch(e){
        promise.reject(new Error(e))
      }
}

