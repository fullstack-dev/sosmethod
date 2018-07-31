import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

import { CommonService } from './../../app/services/common.service';
import { SurveyService } from './../../app/services/survey.service';
import { ColorService } from './../../app/services/color.service';

import { Throttle } from 'lodash-decorators';

@IonicPage()
@Component({
  selector: 'page-survey',
  templateUrl: 'survey.html',
})
export class SurveyPage {

  percentageResponse = 50;
  survey;
  programId;
  programClassId;
  startColor = '#FF3558'; //'#e69598';
  endColor = '#006196';
  hasSliderChanged = false;
  userIconColor = '#000000';
  question;

  constructor(
    private navParams: NavParams,
    private surveyService: SurveyService,
    private viewController: ViewController,
    private commonService: CommonService,
    private colorService: ColorService,
    sanitizer: DomSanitizer,
  ) {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad SurveyPage');
    // Ideally we would fetch this since it might end up being multiple questions at a time
    // this.surveyService.show(this.navParams.get('surveyId'))
    //   .subscribe(result => {
    //     console.log('survey result', result);
    //     this.survey = result;
    //   })

    // Temporarily just using the survey as it was attached to the program
    this.survey = this.navParams.get('survey');
    this.programId = this.navParams.get('programId');
    this.programClassId = this.navParams.get('programClassId');
    if(this.navParams.get('isPostMeditation') && this.survey.alternate_question) {
      this.question = this.survey.alternate_question;
    } else {
      this.question = this.survey.question;
    }
    
    const color = this.colorService.getColor(this.survey.color);
    this.startColor = color.start;
    this.endColor = color.end;

    setTimeout(() => {
      this.sliderChanged({value: 50}, false);
    }, 100);
  }

  sliderChanged(event, markChanged = true) {
    const fillColor = this.colorService.findColorBetweenRainbowColors(this.percentageResponse);
    this.userIconColor = fillColor;

    if(markChanged) {
      this.hasSliderChanged = true;
    }

    // positioning
    const icon = document.getElementById('survey-user-icon');
    const slider = document.querySelector('input[type=range]');

    // 42 and 84 are hardcoded values for the thumb width
    let leftValue = (slider.clientWidth / 100 * this.percentageResponse) - 42;
    const minLeftValue = 0;
    const maxLeftValue = slider.clientWidth - 84;
    if(leftValue > maxLeftValue) {
      leftValue = maxLeftValue;
    } else if(leftValue < minLeftValue) {
      leftValue = minLeftValue;
    }

    icon.style.left = leftValue + 'px';
  }

  continue() {
    // send http request
    this.surveyService.respond(
      this.commonService.getData('user').id,//userId
      this.survey.id,
      this.programClassId,
      this.percentageResponse
    ).subscribe(response => {
      // we dont really need to do anything with the response
    })
    
    this.viewController.dismiss();
  }

  getGradient() {
    return `linear-gradient(to right, ${this.startColor} 1%, ${this.endColor} 100%)`;
  }

  head: HTMLHeadElement;
  thumbStyleTag;

  addSliderThumbStyling() {
    if(!this.head) {
      this.head = document.getElementsByTagName('head')[0];
    }
    const css = this.sliderThumbStyles();
    if(!this.thumbStyleTag) {
      this.thumbStyleTag = document.getElementById('slider-styles') as HTMLStyleElement;
    }
    this.thumbStyleTag = document.createElement('style');
    this.thumbStyleTag.type = 'text/css';
    this.thumbStyleTag.id = 'slider-styles';
    this.thumbStyleTag.className = 'slider-styles';
    this.thumbStyleTag.appendChild(document.createTextNode(css));
    this.thumbStyleTag.innerText = css;
    this.head.appendChild(this.thumbStyleTag);
  }

  ionViewDidLeave() {
    // remove hacky style elements
    const sliderStyleElements = document.querySelectorAll('.slider-styles');
    if(!this.head) {
      this.head = document.getElementsByTagName('head')[0];
    }
    for (var i = 0; i < sliderStyleElements.length; i++) {
      this.head.removeChild(sliderStyleElements[i]);
    };
  }


  // has to be a function instead of a component to inline into a style value
  userIcon() {
    const fillColor = this.colorService.findColorBetweenRainbowColors(this.percentageResponse);
    return `%3c?xml version='1.0' encoding='UTF-8' standalone='no'?%3e%3csvg xmlns:dc='http://purl.org/dc/elements/1.1/' xmlns:cc='http://creativecommons.org/ns%23' xmlns:rdf='http://www.w3.org/1999/02/22-rdf-syntax-ns%23' xmlns:svg='http://www.w3.org/2000/svg' xmlns='http://www.w3.org/2000/svg' version='1.1' id='svg80' width='324' height='264' viewBox='0 0 324 264'%3e%3cdefs id='defs84' /%3e%3cellipse style='fill:%23${fillColor};fill-rule:evenodd;fill-opacity:1' id='path136' cx='158.20312' cy='74.742188' rx='60.15625' ry='59.179688' /%3e%3cpath style='opacity:1;fill:%23${fillColor};fill-opacity:1;stroke-width:0.390625;stroke:%23${fillColor};stroke-opacity:1' d='M 40.966379,99.800662 C 29.096261,86.999865 19.384347,76.397033 19.384347,76.238814 c 0,-0.355343 42.847231,-47.465116 43.258489,-47.561943 0.260293,-0.06128 3.623859,3.626413 6.864613,7.526119 l 1.099664,1.323261 -16.617192,17.679414 -16.61719,17.679415 -0.0098,3.445152 -0.0098,3.445153 16.40625,17.151605 c 9.023438,9.43339 16.406251,17.30341 16.406251,17.48895 0,0.36125 -6.904176,8.40507 -7.350672,8.56402 -0.146586,0.0522 -9.97843,-10.3785 -21.848547,-23.179298 z' id='path4648' /%3e%3cpath style='opacity:1;fill:%23${fillColor};fill-opacity:1;stroke-width:0.390625' d='m 240.75647,118.86683 -4.2005,-4.21356 16.59817,-17.563784 16.59817,-17.563781 0.002,-3.125 0.002,-3.125 -16.58555,-17.71219 -16.58554,-17.712189 2.78792,-3.381561 c 1.53337,-1.859858 3.24421,-3.952844 3.80188,-4.65108 0.55768,-0.698236 1.18974,-1.257062 1.40458,-1.241835 0.46819,0.03318 43.70973,46.978929 43.66281,47.403105 -0.0273,0.247262 -43.01895,47.100435 -43.21849,47.100435 -0.0369,0 -1.95724,-1.8961 -4.26751,-4.21356 z' id='path4650' /%3e%3cpath style='opacity:1;fill:%23${fillColor};fill-opacity:1;stroke:%23${fillColor};stroke-width:0.55242717;stroke-opacity:1' d='m 127.64565,233.40917 c -46.925334,-0.25186 -85.470715,-0.64598 -85.656399,-0.87583 -0.185683,-0.22984 -0.15953,-13.3447 0.05812,-29.14411 0.431583,-31.32911 0.464721,-31.65372 3.761943,-36.8518 0.907529,-1.43073 2.697059,-3.35977 3.976735,-4.28676 4.892786,-3.54432 -1.976399,-3.33183 107.710521,-3.33183 96.62259,0 99.94877,0.0339 103.22053,1.05219 5.00655,1.55822 8.54531,4.44877 10.54727,8.61528 1.0088,2.09954 1.06234,3.7865 1.07387,33.83617 l 0.0121,31.62645 -29.69296,-0.0909 c -16.33113,-0.05 -68.08642,-0.29699 -115.01176,-0.54885 z' id='path4654' /%3e%3c/svg%3e`;
  }

  sliderThumbStyles() {
    const userIcon = this.userIcon();
    return (`
      /* Special styling for WebKit/Blink */
      input[type=range]::-webkit-slider-thumb {
        height: 84px;
        width: 84px;
        cursor: pointer;
        margin-top: 0; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
        background: url("data:image/svg+xml;charset=UTF-8,${userIcon}") bottom no-repeat;
        background-size: contain;
        border: 0;
        -webkit-backface-visibility: hidden;
        will-change: background;
      }
      input[type=range]::-moz-range-thumb {
        height: 84px;
        width: 84px;
        cursor: pointer;
        background: url("data:image/svg+xml;charset=UTF-8,${userIcon}") bottom no-repeat;
        background-size: contain;
        border: 0;
        -webkit-backface-visibility: hidden;
        will-change: background;
      }
      input[type=range]::-ms-thumb {
        height: 84px;
        width: 84px;
        cursor: pointer;
        background: url("data:image/svg+xml;charset=UTF-8,${userIcon}") bottom no-repeat;
        background-size: contain;
        border: 0;
        -webkit-backface-visibility: hidden;
        will-change: background;
      }
    `);
  }

}
