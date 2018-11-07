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
            result =  value.result.error;
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
