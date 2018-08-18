import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Toast, Platform } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Device } from '@ionic-native/device';
import { SessionService } from './../../app/services/session.service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  email: string;
  password: string;
  invite_code: string;
  url: string;
  uuid: string;
  device_name: string;

  errorToast: Toast;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private sessionService: SessionService,
    private toastController: ToastController,
    private fb: Facebook,
    public storage: Storage,
    public platform: Platform,
    public device: Device
  ) {
    localStorage.removeItem("base_url");
    this.platform.ready().then(() => {
      if (this.platform.is("ios")) {
        this.device_name = this.device.model;
      } else if (this.platform.is("android")) {
        this.device_name = (window as any).device.name;
      } else {
        this.device_name = "";
      }
      if (!this.device_name) {
        this.device_name = "iphone7, 2";
      }
    });
  }

  ionViewDidLoad() {
    let deeplink = this.navParams.get("deeplink");
    if (deeplink) {
      setTimeout(() => {
        let register_data = JSON.parse(localStorage.getItem("register_data"));
        if (register_data) {
          this.autoLogin(register_data);
        }
      }, 1000);
    }
  }

  ionViewWillLeave() {
    if (this.errorToast) {
      this.errorToast.dismissAll();
    }
  }

  emailChanged(change) {
    this.email = change;
  }

  passwordChanged(change) {
    this.password = change;
  }

  inviteCodeChanged(change) {
    this.invite_code = change;
  }

  login() {
    if (this.invite_code == undefined || !this.invite_code) {
      console.log("111");
      this.doLogin();
    } else {
      console.log("222");
      this.getTenantsInfo(this.invite_code);
    }
  }

  getTenantsInfo(code) {
    this.sessionService.tenantsInfo(code).subscribe(result => {
      let url = result.body.url;
      let uuid = result.body.uuid;
      localStorage.setItem("tenant_uuid", uuid);
      localStorage.setItem("base_url", url);
      this.doLoginWithTanent(url);
    });
  }

  doLogin() {
    let user_info = {
      email: this.email,
      password: this.password,
      device_name: this.device_name
    };
    this.sessionService.login(user_info).subscribe(result => {
      if (!result.success) {
        this.showError("Invalid login credentials. Please try again.");
      } else {
        localStorage.getItem("register_data");
        localStorage.setItem('push_popup_status', 'first');
        this.navCtrl.setRoot('EmpowerPage');
      }
    });
  }

  doLoginWithTanent(url) {
    let user_info = {
      email: this.email,
      password: this.password,
      device_name: this.device_name
    };
    this.sessionService.loginWithTenant(user_info, url).subscribe(result => {
      if (!result.success) {
        this.showError("Invalid login credentials. Please try again.");
      } else {
        localStorage.removeItem("register_data");
        localStorage.setItem('push_popup_status', 'first');
        this.navCtrl.setRoot('EmpowerPage');
      }
    });
  }

  autoLogin(data) {
    let user_info = {
      email: data.email,
      password: data.password,
      device_name: this.device_name
    };
    this.sessionService.login(user_info).subscribe(result => {
      if (!result.success) {
        this.showError("Invalid login credentials. Please try again.");
      } else {
        localStorage.removeItem("register_data");
        localStorage.setItem('push_popup_status', 'first');
        this.navCtrl.setRoot('EmpowerPage');
      }
    });
  }

  loginWithFacebook() {
    this.fb
      .login(["public_profile", "email"])
      .then((fbres: FacebookLoginResponse) => {
        // log into api with response
        if (fbres.authResponse) {
          this.sessionService
            .facebook(fbres.authResponse.accessToken)
            .subscribe(res => {
              if(res['status'] === 'success' || res['success'] === true) {
                localStorage.setItem('push_popup_status', 'first');
                this.navCtrl.setRoot('EmpowerPage');
              } else {
                this.showError("There was an error logging in with Facebook.");
              }
            });
        } else {
          // let the catch below handle it
          throw new Error("Invalid FB Response");
        }
      })
      .catch(e => {
        console.log("Error logging in with Facebook", e);
        this.showError("There was an error logging in with Facebook.");
      });
  }

  goToSignup() {
    this.navCtrl.setPages([{ page: "SignupPage" }]);
  }

  showError(message) {
    if (!this.errorToast) {
      this.errorToast = this.toastController.create({
        message,
        cssClass: "error-toast",
        position: "middle",
        showCloseButton: true,
        closeButtonText: "OK"
      });

      this.errorToast.onDidDismiss(() => {
        this.errorToast = null;
      });

      this.errorToast.present();
    }
  }
}
