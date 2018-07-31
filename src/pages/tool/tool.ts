import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

import { ToolService } from '../../app/services/tool.service';

@IonicPage()
@Component({
  selector: 'page-tool',
  templateUrl: 'tool.html',
})
export class ToolPage {

  tool;

  content;

  constructor(
    private navParams: NavParams,
    private toolService: ToolService,
    private viewController: ViewController,
    private sanitizer: DomSanitizer,
  ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ToolPage');
  }

  ngOnInit() {
    this.toolService.show(this.navParams.get('toolId')).subscribe(tool => {
      this.tool = tool;
      this.content = this.trustedContent();
    })
  }

  goBack() {
    this.viewController.dismiss();
  }

  trustedContent() {
    if(this.tool && this.tool.content_html) {
      console.log('returning bypassed string');
      return this.sanitizer.bypassSecurityTrustHtml(this.tool.content_html);
    }
    console.log('no content');
    return '';
  }

}
