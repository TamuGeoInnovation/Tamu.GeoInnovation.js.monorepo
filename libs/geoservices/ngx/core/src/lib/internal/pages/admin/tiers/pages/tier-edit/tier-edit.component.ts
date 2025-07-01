import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'tamu-gisc-tier-edit',
  templateUrl: './tier-edit.component.html',
  styleUrls: ['./tier-edit.component.scss']
})
export class TierEditComponent implements OnInit {
  public tierId: number | undefined;

  constructor(private readonly route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.tierId = params['id'] ? parseInt(params['id'], 10) : undefined;
    });
  }
}
