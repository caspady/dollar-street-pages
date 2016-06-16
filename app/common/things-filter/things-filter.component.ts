import {Component, OnDestroy, OnChanges, Inject, Input, Output, EventEmitter} from '@angular/core';
import {RouterLink, Router} from '@angular/router-deprecated';

import {ThingsFilterPipe} from './things-filter.pipe';

let tpl = require('./things-filter.template.html');
let style = require('./things-filter.css');

@Component({
  selector: 'things-filter',
  template: tpl,
  styles: [style],
  directives: [RouterLink],
  pipes: [ThingsFilterPipe]
})

export class ThingsFilterComponent implements OnDestroy, OnChanges {
  protected relatedThings:any[];
  protected otherThings:any[];
  protected activeThing:any = {};
  protected search:{text:string;} = {text: ''};
  protected isOpenThingsFilter:boolean = false;
  protected placeComponent:boolean;
  @Input()
  protected activeFilter:string;
  @Input()
  private url:string;
  @Output()
  private selectedFilter:EventEmitter<any> = new EventEmitter();
  @Output()
  private activatedFilter:EventEmitter<any> = new EventEmitter();
  private thingsFilterService:any;
  private thingsFilterServiceSubscribe:any;
  private router:Router;

  public constructor(@Inject(Router) router:Router,
                     @Inject('ThingsFilterService') thingsFilterService:any) {
    this.thingsFilterService = thingsFilterService;
    this.router = router;
    this.placeComponent = this.router.hostComponent.name === 'PlaceComponent';
  }

  protected openThingsFilter(isOpenThingsFilter:boolean):void {
    this.isOpenThingsFilter = !isOpenThingsFilter;

    this.activatedFilter.emit(this.isOpenThingsFilter ? 'things' : '');
  }

  protected goToThing(thing:any):void {
    if (thing.empty) {
      return;
    }

    let query = this.parseUrl(this.url);
    query.thing = thing.thingName;

    this.selectedFilter.emit({url: this.objToQuery(query), thing: this.activeThing});
    this.isOpenThingsFilter = false;
    this.search = {text: ''};
  }

  public ngOnDestroy():void {
    this.thingsFilterServiceSubscribe.unsubscribe();
  }

  public ngOnChanges(changes:any):void {
    if (changes.url && changes.url.currentValue) {
      if (this.thingsFilterServiceSubscribe) {
        this.thingsFilterServiceSubscribe.unsubscribe();
        this.thingsFilterServiceSubscribe = void 0;
      }

      this.thingsFilterServiceSubscribe = this
        .thingsFilterService
        .getThings(this.url)
        .subscribe((res:any) => {
          if (res.err) {
            return res.err;
          }

          this.relatedThings = res.data.relatedThings;
          this.otherThings = res.data.otherThings;
          this.activeThing = res.data.thing;
        });
    }

    if (
      this.isOpenThingsFilter &&
      changes.activeFilter &&
      changes.activeFilter.currentValue &&
      changes.activeFilter.currentValue !== 'things'
    ) {
      this.isOpenThingsFilter = false;
      this.search = {text: ''};
    }
  }

  private objToQuery(data:any):string {
    return Object.keys(data).map((k:string) => {
      return encodeURIComponent(k) + '=' + data[k];
    }).join('&');
  }

  private parseUrl(url:string):any {
    let urlForParse = ('{\"' + url.replace(/&/g, '\",\"') + '\"}').replace(/=/g, '\":\"');
    let query = JSON.parse(urlForParse);

    if (query.regions) {
      query.regions = query.regions.split(',');
    }

    if (query.countries) {
      query.countries = query.countries.split(',');
    }

    return query;
  }
}
