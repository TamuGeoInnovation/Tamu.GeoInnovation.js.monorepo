import { Component, OnInit } from '@angular/core';

import { BasePopupComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-ring-day-markdown',
  templateUrl: './ring-day-markdown.component.html',
  styleUrls: ['./ring-day-markdown.component.scss']
})
export class RingDayMarkdownComponent extends BasePopupComponent implements OnInit {
  public title: string;
  public isContentTheSame: boolean;

  public ngOnInit(): void {
    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data.layer.title;

    this.isContentTheSame = this.data?.attributes?.description === this.data?.attributes?.Notes;
  }
}
