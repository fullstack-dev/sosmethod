import { Component, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Generated class for the SurveyUserIconComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'survey-user-icon',
  templateUrl: 'survey-user-icon.html',
})
export class SurveyUserIconComponent {

  @Input()
  color = '#0186cb';
  sanitizer;

  constructor(
    sanitizer: DomSanitizer
  ) {
    this.sanitizer = sanitizer;
  }

}
