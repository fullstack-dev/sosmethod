import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http/';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { CommonService } from './../services/common.service';

@Injectable()
export class ExpiredInterceptor implements HttpInterceptor {

  constructor(
    private commonService: CommonService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    return next.handle(req).catch((error, response) => {
      if(
        (error.status === 401 || error.status === 403) &&
        this.commonService.getData('user')
      ) {
        this.commonService.logout();
      }
      return Observable.throw(error);
    }).map(response => {
      if(response.headers) {
        const at = response.headers.get('access-token');
        const client = response.headers.get('client');
        const expiry = response.headers.get('expiry');
        const uid = response.headers.get('uid');
        const headers = { 'access-token': at, client: client, expiry: expiry, uid: uid };
        if(at && client && expiry && uid) {
          this.commonService.setData('headers', headers);
        }
      }
      return response;
    });
  }
}
