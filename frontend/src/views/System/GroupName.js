import {Button, Paper, Typography, TextField, makeStyles} from "@material-ui/core";
import React, {useEffect, useState} from "react";
import {getGroupName, setGroupName} from '../../controller/system';
import {buildErrorParams} from '../../controller/common';

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
}));

export default function GroupName(props) {
  const [name, setName] = useState(null);
  const classes = useStyles();

  useEffect(() => {
    getGroupName().then(name => setName(name));
  }, []);

  const handleClick = async () => {
    try {
      const data = await setGroupName(name);
      props.showMessage(data.message, 'success');
    } catch (e) {
      props.showMessage(...buildErrorParams(e));
    }
  };

  return (
    <Paper className={classes.container}>
      <Typography variant="h6" gutterBottom>
        Set Current Group Name:
      </Typography>
      <hr/>
      <TextField
        label="Group Name"
        value={name}
        onChange={e => setName(e.target.value)}
        autoFocus
        helperText={'This helps others to identify this group when register.'}
        InputLabelProps={{shrink: true}}/>
      <br/><br/>
      <Button variant="contained" color="primary" onClick={handleClick}>
        Save Name
      </Button>
    </Paper>
  )
}
