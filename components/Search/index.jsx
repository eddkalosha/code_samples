import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createReactClass from 'create-react-class';
import './styles.scss';

/**
 * @author Edd
 *
 * @example
 *<BPUI.Search
 isWaiting={true}
 showDetailsBtn
 value={'some value'}
 results={[{name:'Result one'},{name:'Result two'},{name:'Result three'}]}
 placeholderText={'Start type someting...'}
 onClickSearch={searchText=>alert('you hit Enter btn, value = '+searchText)}
 onChange={newValue=>console.log(newValue)}
 onResultItemClick={(event,item,index,allItems)=>alert(item.name+' index = ['+index+'] of total count = '+allItems.length)}
 onDetailsClick={e=>alert('detailed btn clicked')}
 />
 *
 *
 */


export const Search = createReactClass({
    getDefaultProps: function () {
        return {
            onDetailsClick: null,
            showDetailsBtn: false,
            onChange: null,
            onEdit: null,
            onBlur: null,
            onInput: null,
            onClickSearch: null,
            onResultItemClick: null,
            placeholderText: 'Search...',
            results: [],
            value: '',
            isWaiting: false
        }
    },

    getInitialState: function () {
        this.node = document.createElement('div');
        document.body.appendChild(this.node);
        return {
            isLoading: false,
            focused: false,
            searchResSelected: -1,
        }
    },
    fireEventWithState(e, func, focused = true) {
        if (!this) return
        this.handleResize();
        this.setState({focused});
        if (func) {
            func(e.target.value);
        }
    },
 
    onResItemClick(event, item, index, allItems) {
        const {onResultItemClick} = this.props;
        this.setState({
            focused: false
        });
        if (onResultItemClick) {
            onResultItemClick(event, item, index, allItems);
        }
    },
    handleResize() {
        if (!this) return
        const rect = ReactDOM.findDOMNode(this).getBoundingClientRect();
        const left = window.scrollX + rect.left;
        const top = window.scrollY + rect.top;
        const {width} = rect;
        if (top !== this.state.top || left !== this.state.left || width !== this.state.width) {
            this.setState({left, top, width});
        }
    },
    componentDidMount() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
        window.addEventListener('scroll', this.handleResize);
    },
    componentWillUnmout() {
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('scroll', this.handleResize);
        try {
            ReactDOM.unmountComponentAtNode(this.node);
        } catch (e) {
        }
    },

    render() {
        const {
            onDetailsClick,
            showDetailsBtn,
            onChange,
            onEdit,
            onBlur,
            onInput,
            onClickSearch,
            placeholderText,
            results,
            isWaiting,
            value
        } = this.props;

        const inputProps = {
            onChange: (e) => this.fireEventWithState(e, onChange),
            onEdit: (e) => this.fireEventWithState(e, onEdit),
            onBlur: (e) => {
                setTimeout(() => {
                    this.fireEventWithState(e, onBlur, false)
                }, 400);
            },
            onInput: (e) => this.fireEventWithState(e, onInput),
            onKeyPress: (e) => {
                if (e.key === 'Enter') {
                    if (onClickSearch) {
                        onClickSearch(value, this.fireEventWithState)
                    }
                }
            },
            onKeyDown: (e) => {
                const {searchResSelected} = this.state;
                e = e || window.event;
                switch (e.keyCode) {
                    case 38:
                        this.setState({searchResSelected: searchResSelected - 1});
                        break;
                    case 40:
                        this.setState({searchResSelected: searchResSelected + 1});
                        break;
                    default:
                        this.setState({searchResSelected});
                }
            }
        };
        const SEARCH_HEIGHT = 39; //px 
        const {left, top, width, focused} = this.state;
        return (
            <div className="bpui-search">
                <span className="bp-input-group-addon">
                    <i className="fa fa-2x icon-mag-thin"/>
                </span>
                <input
                    value={value}
                    onChange={inputProps.onChange}
                    onEdit={inputProps.onEdit}
                    onBlur={inputProps.onBlur}
                    onInput={inputProps.onInput}
                    onKeyPress={inputProps.onKeyPress}
                    // onKeyDown={inputProps.onKeyDown} support it later
                    type="text"
                    className="bp-input"
                    placeholder={placeholderText}
                    autocomplete="off"/>
                {isWaiting &&
                <span title="Waiting..." className="bp-input-group-addon bp-input-group-addon-back">
                        <i className="fa fa-x rotate-spin-animation fa-circle-o-notch "/> 
                    </span>
                }
                {showDetailsBtn && <span className="bp-input-group-addon bp-input-group-addon-back">
                    <a title="Advanced Search" className="search" onClick={(e) => onDetailsClick(e)}
                       href="javascript:void(0)">
                        <i className="fa fa-x fa-sliders" aria-hidden="true"/>
                    </a>
                </span>
                }
                {
                   ReactDOM.createPortal(
                            <div
                                className="bpui-search-results"
                                style={{
                                    position: 'absolute',
                                    top: top + SEARCH_HEIGHT,
                                    left,
                                    width: width,
                                    zIndex: 99999,
                                    display:(results && Array.isArray(results) && value && value.length > 0 && focused)? 'block':'none'
                                }}>
                                <div className="results">
                                    <i className="results-text">Search results ({results.length}):</i>
                                    <ul className="menu">
                                        {results.map((el, i) =>
                                            <li className={`item ${this.state.searchResSelected === i ? 'selected' : ''}`}
                                                style={{backgroundColor: this.state.searchResSelected === i ? '#f2f4f6' : ''}}
                                                onClick={e => this.onResItemClick(e, el, i, results)} key={i}>
                                                <div className="ui-menu-item-wrapper">
                                                    {el.name}
                                                    {el?.label?.map(el => (<span>{el}</span>))}
                                                </div>
                                            </li>)}
                                    </ul>
                                </div>
                            </div>,
                            this.node
                        )
                    }
            </div>
        )
    }
});

