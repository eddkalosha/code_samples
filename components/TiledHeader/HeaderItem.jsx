import * as React from 'react';
 

/**
 * @author Edd Kalosha
 * @component BPUI.HeaderItem - tile children for BPUI.Header  
 * 
 * @description: Nested component for display tile in Tiled Header component (Header.jsx)
 * 
 * @prop primary @type {DOMNode | String | JSXComponent} - main text or object for the tile 
 * @prop secondary @type {DOMNode | String | JSXComponent} - secondary text or object for the tile 
 * @prop col @type {Number} - width in % of parent container (BPUI.Header) @allows 1..100 values 
 * @prop positions @type {Object = ({alignY:String, primary:String, secondary:String})} - positions collection for the tile (accord to CSS-@property {align-self})
 * @prop colors @type {Object = ({bg:String, primary:String, secondary:String})} - colors collection for the tile 
 * (@allows to customize background color, primary text color, secondary text color). 
 * If primary or secondary object is not @type {String} customize colos inside DOMNode via CSS
 * @prop icon @type {Object = ({src:String, width:Number, height:Number, iconX:('left' | 'right'), iconY:String, styles:Object})} - icon for the tile 
 * styles - prop with css-properties of styles, animations name(keyframes) and settings like duration, speed etc.  
 *
 * @style file sourse in './style.scss'
 * 
 * full @example (with scrollable header - if you dont need to do scrolled just put SUM of properties {col} in childs < 100 ): 
 * <TiledHeader>
<TiledHeaderItem 
        col={50}  
		positions={{alignY:'center',primary:'flex-start',secondary:'flex-start',iconX:'left', iconY: 'center' }} 
    colors={{bg:'#d6d6d6', primary:'grey',secondary:'#000'}} 
		primary={'Tiles with scroll'}
		secondary={'Scroll if sum({col} prop)>100'}
    icon={<img width="50" height="50" src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Hangouts_Icon.png"/>}  
    />
<TiledHeaderItem 
        col={16}  
		positions={{alignY:'center',primary:'flex-start',secondary:'flex-start'}} 
        colors={{bg:'pink', primary:'grey',secondary:'#000'}} 
		primary={'HOW THE WEATHER TODAY?'}
		secondary={'Not special, just cloudly'}   
    />
<TiledHeaderItem 
        col={16}  
		positions={{alignY:'center',primary:'flex-start',secondary:'flex-start'}} 
        colors={{bg:'rgb(173, 209, 255)', primary:'grey',secondary:'#000'}} 
		primary={'CREATED ON:'}
		secondary={'03-mar-2020'}   
    />
<TiledHeaderItem 
        col={16}  
		positions={{alignY:'center',primary:'flex-start',secondary:'flex-start'}} 
colors={{bg:'#fcb700', primary:'grey',secondary:'#FFF'}} 
		primary={'STATUS:'}
		secondary={'IN-PROGRESS'}   
    />
<TiledHeaderItem 
        col={16}  
		positions={{alignY:'center',primary:'flex-start',secondary:'flex-start'}} 
        colors={{bg:'rgb(236, 236, 236)', primary:'grey'}} 
		primary={'BUTTONS ACTIONS:'}
    secondary={<button className="actionButton" name="save" title="Release">dont click me </button>}   
    />
</TiledHeader>
 */


 

export const TiledHeaderItem = (props) => {
    const {primary,secondary,icon,colors,positions,col,className} = props;
    const {bg,primary:primaryColor,secondary:secondaryColor} = colors || {};
    const {alignY:mainPos,primary:primaryPos,secondary:secondaryPos, iconX, iconY} = positions || {};
    return(
        <div 
            style={{
                background:`${bg}`, 
                flexDirection:`${iconX==='left'?'row-reverse':'row'}`, 
                flexBasis:`${col>100?100:col}%`
            }} 
            className={`bpui-header-item ${className}`}>
            <div 
                className="obj-block" 
                style={{justifyContent:`${mainPos}`}}>        
                <div 
                    style={{
                        color:`${primaryColor}`,
                        alignSelf:`${primaryPos}`
                    }} 
                    className="primary-obj">
                        {primary}
                </div>
                <div 
                    style={{
                        color:`${secondaryColor}`,
                        alignSelf:`${secondaryPos}`
                    }} 
                    className="secondary-obj">
                        {secondary}
                </div>
            </div>
            <div 
                className="img-block" 
                style={{alignItems:`${iconY}`}}>
                    {icon} 
            </div>
        </div>
        )
  }
 



 