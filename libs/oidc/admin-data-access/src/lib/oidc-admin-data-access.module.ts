import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService } from './modules/roles/roles.service';
import { UsersService } from './modules/users/users.service';
import { StatsService } from './modules/stats/stats.service';

@NgModule({
  imports: [CommonModule]
})
export class OidcAdminDataAccessModule {}
