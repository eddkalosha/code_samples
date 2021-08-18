import {DataFeedPayeezy,DataFeedGoCardless,DataFeedJPM} from './datafeeds'

export const CONFIG_DATAFEEDS = {
    'Payeezy_DD':DataFeedPayeezy,
    'GOCARDLESS':DataFeedGoCardless,
    'JPM_DD':DataFeedJPM
  };

export const states = {
    AU:[{ "value": "ACT" },
      { "value": "NSW" },
      { "value": "NT" },
      { "value": "QLD" },
      { "value": "SA" },
      { "value": "TAS" },
      { "value": "VIC" },
      { "value": "WA" }]};
  
export const types = {
    text:'TEXT',
    number:'NUMBER',
    select:'SELECT1',
    checkbox:'CHECKBOX',
    radio:'RADIO',
    divider:'DIVIDER',
    custom:'CUSTOM'
  };

export const display = {
    standart:'standart',
    hidden:'hidden',
    output:'output'
  };

export const patterns = {
    textAndNumbers:'a-zA-Z0-9',
    numbersWithDashesAndWhiteSpaces:"^[0-9]+$|[0-9]+( [0-9]+)+$|[0-9]+(-[0-9]+)+$",
    textOnly:"^[A-Za-z -]+$",
    numbersOnly:"^[0-9-]*$",
    address:".*",
    postalCode:".*",
    email:"^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
  };