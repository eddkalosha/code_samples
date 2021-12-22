import React, { useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import cn from 'classnames';
import { capitalizeFirstLetter, isFunction } from '../../utils/helpers';
import styles from './modal.module.scss';
/**
 * @name Modal
 *
 * @description Modal is component which allow to have hosted dialog with different sizing and modes.
 * Working by ReactDOM.createPortal render and React Hooks.
 *
 * @param title - Text or React.Node for head title of Modal.
 * @param size - allow to set size of Modal. Allowed values: `small`, `medium`, `large`. Required.
 * @param mode - allow to set size of Modal. Allowed values: `basic`, `fixed`, `page`. Required.
 * @param open - boolean value for show or hide Modal.
 * @param onShow - callback function for show Modal event.
 * @param onClose - callback function for close Modal event.
 * @param onToggle - callback function for trigger on toggle Modal (show and close).
 * @param children - Text or React.Node for inner content of Modal.
 * @param className - allow to add custom classes for Modal.
 * @param onSubmit - callback function for submit button click event.
 * @param onCancel - callback function for cancel button click event.
 * @param submitTitle - Text or React.Node for override submit button title.
 * @param cancelTitle - Text or React.Node for override cancel button title.
 * @param withCloseButton - boolean value for show or hide top close button.
 * @param showCancel - boolean value for show or hide cancel button.
 * @param showSubmit - boolean value for show or hide submit button.
 * @param disableCancel - boolean value for disable cancel button for click.
 * @param disableSubmit - boolean value for disable submit button for click.
 * For hide footer need to define `showCancel={false}` and `showSubmit={false}`
 * @param horizontalAlign - allow to set horizontal align of Modal. Allowed values: `left`, `right`, `center`. Required.
 * @param verticalAlign - allow to set vertical align of Modal. Allowed values: `top`, `bottom`, `center`. Required.
 * @param bodyOverflow - allow to set overrflow content style to body of Modal. Allowed values: `scroll`, `auto`, `visible`, `hidden`,
 * @param backDropClose - boolean value for support click for close of Modal by backdrop area.
 *
 * @test suites file './Modal.test.js'
 *
 * @example
 *  <Modal
 *    title={'My overridden title'}
      size={'small'}
      mode={'fixed'}
      open
      onShow={callbackFn}
      onClose={callbackFn}
      onSubmit={callbackFn}
      onCancel={callbackFn}
      submitTitle={'Next'}
      cancelTitle={'Previous'}
 *    > Some inner text for modal</Modal>
 */

const Modal = forwardRef((props, ref) => {
  const {
    title,
    size,
    mode,
    open,
    onShow,
    onClose,
    onToggle,
    children,
    className,
    onSubmit,
    onCancel,
    submitTitle,
    cancelTitle,
    withCloseButton,
    showCancel,
    showSubmit,
    horizontalAlign,
    verticalAlign,
    backDropClose,
    disableCancel,
    disableSubmit,
    bodyOverflow,
  } = props;

  const wasWithOverflowClass = React.useRef(true);

  useEffect(() => {
    if (onToggle && isFunction(onToggle)) onToggle(open);
    if (open) {
      onShowAction();
      wasWithOverflowClass.current = document.body.classList.contains(styles.bodyNoScroll);
      document.body.classList.add(styles.bodyNoScroll);
    } else if (!wasWithOverflowClass.current) {
      document.body.classList.remove(styles.bodyNoScroll);
    }
    return () => !wasWithOverflowClass.current && document.body.classList.remove(styles.bodyNoScroll);
  }, [open]);

  useEffect(() => {
    document.addEventListener('keydown', onClickEscKey, false);
    return () => document.removeEventListener('keydown', onClickEscKey, false);
  }, [open]);

  const onClickEscKey = (event) => {
    if (event.keyCode === 27 && open) onCloseAction();
  };

  const onCloseAction = (...args) => {
    if (onClose && isFunction(onClose)) onClose(...args);
  };
  const onShowAction = (...args) => {
    if (onShow && isFunction(onShow)) onShow(...args);
  };
  const onSubmitAction = (...args) => {
    if (onSubmit && isFunction(onSubmit)) onSubmit(...args);
  };
  const onCancelAction = (...args) => {
    if (onCancel && isFunction(onCancel)) onCancel(...args);
  };
  const preventPropagation = (e) => {
    e.stopPropagation();
    e.cancelBubble = true;
  };

  const rootClass = 'dlgModal';
  const isPage = mode === 'page';
  const sizeClass = `${rootClass}${capitalizeFirstLetter(size)}`;
  const modeClass = `${rootClass}${capitalizeFirstLetter(mode)}`;
  const horizontalAlignClass = `${rootClass}HorizontalAlign${capitalizeFirstLetter(horizontalAlign)}`;
  const verticalAlignClass = `${rootClass}VerticalAlign${capitalizeFirstLetter(isPage ? 'top' : verticalAlign)}`;
  const bodyOverflowClass = `${rootClass}Overflow${capitalizeFirstLetter(bodyOverflow)}`;
  const backDropClasses = cn(styles.dglModalBackDrop, styles[horizontalAlignClass], styles[verticalAlignClass], styles.overflowVertical);
  const mainClasses = cn(className, styles.dglModal, rootClass, String(rootClass).toLocaleLowerCase(), 'suvaun-ui-modal');
  const contentClasses = cn(styles.dglModalContent, styles[sizeClass], styles[modeClass]);
  const showFooterButtons = showCancel || showSubmit;
  const footerWithOneButton = showCancel && showSubmit ? false : (showCancel || showSubmit);

  const modalContent = (<div ref={ref} data-testid="modal" role="dialog" className={mainClasses}>
    <div
      role="button"
      tabIndex={0}
      aria-label="BackDrop"
      onClick={backDropClose ? onCloseAction : undefined}
      className={backDropClasses}
    >
      <div
        role="presentation"
        aria-label="ModalContent"
        onClick={preventPropagation}
        className={contentClasses}
      >
        {withCloseButton && <span
          aria-label="Close"
          tabIndex={0}
          role="button"
          className={cn(styles.dlgModalCloseButton, isPage && styles.dlgModalCloseButtonPage)}
          onClick={onCloseAction}
        />}
        {title && <div className={styles.dlgModalHeader}>
          <div className={styles.dlgModalTitle}>{title}</div>
        </div>}
        <div className={cn(styles.dlgModalBody, bodyOverflowClass)}>
          {children}
          {showFooterButtons && <div className={cn(styles.dlgModalFooter, footerWithOneButton && styles.dlgModalFooterOneButton)}>
            {showCancel && <button
              className={cn(styles.dlgModalFooterBtn, 'cancel-button')}
              disabled={disableCancel}
              type="button"
              onClick={onCancelAction}
            >{cancelTitle}</button>}
            {showSubmit && <button
              className={cn(styles.dlgModalFooterBtn, styles.dlgModalFooterBtnConfirm, 'submit-button')}
              disabled={disableSubmit}
              type="button"
              onClick={onSubmitAction}
            >{submitTitle}</button>}
          </div>}
        </div>
      </div>
    </div>
  </div>);

  return (open && ReactDOM.createPortal(modalContent, document.body));
});

Modal.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']).isRequired,
  mode: PropTypes.oneOf(['basic', 'fixed', 'page']).isRequired,
  horizontalAlign: PropTypes.oneOf(['left', 'right', 'center']).isRequired,
  verticalAlign: PropTypes.oneOf(['top', 'bottom', 'center']).isRequired,
  bodyOverflow: PropTypes.oneOf(['scroll', 'auto', 'visible', 'hidden']),
  onShow: PropTypes.func,
  onClose: PropTypes.func,
  onToggle: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  submitTitle: PropTypes.string,
  cancelTitle: PropTypes.string,
  withCloseButton: PropTypes.bool,
  showCancel: PropTypes.bool,
  showSubmit: PropTypes.bool,
  disableCancel: PropTypes.bool,
  disableSubmit: PropTypes.bool,
  backDropClose: PropTypes.bool,
};

Modal.defaultProps = {
  title: '',
  size: 'medium',
  mode: 'basic',
  open: true,
  onShow: null,
  onClose: null,
  onToggle: null,
  children: null,
  horizontalAlign: 'center',
  verticalAlign: 'top',
  className: '',
  onSubmit: null,
  onCancel: null,
  submitTitle: 'Submit',
  cancelTitle: 'Cancel',
  withCloseButton: true,
  showCancel: true,
  showSubmit: true,
  backDropClose: true,
  disableCancel: false,
  disableSubmit: false,
  bodyOverflow: 'hidden',
};

export default Modal;
