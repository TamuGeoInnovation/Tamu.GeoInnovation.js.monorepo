import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileTabNavigationComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tab';
import { MobileTabNavigationTabComponent } from '@tamu-gisc/ui-kits/ngx/navigation/mobile-tab';

@Component({
    selector: 'tamu-gisc-public',
    templateUrl: './public.component.html',
    styleUrls: ['./public.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [RouterOutlet, MobileTabNavigationComponent, MobileTabNavigationTabComponent]
})
export class PublicComponent {}
