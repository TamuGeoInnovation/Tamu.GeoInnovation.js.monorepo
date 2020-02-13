import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-geocoding',
  templateUrl: './geocoding.component.html',
  styleUrls: ['./geocoding.component.scss']
})
export class GeocodingComponent implements OnInit {
  // public apiVersion = '5.0';
  // public url = 'https://geoservices.tamu.edu/api/geocode/v5';

  public apiVersion = '4.1';
  public url =
    'https://geoservices.tamu.edu/Services/Geocode/WebService/GeocoderWebServiceHttpNonParsedAdvanced_V04_01.aspx';

  public apiKey = 'demo';

  public gist;

  public scriptStyleImport = `<script src="https://geoservices.tamu.edu/api/5.0"></script>`;
  constructor() {}

  public ngOnInit() {}
}
