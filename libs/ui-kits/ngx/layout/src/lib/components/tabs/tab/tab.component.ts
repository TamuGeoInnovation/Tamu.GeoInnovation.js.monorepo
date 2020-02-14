import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss']
})
export class TabComponent implements OnInit {
  @Input()
  public label: string;

  @ViewChild('template', { static: true })
  public template: TemplateRef<TabComponent>;

  constructor() {}

  public ngOnInit() {}
}
