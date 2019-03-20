import React, {Component} from 'react';
import MaterialTable from 'material-table'
import UserManager from "../../controller/userManager";
import OutlinedButton from "../../views/Buttons/OutlinedButton";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {Button} from "@material-ui/core";
const log = console.log;

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },

});

class RegistrationRequests extends Component {

  constructor(props) {
    super(props);
    this.user = new UserManager(props);  // new object
    this.state = {
      userList: [{username: '', firstName: "", lastName: "", email: '',
        organization: "", password:"", phoneNumber:"", role:"", permissions:""}]
    };

    // this.user.getAllUsers()
    //   .then(users => {
    //     this.setState({userList: users})});q

    this.user.getAllRegRequest()
      .then(request => {
        log(request);
        this.setState({userList: request})
      })
  }

  handleApprove = username => event => {
    event.preventDefault();
    log("click on approve");
    this.user.decideRequest(username, "approve", this.state.role);
  };

  handleDecline = username => event => {
    event.preventDefault();
    log("click on decline");
    this.user.decideRequest(username, "disapprove", this.state.role);
  };

  render() {
    const userList = this.state.userList;

    return (
      <div className="animated fadeIn">
        <div style={{maxWidth: '100%'}}>
          <MaterialTable
            columns={[
              {title: 'username', field: 'username'},
              {title: 'First Name', field: 'firstName'},
              {title: 'Last Name', field: 'lastName'},
              {title: 'Organization', field: 'organization'},
              {title:"Role", field:"role"},
              {title:"Group Number", field:"groupNumber"},
              {title: 'email', field: 'email'},
              {title:"Phone Number", field:"phoneNumber"},
              {title: 'Request', field: 'request',
              render: rowData => {
                return (
                  <div>
                    <Button size="small" variant="outlined" color="primary" onClick={this.handleApprove(rowData.username)}>
                      Approve
                    </Button>

                    <Button size="small" variant="outlined" color="secondary" onClick={this.handleDecline(rowData.username)}>
                      Decline
                    </Button>
                  </div>
                )
              },
              }
            ]}

            data={userList}
            title="Registration Request"
          />
        </div>
      </div>
    )
  }
}

export default RegistrationRequests;
