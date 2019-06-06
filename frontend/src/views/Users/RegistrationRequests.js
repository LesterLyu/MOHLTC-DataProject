import React, {Component} from 'react';
import UserManager from "../../controller/userManager";
// import LibraryLoader from "../../controller/LibraryLoader";

const MaterialTable = React.lazy(() =>import('material-table' /* webpackChunkName: "material-table" */));

class RegistrationRequests extends Component {

  constructor(props) {
    super(props);
    this.user = new UserManager(props);  // new object
    this.state = {
      userList: [{username: 'lester1', email: '123123', permissions:"permission1"}]
    };

    this.user.getAllUsers()
      .then(users => {
        this.setState({userList: users})});
  }

  render() {

    const userList = this.state.userList;

    return (
      <div className="animated fadeIn">
        <div style={{maxWidth: '100%'}}>
          <MaterialTable
            columns={[
              {title: 'username', field: 'username'},
              {title: 'Organization', field: 'Organization'},
              {title:"Role", field:"Role"},
              {title:"Group Number", field:"Group Number"},
              {title: 'email', field: 'email'},
              {title:"Phone Number", field:"Phone Number"},
              {title: 'Request', field: 'Request'}
            ]}

            data={userList}
            title="Registration Request"
          />
        </div>
      </div>
    )
  }
}

export default RegistrationRequests;
