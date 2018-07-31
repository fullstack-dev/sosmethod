import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { URLS } from '../utils/tools';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/retry';

@Injectable()
export class ProgramService {

  constructor(private http: HttpClient, private common: CommonService) { }

  index(params = {}) {
    let url = URLS.api + URLS.program.list;
    params = this.common.paramsBuilder(Object.assign({ sort: '-created_at', per_page: -1 }, params));
    url += params;
    return this.http.get(url, { headers: this.common.getHeaders() })
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

  show(id) {
    return this.http.get(URLS.api + URLS.program.show + `?id=${id}`, { headers: this.common.getHeaders() })
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

  showProgramClass(params) {
    params = this.common.paramsBuilder(params);
    return this.http.get(URLS.api + URLS.programClass.show + params, { headers: this.common.getHeaders() })
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

}
