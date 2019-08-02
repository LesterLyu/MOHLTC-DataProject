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
      name: 'Fill Workbook',
      url: '/workbooks/fill',
      icon: 'mdi mdi-pen',
      badge: {
        variant: 'info',
        text: '✓',
      },
    },

    {
      title: true,
      name: 'System',
    },
    {
      name: 'Workbooks',
      icon: 'mdi mdi-checkbook',
      children: [
        {
          name: 'All Workbooks',
          url: '/workbooks/template',
          icon: 'mdi mdi-book-multiple',
          badge: {
            variant: 'info',
            text: '✓',
          },
        },
        {
          name: 'Create Workbook',
          url: '/workbooks/create',
          icon: 'mdi mdi-folder-plus-outline',
        },
        {
          name: 'Attributes',
          url: '/workbooks/attributes',
          icon: 'mdi mdi-checkbook',
        },
        {
          name: 'Categories',
          url: '/workbooks/categories',
          icon: 'mdi mdi-checkbook',
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
          name: 'Add Organization',
          url: '/addOrganization',
          icon: 'mdi mdi-playlist-check',
        },
      ]
    },
    {
      name: 'Package',
      icon: 'mdi mdi-package-variant',
      children: [
        {
          name: 'Create Package',
          url: '/package/create',
          icon: 'mdi mdi-shape-square-plus',
        },
      ]
    },
    {
      name: 'Server',
      icon: 'mdi mdi-server',
      children: [
        {
          name: 'Server Info',
          url: '/system',
          icon: 'mdi mdi-information',
        },
        {
          name: 'Configuration',
          url: '/rergr3',
          icon: 'mdi mdi-account',
        },
        {
          name: 'Last Auto-test Report',
          url: config.server + '/test/mochawesome.html',
          icon: 'mdi mdi-alert-octagon',
          attributes: {target: '_blank'}
        },
      ]
    },
    {
      name: 'Test',
      url: '/workbooks/template2/2018-19%20CAPS%20LHIN%20Managed%20BLANK%20V1.xlsm',
      icon: 'mdi mdi-account',
    },
    {
      name: 'Update History',
      url: 'https://github.com/LesterLyu/MOHLTC-DataProject/blob/dev-lester/documents/update-history.md',
      icon: 'icon-cloud-download',
      class: 'mt-auto',
      attributes: {target: '_blank', rel: "noopener"},
    },
  ],

};
