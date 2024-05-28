import { Behavior } from "../types/Behavior.ts";
import { ReactGridStore } from "../types/ReactGridStore.ts";
import { calcSelectedAreaWidth } from "../utils/calcSelectedAreaWidth.ts";
import { findMinimalSelectedArea } from "../utils/findMinimalSelectedArea.ts";
import { getCellContainer } from "../utils/getCellContainer.ts";
import { getCellContainerFromPoint } from "../utils/getCellContainerFromPoint.ts";
import { getCellIndexesFromContainerElement } from "../utils/getCellIndexes.ts";
import { getLastColumnMetrics } from "../utils/getLastColumnMetrics.ts";
import isDevEnvironment from "../utils/isDevEnvironment.ts";

const devEnvironment = isDevEnvironment();

let initialMouseXPos = 0;
let destinationColIdx = 0;

export const ColumnReorderBehavior: Behavior = {
  id: "ColumnReorder",
  handlePointerDown: function (event, store): ReactGridStore {
    devEnvironment && console.log("CRB/handlePointerDown");

    return store;
  },

  handlePointerMove: (event, store) => {
    devEnvironment && console.log("CRB/handlePointerMove");

    if (!initialMouseXPos) {
      initialMouseXPos = event.clientX;
    }

    const selectedAreaWidth = calcSelectedAreaWidth(store);

    const { lastColumnRelativeffsetLeft, lastColumnWidth } = getLastColumnMetrics(store);

    const firstCellInSelectedArea = store.getCellByIndexes(0, store.selectedArea.startColIdx);

    if (!firstCellInSelectedArea) return store;

    const cellContainer = getCellContainer(store, firstCellInSelectedArea) as HTMLElement | null;

    if (!cellContainer) return store;

    const cellContainerOffsetLeft = cellContainer.offsetLeft || 0;

    let shadowPosition = cellContainerOffsetLeft + (event.clientX - initialMouseXPos);

    // Use client rect instead of event.clientY to determine shadow position,
    // This allows for accurate positioning even when the cursor is not hovering directly over the cell container.
    const element = getCellContainerFromPoint(event.clientX, cellContainer.getBoundingClientRect().top);

    if (!element) return store;

    const cell = getCellIndexesFromContainerElement(element);

    if (!cell) return store;

    // In case a column can have spanned cells, it's necessary to find the minimal selected area
    const minimalSelection = findMinimalSelectedArea(store, {
      startRowIdx: 0,
      endRowIdx: store.rows.length,
      startColIdx: cell.colIndex,
      endColIdx: cell.colIndex + 1,
    });

    const leftCell = store.getCellByIndexes(minimalSelection.startRowIdx, minimalSelection.startColIdx);
    const rightCell = store.getCellByIndexes(minimalSelection.startRowIdx, minimalSelection.endColIdx - 1);

    if (!leftCell || !rightCell) return store;

    const leftCellContainer = getCellContainer(store, leftCell) as HTMLElement | null;
    const rightCellContainer = getCellContainer(store, rightCell) as HTMLElement | null;

    if (!leftCellContainer || !rightCellContainer) return store;

    let linePosition = undefined;

    // Determine the destination column index based on the cursor position
    // Case 1 - Cursor is moving to the right of the selected columns
    if (event.clientX > cellContainer.getBoundingClientRect().left + selectedAreaWidth) {
      destinationColIdx = minimalSelection.endColIdx - 1;
      linePosition = rightCellContainer.offsetLeft + rightCellContainer.offsetWidth;
    } else if (event.clientX < cellContainer.getBoundingClientRect().left - 1) {
      // Case 2 - Cursor is moving to the left of the selected columns
      destinationColIdx = minimalSelection.startColIdx;
      linePosition = leftCellContainer.offsetLeft;
    }

    // Ensure the shadow doesn't go beyond the first column
    if (shadowPosition < 0) {
      shadowPosition = 0;
    }

    // Ensure the shadow doesn't go beyond the last column
    if (shadowPosition + selectedAreaWidth >= lastColumnRelativeffsetLeft + lastColumnWidth) {
      shadowPosition = lastColumnRelativeffsetLeft + lastColumnWidth - selectedAreaWidth;
    }

    return {
      ...store,
      shadowSize: selectedAreaWidth,
      shadowPosition: shadowPosition,
      linePosition,
    };
  },

  handlePointerUp: function (event, store) {
    devEnvironment && console.log("CRB/handlePointerUp");

    // Prevent triggering the resize behavior when a column is selected twice without moving the pointer
    if (!initialMouseXPos) return { ...store, currentBehavior: store.getBehavior("Default") };

    if (!store.linePosition) {
      initialMouseXPos = 0;

      if (!initialMouseXPos)
        return {
          ...store,
          currentBehavior: store.getBehavior("Default"),
          shadowPosition: undefined,
          shadowSize: undefined,
        };
    }

    initialMouseXPos = 0;

    const selectedColIndexes = Array.from(
      { length: store.selectedArea.endColIdx - store.selectedArea.startColIdx },
      (_, i) => i + store.selectedArea.startColIdx
    );

    const { lastColumnWidth, lastColumnClientOffsetLeft } = getLastColumnMetrics(store);

    // CASE 1
    // If the shadow is beyond the last column, move the selected columns to the last column
    if (event.clientX > lastColumnClientOffsetLeft + lastColumnWidth) {
      store.onColumnReorder?.(selectedColIndexes, store.columns.length - 1);

      return {
        ...store,
        currentBehavior: store.getBehavior("Default"),
        selectedArea: {
          startRowIdx: 0,
          endRowIdx: store.rows.length,
          startColIdx: store.columns.length - 1 - (selectedColIndexes.length - 1),
          endColIdx: store.columns.length,
        },
        shadowPosition: undefined,
        linePosition: undefined,
        shadowSize: undefined,
      };
    }

    const gridWrapper = store.reactGridRef;

    if (!gridWrapper) return store;

    // CASE 2
    // If the shadow is beyond the first column, move the selected columns to the first column
    if (event.clientX < gridWrapper.getBoundingClientRect().left) {
      store.onColumnReorder?.(selectedColIndexes, 0);

      return {
        ...store,
        currentBehavior: store.getBehavior("Default"),
        selectedArea: {
          startRowIdx: 0,
          endRowIdx: store.rows.length,
          startColIdx: 0,
          endColIdx: 0 + selectedColIndexes.length,
        },
        shadowPosition: undefined,
        linePosition: undefined,
        shadowSize: undefined,
      };
    }

    const firstSelectedHeaderCell = store.getCellByIndexes(0, store.selectedArea.startColIdx);

    if (!firstSelectedHeaderCell) return store;

    const cellContainer = getCellContainer(store, firstSelectedHeaderCell);

    if (!cellContainer) return store;

    // CASE 3
    // If the shadow is within the first and last column, move the selected columns to the destination column
    store.onColumnReorder?.(selectedColIndexes, destinationColIdx);

    const isLeftDirection = !!selectedColIndexes.find((idx) => idx > destinationColIdx);

    return {
      ...store,
      currentBehavior: store.getBehavior("Default"),
      selectedArea: {
        startRowIdx: 0,
        endRowIdx: store.rows.length,
        startColIdx: isLeftDirection ? destinationColIdx : destinationColIdx - (selectedColIndexes.length - 1),
        endColIdx: isLeftDirection ? destinationColIdx + selectedColIndexes.length : destinationColIdx + 1,
      },
      shadowPosition: undefined,
      linePosition: undefined,
      shadowSize: undefined,
    };
  },

  handlePointerHold: function (event, store) {
    devEnvironment && console.log("CRB/handlePointerHold");
    return store;
  },

  handlePointerHoldTouch: function (event, store) {
    devEnvironment && console.log("CRB/handlePointerHoldTouch");
    return store;
  },

  handlePointerDownTouch: function (event, store) {
    devEnvironment && console.log("CRB/handlePointerDownTouch");

    return store;
  },

  handlePointerMoveTouch: function (event, store) {
    devEnvironment && console.log("CRB/handlePointerMoveTouch");

    return store;
  },

  handlePointerUpTouch: function (event, store) {
    devEnvironment && console.log("CRB/handlePointerUpTouch");

    return store;
  },
};