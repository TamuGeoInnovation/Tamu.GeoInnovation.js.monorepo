import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { pluck } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  public guid: Observable<string>;

  constructor(private route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.guid = this.route.params.pipe(pluck('guid'));
  }
}
