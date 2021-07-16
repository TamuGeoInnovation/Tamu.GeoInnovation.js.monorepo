import { Component, OnDestroy, OnInit } from '@angular/core';

import { StrapiService } from '../../data-access/strapi.service';
import { StrapiLocales, StrapiPages } from '../../types/types';
@Component({
  selector: 'tamu-gisc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [StrapiService]
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(private ss: StrapiService) {}

  ngOnInit() {
    this.ss.getPage('home').subscribe((result) => {
      console.log(result);
    });
  }

  ngOnDestroy() {}
}
