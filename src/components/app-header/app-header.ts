import { Component, Input } from '@angular/core';
import { MenuController } from 'ionic-angular';

/**
 * Generated class for the AppHeaderComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'app-header',
  templateUrl: 'app-header.html'
})
export class AppHeaderComponent {

  @Input()
  errorToast;

  text: string;

  constructor(
    private menuController: MenuController
  ) { }

  showMenu() {
    if(this.errorToast) {
      this.errorToast.dismissAll();
    }

    this.menuController.enable(false, 'bgs');
    this.menuController.enable(true, 'main');
    this.menuController.toggle('main');
  }

}
