import React from "react";
import {Delete as DeleteIcon, EditAttributes as AssignIcon} from "@material-ui/icons";
import {withStyles, IconButton, Tooltip} from "@material-ui/core";

const defaultToolbarSelectStyles = {
  iconButton: {
    top: "50%",
    display: "inline-block",
    position: "relative",
  },
  toolbar: {
    marginRight: 24,
  }
};

class CustomToolbarSelect extends React.Component {

  render() {
    const {onRowsDelete, openAssignDialog, classes, selectedRows} = this.props;
    return (
      <>
        <div className={"custom-toolbar-select " + classes.toolbar}>
          <Tooltip title={"Assign Group"}>
            <IconButton className={classes.iconButton} onClick={() => openAssignDialog(selectedRows)}>
              <AssignIcon/>
            </IconButton>
          </Tooltip>
          <Tooltip title={"Delete"}>
            <IconButton className={classes.iconButton} onClick={() => onRowsDelete(selectedRows)}>
              <DeleteIcon/>
            </IconButton>
          </Tooltip>
        </div>
      </>
    );
  }
}

export default withStyles(defaultToolbarSelectStyles, {
  name: "CustomToolbarSelect"
})(CustomToolbarSelect);
