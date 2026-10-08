import { Component, ChangeDetectionStrategy } from '@angular/core';
import { SidebarComponent as SidebarComponent_1 } from '@tamu-gisc/common/ngx/ui/sidebar';
import { SidebarTabComponent } from '@tamu-gisc/common/ngx/ui/sidebar';
import { UESTamuBlockComponent } from '@tamu-gisc/ues/common/ngx';
import { RouterOutlet } from '@angular/router';
import { PopupComponent } from '@tamu-gisc/maps/feature/popup';

@Component({
    selector: 'tamu-gisc-ues-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [SidebarComponent_1, SidebarTabComponent, UESTamuBlockComponent, RouterOutlet, PopupComponent]
})
export class SidebarComponent {}
