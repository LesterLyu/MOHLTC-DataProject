class CalculationChain {
    constructor() {
        this.data = {};
        this.CELL = /('?[A-Za-z0-9]+'?!)?(\$?[A-Za-z]+\$?[0-9]+)(?![0-9]*!)/g;

    }

    addCell(sheet, row, col, formula) {

    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
