import React, {Component} from 'react';
import {Route, matchPath} from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {emphasize, withStyles} from '@material-ui/core/styles';
import {Breadcrumbs as Breadcrumb, Chip, Paper} from '@material-ui/core';
import {NavigateNext as NavigateNextIcon} from '@material-ui/icons';

let routes;

const StyledBreadcrumbItem = withStyles(theme => ({
  root: {
    backgroundColor: theme.palette.grey[100],
    height: 24,
    color: theme.palette.grey[600],
    fontWeight: theme.typography.fontWeightRegular,
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[300],
      cursor: 'pointer',
    },
    '&:active': {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(theme.palette.grey[300], 0.12),
    },
  },
}))(Chip);

const StyledBreadcrumb = withStyles(() => ({
  separator: {
    margin: 0,
  }
}))(Breadcrumb);

const StyledPaper = withStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    marginBottom: 12
  }
}))(Paper);

const getPaths = (pathname) => {
  const paths = ['/'];

  if (pathname === '/') return paths;

  pathname.split('/').reduce((prev, curr) => {
    const currPath = `${prev}/${curr}`;
    paths.push(currPath);
    return currPath;
  });
  return paths;
};

const findRouteName = (url) => {
  const aroute = routes.find(route => matchPath(url, {path: route.path, exact: route.exact}));
  return (aroute && aroute.name) ? aroute.name : null
};

const BreadcrumbsItem = (url, isLast) => {
  const routeName = findRouteName(url);
  if (routeName) {
    return (
      isLast ?
        <StyledBreadcrumbItem
          key={url}
          label={routeName}
          style={{cursor: 'initial', color: '#111'}}
        />
        :
        <StyledBreadcrumbItem
          key={url}
          component="a"
          href={'#' + url || ''}
          label={routeName}
        />
    );
  }
  return null;
};

const Breadcrumbs = (args) => {
  const paths = getPaths(args.location.pathname);
  let items = paths.map((path, i) => BreadcrumbsItem(path, i === paths.length - 1));
  items = items.filter(item => item);
  return (
    <StyledPaper>
      <StyledBreadcrumb separator={<NavigateNextIcon fontSize="small"/>} aria-label="Breadcrumb">
        {items}
      </StyledBreadcrumb>
    </StyledPaper>
  );
};

const propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  appRoutes: PropTypes.any,
  tag: PropTypes.oneOfType([PropTypes.func, PropTypes.string])
};

const defaultProps = {
  tag: 'div',
  className: '',
  appRoutes: [{path: '/', exact: true, name: 'Home', component: null}]
};

class AppBreadcrumb extends Component {
  constructor(props) {
    super(props);

    this.state = {routes: props.appRoutes};
    routes = this.state.routes;
  }

  render() {
    const {className, tag: Tag, ...attributes} = this.props;

    delete attributes.children;
    delete attributes.appRoutes;

    const classes = classNames(className);

    return (
      <Tag className={classes}>
        <Route path="/:path" component={Breadcrumbs} {...attributes} />
      </Tag>
    );
  }
}

AppBreadcrumb.propTypes = propTypes;
AppBreadcrumb.defaultProps = defaultProps;

export default AppBreadcrumb;
