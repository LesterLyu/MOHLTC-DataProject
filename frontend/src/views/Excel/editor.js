import Handsontable from 'handsontable';
import RichTexts from 'xlsx-populate/lib/RichTexts';

let excelInstance;

export default class Editor {
  constructor(instance) {
    this.excelInstance = instance;
    excelInstance = instance;
  }

  get FormulaEditor() {
    return FormulaEditor;
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
    if (typeof this.cell.formula() === 'string') {
      return 'formula';
    } else if (this.cell.value() instanceof RichTexts) {
      return 'richtext';
    } else if (this.cell.value() instanceof Date) {
      return 'date';
    } else if (this.cell.value() === undefined || this.cell.value() === null || typeof this.cell.value() === 'string') {
      return 'text';
    } else {
      return typeof this.cell.value(); // number, date ...
    }
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
    if (this.type === 'formula') {
      this.TEXTAREA.value = '=' + newValue;
    } else {
      this.TEXTAREA.value = newValue;
    }
  };

  saveValue(value, ctrlDown) {
    const cell = this.cell = this.excel.workbook.sheet(this.excel.currentSheetIdx).cell(this.row + 1, this.col + 1);
    const rawValue = value[0][0];
    if (this.type === 'richtext')
      return;
    // check if it is formula now
    if (value[0][0] !== undefined && value[0][0].length > 0 && value[0][0].charAt(0) === '=') {
      console.log('formula');
      const res = excelInstance.parser.parseNewFormula(rawValue, true);
      console.log(res);
      this.cell.value(res.result);
      this.cell.formula(res.formula);
    } else {
      this.cell.value(rawValue);
    }
    this.excel.renderer.cellNeedUpdate(this.excel.currentSheetIdx, this.row , this.col);
    this.excel.renderCurrentSheet();
  };
}


/**
 * FormulaEditor for handsonTable
 * Author: Lester Lyu
 *
 * For object like:
 * {
 *     formula: '...',
 *     result: '...'
 * } OR
 *  string
 */
export class FormulaEditor extends TextEditor {

  prepare(row, col, prop, td, originalValue, cellProperties) {
    this.originalType = typeof originalValue;
    // set editor type
    if (originalValue !== null && originalValue !== undefined && originalValue.hasOwnProperty('formula')) {
      this.type = 'formula';
      super.prepare.apply(this, [row, col, prop, td, originalValue.formula, cellProperties]);
    } else if (originalValue !== null && (typeof originalValue === 'string' || typeof originalValue === 'number')) {
      this.type = 'text';
      super.prepare.apply(this, [row, col, prop, td, originalValue, cellProperties]);
    } else if (originalValue !== null && (typeof originalValue === 'object' && 'richText' in originalValue)) {
      this.type = 'richtext';
      const val = originalValue.richText.map(({text}) => text).join('');
      super.prepare.apply(this, [row, col, prop, td, val, cellProperties]);
    } else {
      super.prepare.apply(this, [row, col, prop, td, originalValue, cellProperties]);
    }
  };

  getValue() {
    if (this.TEXTAREA.value === '') {
      return '';
    }
    // try to convert to number
    let res = Number(this.TEXTAREA.value);
    return isNaN(res) ? this.TEXTAREA.value : res;
  };

  setValue(newValue) {
    if (this.type === 'formula') {
      this.TEXTAREA.value = '=' + newValue;
    } else if (this.type === 'text') {
      this.TEXTAREA.value = newValue;
    } else if (this.type === 'richtext') {
      this.TEXTAREA.value = newValue;
    }
  };

  saveValue(value, ctrlDown) {
    if (this.type === 'richtext')
      return;
    // check if it is formula now
    if (value[0][0] !== undefined && value[0][0].length > 0 && value[0][0].charAt(0) === '=') {
      this.type = 'formula';
      console.log('formula')
    } else {
      this.type = 'text';
    }

    if (this.type === 'text') {
      console.log(value);
      return this.instance.setDataAtCell(this.row, this.col, value[0][0])
      // return TextEditor.prototype.saveValue.apply(this, [value, ctrlDown]);
    } else if (this.type === 'formula') {
      const res = excelInstance.parser.parseNewFormula(value[0][0], true);
      console.log(res);
      this.instance.setDataAtCell(this.row, this.col, res);
    }
  };
}
