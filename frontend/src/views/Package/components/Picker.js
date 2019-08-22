import {InputBase, makeStyles, MenuItem, Popover, Typography} from "@material-ui/core";
import React, {useState, useEffect} from "react";
import {Magnify as SearchIcon} from "mdi-material-ui";
import {FixedSizeList} from "react-window";
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
  root: {
    paddingTop: 8,
    paddingBottom: 8,
    width: '100%',
  },
  search: {
    padding: theme.spacing(1),
    width: '80%'
  },
  searchIcon: {
    marginLeft: 16,
    marginRight: 4,
    fill: '#787878'
  },
  title: {
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    color: '#767676'
  }
}));

export default function Picker(props) {
  // options is [[value, label], ...]
  const {options, title, onSelect, onClose, anchorEl} = props;
  const [filteredOptions, setFilteredOptions] = useState(options ? [...options] : []);
  const classes = useStyles();

  useEffect(() => {
    setFilteredOptions(options);
  }, [options]);

  const handleSearch = event => {
    const value = (event.target.value || '').toLowerCase();
    const result = [];
    for (let i = 0, l = options.length; i < l; i++) {
      const option = options[i];
      // search engine here
      if (option.toLowerCase().includes(value))
        result.push(option);
    }
    setFilteredOptions(result);
  };

  function Row(props) {
    const {index, style} = props;
    const value = filteredOptions[index];
    return (
      <MenuItem value={value} onClick={() => onSelect(value)}
                style={style}>
        {value}
      </MenuItem>
    );
  }

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}>
      <div className={classes.root}>
        <Typography variant="h6" className={classes.title}>{title}</Typography>
        <SearchIcon className={classes.searchIcon}/>
        <InputBase
          className={classes.search}
          placeholder="Search"
          onChange={handleSearch}
        />
        <FixedSizeList height={400} width={360} itemSize={48} itemCount={filteredOptions.length}>
          {Row}
        </FixedSizeList>
      </div>
    </Popover>
  )
}

Picker.propTypes = {
  options: PropTypes.array,
  title: PropTypes.string,
  onSelect: PropTypes.func,
  onClose: PropTypes.func,
};
