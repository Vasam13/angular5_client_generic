import { URLType, Map, State } from './../@types/types';
import { MessageService } from '@message';
import {
  Row,
  NotifType,
  NotifStyle,
  NotifPosition,
  UserInfo,
  Response,
  Status,
  Roles,
  RoleCategory
} from '@types';
import * as constants from '@constants';
import { Router, RouterState, ActivatedRoute, Routes } from '@angular/router';
import RootScope from '@RootScope';
import CoockieUtils from './CoockieUtils';
import { Injectable } from '@angular/core';
import { AppStates } from '../app.states';

@Injectable()
export class Utils {
  static notify(
    service: MessageService,
    type: NotifType,
    title: string,
    msg: string,
    position?: NotifPosition,
    style?: NotifStyle
  ) {
    // notification.remove();
    let Duration = 4000;
    if (!position) {
      position = NotifPosition.TOP_LEFT;
    }
    if (!style) {
      style = NotifStyle.SIMPLE;
    }
    if (type === NotifType.SUCCESS) {
      style = NotifStyle.BAR;
      Duration = 2000;
    }
    service.remove();
    service.create(type, msg, {
      Title: title,
      Position: position,
      Style: style,
      Duration
    });
  }

  static notifyError(service: MessageService, msg: string) {
    Utils.notify(service, NotifType.DANGER, 'Error', msg);
  }

  static notifyInfo(service: MessageService, msg: string) {
    Utils.notify(service, NotifType.INFO, 'Info', msg);
  }

  static notifySucess(service: MessageService, msg: string) {
    Utils.notify(service, NotifType.SUCCESS, 'Success', msg);
  }

  static notifyErrorResponse(service: MessageService, res: Response) {
    Utils.notify(service, NotifType.DANGER, 'Error', res.message);
  }

  static getCookie(): UserInfo | void {
    const _c = CoockieUtils.getCookie('app');
    if (_c) {
      return <UserInfo>JSON.parse(_c);
    }
  }

  static put(key: string, value: any) {
    if (Utils.get(key)) {
      Utils.delete(key);
    }
    CoockieUtils.setCookie(key, value);
  }

  static get(key: string) {
    return CoockieUtils.getCookie(key);
  }

  static delete(key: string) {
    CoockieUtils.deleteCoockie(key);
  }

  static setCookie(userInfo: Response) {
    if (Utils.getCookie()) {
      Utils.deleteCookie();
    }
    CoockieUtils.setCookie('app', JSON.stringify(userInfo));
  }

  static deleteCookie() {
    CoockieUtils.deleteCoockie('app');
  }

  static getSessionId(): string | void {
    const _c = Utils.getCookie();
    if (_c) {
      return _c.sessionId;
    }
  }

  static getParams(functionName): string[] {
    const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
    const ARGUMENT_NAMES = /([^\s,]+)/g;

    const fnStr = functionName.toString().replace(STRIP_COMMENTS, '');
    const result = fnStr
      .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
      .match(ARGUMENT_NAMES);
    if (result) {
      return result;
    }
    return [];
  }

  static getReservedWords = (): string[] => {
    return ['$operation$'];
  };

  static isReservedWord = (str: string): boolean => {
    return !(Utils.getReservedWords().indexOf(str) === -1);
  };

  static _toCamelCase(str: string) {
    if (Utils.isReservedWord(str)) {
      return str;
    }
    str = str.substring(0, 1).toLowerCase() + str.substring(1);
    return str.replace(/_([a-z])/gi, function($0, $1) {
      return $1.toUpperCase();
    });
  }

  static toCamelCase(str: string | Row[]): string | Row[] {
    if (str instanceof Array) {
      const _rows: Row[] = [];
      (<Array<Row>>str).forEach((row: Row) => {
        const _row: Row = {
          $id$: row.$id$,
          $operation$: row.$operation$
        };
        Object.keys(row).forEach(key => {
          const _key: string = Utils._toCamelCase(key);
          _row[_key] = row[key];
        });
        _rows.push(_row);
      });
      return _rows;
    }
    return Utils._toCamelCase(str);
  }

  static inverseCamelCase(str: string): string {
    if (str.indexOf('_') > -1) {
      return str;
    }
    return str.replace(/([a-z][A-Z])/g, function(g) {
      return g[0] + '_' + g[1].toLowerCase();
    });
  }

  static handleSessionExpires(
    messageService: MessageService,
    router: Router
  ): Promise<boolean> {
    Utils.notify(
      messageService,
      NotifType.DANGER,
      constants.ERR_WHILE_POST,
      constants.SESS_EXP_PLS_LOGIN
    );
    Utils.deleteCookie();
    return router.navigate(['/login']);
  }

  static onlyText(str: string) {
    if (!str || str.trim().length === 0) {
      return '';
    }
    return str.replace(/[^a-zA-Z ]/g, '').toLowerCase();
  }

  static getRoles() {
    if (RootScope.userInfo) {
      return RootScope.userInfo.roles;
    }
    return [];
  }

  static getUserId() {
    if (RootScope.userInfo) {
      return RootScope.userInfo.userId;
    }
    return -1;
  }

  static getUserName() {
    if (RootScope.userInfo) {
      return RootScope.userInfo.userName;
    }
    return '';
  }

  static getDisplayName() {
    if (RootScope.userInfo) {
      return RootScope.userInfo.displayName;
    }
    return '';
  }

  static getDPUrl(userId?: number) {
    let ppUrl =
      'type=png&ext=image/png&export=view&ds=users&column=avatarBlob&pk=user_id&pkv=';
    if (userId == null) {
      ppUrl += RootScope.userInfo.userId;
    } else {
      ppUrl += userId;
    }
    return '/api/download/' + btoa(ppUrl);
  }

  static getUserInfo() {
    return RootScope.userInfo;
  }

  static urlIsOf(router: Router, modules: URLType[]): boolean {
    for (let i = 0; i < modules.length; i++) {
      const module = modules[i];
      if (router.url.startsWith(module)) {
        return true;
      }
    }
    return false;
  }

  static hasRole(roleCode: Roles) {
    let _hasRole = false;
    Utils.getRoles().forEach(element => {
      if (
        element.roleCode &&
        Utils.onlyText(element.roleCode) === Utils.onlyText(roleCode)
      ) {
        _hasRole = true;
      }
    });
    return _hasRole;
  }
  static hasAnyRole(roleCodes: Roles[]) {
    for (let i = 0; i < roleCodes.length; i++) {
      if (Utils.hasRole(roleCodes[i])) {
        return true;
      }
    }
    return false;
  }

  static hasRoleCategory(roleCategory: string) {
    let _hasRoleCategory = false;
    Utils.getRoles().forEach(element => {
      if (
        Utils.onlyText(element.roleCategory) === Utils.onlyText(roleCategory)
      ) {
        _hasRoleCategory = true;
      }
    });
    return _hasRoleCategory;
  }

  static deepCompare(a, b) {
    const isArray = Array.isArray;
    const keyList = Object.keys;
    const hasProp = Object.prototype.hasOwnProperty;
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const arrA = isArray(a),
        arrB = isArray(b);
      let i, length, key;
      if (arrA && arrB) {
        length = a.length;
        if (length !== b.length) {
          return false;
        }
        for (i = length; i-- !== 0; ) {
          if (!Utils.deepCompare(a[i], b[i])) {
            return false;
          }
        }

        return true;
      }
      if (arrA !== arrB) {
        return false;
      }

      const dateA = a instanceof Date,
        dateB = b instanceof Date;
      if (dateA !== dateB) {
        return false;
      }
      if (dateA && dateB) {
        return a.getTime() === b.getTime();
      }

      const regexpA = a instanceof RegExp,
        regexpB = b instanceof RegExp;
      if (regexpA !== regexpB) {
        return false;
      }
      if (regexpA && regexpB) {
        return a.toString() === b.toString();
      }

      const keys = keyList(a);
      length = keys.length;

      if (length !== keyList(b).length) {
        return false;
      }

      for (i = length; i-- !== 0; ) {
        if (!hasProp.call(b, keys[i])) {
          return false;
        }
      }
      for (i = length; i-- !== 0; ) {
        key = keys[i];
        if (!Utils.deepCompare(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }
    return a !== a && b !== b;
  }

  static getCurrYear() {
    return new Date().getFullYear();
  }

  static getMyStates() {
    const filteredStates = [];
    AppStates.forEach(state => {
      if (state.roleCodes && state.roleCodes.length > 0) {
        this.getRoles().forEach(role => {
          if (
            state.roleCodes.indexOf(role.roleCode) > -1 ||
            state.roleCodes.indexOf(Roles.ALL_USERS) > -1
          ) {
            filteredStates.push(state);
          }
        });
      }
    });
    return filteredStates;
  }

  static getStateData(router: Router) {
    const state: RouterState = router.routerState;
    const c = state.root.children;
    if (
      c &&
      c.length > 0 &&
      c[0].routeConfig.children &&
      c[0].routeConfig.children.length > 0 &&
      c[0].routeConfig.children[0].data
    ) {
      return c[0].routeConfig.children[0].data.state;
    }
  }

  static getMenuStates(router: Router) {
    const routerState = this.getStateData(router);
    return this.getMyStates().filter((appState: State) => {
      if (appState.menu) {
        if (appState.state === routerState) {
          appState.menu.thumbNailClass = 'bg-primary';
        } else {
          appState.menu.thumbNailClass = null;
        }
        return true;
      }
    });
  }

  static getAuthorizedState(router: Router): Map {
    const restrictURL = '/restricted';
    const myStates = this.getMyStates();
    if (myStates.length === 0) {
      return { url: restrictURL };
    }
    const url = router.url;
    if (!url || url.trim().length === 0 || url === '/') {
      const homeUrls = myStates.filter(entry => entry.isHome === 'Y');
      const _url = homeUrls.length > 0 ? homeUrls[0].url : myStates[0].url;
      return { url: _url, state: myStates[0].state };
    }
    const routerState = this.getStateData(router);
    let authUrl, _state;
    for (let i = 0; i < myStates.length; i++) {
      const myState = myStates[i];
      if (myState.state === routerState) {
        authUrl = myState.url;
        _state = myState.state;
      }
    }
    authUrl = authUrl ? authUrl : restrictURL;
    return { url: authUrl, state: _state };
  }
}
