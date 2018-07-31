import { Component, EventEmitter, Input, Output, OnInit, OnChanges } from '@angular/core';

@Component({
  selector: 'bordered-button',
  templateUrl: 'bordered-button.html'
})
export class BorderedButtonComponent implements OnInit, OnChanges {
  
  @Input()
  text: string;

  @Input()
  color: 'blue'|'yellow'|'purple'|'pink'|'green';

  @Input()
  type: 'submit'|'button';

  @Output()
  click = new EventEmitter();

  src: string;

  constructor() { }

  ngOnInit() {
    this.src = `assets/imgs/buttons/buttons_${this.color}.png`;
  }

  ngOnChanges() {
    this.src = `assets/imgs/buttons/buttons_${this.color}.png`;
  }

  clicked($event) {
    this.click.emit($event);
  }

}
