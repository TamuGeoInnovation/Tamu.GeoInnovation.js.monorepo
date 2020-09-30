import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';

@Component({
  selector: 'tamu-gisc-admin-view-tags',
  templateUrl: './admin-view-tags.component.html',
  styleUrls: ['./admin-view-tags.component.scss']
})
export class AdminViewTagsComponent implements OnDestroy, OnInit {
  public $tags: Observable<Array<Partial<Tag>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private readonly tagService: TagService) {
    this.fetchEntities();
  }

  ngOnInit(): void {}

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEntities() {
    this.$tags = this.tagService.getEntities();
  }
}
