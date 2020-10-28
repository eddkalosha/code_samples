import React from 'react';
import './style.scss';
import { isNumber} from "../Tools/utils";




/**
 * @author Edd Kalosha
 * @component BPUI.TiledHeader - container for BPUI.HeaderItem children 
 * 
 * @description: allow to display headers or blocks in tiles view. Support scrollable view in childs content more than 100% of parent. Mobile view is not scrollable
 * 
 * @prop children @type {DOMNode | text | JSXComponent} 
 * @prop className @type {String} add class to outer div
 * @prop classNameInner @type {String} add class to inner srollable div with content
 * 
 * @style file sourse in './style.scss'
 */


export const TiledHeader = props =>{
    const { className, classNameInner, children } = props;
    const contentLength = (children && Array.isArray(children))? children.reduce((acc,el) => acc+(isNumber(el.props.col)?el.props.col:0),0):100; 
    return (
        <div className={`bpui-header ${className}`}>
            <div 
                className={`header-inner ${classNameInner}`} 
                style={{width:`${contentLength<100?100:contentLength}%`}}
            >
            {  children  }
            </div>
        </div>
    )
  }


