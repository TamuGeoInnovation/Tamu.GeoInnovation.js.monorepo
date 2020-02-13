import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit {
  public gist;

  public scriptStyleImport = `<script src="https://geoservices.tamu.edu/api/5.0"></script>`;
  constructor() {}

  public ngOnInit() {}
}
