import { Component, OnInit } from '@angular/core';

import { BaseDirectionsComponent } from '@tamu-gisc/aggiemap/ngx/popups';

@Component({
  selector: 'tamu-gisc-ring-day-markdown-w-directions',
  templateUrl: './ring-day-markdown-w-directions.component.html',
  styleUrls: ['./ring-day-markdown-w-directions.component.scss']
})
export class RingDayMarkdownWDirectionsComponent extends BaseDirectionsComponent implements OnInit {
  public title: string;
  public isContentTheSame: boolean;

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.name ? this.data.attributes.name : this.data.layer.title;

    this.isContentTheSame = this.data?.attributes?.description === this.data?.attributes?.Notes;
  }

  public override startDirections() {
    super.startDirections(`${this.data.attributes.OBJECTID}`);
  }
}
