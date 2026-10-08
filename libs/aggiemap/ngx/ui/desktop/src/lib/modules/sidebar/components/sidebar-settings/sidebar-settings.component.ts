import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MapsFeatureBasemapGalleryModule } from '@tamu-gisc/maps/feature/basemap';

@Component({
    selector: 'tamu-gisc-sidebar-settings',
    templateUrl: './sidebar-settings.component.html',
    styleUrls: ['./sidebar-settings.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MapsFeatureBasemapGalleryModule]
})
export class SidebarSettingsComponent {}
