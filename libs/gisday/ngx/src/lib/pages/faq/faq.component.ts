import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  public onFaqItemClick(event) {
    const faqItem: HTMLElement = event.srcElement;
    let list = faqItem.parentElement.classList;
    if (!list.contains('expanded')) {
      list.add('expanded');
    } else {
      list.remove('expanded');
    }
  }
}
