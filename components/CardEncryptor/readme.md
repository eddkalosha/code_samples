## WHAT IS PLATFORM?

Platform is the tool for provide payments in BP ecosystem via credit cards. Platform allows to use different providers with module system. Modules is a JS-files which load payment helpers libs and contain methods for processing credit cards. By using modules the Card Encryptor allows to use interface different modules without changes of own code, so it's very helpful when system of modules will grow. Payment widget could work with actions(methods) for credit cards such as tokenization, encryption, etc. for future processing payments or other things.

Parts of platform:
######    1) PAYMENT_PLATFORM (some magic is here)
######    2) MODULE
######    3) CARDENCRYPTOR
######    4) WIDGET

## HOW CARDENCRYTOR INTERACT WITH THE PLATFORM? 

[WIDGET] <-------> [CARDENCRYPTOR]  <---------> [MODULE] <-------> [PAYMENT_PLATFORM]
_______________________________________|     |________________________________________
FRONTEND PART                                                             BACKEND PART

## WHAT IS CARD ENCRYPTOR? 
All realized methods in MODULE will be available in property encryptionAction of CardEncryptor object.

## WHAT IS THE MODULE? 
Module is JS-file which allows you to realize interface(prototyped methods) for payment things such as encryption card or checking type of card.

## OWN MODULE REALIZATION
Module is JS function with prototyped methods. 
Required methods: `init` & `customizeEncryptAction`
Example of module: 
[JPM Module for card encryption](./Module_JPM.js)


###### method `init` 
should return a JS-Promise<boolean> object with successfully or failed initializing of module

Example:
```
Module.prototype.init = function () { 
       // const variables = ...; 
        return new Promise(function (resolve, reject) {
            try {
                // initialize scripts (for example dowload and append on HTML-tree)
                // check if scripts successfully was added on page
                // check scripts variables - if we could use them now 
                resolve(true); 
            }
            catch (e) {
                reject(false);
                console.error('Failed while initialize scripts', e);
            }
        });
    }
```

###### method `customizeEncryptAction` 
should return JS-object with methods and variables for actions. This JS-obect may include any function or variables to implements methods of used libraries from `init` method.

Example:
```
Module.prototype.customizeEncryptAction = function () {
        //... some util code (check init variables, other checks)...
        return {
            loadLibsError: false,
            encryptData: function (ccno, cvv, embed) { ...},
            getCardType:function(number) { ... }
        };
    };
```
## HOW TO USE CARDENCRYPTOR IN WIDGETS? 

Example:
```
const PAYMENT_GATEWAY_PROFILEID_JPM = 2;
const JPM_MODULE_URL = 'r9dev/paymentgateways/1.0/tokenize/plugin/'+PAYMENT_GATEWAY_PROFILEID_JPM;
 
const cardEncryptor = new BPUI.Tools.CardEncryptor();
    cardEncryptor
        .loadModule(JPM_MODULE_URL)
        .then(()=>{ 
            if (cardEncryptor.isLoaded){
                const {encryptData,getCardType} = cardEncryptor.encryptionAction; //
                const cardType = getCardType(cardNumber);
                const encryptedCardData = encryptData(cardNumber,cardCvv,cardEmbed);
                const body = {
                            cardType,
                            encryptedCardData,
                            expirationDate:moment(CreditCardExpDate,'MM/YYYY').startOf('month').format('YYYY-MM-DD'),
                            maskedCardNumber
                }; 
                const bodyTo64 = btoa(unescape(JSON.stringify(body))); 
                console.log(bodyTo64);
                alert('success');
            }else{  
                console.error(new Error('Error while initialized payment module'))
        }});
```