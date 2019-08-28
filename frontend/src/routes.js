import React from 'react';
import DefaultLayout from './containers/DefaultLayout';

const Profile = React.lazy(() => import('./views/Profile/Profile' /* webpackChunkName: "profile" */));

const userRequest = React.lazy(() => import("./views/Users/RegistrationRequests" /* webpackChunkName: "registration-requests" */));

const Users = React.lazy(() => import('./views/Users/Users' /* webpackChunkName: "users" */));
const Workbooks = React.lazy(() => import('./views/Workbooks/Workbooks' /* webpackChunkName: "workbooks" */));


const AttCat = React.lazy(() => import('./views/AttCat/AttCat' /* webpackChunkName: "attCat" */));
const AttCatGroup = React.lazy(() => import('./views/AttCat/Group' /* webpackChunkName: "attCatGroup" */));
const Excel = React.lazy(() => import('./views/Excel/Excel'/* webpackChunkName: "excel" */));

const SystemInfo = React.lazy(() => import('./views/System' /* webpackChunkName: "systemInfo" */));
const ImportId = React.lazy(() => import('./views/Tools/Import' /* webpackChunkName: "importId" */));

const CreatePackage = React.lazy(() => import('./views/Package/Create' /* webpackChunkName: "createPackage" */));
const EditPackage = React.lazy(() => import('./views/Package/Edit' /* webpackChunkName: "EditPackage" */));
const Packages = React.lazy(() => import('./views/Package/Packages' /* webpackChunkName: "Packages" */));
const PackageView = React.lazy(() => import('./views/Package/PackageView' /* webpackChunkName: "PackageView" */));

const GroupName = React.lazy(() => import('./views/System/GroupName' /* webpackChunkName: "GroupName" */));
const Organizations = React.lazy(() => import('./views/System/Organizations' /* webpackChunkName: "Organizations" */));
const OrganizationTypes = React.lazy(() => import('./views/System/OrganizationTypes' /* webpackChunkName: "OrganizationTypes" */));

// https://github.com/ReactTraining/react-router/tree/master/packages/react-router-config
const routes = [
  {path: '/', exact: true, name: 'Home', component: DefaultLayout},

  {path: "/profile", exact:true, name:"My Profile", component:Profile},

  {path: "/registrationRequest", exact:true, name:"Registration Request", component:userRequest},

  {path: '/users', exact: true, name: 'Users', component: Users},
  {path: '/workbooks/fill', exact: true, name: 'Workbooks', component: Workbooks, params: {mode: 'user'}},
  {path: '/workbooks/fill/:name', exact: true, name: 'Fill Workbook', component: Excel, params: {mode: 'user edit'}},
  {path: '/workbooks/template', exact: true, name: 'Workbooks', component: Workbooks, params: {mode: 'admin'}},

  {path: '/workbooks/template/:name/', exact: true, name: 'Edit Workbook', component: Excel, params: {mode: 'admin edit'}},
  {path: '/workbooks/create', exact: true, name: 'Create Workbook', component: Excel, params: {mode: 'admin create'}},
  {path: '/admin/packages/:packageName/:organizationName/:workbookName', exact: true, name: 'View Workbook', component: Excel,  params: {mode: 'admin view'}},

  {path: '/workbooks/attributes', exact: true, name: 'Attributes', component: AttCat, params: {mode: 'att'}},
  {path: '/workbooks/categories', exact: true, name: 'Categories', component: AttCat, params: {mode: 'cat'}},

  {path: '/attribute/group', exact: true, name: 'Attribute Group', component: AttCatGroup, params: {mode: 'att'}},
  {path: '/category/group', exact: true, name: 'Category Group', component: AttCatGroup, params: {mode: 'cat'}},

  {path: '/system', exact: true, name: 'System Info', component: SystemInfo},
  {path: '/import/id', exact: true, name: 'Import ID', component: ImportId},

  {path: '/admin/packages/create', exact: true, name: 'Create Package', component: CreatePackage},
  {path: '/admin/packages/edit/:name', exact: true, name: 'Edit Package', component: EditPackage},
  {path: '/admin/packages', exact: true, name: 'All Packages', component: Packages,  params: {mode: 'admin'}},
  {path: '/packages', exact: true, name: 'My Packages', component: Packages,  params: {mode: 'user'}},

  {path: '/admin/packages/view/:name/:organization', exact: true, name: 'View Package', component: PackageView,  params: {mode: 'admin'}},
  {path: '/packages/:name', exact: true, name: 'View Package', component: PackageView,  params: {mode: 'user'}},

  {path: '/packages/:packageName/:name', exact: true, name: 'View Workbook', component: Excel,  params: {mode: 'user'}},

  {path: '/admin/group', exact: true, name: 'Set Group Name', component: GroupName},
  {path: '/admin/organizations', exact: true, name: 'Organizations', component: Organizations},
  {path: '/admin/orgtypes', exact: true, name: 'Organizations types', component: OrganizationTypes},
];

export default routes;
