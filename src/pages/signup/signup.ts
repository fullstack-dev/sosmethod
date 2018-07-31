import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, Toast, Platform } from 'ionic-angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook';

import { SessionService } from './../../app/services/session.service';
import { Storage } from '@ionic/storage';
import validate from 'validate.js';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  firstName: string;
  lastName: string;
  email: string;
  password: string;
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
  ) { }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
    // redirect to empower page for logged in users
    if(this.isLoggedIn()) {
      this.navCtrl.setPages([{ page: 'EmpowerPage' }]);
    }
  }

  ionViewWillLeave() {
    if(this.errorToast) {
      this.errorToast.dismissAll();
    }
  }

  isLoggedIn() {
    return this.sessionService.isAuth();
  }

  firstNameChanged(change) {
    this.firstName = change;
  }

  lastNameChanged(change) {
    this.lastName = change;
  }

  emailChanged(change) {
    this.email = change;
  }

  passwordChanged(change) {
    this.password = change;
  }

  signupWithFacebook() {
    this.fb.login(['public_profile', 'email'])
      .then((fbres: FacebookLoginResponse) => {
        // log into api with response
        if(fbres.authResponse) {
          this.sessionService.facebook(fbres.authResponse.accessToken)
            .subscribe(res => {
              if(res['status'] === 'success' || res['success'] === true) {
                // redirect to empower page
                localStorage.setItem('push_popup_status', 'first');
                this.navCtrl.setRoot('EmpowerPage');
              } else {
                this.showError('There was an error signing up with Facebook.');
              }
            });
        } else {
          // let the catch below handle it
          throw new Error('Invalid FB Response');
        }
      })
      .catch(e => {
        console.log('Error signing up with Facebook', e);
        this.showError('There was an error signing up with Facebook.');
      });

  }

  signup() {

    // perform validation
    const constraints = {
      firstName: {
        presence: {
          allowEmpty: false,
        },
      },
      lastName: {
        presence: {
          allowEmpty: false,
        },
      },
      email: {
        presence: {
          allowEmpty: false,
        },
        email: true
      },
      password: {
        presence: {
          allowEmpty: false,
        },
        format: {
          pattern: "^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$",
          message: 'must be 8 characters long and contain big, small letters, digits, and special characters'
        }
      }
    };

    const validationErrors = validate({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }, constraints);

    let errors = '';

    if(validationErrors) {
      [
        'firstName',
        'lastName',
        'email',
        'password',
        'confirmPassword',
      ].map(field => {
        if(validationErrors[field]) {
          if(errors) {
            errors += ' \n';
          }
          errors += validationErrors[field];
        }
      })

      if(errors) {
        this.showError(errors);
      }

      return;
    }

    this.sessionService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      password: this.password
    }).subscribe(result => {
      if(!result.success) {
        this.showError((result.errors && result.errors.full_messages) ? result.errors.full_messages[0] : 'Registration Error')
      } else {
        // redirect to home or dashboard page
        this.signupFinished = true;
      }
    });
  }

  goToLogin() {
    this.navCtrl.setPages([{ page: 'LoginPage'}]);
  }

  showError(message) {
    if(!this.errorToast) {
      this.errorToast = this.toastController.create({
        message,
        cssClass: 'error-toast',
        position: 'middle',
        showCloseButton: true,
        closeButtonText: 'OK',
      });

      this.errorToast.onDidDismiss(() => {
        this.errorToast = null;
      });
      
      this.errorToast.present();
    }
  }

}
