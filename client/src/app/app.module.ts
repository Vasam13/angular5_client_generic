// Angular Core
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  BrowserModule,
  HammerGestureConfig,
  HAMMER_GESTURE_CONFIG
} from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { APIService } from '@APIService';
import { StoreService } from '@StoreService';
import { MessageModule } from './@pages/components/message/message.module';
import { MessageService } from './@pages/components/message/message.service';
import { CookieService } from 'ngx-cookie-service';
import { pgUploadModule } from './@pages/components/upload/upload.module';
import { CanDeactivateGuard } from './@core/can-deactivate.guard';

// Routing
import { AppRoutes } from './app.routing';
import { AppComponent } from './app.component';

// Layouts
import {
  CondensedComponent,
  RootLayout,
  BlankComponent
} from './@pages/layouts';
// Layout Service - Required
import { pagesToggleService } from './@pages/services/toggler.service';

// Shared Layout Components
import { SidebarComponent } from './@pages/components/sidebar/sidebar.component';
import { QuickviewComponent } from './@pages/components/quickview/quickview.component';
import { QuickviewService } from './@pages/components/quickview/quickview.service';
import { SearchOverlayComponent } from './@pages/components/search-overlay/search-overlay.component';
import { HeaderComponent } from './@pages/components/header/header.component';
import { HorizontalMenuComponent } from './@pages/components/horizontal-menu/horizontal-menu.component';
import { SharedModule } from './@pages/components/shared.module';
import { pgListViewModule } from './@pages/components/list-view/list-view.module';
import { pgCardModule } from './@pages/components/card/card.module';
import { pgCardSocialModule } from './@pages/components/card-social/card-social.module';
import { pgDatePickerModule } from './@pages/components/datepicker/datepicker.module';
import { pgSelectfx } from './@pages/components/cs-select/select.module';
import { pgSelectModule } from './@pages/components/select/select.module';
import { pgTagModule } from './@pages/components/tag/tag.module';

import { SalesComponent } from './@application/sales/sales.component';

// Basic Bootstrap Modules
import {
  BsDropdownModule,
  AccordionModule,
  AlertModule,
  ButtonsModule,
  CollapseModule,
  ModalModule,
  ProgressbarModule,
  TabsModule,
  TooltipModule,
  TypeaheadModule
} from 'ngx-bootstrap';

// Pages Globaly required Components - Optional
import { pgTabsModule } from './@pages/components/tabs/tabs.module';
import { pgSwitchModule } from './@pages/components/switch/switch.module';
import { ProgressModule } from './@pages/components/progress/progress.module';

// Thirdparty Components / Plugins - Optional
import { QuillModule } from 'ngx-quill';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { GridComponent } from './@core/components/grid/grid.component';

import { LoginComponent } from './@shared/login/login.component';
import { ManageUsersComponent } from './@shared/manage-users/manage-users.component';
import { ManageRolesComponent } from './@shared/manage-roles/manage-roles.component';
import { ClientsComponent } from './@application/clients/clients.component';
import { NewClientComponent } from './@application/new-client/new-client.component';
import { NewSaleComponent } from './@application/new-sale/new-sale.component';
import { SaleDetailsComponent } from './@application/sale-details/sale-details.component';
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

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

// Hammer Config Overide
// https://github.com/angular/angular/issues/10541
export class AppHammerConfig extends HammerGestureConfig {
  overrides = <any>{
    pinch: { enable: false },
    rotate: { enable: false }
  };
}

@NgModule({
  declarations: [
    AppComponent,
    CondensedComponent,
    BlankComponent,
    SidebarComponent,
    QuickviewComponent,
    SearchOverlayComponent,
    HeaderComponent,
    HorizontalMenuComponent,
    RootLayout,
    SalesComponent,
    LoginComponent,
    ManageUsersComponent,
    GridComponent,
    ManageRolesComponent,
    SalesComponent,
    ClientsComponent,
    NewClientComponent,
    NewSaleComponent,
    SaleDetailsComponent,
    PreferencesComponent,
    UnAuthorizedComponent,
    ProjectsComponent,
    NewProjectComponent,
    ContractDrawingsComponent,
    RfiComponent,
    CnnComponent,
    BfaComponent,
    TasksComponent,
    EmailActionsComponent,
    GlobalTemplatesComponent
  ],
  imports: [
    MessageModule,
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    HttpClientModule,
    SharedModule,
    ProgressModule,
    pgListViewModule,
    pgCardModule,
    pgCardSocialModule,
    RouterModule.forRoot(AppRoutes, { useHash: true }),
    BsDropdownModule.forRoot(),
    AccordionModule.forRoot(),
    AlertModule.forRoot(),
    ButtonsModule.forRoot(),
    CollapseModule.forRoot(),
    ModalModule.forRoot(),
    ProgressbarModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    pgTabsModule,
    PerfectScrollbarModule,
    pgSwitchModule,
    QuillModule,
    NgxDatatableModule,
    pgDatePickerModule,
    pgSelectfx,
    pgSelectModule,
    pgTagModule,
    pgUploadModule
  ],
  providers: [
    CanDeactivateGuard,
    QuickviewService,
    APIService,
    StoreService,
    CookieService,
    MessageService,
    pagesToggleService,
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: AppHammerConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
