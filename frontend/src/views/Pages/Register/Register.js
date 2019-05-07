import React, {Component} from 'react';
import UserManager from "../../../controller/userManager";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
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
import {Link} from "react-router-dom";

const log = console.log;

class Register extends Component {

  constructor(props) {
    super(props);
    this.user = new UserManager(props);

    this.state = {
      username: '',
      email: '',
      firstName: "",
      lastName: "",
      password: '',
      repeatPassword: '',
      phoneNumber: "",
      organization: "",
      groupNumber: "",
      message: '',
    };
  }

  validateForm() {
    return this.state.username.length > 0 && this.state.password.length > 0 //&& this.state.repeatPassword.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();
    log(this.state);
    // if (this.state.password !== this.state.repeatPassword) {
    //   this.setState({message: 'Passwords must be same.'});
    //   return;
    // }

    this.user.signUpLocal(this.state.username, this.state.password,
      this.state.firstName, this.state.lastName, this.state.organization,
      this.state.email, this.state.phoneNumber, this.state.groupNumber);

    // this.user.signUpWithEmail(this.state.username, this.state.email, this.state.password)
    //   .then(user => {
    //     this.props.history.push('/');
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     this.setState({message: err.message});
    //   })

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

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-account-circle"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="text" id="username" placeholder="Username" autoComplete="username"
                             value={this.state.username} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <Input type="email" id="email" placeholder="Email" autoComplete="email"
                             value={this.state.email} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-rename-box"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="firstName" id="firstName" placeholder="First Name" autoComplete="firstName"
                             value={this.state.firstName} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-rename-box"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="lastName" id="lastName" placeholder="Last Name" autoComplete="lastName"
                             value={this.state.lastName} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-cellphone"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="phoneNumber" id="phoneNumber" placeholder="Phone Number" autoComplete="phoneNumber"
                             value={this.state.phoneNumber} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-account-group"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="organization" id="organization" placeholder="Organization"
                             autoComplete="organization"
                             value={this.state.organization} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-numeric"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="groupNumber" id="groupNumber" placeholder="Group Number" autoComplete="groupNumber"
                             value={this.state.groupNumber} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-lock"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" id="password" placeholder="Password" autoComplete="new-password"
                             value={this.state.password} onChange={this.handleChange}/>
                    </InputGroup>

                    <InputGroup className="mb-4">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>
                          <i className="mdi mdi-lock-plus"/>
                        </InputGroupText>
                      </InputGroupAddon>
                      <Input type="password" id="repeatPassword" placeholder="Repeat password"
                             autoComplete="new-password"
                             value={this.state.repeatPassword} onChange={this.handleChange}/>
                    </InputGroup>

                    <FormText color="muted">
                      {this.state.message}
                    </FormText>
                    <br/>
                    <Button color="success" disabled={!this.validateForm()} onSubmit={this.handleSubmit} block>Create
                      Account</Button>
                    <br/>
                    <Link to="/login">
                      <Button color="link"><span>Already have an account?</span></Button>
                    </Link>
                  </Form>

                </CardBody>
                <CardFooter className="p-4">
                  <Row>
                    <Col xs="12" sm="6">
                      <Button className="btn-facebook mb-1 disabled" block><span>facebook</span></Button>
                    </Col>
                    <Col xs="12" sm="6">
                      <Button className="btn-twitter mb-1 disabled" block><span>twitter</span></Button>
                    </Col>
                  </Row>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default Register;
