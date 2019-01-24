import { Router } from '@angular/router';
import { ColumnMetaData, ColumnType, Status } from '@types';
import { StoreService } from '@StoreService';
import { Store } from '@types';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-manage-employees',
  templateUrl: './manage-employees.component.html',
  styleUrls: ['./manage-employees.component.scss']
})
export class ManageEmployeesComponent implements OnInit, OnDestroy {
  filter: string;
  employeeStore: Store;
  managerStore = this.storeService.getInstance('users', 'managers', [], {
    selectParams: ['userId', 'employeeNo', 'displayName']
  });

  constructor(private storeService: StoreService, private router: Router) {}

  ngOnInit() {
    this.employeeStore = this.storeService.getInstance(
      'users',
      'employees',
      this.getEmployeeColumnMD(),
      {
        whereClause: 'deleted = ? or deleted is null',
        whereClauseParams: ['N']
      }
    );
    this.employeeStore.query().then(response => {
      if (response.status === Status.SUCCESS && response.rows.length > 0) {
        this.managerStore.rows = response.rows;
      }
    });
  }

  ngOnDestroy() {
    this.employeeStore.destroy();
    this.managerStore.destroy();
  }

  private getEmployeeColumnMD = (): ColumnMetaData<void>[] => {
    return [
      {
        column: 'employeeNo',
        title: 'Employee No',
        type: ColumnType.LINK,
        linkConfiguration: {
          onClick: (row, md) => {
            this.router.navigate(['/settings/employee/' + row.userId]);
          }
        }
      },
      {
        column: 'displayName',
        title: 'Employee Name',
        type: ColumnType.STRING
      },
      {
        column: 'emailAddress',
        title: 'Email Address',
        type: ColumnType.STRING
      },
      {
        column: 'mobile',
        title: 'Mobile',
        type: ColumnType.STRING
      },
      {
        column: 'title',
        title: 'Title',
        type: ColumnType.STRING
      },
      {
        column: 'managerNo',
        title: 'Manager No',
        type: ColumnType.STRING
      },
      {
        column: 'managerNo',
        title: 'Manager',
        type: ColumnType.DROP_DOWN,
        dropDownConfiguration: {
          store: this.managerStore,
          displayColumn: 'displayName',
          valueColumn: 'employeeNo'
        }
      },
      // {
      //   column: 'managerName',
      //   title: 'Manager',
      //   type: ColumnType.STRING
      // },
      {
        column: 'leftOrg',
        title: 'Left Org',
        type: ColumnType.STRING
      }
    ];
  }
}
