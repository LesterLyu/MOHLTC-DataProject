import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React, {Component} from 'react';
import UserManager from "../../../controller/userManager";

import {
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Form,
  Row
} from 'reactstrap';
import {Link} from "react-router-dom";
import {TextField} from '@material-ui/core';

class Register extends Component {

  constructor(props) {
    super(props);
    this.user = new UserManager(props);

    this.state = {
      username: '',
      email: '@ontario.ca',
      firstName: "",
      lastName: "",
      password: '',
      repeatPassword: '',
      phoneNumber: "",
      groupNumber: 1,

      isServerErrormessage: false,
      ServerErrormessage: null,

      isUsernameError: false,
      usernameErrorMessage: '',
      isEmailError: false,
      emailErrorMessage: '',
      isPasswordError: false,
      passwordErrorMessage: '',
      isRepeatPasswordError: false,
      repeatPasswordErrorMessage: '',
      isGroupNumberError: false,
      groupNumberErrorMessage: '',
    };
  }

  handleSubmit = event => {
    event.preventDefault();
    this.user.signUpLocal(this.state.username, this.state.password,
      this.state.firstName, this.state.lastName, null, this.state.email, this.state.phoneNumber, this.state.groupNumber)
      .then(response => {
        this.props.history.push(response.data.redirect);
      })
      .catch(err => {
        if ((typeof err.response.data.message) === 'string') {
          const serverErrorMessage = err.response.data.message;
          console.log(serverErrorMessage);
          if (serverErrorMessage.toLowerCase().includes('username')) {
            this.setState({
              isUsernameError: true,
              usernameErrorMessage: serverErrorMessage,
            });
          }
          if (serverErrorMessage.toLowerCase().includes('email')) {
            this.setState({
              isEmailError: true,
              emailErrorMessage: serverErrorMessage,
            });
          }
          if (serverErrorMessage.toLowerCase().includes('group number')) {
            this.setState({
              isGroupNumberError: true,
              ServerErrormessage: serverErrorMessage,
            });
          }
        } else {
          const serverErrorMessage = err.response.data.message.message;
          console.log(serverErrorMessage);
          this.setState({
            isServerErrormessage: false,
            ServerErrormessage: serverErrorMessage,
          })
        }
      })
  };


  validateUsername = () => {
    // local validate
    if (this.state.username.length >= 1 && this.state.username.length <= 20) {
      this.setState({
        isUsernameError: false,
        usernameErrorMessage: '',
      });
    } else {
      this.setState({
        isUsernameError: true,
        usernameErrorMessage: 'Username must be 1-20 characters long.',
      });
      return false;
    }
  };

  validateEmail = () => {
    if (this.state.email !== '@ontario.ca' && this.state.email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)) {
      this.setState({
        isEmailError: false,
        emailErrorMessage: '*Required',
      });
      return true;
    } else {
      this.setState({
        isEmailError: true,
        emailErrorMessage: 'Email is invalid.',
      });
      return false;
    }
  };

  validatePassword = () => {
    if (this.state.password.length >= 1) {
      this.setState({
        isPasswordError: false,
        passwordErrorMessage: '*Required',
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
  validateRepeatPassword = () => {
    if (this.state.password === this.state.repeatPassword) {
      this.setState({
        isRepeatPasswordError: false,
        repeatPasswordErrorMessage: '*Required',
      });
      return false;
    } else {
      this.setState({
        isRepeatPasswordError: true,
        repeatPasswordErrorMessage: 'Passwords must be identical.',
      });
      return true;
    }
  };

  validateGroupNumber = () => {
    if (this.state.groupNumber >= 1) {
      this.setState({
        isGroupNumberError: false,
        groupNumberErrorMessage: '',
      });
      return false;
    } else {
      this.setState({
        isGroupNumberError: true,
        groupNumberErrorMessage: 'GroupNumber can not be empty or 0.',
      });
      return true;
    }
  };

  validateAllInputs() {
    return (this.state.username === '') ||
      this.state.isUsernameError ||
      this.state.isEmailError ||
      this.state.isPasswordError ||
      this.state.isRepeatPasswordError ||
      this.state.isGroupNumberError
  }


  handleChange = name => event => {
    this.setState({
      [name]: event.target.value
    });

    if (name === 'username') {
      this.setState({
        isUsernameError: false,
        usernameErrorMessage: '',
      });
    } else if (name === 'email') {
      this.setState({
        isEmailError: false,
        emailErrorMessage: '',
      });
    } else if (name === 'password') {
      this.setState({
        isPasswordError: false,
        passwordErrorMessage: '',
      });
    } else if (name === 'repeatPassword') {
      this.setState({
        isRepeatPasswordError: false,
        RepeatPasswordErrorMessage: '',
      });
    } else if (name === 'groupNumber') {
      this.setState({
        isGroupNumberError: false,
        groupNumberErrorMessage: '',
      });
    }
  };


  render() {
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="9" lg="7" xl="6">
              <Card className="mx-4">
                <CardBody className="p-4">
                  <Form onSubmit={this.handleSubmit}>
                    <h1>Register</h1>
                    <p className="text-muted">Create your account</p>

                    <TextField
                      label="Username"
                      type="string"
                      required
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
                      label="Email"
                      type="email"
                      required={true}
                      value={this.state.email}
                      onChange={this.handleChange('email')}
                      onBlur={this.validateEmail}
                      margin="normal"
                      fullWidth
                      error={this.state.isEmailError}
                      helperText={this.state.emailErrorMessage}
                    />

                    <TextField
                      label="First Name"
                      type="string"
                      required={false}
                      value={this.state.firstName}
                      onChange={this.handleChange('firstName')}
                      margin="normal"
                      fullWidth
                    />

                    <TextField
                      label="Last Name"
                      type="string"
                      required={false}
                      value={this.state.lastName}
                      onChange={this.handleChange('lastName')}
                      margin="normal"
                      fullWidth
                    />

                    <TextField
                      label="Phone Number"
                      type="string"
                      required={false}
                      value={this.state.phoneNumber}
                      onChange={this.handleChange('phoneNumber')}
                      margin="normal"
                      fullWidth
                    />

                    <TextField
                      label="Password"
                      value={this.state.password}
                      onChange={this.handleChange('password')}
                      onBlur={this.validatePassword}
                      type="password"
                      required={true}
                      margin="normal"
                      fullWidth
                      error={this.state.isPasswordError}
                      helperText={this.state.passwordErrorMessage}
                    />

                    <TextField
                      label="RepeatPassword"
                      value={this.state.repeatPassword}
                      onChange={this.handleChange('repeatPassword')}
                      onBlur={this.validateRepeatPassword}
                      type="password"
                      required={true}
                      margin="normal"
                      fullWidth
                      error={this.state.isRepeatPasswordError}
                      helperText={this.state.repeatPasswordErrorMessage}
                    />

                    <TextField
                      label="Group Number"
                      type="number"
                      required={true}
                      value={this.state.groupNumber}
                      onChange={this.handleChange('groupNumber')}
                      onBlur={this.validateGroupNumber}
                      margin="normal"
                      fullWidth
                      error={this.state.isGroupNumberError}
                      helperText={this.state.groupNumberErrorMessage}
                    />


                    <br/>
                    <Button
                      variant="outlined"
                      color="primary"
                      disabled={this.validateAllInputs()}
                      onSubmit={this.handleSubmit}
                      block
                    >
                      Create Account
                    </Button>

                    <Paper elevation={1}>
                      <Typography component="p">
                        {/* FIXME: modify the color to red */}
                        {this.state.ServerErrormessage}
                      </Typography>
                    </Paper>

                    <Link to="/login">
                      <Button color="link"><span>Already have an account?</span></Button>
                    </Link>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Register;
