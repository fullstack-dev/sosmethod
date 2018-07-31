import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URLS } from '../utils/tools';
import { CommonService } from './common.service';

import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
  private notify = new Subject<any>();
  notifyObservable$ = this.notify.asObservable();

  constructor(private http: HttpClient, private common: CommonService) { }

  public notifyOther() {
    this.notify.next('');
  }

  show() {
    const id = this.common.getData('user')['id'];
    return this.http.get(URLS.api + URLS.user.show + '?id=' + id, { headers: this.common.getHeaders() })
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

  update(user, callback) {
    user = this.common.pick(user, 'id', 'nickname', 'first_name', 'last_name');
    this.http.post(URLS.api + URLS.user.update, user, {headers: this.common.getHeaders()}).toPromise()
      .then((data) => {
        const userStoraged = this.common.getData('user');
        Object.assign(userStoraged, user);
        this.common.setData('user', userStoraged);
        callback({success: true});
      }, (err) => {
        callback(Object.assign({success: false}, err.json()));
      });
  }

  updateUser(user) {
    user = this.common.pick(user, 'id', 'nickname', 'first_name', 'last_name');
    return this.http.post(URLS.api + URLS.user.update, user, {headers: this.common.getHeaders()})
      .map(data => data as any);
  }

  updatePassword(user) {
    user = this.common.pick(user, 'password', 'password_confirmation', 'current_password');
    return this.http.post(URLS.api + URLS.user['password'], user, {headers: this.common.getHeaders()})
      .map(data => data as any);
  }

  updateUserPassword(user) {
    user = this.common.pick(user, 'id', 'password', 'password_confirmation', 'current_password');
    return this.http.post(URLS.api + URLS.user['update_user_password'], user, {headers: this.common.getHeaders()})
      .map(data => data as any);
  }

  updateEmail(user, callback) {
    user = this.common.pick(user, 'id', 'email', 'current_password');
    this.http.post(URLS.api + URLS.user['update_email'], user, {headers: this.common.getHeaders()}).toPromise()
      .then((data) => {
        user = this.common.pick(user, 'email');
        const userStoraged = this.common.getData('user');
        Object.assign(userStoraged, user);
        this.common.setData('user', userStoraged);
        const headers = this.common.getData('headers');
        headers['uid'] = user.email;
        this.common.setData('headers', headers);
        callback({success: true});
      }, (err) => {
        callback(Object.assign({success: false}, err.json()));
      });
  }
}
