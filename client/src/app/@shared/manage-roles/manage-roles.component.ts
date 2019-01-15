import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '@StoreService';
import {
  ColumnMetaData,
  ColumnType,
  DropDownColumn,
  Row,
  QueryOperation
} from '@types';
import { Store, DMLResponse, Response, Status } from '@types';
import { RolesTable } from './../tables/RolesTable';
import { CODE } from '@code';

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.scss']
})
export class ManageRolesComponent implements OnInit, OnDestroy {
  constructor(private storeService: StoreService) {}

  roleCategoryStore: Store = this.storeService.getInstance(
    'RoleCategory',
    'rolecategory',
    [],
    {
      autoQuery: true
    }
  );

  roleColumns: ColumnMetaData<RolesTable>[] = [
    {
      column: RolesTable.roleName,
      title: 'Role Name',
      type: ColumnType.STRING,
      required: true,
      inserAllowed: true,
      updateAllowed: true
    },
    {
      column: RolesTable.roleCode,
      title: 'Role Code',
      type: ColumnType.STRING,
      required: true,
      inserAllowed: true,
      updateAllowed: false
    },
    {
      column: RolesTable.roleCategory,
      title: 'Role Category',
      type: ColumnType.DROP_DOWN,
      required: true,
      inserAllowed: true,
      updateAllowed: true,
      dropDownConfiguration: {
        store: this.roleCategoryStore,
        displayColumn: 'categoryName',
        valueColumn: 'categoryName'
      }
    }
  ];

  rolesStore: Store = this.storeService.getInstance(
    'Roles',
    'roles',
    this.roleColumns,
    {
      autoQuery: true,
      inserAllowed: true,
      updateAllowed: true,
      deleteAllowed: true
    }
  );

  ngOnInit() {}
  ngOnDestroy() {
    this.rolesStore.destroy();
    this.roleCategoryStore.destroy();
  }
}
