import PropTypes from 'prop-types';
import React from 'react';
import {Input, InputLabel, FormControl, FormHelperText, MenuItem, Select} from '@material-ui/core'

const SelectFieldBase = (props) => {
  const {
    autoComplete,
    autoFocus,
    children,
    className,
    defaultValue,
    disabled,
    error,
    id,
    inputClassName,
    InputClassName,
    inputProps: inputPropsProp,
    InputProps,
    inputRef,
    label,
    labelClassName,
    InputLabelProps,
    helperText,
    helperTextClassName,
    FormHelperTextProps,
    fullWidth,
    required,
    type,
    multiline,
    multiple,
    name,
    placeholder,
    rootRef,
    rows,
    rowsMax,
    value,
    onChange,
    ...other
  } = props;

  let inputProps = inputPropsProp;

  if (inputClassName) {
    inputProps = {
      className: inputClassName,
      ...inputProps,
    };
  }

  return (
    <FormControl
      fullWidth={fullWidth}
      ref={rootRef}
      className={className}
      error={error}
      required={required}
      {...other}
    >
      {label && (
        <InputLabel htmlFor={id} className={labelClassName} {...InputLabelProps}>
          {label}
        </InputLabel>
      )}
      <Select
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        className={InputClassName}
        defaultValue={defaultValue}
        disabled={disabled}
        multiline={multiline}
        multiple={multiple}
        name={name}
        rows={rows}
        rowsMax={rowsMax}
        type={type}
        value={value}
        id={id}
        inputProps={inputProps}
        inputRef={inputRef}
        placeholder={placeholder}
        onChange={onChange}
        input={<Input id={id}/>}
        {...InputProps}
      >
        {children}
      </Select>
      {helperText && (
        <FormHelperText className={helperTextClassName} {...FormHelperTextProps}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

const SelectField = ({options, ...props}) => (
  <SelectFieldBase {...props}>
    {options.map(option => (
      <MenuItem key={option.label} value={option.value}>
        {option.label + ''}
      </MenuItem>
    ))}
  </SelectFieldBase>
);

SelectField.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.node.isRequired,
    label: PropTypes.string,
  })).isRequired,
};

export default SelectField;
