import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from './common.service';
import { URLS } from '../utils/tools';

@Injectable()
export class PushService {

	constructor(private http: HttpClient, public common: CommonService) { }

	createPushable(platform, environment, token) {
		let params = {
	      platform: platform,
	      environment: environment,
	      push_token: token,
	    };
		return this.http.post(URLS.api + URLS.pushable.create, params, { headers: this.common.getHeaders() })
      		.map(data => data as any);
	}
}