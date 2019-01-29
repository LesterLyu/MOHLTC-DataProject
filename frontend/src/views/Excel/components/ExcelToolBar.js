import React, {Component} from "react";
import {
  AppBar,
  Button,
  Card,
  Grid,
  withStyles,
  Popover,
  FormControl,
  MenuItem,
  TextField,
  Input
} from "@material-ui/core";
import {
  FormatBold, FormatColorFill, Save, SaveAlt, ZoomIn, ZoomOut,
  FormatItalic, FormatUnderlined, FormatStrikethrough, FormatColorText,
  FormatAlignCenter, FormatAlignLeft,  FormatAlignRight, FormatAlignJustify,
  VerticalAlignBottom, VerticalAlignCenter, VerticalAlignTop,
} from "@material-ui/icons";
import PropTypes from "prop-types";
import {SketchPicker} from 'react-color';
import SelectField from './SelectField';

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
    // see https://github.com/LesterLyu/xlsx-populate#styles-1
    this.booleanAttributes = ['bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript',
      'justifyLastLine', 'wrapText', 'shrinkToFit', 'angleTextCounterclockwise', 'angleTextClockwise',
      'rotateTextUp', 'rotateTextDown', 'verticalText'];
    this.otherAttributes = ['fontSize', 'fontFamily', 'fontColor', 'horizontalAlignment',
      'indent', 'verticalAlignment', 'textDirection', 'textRotation', 'fill', 'border', 'borderColor',
      'borderStyle',];
    const fontSizeOptions = [6,7,8,9,10,11,12,14,18,24,36,48,60,72];
    this.fontSizeOptions = [];
    for (let i = 0; i < fontSizeOptions.length; i++) {
      this.fontSizeOptions.push({value: fontSizeOptions[i], label: fontSizeOptions[i] + ''});
    }
  }

  getSelected() {
    return this.excel.hotInstance.getSelected();
  }

  downloadWorkbook = () => {
    this.excel.workbookManager.downloadWorkbook(this.excel.workbook)
      .then(() => {
        console.log('downloaded')
      })
  };

  style = (name, value) => {
    const {excel} = this;
    const styles = excel.currentSheet.styles;
    const ranges = this.getSelected();
    if (!ranges) {
      return;
    }
    console.log(name, value);
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      for (let row = range[0]; row <= range[2]; row++) {
        for (let col = range[1]; col <= range[3]; col++) {
          const style = styles[row][col];
          const cell = excel.workbook.sheets(0)[excel.currentSheetIdx].cell(row + 1, col + 1);
          if (this.booleanAttributes.includes(name)) {
            style[name] = !style[name];
            cell.style(name, style[name]);
          } else if (this.otherAttributes.includes(name)) {
            style[name] = value;
            cell.style(name, value);
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

  handleSelectChange = selectName => event => {
    this.setState({
      [selectName]: event.target.value,
    });
    if (selectName === 'selectedFontSize') {
      this.style('fontSize', event.target.value);
    }
  };

  render() {
    const {fillColorPopover, textColorPopover, selectedFontSize} = this.state;
    const {classes} = this.props;
    const openFillColor = Boolean(fillColorPopover);
    const openTextColor = Boolean(textColorPopover);

    return (
      <AppBar position="static" color="default" style={{marginBottom: 3}}>
        <Grid container className={classes.root}>
          <Button aria-label="Zoom in" className={classes.button}
                  onClick={() => console.log('1')}>
            <ZoomIn fontSize="small"/>
          </Button>
          <Button aria-label="Zoom out" className={classes.button}
                  onClick={() => console.log('1')}>
            <ZoomOut fontSize="small"/>
          </Button>
          <Button aria-label="Save" className={classes.button}
                  onClick={() => console.log('1')}>
            <Save fontSize="small"/>
          </Button>

          <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>

          <SelectField
            value={selectedFontSize}
            onChange={this.handleSelectChange('selectedFontSize')}
            options={this.fontSizeOptions}
          />

          <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>

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

          <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>

          <Button aria-label="Fill Color" className={classes.button}
                  onClick={this.showColorPopover('fillColorPopover')}>
            <FormatColorFill fontSize="small"/>
          </Button>
          <Button aria-label="Text Color" className={classes.button}
                  onClick={this.showColorPopover('textColorPopover')}>
            <FormatColorText fontSize="small"/>
          </Button>

          <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>

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

          <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>

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

          <div style={{borderLeft: '1px #9b9b9b6e solid', margin: '5px 3px 5px 5px'}}/>

          <Button aria-label="Download" className={classes.button}
                  onClick={() => this.downloadWorkbook()}>
            <SaveAlt fontSize="small"/>
          </Button>
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
    )
  }
}

ExcelToolBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ExcelToolBar);
