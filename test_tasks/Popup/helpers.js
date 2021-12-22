const ARROW_WIDTH = 14; // px
const ARROW_HEIGHT = 7; // px
const PADDING_ARROW = 14; // px

const ARROW_CENTER_WITH_PADDING = PADDING_ARROW + ARROW_WIDTH / 2;

const TOP_LEFT = 'top left'; const TOP_CENTER = 'top center'; const TOP_RIGHT = 'top right';
const BOTTOM_LEFT = 'bottom left'; const BOTTOM_CENTER = 'bottom center'; const BOTTOM_RIGHT = 'bottom right';
const LEFT_TOP = 'left top'; const LEFT_CENTER = 'left center'; const LEFT_BOTTOM = 'left bottom';
const RIGHT_TOP = 'right top'; const RIGHT_CENTER = 'right center'; const RIGHT_BOTTOM = 'right bottom';

const REVERSE_PAIRS = [
  [TOP_LEFT, BOTTOM_LEFT],
  [TOP_CENTER, BOTTOM_CENTER],
  [TOP_RIGHT, BOTTOM_RIGHT],
  [LEFT_TOP, RIGHT_TOP],
  [LEFT_CENTER, RIGHT_CENTER],
  [LEFT_BOTTOM, RIGHT_BOTTOM],
];

export const boundsToPixels = (boundsObj) => Object.keys(boundsObj).reduce((obj, key) => ({ ...obj, [key]: `${boundsObj[key]}px` }), {});

export const getBlockPositions = (placement, refNode, blockNode) => {
  const {
    top: topRefNode, left: leftRefNode,
    right: rightRefNode, width: widthRefNode,
    height: heightRefNode, bottom: bottomRefNode,
  } = refNode;
  const {
    width: widthblockNode, height: heightblockNode,
  } = blockNode;

  switch (placement) {
    case TOP_LEFT: return ({ left: (leftRefNode + widthRefNode / 2) - ARROW_CENTER_WITH_PADDING, top: topRefNode - heightblockNode + window.pageYOffset - ARROW_HEIGHT });
    case TOP_CENTER: return ({ left: (leftRefNode + widthRefNode / 2) - widthblockNode / 2, top: topRefNode - heightblockNode + window.pageYOffset - ARROW_HEIGHT });
    case TOP_RIGHT: return ({ left: (leftRefNode + widthRefNode / 2) - widthblockNode + ARROW_CENTER_WITH_PADDING, top: topRefNode - heightblockNode + window.pageYOffset - ARROW_HEIGHT });

    case BOTTOM_LEFT: return ({ left: (leftRefNode + widthRefNode / 2) - ARROW_CENTER_WITH_PADDING, top: bottomRefNode + window.pageYOffset + ARROW_HEIGHT });
    case BOTTOM_CENTER: return ({ left: (leftRefNode + widthRefNode / 2) - widthblockNode / 2, top: bottomRefNode + window.pageYOffset + ARROW_HEIGHT });
    case BOTTOM_RIGHT: return ({ left: (leftRefNode + widthRefNode / 2) - widthblockNode + ARROW_CENTER_WITH_PADDING, top: bottomRefNode + window.pageYOffset + ARROW_HEIGHT });

    case LEFT_TOP: return ({ left: leftRefNode - widthblockNode - ARROW_HEIGHT, top: (topRefNode + heightRefNode / 2) + window.pageYOffset - ARROW_CENTER_WITH_PADDING });
    case LEFT_CENTER: return ({ left: leftRefNode - widthblockNode - ARROW_HEIGHT, top: (topRefNode + heightRefNode / 2) - heightblockNode / 2 + window.pageYOffset });
    case LEFT_BOTTOM: return ({ left: leftRefNode - widthblockNode - ARROW_HEIGHT, top: (topRefNode + heightRefNode / 2) - heightblockNode + window.pageYOffset + ARROW_CENTER_WITH_PADDING });

    case RIGHT_TOP: return ({ left: rightRefNode + ARROW_HEIGHT, top: (topRefNode + heightRefNode / 2) + window.pageYOffset - ARROW_CENTER_WITH_PADDING });
    case RIGHT_CENTER: return ({ left: rightRefNode + ARROW_HEIGHT, top: (topRefNode + heightRefNode / 2) - heightblockNode / 2 + window.pageYOffset });
    case RIGHT_BOTTOM: return ({ left: rightRefNode + ARROW_HEIGHT, top: (topRefNode + heightRefNode / 2) - heightblockNode + window.pageYOffset + ARROW_CENTER_WITH_PADDING });

    default: { console.warn('Incorrect [placement] prop.'); return {}; }
  }
};

export const calculateOverflows = (blockCoords, sizeBlock) => {
  const { top, left } = blockCoords;
  return {
    left,
    top,
    bottom: document.body.clientHeight - (top + sizeBlock.height),
    right: document.body.clientWidth - (left + sizeBlock.width),
  };
};

export const getReversePair = (initDirection) => REVERSE_PAIRS
  .find((pair) => pair
    .some((direction) => direction === initDirection))
  .find((direction) => direction !== initDirection);

export function calcReverse(initialPlacement, boundsRect, sizeBlock) {
  switch (initialPlacement) {
    case TOP_LEFT:
    case TOP_CENTER:
    case TOP_RIGHT:
      return boundsRect.top - sizeBlock.height - ARROW_HEIGHT;

    case LEFT_TOP:
    case LEFT_CENTER:
    case LEFT_BOTTOM:
      return boundsRect.left - sizeBlock.width - ARROW_HEIGHT;

    case RIGHT_TOP:
    case RIGHT_CENTER:
    case RIGHT_BOTTOM:
      return document.body.clientWidth - (boundsRect.right + sizeBlock.width + ARROW_HEIGHT);

    case BOTTOM_LEFT:
    case BOTTOM_CENTER:
    case BOTTOM_RIGHT:
      return document.body.clientHeight - (boundsRect.bottom + sizeBlock.height + ARROW_HEIGHT);

    default: { return 0; }
  }
}
