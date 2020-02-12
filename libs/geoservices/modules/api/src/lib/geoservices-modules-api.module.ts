import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';

export const routes: Route[] = [];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class GeoservicesModulesApiModule {}
