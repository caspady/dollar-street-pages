import { Component, OnInit } from 'angular2/core';
import {SocialShareButtons} from '../social_share_buttons/social_share_buttons.component';

let tpl = require('./footer.main.component.html');
let style = require('./footer.main.component.css');

@Component({
  selector: 'footer-main',
  template: tpl,
  styles: [style],
  directives: [SocialShareButtons]
})

export class FooterMainComponent {

}