import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';

@Component({
  selector: 'tamu-gisc-admin-view-tags',
  templateUrl: './admin-view-tags.component.html',
  styleUrls: ['./admin-view-tags.component.scss']
})
export class AdminViewTagsComponent implements OnInit {
  public $tags: Observable<Array<Partial<Tag>>>;

  constructor(private readonly tagService: TagService) {
    this.fetchEntities();
  }

  ngOnInit(): void {}

  public fetchEntities() {
    this.$tags = this.tagService.getEntities();
  }
}
