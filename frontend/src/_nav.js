import config from "./config/config";

export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'mdi mdi-view-dashboard',
      badge: {
        variant: 'info',
        // text: 'NEW',
      },
    },
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
          name: 'Query',
          url: '/5fghfgh',
          icon: 'mdi mdi-magnify',
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
      name: 'Server',
      icon: 'mdi mdi-server',
      children: [
        {
          name: 'Server Info',
          url: '/3rgerg',
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
      attributes: { target: '_blank', rel: "noopener" },
    },
  ],

};
