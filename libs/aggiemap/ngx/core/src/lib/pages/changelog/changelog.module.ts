import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';




import { ChangelogComponent } from './components/changelog.component';

const routes: Routes = [
  {
    path: '',
    component: ChangelogComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ChangelogComponent
]
})
export class ChangelogModule {}
