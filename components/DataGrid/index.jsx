import * as React from 'react';
import createReactClass from 'create-react-class';
import { is } from '../../Tools/getType';
import { hash } from '../../Tools/hash';
import Markdown from 'markdown-to-jsx';
import './style.scss';
import { render } from '@testing-library/react';

/**
 * @component BPUI.DataGrid
 * @description Pure table component for view mode. Shows object-like data in standard table view.
 * @description All rows can be expanded and show any information.
 * @prop tableClass - Override table class
 * @prop tableStyle - Override table style
 * @prop theadClass - Override table header class
 * @prop trClass - Override table row class
 * @prop trStyle - Override table row style
 * @prop tdClass - Override table cell class
 * @prop tdStyle - Override table cell style
 * @prop trExpandedClass - Override table subrow class
 * @prop trExpandedStyle - Override table subrow style
 * @prop fields - Array of fields to show, one item generates one column - [{name:"Id", label:"Identifier"}]
 * @prop data - Array of records. Each record generate one row with {@prop fields} columns connects on dataArrayItem["field.name"]  -  [{"Id":2345}]
 * @prop sortField - {field:"field.name", method:"asc" || "desc} - add asc or desc mark to table header column to indicate sorting.
 * @prop onClickRow - function that will trigger on row click, except clicking on expand button or links with "no-propagination" class.
 * If not a function hover and cursor effects will be disabled.
 * @prop expandable - boolean. If true, will show plus icon button, that will expand additional connected row.
 * @prop getExpanded(rowItem, rowIndex) - function that returns value for additional row.
 * @prop onHeaderClick - function that will be trigger on header item click. Useful for sorting change.
 * @prop showCheckboxes - boolean. If true shows checkboxes on every rows.
 * @prop onCheckboxChange - function(tableItem, Event, treeLevel). Fires on every checkbox change
 * @prop showRadioButtons - boolean. Show radio button in row if enabled.
 * @prop onRadioButtonChange - function(tableItem, Event, treeLevel). Fires on every radio button change
 * @prop defaultChecked - array of rules, that describe condition for item to be checked ([{key: 'Id', value: 2}])
 * @prop tree - boolean. If true, every item with {@property children - [{item}]} will generates child elements with the same columns, that main table.
 * @prop treeBaseField - string. Defines name of tree children fiels (default is 'children').
 * If not a function hover and cursor effects will be disabled.
 *
 * @example Simple list
 * const fields = [{name:'Id', label:'Product Pack ID'}, {name:'Product_Pack_Name', label:'Product Pack Name'}];
 * const data = {[{Id:1, Product_Pack_Name:'Pack 1'}, {Id:2, Product_Pack_Name:"Pack 2"}]}
 * <DataGrid fields={fields} data={data}/>
 *
 * @example Simple list with sorting and linking
 * function onClickRow(item){window.location.search = 'admin.do?key='+item.Id}
 * function sort(field){ [ sorting data array by field.name] [ rerender root component ]}
 * <DataGrid fields={fields} data={data} onHeaderClick={sort} onClickRow={onClickRow}/>
 *
 * @example Expanded
 * function getExpanded(item){ return <div className="grid-detail">Detail Info for Item ${item.Id} [ ... ]</div>}
 * <DataGrid fields={fields} data={data} getExpanded={getExpanded} expandable={true}/>
 *
 * @example Nested Grid
 * const nestedFields = [{name:'Id', label:'Product Id'}, {name:'Product_Name', label:'Product Name'}]
 * const nestedData = [{Id:5, packId:1, Product_Name:"Good 1"}, {Id:6, Product_name:'Good 2', packId:2}]
 * function getNestedGrid(item){ return <DataGrid fields={nestedFields} data={nestedData.filter(item=>item.packId === item.Id)}/>}
 * <DataGrid fields={fields} data={data} getExpanded={getNestedGrid} expandable={true}/>
 *
 * @example Tree Grid
 * const treeData = [{accountId:1, accountName:"Parent Account", children:[{accountId:2, accountName:"Child Account"}]}]
 * const accountFields = [{name:'accountId', label:'Account ID'}, {name:'accountName', label:'Account Name'}];
 * <DataGrid data={treeData} fields={accountFields} tree={true}/>
 *
 * @example List with checkboxes
 * const selectedIds = new Set();
 * function onChangeCheckbox(tableItem, el){
 *      if(el.checked === true){selectedIds.add(tableItem.Id)} else{selectedIds.delete(tableItem.Id)};
 * }
 * <DataGrid fields={fields} data={data} showCheckboxes={true} onCheckboxChange={onChangeCheckbox}/>
 */
// console.log("Defining BPUI.DataGrid");

const GridSubMenu = createReactClass({
    getInitialState : function(){
        return{
            open:false
        }
    },
    onToggleMenu:function(){  
        const {open} = this.state;
        const {onToggle} = this.props;
        if (is.Function(onToggle)) onToggle(!open); 
        this.setState({open:!open});
    },
    CancelBubble(e){
        e.cancelBubble = true;
        e.stopPropagation();
    },
    render(){
    const {items,className,classNameOpened,classNameBtn,classNameBtnOpened,
            itemClassName,onItemClick} = this.props;
    const {open} = this.state;
    return( 
        <div className={`${open? classNameOpened:className} bpui-grid-submenu`}>
        <span onClick={e=>{this.onToggleMenu();this.CancelBubble(e)}} className={`menu-btn`}><i className={`${open?classNameBtnOpened:classNameBtn}`} aria-hidden="true" /></span>
        {open && <ul className={`menu`}>
            {items.map((el,i)=><li 
                className={itemClassName} 
                onClick={e=>{onItemClick(e,i,el);this.CancelBubble(e)}} 
                value={el}><a>{el}</a></li>)
            }
        </ul> 
        }
        </div>
    )
    }
});


export const DataGrid = createReactClass({
    previousItem: null,
    previousItems: [],
    refSymbolCheckbox: Symbol('reference'),
    getDefaultProps: function () {
        return {
            tableClass: 'bpui-data-grid',
            tableStyle: {},
            theadClass: 'bpui-grid-head',
            trClass: 'bpui-grid-tr',
            menuClass:'bpui-grid-menu',
            trStyle: {},
            tdClass: 'bpui-grid-td',
            tdStyle: {},
            trExpandedClass: 'bpui-grid-expanded',
            trExpandedStyle: {},
            fields: [],
            data: [],
            showMenu:false,
            getExpanded: (params) => (<div className="expland-wrapper">Test</div>),
            sortField: void 0,
            showCheckboxes: false,
            defaultExpandTree: false,
            treeBaseField: 'children',
            baseField: 'Id',
            disableChildrenCheckboxes: false,
            autoCheckParents: false,
            checkboxFlagField: Symbol('checked')
        };
    },
    shouldComponentUpdate({ tree, expandable, showCheckboxes, showRadioButtons }) {
        const isButtonTypeExclusive = ![showCheckboxes, showRadioButtons].every(x => x);
        const isValidTree = ![tree, expandable].every(x => x);
        let shouldUpdate = true;

        if (!isButtonTypeExclusive) {
            shouldUpdate = false;
            console.warn('DataTree button type should be exclusive');
        } else if (!isValidTree) {
            shouldUpdate = false;
            console.warn('DataTree should not have both tree & expandable props');
        }

        return shouldUpdate;
    },
    onClickExpand: function (i) {
        const { expandedRows } = this.state;
        if (expandedRows.has(i)) {
            expandedRows.delete(i);
        } else {
            expandedRows.add(i);
        }
        this.setState({ expandedRows });
    },
    getInitialState: function () {
        return {
            expandedRows: new Set(),
            treeMarks: new Set()
        };
    },
    onRowClick: function (item, i, e) {
        const { showCheckboxes } = this.props;
        const handlerType = showCheckboxes ? 'onCheckboxChangeHandler' : 'onRadioButtonChangeHandler';
        const isControl = e.target.type && ['checkbox', 'radio'].indexOf(e.target.type) > -1;
        const uniqueField = Object.getOwnPropertySymbols(item).find(sym => /\b(reference)\b/g.test(sym.toString()));
        const uniqueItem = !isControl && uniqueField && item[uniqueField];

        let target = e.target;
        const parentTagNames = new Set(['TD', 'A', 'TR']);
        while (!parentTagNames.has(target.nodeName)) {
            target = target.parentNode;
        }
        if (target.classList.contains('no-propagation')) return;

        if (uniqueItem) {
            if (showCheckboxes) uniqueItem.checked = !uniqueItem.checked;
            this[handlerType](item, item.level, item.parent, { ...e, row: true, target: uniqueItem });
        }

        if (is.Function(this.props.onClickRow)) this.props.onClickRow(...arguments);
    },
    getTreeItem: function (children, level, parent) {
        if (!level) level = 1;
        return this.getRows(children, level, parent);
    },
    onClickExpandTree: function (item, level) {
        const { baseField, onExpandNode } = this.props;
        const { treeMarks } = this.state;
        const baseValue = item[baseField];
        if (baseValue === void 0) throw new Error('Base field is undefined');
        if (treeMarks.has(baseValue)) {
            treeMarks.delete(baseValue);
        } else {
            treeMarks.add(baseValue);
        }
        this.setState({ treeMarks }, () => {
            is.Function(onExpandNode) && onExpandNode(item, level);
        });
    },
    onCheckboxChangeHandler: function (items, level, parent, event) {
        const { checkboxFlagField, onCheckboxChange, autoCheckParents } = this.props;
        const checked = event.target.checked;

        items[checkboxFlagField] = checked;

        if (!this.checkingParents) this.checkChildren(items, checked);

        if (level && checked && autoCheckParents) {
            this.checkingParents = true;
            this.checkParents(parent);
            this.checkingParents = false;
        }

        if (is.Function(onCheckboxChange)) {
            onCheckboxChange(items, event, level);
        }
    },
    onRadioButtonChangeHandler: function (item, level, parent, event) {
        const { baseField, checkboxFlagField, onRadioButtonChange } = this.props;
        const isNextItem = this.previousItem && item.Id !== this.previousItem.Id;
        const hasHandler = is.Function(onRadioButtonChange);
        const shouldRunHandler = hasHandler && (this.previousItem === null || isNextItem);
        const Id = item.id || item[baseField] || item.node_key || hash();

        event.target.checked = true;

        item[checkboxFlagField] = true;

        if (this.previousItem === null) {
            this.previousItem = { Id, el: item[this.refSymbolCheckbox] };
        } else if (isNextItem) {
            this.previousItem.el.checked = false;
            this.previousItem = { Id, el: item[this.refSymbolCheckbox] };
        }

        if (shouldRunHandler) onRadioButtonChange(item, event, level);
    },
    checkParents(parent) {
        const checkbox = parent[this.refSymbolCheckbox];
        if (checkbox && !checkbox.checked) checkbox.click();
    },
    checkChildren: function (item, checked) {
        const { treeBaseField, checkboxFlagField, onCheckboxChange } = this.props;
        const isCollection = item && Object.prototype.toString.call(item[treeBaseField]) === '[object Array]';

        if (!isCollection) return;
        for (let i = 0; i < item.children.length; i++) {
            const child = item.children[i];
            child[checkboxFlagField] = checked;
            if (child[this.refSymbolCheckbox]) {
                child[this.refSymbolCheckbox].checked = checked;
            } else {
                if (is.Function(onCheckboxChange === 'function')) {
                    onCheckboxChange(item, { target: { checked } }, -1);
                }
            }
            this.checkChildren(child, checked);
        }
    },
    addReferenceCheckbox: function (item, ref, checkDefault) {
        if (!item || !ref) return;

        const { baseField, showCheckboxes, showRadioButtons, defaultChecked } = this.props;
        const newRef = is.Function(ref.getDOMNode) ? ref.getDOMNode() : ref;
        const Id = item.id || item[baseField] || item.node_key || hash();
        const isDefaultChecked = checkDefault &&
            defaultChecked.some(condition => {
                let match = false;

                if (is.Object(condition)) {
                    match = item[condition.key] === condition.value;
                }

                return match;
            });
        const isNotHardcodeChecked = checkDefault && !item.hasOwnProperty('checked');    
        const shouldDefaultCheck = checkDefault && isDefaultChecked;    
        const shouldCheck = shouldDefaultCheck || item.checked;
        const isValidRadioCheck = showRadioButtons && !this.previousItem;
        const isValidCheckboxCheck = isNotHardcodeChecked ? !this.previousItems.some(prevId => prevId === Id) : showCheckboxes;
        const shouldCheckRadio = shouldCheck && isValidRadioCheck;
        const shouldCheckCheckbox = shouldCheck && isValidCheckboxCheck;

        item[this.refSymbolCheckbox] = newRef;

        if (shouldCheckRadio) {
            newRef.checked = true;
            this.previousItem = { Id, el: newRef };
        } 
        else if (shouldCheckCheckbox) {
            newRef.checked = true;
            this.previousItems.push(Id);
        }
    },
    renderButton: function ({ item, level, parent, hasChildren }) {
        const {
            tree,
            defaultChecked = [],
            showCheckboxes,
            showRadioButtons,
            disableChildrenCheckboxes,
            disableChildrenRadioButtons
        } = this.props;
        const isButtonTypeExclusive = ![showCheckboxes, showRadioButtons].every(x => x);
        const enableRadio = tree && hasChildren;
        const disabledCheckbox = disableChildrenCheckboxes && level;
        const disabledRadio = enableRadio || (disableChildrenRadioButtons && level);

        // Checkboxes column
        if (isButtonTypeExclusive) {
            if (showCheckboxes) {
                return (
                    <input
                        type="checkbox"
                        className="bpui-check"
                        ref={ref => this.addReferenceCheckbox(item, ref, !!defaultChecked.length)}
                        defaultChecked={item[this.symbolChecked]}
                        disabled={disabledCheckbox}
                        onChange={this.onCheckboxChangeHandler.bind(this, item, level, parent)}
                    />
                );
            } else if (showRadioButtons) {
                return !enableRadio ? (
                    <input 
                        type="radio" 
                        className="bpui-radio" 
                        ref={ref => this.addReferenceCheckbox(item, ref, !!defaultChecked.length)}
                        defaultChecked={item[this.symbolChecked]}
                        disabled={disabledRadio}
                        onChange={this.onRadioButtonChangeHandler.bind(this, item, level, parent)}
                    />
                ) : null;
            }
        }
    },
    getRows: function (children, level, parent) {
        const {
            fields,
            getExpanded, expandable,
            trClass,
            trStyle,
            tdClass,
            menuClass,
            tdStyle,
            trExpandedClass,
            trExpandedStyle,
            onClickRow,
            showRadioButtons,
            onCheckboxChange, showCheckboxes,
            tree, treeBaseField, baseField,
            defaultExpandTree, disableChildrenCheckboxes,
            showMenu
        } = this.props;
        const data = children || this.props.data;
        const { expandedRows, treeMarks } = this.state;
        level = level || 0;
        const rows = [];
        const hasControls = showCheckboxes || showRadioButtons;
        const hasHandlers = is.Function(onClickRow) || is.Function(onCheckboxChange) ? 'clicable' : '';
        const isClicable = hasControls && hasHandlers; 

        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            //Base field columns
            const columns = fields.map(field => (
                <td key={field.name} className={field.tdClass || tdClass} style={field.tdStyle || tdStyle}>{item[field.name]}</td>
            ));

            // Expand button column
            const expandClass = expandedRows.has(i) ? 'expand-icon expand-minus' : 'expand-icon expand-plus';
            if (expandable) columns.unshift(
                <td key={`${tdClass} expander`} className={`${tdClass} expander`} style={tdStyle}>
                    {item.expandable !== false ? (
                        <a href="javascript:void(0)" className="bpui-button-expand no-propagation"
                            onClick={this.onClickExpand.bind(this, i)}>
                            <i className={expandClass} />
                        </a>) : ''}
                </td>
            );

            // Expand tree children button
            const inMarks = treeMarks.has(item[baseField]);
            const isExpandedTree = defaultExpandTree !== inMarks;
            const expandClassTree = isExpandedTree ? 'expand-icon expand-minus' : 'expand-icon expand-plus';
            const hasControls = showCheckboxes || showRadioButtons;
            const hasChildren = item && Object.prototype.toString.call(item[treeBaseField]) === '[object Array]';
            const isNested = parent;
            const dummyColumnInsertMethod = showCheckboxes ? 'push' : 'unshift';
            const treeStyle = {
                fontSize: '11px',
                width: level * 20 + (isNested ? 30 : 70),
                padding: `0 0 0 ${isNested ? level * 35 : 0}px`,
            };

            if (tree) {
                columns.unshift(
                    <td key={`tree${i}`} className={tdClass}>
                        <div className={`tree ${isNested ? 'children' : ''}`} style={treeStyle}>
                            {this.renderButton.call(this, { item, level, parent, hasChildren })} 
                            {
                                hasChildren ?
                                    <a href="javascript:void(0)" className="bpui-button-expand no-propagation"
                                        onClick={this.onClickExpandTree.bind(this, item, level)}>
                                        <i className={expandClassTree} />
                                    </a> :
                                    null
                            }
                            <i className="fa fa-long-arrow-right" />
                        </div>
                    </td>
                );
            }

            {
                !expandable && hasControls ?
                    columns[dummyColumnInsertMethod](
                        <td key={`thin${i}`} className={`${tdClass} thin`} />
                    ) : null
            }

            {
                !tree && hasControls ?
                    columns.unshift(
                        <td key={`td-check${i}`} className={`${tdClass} td-check`}>
                            {this.renderButton.call(this, { item, level, parent, hasChildren })}
                        </td>
                    ) : null
            }

            {
                showMenu ?
                    columns.unshift(
                        <td className={`${tdClass} ${menuClass}`}>
                            <GridSubMenu  
                                classNameBtnOpened={'fa fa-cog text-success'}
                                classNameBtn={'fa fa-sitemap'}
                                items={[
                                <label><input type="checkbox" checked={true}/> Select with children nodes</label>, 
                                ]} 
                            />  
                        </td> 
                    ) : null
            }

            rows.push(
                <tr className={`${trClass} ${isClicable}`}
                    style={trStyle}
                    key={`data-grid-raw-${item[baseField]}`}
                    data-key={`data-grid-raw-${item[baseField]}`}
                    onClick={this.onRowClick.bind(this, Object.assign(item, { parent, level }), i)}
                >  
                    {columns}
                </tr>
            );

            // Additional row if expanded
            if (expandedRows.has(i) && is.Function(getExpanded)) {
                const expanded = getExpanded(item, i);

                rows.push(
                    <tr key={`${trExpandedClass}${i}`} className={trExpandedClass} style={trExpandedStyle}>
                        <td className="data-grid-td-expand">
                            <i className="fa fa-level-down" />
                        </td>
                        <td colSpan={fields.length + (!!showCheckboxes || !!showRadioButtons)}>
                            {expanded}
                        </td>
                    </tr>
                );
            }

            // Tree children rows
            if (tree && hasChildren && isExpandedTree) {
                rows.push.apply(rows, this.getTreeItem(item[treeBaseField], (level || 0) + 1, item));
            }

        }
        return rows;
    },
    checkAll: (e, that) => {
        const { checkboxFlagField } = that.props;
        const data = that.props.data;
        const checked = e.target.checked;
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            item[checkboxFlagField] = checked;
            item[that.checkboxFlagField] = true;
            if (item[that.refSymbolCheckbox]) item[that.refSymbolCheckbox].checked = checked;
            that.checkChildren(item, checked);
        }
        if (is.Function(that.props.onCheckAll)) that.props.onCheckAll(checked);
    },
    render: function () {
        const {
            fields,
            tableClass,
            tableStyle,
            theadClass,
            expandable,
            tdClass,
            tdStyle,
            onHeaderClick,
            sortField,
            showCheckboxes,
            showRadioButtons,
            tree,
            showMenu
        } = this.props;
        if (!fields || !fields.length) return (<div className="bpui-datagrid-empty">Empty</div>);
        const rows = this.getRows();
        let sortClass = void 0;
        if (sortField && sortField.method) {
            sortClass = 'fa fa-sort-' + sortField.method;
        }
        const hasControls = showCheckboxes || showRadioButtons;
        const treeWithoutControls = tree && !hasControls;
        const headerClicableClass = is.Function(onHeaderClick) ? ' clicable' : '';
        const onHeaderClickHandler = is.Function(onHeaderClick) ? onHeaderClick : () => { };

        return (
            <div className="bpui-datagrid-wrapper">
                <Markdown>{`<div>asdasd<br/>sdfsdf<p>dd</p> <b>test markdown</b></div>`}</Markdown>
                <table className={tableClass} style={tableStyle}>
                    <thead className={theadClass}> 
                        <tr>
                        { showMenu && <td className={`${tdClass}`}></td>  }
                            {
                                showCheckboxes ?
                                    <td className={tdClass + ' td-check check-all'}>
                                        <input
                                            type="checkbox"
                                            className="bpui-check check-all"
                                            onChange={(e) => {
                                                this.checkAll(e, this)
                                            }}
                                        />
                                    </td> : null
                            }
                            {showRadioButtons || treeWithoutControls ? <td className={tdClass} /> : null}
                            {!expandable && showRadioButtons && <td className={`${tdClass} tree icon`} />} 
                            {expandable && <td className={tdClass + ' expander'} />}
                            {fields.map(field => (
                                <td
                                    key={field.name}
                                    className={(field.tdClass || tdClass) + headerClicableClass}
                                    style={field.tdStyle || tdStyle}
                                    onClick={onHeaderClickHandler.bind(this, field)}
                                >
                                    <span className="header-icon">
                                        {sortField && sortField.field === field.name ? (<i className={sortClass} />) : null}
                                    </span>
                                    <span className="header-label">{field.label}</span>
                                </td>
                            ))}
                        </tr>
                    </thead>
                    <tbody> 
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
});