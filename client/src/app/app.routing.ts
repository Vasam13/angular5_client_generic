import { CanDeactivateGuard } from './@core/can-deactivate.guard';
import { Routes } from '@angular/router';
// Layouts
import { CondensedComponent } from './@pages/layouts';
import { BlankComponent } from './@pages/layouts';

// Shared Routes
import { LoginComponent } from './@shared/login/login.component';
import { ManageUsersComponent } from './@shared/manage-users/manage-users.component';
import { ManageRolesComponent } from './@shared/manage-roles/manage-roles.component';

// Application Routes
import { SalesComponent } from './@application/sales/sales.component';
import { NewSaleComponent } from './@application/new-sale/new-sale.component';
import { SaleDetailsComponent } from './@application/sale-details/sale-details.component';
import { ClientsComponent } from './@application/clients/clients.component';
import { NewClientComponent } from './@application/new-client/new-client.component';
import { PreferencesComponent } from './@shared/preferences/preferences.component';
import { UnAuthorizedComponent } from './@shared/un-authorized/un-authorized.component';
import { ProjectsComponent } from './@application/projects/projects.component';
import { NewProjectComponent } from './@application/new-project/new-project.component';
import { ContractDrawingsComponent } from './@application/contract-drawings/contract-drawings.component';
import { RfiComponent } from './@application/rfi/rfi.component';
import { CnnComponent } from './@application/cnn/cnn.component';
import { BfaComponent } from './@application/bfa/bfa.component';
import { TasksComponent } from './@application/tasks/tasks.component';
import { EmailActionsComponent } from './@shared/email-actions/email-actions.component';
import { GlobalTemplatesComponent } from './@shared/global-templates/global-templates.component';

export const AppRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    data: { state: '/' },
    component: CondensedComponent
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent
      }
    ]
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'restricted',
        component: UnAuthorizedComponent
      }
    ]
  },
  {
    path: 'settings',
    component: CondensedComponent,
    children: [
      {
        path: 'preferences',
        component: PreferencesComponent,
        data: { state: 'settings.preferences' }
      }
    ]
  },
  {
    path: 'settings',
    component: CondensedComponent,
    children: [
      {
        path: 'manage-users',
        component: ManageUsersComponent,
        data: { state: 'settings.manage-users' }
      }
    ]
  },
  {
    path: 'settings',
    component: CondensedComponent,
    children: [
      {
        path: 'manage-roles',
        component: ManageRolesComponent,
        data: { state: 'settings.manage-roles' }
      }
    ]
  },
  // {
  //   path: 'settings',
  //   component: CondensedComponent,
  //   children: [
  //     {
  //       path: 'email-actions',
  //       component: EmailActionsComponent,
  //       data: { state: 'settings.email-actions' }
  //     }
  //   ]
  // },
  {
    path: 'settings',
    component: CondensedComponent,
    children: [
      {
        path: 'global-templates',
        component: GlobalTemplatesComponent,
        data: { state: 'settings.global-templates' }
      }
    ]
  },
  {
    path: 'sales',
    component: CondensedComponent,
    children: [
      {
        path: '',
        component: SalesComponent,
        data: { state: 'sales' }
      }
    ]
  },
  {
    path: 'sales',
    component: CondensedComponent,
    children: [
      {
        path: 'new',
        component: NewSaleComponent,
        data: { state: 'sales.new' },
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  },
  {
    path: 'sales',
    component: CondensedComponent,
    children: [
      {
        path: ':id',
        component: SaleDetailsComponent,
        data: { state: 'sales.id' },
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  },
  {
    path: 'clients',
    component: CondensedComponent,
    children: [
      {
        path: '',
        component: ClientsComponent,
        data: { state: 'clients' }
      }
    ]
  },
  {
    path: 'clients',
    component: CondensedComponent,
    children: [
      {
        path: ':id',
        component: NewClientComponent,
        data: { state: 'clients.:id' },
        canDeactivate: [CanDeactivateGuard]
      }
    ]
  },
  {
    path: 'projects',
    component: CondensedComponent,
    children: [
      {
        path: '',
        component: ProjectsComponent,
        data: { state: 'projects' }
      }
    ]
  },
  {
    path: 'projects',
    component: CondensedComponent,
    children: [
      {
        path: 'details/:id',
        component: NewProjectComponent,
        data: { state: 'projects/details/id' }
      }
    ]
  },
  {
    path: 'projects',
    component: CondensedComponent,
    children: [
      {
        path: 'contract-drawings',
        component: ContractDrawingsComponent,
        data: { state: 'projects.contract-drawings' }
      }
    ]
  },
  {
    path: 'projects',
    component: CondensedComponent,
    children: [
      {
        path: 'rfi',
        component: RfiComponent,
        data: { state: 'projects.rfi' }
      }
    ]
  },
  {
    path: 'projects',
    component: CondensedComponent,
    children: [
      {
        path: 'cnn',
        component: CnnComponent,
        data: { state: 'projects.cnn' }
      }
    ]
  },
  {
    path: 'projects',
    component: CondensedComponent,
    children: [
      {
        path: 'bfa',
        component: BfaComponent,
        data: { state: 'projects.bfa' }
      }
    ]
  },
  {
    path: 'projects',
    component: CondensedComponent,
    children: [
      {
        path: 'tasks',
        component: TasksComponent,
        data: { state: 'projects.tasks' }
      }
    ]
  }
];
