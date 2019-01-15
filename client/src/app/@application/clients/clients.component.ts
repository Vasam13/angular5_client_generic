import { Store, ColumnMetaData, ColumnType, Row, Map } from '@types';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { StoreService } from '@StoreService';
import { ClientsTable } from '../tables/ClientsTable';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit, OnDestroy {
 
  constructor(private storeService: StoreService, private router: Router) {}

  clientStore: Store;
  filter: string;

  newClient() {
    this.router.navigate(['/clients/new']);
  }

  ngOnInit() {
    this.clientStore = this.storeService.getInstance(
      'Clients',
      'clients',
      this.getClientsColumn(),
      { autoQuery: true }
    );
  }

  ngOnDestroy() {
    this.clientStore.destroy();
  }

  gotoDetails = (row: Row, columnMD: ColumnMetaData<Map>) => {
    if (row.clientId) {
      this.router.navigate(['/clients/' + row.clientId]);
    }
  };

  getClientsColumn = (): ColumnMetaData<ClientsTable>[] => {
    return [
      {
        column: ClientsTable.clientName,
        title: 'Client',
        type: ColumnType.STRING
      },
      {
        column: ClientsTable.contactName,
        title: 'Contact Name',
        type: ColumnType.STRING
      },
      {
        column: ClientsTable.emailAddress,
        title: 'Email Address',
        type: ColumnType.STRING
      },
      {
        column: ClientsTable.website,
        title: 'Website',
        type: ColumnType.STRING
      },
      {
        column: ClientsTable.country,
        title: 'Country',
        type: ColumnType.STRING
      },
      {
        column: ClientsTable.state,
        title: 'State',
        type: ColumnType.STRING
      },
      {
        column: ClientsTable.createDate,
        title: 'Created On',
        type: ColumnType.DATE
      },
      {
        column: '',
        title: 'Detais',
        type: ColumnType.LINK,
        linkConfiguration: {
          text: 'View/Edit',
          onClick: this.gotoDetails
        }
      }
    ];
  };
}
