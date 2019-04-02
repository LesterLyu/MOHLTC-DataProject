import React, {Component} from 'react';
import {Fade, TextField, Typography, Card} from "@material-ui/core";
import PropTypes from "prop-types";
import {withStyles} from "@material-ui/core/es";
import FormulaParser from 'fast-formula-parser/build/parser.min';


const styles = theme => ({
  root: {
    padding: 20,
  },
  chip: {
    margin: 3,
    shadow: ''
  },
  title: {
    color: '#383838'
  },
  subTitle: {
    color: '#a4a4a4'
  },
  content: {
    fontFamily: 'Roboto',
    lineHeight: 2,
    color: '#444444'
  }
});

class ParserView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      formula: '',
      result: '',
    };

    this.parser = new FormulaParser();
    window.parser = this.parser;
  }

  handleChange = event => {
    const formula = event.target.value;
    let result = '';
    try {
      result = this.parser.parse(formula);
      if (typeof result === 'object')
        result = result.result;
    } catch (e) {
      this.setState({formula, result: ''});
      return;
    }
    this.setState({formula, result})

  };

  render() {
    const {classes} = this.props;

    return (
      <Fade in={true} timeout={500}>
        <Card className={classes.root}>
          <TextField
            label="formula"
            value={this.state.formula}
            onChange={this.handleChange}
            margin="normal"
            fullWidth
          />
          <TextField
            label="Result"
            value={this.state.result}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
          />

        </Card>
      </Fade>
    )
  }
}

ParserView.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ParserView);
