import { Component, OnInit } from '@angular/core';

import { BaseDirectionsComponent } from '../base-directions/base-directions.component';

@Component({
  selector: 'tamu-gisc-markdown-w-directions-popup',
  templateUrl: './markdown-w-directions-popup.component.html',
  styleUrls: ['./markdown-w-directions-popup.component.scss']
})
export class MarkdownWDirectionsPopupComponent extends BaseDirectionsComponent implements OnInit {
  public title: string;
  public isContentTheSame: boolean;
  public isContentLengthZero: boolean;

  public override ngOnInit(): void {
    super.ngOnInit();

    this.title = this.data?.attributes?.title ? this.data.attributes.title : this.data.layer.title;

    this.isContentTheSame = this.data?.attributes?.description === this.data?.attributes?.Notes;

    this.isContentLengthZero =
      typeof this.data?.attributes?.description === 'string' && this.data?.attributes?.description.trim().length === 0;
  }

  public override startDirections() {
    super.startDirections(`${this.data.attributes.OBJECTID}`);
  }
}
