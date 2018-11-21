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
    Handsontable.renderers.TextRenderer.apply(this, arguments);

    const sheet = global.workbookData.sheets[instance.sheetNo];
    if (sheet && sheet.views) {
        // grid lines
        const showGridLines = sheet.views[0].showGridLines;
        if (!showGridLines) {
            td.style.borderColor = '#fff0';
        }

        // check if this row/col should be hidden
        if (sheet.col.width[col] === 0.1) {
            td.style.display = 'none';
            return;
        }

        if (sheet.row.height[row] === 0.1) {
            if (td.parentNode) {
                td.parentNode.style.display = 'none';
            }
            td.style.display = 'none';
            return;
        }
        else {
            td.parentNode.style.display = '';
        }
    }

    const style = cellProperties.style || {};

    // render formula
    let result = calcResult(value);

    // rich text
    if (value && Array.isArray(value.richText)) {
        const mainSpan = document.createElement('span');
        for (let i = 0; i < value.richText.length; i++) {
            const rt = value.richText[i];
            const span = document.createElement('span');
            span.innerText = rt.text;
            if ('font' in rt) {
                setFontStyle(span, rt.font);
            }
            else if ('font' in style) {
                setFontStyle(span, style.font);
            }
            mainSpan.appendChild(span);
        }
        // removeFontStyle(td);
        result = mainSpan.innerHTML;
    }

    // wrap the value, this fix the clicking issue for overflowed text
    const span = document.createElement('span');
    span.innerHTML = result;
    Handsontable.dom.fastInnerText(td, '');
    span.style.pointerEvents = 'none';
    td.appendChild(span);

    // text overflow if right cell is empty
    const rightCell = instance.getDataAtCell(row, col + 1);
    if (rightCell === '' || rightCell === null || rightCell === undefined ||
        (typeof rightCell === 'object' && 'formula' in rightCell) &&
        (rightCell.result === '' || rightCell.result === null || rightCell.result === undefined)) {
        td.style.overflow = 'visible';
        td.style.textOverflow = 'clip';
    }

    // default alignment
    var cellMeta = instance.getCellMeta(row, col);
    var previousClass = (cellMeta.className !== undefined) ? cellMeta.className : '';
    instance.setCellMeta(row, col, 'className', previousClass + ' htBottom');

    if (('style' in cellProperties) && cellProperties.style) {
        // alignment
        if (style.hasOwnProperty('alignment')) {
            if (style.alignment.hasOwnProperty('horizontal')) {
                td.style.textAlign = style.alignment.horizontal;
            }
            if (style.alignment.hasOwnProperty('vertical')) {

                switch (style.alignment.vertical) {
                    case 'top':
                        instance.setCellMeta(row, col, 'className', previousClass + ' htTop');
                        break;
                    case 'middle':
                        instance.setCellMeta(row, col, 'className', previousClass + ' htMiddle');
                        break;
                }
            }

            // font text wrap
            if ('wrapText' in style.alignment && style.alignment.wrapText) {
                td.style.wrapText = 'break-word';
                td.style.whiteSpace = 'pre-wrap';
            }

            // textRotation
            if ('textRotation' in style.alignment && typeof style.alignment.textRotation === 'number') {
                span.style.display = 'block';
                span.style.transform = 'rotate(-' + style.alignment.textRotation + 'deg)';
            }

        }

        // font
        if ('font' in style && !(value && Array.isArray(value.richText))) {
            setFontStyle(td, style.font);
        }

        // background
        if (style.hasOwnProperty('fill')) {
            if (style.fill.hasOwnProperty('fgColor') && style.fill.fgColor.hasOwnProperty('argb')) {
                td.style.background = '#' + argbToRgb(style.fill.fgColor.argb);
            }
        }

        // borders
        // check if bottom cell has top border
        if (sheet.style[row + 1] && sheet.style[row + 1][col]) {
            const bottomCell = sheet.style[row + 1][col];
            if ('border' in bottomCell && 'top' in bottomCell.border && 'color' in bottomCell.border.top) {
                const color = argbToRgb(bottomCell.border.top.color.argb) || '000';
                td.style['borderBottom'] = '1px solid #' + color;
            }
        }
        // check if right cell has left border
        if (sheet.style[row] && sheet.style[row][col + 1]) {
            const rightCell = sheet.style[row][col + 1];
            if ('border' in rightCell && 'left' in rightCell.border && 'color' in rightCell.border.left) {
                const color = argbToRgb(rightCell.border.left.color.argb) || '000';
                td.style['borderRight'] = '1px solid #' + color;
            }
        }

        if (style.hasOwnProperty('border')) {
            for (var key in style.border) {
                if ((key === 'right' || key === 'bottom') && style.border.hasOwnProperty(key)) {
                    var upper = key.charAt(0).toUpperCase() + key.slice(1);
                    var border = style.border[key];
                    if (border.hasOwnProperty('color') && border.color.hasOwnProperty('argb')) {
                        td.style['border' + upper] = '1px solid #' + argbToRgb(border.color.argb);
                    }
                    else {
                        // black color
                        td.style['border' + upper] = '1px solid #000';
                    }
                }
            }
        }
    }
    result = span.innerHTML;

    // hyperlink
    if (cellProperties.hyperlink) {
        const a = document.createElement('a');
        if (cellProperties.hyperlink.mode === 'internal') {
            a.href = '#' + cellProperties.hyperlink.target;
            a.onclick = (event) => {
                // a trick to move mouse out of window, to fix hyperlink performance bug
                eventFire($('ol')[0], 'mousedown');
                gui.showSheet(cellProperties.hyperlink.sheetName);
            };

        }
        else {
            a.href = cellProperties.hyperlink.target;
        }

        a.innerHTML = result;
        Handsontable.dom.fastInnerText(td, '');
        td.appendChild(a);
    }
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
    if ('color' in font && 'argb' in font.color) {
        element.style.color = '#' + argbToRgb(font.color.argb);
    }
    if ('bold' in font && font.bold) {
        element.style.fontWeight = 'bold';
    }
    if ('italic' in font && font.italic) {
        element.style.fontStyle = 'italic';
    }
    if ('size' in font) {
        element.style.fontSize = font.size + 'pt';
    }
    if ('name' in font) {
        element.style.fontFamily = font.name;
    }
    if ('underline' in font && font.underline) {
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

function calcResult(cellValue) {
    let result = cellValue;
    if (cellValue && typeof cellValue === 'object' && cellValue.hasOwnProperty('formula')) {
        if (cellValue.result && cellValue.result.error) {
            result = cellValue.result.error;
        }
        else {
            result = cellValue.result !== undefined ? cellValue.result : null;
        }
    }
    return result;
}
