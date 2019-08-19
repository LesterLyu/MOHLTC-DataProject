import React, {Component, Suspense} from 'react';
import {Badge} from 'reactstrap';
import {
  getAllUsers,
  getAllPermissions,
  updatePermission,
  switchUserValidate,
  switchUserActive
} from "../../controller/userManager";
import {FormControl, InputLabel, Select, Input, Checkbox, MenuItem, ListItemText} from "@material-ui/core";
import {buildErrorParams} from "../../controller/common";

const MaterialTable = React.lazy(() => import('material-table' /* webpackChunkName: "material-table" */));

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

    getAllPermissions()
      .then(permissions => {
        this.permissions = permissions;
        //log("get all permissions")
      });

    getAllUsers()
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
    updatePermission(username, userToUpdate.permissions, userToUpdate.active)
      .then(response => {
        this.props.showMessage(response.data.message, response.data.success ? 'success' : 'error');
      })
      .catch(err => {
        this.props.showMessage(err.response.data.message, 'error');
      })
  };


  //FIXME: delete this function when developing
  clickActiveButton = async (username, active) => {
    try {
      switchUserActive(username, !active)
        .then((res) => {
          getAllUsers()
            .then(users => {
              this.setState({userList: users});
              this.props.showMessage(username + '\'s active is changed.', 'success');
            })
            .catch(err => {
              this.props.showMessage(err.response.data.message, 'error');
            })
        });
    } catch (e) {
      this.props.showMessage(e.response.data.message, 'error');
    }
  };

  //FIXME: delete this function when developing
  clickValidatedButton = async (username, validated) => {
    switchUserValidate(username, !validated)
      .then((res) => {
        return getAllUsers()
          .then(users => {
            this.setState({userList: users});
            this.props.showMessage(username + '\'s validated is changed.', 'success');
          })
      })
      .catch(e => this.props.showMessage(...buildErrorParams(e)))
  };


  render() {

    const userList = this.state.userList;

    return (
      <div className="animated fadeIn">
        <div style={{maxWidth: '100%'}}>
          <Suspense fallback={<div>Loading...</div>}>
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
                  // title: 'status', field: 'disabled',
                  title: 'active', field: 'active',
                  render: rowData => {
                    return (<Badge
                      // color={rowData.validated === true ? 'success' : 'danger'}>{rowData.disabled ? 'disabled' : 'enabled'}</Badge>)
                      onClick={() => this.clickActiveButton(rowData.username, rowData.active)}
                      color={rowData.active === true ? 'success' : 'danger'}>{rowData.active ? 'active' : 'inactive'}</Badge>)
                  }
                },
                {
                  // title: 'status', field: 'disabled',
                  title: 'validated', field: 'validated',
                  render: rowData => {
                    return (<Badge
                      // color={rowData.validated === true ? 'success' : 'danger'}>{rowData.disabled ? 'disabled' : 'enabled'}</Badge>)
                      onClick={() => this.clickValidatedButton(rowData.username, rowData.validated)}
                      color={rowData.validated === true ? 'success' : 'danger'}>{rowData.validated ? 'validated' : 'Invalidated'}</Badge>)
                  }
                }
              ]}
              data={userList}
              title="All Accounts"
            />
          </Suspense>
        </div>
      </div>
    )
  }
}

export default Users;
