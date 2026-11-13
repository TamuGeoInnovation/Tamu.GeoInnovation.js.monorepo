import { Component } from '@angular/core';
import { BasemapGalleryComponent } from '@tamu-gisc/maps/feature/basemap';
import { ThemePickerComponent } from '@tamu-gisc/common/ngx/ui/theme';

@Component({
  selector: 'tamu-gisc-sidebar-settings',
  templateUrl: './sidebar-settings.component.html',
  styleUrls: ['./sidebar-settings.component.scss'],
  imports: [ThemePickerComponent, BasemapGalleryComponent]
})
export class SidebarSettingsComponent {}
