import React from "react";
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
  },
  search: {
    padding: theme.spacing(1),
  },
  searchIcon: {
    marginLeft: 16,
    marginRight: 4,
    fill: '#787878'
  }
}));

const MenuProps = {
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
    filteredOptions: [...options],
  });
  const classes = useStyles();
  const theme = useTheme();

  const handleChange = name => value => {
    setValues({...values, [name]: value});
    if (name === 'selected' && onChange)
      onChange(value);
  };

  const handleChangeMultiple = (event) => {
    handleChange('selected')(event.target.value);
  };

  const handleItemClick = (value) => () => {
    const index = values.selected.indexOf(value);
    if (index === -1)
      handleChange('selected')([...values.selected, value]);
    else
      handleDelete(value)();
  };

  const handleDelete = removeValue => () => {
    handleChange('selected')(values.selected.filter(value => value !== removeValue));
  };

  const handleSearch = event => {
    let value = event.target.value || '';
    value = value.toLowerCase();
    const result = [];
    for (let i = 0, l = options.length; i < l; i++) {
      const option = options[i];
      // search engine here
      if (option[1].toLowerCase().includes(value))
        result.push(option);
    }
    handleChange('filteredOptions')(result);
  };

  const renderValue = (selected) => {
    const values = [];
    options.forEach(([value, label], i) => {
      if (selected.indexOf(value) !== -1)
        values.push(
          <Chip key={value} label={label} className={classes.chip} onDelete={handleDelete(value)}/>)
    });
    return values;
  };

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
    return ([
        <SearchIcon key="1" className={classes.searchIcon}/>,
        <InputBase
          key="2"
          className={classes.search}
          placeholder="Search"
          onChange={handleSearch}
        />,
        <FixedSizeList key="3" height={400} width={360} itemSize={48} itemCount={values.filteredOptions.length}>
          {Row}
        </FixedSizeList>
      ]
    )
  };

  return (
    <div className={classes.root}>
      <InputLabel htmlFor="select-multiple-chip">{title}</InputLabel>
      <Select
        multiple
        value={values.selected}
        onChange={handleChangeMultiple}
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
