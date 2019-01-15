import { DataUtils } from './../data';
import { Utils } from '@utils';
import { Store, Status, LeadStatus, Roles } from '@types';
import { ColumnMetaData, ColumnType } from '@types';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from '@StoreService';
import { Router } from '@angular/router';
import { SalesTable } from '../tables/SalesTable';
import SalesType from '../tables/types/SalesType';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit, OnDestroy {
  constructor(private storeService: StoreService, private router: Router) {}
  salesStore: Store;
  userStore: Store;
  clientStore: Store;
  filter: string;
  _canAddLead = false;

  newSale() {
    this.router.navigate(['/sales/new']);
  }

  canAddLead = () => {
    return this._canAddLead;
  }

  gotoSale(row: SalesType) {
    if (row.salesId) {
      this.router.navigate(['/sales/' + row.salesId]);
    }
  }

  ngOnInit() {
    this._canAddLead = Utils.hasAnyRole([
      Roles.SALES_PERSON,
      Roles.SALES_MANAGER
    ]);
    this.userStore = this.storeService.getInstance('Users', 'users', [], {});
    this.clientStore = this.storeService.getInstance(
      'Clients',
      'clients',
      [],
      {}
    );
    const selectParams = DataUtils.getTypeParams('SalesType');
    this.salesStore = this.storeService.getInstance(
      'Sales',
      'sales',
      this.getSalesColumnsMD(),
      { selectParams }
    );
    if (Utils.hasAnyRole([Roles.SALES_PERSON])) {
      this.salesStore.whereClause = 'create_User_Id = ? or executive = ?';
      this.salesStore.whereClauseParams = [
        Utils.getUserId(),
        Utils.getUserId()
      ];
    }

    if (Utils.hasAnyRole([Roles.SALES_MANAGER])) {
      // this.salesStore.whereClause = 'status IN (?, ?, ?)';
      // this.salesStore.whereClauseParams = [
      //   LeadStatus.DRAFT,
      //   LeadStatus.OPEN,
      //   LeadStatus.REQUEST_FOR_ESTIMATION
      // ];
    }

    if (Utils.hasAnyRole([Roles.ESTIMATOR])) {
      this.salesStore.whereClause = 'estimator = ? and status IN (?, ?, ?, ?)';
      this.salesStore.whereClauseParams = [
        Utils.getUserId(),
        LeadStatus.ESTIMATED,
        LeadStatus.REQUEST_FOR_ESTIMATION,
        LeadStatus.REQUEST_FOR_QUOTATION,
        LeadStatus.REQUEST_FOR_RE_ESTIMATION
      ];
    }

    if (Utils.hasAnyRole([Roles.ESTIMATION_MANAGER])) {
      this.salesStore.whereClause =
        'estimate_Lead = ? and status IN (?, ?, ?, ?)';
      this.salesStore.whereClauseParams = [
        Utils.getUserId(),
        LeadStatus.ESTIMATED,
        LeadStatus.REQUEST_FOR_ESTIMATION,
        LeadStatus.REQUEST_FOR_QUOTATION,
        LeadStatus.REQUEST_FOR_RE_ESTIMATION
      ];
    }

    if (
      (this.salesStore.whereClause &&
        this.salesStore.whereClauseParams &&
        this.salesStore.whereClauseParams.length > 0) ||
      Utils.hasAnyRole([Roles.SALES_MANAGER])
    ) {
      this.salesStore.query().then(res => {
        if (res.rows && res.rows.length > 0) {
          this.userStore.query();
          this.clientStore.query();
        }
      });
    }
  }

  downloadPDF(row: SalesType) {
    let url =
      'ext=application/pdf&type=pdf&export=view&ds=sales&column=pdf&pk=sales_id&pkv=' +
      row.salesId;
    url = '/api/download/' + btoa(url);
    window.open(url, '_blank');
  }

  ngOnDestroy() {
    this.salesStore.destroy();
    this.userStore.destroy();
    this.clientStore.destroy();
  }

  getStatusHTML = (row: SalesType, md) => {
    let badge = 'default';
    if (Utils.hasAnyRole([Roles.SALES_PERSON, Roles.SALES_MANAGER])) {
      if (
        row.status === LeadStatus.DRAFT ||
        row.status === LeadStatus.OPEN ||
        row.status === LeadStatus.REQUEST_FOR_QUOTATION
      ) {
        badge = 'warning';
      }
      if (
        row.status === LeadStatus.REQUEST_FOR_ESTIMATION ||
        row.status === LeadStatus.REQUEST_FOR_RE_ESTIMATION
      ) {
        badge = 'success';
      }
      if (row.status === LeadStatus.QUOTED) {
        badge = 'success';
      }
      if (row.status === LeadStatus.QUOTATION_SENT) {
        badge = 'primary';
      }
      if (row.status === LeadStatus.CLOSED_LOSE) {
        badge = 'important';
      }
      if (row.status === LeadStatus.CLOSED_WIN) {
        badge = 'success';
      }
    }
    if (Utils.hasAnyRole([Roles.ESTIMATOR, Roles.ESTIMATION_MANAGER])) {
      if (
        row.status === LeadStatus.ESTIMATED ||
        row.status === LeadStatus.REQUEST_FOR_ESTIMATION ||
        row.status === LeadStatus.REQUEST_FOR_RE_ESTIMATION
      ) {
        badge = 'warning';
      }
      if (row.status === LeadStatus.REQUEST_FOR_QUOTATION) {
        badge = 'success';
      }
    }
    return '<span class="badge badge-' + badge + '">' + row.status + '</span>';
  }

  getSalesColumnsMD = (): ColumnMetaData<SalesTable>[] => {
    return [
      {
        column: SalesTable.clientId,
        title: 'Client',
        sortable: true,
        type: ColumnType.DROP_DOWN,
        dropDownConfiguration: {
          store: this.clientStore,
          displayColumn: 'clientName',
          valueColumn: 'clientId'
        }
      },
      {
        column: SalesTable.projectName,
        title: 'Project',
        type: ColumnType.STRING,
        sortable: true
      },
      {
        column: SalesTable.executive,
        title: 'Executive',
        sortable: true,
        type: ColumnType.DROP_DOWN,
        dropDownConfiguration: {
          store: this.userStore,
          displayColumn: 'displayName',
          valueColumn: 'userId'
        }
      },
      {
        column: SalesTable.status,
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
        title: 'PDF',
        type: ColumnType.LINK,
        visible: (row: SalesType, md) => {
          return row.isPdfGenerated === 'Y';
        },
        linkConfiguration: {
          icon: 'icon-doc',
          onClick: (row, md) => {
            this.downloadPDF(row);
          }
        }
      },
      {
        column: SalesTable.createUserId,
        title: 'Created By',
        sortable: true,
        type: ColumnType.DROP_DOWN,
        dropDownConfiguration: {
          store: this.userStore,
          displayColumn: 'displayName',
          valueColumn: 'userId'
        }
      },
      {
        column: SalesTable.updateUserId,
        title: 'Updated By',
        sortable: true,
        type: ColumnType.DROP_DOWN,
        dropDownConfiguration: {
          store: this.userStore,
          displayColumn: 'displayName',
          valueColumn: 'userId'
        }
      },
      {
        column: SalesTable.createDate,
        title: 'Created On',
        type: ColumnType.DATE,
        sortable: true,
        style: 'width: 200px'
      },
      {
        column: SalesTable.updateDate,
        title: 'Updated On',
        type: ColumnType.DATE,
        sortable: true,
        style: 'width: 200px'
      },
      {
        column: '',
        title: 'Details',
        type: ColumnType.LINK,
        linkConfiguration: {
          text: 'View/Edit',
          onClick: (row, md) => {
            this.gotoSale(row);
          }
        }
      }
    ];
  }
}
