import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SurveyPage } from './survey';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    SurveyPage,
  ],
  imports: [
    IonicPageModule.forChild(SurveyPage),
    ComponentsModule,
  ],
})
export class SurveyPageModule {}
