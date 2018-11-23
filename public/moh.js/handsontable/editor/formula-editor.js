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
    this.originalType = typeof originalValue;
    // set editor type
    if (originalValue !== null && originalValue !== undefined && originalValue.hasOwnProperty('formula')) {
        this.type = 'formula';
        TextEditor.prototype.prepare.apply(this, [row, col, prop, td, originalValue.formula, cellProperties]);
    }
    else if (originalValue !== null && (typeof originalValue === 'string' || typeof originalValue === 'number')) {
        this.type = 'text';
        TextEditor.prototype.prepare.apply(this, [row, col, prop, td, originalValue, cellProperties]);
    }
    else if (originalValue !== null && (typeof originalValue === 'object' && 'richText' in originalValue)) {
        this.type = 'richtext';
        const val = originalValue.richText.map(({ text }) => text).join('');
        TextEditor.prototype.prepare.apply(this, [row, col, prop, td, val, cellProperties]);
    }

    else {
        TextEditor.prototype.prepare.apply(this, [row, col, prop, td, originalValue, cellProperties]);
    }
};


FormulaEditor.prototype.getValue = function () {
    if (this.TEXTAREA.value === '') {
        return '';
    }
    // try to convert to number
    let res = Number(this.TEXTAREA.value);
    return isNaN(res) ? this.TEXTAREA.value : res;
};


FormulaEditor.prototype.setValue = function (newValue) {
    if (this.type === 'formula') {
        this.TEXTAREA.value = '=' + newValue;
    }
    else if (this.type === 'text') {
        this.TEXTAREA.value = newValue;
    }
    else if(this.type === 'richtext') {
        this.TEXTAREA.value = newValue;
    }
};


FormulaEditor.prototype.saveValue = function (value, ctrlDown) {
    if (this.type === 'richtext')
        return;
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
        return this.instance.setDataAtCell(this.row, this.col, value[0][0])
        // return TextEditor.prototype.saveValue.apply(this, [value, ctrlDown]);
    }
    else if (this.type === 'formula') {
        const res = parseNewFormula(value[0][0]);
        console.log(res);
        this.instance.setDataAtCell(this.row, this.col, res);
    }
};

function parseNewFormula(newValue) {
    const value = {
        formula: newValue.slice(1),
        result: ''
    };
    // fix '=+' bug
    let calculated;
    if (value.formula.charAt(0) === '+')
        calculated = parser.parse(value.formula.slice(1));
    else
        calculated = parser.parse(value.formula);
    if (calculated.error) {
        value.result = calculated;
    }
    else {
        value.result = calculated.result;
    }
    return value;
}
