import { States, Roles } from '@types';

export const AppStates: States = [
  {
    state: 'settings.preferences',
    url: '/settings/preferences',
    roleCodes: [Roles.ALL_USERS]
  },
  {
    state: 'settings.manage-users',
    isHome: 'Y',
    url: '/settings/manage-users',
    roleCodes: [Roles.ADMINISTRATOR],
    menu: {
      label: 'Manage Users',
      routerLink: '/settings/manage-users',
      iconType: 'icon',
      iconName: 'people'
    }
  },
  {
    state: 'settings.manage-roles',
    url: '/settings/manage-roles',
    roleCodes: [Roles.ADMINISTRATOR],
    menu: {
      label: 'Manage Roles',
      routerLink: '/settings/manage-roles',
      iconType: 'icon',
      iconName: 'organization'
    }
  },
  // {
  //   state: 'settings.email-actions',
  //   url: '/settings/email-actions',
  //   roleCodes: [Roles.ADMINISTRATOR],
  //   menu: {
  //     label: 'Email Actions',
  //     routerLink: '/settings/email-actions',
  //     iconType: 'icon',
  //     iconName: 'envelope'
  //   }
  // },
  {
    state: 'settings.global-templates',
    url: '/settings/global-templates',
    roleCodes: [Roles.ADMINISTRATOR],
    menu: {
      label: 'Templates',
      routerLink: '/settings/global-templates',
      iconType: 'icon',
      iconName: 'note'
    }
  },
  {
    state: 'sales',
    url: '/sales',
    isHome: 'Y',
    roleCodes: [
      Roles.SALES_MANAGER,
      Roles.SALES_PERSON,
      Roles.ESTIMATION_MANAGER,
      Roles.ESTIMATOR
    ],
    menu: {
      routerLink: '/sales',
      label: 'Sales',
      details: 'View sales data',
      iconType: 'icon',
      iconName: 'chart'
    }
  },
  {
    state: 'sales.new',
    url: '/sales/new',
    roleCodes: [Roles.SALES_MANAGER, Roles.SALES_PERSON]
  },
  {
    state: 'sales.id',
    url: '/sales/id',
    roleCodes: [
      Roles.SALES_MANAGER,
      Roles.SALES_PERSON,
      Roles.ESTIMATION_MANAGER,
      Roles.ESTIMATOR
    ]
  },
  {
    state: 'clients',
    url: '/clients',
    roleCodes: [Roles.SALES_MANAGER, Roles.SALES_PERSON],
    menu: {
      label: 'Clients',
      details: 'Manage clients',
      routerLink: '/clients',
      iconType: 'icon',
      iconName: 'people'
    }
  },
  {
    state: 'clients.:id',
    url: '/clients/id',
    roleCodes: [Roles.SALES_MANAGER, Roles.SALES_PERSON]
  }
];
