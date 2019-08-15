import {MuiThemeProvider, createMuiTheme, makeStyles, Typography} from "@material-ui/core";
import React, {useEffect, useState, useMemo} from "react";
import {
  getOrganizations,
  updateOrganizationTypes,
  deleteOrganizationTypes,
  getOrganizationTypes
} from '../../controller/system';
import {buildErrorParams} from '../../controller/common';
import MUIDataTable from "mui-datatables";
import CustomToolbar from "../AttCat/components/CustomToolbar";
import OrgTypesAddDialog from './components/OrgTypesAddDialog';

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


export default function OrganizationTypes(props) {
  const [types, setTypes] = useState([]);
  const [dialog, setDialog] = useState(false);
  const [dialogData, setDialogData] = useState({name: '', organizations: []});
  const [organizations, setOrganizations] = useState([]);
  const classes = useStyles();

  useEffect(() => {
    getOrganizationTypes().then(types => setTypes(types));
    getOrganizations().then(organizations => {
      setOrganizations(organizations.map(org => [org._id, org.name]))
    });

  }, []);

  const closeDialog = () => setDialog(false);
  const openDialog = () => {
    setDialogData({name: '', organizations: [], edit: false});
    setDialog(true);
  };
  const openEditDialog = (name, tableMeta) => () => {
    let [name, organizations] = tableMeta.rowData;
    organizations = organizations.map(org => org._id);
    setDialogData({name, organizations, edit: true});
    setDialog(true);
  };
  const onChangeDialog = name => e => {
    if (name === 'name') {
      setDialogData({...dialogData, name: e.target.value});
    } else setDialogData({...dialogData, [name]: e});
  };
  const handleAdd = async () => {
    try {
      const data = await updateOrganizationTypes(dialogData);
      props.showMessage(data.message, 'success');
    } catch (e) {
      return props.showMessage(...buildErrorParams(e));
    }
    setDialog(false);
    getOrganizationTypes().then(types => setTypes(types));
  };

  const columns = useMemo(() => [
    {
      name: 'name',
      label: 'Organization Types',
      options: {
        customBodyRender: (name, tableMeta, updateValue) => {
          return <Typography className={classes.name} onClick={openEditDialog(name, tableMeta)}>{name}</Typography>
        }
      }
    },
    {
      name: 'organizations',
      label: 'Organizations',
      options: {
        customBodyRender: (orgs, tableMeta, updateValue) => {
          const names = [];
          if (Array.isArray(orgs)) orgs.forEach(org => names.push(org.name));
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
        const data = await deleteOrganizationTypes(types[index].name);
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
  }), [types, props]);

  const renderTable = useMemo(() =>
    <MuiThemeProvider theme={getMuiTheme()}>
      <MUIDataTable
        title="Organization Types"
        data={types}
        columns={columns}
        options={options}
      />
    </MuiThemeProvider>, [types, columns, options]);

  return (
    <>
      {renderTable}
      <OrgTypesAddDialog
        open={dialog}
        values={dialogData}
        onChange={onChangeDialog}
        onClose={closeDialog}
        onAdd={handleAdd}
        organizations={organizations}
      />
    </>
  )
}
