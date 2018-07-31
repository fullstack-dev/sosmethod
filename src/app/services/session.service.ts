import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URLS } from '../utils/tools';
import { CommonService } from './common.service';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';


@Injectable()
export class SessionService {
  private _isLog: boolean;

  private _hasSubscription = new BehaviorSubject(false);
  hasSubscription = this._hasSubscription.asObservable();

  constructor(private http: HttpClient, private common: CommonService) { }

  currentUser() {
    return this.http.get(URLS.api + URLS.session.currentUser, { headers: this.common.getHeaders() })
      .map(data => {
        this._hasSubscription.next(data['user'] && data['user'].current_subscription);
        return data as any;
      });
  }

  get isLog(): boolean {
    return this._isLog;
  }

  set isLog(value: boolean) {
    this._isLog = value;
  }

  isAuth() {
    try {
      return this.common.getData('headers')['access-token'] !== null;
    }catch (e) {
      this.common.setData('headers', { 'access-token': null });
      return false;
    }
    /* return this.currentUser().map(data => {
      this.common.setData('user', data.user);
      this.isLog = true;
      return true;
    }).catch(() => {
      this.isLog = false;
      return Observable.of(false);
    }); */
  }

  sendConfirmation(token) {
    return this.http.get(URLS.api + URLS.session.confirmation + '?confirmation_token=' + token, {observe: 'response'})
      .map(data => {
        const res = data.body['data'];
        this.buildHeaders(data);
        return {success: true, role: res.role };
      }).catch(data => {
        return Observable.of({success: false, errors: data.error['errors']});
      }).map(data => data as any);
  }

  logout() {
    this.common.logout();
    this._hasSubscription.next(false);
  }

  login(user = {
    email: '',
    password: ''
  }) {
    return this.http.post(URLS.api + URLS.session.login, user, {observe: 'response'}).map((data) => {
      const res = data.body['data'];
      this.buildHeaders(data);
      return {success: true, role: res.role };
    }).catch(data => {
      return Observable.of({success: false, errors: data.error['errors'] });
    }).map(data => data as any);
  }

  register(user = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  }) {
    return this.http.post(URLS.api + URLS.session.register, user, {observe: 'response'}).map((data) => {
      return {success: true};
    }).catch(data => {
      return Observable.of({success: false, errors: data.error['errors']});
    }).map(data => data as any);
  }

  // sign in or up. same logic
  facebook(accessToken) {
    return this.http.post(
      URLS.api + URLS.session.facebook,
      {access_token: accessToken},
      {observe: 'response'}
    ).map((data) => {
      const res = data.body['data'];
      this.buildHeaders(data);
      return { success: true, role: res.role };
    }).catch(data => {
      return Observable.of({success: false, errors: data.error['errors']});
    }).map(data => data as any);
  }

  private buildHeaders(data) {
    const at = data.headers.get('access-token');
    const client = data.headers.get('client');
    const expiry = data.headers.get('expiry');
    const uid = data.headers.get('uid');
    const headers = { 'access-token': at, client: client, expiry: expiry, uid: uid };
    this.common.setData('user', data.body['data']);
    this.common.setData('headers', headers);
  }

}
