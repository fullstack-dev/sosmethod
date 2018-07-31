import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { IsDebug } from '@ionic-native/is-debug';
import { File } from '@ionic-native/file';
import { Network } from '@ionic-native/network';

import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2';
import { Facebook } from '@ionic-native/facebook';

import { IonicAudioModule, defaultAudioProviderFactory, WebAudioProvider } from 'ionic-audio';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { HockeyApp } from 'ionic-hockeyapp';

import { CommonService } from './services/common.service';
import { SessionService } from './services/session.service';
import { ProgramService } from './services/program.service';
import { UserService } from './services/user.service';
import { UserClassService } from './services/user-class.service';
import { SubscriptionService } from './services/subscription.service';
import { ReviewService } from './services/review.service';
import { BackgroundService } from './services/background.service';
import { ToolService } from './services/tool.service';
import { SurveyService } from './services/survey.service';
import { ColorService } from './services/color.service';
import { PushService } from './services/push.service';

import { ExpiredInterceptor } from './interceptors/expired.interceptor';

import { MyApp } from './app.component';

import { Push } from '@ionic-native/push';
import { IonicStorageModule } from '@ionic/storage';
@NgModule({
  declarations: [
    MyApp,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp, {
      platforms: {
        android: {
          activator: 'none'
        }
      }
    }),
    HttpClientModule,
    RoundProgressModule,
    IonicAudioModule.forRoot(WebAudioProvider),
    NgIdleKeepaliveModule.forRoot(),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    StatusBar,
    SplashScreen,
    IsDebug,
    File,
    Network,
    Push,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    CommonService,
    SessionService,
    ProgramService,
    UserService,
    UserClassService,
    SubscriptionService,
    ReviewService,
    BackgroundService,
    ToolService,
    SurveyService,
    ColorService,
    PushService,
    InAppPurchase2,
    Facebook,
    HockeyApp,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ExpiredInterceptor,
      multi: true
    }
  ]
})
export class AppModule {}
