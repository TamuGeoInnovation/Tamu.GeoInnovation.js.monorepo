import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'tamu-gisc-footer-legal',
    templateUrl: './legal.component.html',
    styleUrls: ['./legal.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class FooterLegalComponent implements OnInit {
  public currentYear: number;

  public ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
  }
}
