import React, {PureComponent} from "react";
import {Popover, withStyles} from "@material-ui/core";
import {getCellType} from "../utils";
import PropTypes from "prop-types";


const styles = theme => ({
  paper: {display: 'inline-flex'}
});

class CellEditor extends PureComponent {
  state = {
    value: undefined,
  };

  onChange = event => {
    this.setState({value: event.target.value})
  };

  onClose = () => {
    // try to convert to different types
    let value = this.state.value;
    if (typeof value === 'object') {
    } else if (value === '' || value == null) {
      value = undefined;
    } else if (!isNaN(value)) {
      value = Number(value);
    } else if (value.toUpperCase() === 'TRUE') {
      value = true;
    } else if (value.toUpperCase() === 'FALSE') {
      value = false;
    }
    this.props.handleClose(value);
  };

  prepare = (cell, style, typed) => {
    let value;
    if (typed) {
      value = '';
    } else {
      value = cell ? cell.getValue() : undefined;
      const type = getCellType(cell);
      if (type === 'formula') {
        value = '=' + cell.getFormula();
      }
    }
    this.style = style;
    this.setState({value})
  };

  /**
   * @param {KeyboardEvent} e
   */
  onKeyDown = (e) => {
    if (!e.altKey) {
      if (e.key === 'Enter') {
        this.onClose();
      }
    } else {
      if (e.key === 'Enter') {
        this.setState({value: this.state.value + '\n'});
      }
    }
    // console.log(e);
  };

  render() {
    const {config, classes} = this.props;
    const open = Boolean(config);
    let style = {resize: 'none', overflow: 'hidden'};
    if (open) {
      Object.assign(style, this.style, {
        position: null,
        overflow: 'hidden',
        left: null,
        top: null,
        border: '2px solid rgba(75, 135, 255, 0.95)',
      });
    }

    return (
      <Popover
        PaperProps={{square: true}}
        classes={{paper: classes.paper}}
        anchorReference="anchorPosition"
        open={open}
        onClose={this.onClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        anchorPosition={config}
        transitionDuration={0}>
        <textarea
          style={style}
          autoFocus
          onChange={this.onChange}
          value={this.state.value}
          onKeyDown={this.onKeyDown}
        />
      </Popover>
    )
  }
}

CellEditor.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CellEditor);
