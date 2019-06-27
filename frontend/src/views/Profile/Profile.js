import React, {Component} from 'react';
import UserManager from "../../controller/userManager";
import {Fade, Chip, Typography, Card} from "@material-ui/core";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/es";

import {Clear as No, Done as Yes} from "@material-ui/icons";
// eslint-disable-next-line
import workerpool from 'workerpool';

const pool = workerpool.pool();

function add(a, b) {
  for(let i = 0; i < 3999999999; i++){} // 5 seconds
  return a + b;
}

const styles = theme => ({
  root: {
    padding: 20,
  },
  chip: {
    margin: 3,
    shadow: ''
  },
  title: {
    color: '#383838'
  },
  subTitle: {
    color: '#a4a4a4'
  },
  content: {
    fontFamily: 'Roboto',
    lineHeight: 2,
    color: '#444444'
  }
});

class Profile extends Component {
  constructor(props) {
    super(props);
    this.user = new UserManager(props);
    this.state = {
      profile: {
        username: '',
        email: '',
        firstName: '',
        lastName: 'Loading...',
        phoneNumber: '',
        active: '',
        permissions: [],
        groupNumber: '',
        validated: '',
        createDate: '',
      }
    };

    this.user.getProfile()
      .then(profile => {
        this.setState({profile});
      });


    pool.exec(add, [3, 4])
      .then(function (result) {
        console.log('result', result); // outputs 7
      })
      .catch(function (err) {
        console.error(err);
      })
      .then(function () {
        // pool.terminate(); // terminate all workers when done
      });
  }

  permissions() {
    const permissions = [];
    this.state.profile.permissions.forEach((permission, idx) => {
      permissions.push(
        <Chip key={idx} color={"primary"} label={permission} variant="outlined" className={this.props.classes.chip}/>
        )
    });
    return permissions;
  }

  yesOrNoIcon(bool) {
    return bool ? <Yes fontSize="small" style={{color: 'green'}}/>
        : <No fontSize="small" style={{color: 'red'}}/>
  }

  render() {
    const {classes} = this.props;
    const {profile} = this.state;

    return (
     <Fade in={true} timeout={500}>
       <Card className={classes.root}>
         <Typography variant="h5" gutterBottom>
           {profile.lastName + ', ' + profile.firstName}
         </Typography>
         <hr/>
         <Typography variant="button" gutterBottom className={classes.subTitle}>
           Basic Information
         </Typography>
         <div className={classes.content}>
           Username: {profile.username} <br/>
           Email: {profile.email} <br/>
           Phone: {profile.phoneNumber} <br/>
         </div>
         <hr/>
         <Typography variant="button" gutterBottom className={classes.subTitle}>
           Account Information
         </Typography>
         <div className={classes.content}>
           Registration Date: {new Date(profile.createDate).toLocaleString()} <br/>
           Group Number: {profile.groupNumber} <br/>
           Validated: {this.yesOrNoIcon(profile.validated)}<br/>
           Active: {this.yesOrNoIcon(profile.active)}<br/>
           Permissions: {this.permissions()} <br/>
         </div>
       </Card>
     </Fade>
    )
  }
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Profile);
