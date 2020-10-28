/**
 * @should have @methods : 
 *      init() - @return @type {Promise<true | false>} true - init successfull , false - init failed
 *      customizeEncryptAction() - @return @type {object} of methods for card | @type {boolean = false} if error while load library/customize methods
 */
/*
export class Module {
    encryptionAction : boolean | EncCardObj = false; 
    initialized = false;
    moduleUrlArr = [
        'https://safetechpageencryptionvar.chasepaymentech.com/pie/v1/encryption.js',
        'https://safetechpageencryptionvar.chasepaymentech.com/pie/v1/64100000000005/getkey.js',
    ];
    constructor(public readonly nameInstance : string = 'base'){ }
    async init():Promise<boolean>{
        let scriptCountLeft = 0;
        return new Promise((resolve, reject)=>{
            try{
                const checkEmptyCount = () => {
                    if (scriptCountLeft===0){
                        this.initialized = true; 
                        resolve(true); 
                        this.scriptsWasLoaded();
                    }
                };
                if (this.initialized){
                    checkEmptyCount();
                }
                scriptCountLeft = this.moduleUrlArr.length;
                for (const moduleUrl of this.moduleUrlArr){
                    const script = document.createElement('script');
                    script.src = moduleUrl; 
                    script.async = true;
                    //don't add same script on the page twice
                    const scriptExists = document.querySelector(`script[src="${moduleUrl}"]`);
                    if (scriptExists){
                        scriptCountLeft = scriptCountLeft-1;
                        checkEmptyCount();
                    }else{
                        script.onload = () => {  
                            scriptCountLeft = scriptCountLeft-1;
                            checkEmptyCount();
                        };
                        document.body.appendChild(script);
                    }
                }
            }catch(e){
                reject(false); 
            }
        }); 
    }
    scriptsWasLoaded():void{ 
        switch(this.nameInstance){
            case 'base' : this.encryptionAction = this.customizeEncryptAction(); break; 
            default : this.encryptionAction = this.customizeEncryptAction(); break;
        }
    }

    customizeEncryptAction():EncCardObj{
        let loadLibsError = false;
        // (1) check download key error
        if (!(window.PIE && window.PIE.K && window.PIE.L &&
            window.PIE.E && window.PIE.key_id && window.PIE.phase)) {
                loadLibsError = true;
        }
        // (2) check download encryption error
        if (!(window.ValidatePANChecksum instanceof Function && window.ProtectPANandCVV instanceof Function)) {
                loadLibsError = true;
        }

        return { 
            loadLibsError,
            encryptData: (ccno : string, cvv : string, embed : string) => {
                const {phase: phaseId,key_id: keyId} = window.PIE;
                if (loadLibsError){ 
                    return false;
                }
                if (embed && !window.ValidatePANChecksum(ccno)) { 
                        return false;
                }
                const encryptedCardData = window.ProtectPANandCVV(ccno, cvv, !embed);
                if (encryptedCardData && encryptedCardData[2]){
                    const [encryptedCardNumber, encryptedCvv, integrityCheck] = encryptedCardData;
                        return {
                            encryptedCardNumber,
                            encryptedCvv,
                            encryptionDataDetails: { phaseId, keyId, integrityCheck }, 
                        };
                }else{
                    return false;
                }           
            }, 
            getCardType:function(number)
            {
                // visa
                var re = new RegExp("^4");
                if (number.match(re) != null) return "VI";
            
                // Mastercard
                re = new RegExp("^5[1-5]");
                if (number.match(re) != null) return "MC";
            
                // AMEX
                re = new RegExp("^3[47]");
                if (number.match(re) != null) return "AX";
            
                // Discover
                re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
                if (number.match(re) != null) return "DI";
            
                // Diners
                re = new RegExp("^36");
                if (number.match(re) != null) return "DD";
            
                // Diners - Carte Blanche
                re = new RegExp("^30[0-5]");
                if (number.match(re) != null) return "DD";
            
                // JCB
                re = new RegExp("^35(2[89]|[3-8][0-9])");
                if (number.match(re) != null) return "JC";
            
                // Visa Electron
                re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
                if (number.match(re) != null) return "VI";
            
                return null;
            } 
        };     
    }
} 

 
interface EncCardObj{
    loadLibsError:boolean,
    encryptData (ccno : string, cvv : string, embed : string): boolean | {
        encryptedCardNumber?:string | number | boolean,
        encryptedCvv?:string | number | boolean ,
        encryptionDataDetails?:{
            phaseId:string | number | boolean ,
            keyId:string | number | boolean ,
            integrityCheck:string | number | boolean 
        }}
}*/