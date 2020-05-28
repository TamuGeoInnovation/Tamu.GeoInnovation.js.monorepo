import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapsComponent } from './maps.component';
import { TimeMapComponent } from './components/time-map/time-map.component';



@NgModule({
  declarations: [MapsComponent, TimeMapComponent],
  imports: [
    CommonModule
  ]
})
export class MapsModule { }
