import { validate } from 'validate.js';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';

import { InAppPurchase2, IAPProduct } from '@ionic-native/in-app-purchase-2';

import { Observable } from 'rxjs/Observable';

import { CommonService } from './common.service';
import { URLS } from '../utils/tools';

import getSymbolFromCurrency from 'currency-symbol-map';

@Injectable()
export class SubscriptionService {

  private subscriptionTypes = [
    'co.sosmethod.subscription.annual',
    'co.sosmethod.subscription.monthly',
  ];

  subscriptions = {};
  finishedLoading = false;
  hasSubscription = false;
  fetchedSubscriptions = 0;

  private loadedSubscriptions = new Set();

  constructor(
    private appStore: InAppPurchase2,
    private platform: Platform,
    private http: HttpClient,
    private common: CommonService,
  ) {
    if(!this.platform.is('cordova')) {
      this.finishedLoading = true;
    }
  }

  initialize() {
    // When we are not in a cordova env, we do not initialize anything
    if(!this.platform.is('cordova')) {
      console.log('app store not available');
      return;
    }

    this.appStore.verbosity = this.appStore.DEBUG;

    //this.appStore.validator = 'http://sosmethod.proxy.beeceptor.com';

    // Register Subscriptions
    this.subscriptionTypes.map(subType => {
      this.setupSubscriptionEvents(subType);
    });

    this.appStore.refresh();

  }

  setupSubscriptionEvents(subType) {

    this.appStore.validator = (product, callback) => {
      product = product as IAPProduct;

      const receipt = this.platform.is('ios') ?
        product.transaction.appStoreReceipt :
        product.transaction.receipt;

      this.validate(receipt, product.transaction.signature)
        .catch((error, caught) => {
          return Observable.of(false);
        }).subscribe(result => {
          if(result !== false) {
            callback(true, {});
          } else {
            callback(false, {});
          }
        })
    };

    this.appStore.register({
      id: subType,
      alias: subType,
      type: subType === 'co.sosmethod.subscription.lifetime' ? this.appStore.NON_CONSUMABLE : this.appStore.PAID_SUBSCRIPTION
    });

    this.appStore.when(subType).error( (error) => {
      alert('An Error Occured' + JSON.stringify(error));
    });

    this.appStore.when(subType).approved(sub => {
      console.log(`${subType} approved`, JSON.stringify(sub));
      sub.verify();
    });
    this.appStore.when(subType).invalid(sub => {
      console.log(`${subType} invalid`, JSON.stringify(sub));
    });
    this.appStore.when(subType).verified(sub => {
      console.log(`${subType} verified`, JSON.stringify(sub));
      sub.finish();
    });
    // this.appStore.when(subType).unverified(sub => {
    //     console.log(`${subType} unverified`, JSON.stringify(sub));
    // });
    this.appStore.when(subType).updated(sub => {
      console.log(`${subType} updated`, JSON.stringify(sub));
      if (sub.owned) {
        // this.hasSubscription = true;
      } else if(sub.valid && sub.canPurchase) {
        this.subscriptions[subType] = this.getSubscriptionValues(sub);
        this.loadedSubscriptions.add(subType);
      }
      this.fetchedSubscriptions = this.fetchedSubscriptions + 1;

      if(this.fetchedSubscriptions === this.subscriptionTypes.length) {
        this.finishedLoading = true;
      }
    });

    this.appStore.when(subType).owned(sub => {
      console.log(`${subType} owned`, JSON.stringify(sub));
      //this.hasSubscription = true;
    });
  }

  private getSubscriptionValues(sub) {
    const base = {
      name: '',
      priceLabel: '',
      secondaryText: '',
      color: '',
      subscriptionId: '',
      description: '',
    };

    base.subscriptionId = sub.id;
    base.name = sub.title;
    let price = sub.price;
    if(sub.id === 'co.sosmethod.subscription.annual') {
      price = (Math.floor((parseFloat(/[\d\.\,]+/.exec(sub.price)[0]) / 12) * 100) / 100).toLocaleString();
      price = getSymbolFromCurrency(sub.currency) + price;
      base.description = `Payment of ${sub.price} every 12 months.`;
    }
    base.priceLabel = `${price}/MO`;

    switch(sub.id) {
      case 'co.sosmethod.subscription.monthly':
        base.color = 'blue';
        base.secondaryText = 'MONTHLY';
        break;
      case 'co.sosmethod.subscription.annual':
        base.color = 'yellow';
        base.secondaryText = `YEARLY`;
        break;
    }

    return base;
  }

  getSubscriptionOptions() {
    const subs = [];
    this.subscriptionTypes.map(subType => {
      if(this.subscriptions[subType]) {
        subs.push(this.subscriptions[subType]);
      }
    });

    return Observable.of(subs);
  }

  subscribe(subscriptionId) {

    if(!this.platform.is('cordova')) {
      console.log('AppStore not available');
      return new Promise((resolve, reject) => {
        resolve({success: true});
      });
    }

    this.appStore.order(subscriptionId);
    return new Promise((resolve, reject) => {
      this.appStore.once(subscriptionId).owned(sub => {
        resolve({success: true});
      });
    });
  }

  validate(receipt, signature) {
    const params = {
      base64_receipt: receipt,
      base64_signature: signature,
    };
    let endpoint = 'google';

    if(this.platform.is('ios')) {
      endpoint = 'apple';
      delete params.base64_signature;
    }

    return this.http.post(URLS.api + URLS.receipt.create + `/${endpoint}`, params, { headers: this.common.getHeaders() })
    .map(data => data as any);
  }

}