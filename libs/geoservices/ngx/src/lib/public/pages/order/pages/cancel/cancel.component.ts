import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tamu-gisc-cancel',
  templateUrl: './cancel.component.html',
  styleUrls: ['./cancel.component.scss']
})
export class CancelComponent implements OnInit {
  constructor(private readonly rt: ActivatedRoute) {}

  public ngOnInit(): void {
    this.rt.queryParams.subscribe((params) => {
      console.log('Query Params:', params);
    });
  }
}
