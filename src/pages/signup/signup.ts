import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Toast, Platform } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';
import { Device } from '@ionic-native/device';

import { SessionService } from './../../app/services/session.service';
import { Storage } from '@ionic/storage';
import validate from 'validate.js';
import * as _ from 'lodash';

@IonicPage()
@Component({
  selector: "page-signup",
  templateUrl: "signup.html"
})
export class SignupPage {

  first_name: string;
  last_name: string;
  email: string;
  password: string;
  device_name: string;
  nickname: string;
  invite_code: string;
  tenant_url: string;
  confirmPassword: string;
  signupFinished = false;

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
    this.platform.ready().then( () => {
        if(this.platform.is('ios')) {
          this.device_name = this.device.model;
        }else if (this.platform.is('android')) {
          this.device_name = (window as any).device.name;
        } else {
          this.device_name = '';
        }
        if(!this.device_name){
          this.device_name = 'iphone7, 2';
        }
      });

  }

  ionViewDidLoad() {
    console.log("ionViewDidLoad LoginPage");
    // redirect to empower page for logged in users
    if (this.isLoggedIn()) {
      this.navCtrl.setPages([{ page: "EmpowerPage" }]);
    }
  }

  ionViewWillLeave() {
    if (this.errorToast) {
      this.errorToast.dismissAll();
    }
  }

  isLoggedIn() {
    return this.sessionService.isAuth();
  }

  firstNameChanged(change) {
    this.first_name = change;
  }

  lastNameChanged(change) {
    this.last_name = change;
  }

   nicknameChanged(change) {
    this.nickname = change;
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

  signupWithFacebook() {
    this.fb
      .login(["public_profile", "email"])
      .then((fbres: FacebookLoginResponse) => {
        // log into api with response
        if (fbres.authResponse) {
          this.sessionService
            .facebook(fbres.authResponse.accessToken)
            .subscribe(res => {
              if (res["status"] === "success" || res["success"] === true) {
                // redirect to empower page
                localStorage.setItem('push_popup_status', 'first');
                this.navCtrl.setRoot('EmpowerPage');
              } else {
                this.showError("There was an error signing up with Facebook.");
              }
            });
        } else {
          // let the catch below handle it
          throw new Error("Invalid FB Response");
        }
      })
      .catch(e => {
        console.log("Error signing up with Facebook", e);
        this.showError("There was an error signing up with Facebook.");
      });
  }

  signup() {
    const constraints = {
      email: {
        presence: {
          allowEmpty: false
        },
        email: true
      },
      password: {
        presence: {
          allowEmpty: false
        },
        format: {
          pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^ws]).{8,}$",
          message:
            "must be 8 characters long and contain big, small letters, digits, and special characters"
        }
      }
    };
    const validationErrors = validate(
      {
        email: this.email,
        password: this.password
      },
      constraints
    );

    let errors = "";

    if (validationErrors) {
      [
        "email",
        "password"
      ].map(field => {
        if (validationErrors[field]) {
          if (errors) {
            errors += " \n";
          }
          errors += validationErrors[field];
        }
      });
      if (errors) {
        this.showError(errors);
      }
      return;
    }
    this.doRegister();
  }

  doRegister() {
    if (this.invite_code == undefined || !this.invite_code) {
      this.getRegister();
    }else{
      this.getTenantsInfo(this.invite_code);
    }
  }

  getTenantsInfo (code) {
    this.sessionService.tenantsInfo(code).subscribe(result => {
      this.tenant_url = result.body.url;
      localStorage.setItem("tenant_url", this.tenant_url);
      localStorage.setItem("tenant_uuid", result.body.uuid);
      this.getRegister();
    });
  }

  getRegister() {
    const user_data = {
      first_name: this.first_name,
      last_name: this.first_name,
      nickname: this.nickname,
      email: this.email,
      password: this.password,
      device_name: this.device_name
    };
    const register_data = { email: this.email, password: this.password };
    const user_body = _.pickBy(user_data, _.identity);

    if(!this.tenant_url){
      this.sessionService.register(user_body).subscribe(result => {
        if (!result.success) {
          this.showError(result.errors && result.errors.full_messages ? result.errors.full_messages[0] : "Registration Error");
        } else {
          // redirect to home or dashboard page
          localStorage.setItem("register_data", JSON.stringify(register_data));
          this.signupFinished = true;
        }
      });
    } else {
      this.sessionService.registerWithTenant(user_body, this.tenant_url).subscribe(result => {
        if (!result.success) {
          this.showError(result.errors && result.errors.full_messages ? result.errors.full_messages[0] : "Registration Error");
        } else {
          // redirect to home or dashboard page
          localStorage.setItem("register_data", JSON.stringify(register_data));
          this.signupFinished = true;
        }
      });
    }
  }

  goToLogin() {
    this.navCtrl.setPages([{ page: "LoginPage" }]);
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
