import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Badge} from 'reactstrap';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';
import ListItemText from '@material-ui/core/ListItemText';
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
      .then(users => {
        this.setState({userList: users});
        // this.forceUpdate();
        console.log(this.state.userList)
      });
  }

  handleChange = (event) => {
    let userList = this.state.userList;
    for (let i = 0; i < userList.length; i++){
      if(userList[i].user === userName){

      }
    }
    this.setState({value:event.target.value})
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
              },
              {title: 'email', field: 'email'},
              {
                title: 'Register Time', field: 'timestamp', type: 'date',
                render: rowData => {
                  return new Date(rowData.createDate).toLocaleString()
                }
              },
               {title: 'permissions', field: 'permissions',
              render: rowData => {
                return (<FormControl>
                  <InputLabel htmlFor="select-multiple-checkbox"> </InputLabel>
                  <Select
                    value={this.state.name}
                    onChange={this.handleChange}
                    input={<Input id="select-multiple-checkbox" />}
                    renderValue={selected => selected.join(', ')}
                    // MenuProps={MenuProps}
                  >
                    {rowData.permissions.map(name => (
                      <MenuItem key={name} value={name}>
                        <Checkbox checked={rowData.permissions.indexOf(name) > -1} />
                        <ListItemText primary={name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>)
              }
              },
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
