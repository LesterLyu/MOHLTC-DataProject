import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Dashboard = React.lazy(() => import('./views/Dashboard' /* webpackChunkName: "dashboard" */));

const Profile = React.lazy(() => import('./views/Profile/Profile' /* webpackChunkName: "profile" */));

const userRequest = React.lazy(() => import("./views/Users/RegistrationRequests" /* webpackChunkName: "registration-requests" */));
const addOrganization = React.lazy(() => import("./views/Users/AddOrganization" /* webpackChunkName: "add-organization" */));

const Users = React.lazy(() => import('./views/Users/Users' /* webpackChunkName: "users" */));
const Workbooks = React.lazy(() => import('./views/Workbooks/Workbooks' /* webpackChunkName: "workbooks" */));


const AttCat = React.lazy(() => import('./views/AttCat/AttCat' /* webpackChunkName: "attCat" */));
const AttCatGroup = React.lazy(() => import('./views/AttCat/Group' /* webpackChunkName: "attCatGroup" */));
const Excel = React.lazy(() => import('./views/Excel/Excel'/* webpackChunkName: "excel" */));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  {path: '/', exact: true, name: 'Home', component: DefaultLayout},
  {path: '/dashboard', name: 'Dashboard', component: Dashboard},

  {path: "/profile", exact:true, name:"My Profile", component:Profile},

  {path: "/registrationRequest", exact:true, name:"Registration Request", component:userRequest},
  {path: "/addOrganization", exact:true, name:"Add Organization", component:addOrganization},

  {path: '/users', exact: true, name: 'Users', component: Users},
  {path: '/workbooks/fill', exact: true, name: 'Workbooks', component: Workbooks, params: {mode: 'user'}},
  {path: '/workbooks/fill/:name', exact: true, name: 'Fill Workbook', component: Excel, params: {mode: 'user edit'}},
  {path: '/workbooks/template', exact: true, name: 'Workbooks', component: Workbooks, params: {mode: 'admin'}},

  {path: '/workbooks/template/:name/', exact: true, name: 'Edit Workbook', component: Excel, params: {mode: 'admin edit'}},
  {path: '/workbooks/create', exact: true, name: 'Create Workbook', component: Excel, params: {mode: 'admin create'}},

  {path: '/workbooks/attributes', exact: true, name: 'Attributes', component: AttCat, params: {mode: 'att'}},
  {path: '/workbooks/categories', exact: true, name: 'Categories', component: AttCat, params: {mode: 'cat'}},

  {path: '/attribute/group', exact: true, name: 'Attribute Group', component: AttCatGroup, params: {mode: 'att'}},
  {path: '/category/group', exact: true, name: 'Category Group', component: AttCatGroup, params: {mode: 'cat'}},
];

export default routes;
