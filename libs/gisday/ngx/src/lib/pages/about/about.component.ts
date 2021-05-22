import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  constructor(private titleService: Title) {
    this.titleService.setTitle('About | TxGIS Day 2020');
  }

  public ngOnInit(): void {}

  public makeActive(rank: string) {
    this.clearAllOtherPlaques();
    this.setPlaqueVisibleStatus(rank);
  }

  public clearAllOtherPlaques() {
    document.querySelectorAll('.plaque').forEach((elem) => {
      elem.classList.remove('active');
    });

    document.querySelectorAll('.content-block').forEach((elem) => {
      elem.classList.remove('visible');
    });
  }

  public setPlaqueVisibleStatus(rank: string) {
    const plaque = document.querySelector(`[rank=${rank}]`);
    const content = document.querySelector(`.content-block[rank=${rank}]`);

    if (plaque) {
      plaque.classList.add('active');
    }

    if (content) {
      content.classList.add('visible');
    }
  }
}
