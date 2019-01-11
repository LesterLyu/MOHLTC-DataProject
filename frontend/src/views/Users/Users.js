import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Badge} from 'reactstrap';
import MaterialTable from 'material-table'
import UserManager from "../../controller/userManager";

class Users extends Component {

  constructor(props) {
    super(props);
    this.user = new UserManager(props);
    this.state = {
      userList: []
    };

    this.user.getAllUsers()
      // .then(users => {
      //   this.setState({userList: users});
      //   this.forceUpdate();
      //   console.log(this.state.userList)
      // });
  }

  render() {

    const userList = this.state.userList;

    return (
      <div className="animated fadeIn">
        <div style={{maxWidth: '100%'}}>
          <MaterialTable
            columns={[
              {
                title: 'username', field: 'username',
                render: rowData => {
                  const userLink = `/users/${rowData.uid}`;
                  return (<Link to={userLink}>{rowData.username}</Link>)
                }
              },
              {title: 'email', field: 'email'},
              {
                title: 'Register Time', field: 'timestamp', type: 'date',
                render: rowData => {
                  return new Date(rowData.timestamp).toLocaleString()
                }
              },
              {title: 'permissions', field: 'permissions'},
              {
                title: 'status', field: 'disabled',
                render: rowData => {
                  return (<Badge
                    color={rowData.disabled === false ? 'success' : 'danger'}>{rowData.disabled ? 'disabled' : 'enabled'}</Badge>)
                }
              }
            ]}
            data={userList}
            title="All Accounts"
          />
        </div>
      </div>
    )
  }
}

export default Users;
