import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { DataGrid } from './index';
import { treeData, accountFields, defaultChecked } from './mocks/data';

let result = null;

function renderGrid(props) {
  const renderUtils = render(
    <DataGrid 
      baseField="accountId" 
      tree
      {...props}
    />
  );
  
  return renderUtils;
};

beforeEach(() => {
  result = null;
});

describe('Table / DataGrid', () => {
  it('should render in DOM', () => {
    const { getByText } = renderGrid({ 
      data: treeData, 
      fields: accountFields, 
      showRadioButtons: true,
      onClickRow: data => (result = data) 
    });

    expect(getByText('', { selector: '.bpui-data-grid' })).toBeInTheDocument();
  });

  it('should check radio button passed in defaultChecked property', () => {
    const { getAllByText } = renderGrid({ 
      data: treeData, 
      fields: accountFields, 
      showRadioButtons: true,
      defaultChecked
    });

    expect(getAllByText('', { selector: '.bpui-radio:checked' })).toHaveLength(1);
  });

  it('should check checkboxes passed in defaultChecked property', () => {
    const { getByText, getAllByText } = renderGrid({ 
      data: treeData, 
      fields: accountFields, 
      showCheckboxes: true,
      defaultChecked
    });

    fireEvent.click(getByText('', { selector: '.tree a.bpui-button-expand' }));

    expect(getAllByText('', { selector: '.bpui-check:checked' })).toHaveLength(2);
  });

  it('should handle row click', () => {
    const { getByText } = renderGrid({ 
      data: treeData, 
      fields: accountFields, 
      showRadioButtons: true,
      onClickRow: data => (result = data) 
    });

    fireEvent.click(getByText('', { selector: 'tbody .bpui-grid-tr:first-child' }));
  
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('accountId');
  });
});