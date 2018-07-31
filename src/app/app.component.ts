import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Storage } from '@ionic/storage';
import { Platform, NavController, App } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';
import { IsDebug } from '@ionic-native/is-debug';

import { ENV } from '@app/env';

import { HockeyApp } from 'ionic-hockeyapp';

import { SessionService } from './services/session.service';
import { CommonService } from './services/common.service';
import { SubscriptionService } from './services/subscription.service';
// import { PushService } from './services/push.service';

// import { Push, PushObject, PushOptions } from '@ionic-native/push';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {

  @ViewChild('navContent') nav: NavController;

  rootPage:any = 'SignupPage';
  isSubscribed = false;
  showingVideo = true;
  localVideoUrl = 'assets/intro.mp4';
  videoUrl;
  shouldShowGif = false;
  gifUrl = '';

  connectSubscription;
  disconnectSubscription;

  menuLinks = [
    {
      url: 'http://sosmethod.co/help-center',
      text: 'About'
    },
    {
      url: 'http://sosmethod.co/contact',
      text: 'Contact Us'
    },
    {
      url: 'http://sosmethod.co/gift',
      text: 'Send a Gift'
    },
    {
      url: 'http://sosmethod.co/work',
      text: 'SOS for Work'
    },
    {
      url: 'http://sosmethod.co/terms',
      text: 'Terms & Conditions'
    },
    {
      url: 'http://sosmethod.co/privacy',
      text: 'Privacy Policy'
    },
    
  ];

  isLoggedIn() {
    return this.sessionService.isAuth();
  }

  goTo(page: string) {
    this.nav.setPages([{ page }]);
  }

  logout() {
    // this.sessionService.logout();
    // this.nav.setPages([{ page: 'LoginPage' }]);
    this.commonService.logout();
  }

  loadVideoForAndroid(cb) {
    const path = this.fileService.applicationDirectory + 'www/assets';
    const fileName = 'intro.mp4';
    const newPath = this.fileService.externalApplicationStorageDirectory;


    setInterval(() => {
      console.log('file service', this.fileService);
    }, 10000);

    this.fileService.copyFile(
      path,
      fileName,
      newPath,
      fileName
    ).then(fileEntry => {
      console.log('file copied: ', fileEntry);
      const url = fileEntry.nativeURL.replace('file:///', '');
      this.videoUrl = url;
      window.localStorage.setItem('androidVideoUrl', url);
      cb();
    }).catch(error => {
      console.log('file copy error: ', error);
      // if the file already exists we get an error
      // we try to ignore it and just set the video anyway
      this.videoUrl = window.localStorage.getItem('androidVideoUrl');
      cb();
    });
  }

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private sessionService: SessionService,
    private commonService: CommonService,
    private subscriptionService: SubscriptionService,
    private fileService: File,
    private sanitizer: DomSanitizer,
    private network: Network,
    private debug: IsDebug,
    private hockey: HockeyApp,
    private app: App,
    public storage: Storage
  ) {
    
    console.log("globals", ENV.URL);

    this.videoUrl = this.localVideoUrl;
    //this.videoUrl = 'https://969a6023.ngrok.io/intro.mp4';
    // this.videoUrl = this.sanitizer.bypassSecurityTrustUrl(introVideoDataUri);
    
    platform.ready().then(async () => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.hide();

      let isDebug = false;

      if(this.platform.is('cordova')) {
        isDebug = await debug.getIsDebug();
        
        if(isDebug) {
          // The Android ID of the app as provided by the HockeyApp portal. Can be null if for iOS only.
          let androidAppId = '8e3d8709a9bb44a5a5781510e5b6bc73';
          // The iOS ID of the app as provided by the HockeyApp portal. Can be null if for android only.
          let iosAppId = 'd891624ba47a41c3bd66b9653c77e534';
          // Specifies whether you would like crash reports to be automatically sent to the HockeyApp server when the end user restarts the app.
          let autoSendCrashReports = true;
          // Specifies whether you would like to display the standard dialog when the app is about to crash. This parameter is only relevant on Android.
          let ignoreCrashDialog = true;

          hockey.start(androidAppId, iosAppId, autoSendCrashReports, ignoreCrashDialog);

          //So app doesn't close when hockey app activities close
          //This also has a side effect of unable to close the app when on the rootPage and using the back button.
          //Back button will perform as normal on other pages and pop to the previous page.
          platform.registerBackButtonAction(() => {
            let nav = app.getRootNav();
            if (nav.canGoBack()) {
              nav.pop();
            } else {
              nav.setRoot(this.rootPage);
            }
          });
        }
        
      }

      // TODO: something about this doesnt look right
      // does subscription service always resolve hasSubscription before this event?
      this.sessionService.hasSubscription.subscribe(result => {
        this.isSubscribed = result || this.subscriptionService.hasSubscription;
      });

      this.commonService.loggedOut.subscribe(loggedOut => {
        this.nav.setPages([{ page: 'LoginPage' }]);
      });

      this.subscriptionService.initialize();

      if(this.platform.is('android') && this.platform.version() < 7) {
        this.showingVideo = false;
      } else {
        setTimeout(() => {
          this.showingVideo = false;
        }, 3700);
      }

      splashScreen.hide();

      if(this.network.type === 'unknown') {
        if(isDebug) {
          alert('No Network found on launch.');
        }
      }

      this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
        console.log('network was disconnected :-(');
        if(isDebug) {
          alert('Network Disconnected');
        }
      });

      this.connectSubscription = this.network.onConnect().subscribe(() => {
        console.log('network reconnected!');
        // We just got a connection but we need to wait briefly
        // before we determine the connection type. Might need to wait.
        // prior to doing any api requests as well.
        setTimeout(() => {
          if(isDebug) {
            alert('Network Reconnected');
          }
          if (this.network.type === 'wifi') {
            console.log('we got a wifi connection, woohoo!');
          }
        }, 3000);
      });

    });
  }  
}
