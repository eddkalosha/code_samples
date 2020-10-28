export const treeData = [
  {
    accountId:1, 
    accountName:"Parent Account1", 
    children:[
      {accountId:2, accountName:"Child Account2"}, 
      {accountId:3, accountName:"Child Account3"}
    ]
  },
  {
    accountId:5, 
    accountName:"Parent Account5",
  },
  {
    accountId:6, 
    accountName:"Parent Account6",
  }
];

export const accountFields = [
  {name:'accountId', label:'Account ID'}, 
  {name:'accountName', label:'Account Name'}
];

export const defaultChecked = [
  {key: 'accountId', value: 2}, 
  {key: 'accountId', value: 5}
];