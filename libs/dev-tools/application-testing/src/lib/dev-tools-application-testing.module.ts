import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestingService } from './services/application-testing.service';

@NgModule({
  imports: [CommonModule],
  providers: [TestingService]
})
export class TestingModule {}
