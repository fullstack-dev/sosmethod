import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { URLS } from '../utils/tools';
import { CommonService } from './common.service';

import { Observable } from 'rxjs/Observable';

@Injectable()
export class ToolService {

  placeholderTool = {
    title: 'Tool Number 1',
    description: 'lorem ipsum dolor',
    color: 'blue',
    image: {
      url: 'https://www.fillmurray.com/500/400'
    },
    payment_required: false
  };

  constructor(
    private http: HttpClient,
    private common: CommonService
  ) { }

  getToolById(toolId) {
    return Observable.of(this.placeholderTool);
  }

  getTools() {
    return Observable.of([
      { ...this.placeholderTool} ,
      { ...this.placeholderTool,
        ...{
          title: 'Tool Number 2',
          color: 'yellow',
          image: {
            url: 'https://www.fillmurray.com/501/401'
          }
        }
      },
    ]);
  }

  index() {
    const url = URLS.api + URLS.content.tools;
    return this.http.get(url, { headers: this.common.getHeaders() })
      .timeout(10000)
      .retry(3)
      .map(data => {
        return data['tools_by_category'] as any;
      });
  }

  show(id) {
    const url = URLS.api + URLS.tool.show + `?id=${id}`;
    return this.http.get(url, { headers: this.common.getHeaders() })
      .timeout(10000)
      .retry(3)
      .map(data => {
        return data['tool'] as any;
      });
  }

}