import React, {useMemo} from 'react';
import {Menu, MenuItem, Divider, withStyles} from '@material-ui/core';

const StyledMenuItem = withStyles(theme => ({
  root: {
    minWidth: 140,
    fontSize: 13,
    minHeight: 'initial',
    whiteSpace: 'pre'
  },
}))(MenuItem);

const StyledMenu = withStyles(theme => ({
  list: {
    padding: 'initial'
  },
}))(Menu);

function renderItems(items, config) {
  return Object.keys(items).map(key => {
    if (items[key])
      return (
        <StyledMenuItem
          key={key}
          onClick={() => items[key](config.anchorEl)}
          onMouseDown={e => {
            if (e.button === 2) items[key](config.anchorEl);
          }}
        >
          {key}
        </StyledMenuItem>
      );
    else
      return <Divider key={key}/>
  });
}

export default function RightClickMenu(props) {
  const {handleClose, items, config} = props;

  const menuItems = useMemo(() => renderItems(items, config), [items, config]);

  const open = Boolean(config);

  if (open) {
    return (
      <StyledMenu
        // anchorEl={anchorEl}
        anchorReference="anchorPosition"
        anchorPosition={config}
        open={open}
        onClose={handleClose}
        transitionDuration={200}
        // getContentAnchorEl={null}

        onContextMenu={e => {
          e.preventDefault()
        }}
        onMouseDown={e => {
          if (e.button === 2 || e.button === 1) handleClose();
        }}
      >
        {menuItems}
      </StyledMenu>
    );
  }
  return null;
}
