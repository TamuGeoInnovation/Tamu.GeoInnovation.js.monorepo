import { Component, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'tamu-gisc-kissingbug-facebook',
  templateUrl: './facebook.component.html',
  styleUrls: ['./facebook.component.scss']
})
export class FacebookComponent implements OnInit {
  constructor(private renderer: Renderer2) {}

  public ngOnInit() {
    const js = this.renderer.createElement('script');
    const parent = document.getElementsByTagName('tamu-gisc-kissingbug-hero')[0];
    js.id = 'facebook-jssdk';
    js.src = '//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.0';
    parent.parentNode.insertBefore(js, parent);
    this.renderer.appendChild(parent, js);
  }
}
