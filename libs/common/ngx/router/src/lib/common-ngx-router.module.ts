import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterHistoryService } from './services/router-history.service';

@NgModule({
  imports: [CommonModule],
  providers: [RouterHistoryService]
})
export class CommonNgxRouterModule {}
