import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import UserManager from "../../../controller/userManager";
import {TextField, Button, Grid, Card, withStyles, Container} from "@material-ui/core";

const styles = theme => ({
  card: {
    padding: theme.spacing(4),
    minWidth: 300,
  },
  container: {
    alignItems: 'center',
    maxWidth: 500,
    height: '100vh',
    display: 'flex',
  }
});

class Login extends Component {
  constructor(props) {
    super(props);

    this.user = new UserManager(props);

    this.state = {
      username: '',
      password: '',

      isServerErrormessage: false,
      ServerErrormessage: null,

      isUsernameError: false,
      usernameErrorMessage: '',

      isPasswordError: false,
      passwordErrorMessage: '',
    };
    this.usernameRef = React.createRef();
  }

  validateForm() {
    return (this.state.username.length >= 1) &&
      (this.state.password.length >= 1) &&
      !this.state.isUsernameError &&
      !this.state.isPasswordError;
  }

  validateUsername = () => {
    if (this.state.username.length >= 1 && this.state.username.length <= 20) {
      this.setState({
        isUsernameError: false,
        usernameErrorMessage: '',
      });
      return true;
    } else {
      this.setState({
        isUsernameError: true,
        usernameErrorMessage: 'Username must be 1-20 characters long.',
      });
      return false;
    }
  };

  validatePassword = () => {
    if (this.state.password.length >= 1) {
      this.setState({
        isPasswordError: false,
        passwordErrorMessage: '',
      });
      return false;
    } else {
      this.setState({
        isPasswordError: true,
        passwordErrorMessage: 'Passwords can not be empty.',
      });
      return true;
    }
  };


  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });
    if (name === 'username') {
      this.setState({
        isUsernameError: false,
        usernameErrorMessage: '',
      });
    } else if (name === 'password') {
      this.setState({
        isPasswordError: false,
        passwordErrorMessage: '',
      });
    }

  };

  handleSubmit = event => {
    event.preventDefault();
    this.user.loginLocal(this.state.username, this.state.password)
      .then(response => {
        console.log('login successfully');
        this.props.history.push('/');
      })
      .catch(err => {
        console.log(err.response.data.message);
        const errorMessage = err.response.data.message;
        this.setState({
          isPasswordError: true,
          passwordErrorMessage: errorMessage,
        });
      })
  };

  render() {
    const {classes} = this.props;
    return (
      <Container className={classes.container}>
        <Card className={classes.card}>
          <h1>Login</h1>
          <p className="text-muted">Sign In to your account</p>
          <TextField
            inputRef={this.usernameRef}
            id="username"
            label="Username"
            type="string"
            autoFocus={true}
            value={this.state.username}
            onChange={this.handleChange('username')}
            onBlur={this.validateUsername}
            margin="normal"
            fullWidth
            error={this.state.isUsernameError}
            helperText={this.state.usernameErrorMessage}
          />

          <TextField
            label="Password"
            value={this.state.password}
            onChange={this.handleChange('password')}
            onBlur={this.validatePassword}
            type="password"
            margin="normal"
            fullWidth
            error={this.state.isPasswordError}
            helperText={this.state.passwordErrorMessage}
          />
          <Grid container>
            <Grid item xs={6}>
              <br/>
              <Button variant="contained" color="primary" disabled={!this.validateForm()}
                      onClick={this.handleSubmit}>
                Login
              </Button>
            </Grid>
            <Grid item xs={6} style={{textAlign: 'right'}}>
              <br/>
              <Link to="/forgetpassword">
                <Button>Forgot password?</Button>
              </Link>
              <Link to="/register">
                <Button color="primary">Register Now!</Button>
              </Link>
            </Grid>
          </Grid>
        </Card>
      </Container>
    );
  }
}

export default withStyles(styles)(Login);
