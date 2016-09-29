import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs/Rx';
import { find, difference } from 'lodash';
import { GuideService } from './guide.service';

let tpl = require('./guide.template.html');
let style = require('./guide.css');

@Component({
  selector: 'quick-guide',
  template: tpl,
  styles: [style],
  encapsulation: ViewEncapsulation.None
})

export class GuideComponent implements OnInit, OnDestroy {
  private isShowGuide: boolean = !Boolean(localStorage.getItem('quick-guide'));
  private description: string;
  private bubbles: any[];
  private isShowBubble: boolean = false;
  private guideService: GuideService;
  private guideServiceSubscribe: Subscription;

  @Output('startQuickGuide')
  private startQuickGuide: EventEmitter<any> = new EventEmitter<any>();

  public constructor(guideService: GuideService) {
    this.guideService = guideService;
  }

  public ngOnInit(): void {
    this.guideServiceSubscribe = this.guideService.getGuide()
      .subscribe((res: any) => {
        if (res.err) {
          console.error(res.err);
          return;
        }

        let welcomeHeader: any = find(res.data, ['name', 'welcomeHeader']);

        this.description = welcomeHeader.description;
        this.bubbles = difference(res.data, [welcomeHeader]);
      });
  }

  public ngOnDestroy(): void {
    this.guideServiceSubscribe.unsubscribe();
  }

  protected openQuickGuide(): void {
    this.isShowGuide = false;
    this.isShowBubble = true;
    this.startQuickGuide.emit({});
  }

  protected close(): void {
    this.isShowGuide = false;
    this.startQuickGuide.emit({});
    localStorage.setItem('quick-guide', 'true');
  }
}
