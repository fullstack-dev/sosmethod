import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmpowerPage } from './empower';

import { ComponentsModule } from '../../components/components.module';

@NgModule({
  declarations: [
    EmpowerPage,
  ],
  imports: [
    IonicPageModule.forChild(EmpowerPage),
    ComponentsModule
  ],
})
export class EmpowerPageModule {}
