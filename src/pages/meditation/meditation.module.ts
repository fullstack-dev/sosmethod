import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MeditationPage } from './meditation';

@NgModule({
  declarations: [
    MeditationPage,
  ],
  imports: [
    IonicPageModule.forChild(MeditationPage),
  ],
})
export class MeditationPageModule {}
