import { Component, OnInit, Input, Optional, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { BehaviorSubject, forkJoin, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter, withLatestFrom, pluck, take } from 'rxjs/operators';

import { getPropertyValue } from '@tamu-gisc/common/utils/object';
import { EsriMapService, EsriModuleProviderService, MapServiceInstance } from '@tamu-gisc/maps/esri';

import { v4 as guid } from 'uuid';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-layer-configuration',
  templateUrl: './layer-configuration.component.html',
  styleUrls: ['./layer-configuration.component.scss']
})
export class LayerConfigurationComponent implements OnInit, OnDestroy, OnChanges {
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

  /**
   * Describes whether the layer will be loaded/unloaded from the map upon configuration resolution (load)
   * and component destruction (unload).
   */
  @Input()
  public link: boolean;

  /**
   * The layer positioning index. This is the index that will be used to create the layer.
   *
   * This property is also watched for changes to apply a new index to the layer if it has been
   * re-ordered.
   */
  @Input()
  public index = 0;

  private layer: LayerConfigLayer;

  /**
   * Component model. Initializes a form group that is used to attach it to the parent
   * form group, if any.
   */
  public config: LayerConfiguration;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    @Optional() private ms: EsriMapService,
    private mp: EsriModuleProviderService
  ) {}

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
              /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
            );

            return test.test(url);
          }),
          switchMap((url: string) => {
            // Attempt to load the layer from its portal JSON representation but also get the raw layer jsonp in case the Layer class
            // cannot auto-instantiate the layer type correct as is the case with map-image layers. It renders them as `feature` layers.
            return forkJoin([
              from(this.mp.require(['Layer'])).pipe(
                switchMap(([Layer]: [esri.LayerConstructor]) => {
                  return Layer.fromArcGISServerUrl({
                    url
                  });
                })
              ),
              this.http.get(url + '?f=pjson')
            ]);
          }),
          withLatestFrom(this.ms.store)
        )
        .subscribe(([[response, metadata], instances]: [[esri.FeatureLayer, PortalLayerJSON], MapServiceInstance]) => {
          if (this.link && this.ms !== null) {
            if (metadata.type === 'Raster Layer') {
              this.ms
                .findLayerOrCreateFromSource({
                  type: 'map-image',
                  id: response.id,
                  title: response.title,
                  url: response.url,
                  native: {
                    sublayers: [{ id: metadata.id }]
                  }
                })
                .then((layer) => {
                  if (layer instanceof Array) {
                    // No-op
                    console.warn('Multiple map image sub layers unsupported');
                  } else {
                    this.assignMetadata(layer as esri.MapImageLayer);
                    instances.map.add(layer, this.index);
                  }
                });
            } else {
              this.assignMetadata(response as esri.FeatureLayer);
              instances.map.add(this.layer, this.index);
            }
          }
        });
    }

    // Configure listeners for property edits to the form (opacity, etc)
    this.config.form.valueChanges
      .pipe(
        pluck('info'),
        filter((config) => config !== undefined),
        debounceTime(250)
      )
      .subscribe((res: ILayerConfiguration) => {
        if (this.layer) {
          this.layer.opacity = res.drawingInfo.opacity;
        }
      });
  }

  public assignMetadata(layer: LayerConfigLayer) {
    // Update form values
    this.layer = layer;

    if (this.config) {
      this.config.applyConfigValuesToLayer(this.layer);
    }

    //
    // If there is no config, apply default values from the layer instance.
    this.config.updateFormValues(LayerConfiguration.normalizeOptions(layer));
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (changes.index && changes.index.previousValue !== changes.index.currentValue && this.layer !== undefined) {
      this.ms.store.pipe(take(1)).subscribe((instances) => {
        instances.map.reorder(this.layer, this.index);
      });
    }
  }

  public ngOnDestroy(): void {
    if (this.link && this.ms !== null && this.layer && this.layer.id) {
      this.ms.removeLayerById(this.layer.id);
    }
  }
}

export class LayerConfiguration {
  public form: FormGroup;
  public info: FormGroup;

  constructor(public fb: FormBuilder, args: ILayerConfiguration | FormGroup) {
    if (args !== undefined) {
      if (args instanceof FormGroup) {
        this.form = args;

        // Check if the info property exists in the form.
        // If it has, it has been casted as a type of AbstractControl, but
        // info needs to be a FormGroup.
        if ('info' in this.form.controls) {
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

  public static getLayerType(type: string): ILayerConfiguration['type'] {
    if (type === 'Feature Layer') {
      return 'feature';
    } else if (type === 'Graphics Layer') {
      return 'graphics';
    } else if (type === 'Group Layer') {
      return 'group';
    } else if (type === 'Map Layer') {
      return 'map-image';
    } else {
      return type as ILayerConfiguration['type'];
    }
  }

  /**
   * Accepts an object and creates a LayerConfiguration object from
   * matching keys.
   */
  public static normalizeOptions(obj: object | LayerConfigLayer): ILayerConfiguration {
    if (obj instanceof Object) {
      // If the provided object is a plain jane object, assume it's a configuration object, otherwise a feature layer.
      if (obj.constructor.name === 'Object') {
        // Using this as schema since form builder groups cannot be stringified
        // without running into a recursive overflow.
        const lookup = {
          name: '',
          layerId: '',
          type: '',
          description: '',
          loadOnInit: '',
          drawingInfo: {
            opacity: ''
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
                if (curr === 'type') {
                  value = this.getLayerType(o[curr]);
                } else {
                  value = o[curr];
                }
              }

              acc[curr] = value;
            }

            return acc;
          }, {});

          return matching;
        };

        const config = getMatching(obj, lookup);

        return config as ILayerConfiguration;
      } else {
        const layer = obj as esri.FeatureLayer;
        return {
          name: layer.title,
          layerId: layer.id,
          type: layer.type,
          loadOnInit: layer.visible,
          drawingInfo: {
            opacity: layer.opacity
          }
        } as ILayerConfiguration;
      }
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
        Object.keys(props).forEach((key) => {
          // If the config property exists as a name of a control
          if (key in cls) {
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

  public applyConfigValuesToLayer(layer: LayerConfigLayer) {
    const formValues = this.form.getRawValue().info as ILayerConfiguration;

    if (formValues.name) {
      layer.title = formValues.name;
    }

    if (formValues.layerId) {
      layer.id = formValues.layerId;
    }

    if (formValues.drawingInfo) {
      layer.opacity = formValues.drawingInfo.opacity;
    }
  }

  private get _groupProperties() {
    return {
      name: [''],
      layerId: [guid().split('-').pop()],
      type: [''],
      description: [''],
      loadOnInit: [true],
      drawingInfo: this.fb.group({
        opacity: [1]
      })
    };
  }
}

export interface ILayerConfiguration {
  name?: string;

  layerId?: string;

  type?: 'feature' | 'graphics' | 'group' | 'map-image';

  description?: string;

  loadOnInit?: boolean;

  drawingInfo?: {
    opacity?: number;
  };
}

/**
 * Short list of operational properties found in layer portal JSON representations.
 *
 * This is not an exhaustive list and is only here to avoid polluting class members
 * with large object type definitions in the signature.
 */
export interface PortalLayerJSON {
  type: 'Raster Layer' | 'Feature Layer' | 'Group Layer';
  id: number;
}

export type LayerConfigLayer = esri.FeatureLayer | esri.GroupLayer | esri.MapImageLayer;
