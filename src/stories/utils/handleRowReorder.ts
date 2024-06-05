import { Dispatch, SetStateAction } from "react";
import { Row } from "../../types/PublicModel";

type CellData = {
  text?: string;
  number?: number;
  date?: Date;
};

type SetData<T extends CellData> = React.Dispatch<React.SetStateAction<(T | null)[][]>>;

export const handleRowReorder = <T>(
  selectedRowIndexes: number[],
  destinationRowIdx: number,
  setRows: Dispatch<SetStateAction<Row<string>[]>>,
  setData: SetData<CellData>
) => {
  setRows((prevRows) => {
    // Create arrays of selected and unselected rows
    const selectedRows = prevRows.filter((_, index) => selectedRowIndexes.includes(index));
    const unselectedRows = prevRows.filter((_, index) => !selectedRowIndexes.includes(index));

    // Calculate the adjusted destination index
    const adjustedDestinationRowIdx =
      selectedRowIndexes[0] > destinationRowIdx ? destinationRowIdx : destinationRowIdx - selectedRows.length + 1;

    // Create the new array of rows
    const newRows = [
      ...unselectedRows.slice(0, adjustedDestinationRowIdx),
      ...selectedRows,
      ...unselectedRows.slice(adjustedDestinationRowIdx),
    ];

    return newRows;
  });

  setData((prevGridData) => {
    const newGridData = [...prevGridData];

    const movedRows = selectedRowIndexes.map((selectedRowIndex) => newGridData[selectedRowIndex]);

    const sortedSelectedRowIndexes = [...selectedRowIndexes].sort((a, b) => b - a);

    sortedSelectedRowIndexes.forEach((selectedRowIndex) => {
      newGridData.splice(selectedRowIndex, 1);
    });

    // Adjust destination index if it's greater than the selected row indexes
    const adjustedDestinationRowIdx =
      sortedSelectedRowIndexes[0] > destinationRowIdx ? destinationRowIdx : destinationRowIdx - movedRows.length + 1;

    movedRows.forEach((item, index) => {
      newGridData.splice(adjustedDestinationRowIdx + index, 0, item);
    });

    return newGridData;
  });
};
