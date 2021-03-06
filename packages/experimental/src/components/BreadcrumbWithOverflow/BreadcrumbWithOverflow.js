//
// Copyright IBM Corp. 2020, 2020
//
// This source code is licensed under the Apache-2.0 license found in the
// LICENSE file in the root directory of this source tree.
//

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import cx from 'classnames';

import {
  Breadcrumb,
  BreadcrumbItem,
  OverflowMenu,
  OverflowMenuItem,
} from 'carbon-components-react';
import { OverflowMenuHorizontal32 } from '@carbon/icons-react';

import { pkgPrefix, carbonPrefix } from '../../global/js/settings';

import ReactResizeDetector from 'react-resize-detector';
import uuidv4 from '../../global/js/utils/uuidv4';
import unwrapIfFragment from '../../global/js/utils/unwrap-if-fragment';

const blockClass = `${pkgPrefix}-breadcrumb-with-overflow`;

export const BreadcrumbWithOverflow = ({
  children,
  className,
  maxVisibleBreadcrumbItems,
  noTrailingSlash,
  ...other
}) => {
  const [displayCount, setDisplayCount] = useState(3);
  const [displayedBreadcrumbItems, setDisplayedBreadcrumbItems] = useState([]);
  const breadcrumbItemWithOverflow = useRef(null);
  const sizingContainerRef = useRef(null);
  const internalId = useRef(uuidv4());
  const [childArray, setChildArray] = useState([]);

  // eslint-disable-next-line react/prop-types
  const BreadcrumbOverflowMenu = ({ overflowItems }) => {
    return (
      <BreadcrumbItem key={`breadcrumb-overflow-${internalId.current}`}>
        <OverflowMenu
          ariaLabel={null}
          menuOffset={{ top: 10, left: 59 }} // TODO: REMOVE borrowed from https://github.com/carbon-design-system/carbon/pull/7085
          renderIcon={OverflowMenuHorizontal32}
          className={`${blockClass}--overflow-menu`}
          menuOptionsClass={`${carbonPrefix}--breadcrumb-menu-options`} // TODO: REMOVE borrowed from https://github.com/carbon-design-system/carbon/pull/7085
        >
          {
            // eslint-disable-next-line react/prop-types
            overflowItems.map((item, index) => (
              <OverflowMenuItem
                key={`breadcrumb-overflow-menu-item-${internalId.current}-${index}`}
                href={item.props.href}
                onClick={item.props.onClick}
                itemText={item.props.children}
              />
            ))
          }
        </OverflowMenu>
      </BreadcrumbItem>
    );
  };

  // creates child array from children which may be a fragment
  useEffect(() => {
    setChildArray(unwrapIfFragment(children));
  }, [children]);

  useEffect(() => {
    // updates displayedBreadcrumbItems and overflowBreadcrumbItems based on displayCount and childArray
    if (childArray.length === 0) {
      setDisplayedBreadcrumbItems([]);
      return;
    }

    const newDisplayedBreadcrumbItems = [];
    const newOverflowBreadcrumbItems = [];
    let child;

    // The breadcrumb has the form [first item] [overflow] [items 2...(n-1)] [last item].
    // The overflow is only shown if there isn't space to display all the items, and in that case:
    //  * the last item is always displayed (even if there isn't really space for it -- it can contract to an ellipsis);
    //  * the first item is the next to be displayed, if there's space once the last item and overflow are shown;
    //  * any remaining space after the first item, last item and overflow are shown is used to show items (n-1), (n-2), (n-3), ..., until the space is used up ;
    // Note that displayCount (min 1) has been computed based on the available space and the above sequence.
    const overflowStart = displayCount > 1 ? 1 : 0;
    // Everything but the last item if 1, otherwise 1 to length + overflowStart - displayCount
    for (
      let i = overflowStart;
      i < childArray.length + overflowStart - displayCount;
      i++
    ) {
      // add items into the overflow menu
      child = childArray[i];

      newOverflowBreadcrumbItems.push(
        React.cloneElement(child, {
          key: `displayed-breadcrumb-${internalId}-overflow-item-${i}`,
        })
      );
    }

    // add the first item before overflow if space
    if (displayCount > 1) {
      newDisplayedBreadcrumbItems.push(
        React.cloneElement(childArray[0], {
          className: cx([
            childArray[0].props.className,
            `${blockClass}--displayed-breadcrumb`,
          ]),
          key: `displayed-breadcrumb-${internalId.current}-0`,
        })
      );
    }

    // if needed add overflow menu after first item or before last
    if (displayCount < childArray.length) {
      newDisplayedBreadcrumbItems.push(
        <BreadcrumbOverflowMenu
          overflowItems={newOverflowBreadcrumbItems}
          key={`$displayed-breadcrumb-${internalId}-overflow`}
        />
      );
    }

    // skip items in overflow + overflowStart
    for (
      let i = newOverflowBreadcrumbItems.length + overflowStart;
      i < childArray.length;
      i++
    ) {
      child = childArray[i];
      newDisplayedBreadcrumbItems.push(
        React.cloneElement(child, {
          className: cx([
            child.props.className,
            `${blockClass}--displayed-breadcrumb`,
          ]),
          key: `displayed-breadcrumb-${internalId.current}-${i}`,
        })
      );
    }

    setDisplayedBreadcrumbItems(newDisplayedBreadcrumbItems);
  }, [childArray, displayCount]);

  const checkFullyVisibleBreadcrumbItems = () => {
    const displayItemIndex = (itemCount, index) => {
      // In this data set the overflow measuring item is [0]
      // so the first displayItem in the list is [1]
      // we never return 0;

      if (index === 0) {
        return itemCount - 1; // the last item in the list
      } else if (index === 1) {
        return 1; // the first item in the list
      } else {
        return itemCount - index; // count down from itemCount - 2 to 1
      }
    };

    if (maxVisibleBreadcrumbItems <= 1) {
      setDisplayCount(1);
    } else {
      // how many will fit?
      let willFit = 0;
      let spaceAvailable = breadcrumbItemWithOverflow.current.offsetWidth;

      if (sizingContainerRef.current) {
        const sizingBreadcrumbItems = sizingContainerRef.current.querySelectorAll(
          `.${carbonPrefix}--breadcrumb-item`
        );

        const breadcrumbWidthsIncludingMargin = [];
        for (let item of sizingBreadcrumbItems) {
          const computedStyle = window
            ? window.getComputedStyle(sizingBreadcrumbItems[0])
            : null;
          const marginWidths = computedStyle
            ? parseFloat(computedStyle.marginLeft, 0) +
              parseFloat(computedStyle.marginRight, 0)
            : 0;
          breadcrumbWidthsIncludingMargin.push(item.offsetWidth + marginWidths);
        }

        let overflowWidth = breadcrumbWidthsIncludingMargin[0];

        for (let i = 0; i < breadcrumbWidthsIncludingMargin.length - 1; i++) {
          // count used one less than length to account for the included overflow item
          const index = displayItemIndex(
            breadcrumbWidthsIncludingMargin.length,
            i
          );

          if (spaceAvailable >= breadcrumbWidthsIncludingMargin[index]) {
            spaceAvailable -= breadcrumbWidthsIncludingMargin[index];
            willFit += 1;
          } else {
            break;
          }
        }

        // if not enough space for all breadcrumb items
        if (willFit < breadcrumbWidthsIncludingMargin.length - 1) {
          // -1 for overflow item

          while (willFit > 0 && spaceAvailable < overflowWidth) {
            willFit -= 1;

            // Highly unlikely any useful breadcrumb-item is smaller than the overflow menu, but we loop anyway just in case

            // item removed is based on last item added which is the current value of willFit
            const itemToRemove = displayItemIndex(
              breadcrumbWidthsIncludingMargin.length,
              willFit
            );
            spaceAvailable += breadcrumbWidthsIncludingMargin[itemToRemove];
          }
        }
      }

      if (willFit <= 1) {
        setDisplayCount(1);
      } else {
        setDisplayCount(
          maxVisibleBreadcrumbItems
            ? Math.min(willFit, maxVisibleBreadcrumbItems)
            : willFit
        );
      }
    }
  };

  useEffect(() => {
    checkFullyVisibleBreadcrumbItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxVisibleBreadcrumbItems]);

  const handleResize = () => {
    checkFullyVisibleBreadcrumbItems();
  };

  const handleBreadcrumbItemsResize = () => {
    checkFullyVisibleBreadcrumbItems();
  };

  return (
    <ReactResizeDetector onResize={handleResize}>
      <div
        className={cx([blockClass, className])}
        ref={breadcrumbItemWithOverflow}>
        <div className={cx([`${blockClass}--space`])}>
          <ReactResizeDetector onResize={handleBreadcrumbItemsResize}>
            <div
              className={`${blockClass}--breadcrumb-container ${blockClass}--breadcrumb-container--hidden`}
              aria-hidden={true}
              ref={sizingContainerRef}>
              <BreadcrumbItem
                key={`${blockClass}-hidden-overflow-${internalId}`}>
                <OverflowMenu
                  ariaLabel={null}
                  renderIcon={OverflowMenuHorizontal32}
                />
              </BreadcrumbItem>
              {children}
            </div>
          </ReactResizeDetector>

          <Breadcrumb
            className={`${blockClass}--breadcrumb-container`}
            noTrailingSlash={noTrailingSlash}
            {...other}>
            {displayedBreadcrumbItems}
          </Breadcrumb>
        </div>
      </div>
    </ReactResizeDetector>
  );
};

BreadcrumbWithOverflow.propTypes = {
  /**
   * children of the breadcrumb-item set (these are expected to be breadcrumb-items)
   */
  children: PropTypes.arrayOf(PropTypes.element),
  /**
   * className
   */
  className: PropTypes.string,
  /**
   * maximum visible breadcrumb-items (values less than 1 are treated as 1)
   */
  maxVisibleBreadcrumbItems: PropTypes.number,
  /**
   * noTrailing slash - same as for Carbon
   */
  noTrailingSlash: PropTypes.bool,
};

BreadcrumbWithOverflow.defaultProps = {
  noTrailingSlash: false,
};
