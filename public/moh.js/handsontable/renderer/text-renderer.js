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
    if (sheet) {
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

    // text overflow if right cell is empty
    const rightCell = instance.getDataAtCell(row, col + 1);
    if (rightCell === '' || rightCell === null || rightCell === undefined ||
        (typeof rightCell === 'object' && 'formula' in rightCell) &&
        (rightCell.result === '' || rightCell.result === null || rightCell.result === undefined)) {
        td.style.overflow = 'visible';
        td.style.textOverflow = 'clip';
    }

    if (('style' in cellProperties) && cellProperties.style) {
        var style = cellProperties.style;
        // alignment
        var cellMeta = instance.getCellMeta(row, col);
        var previousClass = (cellMeta.className !== undefined) ? cellMeta.className : '';

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
            else {
                // default bottom
                instance.setCellMeta(row, col, 'className', previousClass + ' htBottom');
            }

            // font text wrap
            if ('wrapText' in style.alignment && style.alignment.wrapText) {
                td.style.wrapText = 'break-word';
                td.style.whiteSpace = 'pre-wrap';
            }
        }
        else {
            // default bottom
            instance.setCellMeta(row, col, 'className', previousClass + ' htBottom');
        }

        // font
        if (style.hasOwnProperty('font')) {
            if (style.font.hasOwnProperty('color') && style.font.color.hasOwnProperty('argb')) {
                td.style.color = '#' + argbToRgb(style.font.color.argb);
            }
            if (style.font.hasOwnProperty('bold') && style.font.bold) {
                td.style.fontWeight = 'bold';
            }
            if (style.font.hasOwnProperty('italic') && style.font.italic) {
                td.style.fontStyle = 'italic';
            }
            if ('size' in style.font) {
                td.style.fontSize = style.font.size + 'pt';
            }
            if ('name' in style.font) {
                td.style.fontFamily = style.font.name;
            }
            if ('underline' in style.font && style.font.underline) {
                td.style.textDecoration = 'underline';
            }
        }

        // background
        if (style.hasOwnProperty('fill')) {
            if (style.fill.hasOwnProperty('fgColor') && style.fill.fgColor.hasOwnProperty('argb')) {
                td.style.background = '#' + argbToRgb(style.fill.fgColor.argb);
            }
        }

        // borders
        if (style.hasOwnProperty('border')) {
            for (var key in style.border) {
                if (style.border.hasOwnProperty(key)) {
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


    // render formula
    let result = value;
    if (value && typeof value === 'object' && value.hasOwnProperty('formula')) {
        if (value.result && value.result.error) {
            result = value.result.error;
        }
        else {
            result = value.result !== undefined ? value.result : null;
        }
        Handsontable.dom.fastInnerText(td, result);
    }

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

        a.innerText = result;
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
