import React, {Component} from 'react';
import {HashRouter, Route, Switch} from 'react-router-dom';
import Loading from './views/components/Loading';
import Loadable from 'react-loadable';
import './App.scss';

import {createMuiTheme} from "@material-ui/core/styles";
import {ThemeProvider} from "@material-ui/styles";
import {blue} from '@material-ui/core/colors';

const loading = () => <Loading/>;

const theme = createMuiTheme({
  palette: {
    primary: blue,
  },
});


// Containers
const DefaultLayout = Loadable({
  loader: () => import('./containers/DefaultLayout'),
  loading
});

// Pages
const Login = Loadable({
  loader: () => import('./views/Pages/Login'),
  loading
});

const Register = Loadable({
  loader: () => import('./views/Pages/Register'),
  loading
});

const ForgetPassword = Loadable({
  loader: () => import('./views/Pages/ForgetPassword'),
  loading
});

const Page404 = Loadable({
  loader: () => import('./views/Pages/Page404'),
  loading
});

const Page500 = Loadable({
  loader: () => import('./views/Pages/Page500'),
  loading
});

class App extends Component {

  render() {
    return (
      <ThemeProvider theme={theme}>
        <HashRouter>
          <Switch>
            <Route exact path="/login" name="Login Page" component={Login}/>
            <Route exact path="/register" name="Register Page" component={Register}/>
            <Route exact path="/forgetpassword" name="Reset Password Page" component={ForgetPassword}/>
            <Route exact path="/404" name="Page 404" component={Page404}/>
            <Route exact path="/500" name="Page 500" component={Page500}/>
            <Route path="/" name="Home" component={DefaultLayout}/>
          </Switch>
        </HashRouter>
      </ThemeProvider>
    );
  }
}

export default App;
