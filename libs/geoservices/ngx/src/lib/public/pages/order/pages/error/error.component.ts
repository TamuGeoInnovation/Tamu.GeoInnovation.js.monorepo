import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tamu-gisc-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {
  constructor(private readonly rt: ActivatedRoute) {}

  public ngOnInit(): void {
    this.rt.queryParams.subscribe((params) => {
      console.log('Query Params:', params);
    });
  }
}
