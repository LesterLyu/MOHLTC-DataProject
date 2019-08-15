import {MuiThemeProvider, createMuiTheme, makeStyles, Typography} from "@material-ui/core";
import React, {useEffect, useState, useMemo} from "react";
import {getOrganizations, updateOrganization, deleteOrganization, getOrganizationTypes} from '../../controller/system';
import {buildErrorParams} from '../../controller/common';
import MUIDataTable from "mui-datatables";
import CustomToolbar from "../AttCat/components/CustomToolbar";
import OrgAddDialog from './components/OrgAddDialog';
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


const useStyles = makeStyles(theme => ({
  name: {
    color: theme.palette.primary.dark,
    fontWeight: 500,
    '&:hover': {
      textDecoration: 'underline',
      cursor: 'pointer',
      color: theme.palette.primary.A200,
    }
  },
}));


export default function Organizations(props) {
  const [organizations, setOrganizations] = useState([]);
  const [types, setTypes] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [dialogData, setDialogData] = useState({name: '', users: [], managers: [], types: [], edit: false});
  const [users, setUsers] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    getOrganizations().then(organizations => {
      setOrganizations(organizations)
    });
    getOrganizationTypes().then(types => setTypes(types.map(type => [type._id, type.name])));
    getAllUsers()
      .then(data => {
        const users = [];
        data.forEach(user => users.push([user._id, `${user.username} (${user.firstName}, ${user.lastName})`]));
        setUsers(users);
      });
  }, []);

  const closeDialog = () => setDialog(false);
  const openDialog = () => {
    setDialogData({name: '', users: [], managers: [], types: [], edit: false});
    setDialog(true);
  };
  const openEditDialog = (name, tableMeta) => () => {
    let [name, users, managers, types] = tableMeta.rowData;
    users = users.map(user => user._id);
    managers = managers.map(manager => manager._id);
    types = types.map(type => type._id);
    setDialogData({name, users, managers, types, edit: true});
    setDialog(true);
  };
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
      options: {
        customBodyRender: (name, tableMeta, updateValue) => {
          return <Typography className={classes.name} onClick={openEditDialog(name, tableMeta)}>{name}</Typography>
        }
      }
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
      label: 'Organization Types',
      options: {
        customBodyRender: (types, tableMeta, updateValue) => {
          const names = [];
          if (Array.isArray(types)) types.forEach(type => names.push(type.name));
          return names.join(', ');
        },
      }
    }], [classes]);

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
      <OrgAddDialog
        open={dialog}
        values={dialogData}
        onChange={onChangeDialog}
        onClose={closeDialog}
        onAdd={handleAdd}
        users={users}
        types={types}
      />
    </>
  )
}
