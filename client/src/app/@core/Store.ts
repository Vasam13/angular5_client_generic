import { ColumnType, QueryRequest } from '@types';
import { Subscription } from 'rxjs/Subscription';
import { DMLResponse, DMLRequest, Response } from '@types';
import { Row, QueryResponse, StoreOption, Store } from '@types';
import { APIManager, QueryOperation, ColumnMetaData } from '@types';
import { APIService } from '@APIService';
import { Map, Status } from '@types';
import { Injectable } from '@angular/core';
import { MessageService } from '@message';
import { v4 as uuid } from 'uuid';
import { Utils } from '@utils';
import * as moment from 'moment';

@Injectable()
export class StoreService {
  constructor(
    private apiService: APIService,
    private message: MessageService
  ) {}

  getInstance(
    table: string,
    alias: string,
    _columnsMD: ColumnMetaData<Map>[],
    options?: StoreOption
  ): Store {
    const api = this.apiService.getInstance();
    return new StoreImpl(api, this.message, table, alias, _columnsMD, options);
  }
}

class StoreImpl implements Store {
  private _originalRows: Row[] = [];
  private deletedRows: Row[] = [];
  public rows: Row[] = [];
  public isBusy = false;
  public isDirty = false;
  private _columnIndex = -1;
  private _rowIndex = 0;
  public queryAllowed = true;
  public inserAllowed = false;
  public updateAllowed = false;
  public deleteAllowed = false;
  private _subscriptions: Subscription[] = [];
  public selected: Row[] = [];
  private _rowMinLength = 3;
  public columnsMD: ColumnMetaData<Map>[];
  public beforeSave: Function;
  public afterSave: Function;
  public whereClause: string;
  public whereClauseParams: any[];
  public orderByClause: string;
  private skipOrderBy?: boolean;
  public actionParams: Map;
  private selectParams?: string[];

  constructor(
    private api: APIManager,
    private message: MessageService,
    private table,
    private alias,
    private _columnsMD: ColumnMetaData<Map>[],
    private options?: StoreOption
  ) {
    if (options) {
      this.columnsMD = _columnsMD;
      this.queryAllowed = options.queryAllowed;
      this.inserAllowed = options.inserAllowed;
      this.updateAllowed = options.updateAllowed;
      this.deleteAllowed = options.deleteAllowed;
      this.whereClause = options.whereClause;
      this.whereClauseParams = options.whereClauseParams;
      this.orderByClause = options.orderByClause;
      this.skipOrderBy = options.skipOrderBy;
      this.actionParams = options.actionsParams;
      this.selectParams = options.selectParams;
      if (options.autoQuery) {
        this.query();
      }
    }
  }

  getCurrentRowIndex(): number {
    return this._rowIndex;
  }

  getCurrentRow(): Row {
    return this.rows[this._rowIndex];
  }

  updateCurrentRow(): void {
    this._rowIndex = 0;
  }
  resetCurrentColumn(): void {
    this._columnIndex = -1;
  }
  setCurrentColumn(rowIndex: number, columnIndex: number): void {
    this._rowIndex = rowIndex;
    this._columnIndex = columnIndex;
  }
  onRowSelect($event) {}
  setCurrentRow() {}
  isCurrentRow(rowIndex: number): boolean {
    return this._rowIndex === rowIndex;
  }
  isColumnTouched(rowIndex: number, columnIndex: number): boolean {
    return this._rowIndex === rowIndex && this._columnIndex === columnIndex;
  }

  public destroy() {
    this.api.destroy();
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  public hasErrors(row: Row, columnMd: Map): boolean {
    if (columnMd.required) {
      return !row[columnMd.column];
    }
    return false;
  }

  private getColumnMd(columnName: string): ColumnMetaData<Map> {
    for (let i = 0; i < this.columnsMD.length; i++) {
      const columnMD = this.columnsMD[i];
      if (columnMD.column === columnName) {
        return columnMD;
      }
    }
  }
  public isValiad(row: Row) {
    for (let i = 0; i < this.columnsMD.length; i++) {
      const columnMD = this.columnsMD[i];
      if (columnMD.required) {
        if (!row[columnMD.column]) {
          return false;
        }
      }
    }
    return true;
  }

  public clickHandler(row: Row, columnMd: ColumnMetaData<Map>): void {
    if (
      columnMd &&
      columnMd.type === ColumnType.LINK &&
      columnMd.linkConfiguration
    ) {
      columnMd.linkConfiguration.onClick(row, columnMd);
    } else if (columnMd && columnMd.onClick) {
      columnMd.onClick(row, columnMd);
    }
  }

  public isEditable(row: Row, columnMd: ColumnMetaData<Map>): boolean {
    if (row.$operation$ === QueryOperation.INSERT) {
      if (this.inserAllowed && columnMd.inserAllowed) {
        return true;
      }
    }
    if (
      row.$operation$ === QueryOperation.UPDATE ||
      row.$operation$ === QueryOperation.QUERY
    ) {
      if (this.updateAllowed && columnMd.updateAllowed) {
        return true;
      }
    }
    return false;
  }

  public isRowDirty(row: Row): boolean {
    for (let i = 0; i < this._originalRows.length; i++) {
      const _row = this._originalRows[i];
      if (_row.$id$ === row.$id$) {
        return !(JSON.stringify(_row) === JSON.stringify(row));
      }
    }
    return false;
  }
  public getDirtyRows(): Row[] {
    const dirtyRows: Row[] = [];
    this.rows.forEach((row: Row) => {
      if (row.$operation$ === QueryOperation.INSERT) {
        if (Object.keys(row).length > this._rowMinLength) {
          dirtyRows.push(row);
        }
      } else if (
        (row.$operation$ === QueryOperation.QUERY ||
          row.$operation$ === QueryOperation.UPDATE) &&
        this.isRowDirty(row)
      ) {
        row.$operation$ = QueryOperation.UPDATE;
        dirtyRows.push(row);
      }
    });
    this.deletedRows.forEach(row => {
      if (Object.keys(row).length > this._rowMinLength) {
        row.$operation$ = QueryOperation.DELETE;
        dirtyRows.push(row);
      }
    });
    return dirtyRows;
  }

  public resetRows() {
    const _rows: Row[] = [];
    this.rows.forEach(row => {
      if (row.$operation$ !== QueryOperation.DELETE) {
        _rows.push(row);
      }
    });
    this.rows = [..._rows];
    this.updateCurrentRow();
  }

  public deleteSelected() {
    this.selected.forEach(selected => {
      if (selected.$operation$ !== QueryOperation.INSERT) {
        this.deletedRows.push(Object.assign({}, selected));
      }
      selected.$operation$ = QueryOperation.DELETE;
    });
    this.resetRows();
  }

  public insertRow() {
    let _row: Row = {
      $id$: uuid(),
      $operation$: QueryOperation.INSERT
    };
    _row = this.beforeInsert(_row);
    this.rows.unshift(_row);
    this.resetRows();
  }

  public beforeInsert(_row: Row) {
    return _row;
  }

  private callAfterSave(res: DMLResponse) {
    if (this.afterSave) {
      this.afterSave(res);
    }
  }

  public saveRows(rows: Row[]): Promise<DMLResponse> {
    return new Promise((resolve, reject) => {
      let beforeSaveResponse: Response;
      if (this.beforeSave) {
        beforeSaveResponse = this.beforeSave(rows);
      }
      if (beforeSaveResponse && beforeSaveResponse.status === Status.ERROR) {
        Utils.notifyError(this.message, beforeSaveResponse.message);
        return resolve(<DMLResponse>beforeSaveResponse);
      }
      if (
        beforeSaveResponse &&
        beforeSaveResponse.status === Status.SUCCESS &&
        (<DMLResponse>beforeSaveResponse).rows &&
        (<DMLResponse>beforeSaveResponse).rows.length > 0
      ) {
        rows = (<DMLResponse>beforeSaveResponse).rows;
      }
      this._save(rows).then(res => {
        this.callAfterSave(res);
        return resolve(res);
      });
    });
  }
  public save(): Promise<DMLResponse> {
    return new Promise((resolve, reject) => {
      const _dirtyRows = this.getDirtyRows();
      if (_dirtyRows.length === 0) {
        Utils.notifyInfo(this.message, 'Nothing to save!');
        return resolve();
      }
      for (let i = 0; i < _dirtyRows.length; i++) {
        const _dirtyRow = _dirtyRows[i];
        if (!this.isValiad(_dirtyRow)) {
          Utils.notifyError(this.message, 'Missing required values!');
          return resolve();
        }
      }
      this.saveRows(_dirtyRows).then(res => {
        return resolve(res);
      });
    });
  }

  private _save(dirtyRows: Row[]): Promise<DMLResponse> {
    return new Promise((resolve, reject) => {
      dirtyRows.forEach(row => {
        Object.keys(row).forEach(key => {
          if (!row.hasOwnProperty(key) || row[key] == null) {
            delete row[key];
          }
          if (row[key] instanceof Date) {
            row[key] = moment(row[key]).format('YYYY-MM-DD HH:mm:ss');
            /*
            row[key] = row[key]
              .toISOString()
              .slice(0, 19)
              .replace('T', ' '); */
          }
        });
      });
      const dmlRequest: DMLRequest = {
        rows: dirtyRows
      };
      this.isBusy = true;
      const subject = this.api
        .save(this.table, this.alias, dmlRequest)
        .subscribe((resp: DMLResponse) => {
          this.isBusy = false;
          this.isDirty = false;
          resp.rows = resp.rows || [];
          if (resp.status === Status.SUCCESS) {
            if (!this.options || !this.options.skipNotifications) {
              Utils.notifySucess(this.message, 'Changes saved successfully');
            }
            this.query().then(_res => {
              return resolve(resp);
            });
          } else {
            return resolve(resp);
          }
        });
      this._subscriptions.push(subject);
    });
  }

  convert = str => {
    const date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join('-');
  }

  convert2 = str => {
    const date = new Date(str),
      mnth = ('0' + (date.getMonth() + 1)).slice(-2),
      day = ('0' + date.getDate()).slice(-2);
    return [day, mnth, date.getFullYear()].join('/');
  }

  public afterQuery(rows: Row[]) {
    return rows;
  }

  public query(): Promise<QueryResponse> {
    return new Promise((resolve, reject) => {
      if (this.isDirty) {
        // Generate a model to discard changes
      }
      this.isBusy = true;
      const queryRequest: QueryRequest = {
        whereClause: this.whereClause,
        whereClauseParams: this.whereClauseParams,
        orderByClause: this.orderByClause,
        selectParams: this.selectParams,
        actionParams: this.actionParams
      };
      if (!queryRequest.orderByClause && !this.skipOrderBy) {
        queryRequest.orderByClause = 'update_date desc';
      }
      const subject = this.api
        .query(this.table, this.alias, queryRequest)
        .subscribe((resp: QueryResponse) => {
          this.isBusy = false;
          this.isDirty = false;
          resp.rows = resp.rows || [];
          if (this.columnsMD) {
            this.columnsMD.forEach(columnMD => {
              if (columnMD.type === ColumnType.DATE) {
                resp.rows.forEach(row => {
                  if (row[columnMD.column]) {
                    row[columnMD.column] = this.convert(row[columnMD.column]);
                    if (columnMD.updateAllowed) {
                      row[columnMD.column] = this.convert(row[columnMD.column]);
                    } else {
                      // row[columnMD.column] = this.convert2(
                      //   row[columnMD.column]
                      // );
                    }
                  }
                });
              }
            });
          }
          resp.rows.forEach(row => {
            row.$id$ = uuid();
          });
          this.rows = resp.rows;
          this._originalRows = resp.rows.map(x => Object.assign({}, x));
          this.rows = this.afterQuery(this.rows);
          this.updateCurrentRow();
          return resolve(resp);
        });
      this._subscriptions.push(subject);
    });
  }
}
