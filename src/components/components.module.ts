import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from 'ionic-angular';

import { AppHeaderComponent } from './app-header/app-header';
import { BorderedButtonComponent } from './bordered-button/bordered-button';
import { SurveyUserIconComponent } from './survey-user-icon/survey-user-icon';

@NgModule({
	declarations: [AppHeaderComponent,
    BorderedButtonComponent,
    SurveyUserIconComponent,],
	imports: [
		IonicModule
	],
	exports: [AppHeaderComponent,
    BorderedButtonComponent,
	SurveyUserIconComponent,],
	schemas: [NO_ERRORS_SCHEMA]
})
export class ComponentsModule {}
