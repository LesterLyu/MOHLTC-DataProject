let timeHidden = 0, timeRichText = 0, timeSpan = 0, timeStyles = 0, timeHyperlinks = 0, timeRenderers = 0,
    timeCells = 0;
let cntCells = 0, cntCellRenderer = 0;

const SPAN_TEMPLATE = document.createElement('span');
SPAN_TEMPLATE.style.pointerEvents = 'none';

/**
 * Text and formula renderer
 * @param instance
 * @param td
 * @param row
 * @param col
 * @param prop
 * @param value
 * @param cellProperties
 */
function cellRenderer(instance, td, row, col, prop, value, cellProperties) {
    // Handsontable.renderers.TextRenderer.apply(this, arguments);
    let start2 = Date.now();
    let start = Date.now();
    cntCellRenderer++;
    const sheet = global.workbookData.sheets[instance.sheetNo];
    if (sheet && sheet.views) {
        // grid lines
        const showGridLines = sheet.views[0].showGridLines;
        if (!showGridLines) {
            td.style.borderColor = 'rgba(0,0,0,0)';
        }

        // check if this row/col should be hidden
        if (sheet.col.hidden.includes(col)) {
            td.style.display = 'none';
            return;
        }

        if (sheet.row.hidden.includes(row)) {
            td.style.display = 'none';
            if (td.parentNode) {
                td.parentNode.style.display = 'none';
            }
            return;
        }
        else {
            if (td.parentNode) {
                td.parentNode.style.display = '';
            }
        }
    }
    timeHidden += Date.now() - start;
    start = Date.now();

    const style = sheet.style[row] ? (sheet.style[row][col] || {}) : {};

    // render formula
    let result = calcResult(value, style.numFmt);

    // rich text
    if (value && Array.isArray(value.richText)) {
        const mainSpan = document.createElement('span');
        for (let i = 0; i < value.richText.length; i++) {
            const rt = value.richText[i];
            const span = document.createElement('span');
            Handsontable.dom.fastInnerText(span, rt.text);
            if (rt.font) {
                setFontStyle(span, rt.font);
            }
            else if (style.font) {
                setFontStyle(span, style.font);
            }
            mainSpan.appendChild(span);
        }
        // removeFontStyle(td);
        result = mainSpan.innerHTML;
    }
    timeRichText += Date.now() - start;
    start = Date.now();

    // wrap the value, this fix the clicking issue for overflowed text
    const span = SPAN_TEMPLATE.cloneNode(false);
    // span.innerHTML = result;
    Handsontable.dom.fastInnerHTML(span, result);
    Handsontable.dom.fastInnerHTML(td, '');
    td.appendChild(span);

    // text overflow if right cell is empty
    const rightCell = instance.getDataAtCell(row, col + 1);
    if (rightCell === '' || rightCell === null || rightCell === undefined ||
        (typeof rightCell === 'object' && 'formula' in rightCell) &&
        (rightCell.result === '' || rightCell.result === null || rightCell.result === undefined)) {
        td.style.overflow = 'visible';
        td.style.textOverflow = 'clip';
    }
    timeSpan += Date.now() - start;
    start = Date.now();

    // default alignment
    td.classList.add('htBottom');

    // styles
    // alignment
    if (style.alignment) {
        if (style.alignment.hasOwnProperty('horizontal')) {
            td.style.textAlign = style.alignment.horizontal;
        }
        if (style.alignment.hasOwnProperty('vertical')) {

            switch (style.alignment.vertical) {
                case 'top':
                    td.classList.remove('htBottom');
                    td.classList.add('htTop');
                    break;
                case 'middle':
                    td.classList.remove('htBottom');
                    td.classList.add('htMiddle');
                    break;
            }
        }

        // font text wrap
        if (style.alignment.wrapText) {
            td.style.wrapText = 'break-word';
            td.style.whiteSpace = 'pre-wrap';
        }

        // textRotation
        if (typeof style.alignment.textRotation === 'number') {
            span.style.display = 'block';
            span.style.transform = 'rotate(-' + style.alignment.textRotation + 'deg)';
        }
    }

    // set font style if cell is not a richText
    if (style.font && !(value && Array.isArray(value.richText))) {
        setFontStyle(td, style.font);
    }

    // background
    if (style.fill) {
        if (style.fill.fgColor) {
            td.style.background = '#' + argbToRgb(style.fill.fgColor);
        }
    }

    // borders
    // check if bottom cell has top border
    if (sheet.style[row + 1] && sheet.style[row + 1][col]) {
        const bottomCell = sheet.style[row + 1][col];
        if ('border' in bottomCell && 'top' in bottomCell.border) {
            const color = argbToRgb(bottomCell.border.top.color) || '000';
            td.style.borderBottom = '1px solid #' + color;
        }
    }
    // check if right cell has left border
    if (sheet.style[row] && sheet.style[row][col + 1]) {
        const rightCell = sheet.style[row][col + 1];
        if ('border' in rightCell && 'left' in rightCell.border) {
            const color = argbToRgb(rightCell.border.left.color) || '000';
            td.style.borderRight = '1px solid #' + color;
        }
    }

    if (style.border) {
        for (var key in style.border) {
            if ((key === 'right' || key === 'bottom') && style.border.hasOwnProperty(key)) {
                var upper = key.charAt(0).toUpperCase() + key.slice(1);
                var border = style.border[key];
                const color = argbToRgb(border.color) || '000';
                td.style['border' + upper] = '1px solid #' + color;
            }
        }
    }

    timeStyles += Date.now() - start;
    start = Date.now();

    result = span.innerHTML;

    // hyperlink
    const hyperlinks = global.hyperlinks[instance.sheetNo];
    const address = colCache.encode(row + 1, col + 1);
    const hyperlink = hyperlinks[address];
    if (hyperlink) {

        const a = document.createElement('a');
        if (hyperlink.mode === 'internal') {
            a.href = '#' + hyperlink.target;
            a.onclick = (event) => {
                // a trick to move mouse out of window, to fix hyperlink performance bug
                eventFire($('ol')[0], 'mousedown');
                gui.showSheet(hyperlink.sheetName);
            };
        }
        else {
            a.target = '_black';
            a.href = hyperlink.target;
        }

        Handsontable.dom.fastInnerHTML(a, result);
        Handsontable.dom.fastInnerText(td, '');
        td.appendChild(a);
    }
    timeHyperlinks += Date.now() - start;
    timeRenderers += Date.now() - start2;
}


function eventFire(el, etype) {
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        var evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}

function setFontStyle(element, font) {
    if (font.color) {
        element.style.color = '#' + argbToRgb(font.color);
    }
    if (font.bold) {
        element.style.fontWeight = 'bold';
    }
    if (font.italic) {
        element.style.fontStyle = 'italic';
    }
    if ('size' in font) {
        element.style.fontSize = font.size + 'pt';
    }
    if (font.name) {
        element.style.fontFamily = font.name;
    }
    if (font.underline) {
        element.style.textDecoration = 'underline';
    }
}

function removeFontStyle(element) {
    element.style.color = '';
    element.style.fontWeight = '';
    element.style.fontStyle = '';
    element.style.fontSize = '';
    element.style.fontFamily = '';
    element.style.textDecoration = '';
}

function calcResult(cellValue, numFmt) {
    let result = cellValue;
    if (cellValue && typeof cellValue === 'object' && cellValue.hasOwnProperty('formula')) {
        if (cellValue.result && cellValue.result.error) {
            result = cellValue.result.error;
        }
        else {
            result = cellValue.result;

        }
    }
    result = result === null || result === undefined ? '' : result;
    if (numFmt !== null && numFmt !== undefined) {
        result = SSF.format(numFmt, result);
    }
    return result;
}

function showTimes() {
    console.log('timeHidden: ' + timeHidden);
    console.log('timeRichText: ' + timeRichText);
    console.log('timeSpan: ' + timeSpan);
    console.log('timeStyles: ' + timeStyles);
    console.log('timeHyperlinks: ' + timeHyperlinks);
    console.log('-----\ntimeRenderers: ' + timeRenderers);
    console.log('timeCells: ' + timeCells);
    console.log('-----\ncntCells, cntCellRenderer: ', cntCells, cntCellRenderer);
}

// for debugging
function printSelected() {
    const sheet = gui.getCurrentSheet();
    const index = gui.getCurrentTable().getSelected()[0];
    console.log(sheet.data[index[0]][index[1]]);
    console.log(sheet.style[index[0]][index[1]]);
}
