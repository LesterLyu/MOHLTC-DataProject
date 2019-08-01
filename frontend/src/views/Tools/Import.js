import {XlsxPopulate} from '../Excel/helpers'
import React from 'react';
import {Button} from '@material-ui/core';
import AttCatManager from "../../controller/attCatManager";

const upload = (attCatManager, showMessage) => () => {
  const input = document.createElement('input');
  input.type = 'file';

  input.onchange = e => {
    const file = e.target.files[0];
    console.log(file.name);
    XlsxPopulate.fromDataAsync(file)
      .then(async wb => {
        const data = {};
        const categories = [];
        const attributes = [];
        wb.sheets().forEach(sheet => {
          const sheetData = data[sheet.name()] = {
            atts: [],
            cats: []
          };
          const rows = [...sheet._rows.entries()].sort((entry1, entry2) => {
            return entry1[0] - entry2[0];
          });
          // read categories
          rows.forEach(([rowNumber, row]) => {
            const cells = [...row._cells.entries()].sort((entry1, entry2) => {
              return entry1[0] - entry2[0];
            });
            const firstCellInRow = row.cell(1);
            const cellValue = firstCellInRow.getValue();
            if (/^[0-9]*$/.test(cellValue)) {
              for (let i = 0; i < cells.length; i++) {
                const cell = cells[i][1];
                if (typeof cell.getValue() === "string") {
                  const newItem = {
                    id: Number(cellValue),
                    name: cell.getValue(),
                    description: file.name + ' > ' + sheet.name()
                  };
                  categories.push(newItem);
                  sheetData.cats.push(newItem);
                  break;
                }
              }
            }
          });
          // read attributes
          const firstRow = sheet.row(1);
          firstRow._cells.forEach((cell, columnNumber) => {
            const cellValue = cell.getValue();
            if (/^[0-9]*$/.test(cellValue)) {
              const maxRowNumber = rows[rows.length - 1][0];
              for (let i = 1; i <= maxRowNumber; i++) {
                const value = sheet.row(i).cell(columnNumber).getValue();
                if (typeof value === "string") {
                  const newItem = {id: Number(cellValue), name: value, description: file.name + ' > ' + sheet.name()}
                  attributes.push(newItem);
                  sheetData.atts.push(newItem);
                  break;
                }
              }
            }
          });
        });
        console.log(data);
        const res1 = (await attCatManager.batchAdd(true, attributes)).message;
        const res2 = (await attCatManager.batchAdd(false, categories)).message;
        showMessage(res1 + '\n' + res2, 'success');
      });
  };

  input.click();
};

export default function ImportId(props) {
  const attCatManager = new AttCatManager(props);
  return (
    <Button variant="contained" color="primary" onClick={upload(attCatManager, props.showMessage)}>
      Upload Workbook
    </Button>
  )
}
