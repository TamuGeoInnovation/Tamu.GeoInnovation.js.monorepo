import { Component, OnDestroy, OnInit } from '@angular/core';
import { shareReplay } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';

import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';

@Component({
  selector: 'tamu-gisc-admin-edit-tags',
  templateUrl: './admin-edit-tags.component.html',
  styleUrls: ['./admin-edit-tags.component.scss']
})
export class AdminEditTagsComponent implements OnInit, OnDestroy {
  public $tags: Observable<Array<Partial<Tag>>>;
  private _$destroy: Subject<boolean> = new Subject();

  constructor(private readonly tagService: TagService) {}

  ngOnInit(): void {
    this.fetchEntities();
  }

  public ngOnDestroy() {
    this._$destroy.next();
    this._$destroy.complete();
  }

  public fetchEntities() {
    this.$tags = this.tagService.getEntities().pipe(shareReplay(1));
  }

  public deleteEntity(entity: Tag) {
    console.log('deleteEntity', entity);
    this.tagService.deleteEntity(entity.guid).subscribe((deleteStatus) => {
      console.log('Deleted ', entity.guid);
      this.fetchEntities();
    });
  }
}
