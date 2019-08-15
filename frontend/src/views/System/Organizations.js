import {
  MuiThemeProvider,
  createMuiTheme
} from "@material-ui/core";
import React, {useEffect, useState, useMemo} from "react";
import {getOrganizations, updateOrganization, deleteOrganization} from '../../controller/system';
import {buildErrorParams} from '../../controller/common';
import MUIDataTable from "mui-datatables";
import CustomToolbar from "../AttCat/components/CustomToolbar";
import AddDialog from './components/AddDialog';
import {getAllUsers} from "../../controller/userManager";

const getMuiTheme = () => createMuiTheme({
  overrides: {
    MUIDataTable: {
      responsiveScroll: {
        maxHeight: 'calc(100vh - 270px)'
      }
    }
  }
});

export default function Organizations(props) {
  const [organizations, setOrganizations] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [dialogData, setDialogData] = useState({name: '', users: [], managers: [], types: []});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getOrganizations().then(organizations => {
      setOrganizations(organizations)
    });
    getAllUsers()
      .then(data => {
        const users = [];
        data.forEach(user => users.push([user._id, `${user.username} (${user.firstName}, ${user.lastName})`]));
        setUsers(users);
      });
  }, []);

  const closeDialog = () => setDialog(false);
  const openDialog = () => setDialog(true);
  const onChangeDialog = name => e => {
    if (name === 'name') {
      setDialogData({...dialogData, name: e.target.value});
    } else if (name === 'managers') {
      const managers = [];
      for (const manager of e) {
        if (dialogData.users.includes(manager)) managers.push(manager);
      }
      setDialogData({...dialogData, managers});
    } else if (name === 'users') {
      const managers = [];
      for (const manager of dialogData.managers) {
        if (e.includes(manager)) managers.push(manager);
      }
      setDialogData({...dialogData, managers, [name]: e});
    } else setDialogData({...dialogData, [name]: e});
  };
  const handleAdd = async () => {
    try {
      const data = await updateOrganization(dialogData);
      props.showMessage(data.message, 'success');
    } catch (e) {
      return props.showMessage(...buildErrorParams(e));
    }
    setDialog(false);
    getOrganizations().then(organizations => {
      setOrganizations(organizations)
    });
  };

  const columns = useMemo(() => [
    {
      name: 'name',
      label: 'Organizations',
    },
    {
      name: 'users',
      label: 'Users',
      options: {
        customBodyRender: (users, tableMeta, updateValue) => {
          const names = [];
          if (Array.isArray(users)) users.forEach(user => names.push(user.username));
          return names.join(', ');
        },
      }
    },
    {
      name: 'managers',
      label: 'Managers',
      options: {
        customBodyRender: (users, tableMeta, updateValue) => {
          const names = [];
          if (Array.isArray(users)) users.forEach(user => names.push(user.username));
          return names.join(', ');
        },
      }
    },
    {
      name: 'types',
      label: 'Types'
    }], []);

  const options = useMemo(() => ({
    print: false,
    filter: false,
    selectableRows: 'single',
    onRowsDelete: async rowsDeleted => {
      const index = Object.keys(rowsDeleted.lookup)[0];
      try {
        const data = await deleteOrganization(organizations[index].name);
        props.showMessage(data.message, 'success');
      } catch (e) {
        props.showMessage(...buildErrorParams(e));
      }
    },
    customToolbar: () => {
      return (
        <CustomToolbar addClick={openDialog}/>
      );
    },
  }), [organizations, props]);

  const renderTable = useMemo(() =>
    <MuiThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title="Organizations"
        data={organizations}
        columns={columns}
        options={options}
      />
    </MuiThemeProvider>, [organizations, columns, options]);

  return (
    <>
      {renderTable}
      <AddDialog
        title="Add Organization"
        open={dialog}
        values={dialogData}
        onChange={onChangeDialog}
        onClose={closeDialog}
        onAdd={handleAdd}
        users={users}
      />
    </>
  )
}
