import React, {useState} from "react";
 
const initialFieldsModel = [{
  id:'username-input',
  name:'login',
  type:'text',
  value:'' 
},{
  id:'password-input',
  name:'password',
  type:'password',
  value:''  
}];

const initialFields = initialFieldsModel.reduce((sum,el)=>{
  sum[el.name] = el.value;
  return sum;
},{});
 
const LoginForm = ({ onSubmit }) => {
  const [fields,setState] = useState(initialFields);
  const [fieldsModel] = useState(initialFieldsModel)

  const onSubmitHandler = () =>{
    setState(initialFields);
    onSubmit(fields) 
  }

  const onChange = (e,name) => { 
    setState({...fields,[name]:e.target.value})
  } 

  return (<div> 
      {fieldsModel.map((el,i)=><input 
            key={i}
            id={el.id}
            type={el.type}  
            value={fields[el.name]}   
            onChange={e=>onChange(e,el.name)}
          />)}
      <button  
        id="login-button" 
        onClick={()=>onSubmitHandler()}> Submit </button> 
  </div>);
}

export default LoginForm;
