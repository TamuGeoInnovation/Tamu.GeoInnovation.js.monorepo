import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { GISDAY_SITE } from '@tamu-gisc/gisday/platform/ngx/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'tamu-gisc-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [RouterLink]
})
export class FaqComponent {
  private titleService = inject(Title);

  constructor() {
    this.titleService.setTitle(`FAQ | ${inject(GISDAY_SITE).name}`);
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
