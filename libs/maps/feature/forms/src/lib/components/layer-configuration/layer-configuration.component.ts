import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, timer, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, debounce } from 'rxjs/operators';

@Component({
  selector: 'tamu-gisc-layer-configuration',
  templateUrl: './layer-configuration.component.html',
  styleUrls: ['./layer-configuration.component.scss']
})
export class LayerConfigurationComponent implements OnInit {
  /**
   * Internal value. The input is piped through here so that the http query
   * rate can be throttled as the user types in a URL address.
   */
  private _value: BehaviorSubject<string> = new BehaviorSubject(undefined);

  /**
   * URL of an existing layer configuration.
   *
   * Loads configuration on initialization and attempts to populate
   * model.
   *
   * If no valid configuration is recognized, the configuration
   * model remains in its default state allowing mutation by the
   * user.
   *
   * Supports layers from esri REST services in the form of:
   *
   * https://domain.com/arcgis/rest/services/ExampleServer/MapServer/0
   */
  @Input()
  public set url(v) {
    this._value.next(v);
  }

  public get url() {
    return this._value.getValue();
  }

  /**
   * Component model.
   */
  @Input()
  public configuration: ILayerConfiguration;

  constructor(private http: HttpClient) {}

  public ngOnInit() {
    if (this._value.getValue() !== undefined) {
      this._value
        .pipe(
          debounceTime(1000),
          distinctUntilChanged(),
          switchMap((url) => {
            return this.http.get<ILayerConfiguration>(`${this.url}?f=json`);
          })
        )
        .subscribe((config) => (this.configuration = config));
    }
  }
}

interface ILayerConfiguration {
  title: string;
}
