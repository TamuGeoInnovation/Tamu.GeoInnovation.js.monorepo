import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';

import { getPropertyValue } from '@tamu-gisc/common/utils/object';

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
  private _url: BehaviorSubject<string> = new BehaviorSubject(undefined);

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
    this._url.next(v);
  }

  public get url() {
    return this._url.getValue();
  }

  /**
   * Component model initialization parameters.
   *
   * Used to override server-side definitions or set them if not declared.
   */
  @Input()
  public set configOptions(options: ILayerConfiguration | FormGroup) {
    this.config = new LayerConfiguration(this.fb, options);
  }

  public get configOptions() {
    return this.config.form.getRawValue();
  }

  /**
   * Component model. Initializes a form group that is used to attach it to the parent
   * form group, if any.
   */
  public config: LayerConfiguration;

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  public ngOnInit() {
    if (this._url.getValue() !== undefined) {
      this._url
        .pipe(
          debounceTime(1000),
          distinctUntilChanged(),
          filter((url: string) => {
            // Tests if string is URL
            // FROM: https://stackoverflow.com/questions/161738/what-is-the-best-regular-expression-to-check-if-a-string-is-a-valid-url
            const test = RegExp(
              /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
            );

            return test.test(url);
          }),
          switchMap((url: string) => {
            return this.http.get<ILayerConfiguration>(`${this.url}?f=json`);
          })
        )
        .subscribe((response) => {
          // Update form values
          this.config.updateFormValues(LayerConfiguration.normalizeOptions(response));
        });
    }
  }
}

export class LayerConfiguration {
  public form: FormGroup;

  constructor(public fb: FormBuilder, args: ILayerConfiguration | FormGroup) {
    if (args !== undefined) {
      if (args instanceof FormGroup) {
        this.form = args;

        // Check if the info property exists in the form.
        // If it has, it has been casted as a type of AbstractControl, but
        // info needs to be a FormGroup.
        if (this.form.controls.hasOwnProperty('info')) {
          // Normalize the input args
          const values = LayerConfiguration.normalizeOptions(this.form.controls.info.value);

          // Remove the current form control to ensure the layer config control is that of
          // FormGroup and not of any other type subclass of AbstractControl.
          this.form.removeControl('info');

          // Add the new info control as a type of FormGroup. This will instantiate with default values.
          this.form.addControl('info', this.fb.group(this._groupProperties));

          // Update the form values with the normalized input args.
          this.form.controls.info.patchValue(LayerConfiguration.normalizeOptions(values));
        } else {
          // If the input FormGroup does not have an existing `info` control, make one
          // with default values.
          this.form.addControl('info', this.fb.group(this._groupProperties));
        }
      } else {
        this.form.controls.info.patchValue(LayerConfiguration.normalizeOptions(args));
      }
    } else {
      this.form = this.fb.group(this._groupProperties);
    }
  }

  /**
   * Accepts an object and creates a LayerConfiguration object from
   * matching keys.
   */
  public static normalizeOptions(obj: object): ILayerConfiguration {
    if (obj instanceof Object) {
      // Suing this as schema since form builder groups cannot be stringified
      // without running into a recursive overflow.
      const lookup = {
        name: '',
        layerId: '',
        type: '',
        description: '',
        drawingInfo: {
          transparency: ''
        }
      };

      const getMatching = (o, ref) => {
        const matching = Object.keys(o).reduce((acc, curr) => {
          const shouldKeep = getPropertyValue(ref, curr);

          if (shouldKeep !== undefined) {
            let value;

            if (shouldKeep instanceof Object) {
              value = getMatching(o[curr], shouldKeep);
            } else {
              value = o[curr];
            }

            acc[curr] = value;
          }

          return acc;
        }, {});

        return matching;
      };

      const config = getMatching(obj, lookup);

      return config as ILayerConfiguration;
    }
  }

  /**
   * Recursively iterates through the provided config object keys, determining if a given key
   * exists in the form group, and assigning values for those that do.
   *
   */
  public updateFormValues(config: ILayerConfiguration) {
    if (this.form) {
      const controls = (this.form.controls.info as FormGroup).controls;
      const update = (props, cls) => {
        Object.keys(props).forEach((key, index) => {
          // If the config property exists as a name of a control
          if (cls.hasOwnProperty(key)) {
            // If the property key value is an object, it will be an object in the control as well.
            // Call self function again to target those.
            if (props[key] instanceof Object) {
              update(props[key], (cls[key] as FormGroup).controls);
            } else {
              if ((cls[key] as FormControl).value === undefined || (cls[key] as FormControl).value === '') {
                (cls[key] as FormControl).setValue(props[key]);
              }
            }
          }
        });
      };

      update(config, controls);
    }
  }

  private get _groupProperties() {
    return {
      name: [''],
      layerId: [''],
      type: [''],
      description: [''],
      drawingInfo: this.fb.group({
        transparency: [0]
      })
    };
  }
}

export interface ILayerConfiguration {
  name?: string;

  layerId?: string;

  type?: 'Feature Layer' | 'Graphic Layer';

  description?: string;

  drawingInfo?: {
    transparency?: number;
  };
}
