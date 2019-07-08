import React, {Component} from 'react';
import SystemManager from '../../controller/system'
import {Grid, Typography, Card, CardContent} from '@material-ui/core';
import ReactApexChart from 'react-apexcharts';
import {withStyles} from "@material-ui/core/es";
import PropTypes from "prop-types";

const pieChartOptions = {
  chart: {
    animations: {
      enabled: false,
    }
  },
  tooltip: {y: {formatter: val => Math.round(val / 1024 / 1024) + 'MB'}}
};

const styles = theme => ({
  title: {
    textAlign: 'center',
    paddingTop: 5,
    color: '#686868'
  }
});

class SystemInfo extends Component {

  constructor(props) {
    super(props);
    this.systemManager = new SystemManager(props);
    this.state = {
      memoryOptions: {
        ...pieChartOptions,
        labels: ['Active', 'Free', 'Buffer'],
      },
      memorySeries: [],
      swapOptions: {
        ...pieChartOptions,
        labels: ['Used', 'Free'],
      },
      swapSeries: [],
      cpuOptions: this._cpuOptions(),
      cpuSeries: [{
        name: 'cpu',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      }],
      info: {}
    };
    this.systemManager.staticSystemInfo()
      .then(info => {
        this.setState(info);
      });
    this.autoUpdate = setInterval(this.update, 2000);
  }

  _cpuOptions = () => {
    return {
      chart: {
        animations: {
          enabled: false,
        }
      },
      xaxis: {type: 'category', labels: {show: false}, axisTicks: {show: false}},
      yaxis: {min: 0, max: 100, tickAmount: 5, labels: {formatter: value => Math.trunc(value) + '%'}},
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      }
    }
  };

  update = () => {
    this.systemManager.systemInfo()
      .then((data) => {
        if (!data) return;
        // memory
        const {mem, currentLoad} = data.info;
        const memorySeries = [mem.active, mem.free, mem.buffcache];

        // swap
        const swapSeries = [mem.swapused, mem.swapfree];

        // cpu
        const cpuSeries = [{name: this.state.cpuSeries[0].name, data: [...this.state.cpuSeries[0].data]}];
        cpuSeries[0].data.push(currentLoad.currentload);
        if (cpuSeries[0].data.length > 20) cpuSeries[0].data.splice(0, 1);

        this.setState({memorySeries, swapSeries, cpuSeries})
      })
  };

  componentWillUnmount() {
    clearInterval(this.autoUpdate);
  }

  renderText = (data) => {
    if (!data) {
      return 'Loading...';
    }
    const texts = [];
    for (let key in data) {
      const value = data[key];
      if (value === '' || value == null) continue;
      if (typeof value !== "object") {
        texts.push(
          <React.Fragment key={key}>
            <span style={{fontWeight: 'bold'}}>{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
            {value}
            <br/>
          </React.Fragment>
        );
      } else {
        for (let innerKey in value) {
          const title = key.charAt(0).toUpperCase() + key.slice(1) + ' - ' + innerKey;
          texts.push(
            <React.Fragment key={title}>
              <span style={{fontWeight: 'bold'}}>{title}: </span>
              {value[innerKey]}
              <br/>
            </React.Fragment>
          )
        }
      }
    }
    return texts;
  };

  render() {
    const {classes} = this.props;
    const {info} = this.state;
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} sm={12} md={6} lg={4} xl={4}>
          <Card>
            <Typography variant="h5" gutterBottom className={classes.title}>
              CPU Usage
            </Typography>
            <CardContent>
              <ReactApexChart options={this.state.cpuOptions} series={this.state.cpuSeries} type="area" height={250}/>
            </CardContent>

          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <Card>
            <Typography variant="h5" gutterBottom className={classes.title}>
              Memory Usage
            </Typography>
            <CardContent>
              <ReactApexChart options={this.state.memoryOptions} series={this.state.memorySeries} type="pie"
                              height={288}/>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <Card>
            <Typography variant="h5" gutterBottom className={classes.title}>
              Swap Usage
            </Typography>
            <CardContent>
              <ReactApexChart options={this.state.swapOptions} series={this.state.swapSeries} type="pie" height={288}/>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <Card>
            <Typography variant="h5" gutterBottom className={classes.title}>
              System
            </Typography>
            <CardContent>
              {this.renderText(info.system)}
              {this.renderText(info.osInfo)}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <Card>
            <Typography variant="h5" gutterBottom className={classes.title}>
              CPU
            </Typography>
            <CardContent>
              {this.renderText(info.cpu)}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={6} lg={4} xl={3}>
          <Card>
            <Typography variant="h5" gutterBottom className={classes.title}>
              Disks
            </Typography>
            <CardContent>
              {this.renderText(info.diskLayout)}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

SystemInfo.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SystemInfo);
