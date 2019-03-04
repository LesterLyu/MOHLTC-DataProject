import React from 'react';
import Excel from './CreateExcel';
import {mount, shallow, render} from "enzyme/build";
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
    console.log(wrapper.name());

    excel = wrapper.instance();
    console.log(excel)
    // wait for async functions
    await excel.workbookManager.createWorkbookLocal();
    console.log(wrapper.children())
  });

  it('should load an empty workbook', () => {
    expect(excel.workbook).not.toBe(undefined);
  });

  it('basic formula cell reference', () => {
    excel.setData(0, 0, 0, '=123', 'edit');
    excel.setData(0, 0, 1, '=A1', 'edit');
    expect(excel.sheet.cell('B1').value()).toBe(123);
  });


});


// it('simulates click events', () => {
//   const onButtonClick = sinon.spy();
//   const wrapper = shallow(<Foo onButtonClick={onButtonClick} />);
//   wrapper.find('button').simulate('click');
//   expect(onButtonClick).to.have.property('callCount', 1);
// });
