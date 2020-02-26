import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tile-title',
  templateUrl: './tile-title.component.html',
  styleUrls: ['./tile-title.component.scss']
})
export class TileTitleComponent implements OnInit {
  public title: string;

  constructor(private view: ElementRef) {}

  public ngOnInit() {
    this.title = (this.view.nativeElement as HTMLElement).innerText;
  }
}
