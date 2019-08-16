import config from "./config/config";

export default {
  items: [
    {
      title: true,
      name: 'User',
    },

    {
      name: 'My Profile',
      url: '/profile',
      icon: 'mdi mdi-account-card-details-outline',
    },
    {
      name: 'My Packages',
      url: '/packages',
      icon: 'mdi mdi-pen',
    },

    {
      title: true,
      name: 'Admin',
    },
    {
      name: 'Template',
      icon: 'mdi mdi-note-multiple',
      children: [
        {
          name: 'All Templates',
          url: '/workbooks/template',
          icon: 'mdi mdi-table-large',
        },
        {
          name: 'Create Template',
          url: '/workbooks/create',
          icon: 'mdi mdi-table-large-plus',
        },
      ]
    },
    {
      name: 'Att & Cat',
      icon: 'mdi mdi-buffer',
      children: [
        {
          name: 'Attributes',
          url: '/workbooks/attributes',
          icon: 'mdi mdi-table-column',
        },
        {
          name: 'Categories',
          url: '/workbooks/categories',
          icon: 'mdi mdi-table-row',
        },
        {
          name: 'Attribute Group',
          url: '/attribute/group',
          icon: 'mdi mdi-checkbook',
        },
        {
          name: 'Category Group',
          url: '/category/group',
          icon: 'mdi mdi-checkbook',
        },
        {
          name: 'Import ID',
          url: '/import/id',
          icon: 'mdi mdi-application-import',
        },
      ]
    },
    {
      name: 'Users',
      icon: 'mdi mdi-account',
      children: [
        {
          name: 'All Users',
          url: '/users',
          icon: 'mdi mdi-account-multiple',
        },
        {
          name: 'Registration Requests',
          url: '/registrationRequest',
          icon: 'mdi mdi-account',
        },
        {
          name: 'Organizations',
          url: '/admin/organizations',
          icon: 'mdi mdi-account-group',
        },
        {
          name: 'Org Types',
          url: '/admin/orgtypes',
          icon: 'mdi mdi-account-network',
        },
      ]
    },
    {
      name: 'Package',
      icon: 'mdi mdi-package-variant',
      children: [
        {
          name: 'All Packages',
          url: '/admin/packages',
          icon: 'mdi mdi-package',
        },
        {
          name: 'Create Package',
          url: '/admin/packages/create',
          icon: 'mdi mdi-shape-square-plus',
        },
      ]
    },
    {
      name: 'System',
      icon: 'mdi mdi-settings',
      children: [
        {
          name: 'Group Name',
          url: '/admin/group',
          icon: 'mdi mdi-rename-box',
        },
        {
          name: 'Server Info',
          url: '/system',
          icon: 'mdi mdi-information',
        },
        {
          name: 'Last Auto-test Report',
          url: config.server + '/test/mochawesome.html',
          icon: 'mdi mdi-alert-octagon',
          variant: 'success',
          attributes: {target: '_blank'}
        },
      ]
    },
  ],

};
