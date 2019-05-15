import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import UserManager from "../../../controller/userManager";
import {
  Button,
  Card,
  CardBody,
  CardGroup,
  Col,
  Container,
  Form,
  FormText,
  Row
} from 'reactstrap';
import {TextField} from "@material-ui/core";


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
    return (
      <div className="app flex-row align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col md="8">
              <CardGroup>
                <Card className="p-4">
                  <CardBody>
                    <Form onSubmit={this.handleSubmit}>
                      <h1>Login</h1>
                      <p className="text-muted">Sign In to your account</p>

                      <TextField
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

                      <FormText color="muted">
                        {this.state.message}
                      </FormText>
                      <br/>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4"
                                  disabled={!this.validateForm()}
                          >Login</Button>
                        </Col>
                        <Col xs="6" className="text-right">
                          <Link to="/forgetpassword">
                            <Button color="link" className="px-0">Forgot password?</Button>
                          </Link>
                          <Link to="/register" className="d-lg-none">
                            <Button color="link" className="px-0">Register Now!</Button>
                          </Link>
                        </Col>
                      </Row>
                    </Form>
                  </CardBody>
                </Card>
                <Card className="text-white bg-primary py-5 d-md-down-none">
                  <CardBody className="text-center">
                    <div>
                      <h2>Sign up</h2>
                      <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
                        labore et dolore magna aliqua.</p>
                      <Link to="/register">
                        <Button color="primary" className="mt-3" active tabIndex={-1}>Register Now!</Button>
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              </CardGroup>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
};

export default Login;
