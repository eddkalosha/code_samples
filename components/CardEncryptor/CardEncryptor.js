/**
 * 
 * @name CardEncryptor
 * @author Edd Kalosha
 * @description:
 *      init @module CardEncryptor 
 *      get @module Module  // example @url './Module_JPM.js'
 *      initialize @module Module
 *      check initialization of @module Module
 *      @module Module 's methods will be available in @property {encryptionAction} of @module CardEncryptor     
 *      
 * @example:
 *  const cardEncr = new CardEncryptor();
 *  await cardEncr.loadModule('https://dev.billingplatform.com/r9dev/paymentgateways/1.0/tokenize/plugin/pluginName');
 *  if (cardEncr.isLoaded){
 *      console.log('Module methods',cardEncr.encryptionAction);
 *  }else{
 *      console.error('Error while initialized module');
 *  }
 */

const MODULE_DEFAULT_URL = 'https://dev.billingplatform.com/r9dev/paymentgateways/1.0/tokenize/plugin/123';

export class CardEncryptor {
    constructor(){
        this.encryptionAction = {};
        this.isLoaded = false;
    }
    async loadModule(moduleUrl = MODULE_DEFAULT_URL) {
        var myHeaders = new Headers();
        myHeaders.append("SessionId", window.BPSystem.sessionId);
        const requestOptions = {
            method: 'GET',
            headers: myHeaders,
        };
        try {
            const moduleRes = await fetch(moduleUrl, requestOptions);
            const module = await moduleRes.text();
            const moduleObj = new Function(module+'; return new Module();')();
            const { init, customizeEncryptAction } = moduleObj;
            if (init && customizeEncryptAction){
                await init.call(moduleObj);
                customizeEncryptAction.call(moduleObj);

                this.isLoaded = moduleObj.initialized && !moduleObj.loadLibsError;
            }
            this.encryptionAction = Object.assign({}, moduleObj.encryptionAction);
        }
        catch (e) {
            console.error('Some error while load library', e);
        }
    }
}
 