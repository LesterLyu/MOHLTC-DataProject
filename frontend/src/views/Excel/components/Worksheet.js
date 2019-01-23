import {Component} from "react";
import {colCache} from '../helpers';
import Handsontable from "handsontable";
import {HotTable} from "@handsontable/react";
import React from "react";

class Worksheet extends Component {
  constructor(props) {
    super(props);
    if (props.mode === 'admin') {
      this.settings = {
        rowHeaders: true,
        colHeaders: true,
        trimWhitespace: false,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: false,
        manualRowMove: false,
        autoWrapCol: false,
        autoWrapRow: false,
        autoRowSize: false,
        autoColumnSize: false,
        contextMenu: ['copy'],
        renderAllRows: false,
        viewportRowRenderingOffset: 20,
        viewportColumnRenderingOffset: 10,
        cells: (row, col) => {
          let cellProperties = {};
          cellProperties.renderer = props.renderer;
          cellProperties.editor = props.editor;
          return cellProperties;
        },
      }
    } else {
      this.settings = {
        rowHeaders: true,
        colHeaders: true,
        trimWhitespace: false,
        manualColumnResize: true,
        manualRowResize: true,
        manualColumnMove: false,
        manualRowMove: false,
        autoWrapCol: false,
        autoWrapRow: false,
        autoRowSize: false,
        autoColumnSize: false,
        contextMenu: ['copy'],
        renderAllRows: false,
        viewportRowRenderingOffset: 20,
        viewportColumnRenderingOffset: 10,
        cells: (row, col) => {
          let cellProperties = {};
          // dropdown
          // TO-DO move data validation to ws.style, this should improve the efficient
          col = col === -1 ? 16383 : col;
          const address = colCache.encode(row + 1, col + 1);
          const dataValidation = props.global.dataValidations[props.global.currentSheetIdx];
          if (dataValidation.dropDownData[address]) {
            cellProperties.source = dataValidation.dropDownData[address];
            cellProperties.renderer = Handsontable.renderers.AutocompleteRenderer;
            cellProperties.editor = Handsontable.editors.DropdownEditor;
            cellProperties.validator = Handsontable.validators.AutocompleteValidator;
            cellProperties.allowInvalid = true;
            return cellProperties;
          }
          cellProperties.renderer = props.renderer;
          cellProperties.editor = props.editor;

          return cellProperties;
        },
        afterChange: (changes, source) => {
          // console.log('change', changes, source)
          if (source === 'edit') {
            const oldValue = changes[0][2], newValue = changes[0][3];
            if (typeof oldValue !== typeof newValue ||
              (typeof oldValue === 'number' && oldValue !== newValue) ||
              (typeof oldValue === 'object' && (oldValue === null || oldValue.result !== newValue.result)) ||
              (typeof oldValue === 'string' && oldValue !== newValue))
              setTimeout(() => {
                props.context.calculationChain.change(props.global.currentSheetIdx, changes[0][0], changes[0][1]);
                props.context.sheetRef.current.hotInstance.render()
              }, 0);
          }
        }
      };
    }
    Object.assign(this.settings, props.settings || {});
  }

  render() {
    if (this.props.hide) {
      return null;
    } else {
      return (
        <HotTable ref={this.props.forwardedRef} id={this.props.id} settings={this.settings}/>
      )
    }
  }
}

export default Worksheet;
