import React, {
  useEffect, useRef, Children, cloneElement, useState, useCallback,
} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import cn from 'classnames';
import { debounce } from 'lodash';
import { isFunction, capitalizeFirstLetter } from '../../utils/helpers';
import {
  getBlockPositions, getReversePair,
  boundsToPixels, calcReverse,
} from './helpers';

import styles from './popup.module.scss';

/**
 * @name Popup
 *
 * @description Popup is component which allow to have popup with inner content connected to page element
 * with support different sizing and modes.
 * Working by ReactDOM.createPortal render and React Hooks.
 *
 * @param body - Text or React.Node for inner content of Popup.
 * @param children - base element for Popup. Should be one HTML node or component without React.Fragment wrapper.
 * @param className - allow to add custom classes for Popup.
 * @param placement - allow align Popup on base element. Supported values: `top left`, `bottom left`, `top center`,
    `bottom center`, `top right`, `bottom right`, `left top`, `right top`, `left center`, `right center`, `left bottom`,
    `right bottom`.
 * @param size - allow to set size of Modal. Supported values: `small`, `medium`, `large`.
 * @param variant - allow to set mode of hover to base element. Supported values `click`, `hover`.
 * @param onShow - callback function for show Popup event.
 * @param hideonOutsideClick - allow to close or keep visible Popup by outside elements click.
 * @param onClose - callback function for close Popup event.
 * @param withArrow - allow to show or hide Popup arrow.
 *
 * @test suites files:
 *  './__tests__/Popup.test.js'
 *  './__tests__/helpers.test.js'
 *
 * @example
  <Popup
    size="small"
    withArrow
    onShow={() => alert('show')}
    body="Any text or JSX"
    variant="click"
    placement="bottom center"
  >
    <button>Show popup</button>
  </Popup>
* @param placement of Popup visualization:
       (4)    (5)    (6)
       _________________
  (3) |                 | (7)
      |     element     |
  (2) |     with        | (8)
      |     popup       |
  (1) |_________________| (9)
       (12)   (11)   (10)
where:
  (1) - left bottom
  (2) - left center
  (3) - left top
  (4) - top left
  (5) - top center
  (6) - top right
  (7) - left top
  (8) - left center
  (9) - left bottom
  (10) - bottom right
  (11) - bottom center
  (12) - bottom left
 */

const DEBOUNCE_DELAY = 100;// ms

const Popup = (props) => {
  const {
    children, body, onShow, onClose, placement: initialPlacement,
    className, size, variant, hideonOutsideClick, withArrow,
  } = props;

  const [open, setOpen] = useState(false);
  const [positionsBlock, setPositionsBlock] = useState({});
  const [placement, setPlacement] = useState(initialPlacement);
  const scrollLeft = useRef(0);
  const refNode = useRef(null);
  const refBlock = useRef(null);

  const { bodyClass, mainClass, caretClass } = styles;
  const purePopupClass = 'suvaun-ui-popup';
  const sizeClass = styles[`size${capitalizeFirstLetter(size)}`];
  const wrapperClass = cn(mainClass, className, sizeClass, purePopupClass);

  const reCalcPositons = () => {
    if (open && refNode.current && refBlock.current) {
      const boundsRect = refNode.current.getBoundingClientRect();
      const boundsBlock = refBlock.current.getBoundingClientRect();
      const blockCoords = getBlockPositions(placement, boundsRect, boundsBlock);
      const blockCoordsToPx = boundsToPixels(blockCoords);
      setPositionsBlock(blockCoordsToPx);
    }
  };

  const onOutsideClickHandler = ({ target }) => open && !target.closest(`.${purePopupClass}`) && setOpen(false);

  const checkReverse = () => {
    if (open && refNode.current && refBlock.current) {
      const boundsRect = refNode.current.getBoundingClientRect();
      const boundsBlock = refBlock.current.getBoundingClientRect();
      const isNeedReverse = calcReverse(initialPlacement, boundsRect, boundsBlock) < 0;
      const reversePlacement = getReversePair(initialPlacement);
      const newPlacement = isNeedReverse ? reversePlacement : initialPlacement;

      if (newPlacement !== placement) {
        setPlacement(newPlacement);
      }
    }
  };

  const onScroll = useCallback(debounce((e) => {
    checkReverse();
    const isHorizontalScroll = scrollLeft.current !== e.target.scrollLeft;
    if (isHorizontalScroll) {
      reCalcPositons();
    }
    scrollLeft.current = e.target.scrollLeft;
  }, DEBOUNCE_DELAY), [open, placement]);

  const onResize = useCallback(debounce(() => {
    reCalcPositons();
  }, DEBOUNCE_DELAY), [open, placement]);

  useEffect(() => {
    const fn = open ? onShow : onClose;
    if (isFunction(fn)) fn();
  }, [open]);

  useEffect(() => {
    reCalcPositons();
    checkReverse();
  }, [open, placement]);

  useEffect(() => {
    window.addEventListener('resize', onResize, true);
    window.addEventListener('scroll', onScroll, true);
    if (hideonOutsideClick) {
      window.addEventListener('click', onOutsideClickHandler, false);
    }
    return () => {
      window.removeEventListener('resize', onResize, true);
      window.removeEventListener('scroll', onScroll, true);
      if (hideonOutsideClick) {
        window.removeEventListener('click', onOutsideClickHandler, false);
      }
    };
  });

  const content = <div
    data-testid={purePopupClass}
    ref={refBlock}
    className={wrapperClass}
    style={positionsBlock}
    placement={placement}
  >
    <div className={bodyClass}>{body}</div>
    {withArrow && <div className={caretClass} />}
  </div>;

  const events = variant === 'click' ? {
    onClick: () => setOpen(!open),
  } : {
    onMouseMove: () => setOpen(true),
    onMouseLeave: () => setOpen(false),
  };

  if (Children.count(children) !== 1) {
    console.warn('Popup children should be a valid HTML node or component without React.Fragment. Otherwise just wrap your component for Popup with something simple like <span></span>');
    return null;
  }
  const NewChild = cloneElement(Children.only(children), {
    ref: refNode,
    ...events,
  });

  return <>
    {NewChild}
    {open && ReactDOM.createPortal(content, document.body)}
  </>;
};

Popup.propTypes = {
  body: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
  placement: PropTypes.oneOf([
    'top left',
    'bottom left',
    'top center',
    'bottom center',
    'top right',
    'bottom right',
    'left top',
    'right top',
    'left center',
    'right center',
    'left bottom',
    'right bottom',
  ]),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['click', 'hover']),
  onShow: PropTypes.func,
  hideonOutsideClick: PropTypes.bool,
  onClose: PropTypes.func,
  withArrow: PropTypes.bool,
};

Popup.defaultProps = {
  body: '',
  placement: 'bottom center',
  className: null,
  hideonOutsideClick: true,
  children: PropTypes.node,
  size: 'small',
  variant: 'hover',
  onShow: null,
  onClose: null,
  withArrow: true,
};

export default Popup;
