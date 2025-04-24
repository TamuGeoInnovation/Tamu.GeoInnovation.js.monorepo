import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, take } from 'rxjs';

import { PaymentsService } from '@tamu-gisc/geoservices/data-access';
import { IPayflowPostbackResponse } from '@tamu-gisc/geoservices/data-api';

@Component({
  selector: 'tamu-gisc-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss']
})
export class CompleteComponent implements OnInit {
  constructor(private readonly rt: ActivatedRoute, private readonly paymentService: PaymentsService) {}

  public ngOnInit(): void {
    this.rt.queryParams
      .pipe(
        take(1),
        switchMap((res: IPayflowPostbackResponse) => {
          return this.paymentService.captureOrder(res);
        })
      )
      .subscribe((params) => {
        console.log('Query Params:', params);
      });
  }
}
