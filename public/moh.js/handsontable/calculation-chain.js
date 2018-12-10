class CalculationChain {
    constructor() {
        /**
         * Change sheetNo1!A1 's value will result in re-calculating sheetNo2!B1,
         * i.e. sheetNo2!B1 depends on sheetNo1!A1
         * {
         *     sheetNo1: {
         *         'A1': {
         *             sheetNo2: [
         *                 'B1', ...
         *             ]
         *         }
         *     }
         * }
         */
        this.data = {cellValue: {}, rangeValue: {}};

        // init parser
        this.parser = new formulaParser.Parser();
        this._initParser();
        this.state = {};
    }

    addCell(currSheet, row, col, formula) {
        // this.state.currSheet = currSheet;
        // this.state.currCell = colCache.encode(row + 1, col + 1);
        this.state.curr = {sheet: currSheet, row, col};
        this.parser.parse(formula);
    }

    change(currSheet, row, col) {
        evaluateFormula(currSheet, row, col);
        // check cellValue
        if (currSheet in this.data.cellValue) {
            const rowCol = colCache.encode(row + 1, col + 1);
            if (rowCol in this.data.cellValue[currSheet]) {
                const needToUpdate = this.data.cellValue[currSheet][rowCol];
                for (let idx = 0; idx < needToUpdate.length; idx++) {
                    const curr = needToUpdate[idx];
                    this.change(curr.sheet, curr.row, curr.col);
                }
            }
        }

        // check rangeValue
        if (currSheet in this.data.rangeValue) {
            const rows = Object.keys(this.data.rangeValue[currSheet]);
            for (let i = 0; i < rows.length; i++) {
                if (isInRange(rows[i], row)) {
                    const cols = Object.keys(this.data.rangeValue[currSheet][rows[i]]);
                    for (let j = 0; j < cols.length; j++) {
                        if (isInRange(cols[j], col)) {
                            const needToUpdate = this.data.rangeValue[currSheet][rows[i]][cols[j]];
                            for (let idx = 0; idx < needToUpdate.length; idx++) {
                                const curr = needToUpdate[idx];
                                this.change(curr.sheet, curr.row, curr.col);
                            }
                        }
                    }
                }
            }
        }
    }

    _initParser() {
        const self = this;
        this.parser.on('callCellValue', (cellCoord, done) => {
            let sheetNo;
            if ('sheet' in cellCoord) {
                sheetNo = gui.sheetNames.indexOf(cellCoord.sheet);
            }
            else {
                sheetNo = self.state.curr.sheet;
            }
            if (!(sheetNo in self.data.cellValue)) {
                self.data.cellValue[sheetNo] = {}
            }
            const rowCol = cellCoord.label.replace(/\$/g, '');
            if (!(rowCol in self.data.cellValue[sheetNo])) {
                self.data.cellValue[sheetNo][rowCol] = []
            }
            self.data.cellValue[sheetNo][rowCol].push(self.state.curr);

            done(0);
        });

        this.parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
            let sheetNo;
            if ('sheet' in startCellCoord) {
                sheetNo = gui.sheetNames.indexOf(startCellCoord.sheet);
            }
            else {
                sheetNo = self.state.curr.sheet;
            }
            // data structure: sheetNo -> row range -> col range -> list of cells need to update
            // check if sheet exist as a key
            if (!(sheetNo in self.data.rangeValue)) {
                self.data.rangeValue[sheetNo] = {}
            }
            const rowRange = startCellCoord.row.index + ':' + endCellCoord.row.index;
            if (!(rowRange in self.data.rangeValue[sheetNo])) {
                self.data.rangeValue[sheetNo][rowRange] = {}
            }

            const colRange = startCellCoord.column.index + ':' + endCellCoord.column.index;
            if (!(colRange in self.data.rangeValue[sheetNo][rowRange])) {
                self.data.rangeValue[sheetNo][rowRange][colRange] = []
            }
            self.data.rangeValue[sheetNo][rowRange][colRange].push(self.state.curr);

            done(0)
        })

    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Test if the val is in range
 * @param range e.g. 1:10
 * @param val e.g. 3
 */
function isInRange(range, val) {
    const test = range.match(/([0-9]+):([0-9]+)/);
    return parseInt(test[1]) <= parseInt(val) && parseInt(val) <= parseInt(test[2]);
}



