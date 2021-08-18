export const calcFieldsWidth = (fields) => { 
    let count = 0, dest_arr = [], arr_tmp = [];
    for (let field of fields){
      let w = field.width || 100;
      if (count>=100){ 
        count = 0;
        dest_arr.push(arr_tmp);
        arr_tmp = new Array();
      } 
      count+=w; 
      arr_tmp.push(field);
    }
    dest_arr.push(arr_tmp);
    return dest_arr;
  }
  
export const notifyError = (errText)=>{
    let errorBlock  =  document.querySelector('.fieldError.summary');
    if (errorBlock){
      errorBlock.classList.remove('hide');
      errorBlock.innerHTML = errText; 
    }
    console.error(String(errText));
  }

export const clearError = () =>{
    let errorBlock  =  document.querySelector('.fieldError.summary');
    if (errorBlock){
      errorBlock.classList.add('hide');
    } 
  }
  
export const fetchBillingProfile = async()=>{
    try {
     const {BillingProfileId} = await window.BPConnection.BillingProfile.queryAsync('select BillingProfileId from CUSTOMER_BILLING_PROFILE WHERE SortOrder = 1').single();
     const billingProfile = await window.BPConnection.BillingProfile.retrieveFilteredAsync(`Id = ${BillingProfileId}`).single();
      return billingProfile
    } catch (error) {
      console.error('Billing Profile loading error.');
      return false;
    }
  }
  
export const fetchSettings =() =>{
    const query = `
    SELECT g.WidgetValue, 
    FROM AUTOPAYMENT_SETTINGS g 
    WHERE g.WidgetKey = 'agreementText'`;
  return window.BPConnection
            .BillingProfile
            .queryAsync(query)
            .single()
            .done(response => response)
            .fail((e)=>console.error('Error while get payment gateway settings.',e));
  }

 export const fetchCountries = async()=>{
    try {
      const countries = await BPConnection.COUNTRY.retrieveFiltered('1=1').collection()
      return countries.elements;
    } catch (error) {
      notifyError(error);
      return false;
    }
  }

export const checkFieldsValues = (fields) => {
    let errorCount = 0;
    const reqVisibleFields = fields.filter(el=>el.required && (el.display===display.output || el.display===display.standart)) 
    for (let field of reqVisibleFields){
      if (field.pattern){  
        if (!field.value || !new RegExp(field.pattern).test(field.value)){
          field.hasError = true;
          errorCount++;
        }
      }
    }  
    return !errorCount;
  }
  
  export const navigateToProfile = billingProfileId=> BPSystem.navigateTo('CUSTOMER_SELF_ACCOUNT_PROFILE', billingProfileId, 'R'); 

  export const reloadForm = () =>  {
    window.location.href = 'admin.jsp?name=CUSTOMER_PORTAL_HOME&key=1&mode=R';
  }; 


  