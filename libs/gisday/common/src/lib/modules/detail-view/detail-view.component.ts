import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-detail-view',
  templateUrl: './detail-view.component.html',
  styleUrls: ['./detail-view.component.scss']
})
export class DetailViewComponent implements OnInit {
  @Input()
  public viewTitle: string;

  @Input()
  public viewSubtitle?: string;

  @Input()
  public picture?: string;

  @Input()
  public entityTitle?: string;

  @Input()
  public entitySubtitle?: string;

  @Input()
  public entityText?: string;

  @Input()
  public contactName?: string;

  @Input()
  public contactEmail?: string;

  @Input()
  public website?: string;

  constructor() {}

  public ngOnInit(): void {}
}
