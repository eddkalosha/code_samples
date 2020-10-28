/**
 * @should have @methods : 
 *      init() - @return @type {Promise<true | false>} true - init successfull , false - init failed
 *      customizeEncryptAction() - @return @type {object} of methods for card | @type {boolean = false} if error while load library/customize methods
 */

var Module = /** @class */ (function () {
    function Module() {
        this.moduleUrlArr = [
            'https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.17.0/js/md5.min.js'
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
                    var scriptExists = document.querySelector("script[src=\"" + moduleUrl + "\"]");
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
                    var moduleUrl = _a[_i
                    ];
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
        // (1) check download lib error
        if (( window.md5===undefined)) {
            loadLibsError = true;
        } 
        return {
            loadLibsError: loadLibsError,
            md5me: function(string){
                return window.md5(string)
            } 
        };
    };
    return Module;
}());