import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { pick } from '../utils/pick';
declare var jQuery: any;

@Injectable()
export class CommonService {

  private currentUser = new Subject<any>();
  private emitChangeSource = new Subject<any>();

  changeEmitted$ = this.emitChangeSource.asObservable();

  private _loggedOut = new Subject();
  loggedOut = this._loggedOut.asObservable();

  constructor() { }

  emitChange(myMessage: any) {
    this.emitChangeSource.next(myMessage);
  }

  onResize() {
    return Observable.fromEvent(window, 'resize').map(() => {
      return document.documentElement.clientWidth;
    });
  }

  onScroll() {
    return Observable.fromEvent(window, 'scroll').map(() => {
      return document.documentElement.clientWidth;
    });
  }

  onTabChanged() {
    return Observable.fromEvent(window, 'visibilitychange').map(() => {
      return document.hidden;
    });
  }

  unbind(events) {
    jQuery(window).off(events);
  }

  getCurrentUser(): Observable<any> {
    return this.currentUser.asObservable();
  }

  setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  getData(key) {
    if (key === 'user') {
      this.currentUser.next(JSON.parse(localStorage.getItem(key)));
    }
    return JSON.parse(localStorage.getItem(key));
  }

  getHeaders() {
    return new HttpHeaders(this.getData('headers'));
  }

  logout() {
    this.setData('user', null);
    this.setData('headers', { 'access-token': null });
    this._loggedOut.next(true);
  }

  paramsBuilder(obj) {
    let params = '?';
    Object.keys(obj).forEach(key => {
      params = params + encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]) + '&';
    });
    return params.substring(0, params.length - 1);
  }

  /**
  * Take just the attributes of an object named in the second param.
  * Example:
  *  let object = {a:5,b:2,c:10};
  *  pick(object, 'a', 'b'); // {a:5, b:2}
  */
  pick = pick;

  /**
  * Sort an array by an attribute that all objects in it share.
  * Example:
  *  let array = [{a:5,b:2},{a:2,b:3},{a:3,b:6},{a:1,b:3}];
  *  sortArrayOfObjects(array, 'a'); // [{a:1,b:3},{a:2,b:3},{a:3,b:6},{a:5,b:2}]
  */
  sortArrayOfObjects(array, property) {
    return array.sort(this._dynamicSort(property));
  }

  _dynamicSort(property) {
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    return function (a, b) {
      const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
    };
  }

}
