import React, {useCallback, useEffect, useMemo} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {TextField, Paper, Grid, Button, FormControlLabel, Checkbox} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from '@material-ui/pickers';
import Dropdown from "./components/Dropdown";
import WorkbookManager from "../../controller/workbookManager";
import {getAllUsers} from "../../controller/userManager";
import {createPackage} from "../../controller/package"

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  textField: {
    // marginLeft: theme.spacing(1),
    // marginRight: theme.spacing(1),
    width: 400,
  },

}));

export default function CreatePackage(props) {
  const workbookManager = new WorkbookManager(props);
  const classes = useStyles();
  const [values, setValues] = React.useState({
    name: '',
    adminNotes: '',
    startDate: Date.now(),
    endDate: Date.now(),
    workbooks: null,
    users: null,
    selectedWorkbooks: [],
    selectedUsers: [],
    published: false,
  });

  useEffect(() => {
    if (!values.workbooks) {
      workbookManager.getAllWorkbooksForAdmin()
        .then(data => {
          const workbooks = [];
          data.forEach(workbook => workbooks.push([workbook._id, workbook.name]));
          setValues({...values, workbooks})
        });
    }
  }, [values, workbookManager]);

  useEffect(() => {
    if (!values.users) {
      getAllUsers()
        .then(data => {
          const users = [];
          data.forEach(user => users.push([user._id, `${user.username} (${user.firstName}, ${user.lastName})`]));
          setValues({...values, users})
        });
    }
  }, [values]);

  const handleChange = useCallback((name, value) => {
    setValues(values => ({...values, [name]: value}));
  }, []);

  const handleChangeEvent = name => e => handleChange(name, e.target.value);

  const handleChangeDate = useCallback(name => date => {
    setValues(values => ({...values, [name]: date}));
  }, []);

  const handleSave = useCallback(async () => {
    try {
      const data = await createPackage({
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        workbookIds: values.selectedWorkbooks,
        userIds: values.selectedUsers,
        adminNotes: values.adminNotes,
        published: values.published,
      });
      props.showMessage(data.message, 'success')
    } catch (e) {
      props.showMessage(e.toString() + '\nDetails: ' + e.response.data.message, 'error')
    }

  }, [values, props]);

  const renderDates = useMemo(() => (<MuiPickersUtilsProvider utils={DateFnsUtils}>
    <Grid container justify={"flex-start"} spacing={4}>
      <Grid item>
        <KeyboardDateTimePicker
          margin="normal"
          label="Start Date"
          value={values.startDate}
          variant="inline"
          format="yyyy/MM/dd HH:mm"
          onChange={handleChangeDate('startDate')}
        />
      </Grid>
      <Grid item>
        <KeyboardDateTimePicker
          margin="normal"
          label="End Date"
          value={values.endDate}
          variant="inline"
          format="yyyy/MM/dd HH:mm"
          onChange={handleChangeDate('endDate')}
        />
      </Grid>
    </Grid>
  </MuiPickersUtilsProvider>), [handleChangeDate, values.startDate, values.endDate]);

  const renderDropdown = useMemo(() => (
    <>
      <Dropdown title="Users" options={values.users} onChange={data => handleChange('selectedUsers', data)}/>
      <Dropdown title="Workbooks" options={values.workbooks}
                onChange={data => handleChange('selectedWorkbooks', data)}/>
    </>
  ), [values.users, values.workbooks, handleChange]);

  return (
    <Paper className={classes.container}>
      <TextField
        label="Package Name"
        className={classes.textField}
        value={values.name}
        onChange={handleChangeEvent('name')}
        margin="normal"
        autoFocus
        required
      />
      <TextField
        label="Admin Notes"
        value={values.adminNotes}
        onChange={handleChangeEvent('adminNotes')}
        multiline
        margin="normal"
        fullWidth
      />
      {renderDates}
      {renderDropdown}
      <FormControlLabel style={{width: '100%'}}
        control={
          <Checkbox checked={values.published} color="primary"
                    onChange={e => handleChange('published', e.target.checked)}/>
        }
        label="Publish"
      />
      <Button onClick={handleSave} color="primary" variant="contained">
        Save
      </Button>
    </Paper>
  );
}
