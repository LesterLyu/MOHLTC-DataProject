import React from "react";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";

class CustomToolbar extends React.Component {

  render() {
    const {addClick} = this.props;
    return (
      <React.Fragment>
        <Tooltip title={"Add"}>
          <IconButton onClick={addClick}>
            <AddIcon/>
          </IconButton>
        </Tooltip>
      </React.Fragment>
    );
  }
}

export default CustomToolbar;
