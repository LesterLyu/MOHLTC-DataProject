import config from "./config/config";

export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
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
      url: '/1',
      icon: 'icon-pencil',
    },
    {
      name: 'Fill Workbook',
      url: '/workbooks/fill',
      icon: 'icon-pencil',
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
      icon: 'icon-pencil',
      children: [
        {
          name: 'All Workbooks',
          url: '/workbooks/template',
          icon: 'icon-puzzle',
          badge: {
            variant: 'info',
            text: '✓',
          },
        },
        {
          name: 'Create Workbook',
          url: '/workbooks/create',
          icon: 'icon-puzzle',
        },
        {
          name: 'Attributes',
          url: '/workbooks/attributes',
          icon: 'icon-puzzle',
        },
        {
          name: 'Categories',
          url: '/workbooks/categories',
          icon: 'icon-puzzle',
        },
        {
          name: 'Query',
          url: '/5fghfgh',
          icon: 'icon-puzzle',
        },
      ]
    },
    {
      name: 'Users',
      icon: 'icon-pencil',
      children: [
        {
          name: 'All Users',
          url: '/users',
          icon: 'icon-puzzle',
        },
        {
          name: 'Registration Requests',
          url: '/registrationRequest',
          icon: 'icon-puzzle',
        },
        {
          name: 'Add Organization',
          url: '/addOrganization',
          icon: 'icon-puzzle',
        },
      ]
    },
    {
      name: 'Server',
      icon: 'icon-pencil',
      children: [
        {
          name: 'Server Info',
          url: '/3rgerg',
          icon: 'icon-puzzle',
        },
        {
          name: 'Configuration',
          url: '/rergr3',
          icon: 'icon-puzzle',
        },
        {
          name: 'Last Auto-test Report',
          url: config.server + '/test/mochawesome.html',
          icon: 'icon-puzzle',
          attributes: {target: '_blank'}
        },
      ]
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
