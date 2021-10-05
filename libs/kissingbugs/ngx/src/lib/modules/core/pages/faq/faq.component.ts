import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { StrapiService } from '../../data-access/strapi.service';
import {
  IStrapiFAQItemsWithComponents,
  IStrapiPageResponse,
  IStrapiPageSection,
  StrapiSingleTypes
} from '../../types/types';

@Component({
  selector: 'tamu-gisc-kissingbugs-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  providers: [StrapiService]
})
export class FaqComponent implements OnInit, OnDestroy {
  private title = 'FAQ | Kissing Bugs and Chagas Disease in the U.S. | Texas A&M';
  public page: StrapiSingleTypes = 'faq';
  public pageContents: Observable<IStrapiPageResponse>;
  public pageComponents: Observable<
    { sectionId: number; text: string; components: IStrapiPageSection; expanded: boolean }[]
  >;

  constructor(private titleService: Title, private ss: StrapiService) {}

  public ngOnInit() {
    this.titleService.setTitle(this.title);

    const language: string = navigator.language.substr(0, 2);

    this.pageContents = this.ss.getPage('faq', language).pipe(shareReplay(1));

    this.pageComponents = this.pageContents.pipe(
      map((response) => {
        const sections = Object.keys(response).filter((value) => value.includes('section'));
        const sectionsArrays = sections.map((key) => {
          return response[key];
        });
        return {
          questions: response.questions,
          sections: sectionsArrays
        };
      }),
      map((faqItems: IStrapiFAQItemsWithComponents) => {
        // TODO: the type as suggested by VSCode ain't right here, but she works
        const faqComponents = faqItems.questions.map((faqItem) => {
          return {
            sectionId: faqItem.section,
            text: faqItem.text,
            components: faqItems.sections[faqItem.section - 1],
            expanded: false
          };
        });
        return faqComponents;
      })
    );
  }

  public ngOnDestroy() {}

  public expandContainer(question) {
    question.expanded = !question.expanded;
  }
}
