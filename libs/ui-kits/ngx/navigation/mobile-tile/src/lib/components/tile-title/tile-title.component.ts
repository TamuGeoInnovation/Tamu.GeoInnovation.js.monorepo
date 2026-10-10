import { Component, OnInit, ElementRef, ChangeDetectionStrategy, inject } from '@angular/core';

@Component({
  selector: 'tamu-gisc-tile-title',
  templateUrl: './tile-title.component.html',
  styleUrls: ['./tile-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager
})
export class TileTitleComponent implements OnInit {
  private view = inject(ElementRef);

  public title: string;

  public ngOnInit() {
    this.title = (this.view.nativeElement as HTMLElement).innerText;
  }
}
