import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import {Input, Button} from '@material-ui/core';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import OutlinedButton from "../../views/Buttons/OutlinedButton";
import {ContentSaveEdit} from "mdi-material-ui";
const log = console.log;

const styles = theme => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
    maxWidth: 300,
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.unit / 4,
  },
  noLabel: {
    marginTop: theme.spacing.unit * 3,
  },
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "CRUD-workbook-template",
  "create-delete-attribute-category",
  "user-management",
  "system-management",
  "workbook-query"
];

function getStyles(name, that) {
  return {
    fontWeight:
      that.state.name.indexOf(name) === -1
        ? that.props.theme.typography.fontWeightRegular
        : that.props.theme.typography.fontWeightMedium,
    background:
      that.state.name.indexOf(name) === -1
        ? '#FFF'
        : '#83b2cc',
  };
}

class MultipleSelect extends React.Component {
  state = {
    name: [],
  };

  handleSubmit = e => {
    e.preventDefault();
    log(this.state.name)
  };

  handleChange = event => {
    this.setState({ name: event.target.value });
  };

  handleChangeMultiple = event => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    this.setState({
      name: value,
    });
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <FormControl className={classNames(classes.formControl, classes.noLabel)}>
          <Select
            multiple
            displayEmpty
            value={this.state.name}
            onChange={this.handleChange}
            input={<Input id="select-multiple-placeholder" />}
            renderValue={selected => {
              if (selected.length === 0) {
                return <em>Choose Permissions</em>;
              }

              return selected.join(', ');
            }}
            MenuProps={MenuProps}
          >
            <MenuItem disabled value="">
              <em>Placeholder</em>
            </MenuItem>
            {names.map(name => (

              <MenuItem key={name} value={name} style={getStyles(name, this)}>
                <Checkbox checked={this.state.name.indexOf(name) > -1} />
                {name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
          <Button variant="contained" color="primary" onClick={this.handleSubmit} tabIndex="0" style={{margin:10}}>
            <ContentSaveEdit style={{paddingRight:5, marginTop:5, marginBottom:5}}/>
              save
          </Button>
      </div>
    );
  }
}

MultipleSelect.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles, { withTheme: true })(MultipleSelect);
