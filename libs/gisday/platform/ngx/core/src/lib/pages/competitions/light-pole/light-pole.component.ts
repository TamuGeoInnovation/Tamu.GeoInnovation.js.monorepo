import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MapboxMapComponent } from '@tamu-gisc/maps/mapbox';
import { AccordionComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionHeaderComponent } from '@tamu-gisc/ui-kits/ngx/layout';
import { AccordionContentComponent } from '@tamu-gisc/ui-kits/ngx/layout';

@Component({
    selector: 'tamu-gisc-light-pole',
    templateUrl: './light-pole.component.html',
    styleUrls: ['./light-pole.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MapboxMapComponent, AccordionComponent, AccordionHeaderComponent, AccordionContentComponent]
})
export class LightPoleComponent {}
