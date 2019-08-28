import React, {useEffect, useCallback} from "react";
import {InputLabel, Select, Input, Chip, MenuItem, InputBase} from "@material-ui/core";
import {makeStyles, useTheme} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import {FixedSizeList} from 'react-window';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: 8,
    paddingBottom: 8,
    width: '100%',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 2,
  },
  select: {
    whiteSpace: 'initial',
    minWidth: 200,
    minHeight: 36,
  },
  search: {
    padding: theme.spacing(1),
    width: '80%'
  },
  searchIcon: {
    marginLeft: 16,
    marginRight: 4,
    fill: '#787878'
  }
}));

const MenuProps = {
  getContentAnchorEl: null,
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  PaperProps: {
    style: {
      maxHeight: null,
      minWidth: null,
    },
  },
};

function getStyles(name, selected, theme) {
  const isSelected = selected.indexOf(name) !== -1;
  return {
    fontWeight:
      isSelected ? theme.typography.fontWeightMedium : theme.typography.fontWeightRegular,
    background: isSelected ? '#ccc' : '',
  };
}

export default function Dropdown(props) {
  // options is [[value, label], ...]
  const {options, title, defaultValues, onChange} = props;
  const [values, setValues] = React.useState({
    selected: defaultValues ? defaultValues : [],
    filteredOptions: options ? [...options] : [],
    searchValue: '',
  });
  const classes = useStyles();
  const theme = useTheme();

  const handleChange = useCallback((name, value) => {
    setValues(values => ({...values, [name]: value}));
    if (name === 'selected' && onChange)
      onChange(value);
  }, [onChange]);

  useEffect(() => {
    if (options) setValues(values => ({...values, filteredOptions: [...options]}));
    if (defaultValues)  setValues(values => ({...values, selected: defaultValues}));
  }, [options, defaultValues]);

  const handleItemClick = (value) => () => {
    const index = values.selected.indexOf(value);
    if (index === -1)
      handleChange('selected', [...values.selected, value]);
    else
      handleDelete(value)();
  };

  const handleDelete = useCallback(removeValue => () => {
    handleChange('selected', values.selected.filter(value => value !== removeValue));
  }, [handleChange, values.selected]);

  const handleSearch = useCallback(event => {
    handleChange('searchValue', event.target.value);
    let value = event.target.value || '';
    value = value.toLowerCase();
    const result = [];
    for (let i = 0, l = options.length; i < l; i++) {
      const option = options[i];
      // search engine here
      if (option[1].toLowerCase().includes(value))
        result.push(option);
    }
    handleChange('filteredOptions', result);
  }, [handleChange, options]);

  const renderValue = useCallback((selected) => {
    const values = [];
    options.forEach(([value, label]) => {
      if (selected.indexOf(value) !== -1)
        values.push(
          <Chip key={value} label={label} className={classes.chip} onDelete={handleDelete(value)}/>)
    });
    return values;
  }, [classes.chip, handleDelete, options]);

  function Row(props) {
    const {index, style} = props;
    const [value, label] = values.filteredOptions[index];
    return (
      <MenuItem value={value} onClick={handleItemClick(value)}
                style={Object.assign({}, style, getStyles(value, values.selected, theme))}>
        {label}
      </MenuItem>
    );
  }

  const renderMenu = () => {
    return (
      <div>
        <SearchIcon className={classes.searchIcon}/>
        <InputBase
          className={classes.search}
          placeholder="Search"
          value={values.searchValue}
          onChange={handleSearch}
        />
        <FixedSizeList height={400} width={360} itemSize={48} itemCount={values.filteredOptions.length}>
          {Row}
        </FixedSizeList>
      </div>
    )
  };

  return (
    <div className={classes.root}>
      <InputLabel htmlFor="select-multiple-chip">{title}</InputLabel>
      <Select
        multiple
        value={values.selected}
        input={<Input id="select-multiple-chip"/>}
        renderValue={renderValue}
        MenuProps={MenuProps}
        classes={{select: classes.select}}
      >
        {renderMenu()}
      </Select>
    </div>
  )
}
