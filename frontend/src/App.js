import React, {Component, Suspense} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Loading from './views/components/Loading';
import './App.scss';

import {createMuiTheme} from "@material-ui/core/styles";
import {ThemeProvider} from "@material-ui/styles";
import {blue} from '@material-ui/core/colors';

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
});


// Containers
const DefaultLayout = React.lazy(() => import('./containers/DefaultLayout' /* webpackChunkName: "defaultLayout" */));

// Pages
const Login = React.lazy(() => import('./views/Pages/Login' /* webpackChunkName: "login" */));

const Register = React.lazy(() => import('./views/Pages/Register' /* webpackChunkName: "register" */));

const ForgetPassword = React.lazy(() => import('./views/Pages/ForgetPassword' /* webpackChunkName: "forgetPassword" */),);

const Page404 = React.lazy(() => import('./views/Pages/Page404' /* webpackChunkName: "404" */),);

const Page500 = React.lazy(() => import('./views/Pages/Page500' /* webpackChunkName: "500" */));

class App extends Component {

  render() {
    return (
      <ThemeProvider theme={theme}>
        <Suspense fallback={<Loading/>}>
          <HashRouter>
            <Switch>
              <Route exact path="/login" name="Login Page" component={Login}/>
              <Route exact path="/register" name="Register Page"
                     render={props => <Register params={{mode: 'reg'}} {...props}/>}/>
              <Route exact path="/setup" name="Setup Page"
                     render={props => <Register params={{mode: 'setup'}} {...props}/>}/>
              <Route exact path="/forgetpassword" name="Reset Password Page" component={ForgetPassword}/>
              <Route exact path="/404" name="Page 404" component={Page404}/>
              <Route exact path="/500" name="Page 500" component={Page500}/>
              <Route path="/" name="Home" component={DefaultLayout}/>
            </Switch>
          </HashRouter>
        </Suspense>
      </ThemeProvider>
    );
  }
}

export default App;
