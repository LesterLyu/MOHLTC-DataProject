import React, {useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {TextField, Paper, Grid} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from '@material-ui/pickers';
import Dropdown from "./components/Dropdown";
import WorkbookManager from "../../controller/workbookManager";

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
  });

  useEffect(async () => {
    if (!values.workbooks) {
      const data = await workbookManager.getAllWorkbooksForAdmin();
      setValues({...values, workbooks: data});
    }
    return () => {};
  }, [values, workbookManager]);

  const handleChange = name => event => {
    setValues({...values, [name]: event.target.value});
  };

  const handleChangeDate = name => date => {
    setValues({...values, [name]: date});
  };

  const users = [];
  for (let i = 0; i < 50000; i++) {
    users.push([i + ' val', i + ' label'])
  }

  return (
    <Paper className={classes.container}>
      <TextField
        label="Package Name"
        className={classes.textField}
        value={values.name}
        onChange={handleChange('name')}
        margin="normal"
        autoFocus
      />
      <TextField
        label="Admin Notes"
        value={values.adminNotes}
        onChange={handleChange('adminNotes')}
        multiline
        margin="normal"
        fullWidth
      />
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
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
      </MuiPickersUtilsProvider>
      <Dropdown title="Users" options={users}/>
      <Dropdown title="Workbooks" options={[]}/>
    </Paper>
  );
}
