import { APIManager } from './../@types/types';
import { Subscription } from 'rxjs/Subscription';
import { QueryResponse, DMLResponse, DMLRequest, Row, UserInfo } from '@types';
import { Utils } from '@utils';
import { Injectable } from '@angular/core';
import { Map, NotifType, Response, Status, NotifPosition } from '@types';
import { HttpClient } from '@angular/common/http';
import { MessageService } from '@message';
import { CODE } from '@code';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import RootScope from '@RootScope';

@Injectable()
export class APIService {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private router: Router
  ) {}

  getInstance(): APIManager {
    return new APIManagerImpl(this.http, this.message, this.router);
  }
}

class APIManagerImpl implements APIManager {
  constructor(
    private http: HttpClient,
    private message: MessageService,
    private router: Router
  ) {}

  private _subscriptions: Subscription[] = [];

  public destroy() {
    this._subscriptions.forEach(sub => sub.unsubscribe());
  }

  public post(
    api: string,
    data?: Map,
    skipNotifs: boolean = false
  ): Observable<Response> {
    return Observable.create(observer => {
      data = data || {};
      const sessionId = Utils.getSessionId();
      data.sessionId = sessionId;
      const subject = this.http.post(api, data).subscribe(
        res => {
          this.handleSessionExpires(<Response>res);
          observer.next(res);
          observer.complete();
        },
        err => {
          if (!skipNotifs) {
            Utils.notifyError(this.message, err.message);
          }
          observer.next({
            status: Status.ERROR,
            responseCode: CODE.SKIP_NOTIF,
            message: err
          });
          observer.complete();
        }
      );
      this._subscriptions.push(subject);
    });
  }

  public save(
    tableName: string,
    alias: string,
    params: DMLRequest
  ): Observable<DMLResponse> {
    return Observable.create(observer => {
      const api = '/api/save/' + tableName + '/' + alias;
      const subject = this.post(api, params).subscribe(
        (_response: Response) => {
          this.notifySaveError(_response);
          const respose: DMLResponse = <DMLResponse>_response;
          observer.next(respose);
          observer.complete();
        }
      );
      this._subscriptions.push(subject);
    });
  }

  public query(
    tableName: string,
    alias: string,
    params?: Map
  ): Observable<QueryResponse> {
    return Observable.create(observer => {
      const api = '/api/query/' + tableName + '/' + alias;
      const subject = this.post(api, params).subscribe(
        (_response: Response) => {
          this.notifySaveError(_response);
          const respose: QueryResponse = <QueryResponse>_response;
          observer.next(respose);
          observer.complete();
        }
      );
      this._subscriptions.push(subject);
    });
  }

  private notifySaveError(response: Response) {
    if (
      response.status === Status.ERROR &&
      response.responseCode !== CODE.SKIP_NOTIF
    ) {
      Utils.notifyErrorResponse(this.message, response);
    }
  }

  public login(userName: string, password: string): Observable<boolean> {
    const api = '/api/signin';
    const data = { userName, password };
    return Observable.create(observer => {
      const subject = this.post(api, data).subscribe((response: Response) => {
        if (response && response.status === Status.ERROR) {
          if (response.responseCode !== CODE.SKIP_NOTIF) {
            Utils.notify(
              this.message,
              NotifType.DANGER,
              'Error while login',
              response.message,
              NotifPosition.TOP_LEFT
            );
          }
          observer.next(false);
          observer.complete();
        } else if (response.rows.length > 0) {
          RootScope.userInfo = <UserInfo>response.rows[0];
          Utils.setCookie(RootScope.userInfo);
          observer.next(true);
          observer.complete();
        }
      });
      this._subscriptions.push(subject);
    });
  }

  private handleSessionExpires(res: Response) {
    if (
      res.status === Status.ERROR &&
      res.message.toLocaleLowerCase().indexOf('session') > -1
    ) {
      Utils.handleSessionExpires(this.message, this.router);
    }
  }
}
