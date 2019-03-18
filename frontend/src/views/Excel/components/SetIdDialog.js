import PropTypes from 'prop-types';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  NoSsr,
  Typography,
  TextField,
  Paper,
  MenuItem,
  Chip
} from "@material-ui/core";
import CancelIcon from '@material-ui/icons/Cancel';
import {emphasize} from '@material-ui/core/styles/colorManipulator';
import React, {Component} from "react";
import Select from 'react-select';
import Popover from "@material-ui/core/Popover";

const styles = theme => ({
  popover: {
    overflow: 'visible'
  },
  dialogContent: {
    overflowY: 'visible'
  },
  root: {
    flexGrow: 1,
    height: 250,
  },
  input: {
    display: 'flex',
    padding: 0,
  },
  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chip: {
    margin: `${theme.spacing.unit / 2}px ${theme.spacing.unit / 4}px`,
  },
  chipFocused: {
    backgroundColor: emphasize(
      theme.palette.type === 'light' ? theme.palette.grey[300] : theme.palette.grey[700],
      0.08,
    ),
  },
  noOptionsMessage: {
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  singleValue: {
    fontSize: 16,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  divider: {
    height: theme.spacing.unit * 2,
  },
});

function NoOptionsMessage(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function inputComponent({inputRef, ...props}) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.placeholder}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function MultiValue(props) {
  return (
    <Chip
      tabIndex={-1}
      label={props.children}
      className={classNames(props.selectProps.classes.chip, {
        [props.selectProps.classes.chipFocused]: props.isFocused,
      })}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

class SetIdDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedAtt: props.selectedAtt,
      selectedCat: props.selectedCat
    };
    const {attOptions, catOptions} = props;
    this.attOptions = attOptions.map(att => {
      return {label: att[1], value: att[0]};
    });
    this.catOptions = catOptions.map(cat => {
      return {label: cat[1], value: cat[0]};
    });
  }

  handleChange = name => (selectedOption) => {
    console.log(`${name} selected:`, selectedOption);
    this.setState({[name]: selectedOption})
  };

  handelSet = () => {
    this.props.handleSetId(this.state.selectedAtt, this.state.selectedCat);
  };

  render() {
    const {classes, theme} = this.props;
    const selectStyles = {
      input: base => ({
        ...base,
        color: theme.palette.text.primary,
        '& input': {
          font: 'inherit',
        },
      }),
    };
    const open = Boolean(this.props.anchorEl);

    return (
      <Popover
        id="simple-popper"
        open={open}
        anchorEl={this.props.anchorEl}
        onClose={this.props.handleClose}
        classes={{paper: classes.popover}}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        {/*<DialogTitle id="form-dialog-title">Set ID</DialogTitle>*/}
        <DialogContent className={classes.dialogContent}>
          <NoSsr>
            <Select
              value={this.state.selectedAtt}
              onChange={this.handleChange('selectedAtt')}
              options={this.attOptions}
              classes={classes}
              styles={selectStyles}
              components={components}
              textFieldProps={{
                label: 'Attribute',
                InputLabelProps: {
                  shrink: true,
                },
              }}
              isClearable
              placeholder={"Attribute"}
            />
            <br/>
            <Select
              value={this.state.selectedCat}
              onChange={this.handleChange('selectedCat')}
              options={this.catOptions}
              classes={classes}
              styles={selectStyles}
              components={components}
              textFieldProps={{
                label: 'Category',
                InputLabelProps: {
                  shrink: true,
                },
              }}
              isClearable
              placeholder={"Category"}
            />
          </NoSsr>

        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handelSet} color="primary">
            Set
          </Button>
        </DialogActions>
      </Popover>
    )
  }
}

SetIdDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(SetIdDialog);
