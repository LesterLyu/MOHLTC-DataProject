import React, {Component} from "react";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/es";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Grid,
  Tooltip,
  Typography
} from "@material-ui/core";
import {FileTableOutline} from "mdi-material-ui";
import {Link} from "react-router-dom";

const styles = theme => ({
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
  icon: {
    color: '#22a463',
    height: 80,
    width: 80,
  },
});

class SheetCard extends Component{

  render() {
    const {classes, fileName, editHref,} = this.props;

    return (
      <Card className={classes.card}>


        <Tooltip title={fileName} placement="bottom" enterDelay={300}>
          <Link to={editHref}>
            <CardActionArea>
              <CardContent className={classes.cardContent}>
                <Grid container alignItems="center" justify="center" spacing={16}>
                  <Grid item xs={12} style={{textAlign: 'center'}}>
                    <FileTableOutline className={classes.icon}/>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body1" gutterBottom noWrap>
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
              Edit
            </Button>
          </Link>

            <Button size="small" color="primary">
              Delete
            </Button>

        </CardActions>
      </Card>
    )
  }

}


SheetCard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SheetCard);
