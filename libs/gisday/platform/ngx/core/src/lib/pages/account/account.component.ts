import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('Account | TxGIS Day 2022');
  }

  public ngOnInit(): void {}
}
