import {Utils} from '@utils';
import { Store, Status, LeadStatus, Roles } from '@types';
import { ColumnMetaData, ColumnType } from '@types';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '@StoreService';
import { Router, ActivatedRoute } from '@angular/router';
import ProjectsType from '../tables/types/ProjectsType';
import { ProjectsTable } from '../tables/ProjectsTable';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  constructor(private storeService: StoreService, private router: Router) {}
  projectsStore: Store;
  userStore: Store;
  filter;
  _canAddProject = false;

  canAddProject() {
    return this._canAddProject;
  }
  newProject() {
    this.router.navigate(['/projects/details/new']);
  }

  ngOnInit() {
    this._canAddProject = Utils.hasAnyRole([Roles.PROJECT_MANAGER]);
    this.userStore = this.storeService.getInstance('Users', 'users', [], {});
    this.projectsStore = this.storeService.getInstance(
      'Projects',
      'projects',
      this.getSalesColumnsMD(),
      {}
    );
    if (Utils.hasAnyRole([Roles.TEAM_LEAD])) {
      this.projectsStore.whereClause = 'create_User_Id = ? or lead_id = ?';
      this.projectsStore.whereClauseParams = [
        Utils.getUserId(),
        Utils.getUserId()
      ];
    }

    if (Utils.hasAnyRole([Roles.PROJECT_MANAGER])) {
    }

    if (
      (this.projectsStore.whereClause &&
        this.projectsStore.whereClauseParams) ||
      Utils.hasAnyRole([Roles.PROJECT_MANAGER])
    ) {
      this.projectsStore.query().then(res => {
        if (res.rows && res.rows.length > 0) {
          this.userStore.query();
        }
      });
    }
  }

  ngOnDestroy() {
    this.projectsStore.destroy();
    this.userStore.destroy();
  }

  gotoProject = row => {
    this.router.navigate(['/projects/details/' + row.projectId]);
  }

  getStatusHTML = (row: ProjectsType, md) => {
    let badge = 'default';
    if (Utils.hasAnyRole([Roles.PROJECT_MANAGER])) {
      if (
        row.status === LeadStatus.DRAFT ||
        row.status === LeadStatus.OPEN ||
        row.status === LeadStatus.REQUEST_FOR_QUOTATION
      ) {
        badge = 'warning';
      }
      if (row.status === LeadStatus.QUOTED) {
        badge = 'completed';
      }
    }
    return '<span class="badge badge-' + badge + '">' + row.status + '</span>';
  }

  getSalesColumnsMD = (): ColumnMetaData<ProjectsTable>[] => {
    return [
      {
        column: ProjectsTable.projectId,
        title: 'Project #',
        sortable: true,
        type: ColumnType.NUMBER
      },
      {
        column: ProjectsTable.projectName,
        title: 'Project Name',
        type: ColumnType.STRING,
        sortable: true
      },
      {
        column: ProjectsTable.clientHours,
        title: 'Client Hours',
        type: ColumnType.STRING,
        sortable: true
      },
      {
        column: ProjectsTable.complexity,
        title: 'Complexity',
        type: ColumnType.STRING,
        sortable: true
      },
      {
        column: ProjectsTable.receivedDate,
        title: 'Received Date',
        type: ColumnType.DATE,
        sortable: true
      },
      {
        column: ProjectsTable.targetedOfaDate,
        title: 'Target Date',
        type: ColumnType.DATE,
        sortable: true
      },
      {
        column: ProjectsTable.assignedTo,
        title: 'Assigned To',
        sortable: true,
        type: ColumnType.DROP_DOWN,
        dropDownConfiguration: {
          store: this.userStore,
          displayColumn: 'displayName',
          valueColumn: 'userId'
        }
      },
      {
        column: ProjectsTable.status,
        title: 'Status',
        sortable: true,
        type: ColumnType.TEMPLETE,
        templateConfiguration: {
          getHTML: (row, md) => {
            return this.getStatusHTML(row, md);
          }
        }
      },
      {
        column: '',
        title: 'Details',
        type: ColumnType.LINK,
        linkConfiguration: {
          text: 'View/Edit',
          onClick: (row, md) => {
            this.gotoProject(row);
          }
        }
      }
    ];
  }
}
