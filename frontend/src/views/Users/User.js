import React, { Component } from 'react';
import { Card, CardBody, CardHeader, Col, Row, Table } from 'reactstrap';

import UserManager from "../../firebase/userManager";

class User extends Component {

  constructor(props) {
    super(props);
    this.userList = [];
    this.state = {
      msg: (<span> <i className="text-muted fa fa-spin fa-spinner"/> loading... </span>)
    };
    const self = this;
    new UserManager(props).getAllAdminPanelUsersUseCache()
      .then(userList => {
        self.setState({msg:  (<span> <i className="text-muted fa fa-spin fa-spinner"/> Not Found </span>)});
        self.userList = userList;
        self.forceUpdate();
      })
  }

  render() {

    const user = this.userList.find( user => user.uid === this.props.match.params.id);
    const userDetails = user ? user : {uid: this.state.msg};

    return (
      <div className="animated fadeIn">
        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <strong><i className="icon-info pr-1"></i> {userDetails.username}</strong>
              </CardHeader>
              <CardBody>
                  <Table responsive striped hover>
                    <tbody>
                    <tr>
                      <td>uid</td>
                      <td><strong>{userDetails.uid}</strong></td>
                    </tr>
                    <tr>
                      <td>username</td>
                      <td><strong>{userDetails.username}</strong></td>
                    </tr>
                    <tr>
                      <td>email</td>
                      <td><strong>{userDetails.email}</strong></td>
                    </tr>
                    <tr>
                      <td>Register Date</td>
                      <td><strong>{new Date(userDetails.timestamp).toLocaleString()}</strong></td>
                    </tr>
                    <tr>
                      <td>Permissions</td>
                      <td><strong>{(userDetails.permissions || []).toString()}</strong></td>
                    </tr>

                    </tbody>
                  </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

export default User;
