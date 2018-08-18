import { Injectable } from '@angular/core';
import {
  AlertController,
  Platform
} from "ionic-angular";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse } from '@angular/common/http/';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { CommonService } from './../services/common.service';
import { Market } from "@ionic-native/market";

@Injectable()
export class ExpiredInterceptor implements HttpInterceptor {
  constructor(
    private commonService: CommonService,
    public alertCtrl: AlertController,
    public plt: Platform,
    public market: Market

  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    /* Add x-api-version to header */
    req = req.clone({
      setHeaders: {
        "X-Api-Version": "v1"
      }
    });

    return next
      .handle(req)
      .catch((error, res) => {
        if (
          (error.status === 401 || error.status === 403) &&
          this.commonService.getData("user")
        ) {
          this.commonService.logout();
        }
        return Observable.throw(error);
      })
      .map(
        response => {
          if (response.headers) {
            const at = response.headers.get("access-token");
            const client = response.headers.get("client");
            const expiry = response.headers.get("expiry");
            const uid = response.headers.get("uid");

            /* Response x-api-version */
            /** */
            const xApiVersion = response.headers.get("x-api-version");
            this.versionCheck(xApiVersion);
            /** End */

            const headers = {
              "access-token": at,
              client: client,
              expiry: expiry,
              uid: uid
            };
            if (at && client && expiry && uid) {
              this.commonService.setData("headers", headers);
            }
          }
          return response;
        },
        err => {
          console.log("err", err);
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              // redirect to the login route
              // this.events = this.injector.get(Events);
              // this.events.publish('user:logout');
            }
          }
        }
      );
  }

  versionCheck(version) {
    const currentVersion = 1;
    if (!version) {
      console.log('There is no updated version');
    } else if (version.length == 1) {
      // Go Setting page
      console.log('Go Setting');
      this.upgradeConfirm();
    } else if (version.length > 1) {
      let item = version.filter(vs => vs == currentVersion);
      console.log('item', item);
      if (item.length == 0) {
        let latestVersion = version[length];
        console.log('LatestVersion', latestVersion);
      } else {
        console.log("Last version use same api with current version");
      }
    }
  }

  upgradeConfirm() {
    const alert = this.alertCtrl.create({
      title: "Upgrade Required!",
      subTitle:
        "We have made some changes that require you to upgrade the app",
      buttons: [{
        text: 'Upgrade',
        handler: data => {
          this.upgradeApp();
        }
      }],
      enableBackdropDismiss: false,
    });
    alert.present();
  }

  upgradeApp() {
    if (this.plt.is('android')) {
      this.market.open("co.sosmethod.mobile");
    }
    else if (this.plt.is('ios')) {
      this.market.open("id1363278866");
    }
  }
}
