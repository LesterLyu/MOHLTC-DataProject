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
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Row
} from 'reactstrap';


class Login extends Component {
  constructor(props) {
    super(props);

    this.user = new UserManager(props);

    this.state = {
      username: '',
      password: '',
      message: '',
    };
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    this.user.loginLocal(this.state.username, this.state.password)
      .then(response => {
        this.props.history.push('/');
      })
      .catch(err => {
        console.log(err.response);
        const message = err.response ? err.response : err.message;
        this.setState({message});
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
                      <InputGroup className="mb-3">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-user"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="text" id="username" placeholder="Username" autoComplete="username"
                               value={this.state.username} onChange={this.handleChange}/>
                      </InputGroup>
                      <InputGroup className="mb-4">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="icon-lock"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input type="password" id="password" placeholder="Password" autoComplete="current-password"
                               value={this.state.password} onChange={this.handleChange}/>
                      </InputGroup>
                      <FormText color="muted">
                        {this.state.message}
                      </FormText>
                      <br/>
                      <Row>
                        <Col xs="6">
                          <Button color="primary" className="px-4" disabled={!this.validateForm()}>Login</Button>
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
}

export default Login;
