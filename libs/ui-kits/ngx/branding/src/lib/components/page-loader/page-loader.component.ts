import { Component, OnChanges, OnInit, SimpleChanges, ChangeDetectionStrategy, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'tamu-gisc-page-loader',
  templateUrl: './page-loader.component.html',
  styleUrls: ['./page-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgClass]
})
export class PageLoaderComponent implements OnInit, OnChanges {
  /**
   * Determines the loader visibility.
   *
   * - `true`: Enables the loader. This is the default state.
   * - `false`: Disables the loader.
   */
  public readonly toggle = input(true);

  /**
   * Phrases shown on the loader, randomly selected.
   */
  public readonly phrases = input<Array<string>>([
    'An Aggie does not lie, cheat or steal or tolerate those who do.',
    'Home of the 12th Man',
    'Whoop!',
    "Gig 'Em!",
    'Howdy Ags!'
  ]);

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
    this.phrase = this.phrases()[Math.floor(Math.random() * this.phrases().length)];
  }
}
