import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";
import {withStyles} from "@material-ui/core/styles";

const defaultToolbarStyles = {
  iconButton: {},
};

class CustomToolbar extends React.Component {

  handleClick = () => {
    console.log("clicked on icon!");
  }

  render() {
    const {classes, addClick} = this.props;

    return (
      <React.Fragment>
        <Tooltip title={"Add"}>
          <IconButton className={classes.iconButton} onClick={addClick}>
            <AddIcon/>
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }

}

export default withStyles(defaultToolbarStyles, {name: "CustomToolbar"})(CustomToolbar);
