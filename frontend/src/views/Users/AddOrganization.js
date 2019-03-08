import React from "react";
import OutlinedText from "../../views/Base/OutlinedText";
import {Paper, Button} from "@material-ui/core";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/styles";
import classNames from "classnames";
import TextField from "../Base/OutlinedText";
const log = console.log;

const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
});

class addOrganization extends React.Component{
  constructor(props) {
    super(props);
    this.state = {text:""};
    this.handleChange = this.handleChange.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }

  render() {
    const { classes } = this.props;
    return (
      <Paper className={classes.root}>
        <h5>Create New Organization</h5>
        {/*needs to be styling...*/}
        <form className={classes.container} noValidate autoComplete="off">
        <input onChange={this.handleChange} type="text"
               id="outlined-dense"
               label="Organization Name"
               className={classNames(classes.textField, classes.dense)}
               margin="dense"
               variant="outlined"/> <br/><br/>
        <Button variant="outlined" color="primary" className={classes.button}
                onClick={this.handleMessage}>
          Submit
        </Button>
        </form>
        </Paper>
    )
  }

  handleMessage(e){
        e.preventDefault();
        log(this.state.text);
        const newContent = this.state.text;
        // if(newContent){
        //   this.props.showMessage("your input is empty","error");
        // }
    if(newContent){
        this.props.showMessage("added: " + newContent, 'success')
    }else if(!newContent){
      this.props.showMessage("your input is empty","error")
    }
  }

  handleChange(e){
        log(e.target.value);
        this.setState({text:e.target.value});
      }
}

addOrganization.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(addOrganization);
