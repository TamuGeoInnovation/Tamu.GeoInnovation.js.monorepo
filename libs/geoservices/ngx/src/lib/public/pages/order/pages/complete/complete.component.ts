import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tamu-gisc-complete',
  templateUrl: './complete.component.html',
  styleUrls: ['./complete.component.scss']
})
export class CompleteComponent implements OnInit {
  constructor(private readonly rt: ActivatedRoute) {}

  public ngOnInit(): void {
    this.rt.queryParams.subscribe((params) => {
      console.log('Query Params:', params);
    });
  }
}
