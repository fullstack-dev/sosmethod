import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SubscribePage } from './subscribe';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    SubscribePage,
  ],
  imports: [
    IonicPageModule.forChild(SubscribePage),
    ComponentsModule
  ],
})
export class SubscribePageModule {}
