import React, {PureComponent} from "react";
import Popover from "@material-ui/core/Popover";

export default class CellEditor extends PureComponent {
  render() {
    const {cell, anchorEl} = this.props;


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
        transitionDuration={0}>

      </Popover>
    )
  }
}
