/**
 * FormulaEditor for handsonTable
 * Authon: Lester Lyu
 *
 * For object like:
 * {
 *     formula: '...',
 *     result: '...'
 * } OR
 *  string
 */

// shorten the names
var TextEditor = Handsontable.editors.TextEditor;


// FormulaEditor is a class function, inheriting form TextEditor
var FormulaEditor = TextEditor.prototype.extend();


FormulaEditor.prototype.prepare = function (row, col, prop, td, originalValue, cellProperties) {
    this.rawValue = {};
    // set editor type
    if (originalValue !== null && originalValue !== undefined && originalValue.hasOwnProperty('formula')) {
        this.type = 'formula';
        TextEditor.prototype.prepare.apply(this, [row, col, prop, td, originalValue.formula, cellProperties]);
    }
    else if (originalValue !== null && typeof originalValue === 'string') {
        this.type = 'text';
        TextEditor.prototype.prepare.apply(this, [row, col, prop, td, originalValue, cellProperties]);
    }
    else {
        TextEditor.prototype.prepare.apply(this, [row, col, prop, td, originalValue, cellProperties]);
    }
};


FormulaEditor.prototype.getValue = function () {
    return this.TEXTAREA.value;
};


FormulaEditor.prototype.setValue = function (newValue) {
    if (this.type === 'formula') {
        this.TEXTAREA.value = '=' + newValue;
    }
    else if (this.type === 'text') {
        this.TEXTAREA.value = newValue;
    }
};


FormulaEditor.prototype.saveValue = function (value, ctrlDown) {
    // check if it is formula now
    if (value[0][0] !== undefined && value[0][0].length > 0 && value[0][0].charAt(0) === '=') {
        this.type = 'formula';
        console.log('formula')
    }
    else {
        this.type = 'text';
    }

    if (this.type === 'text') {
        console.log(value);
        return this.instance.setDataAtCell(this.row, this.col, value)
        //return TextEditor.prototype.saveValue.apply(this, [value, ctrlDown]);
    }
    else if (this.type === 'formula') {
        this.rawValue.formula = value[0][0].slice(1);
        // re-evaluate the result
        console.log(value[0][0]);
        var calculated = parser.parse(this.rawValue.formula);
        if (calculated.error) {
            this.rawValue.result = calculated;
        }
        else {
            this.rawValue.result = calculated.result;
        }
        console.log(this.rawValue)
        this.instance.setDataAtCell(this.row, this.col, this.rawValue);
    }
};
