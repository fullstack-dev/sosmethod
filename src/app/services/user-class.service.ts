import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { URLS } from '../utils/tools';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserClassService {

  constructor(private http: HttpClient, private common: CommonService) { }

  update(body) {
    return this.http.post(URLS.api + URLS.userClass.update, body, {headers: this.common.getHeaders()})
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

  list(params) {
    const user_id = this.common.getData('user')['id'];
    params = this.common.paramsBuilder(Object.assign({user_id, page: 1, per_page: 1000}, params));
    return this.http.get(URLS.api + URLS.userClass.list + params, {headers: this.common.getHeaders()})
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

  show() {
    const userId = this.common.getData('user')['id'];
    const params = this.common.paramsBuilder({id: userId});
    return this.http.get(URLS.api + URLS.userClass.show + params, {headers: this.common.getHeaders()})
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

}
