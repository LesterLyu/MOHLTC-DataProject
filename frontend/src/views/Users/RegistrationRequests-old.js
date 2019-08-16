import React, {Component} from 'react';
import {Badge} from "reactstrap";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import {checkEmail, getAllGroups} from "../../controller/userManager";

import {getAllRequestUsers, switcheUserValidate} from "../../controller/userManager.js";

const MaterialTable = React.lazy(() => import('material-table' /* webpackChunkName: "material-table" */));

class RegistrationRequests extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userList: [{
        username: 'lester1',
        email: '123123',
        groupNumber: '',
        organization: '',
        validated: false,
      }]
    };

    this.initialRequestUsers();
  }

  initialRequestUsers = () => {
    getAllRequestUsers().then((dbUsers) => {
      this.setState({
        userList: dbUsers
      });
      console.log('inside initial request users');
      console.table(dbUsers);
    })
  };

  clickApproveButton = (username) => {
    console.log('inside onclick approve button');
    switcheUserValidate(null)
      .then(() => {
        this.initialRequestUsers();
      });
  };

  render() {

    const userList = this.state.userList;

    return (
      <div className="animated fadeIn">
        <div style={{maxWidth: '100%'}}>
          <MaterialTable
            columns={[
              {title: 'username', field: 'username'},
              {title: 'email', field: 'email'},
              {title: "Group Number", field: "Group"},
              {title: 'Organization', field: 'Organization'},
              {
                title: 'validated', field: 'validated',
                render: rowData => {
                  return (<Badge
                    color={rowData.validated === true ? 'success' : 'danger'}>{rowData.validated ? 'validated' : 'invalidated'}</Badge>)
                }
              },
              {
                title: 'Execute',
                render: rowData => {
                  return (<Button
                    color="primary"
                    variant="outlined"
                    onClick={this.clickApproveButton(rowData.username)}
                    block
                  >{rowData.validated ? 'Disapprove' : 'Approve'}</Button>)
                }
              },
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
