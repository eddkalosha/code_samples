import {CONFIG_DATAFEEDS} from './config'
import {calcFieldsWidth,notifyError,fetchBillingProfile,fetchSettings} from './util'

export const ACHForm = () => {   
    const [state,setState] = React.useState({ 
      isWaiting:false,
      initialized:false, 
      updateCount:0
    });  
  
    React.useEffect(()=>{  
      const load = async()=>{  
        const [billingProfile,settings] = await Promise.all([
          fetchBillingProfile(),
          fetchSettings(),
        ]);
        if (!(billingProfile && settings)){
          notifyError('Billing Profile or settings loading error.')
          return false;
        }
        //load available GW  
        const [paymentGateway,paymentGatewayProfile] = await getGatewayDetails(billingProfile.PaymentGateway);
        if (!(paymentGatewayProfile && paymentGateway)){
          notifyError('Gateway initialization error. Check settings or try again later.')
        } 
        const {GatewayName} = paymentGateway;
        let dataFeedClass = CONFIG_DATAFEEDS[GatewayName]; 
  
        if (!dataFeedClass){
          notifyError(`DataFeed object initialization error. Selected gateway is ${GatewayName}.`)
          return false;
        }
        //select connected datafeed
        const dataFeed = new dataFeedClass(billingProfile,paymentGatewayProfile,settings,paymentGateway); 
        await dataFeed.init();
        dataFeed.updateCallback = (newDataFeed)=>{
          if (!is.Object(newDataFeed)){
            console.error('Please use DataFeed.updateCallback() with correct DataFeed object.')
            return false;
          }
          setState({
          ...state,
          dataFeed:newDataFeed,
          updateCount:state.updateCount+1, 
          initialized:true
        },()=>console.log('Updated by DataFeed event.'))}; 
        setState({...state,dataFeed,initialized:true})
      }
      load();
    },[]) 
    
    
    const onChange_ = (e,field) =>{
      const {dataFeed} = state;
      dataFeed.fields.find(el=>el.id===field.id).value = e.target.value;
      dataFeed.onChange(field.id,e.target.value);
      setState({...state,dataFeed});
    } 
     
    if (!state.initialized){ return <BPUI.Preloader/> } 
  
    const {step,stepsConfig,isWaiting} = state.dataFeed;
    const fieldsNoHidden = state.dataFeed.fields.filter(el=>el.display!==display.hidden);
    const fields = calcFieldsWidth(fieldsNoHidden);  
  
    const config = stepsConfig[step-1];
    if (!is.Object(config)){
      console.error('Please add \'stepsConfig\' property into your DataFeed object.')
      return null;
    }
    const {formMode,buttons} = config;
  
    return(<React.Fragment>
      {isWaiting && <BPUI.Preloader/>}
      <div className={`ach-p-form form-horizontal record-view col-2-layout ${formMode}`}> 
        {
          fields.map(field=>{  
            const firstFieldInGroup = field[0];  
            if (field.every(el=>el.display===display.hidden)) return null; 
            return firstFieldInGroup.type===types.custom?  firstFieldInGroup.value :(
              <BPUI.FormField required={firstFieldInGroup.display===display.standart && firstFieldInGroup.required} label={firstFieldInGroup.label}>{
                field.map((formItem,index)=>{ 
                const isFirstItem = index==0; // is it first item inside line? 
                const {label,onChange,width,value,display:visibility,type,values,required,hasError,className,currencyText} = formItem; 
                const {...attrs} = {...formItem, 
                    width:'-', 
                    className:`${type===types.select? 'bootstrap-select':'form-control'} ${hasError ? 'has-error':''} ${className}`, 
                    onChange:(e)=>{is.Function(onChange) && onChange(e); onChange_(e,formItem)}
                };
                let inputRender = (<span>{value}</span>); //default text output view 
                if (visibility===display.standart){
                  switch(type){
                    case types.select: inputRender = (<BPUI.Select {...attrs}>{is.Array(values) && values.map(v=><BPUI.Option selected={v.value===value} value={v.value} {...v} />)}</BPUI.Select>);  break;
                    case types.radio: inputRender = (  <React.Fragment>
                                                            {is.Array(values) && values.map(v=><label 
                                                              {...attrs} 
                                                              className={`form-radio form-normal form-text js-bpui-form-label ${v.value===value?'active':''}`}>
                                                                <input type="radio" checked={v.value===value}  value={v.value} {...v}  /> 
                                                                {v.title || v.label || v.value}</label>)} 
                                                        </React.Fragment>);  break; 
                    case types.checkbox: inputRender = (<div className="input-group">
                                                          <div className="checkbox">
                                                            <label className="form-checkbox form-normal form-primary">
                                                              <BPUI.Checkbox {...attrs} />
                                                            </label></div></div>);  break;
                    case types.divider: inputRender = (<div/>); break; 
                    default: inputRender = (currencyText? <div><i className="currency-text">{currencyText}</i> <BPUI.Text {...attrs} /></div>:<BPUI.Text {...attrs} />); //text
                  }
                } 
  
                return(<span>
                        { !isFirstItem && label && (
                            <React.Fragment>{visibility===display.standart && required && <img alt="" src="images/required.png"/>} 
                              <BPUI.PanelRowColumnLabel> {label} </BPUI.PanelRowColumnLabel>
                            </React.Fragment>)} 
                        {inputRender}
                      </span> 
                    ) 
                    })} 
               </BPUI.FormField>)})} 
      </div>
      {is.Array(buttons) && <div className="bottom-toolbar"><BPUI.NavToolBar>
        {  buttons.map(button=><BPUI.Button {...button} />) }
      </BPUI.NavToolBar></div>}
      </React.Fragment>
    ) 
  }