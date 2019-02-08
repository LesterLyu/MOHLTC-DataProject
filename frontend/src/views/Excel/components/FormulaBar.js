import {Component} from "react";
import {AppBar, Grid, InputBase, withStyles} from "@material-ui/core";
import React from "react";
import {ToolBarDivider} from './ExcelToolBar';
import PropTypes from "prop-types";

const styles = theme => ({
  input: {
    fontSize: 16,
    font: 'initial',
    padding: '4px 0 2px',
    '&:focus': {
      outline: 'none',
    }
  }
});

class FormulaBar extends Component {

  constructor(props) {
    super(props);
    this.state = {formulaBarInput: '',};
    this.data = {row: null, col: null, sheetIdx: null};
    this.excel = props.context;
    this.excel.addHook('afterSelection', (row, col, row2, col2) => {
      this.data.row = row;
      this.data.col = col;
      this.data.sheetIdx = this.excel.currentSheetIdx;
      const formulaOrValue = this.excel.getDataAtSheetAndCell(row, col, this.excel.currentSheetIdx);
      const input = formulaOrValue !== null && formulaOrValue !== undefined ?
        (formulaOrValue.formula ? '=' + formulaOrValue.formula : formulaOrValue) : '';
      if (this.state.formulaBarInput !== input) {
        this.setState({formulaBarInput: input})
      }
    });
  }

  componentDidMount() {
    console.log('mount')
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return true;
  }

  handleChange = what => (event) => {
    this.setState({[what]: event.target.value});
    this.excel.hotInstance.setDataAtCell(this.data.row, this.data.col, event.target.value);
  };

  render() {
    const {classes} = this.props;

    return (<AppBar position="static" color="default" style={{marginBottom: 3}}>
      <Grid container>
        <Grid item xs={"auto"} id="fx">
          fx
        </Grid>
        <ToolBarDivider/>
        <Grid item xs>
          <InputBase fullWidth value={this.state.formulaBarInput} classes={{input: classes.input}}
                     onChange={this.handleChange('formulaBarInput')}/>
        </Grid>
      </Grid>
    </AppBar>)
  }
}

FormulaBar
  .propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)

(
  FormulaBar
)
;
