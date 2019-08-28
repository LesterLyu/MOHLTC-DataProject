import React, {useCallback, useEffect, useMemo} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {TextField, Paper, Grid, Button, FormControlLabel, Checkbox} from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker
} from '@material-ui/pickers';
import Dropdown from "./components/Dropdown";
import {getAllWorkbooksForAdmin} from "../../controller/workbookManager";
import {editPackage, adminGetPackage} from "../../controller/package"
import {getOrganizationTypes} from "../../controller/system"


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

export default function EditPackage(props) {
  const classes = useStyles();
  const {name} = props.match.params;
  const [values, setValues] = React.useState({
    name: '',
    adminNotes: '',
    startDate: Date.now(),
    endDate: Date.now(),
    workbooks: null,
    orgTypes: null,
    originalTypes: [],
    selectedWorkbooks: [],
    selectedOrgTypes: [],
    published: false,
  });

  useEffect(() => {
    console.log('useEffect  -- ' + name);
    adminGetPackage(name)
      .then(dbPackage => {
        console.table(dbPackage);
        setValues({
          name: dbPackage.name,
          adminNotes: dbPackage.adminNotes,
          startDate: dbPackage.startDate,
          endDate: dbPackage.endDate,
          workbooks: null,
          orgTypes: null,
          originalTypes: null,
          selectedWorkbooks: null,
          selectedOrgTypes:  null,
          published: dbPackage.published,
        });
        getAllWorkbooksForAdmin()
          .then(data => {
            const workbooks = [];
            const selectedWorkbooks = [];
            data.forEach(workbook => {
              workbooks.push([workbook._id, workbook.name]);
              dbPackage.workbooks.forEach(workbooksInPackage => {
                if (workbooksInPackage._id === workbook._id) {
                  selectedWorkbooks.push(workbook._id);
                }
              })
            });
            setValues(values => ({...values, workbooks, selectedWorkbooks}));
          });
        getOrganizationTypes()
          .then(data => {
            const types = [];
            const selectedOrgTypes = [];
            data.forEach(type => {
              types.push([type._id, type.name]);
              dbPackage.organizationTypes.forEach(typesInPackage => {
                if (typesInPackage === type._id) {
                  selectedOrgTypes.push(type._id);
                }
              })
            });
            setValues(values => ({...values, selectedOrgTypes, orgTypes: types, originalTypes: data}))
          });
      });

  }, [name]);

  const handleChange = useCallback((name, value) => {
    setValues(values => ({...values, [name]: value}));
  }, []);

  const handleChangeEvent = name => e => handleChange(name, e.target.value);

  const handleChangeDate = useCallback(name => date => {
    setValues(values => ({...values, [name]: date}));
  }, []);

  const handleSave = useCallback(async () => {
    const orgIds = new Set();
    for (const selectedTypeId of values.selectedOrgTypes) {
      for (const type of values.originalTypes) {
        if (type._id === selectedTypeId) {
          if (type.organizations) {
            for (const org of type.organizations) {
              orgIds.add(org._id);
            }
          }

        }
      }
    }

    try {
      const data = await editPackage({
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        workbookIds: values.selectedWorkbooks,
        organizationTypes: values.selectedOrgTypes,
        orgIds: [...orgIds],
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
      <Dropdown title="Organization Types" options={values.orgTypes}
                defaultValues={values.selectedOrgTypes}
                onChange={data => handleChange('selectedOrgTypes', data)}/>
      <Dropdown title="Workbooks" options={values.workbooks}
                defaultValues={values.selectedWorkbooks}
                onChange={data => handleChange('selectedWorkbooks', data)}/>
    </>
  ), [values.selectedOrgTypes, values.orgTypes, values.workbooks, values.selectedWorkbooks, handleChange]);

  return (
    <Paper className={classes.container}>
      <TextField
        label="Package Name"
        disabled={true}
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
        Update
      </Button>
    </Paper>
  );
}
