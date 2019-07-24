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

function renderItems(items, anchorEl) {
  return Object.keys(items).map(key => {
    if (items[key]) return <StyledMenuItem onContextMenu={e => e.preventDefault()} key={key}
                                           onClick={() => items[key](anchorEl)}>{key}</StyledMenuItem>;
    else return <Divider key={key}/>
  });
}

export default function RightClickMenu(props) {
  const {handleClose, anchorEl, items} = props;

  const menuItems = useMemo(() => renderItems(items, anchorEl), [items, anchorEl]);

  return (
    <StyledMenu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={handleClose}
      transitionDuration={0}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      onContextMenu={e => e.preventDefault()}
      onMouseDown={e => {
        if (e.button === 2) handleClose()
      }}
      container={anchorEl ? anchorEl.parent : null}
    >
      {menuItems}
    </StyledMenu>
  );
}
