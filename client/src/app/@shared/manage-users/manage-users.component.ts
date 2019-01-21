import {
  LinkConfiguration,
  Row,
  Status,
  Response,
  QueryOperation
} from '@types';
import { CODE } from '@code';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { StoreService } from '@StoreService';
import {
  ColumnMetaData,
  ColumnType,
  DropDownColumn,
  Store,
  DMLResponse
} from '@types';
import { MessageService } from '@message';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { UsersTable } from './../tables/UsersTable';
import { RolesTable } from '../tables/RolesTable';
import { UserRolesTable } from '../tables/UserRolesTable';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.scss']
})
export class ManageUsersComponent implements OnInit, OnDestroy {
  constructor(private storeService: StoreService) {}
  @ViewChild('rolesModal')
  rolesModal: ModalDirective;
  @ViewChild('popupModal')
  popupModal: ModalDirective;
  @ViewChild('popupPassRessted')
  popupPassRessted: ModalDirective;

  usersStore: Store;
  userRolesStore: Store;
  rolesDropDownStore: Store;
  currentRow: Row;

  currentUser: string;
  currentEmail: string;
  currentPassword: string;
  showRoles = true;

  openRoles = (row: Row, columnMd: ColumnMetaData<RolesTable>) => {
    this.rolesModal.show();
    this.currentRow = row;
    this.userRolesStore.whereClauseParams = [row.userId];
    this.userRolesStore.query();
    this.rolesModal.onShow.subscribe(value => {
      this.showRoles = true;
    });
    this.rolesModal.onHidden.subscribe(value => {
      this.showRoles = false;
    });
  }

  resetPassword = (row: Row, columnMd: ColumnMetaData<RolesTable>) => {
    row.$actionParams$ = { resetPassword: 'Y' };
    row.$operation$ = QueryOperation.UPDATE;
    this.usersStore.saveRows([row]);
  }

  deleteUser() {
    const row = this.usersStore.getCurrentRow();
    row.deleted = 'Y';
    row.$operation$ = QueryOperation.UPDATE;
    this.usersStore.saveRows([row]);
  }

  ngOnInit() {
    this.usersStore = this.storeService.getInstance(
      'Users',
      'users',
      this.getUsersColumnsMd(),
      {
        autoQuery: true,
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true,
        whereClause: 'deleted <> ? or deleted is null',
        whereClauseParams: ['Y']
      }
    );
    this.usersStore.afterSave = (res: DMLResponse) => {
      if (res && res.rows && res.rows.length > 0) {
        const userAdded = false;
        res.rows.forEach(row => {
          if (row.$operation$ === QueryOperation.INSERT) {
            this.currentUser = row.userName;
            this.currentEmail = row.emailAddress;
            this.currentPassword = row.password;
            this.popupModal.show();
          }
          if (row.$operation$ === QueryOperation.UPDATE) {
            if (
              row.$actionParams$ &&
              (row.$actionParams$.resetPassword = 'Y') &&
              row.password
            ) {
              this.currentUser = row.userName;
              this.currentEmail = row.emailAddress;
              this.popupPassRessted.show();
            }
          }
        });
      }
    };
    this.rolesDropDownStore = this.storeService.getInstance(
      'Roles',
      'roles',
      [],
      {
        autoQuery: true
      }
    );
    this.userRolesStore = this.storeService.getInstance(
      'UserRoles',
      'userroles',
      this.getUserRolesColumnsMd(),
      {
        inserAllowed: true,
        updateAllowed: true,
        deleteAllowed: true,
        whereClause: 'user_id = ?'
      }
    );

    this.userRolesStore.beforeSave = (dirtyRows: Row[]) => {
      const user = this.currentRow;
      const response: Response = {
        status: Status.SUCCESS,
        responseCode: CODE.ERR_BERORE_DML,
        message: ''
      };
      for (let i = 0; i < dirtyRows.length; i++) {
        const dirtyRow = dirtyRows[i];
        if (dirtyRow.$operation$ !== QueryOperation.DELETE) {
          if (user && user.userId && dirtyRow.roleId) {
            dirtyRows[i].userId = user.userId;
          } else {
            response.status = Status.ERROR;
            response.message = 'Please save/select user first';
            break;
          }
        }
      }
      return response;
    };
  }
  ngOnDestroy() {
    this.usersStore.destroy();
    this.userRolesStore.destroy();
    this.rolesDropDownStore.destroy();
  }

  getUserRolesColumnsMd = (): ColumnMetaData<UserRolesTable>[] => {
    return [
      {
        column: UserRolesTable.roleId,
        title: 'Role',
        type: ColumnType.DROP_DOWN,
        required: true,
        inserAllowed: true,
        updateAllowed: false,
        dropDownConfiguration: {
          store: this.rolesDropDownStore,
          displayColumn: 'roleName',
          valueColumn: 'roleId'
        }
      }
    ];
  }

  getUsersColumnsMd = (): ColumnMetaData<UsersTable>[] => {
    return [
      {
        column: UsersTable.userId,
        title: 'User Id',
        type: ColumnType.STRING,
        required: false,
        inserAllowed: false,
        updateAllowed: false
      },
      {
        column: UsersTable.userName,
        title: 'User Name',
        type: ColumnType.STRING,
        required: true,
        inserAllowed: true,
        updateAllowed: false
      },
      {
        column: UsersTable.displayName,
        title: 'Display Name',
        type: ColumnType.STRING,
        required: true,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: UsersTable.emailAddress,
        title: 'Email Address',
        type: ColumnType.STRING,
        required: true,
        inserAllowed: true,
        updateAllowed: true
      },
      {
        column: '',
        title: 'Reset Password',
        type: ColumnType.LINK,
        linkConfiguration: {
          text: 'Click Here',
          onClick: this.resetPassword
        },
        inserAllowed: false,
        updateAllowed: false,
        required: false
      },
      {
        column: UsersTable.createDate,
        title: 'Created On',
        type: ColumnType.DATE
      },
      {
        column: '',
        title: 'Roles',
        type: ColumnType.LINK,
        linkConfiguration: {
          icon: 'icon-organization',
          onClick: this.openRoles
        },
        inserAllowed: true,
        updateAllowed: false,
        required: false
      }
    ];
  }
}
