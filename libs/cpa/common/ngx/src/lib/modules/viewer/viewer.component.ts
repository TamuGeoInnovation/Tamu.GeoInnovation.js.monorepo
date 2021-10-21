import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnInit {
  public showAdminControls: Observable<boolean>;

  constructor(private route: ActivatedRoute) {}

  public ngOnInit() {
    this.showAdminControls = this.route.queryParams.pipe(
      pluck('controls'),
      map((param) => {
        if (param === 'true' || param === true) {
          return true;
        }

        return false;
      })
    );
  }
}
