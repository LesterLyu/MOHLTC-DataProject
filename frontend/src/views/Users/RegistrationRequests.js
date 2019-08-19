import React, {Component} from 'react';
import {Badge} from "reactstrap";
import Button from "@material-ui/core/Button";

import {getAllRequestUsers, switchUserValidate} from "../../controller/userManager.js";

import {buildErrorParams} from "../../controller/common";

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
      console.table(dbUsers);
    })
  };


  clickApproveButton = (user) => {
    console.log('inside clickApproveButton -----' + user);
    switchUserValidate(user, true)
      .then(() => {
        this.initialRequestUsers();
      })
      .catch(e => this.props.showMessage(...buildErrorParams(e)))
  };

  render() {
    const userList = this.state.userList;

    return (
      <div className="animated fadeIn">
        <div style={{maxWidth: '100%'}}>
          <MaterialTable
            data={userList}
            title="Registration Request"
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
                  return (<Button onClick={() => this.clickApproveButton(rowData)}>Approve</Button>)
                }
              },
            ]}
          />
        </div>
      </div>
    )
  }
}

export default RegistrationRequests;
