import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonService } from './common.service';
import { URLS } from '../utils/tools';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class SurveyService {

  constructor(
    private http: HttpClient,
    private common: CommonService
  ) { }

  show(id) {
    return this.http.get(URLS.api + URLS.survey.show + `?id=${id}`, { headers: this.common.getHeaders() })
      .timeout(10000)
      .retry(3)
      .map(data => data as any);
  }

  respond(userId, surveyId, programClassId, percent) {
    return this.http.post(URLS.api + URLS.survey['create_simple_response'], {
      user_id: userId,
      survey_id: surveyId,
      program_class_id: programClassId,
      percent: Math.ceil(percent),
    }, { headers: this.common.getHeaders() })
    .timeout(10000)
    .retry(3)
    .map(data => data as any);
  }

}

