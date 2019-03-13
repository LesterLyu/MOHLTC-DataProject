import React, {Component} from 'react';
import {Badge} from 'reactstrap';
import MaterialTable from 'material-table'
import UserManager from "../../controller/userManager";
import {FormControl, InputLabel, Select, Input, Checkbox, MenuItem, ListItemText} from "@material-ui/core";

const log = console.log;

function PermissionSelect(props) {
  const {permissions, selected, handleChange, username} = props;

  return (
    <FormControl>
      <InputLabel htmlFor="select-multiple-checkbox"> </InputLabel>
      <Select
        multiple
        value={selected}
        onChange={handleChange(username)}
        input={<Input id="select-multiple-checkbox"/>}
        renderValue={selected => `${selected.length} item${selected.length < 2 ? '' : 's'} selected`}
      >
        {permissions.map(name => (
          <MenuItem key={name} value={name}>
            <Checkbox checked={selected.indexOf(name) > -1}/>
            <ListItemText primary={name}/>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

class Users extends Component {
  constructor(props) {
    super(props);
    this.user = new UserManager(props);
    window.users = this;
    /*
     active: true
     createDate: "2018-11-29T17:20:09.241Z"
     email: "email@mail.com"
     firstName: "firstname"
     groupNumber: 1
     lastName: "lastName"
     permissions: ["CRUD-workbook-template", "create-delete-attribute-category", "user-management"]
     phoneNumber: "1212122"
     username: "test"
     validated: true
     */
    this.state = {
      userList: []
    };

    this.user.getAllPermissions()
      .then(permissions => {
        this.permissions = permissions;
        //log("get all permissions")
      });

    this.user.getAllUsers()
      .then(users => {
        this.setState({userList: users});
        console.log(this.state.userList)
      })
      .catch(err => {
        this.props.showMessage(err.response.data.message, 'error');
      })
  }

  onPermissionChange = username => (event) => {
    // this.setState({userList: })
    //console.log(username);
    const userList = this.state.userList;
    let userToUpdate;
    for (let i = 0; i < userList.length; i++) {
      if (userList[i].username === username) {
        userList[i].permissions = event.target.value;
        userToUpdate = userList[i];
      }
    }
    this.setState({userList});
    this.user.updatePermission(username, userToUpdate.permissions, userToUpdate.active)
      .then(response => {
        this.props.showMessage(response.data.message, response.data.success ? 'success' : 'error');
      })
      .catch(err => {
        this.props.showMessage(err.response.data.message, 'error');
      })
  };

  render() {

    const userList = this.state.userList;

    return (
      <div className="animated fadeIn">
        <div style={{maxWidth: '100%'}}>
          <MaterialTable
            columns={[
              {
                title: 'username', field: 'username',
                // render: rowData => {
                //   const userLink = `/users/${rowData.uid}`;
                //   return (<Link to={userLink}>{rowData.username}</Link>)
                // }
              },
              {title: 'email', field: 'email'},
              {
                title: 'Register Time', field: 'createDate', type: 'date',
                render: rowData => {
                  return new Date(rowData.createDate).toLocaleString()
                }
              },
              {
                title: 'permissions', field: 'permissions',
                render: rowData => {
                  return (
                    <PermissionSelect
                      username={rowData.username}
                      selected={rowData.permissions}
                      handleChange={this.onPermissionChange}
                      permissions={this.permissions}
                    />
                  )
                }
              },
              {
                title: 'status', field: 'disabled',
                render: rowData => {
                  return (<Badge
                    color={rowData.validated === true ? 'success' : 'danger'}>{rowData.disabled ? 'disabled' : 'enabled'}</Badge>)
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
