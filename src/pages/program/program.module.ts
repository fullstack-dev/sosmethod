import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

import { IonicAudioModule, defaultAudioProviderFactory } from 'ionic-audio';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { ProgramPage } from './program';

@NgModule({
  declarations: [
    ProgramPage,
  ],
  imports: [
    IonicPageModule.forChild(ProgramPage),
    RoundProgressModule,
    IonicAudioModule.forRoot(defaultAudioProviderFactory),
  ],
})
export class ProgramPageModule {}
