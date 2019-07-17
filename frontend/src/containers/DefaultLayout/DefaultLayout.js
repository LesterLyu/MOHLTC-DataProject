import React, {Component, Suspense} from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Container} from '@material-ui/core'

import {
  AppHeader,
  AppSidebar,
  AppSidebarFooter,
  AppSidebarForm,
  AppSidebarHeader,
  AppSidebarMinimizer,
  AppSidebarNav,
} from '@coreui/react';
// sidebar nav config
import navigation from '../../_nav';
// routes config
import routes from '../../routes';
import UserManager from "../../controller/userManager";
import CustomSnackbarContent from "../../views/AttCat/components/CustomSnackbarContent";
import {Snackbar} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import AppBreadcrumb from '../AppBreadcrumb';

const DefaultHeader = React.lazy(() => import('./DefaultHeader'));

const styles = {
  container: {
    paddingLeft: 12,
    paddingRight: 12,
  },
  main: {
    backgroundColor: '#f3f4fd'
  }
};

class DefaultLayout extends Component {

  constructor(props) {
    super(props);
    this.user = new UserManager(props, this.showMessage);
    this.user.isLoggedIn()
      .then(IsSignedIn => {
        if (!IsSignedIn) {
          this.user.lastUrl = window.location.hash.replace('#', '');
          props.history.push('/login');
        }
      })
      .catch(err => this.showMessage(err.message + ': Cannot reach backend server', 'error'));
    // for snackbar
    this.queue = [];
    this.state = {
      openSnackbar: false, messageInfo: {}
    };
  }

  componentDidMount() {
    // go to the page before login
    if (this.user.lastUrl) {
      this.props.history.push(this.user.lastUrl);
      this.user.lastUrl = null;
    }
  }

  loading = () => <div className="animated fadeIn pt-1 text-center">Loading...</div>

  signOut(e) {
    e.preventDefault();
    this.user.logout();
  }

  /**
   * Snackbar methods
   * @param message
   * @param {'success'|'error'|'info'|'warning'} variant
   */
  showMessage = (message, variant) => {
    this.queue.push({
      message,
      variant,
      key: new Date().getTime(),
    });

    if (this.state.openSnackbar) {
      // immediately begin dismissing current message
      // to start showing new one
      this.setState({openSnackbar: false});
    } else {
      this.processQueue();
    }
  };

  processQueue = () => {
    if (this.queue.length > 0) {
      this.setState({
        messageInfo: this.queue.shift(),
        openSnackbar: true,
      });
    }
  };

  handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({openSnackbar: false});
  };

  handleExitedSnackbar = () => {
    this.processQueue();
  };

  render() {
    const {classes} = this.props;
    return (
      <div className="app">
        <AppHeader fixed>
          <Suspense fallback={this.loading()}>
            <DefaultHeader onLogout={e => this.signOut(e)}/>
          </Suspense>
        </AppHeader>
        <div className="app-body">
          <AppSidebar fixed display="lg">
            <AppSidebarHeader/>
            <AppSidebarForm/>
            <Suspense>
              <AppSidebarNav navConfig={navigation} {...this.props} />
            </Suspense>
            <AppSidebarFooter/>
            <AppSidebarMinimizer/>
          </AppSidebar>
          <div className={classes.main + ' main'}>
            <AppBreadcrumb appRoutes={routes}/>
            <Container maxWidth="xl" className={classes.container}>
              <Suspense fallback={this.loading()}>
                <Switch>
                  {routes.map((route, idx) => {
                    return route.component ? (
                      <Route
                        key={idx}
                        path={route.path}
                        exact={route.exact}
                        name={route.name}
                        render={props => (
                          <route.component showMessage={this.showMessage}
                                           params={route.params ? route.params : {}} {...props} />
                        )}/>
                    ) : (null);
                  })}
                  <Redirect from="/" to="/profile"/>
                </Switch>
              </Suspense>
            </Container>
          </div>
        </div>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.openSnackbar}
          autoHideDuration={6000}
          onClose={this.handleCloseSnackbar}
          onExited={this.handleExitedSnackbar}
        >
          <CustomSnackbarContent
            onClose={this.handleCloseSnackbar}
            variant={this.state.messageInfo.variant}
            message={this.state.messageInfo.message}
          />
        </Snackbar>
      </div>
    );
  }
}

export default withStyles(styles)(DefaultLayout);
