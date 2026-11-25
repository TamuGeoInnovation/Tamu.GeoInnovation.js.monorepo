import { Component, OnInit, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, catchError, forkJoin, map, of, switchMap, take } from 'rxjs';

import { AuthService } from '@tamu-gisc/common/ngx/auth';
import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { LayerSource } from '@tamu-gisc/common/types';
import { EsriMapService, MapConfig, HIDDEN_DEFAULT_HIGHLIGHT } from '@tamu-gisc/maps/esri';
import { EsriMapComponent } from '@tamu-gisc/maps/esri';
import { MapLocationComponent } from '@tamu-gisc/maps/feature/location';

import esri = __esri;

@Component({
  selector: 'tamu-gisc-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [EsriMapComponent, MapLocationComponent]
})
export class MapComponent implements OnInit {
  private ms = inject(EsriMapService);
  private env = inject(EnvironmentService);
  private at = inject(ActivatedRoute);
  private as = inject(AuthService);
  private http = inject(HttpClient);

  public filterFeatures: BehaviorSubject<esri.Graphic[]> = new BehaviorSubject([]);

  /**
   * Whether the signed-in participant's own submissions are drawn apart from everyone else's (#2625), so
   * the key says which is which. Not when the map shows one participant's, from the leaderboard.
   */
  public readonly showsMine = signal(false);

  public config = {
    basemap: {
      basemap: 'streets-navigation-vector'
    },
    view: {
      properties: {
        map: undefined, // Reference to the map object created before the scene
        center: [-96.344672, 30.61306],
        spatialReference: {
          wkid: 102100
        },
        zoom: 15,
        constraints: {
          // maxZoom: 21
        },
        popup: {
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: 'bottom-right'
          }
        },
        highlights: HIDDEN_DEFAULT_HIGHLIGHT
      }
    }
  } as MapConfig;

  public ngOnInit() {
    const api_url = this.env.value('api_url');
    const everyone = `${api_url}/competitions/maps/seasons/active?format=geojson`;

    // An organizer reaches the map from the leaderboard to see one participant's submissions.
    const participant: Observable<string | undefined> = this.at.queryParams.pipe(
      take(1),
      map((params) => params['user'])
    );

    // The signed-in participant's own submissions (#2625), from the endpoint for one participant, so the
    // map of everyone's still says nothing about whose each one is (#1792). Without them, as before: every
    // submission alike.
    const mine: Observable<{ url: string; guids: Array<string> } | undefined> = this.as.user$.pipe(
      take(1),
      switchMap((user) => {
        if (!user?.sub) {
          return of(undefined);
        }

        const url = `${api_url}/competitions/maps/seasons/active/user/${user.sub}?format=geojson`;

        return this.http.get<{ features?: Array<{ properties?: { guid?: string } }> }>(url).pipe(
          map((collection) => ({ url, guids: (collection?.features ?? []).map((f) => f.properties?.guid) })),
          catchError(() => of(undefined))
        );
      })
    );

    const submissions: Observable<Array<LayerSource>> = participant.pipe(
      switchMap((guid) => {
        if (guid !== undefined) {
          return of([
            submissionsLayer('Submissions', `${api_url}/competitions/maps/seasons/active/user/${guid}?format=geojson`)
          ]);
        }

        return mine.pipe(
          map((own) => {
            if (own === undefined) {
              return [submissionsLayer('Submissions', everyone)];
            }

            this.showsMine.set(true);

            return [submissionsLayer("Everyone else's submissions", everyone, own.guids), myLayer(own.url)];
          })
        );
      })
    );

    forkJoin([submissions, this.ms.store.pipe(take(1))]).subscribe(([layers]) => {
      this.ms.loadLayers([alreadyFoundLayer(api_url), ...layers]);
    });
  }
}

/**
 * Where things were already found last season (#2166), so participants look elsewhere. Listed first, so
 * this season's submissions draw on top. GIS Day's API publishes no symbology, so the definition is the
 * only source: an open maroon ring, apart from this season's dots, and not clustered, because the point is
 * to see each one. Each ring is one thing, however many times it was found (#2625).
 */
function alreadyFoundLayer(api_url: string): LayerSource {
  return {
    type: 'geojson',
    id: 'already-found-layer',
    title: 'Already found last year',
    url: `${api_url}/competitions/maps/seasons/active/already-found?format=geojson`,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          size: 9,
          color: [0, 0, 0, 0],
          outline: { color: '#500000', width: 2 }
        }
      },
      popupTemplate: {
        title: 'Already found in {year}',
        content: '{typeName}. {expression/found}',
        expressionInfos: [
          {
            name: 'found',
            expression: FOUND_TIMES_EXPRESSION
          }
        ]
      }
    }
  } as LayerSource;
}

/**
 * "Found once in 2025." or "Found 3 times in 2025.", from a ring's `count` and `year` (#2625).
 */
export const FOUND_TIMES_EXPRESSION =
  "var n = DefaultValue($feature.count, 1); IIf(n == 1, 'Found once', 'Found ' + n + ' times') + ' in ' + $feature.year + '.'";

/**
 * This season's submissions, as grey dots clustered with a count, leaving out the ones in `except`: the
 * participant's own, which `myLayer` draws instead (#2625).
 */
function submissionsLayer(title: string, url: string, except: Array<string> = []): LayerSource {
  // Submission ids are GUIDs; anything else is kept out of the expression.
  const guids = except.filter((guid) => /^[0-9a-f-]+$/i.test(guid ?? ''));

  return {
    type: 'geojson',
    id: 'submissions-layer',
    title,
    url,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    native: {
      ...(guids.length > 0 ? { definitionExpression: `guid NOT IN (${guids.map((g) => `'${g}'`).join(', ')})` } : {}),
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          size: 10,
          color: '#424242'
        }
      },
      featureReduction: {
        type: 'cluster',
        clusterRadius: 45,
        labelingInfo: [
          {
            deconflictionStrategy: 'none',
            labelExpressionInfo: {
              expression: "Text($feature.cluster_count, '#,###')"
            },
            symbol: {
              type: 'text',
              color: '#f5f5f5',
              font: {
                family: 'Noto Sans',
                size: '14px'
              }
            },
            labelPlacement: 'center-center'
          }
        ]
      }
    }
  } as LayerSource;
}

/**
 * The signed-in participant's own submissions (#2625): solid maroon with a white edge, above everyone
 * else's, and not clustered, so each of theirs stands apart from the rest.
 */
function myLayer(url: string): LayerSource {
  return {
    type: 'geojson',
    id: 'my-submissions-layer',
    title: 'Your submissions',
    url,
    listMode: 'show',
    loadOnInit: true,
    visible: true,
    native: {
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          size: 11,
          color: '#500000',
          outline: { color: '#ffffff', width: 1.5 }
        }
      }
    }
  } as LayerSource;
}
