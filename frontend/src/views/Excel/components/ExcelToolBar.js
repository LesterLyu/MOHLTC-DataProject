import React, {Component} from "react";
import {
  AppBar,
  Button,
  Grid,
  withStyles,
  Popover,
} from "@material-ui/core";
import {
  FormatBold, FormatColorFill, SaveAlt, CloudUploadOutlined, WrapText, Save,
  FormatItalic, FormatUnderlined, FormatStrikethrough, FormatColorText,
  FormatAlignCenter, FormatAlignLeft, FormatAlignRight, FormatAlignJustify,
  VerticalAlignBottom, VerticalAlignCenter, VerticalAlignTop,
  BorderTop, BorderRight, BorderBottom, BorderLeft, BorderClear, BorderAll, //BorderColor,ZoomIn, ZoomOut,
} from "@material-ui/icons";
import {TableMergeCells} from "mdi-material-ui";
import PropTypes from "prop-types";
import {SketchPicker} from 'react-color';
import SelectField from './SelectField';
import {hooks} from '../helpers';


export function ToolBarDivider() {
  return <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>;
}

const styles = theme => ({
  button: {
    minWidth: 40,
  }
});

class ExcelToolBar extends Component {

  constructor(props) {
    super(props);
    this.excel = props.context;
    this.state = {
      fillColorPopover: null, selectedFillColor: '#fff', textColorPopover: null,
      selectedTextColor: '#000', selectedFontSize: 14, selectedFontFamily: 'Calibri',
    };
    this.history = {
      current: {},
    };
    // see https://github.com/LesterLyu/xlsx-populate#styles-1
    this.booleanAttributes = ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript',
      'justifyLastLine', 'wrapText', 'shrinkToFit', 'angleTextCounterclockwise', 'angleTextClockwise',
      'rotateTextUp', 'rotateTextDown', 'verticalText'];
    this.otherAttributes = ['fontSize', 'fontFamily', 'fontColor', 'horizontalAlignment',
      'indent', 'verticalAlignment', 'textDirection', 'textRotation', 'fill', 'border', 'borderColor',
      'borderStyle',];
    const fontSizeOptions = [6, 7, 8, 9, 10, 11, 12, 14, 18, 24, 36, 48, 60, 72];
    this.fontSizeOptions = [];
    for (let i = 0; i < fontSizeOptions.length; i++) {
      this.fontSizeOptions.push({value: fontSizeOptions[i], label: fontSizeOptions[i] + ''});
    }

    hooks.add('afterSelection', (row, col, row2, col2) => {
      if (this.history.current.row === row && this.history.current.col === col) return;
      const cell = this.excel.workbook.sheet(this.excel.currentSheetIdx).cell(row, col);
      const style = {
        fill: cell.style('fill'),
        fontColor: cell.style('fontColor'),
        fontSize: cell.style('fontSize'),
        fontFamily: cell.style('fontFamily')
      };
      this.setState({
        selectedFillColor: style.fill ? style.fill : '#000',
        selectedTextColor: style.fontColor ? style.fontColor : '#fff',
        selectedFontSize: style.fontSize ? style.fontSize : 11,
        selectedFontFamily: style.fontFamily ? style.fontFamily : 'Calibri',
      });
      this.history.current = {row, col}
    });
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state !== nextState;
  }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   this.history.current = this.props.context.global.current;
  // }

  get hotInstance() {
    return this.excel.hotInstance;
  }

  getSelected() {
    return this.excel.hotInstance.getSelected();
  }

  downloadWorkbook = () => {
    this.excel.excelManager.downloadWorkbook(this.excel.workbook, this.excel.state.fileName)
      .then(() => {
        console.log('downloaded')
      })
  };

  uploadWorkbook = () => {
    this.excel.excelManager.readWorkbookLocal((sheets, sheetNames, workbook) => {
      console.log(sheets, sheetNames, workbook);
      this.excel.global.sheetNames = sheetNames;
      this.excel.global.sheets = sheets;
      this.excel.workbook = workbook;
      this.excel.currentSheetIdx = 0;
      this.excel.forceUpdate();
    })
  };
  saveWorkbook = () => {
    this.excel.excelManager.saveWorkbookAdmin(this.excel.workbook);
  };

  style = (name, value, ranges = this.getSelected()) => {
    const {excel} = this;
    // const styles = excel.currentSheet.styles;
    // const ranges = ranges || this.getSelected();
    if (!ranges) {
      return;
    }
    console.log(name, value);
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      // render one extra row if exists
      if (range[0] > 0) {
        let col = range[1] > 0 ? range[1] - 1 : range[1];
        for (col; col <= range[3]; col++) {
          excel.renderer.cellNeedUpdate(excel.currentSheetIdx, range[0] - 1, col);
        }
      }
      for (let row = range[0]; row <= range[2]; row++) {
        // render one extra cell if exists
        if (range[1] > 0) {
          excel.renderer.cellNeedUpdate(excel.currentSheetIdx, row, range[1] - 1);
        }
        for (let col = range[1]; col <= range[3]; col++) {
          // const style = styles[row][col];
          excel.renderer.cellNeedUpdate(excel.currentSheetIdx, row, col);
          const cell = excel.workbook.sheet(excel.currentSheetIdx).cell(row + 1, col + 1);
          if (this.booleanAttributes.includes(name)) {
            // style[name] = !style[name];
            cell.style(name, !cell.style(name));
          } else if (this.otherAttributes.includes(name)) {
            if (typeof value === 'object') {
              const mergedValue = Object.assign(cell.style(name) || {}, value);
              // style[name] = mergedValue;
              cell.style(name, mergedValue);
            } else {
              const valueCopy = (typeof value === 'object' && value) ? Object.assign({}, value) : value;
              // style[name] = valueCopy;
              cell.style(name, valueCopy);
            }
          }
        }
      }
    }
    excel.renderCurrentSheet()
  };

  // Fill/Text color
  showColorPopover = (popover) => (event) => {
    this.setState({
      [popover]: event.currentTarget,
    });
  };

  hideColorPopever = (popover) => () => {
    this.setState({
      [popover]: null,
    });
  };

  onColorChange = (selectedColor, styleName) => (color) => {
    this.setState({[selectedColor]: color.hex});
    if (styleName === 'fill') {
      this.style(styleName, {
        type: "solid",
        color: {
          rgb: color.hex.substring(1),
        }
      })
    } else if (styleName === 'fontColor') {
      this.style(styleName, color.hex.substring(1))
    }
  };

  /**
   *
   * @param borderPosition {string} [left|right|bottom|top]
   * @param style {string} [thin|medium|thick]
   * @param color {string} hex rgb color without #
   * @return {Function}
   */
  setBorder = (borderPosition, style = 'thin', color = '000000') => () => {
    let ranges = this.getSelected();
    if (!ranges) {
      return;
    }
    // const style2Width = {thin: 1, medium: 2, thick: 3};

    if (borderPosition === 'all') {
      this.style('border',
        {
          left: {style, color},
          right: {style, color},
          top: {style, color},
          bottom: {style, color},
        }, ranges);
    } else if (borderPosition === 'clear') {
      this.style('border',
        {
          left: null,
          right: null,
          top: null,
          bottom: null,
        }, ranges);
    } else {
      // separate borders
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        if (borderPosition === 'top') {
          range[2] = range[0];
        } else if (borderPosition === 'bottom') {
          range[0] = range[2];
        } else if (borderPosition === 'right') {
          range[1] = range[3];
        } else if (borderPosition === 'left') {
          range[3] = range[1];
        }
      }
      this.style('border', {[borderPosition]: {style, color}}, ranges);

    }
  };

  handleSelectChange = selectName => event => {
    this.setState({
      [selectName]: event.target.value,
    });
    if (selectName === 'selectedFontSize') {
      this.style('fontSize', event.target.value);
    }
  };

  mergeCells = () => this.hotInstance.getPlugin('ContextMenu').executeCommand('mergeCells');

  render() {
    const {fillColorPopover, textColorPopover, selectedFontSize} = this.state;
    const {classes} = this.props;
    const openFillColor = Boolean(fillColorPopover);
    const openTextColor = Boolean(textColorPopover);

    return (
      <>
        <AppBar position="static" color="default" style={{}}>
          <Grid container className={classes.root}>
            <Button aria-label="Save" className={classes.button}
                    onClick={() => this.saveWorkbook()}>
              <Save fontSize="small"/>
            </Button>
            <ToolBarDivider/>
            <Button aria-label="Download" className={classes.button}
                    onClick={() => this.uploadWorkbook()}>
              <CloudUploadOutlined fontSize="small"/>
            </Button>
            <Button aria-label="Download" className={classes.button}
                    onClick={() => this.downloadWorkbook()}>
              <SaveAlt fontSize="small"/>
            </Button>
            {/*<Button aria-label="Zoom in" className={classes.button}*/}
            {/*onClick={() => console.log('1')}>*/}
            {/*<ZoomIn fontSize="small"/>*/}
            {/*</Button>*/}
            {/*<Button aria-label="Zoom out" className={classes.button}*/}
            {/*onClick={() => console.log('1')}>*/}
            {/*<ZoomOut fontSize="small"/>*/}
            {/*</Button>*/}
            {/*<Button aria-label="Save" className={classes.button}*/}
            {/*onClick={() => console.log('1')}>*/}
            {/*<Save fontSize="small"/>*/}
            {/*</Button>*/}

            <ToolBarDivider/>
            <ToolBarDivider/>

            <SelectField
              value={selectedFontSize}
              onChange={this.handleSelectChange('selectedFontSize')}
              options={this.fontSizeOptions}
            />

            <ToolBarDivider/>

            <Button aria-label="Bold" className={classes.button}
                    onClick={() => this.style('bold')}>
              <FormatBold fontSize="small"/>
            </Button>
            <Button aria-label="Italic" className={classes.button}
                    onClick={() => this.style('italic')}>
              <FormatItalic fontSize="small"/>
            </Button>
            <Button aria-label="Underline" className={classes.button}
                    onClick={() => this.style('underline')}>
              <FormatUnderlined fontSize="small"/>
            </Button>
            <Button aria-label="Strikethrough" className={classes.button}
                    onClick={() => this.style('strikethrough')}>
              <FormatStrikethrough fontSize="small"/>
            </Button>

            <ToolBarDivider/>
            <Button aria-label="Merge Cells" className={classes.button}
                    onClick={this.mergeCells}>
              <TableMergeCells fontSize="small"/>
            </Button>

            <Button aria-label="Wrap Text" className={classes.button}
                    onClick={() => this.style('wrapText')}>
              <WrapText fontSize="small"/>
            </Button>

            <Button aria-label="Fill Color" className={classes.button}
                    onClick={this.showColorPopover('fillColorPopover')}>
              <FormatColorFill fontSize="small"/>
            </Button>
            <Button aria-label="Text Color" className={classes.button}
                    onClick={this.showColorPopover('textColorPopover')}>
              <FormatColorText fontSize="small"/>
            </Button>

            <ToolBarDivider/>

            <Button aria-label="Horizontal Align Left" className={classes.button}
                    onClick={() => this.style('horizontalAlignment', 'left')}>
              <FormatAlignLeft fontSize="small"/>
            </Button>
            <Button aria-label="Horizontal Align Center" className={classes.button}
                    onClick={() => this.style('horizontalAlignment', 'center')}>
              <FormatAlignCenter fontSize="small"/>
            </Button>
            <Button aria-label="Horizontal Align Right" className={classes.button}
                    onClick={() => this.style('horizontalAlignment', 'right')}>
              <FormatAlignRight fontSize="small"/>
            </Button>
            <Button aria-label="Horizontal Align justify" className={classes.button}
                    onClick={() => this.style('horizontalAlignment', 'justify')}>
              <FormatAlignJustify fontSize="small"/>
            </Button>

            <ToolBarDivider/>

            <Button aria-label="Vertical Align Top" className={classes.button}
                    onClick={() => this.style('verticalAlignment', 'top')}>
              <VerticalAlignTop fontSize="small"/>
            </Button>
            <Button aria-label="Vertical Align Center" className={classes.button}
                    onClick={() => this.style('verticalAlignment', 'center')}>
              <VerticalAlignCenter fontSize="small"/>
            </Button>
            <Button aria-label="Vertical Align Bottom" className={classes.button}
                    onClick={() => this.style('verticalAlignment', 'bottom')}>
              <VerticalAlignBottom fontSize="small"/>
            </Button>

            <ToolBarDivider/>

            <Button aria-label="Bottom Border" className={classes.button}
                    onClick={this.setBorder('bottom')}>
              <BorderBottom fontSize="small"/>
            </Button>
            <Button aria-label="Top Border" className={classes.button}
                    onClick={this.setBorder('top')}>
              <BorderTop fontSize="small"/>
            </Button>
            <Button aria-label="Left Border" className={classes.button}
                    onClick={this.setBorder('left')}>
              <BorderLeft fontSize="small"/>
            </Button>
            <Button aria-label="Right Border" className={classes.button}
                    onClick={this.setBorder('right')}>
              <BorderRight fontSize="small"/>
            </Button>
            <Button aria-label="All Border" className={classes.button}
                    onClick={this.setBorder('all')}>
              <BorderAll fontSize="small"/>
            </Button>
            <Button aria-label="Clear Border" className={classes.button}
                    onClick={this.setBorder('clear')}>
              <BorderClear fontSize="small"/>
            </Button>

            <ToolBarDivider/>


          </Grid>
          <Popover
            id="fillColorPopover"
            open={openFillColor}
            anchorEl={fillColorPopover}
            onClose={this.hideColorPopever('fillColorPopover')}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <SketchPicker
              disableAlpha
              color={this.state.selectedFillColor}
              onChangeComplete={this.onColorChange('selectedFillColor', 'fill')}/>
          </Popover>
          <Popover
            id="textColorPopover"
            open={openTextColor}
            anchorEl={textColorPopover}
            onClose={this.hideColorPopever('textColorPopover')}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <SketchPicker
              disableAlpha
              color={this.state.selectedTextColor}
              onChangeComplete={this.onColorChange('selectedTextColor', 'fontColor')}/>
          </Popover>
        </AppBar>
      </>
    )
  }
}

ExcelToolBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ExcelToolBar);
