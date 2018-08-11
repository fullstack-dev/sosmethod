import { Component, Renderer } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams, Platform, AlertController } from 'ionic-angular';

import { PushService } from './../../app/services/push.service';
import { Storage } from '@ionic/storage';

import { Push, PushObject, PushOptions } from '@ionic-native/push';

/**
 * Generated class for the PushPoupuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-push-popup',
  templateUrl: 'push-popup.html',
})
export class PushPopupPage {

  constructor(
  	public renderer: Renderer,
		public viewCtrl: ViewController,
		public navCtrl: NavController,
		public navParams: NavParams,
    private platform: Platform,
    public pushService: PushService,
    private push: Push,
    public storage: Storage,
    private alertCtrl: AlertController) {

  	}

  ionViewDidLoad() {
    
  }

  yesClick() {
    localStorage.setItem('push_popup_status', 'yes');
    this.initPushNotification();
  }

  noClick() {
    localStorage.setItem('push_popup_status', 'no');
    this.viewCtrl.dismiss();
  }

  laterClick() {
    localStorage.setItem('push_popup_status', 'later');
    this.viewCtrl.dismiss();
  }

  initPushNotification() {
    const options: PushOptions = {
      android: {
        senderID: '653273040369'
      },
      ios: {
        alert: 'true',
        badge: false,
        sound: 'true'
      },
      windows: {}
    };
    const pushObject: PushObject = this.push.init(options);
    pushObject.on('registration').subscribe((data: any) => {
      console.log("push token: ", data.registrationId);
      this.sendTokenToServer(data.registrationId);
    },(error: any) => {
        console.log(error);
    });
    
    pushObject.on('notification').subscribe((data: any) => {
      console.log('message -> ' + data.message);
      
      var message = data.message;
      var obj = JSON.parse(message);
      var resource = obj.resource;

      if (resource == "empower") {
        this.navCtrl.setRoot('EmpowerPage');
      } else if (resource == "next_day_audio") {
        this.navCtrl.setRoot('ProgramPage', {
          programClassId: '24',
          programType: 'essentials',
          programId: '22'
        });
      } else if (resource == "meditation") {
        this.navCtrl.setRoot('ProgramPage', {
          programClassId: '38',
          programType: 'meditation',
          programId: '29'
        });
      } else {

      }

      console.log("resource value: ", resource);

      //if user using app and push notification comes
      if (data.additionalData.foreground) {
      //if application open, show popup
        
      } else {
        //if user NOT using app and push notification comes
        //TODO: Your logic on click of push notification directly     
        console.log('Push notification clicked');
      }
    });

    pushObject.on('error').subscribe(error => {
      console.error('Error with Push plugin' + error);
      alert(error);
    });
  }

  sendTokenToServer(device_token) {
    let platform = this.platform.is('android') ? 'fcm' : 'apn';
    const environment = 'production';

    this.pushService.createPushable(platform, environment, device_token).subscribe(result => {
      this.viewCtrl.dismiss();
    }, error => {
      localStorage.setItem('push_popup_status', 'later');
      let alert = this.alertCtrl.create({
        title: 'Error',
        message: 'The device token is not registered.',
        buttons: [{
                text: 'Cancel',
                role: 'cancel',
                handler: () => {
                  this.viewCtrl.dismiss();
                }
            }, {
                text: 'Ok',
                handler: () => {
                  this.viewCtrl.dismiss();
                }
            }]
      });

      alert.present();
    });
  }

}
