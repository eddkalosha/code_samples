/**
 * @should have @methods : 
 *      init() - @return @type {Promise<true | false>} true - init successfull , false - init failed
 *      customizeEncryptAction() - @return @type {object} of methods for card | @type {boolean = false} if error while load library/customize methods
 */

var Module = /** @class */ (function () {
    function Module() {
        this.moduleUrlArr = [
            'https://safetechpageencryptionvar.chasepaymentech.com/pie/v1/encryption.js',
            'https://safetechpageencryptionvar.chasepaymentech.com/pie/v1/64100000000005/getkey.js'
        ];
        this.initialized = false;
        this.encryptionAction = false;
    }
    Module.prototype.init = function () {
        var _this = this;
        var scriptCountLeft = 0;
        return new Promise(function (resolve, reject) {
            try {
                var checkEmptyCount_1 = function () {
                    if (scriptCountLeft === 0) {
                        _this.initialized = true;
                        console.log('all scripts was loaded, initialization successful.');
                        resolve(true);
                        _this.encryptionAction = _this.customizeEncryptAction();
                    }
                };
                if (_this.initialized) {
                    checkEmptyCount_1();
                }
                scriptCountLeft = _this.moduleUrlArr.length;
                var _loop_1 = function (moduleUrl) {
                    var script = document.createElement('script');
                    script.src = moduleUrl;
                    script.async = true;
                    //don't add same script on the page twice
                    var scriptExists = document.querySelector("script[src='" + moduleUrl + "']");
                    if (scriptExists) {
                        scriptCountLeft = scriptCountLeft - 1;
                        checkEmptyCount_1();
                    }
                    else {
                        script.onload = function () {
                            console.log('script loaded.', moduleUrl);
                            scriptCountLeft = scriptCountLeft - 1;
                            checkEmptyCount_1();
                        };
                        console.log('request script...', moduleUrl);
                        document.body.appendChild(script);
                    }
                };
                for (var _i = 0, _a = _this.moduleUrlArr; _i < _a.length; _i++) {
                    var moduleUrl = _a[_i];
                    _loop_1(moduleUrl);
                }
            }
            catch (e) {
                reject(false);
                console.error('Failed while initialize scripts', e);
            }
        });
    };
    Module.prototype.customizeEncryptAction = function () {
        var loadLibsError = false;
        // (1) check download key error
        if (( window.PIE===undefined ||  window.PIE.K===undefined || 
                window.PIE.L===undefined || window.PIE.E===undefined ||  
                window.PIE.key_id===undefined)) {
            loadLibsError = true;
        }
        // (2) check download encryption error
        if (!(window.ValidatePANChecksum instanceof Function && window.ProtectPANandCVV instanceof Function)) {
            loadLibsError = true;
        }
        return {
            loadLibsError: loadLibsError,
            encryptData: function (ccno, cvv, embed) {
                if (loadLibsError) {
                    console.error('[customizeEncryptAction ] was not customizated. Check libs loading.');
                    return false;
                }
                if (embed && !window.ValidatePANChecksum(ccno)) {
                    console.error("PAN has invalid checksum");
                    return false;
                }
                var _a = window.ProtectPANandCVV(ccno, cvv, !embed), encryptedCardNumber = _a[0], encryptedCvv = _a[1], integrityCheck = _a[2];
                var _b = window.PIE, phaseId = _b.phase, keyId = _b.key_id;
                if (!integrityCheck) {
                    console.error('Error: ProtectPANandCVV call returned null.You may have entered an invalid card number.');
                }
                return {
                    encryptedCardNumber: encryptedCardNumber,
                    encryptedCvv: encryptedCvv,
                    encryptionDataDetails: { phaseId: phaseId, keyId: keyId, integrityCheck: integrityCheck
                    }
                };
            },
            getCardType:function(number)
            {
                // visa
                var re = new RegExp("^4");
                if (number.match(re) != null) return "VI";
            
                // Mastercard
                re = new RegExp("^5[1-5]");
                if (number.match(re) != null) return "MC";
                re = new RegExp("^5[1-5][0-9]{0,14}|^(222[1-9]|2[3-6]\\d{2}|27[0-1]\\d|2720)[0-9]{0,12}")
                if (number.match(re) != null) return "MC";

                // AMEX
                re = new RegExp("^3[4|7]");
                if (number.match(re) != null) return "AE";
            
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
                re = new RegExp("^(?:2131|1800|35\d{3})\d{11}$");
                if (number.match(re) != null) return "JC";
            
                // Visa Electron
                re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
                if (number.match(re) != null) return "VI";
                re = new RegExp("/^4[0-9]\d+$/")
                if (number.match(re) != null) return "VI";
                return null;
            }
        };
    };
    return Module;
}());