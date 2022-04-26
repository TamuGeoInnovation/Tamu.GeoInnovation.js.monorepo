import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

@Component({
  selector: 'tamu-gisc-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss']
})
export class PageLoaderComponent implements OnInit, OnChanges {
  /**
   * Determines the loader visibility.
   *
   * - `true`: Enables the loader. This is the default state.
   * - `false`: Disables the loader.
   */
  @Input()
  public toggle = true;

  /**
   * Phrases shown on the loader, randomly selected.
   */
  @Input()
  public phrases: Array<string> = [
    'An Aggie does not lie, cheat or steal or tolerate those who do.',
    'Home of the 12th Man',
    'Whoop!',
    "Gig 'Em!",
    'Howdy Ags!'
  ];

  public phrase: string;

  public ngOnInit(): void {
    this.selectPhrase();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.toggle && changes.toggle.currentValue !== undefined) {
      if (changes.toggle && changes.toggle.currentValue === false) {
        // Disable the loader
        // TODO: Re-implement this with the animations API
        setTimeout(() => {
          document.querySelector('.loader').classList.add('fade-out');

          setTimeout(() => {
            (<HTMLElement>document.querySelector('.loader')).style.display = 'none';
          }, 300);
        }, 300);
      }
    }
  }

  public selectPhrase() {
    this.phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
  }
}
