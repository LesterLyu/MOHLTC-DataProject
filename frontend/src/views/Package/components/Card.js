import React from "react";
import {
  Button, Card, CardActionArea, CardActions, CardContent, Grid, makeStyles, Tooltip, Typography
} from "@material-ui/core";
import {FileTableOutline, FileOutline, FolderOpen} from "mdi-material-ui";
import {Link} from "react-router-dom";

const useStyles = makeStyles(theme => ({
  card: {
    width: 180,
    height: 180,
  },
  cardContent: {
    height: 145,
    padding: '16px 16px 0 16px',
  },
  cardActions: {
    padding: '0 4px'
  },
  excelIcon: {
    color: '#22a463',
    height: 80,
    width: 80,
  },
  packageIcon: {
    color: '#939393',
    height: 80,
    width: 80,
  },
}));

export default function FileCard(props) {
  const {fileName, editHref, deleteCb, type} = props;
  const classes = useStyles();
  const Icon = type === 'excel' ? <FileTableOutline className={classes.excelIcon}/>
    : type === 'package' ? <FolderOpen className={classes.packageIcon}/>
      : <FileOutline className={classes.packageIcon}/>;

  return (
    <Card className={classes.card} elevation={2}>
      <Tooltip title={fileName} placement="bottom" enterDelay={300}>
        <Link to={editHref}>
          <CardActionArea>
            <CardContent className={classes.cardContent}>
              <Grid container alignItems="center" justify="center" spacing={2}>
                <Grid item xs={12} style={{textAlign: 'center'}}>
                  {Icon}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" noWrap style={{color: 'rgba(0,0,0,0.87)'}}>
                    {fileName}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </CardActionArea>
        </Link>

      </Tooltip>
      <CardActions className={classes.cardActions}>
        <Link to={editHref}>
          <Button size="small" color="primary">
            open
          </Button>
        </Link>
        {deleteCb ? <Button size="small" color="primary" onClick={() => deleteCb(fileName)}>
          Delete
        </Button> : ''}

      </CardActions>
    </Card>
  )
}
