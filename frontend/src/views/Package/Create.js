import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {MenuItem, TextField, Paper, Grid} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from '@material-ui/pickers';

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

export default function CreatePackage() {
  const classes = useStyles();
  const [values, setValues] = React.useState({
    name: '',
    adminNotes: '',
    startDate: Date.now(),
    endDate: Date.now(),
  });

  const handleChange = name => event => {
    setValues({...values, [name]: event.target.value});
  };

  const handleChangeDate = name => date => {
    setValues({...values, [name]: date});
  };

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

    </Paper>
  );
}
