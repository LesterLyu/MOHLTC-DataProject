import Handsontable from 'handsontable/dist/handsontable.full';
import {getCellType} from "./helpers";

let excelInstance;

export default class Editor {
  constructor(instance) {
    this.excelInstance = instance;
    excelInstance = instance;
  }

  get FormulaEditorNG() {
    return FormulaEditorNG;
  }
}
const TextEditor = Handsontable.editors.TextEditor;

export class FormulaEditorNG extends TextEditor {
  excel = excelInstance;

  prepare(row, col, prop, td, originalValue, cellProperties) {
    const cell = this.cell = this.excel.workbook.sheet(this.excel.currentSheetIdx).cell(this.row + 1, this.col + 1);
    const value = typeof cell.formula() === 'string' ? cell.formula() : cell.value();
    super.prepare.apply(this, [row, col, prop, td, value, cellProperties]);
  };

  get type() {
    return getCellType(this.cell);
  }

  getValue() {
    if (this.TEXTAREA.value === '') {
      return '';
    }
    // try to convert to number
    let res = Number(this.TEXTAREA.value);
    return isNaN(res) ? this.TEXTAREA.value : res;
  };

  setValue(newValue) {
    // TODO: embed data validation
    if (this.type === 'formula') {
      this.TEXTAREA.value = '=' + newValue;
    } else {
      this.TEXTAREA.value = newValue;
    }
  };

  saveValue(value, ctrlDown) {
    excelInstance.setDataAndRender(null, this.row, this.col, value[0][0], 'edit');
  };

}
