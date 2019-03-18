import React from 'react';
import Excel from './CreateExcel';
import {mount, shallow, render} from "enzyme/build";
import XlsxPopulate from "xlsx-populate";
import sinon from 'sinon';
import {
  FormatBold, FormatColorFill, SaveAlt, CloudUploadOutlined, WrapText,
  FormatItalic, FormatUnderlined, FormatStrikethrough, FormatColorText,
  FormatAlignCenter, FormatAlignLeft, FormatAlignRight, FormatAlignJustify,
  VerticalAlignBottom, VerticalAlignCenter, VerticalAlignTop,
  BorderTop, BorderRight, BorderBottom, BorderLeft, BorderClear, BorderAll, //BorderColor,ZoomIn, ZoomOut,
} from "@material-ui/icons";
import ExcelToolBar from './components/ExcelToolBar';
import {
  AppBar,
  Button,
  Grid,
  withStyles,
  Popover,
} from "@material-ui/core";

describe('<Excel />', () => {
  let wrapper, excel, toolbar;

  beforeAll(async () => {
    wrapper = mount(<Excel/>).childAt(0);
    excel = wrapper.instance();
    excel.attOptions = ['att1', 'att2'];
    excel.catOptions = ['cat1', 'cat2'];
    // wait for async functions
    await excel.workbookManager.createWorkbookLocal();
  });

  it('should load an empty workbook', () => {
    expect(excel.workbook).not.toBe(undefined);
  });

  it('empty cell should equal 0', () => {
    excel.setData(0, 0, 1, '=A1', 'edit');
    expect(excel.sheet.cell('B1').value()).toBe(0);
  });

  it('basic formula cell reference', () => {
    excel.setData(0, 0, 0, '=123', 'edit');
    excel.setData(0, 0, 1, '=A1', 'edit');
    expect(excel.sheet.cell('B1').value()).toBe(123);
  });

  it('formula SUM with cell range reference', () => {
    excel.setData(0, 0, 0, '=123', 'edit');
    excel.setData(0, 0, 1, '=123', 'edit');
    excel.setData(0, 0, 2, '=123', 'edit');
    excel.setData(0, 0, 3, '=123', 'edit');
    excel.setData(0, 0, 4, '=SUM(A1:D1)', 'edit');
    expect(excel.sheet.cell('E1').value()).toBe(123 * 4);
  });

  it('basic formula calculation chain', () => {
    excel.setData(0, 0, 0, '=123', 'edit');
    excel.setData(0, 0, 1, '=A1', 'edit');
    excel.setData(0, 0, 0, '=321', 'edit');
    expect(excel.sheet.cell('B1').value()).toBe(321);
  });

  describe('formula error', () => {
    it('divide by 0', () => {
      excel.setData(0, 0, 0, '=1/0', 'edit');
      expect(excel.sheet.cell('A1').value() instanceof XlsxPopulate.FormulaError).toBe(true);
      expect(excel.sheet.cell('A1').value().error()).toBe(XlsxPopulate.FormulaError.DIV0.error());
    });

    it('unknown variable', () => {
      excel.setData(0, 0, 0, '=ABCD', 'edit');
      expect(excel.sheet.cell('A1').value() instanceof XlsxPopulate.FormulaError).toBe(true);
      expect(excel.sheet.cell('A1').value().error()).toBe(XlsxPopulate.FormulaError.NAME.error());
    });

    it('unknown function', () => {
      excel.setData(0, 0, 0, '=ABCD()', 'edit');
      expect(excel.sheet.cell('A1').value() instanceof XlsxPopulate.FormulaError).toBe(true);
      expect(excel.sheet.cell('A1').value().error()).toBe(XlsxPopulate.FormulaError.NAME.error());
    });
  });

  describe('open workbook', () => {
    let workbook;
    beforeAll((done) => {
      XlsxPopulate.fromFileAsync('./test/excels/egginc.xlsx')
        .then(wb => {
          workbook = wb;
          excel.workbookManager._readWorkbook(wb, (sheets, sheetNames, workbook) => {
            excel.global.sheetNames = sheetNames;
            excel.global.sheets = sheets;
            excel.workbook = workbook;
            excel.currentSheetIdx = 1;
            excel.currentSheetIdx = 0;
            done();
          });
        })
    });

    it('read cells', () => {
      expect(excel.getDataAtSheetAndCell(0, 0, 0)).toBe('soul eggs');
      expect(excel.getDataAtSheetAndCell(1, 0, 0)).toBe(35526);
    });

    it('set cell A1 and other cells should change', () => {
      excel.setData(0, 1, 0, 12345, 'edit');
      expect(workbook.sheet(0).cell('B14').value()).toBe(12345);
      expect(workbook.sheet(0).cell('B17').value()).toBe(12345);
      expect(workbook.sheet(0).cell('D14').value()).toBe(2469);
      expect(workbook.sheet(0).cell('D17').value()).toBeCloseTo(2592.45, 10);
    })
  });

});


// it('simulates click events', () => {
//   const onButtonClick = sinon.spy();
//   const wrapper = shallow(<Foo onButtonClick={onButtonClick} />);
//   wrapper.find('button').simulate('click');
//   expect(onButtonClick).to.have.property('callCount', 1);
// });
