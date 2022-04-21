import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HeaderCovidComponent } from './components/header-covid/header-covid.component';
import { TestingSiteListComponent } from './components/listable/submissions/testing-sites/testing-sites.component';
import { CountyListComponent } from './components/listable/submissions/county/county.component';
import { LockdownListComponent } from './components/listable/submissions/lockdown/lockdown.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TestingSiteListComponent, CountyListComponent, LockdownListComponent],
  exports: [HeaderCovidComponent, TestingSiteListComponent, CountyListComponent, LockdownListComponent]
})
export class CoreModule {}
