import { Router } from '@angular/router';
import { ColumnMetaData, ColumnType } from '@types';
import { StoreService } from '@StoreService';
import { Store } from '@types';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-manage-employees',
  templateUrl: './manage-employees.component.html',
  styleUrls: ['./manage-employees.component.scss']
})
export class ManageEmployeesComponent implements OnInit, OnDestroy {
  employeeStore: Store;

  constructor(private storeService: StoreService, private router: Router) {}

  ngOnInit() {
    this.employeeStore = this.storeService.getInstance(
      'users',
      'employees',
      this.getEmployeeColumnMD(),
      {
        autoQuery: true,
        whereClause: 'deleted = ? or deleted is null',
        whereClauseParams: ['N']
      }
    );
  }

  ngOnDestroy() {
    this.employeeStore.destroy();
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
        column: 'managerName',
        title: 'Manager',
        type: ColumnType.STRING
      },
      {
        column: 'leftOrg',
        title: 'Left Org',
        type: ColumnType.STRING
      }
    ];
  }
}
