import { SurveyUserIconComponent } from './../../components/survey-user-icon/survey-user-icon';
import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, Platform } from 'ionic-angular';
import { Network } from '@ionic-native/network';

import { SubscriptionService } from './../../app/services/subscription.service';
import { ReviewService } from '../../app/services/review.service';

import { Observable } from 'rxjs/Observable';

@IonicPage()
@Component({
  selector: 'page-subscribe',
  templateUrl: 'subscribe.html',
})
export class SubscribePage implements OnInit {

  subscriptionOptions = [];
  reviews = [];

  hasSubscription = false;
  finishedLoading = false;
  showAppStoreInfo = false;
  appStoreError = false;

  signIntoStoreMessage = 'You must be signed into the App Store to see available subscriptions.';

  disconnectSubscription;
  connectSubscription;

  constructor(
    private navCtrl: NavController,
    private subscriptionService: SubscriptionService,
    private reviewService: ReviewService,
    private platform: Platform,
    private network: Network,
  ) {
    if(this.platform.is('android')) {
      this.signIntoStoreMessage = 'You must be signed into the Google Play store to see available subscriptions.';
    }
    if(this.platform.is('ios')) {
      this.showAppStoreInfo = true;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SubscribePage');
    this.hasSubscription = this.subscriptionService.hasSubscription;
    this.finishedLoading = this.subscriptionService.finishedLoading;
  }

  ionViewDidUnload() {
    if(this.connectSubscription) {
      this.connectSubscription.unsubscribe();
    }
    if(this.disconnectSubscription) {
      this.disconnectSubscription.unsubscribe();
    }
  }

  ngOnInit() {
    this.subscriptionService.getSubscriptionOptions().subscribe(options => {
      console.log('options', options, this.finishedLoading);
      this.finishedLoading = true;
      this.subscriptionOptions = options as any[];
      if(!options.length) {
        this.appStoreError = true;
      }
    });

    this.reviewService.getReviews().subscribe(reviews => {
      this.reviews = reviews;
    });
  }

  count(amount) {
    return new Array(amount);
  }

  subscribe(subscriptionId) {
    this.subscriptionService.subscribe(subscriptionId).then(result => {
      this.navCtrl.setPages([{ page: 'EmpowerPage' }]);
    });
  }

  goBack() {
    this.navCtrl.setPages([{ page: 'EmpowerPage'}]);
  }

}
