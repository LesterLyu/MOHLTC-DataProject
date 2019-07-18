import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import {CircularProgress, Typography} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  progress: {
    margin: theme.spacing(2),
    marginTop: theme.spacing(4),
  },
}));

export default function Loading(props) {
  const classes = useStyles();
  return (
    <div style={{textAlign: 'center'}}>
      <CircularProgress className={classes.progress}/>
      <Typography variant="subtitle2" color={"textSecondary"}>
        {props.message ? props.message : 'Loading Components...'}
      </Typography>
    </div>
  );
}
