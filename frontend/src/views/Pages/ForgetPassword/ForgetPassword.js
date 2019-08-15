import React, {Component} from 'react';
import {sendPasswordResetEmail} from "../../../controller/userManager";
import {
  Button,
  Card,
  CardBody,
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


class ForgetPassword extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      message: '',
    };
  }

  validateForm() {
    return this.state.email.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    sendPasswordResetEmail(this.state.email)
      .then(() => {
        this.setState({message: 'Email sent, please check your email for further action.'});
      })
      .catch(err => {
        console.log(err);
        this.setState({message: err.message});
      })
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
                    <h1>Reset Password</h1>
                    <p className="text-muted">Enter your email:</p>
                    <InputGroup className="mb-3">
                      <InputGroupAddon addonType="prepend">
                        <InputGroupText>@</InputGroupText>
                      </InputGroupAddon>
                      <Input type="email" id="email" placeholder="Email" autoComplete="email"
                             value={this.state.email} onChange={this.handleChange}/>
                    </InputGroup>

                    <FormText color="muted">
                      {this.state.message}
                    </FormText>
                    <br/>
                    <Button color="success" disabled={!this.validateForm()} block>Send Reset Email</Button>
                  </Form>
                  <br/>
                  <Link to="/login">
                    <Button color="link"><span>Ready to log in?</span></Button>
                  </Link>
                  <br/>
                  <Link to="/register">
                    <Button color="link"><span>Register a new account?</span></Button>
                  </Link>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default ForgetPassword;
