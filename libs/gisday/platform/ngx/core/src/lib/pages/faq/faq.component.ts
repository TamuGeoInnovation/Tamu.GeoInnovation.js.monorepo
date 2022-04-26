import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'tamu-gisc-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent {
  constructor(private titleService: Title) {
    this.titleService.setTitle('FAQ | TxGIS Day 2022');
  }

  public onFaqItemClick(event) {
    const faqItem: HTMLElement = event.srcElement;
    const list = faqItem.parentElement.classList;
    if (!list.contains('expanded')) {
      list.add('expanded');
    } else {
      list.remove('expanded');
    }
  }
}
