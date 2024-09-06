import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableComponent } from './components/table/table.component';
import { TablePaginatorComponent } from './components/table-paginator/table-paginator.component';
import { IsLimitPipe } from './pipes/is-limit.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [TableComponent, TablePaginatorComponent, IsLimitPipe],
  exports: [TableComponent, TablePaginatorComponent]
})
export class UiKitsNgxLayoutTablesModule {}
