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
        this.data = {};

        // init parser
        this.parser = new formulaParser.Parser();
        this._initParser();
        this.state = {currSheet: null, currCell: null};
    }

    addCell(currSheet, row, col, formula) {
        this.state.currSheet = currSheet;
        this.state.currCell = colCache.encode(row + 1, col + 1);
        this.state.curr = this.state.currSheet + '/' + this.state.currCell;
        this.parser.parse(formula)
    }

    change(currSheet, row, col) {
        evaluateFormula(currSheet, row, col);
        const curr = currSheet + '/' + colCache.encode(row + 1, col + 1);
        if (curr in this.data) {
            for (let idx = 0; idx < this.data[curr].length; idx++) {
                const needToUpdate = this.data[curr][idx];
                const i = needToUpdate.indexOf('/');
                const sheet = needToUpdate.substring(0, i);
                const cell = needToUpdate.substring(i + 1);
                const decoded = colCache.decode(cell);
                this.change(sheet, decoded.row - 1, decoded.col - 1);
            }
        }
    }

    _initParser() {
        const self = this;
        this.parser.on('callCellValue', (cellCoord, done) => {
            let sheet;
            if ('sheet' in cellCoord) {
                sheet = gui.sheetNames.indexOf(cellCoord.sheet);
            }
            else {
                sheet = self.state.currSheet;
            }
            const dep = sheet + '/' + cellCoord.label;

            if (!(dep in self.data)) {
                self.data[dep] = []
            }

            self.data[dep].push(self.state.curr);
            done(0);
        });

        this.parser.on('callRangeValue', (startCellCoord, endCellCoord, done) => {
            let sheet;
            if ('sheet' in startCellCoord) {
                sheet = gui.sheetNames.indexOf(startCellCoord.sheet);
            }
            else {
                sheet = self.state.currSheet;
            }
            // const fragment = [];
            for (let row = startCellCoord.row.index; row <= endCellCoord.row.index; row++) {
                // const colFragment = [];
                for (let col = startCellCoord.column.index; col <= endCellCoord.column.index; col++) {
                    const label = colCache.encode(row + 1, col + 1);
                    const dep = sheet + '/' + label;

                    if (!(dep in self.data)) {
                        self.data[dep] = []
                    }

                    self.data[dep].push(self.state.curr);
                    // colFragment.push(0);
                }
                // fragment.push(colFragment);
            }
            done(0)
        })

    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}



