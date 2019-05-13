import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import React, {Component} from "react";
import Select from 'react-select';
import Popover from "@material-ui/core/Popover";


const styles = theme => ({
  popover: {
    overflow: 'visible'
  },
});

let width, height;

/**
 * @return {null}
 */
function EmptyComponent(props) {
  return null;
}

const components = {
  DropdownIndicator: EmptyComponent,
  IndicatorSeparator: EmptyComponent
};


class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = {
      value: null,
    };
  }

  handleChange = selectedOption => {
    console.log(`selected:`, selectedOption);
    this.setState({value: selectedOption});
    this.props.handleChange(selectedOption);
  };

  render() {
    const {classes, theme, cell, anchorEl} = this.props;

    const open = Boolean(anchorEl);
    if (open) {
      width = anchorEl.offsetWidth;
      height = anchorEl.offsetHeight;
    }

    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
      menu: base => ({
        ...base,
        position: 'absolute',
        zIndex: 1,
        marginTop: 1,
        left: 0,
        right: 0,
        borderRadius: 0
      }),
      control: base => ({
        ...base,
        borderRadius: 0,
        borderColor: '#2684ff',
        borderWidth: 1,
        boxShadow: '0 0 0 1px #2684FF',
        margin: '-1px -1px 0 -1px',
        width: width + 2,
        minHeight: height,
      }),
      valueContainer: base => ({
        ...base,
        padding: 0,
      }),
    };

    let options = [], value = this.state.value, idx;
    if (cell) {
      value = cell.value();
      console.log('chose ' + value);
      // get options
      const formula = cell.dataValidation().formula1;
      options = cell.sheet().workbook()._parser._parser.parse(formula, cell.getRef(), true);
      if (typeof options === "string") {
        options = options.replace(/\s[,;]\s/g, ',').split(',');
      } else if (Array.isArray(options)) {
        options = options.flat();
      } else {
        options = [options];
      }
    }
    options = options.map((option, index) => {
      option = option.trim();
      if (option === value)
        idx = index;
      return {value: option, label: option}
    });

    return (
      <Popover
        id="simple-popper"
        open={open}
        anchorEl={this.props.anchorEl}
        onClose={this.props.handleClose}
        classes={{paper: classes.popover}}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transitionDuration={0}
      >
        <Select
          value={options[idx]}
          onChange={this.handleChange}
          options={options}
          classes={classes}
          styles={selectStyles}
          menuIsOpen={true}
          components={components}
        />
      </Popover>
    )
  }
}

Dropdown.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(Dropdown);
