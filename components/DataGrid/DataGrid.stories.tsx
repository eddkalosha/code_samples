import * as React from 'react';
import { boolean, object, text } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';

import { accountFields, defaultChecked,treeData } from './mocks/data';
import { DataGrid as Grid } from './index';

type Account = {
  accountId: string | number,
  accountName: string,
};

type GridProps = Record<string, unknown>;

type DefaultChecked = Array<Record<string, string | number>>;

const nestedFields = [
  {name: 'Id', label: 'Product Id'}, 
  {name: 'Product_Name', label: 'Product Name'},
];
const nestedData = [
  {Id: 5, packId: 1, Product_Name: "Good 1"}, 
  {Id: 6, Product_name: 'Good 2', packId: 2},
];

const mainGroup = 'Main Controls';
const dataGroup = 'Data Objects';

const stories = storiesOf('Table/DataGrid', module).addParameters({ component: (Grid as React.ReactNode) });

const DataGrid = (props: GridProps) => React.createElement(Grid, props);

const { log } = console;

const getNestedGrid = (account: Account) => (
  <DataGrid 
    fields={object('Nested fields', nestedFields, dataGroup)} 
    data={object('Nested data', nestedData, dataGroup).filter(item => item.packId === account.accountId)}
  />
);

stories.add('Tree', () => {
  return (
    <DataGrid 
      baseField={text('Base field', 'accountId', mainGroup)} 
      treeBaseField={text('Tree base field', 'children', mainGroup)} 
      data={object('Dataset', treeData, dataGroup)} 
      fields={object('Fields', accountFields, dataGroup)} 
      tree={boolean('Show Tree', false, mainGroup)}
      showRadioButtons={boolean('Show Radio', false, mainGroup)}
      showCheckboxes={boolean('Show Checkbox', false, mainGroup)}
    />
  );
});

stories.add('Nested', () => {
  return (
    <DataGrid 
      baseField={text('Base field', 'accountId', mainGroup)} 
      treeBaseField={text('Tree base field', 'children', mainGroup)} 
      data={object('Dataset', treeData, dataGroup)} 
      fields={object('Fields', accountFields, dataGroup)} 
      tree={boolean('Show Tree', false, mainGroup)}
      showRadioButtons={boolean('Show Radio', false, mainGroup)}
      showCheckboxes={boolean('Show Checkbox', false, mainGroup)}
      getExpanded={getNestedGrid} 
      expandable
    />
  );
});

stories.add('Clickable Radio Row', () => {
  return (
    <DataGrid 
      baseField="accountId" 
      data={treeData} 
      fields={accountFields} 
      defaultChecked={defaultChecked as DefaultChecked}
      tree
      showRadioButtons
      onClickRow={log}
    />
  );
});

stories.add('Clickable Checkbox Row', () => {
  return (
    <DataGrid 
      baseField="accountId"  
      data={treeData} 
      fields={accountFields} 
      defaultChecked={defaultChecked as DefaultChecked}
      tree
      showCheckboxes
      onClickRow={log}
    />
  );
});
