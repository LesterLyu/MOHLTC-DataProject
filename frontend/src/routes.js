import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Dashboard = React.lazy(() => import('./views/Dashboard'));

const Profile = React.lazy(() => import('./views/Profile/Profile'));

const userRequest = React.lazy(() => import("./views/Users/RegistrationRequests"));
const addOrganization = React.lazy(() => import("./views/Users/AddOrganization"));

const Users = React.lazy(() => import('./views/Users/Users'));
const User = React.lazy(() => import('./views/Users/User'));
const Workbooks = React.lazy(() => import('./views/Workbooks/Workbooks'));


const AttCat = React.lazy(() => import('./views/AttCat/AttCat'));
const CreateExcel = React.lazy(() => import('./views/Excel/CreateExcel'));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  {path: '/', exact: true, name: 'Home', component: DefaultLayout},
  {path: '/dashboard', name: 'Dashboard', component: Dashboard},

  {path: "/profile", exact:true, name:"My Profile", component:Profile},

  {path: "/registrationRequest", exact:true, name:"Registration Request", component:userRequest},
  {path: "/addOrganization", exact:true, name:"Add Organization", component:addOrganization},

  {path: '/users', exact: true, name: 'Users', component: Users},
  {path: '/users/:id', exact: true, name: 'User Details', component: User},
  {path: '/workbooks/fill', exact: true, name: 'Workbooks', component: Workbooks, params: {mode: 'user'}},
  {path: '/workbooks/fill/:name', exact: true, name: 'Fill Workbook', component: CreateExcel, params: {mode: 'user edit'}},
  {path: '/workbooks/template', exact: true, name: 'Workbooks', component: Workbooks, params: {mode: 'admin'}},

  {path: '/workbooks/template/:name/', exact: true, name: 'Edit Workbook', component: CreateExcel, params: {mode: 'admin edit'}},
  {path: '/workbooks/create', exact: true, name: 'Create Workbook', component: CreateExcel, params: {mode: 'admin create'}},


  {path: '/workbooks/attributes', exact: true, name: 'Attributes', component: AttCat, params: {mode: 'att'}},
  {path: '/workbooks/categories', exact: true, name: 'Categories', component: AttCat, params: {mode: 'cat'}},
];

export default routes;
