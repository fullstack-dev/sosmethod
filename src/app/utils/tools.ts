//import { environment } from '../environments/environment';
import { pick } from './pick';
import { ENV } from '@app/env';

const apiVer = '/v1';

const URLS = {
  // api: getApiBase(),
  api: ENV.URL,
  dashboard: apiVer + '/dashboard/all',
  session: {
    register: '/user',
    facebook: apiVer + '/auth/facebook',
    login: '/user/sign_in',
    confirmation: '/user/confirmation',
    currentUser: apiVer + '/user/current'
  },
  user: generateCRUD('user', [], ['create'], ['password', 'update_email', 'update_user_password', 'current']),
  client: generateCRUD('client'),
  report: {
    utilization: apiVer + '/report/frequency_user_utilization',
    survey: apiVer + '/report/frequency_surveys'
  },
  program: generateCRUD('program'),
  tool: generateCRUD('tool'),
  programClass: generateCRUD('program_class', [], [], ['list']),
  class: generateCRUD('class_day', [], ['list']),
  classLog: generateCRUD('user_class_log', [], ['list']),
  survey: generateCRUD('survey', [], [], ['create_simple_response']),
  surveyAnswer: generateCRUD('survey_answer'),
  question: generateCRUD('question', [], ['list']),
  userClass: generateCRUD('user_class', [], ['delete']),
  // these receipt endpoints need the platform appended to them at the end
  receipt: {
    create: apiVer + '/receipt/create/'
  },
  content: {
    tools: apiVer + '/content/tools'
  },
  pushable: {
    create: apiVer + '/pushables/token'
  },
}

function generateCRUD(label, only = [], except = [], includes = []) {
  const base = `${apiVer}/${label}/`;
  let routes = {
    list: base + 'list',
    show: base + 'show',
    create: base + 'create',
    update: base + 'update',
    delete: base + 'delete'
  };
  if (!!only.length) {
    routes = pick(routes, only);
  }
  except.forEach(ele => delete routes[ele]);
  includes.forEach(ele => routes[ele] = base + ele);
  return routes;
}

function getApiBase() {
  //prod
  let url = 'https://sosmethod-backend.herokuapp.com';
  // dev
  // let url = 'https://sosmethod-backend-dev.herokuapp.com';
  // if (environment.production) {
  //   url = 'https://sosmethod-backend.herokuapp.com';
  // }
  return url;
}

export { URLS }
