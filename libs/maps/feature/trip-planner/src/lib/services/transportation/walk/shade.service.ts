import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { EsriModuleProviderService } from '@tamu-gisc/maps/esri';
import { LonLat, ShadowRing, ringsNearPath, sunPosition } from '@tamu-gisc/common/utils/geometry';

import esri = __esri;

import {
  BuildingCaster,
  SHADE_COST_FACTOR,
  ShadeScene,
  TreeCaster,
  buildingsLikelyOpen,
  indoorBarrierFactor,
  shadeScene
} from './shade-casters';

/** College Station, for the sun's position. Across campus the sun moves by far less than a hundredth of a degree. */
const CAMPUS: LonLat = [-96.341, 30.615];

/** Metres around a walk to read buildings and trees from: a 30 m building at a 7 degree sun reaches this far. */
const SURROUNDINGS = 250;

/**
 * Metres either side of the quickest walk whose shadows go to the shaded solve. Shade farther out cannot pull the walk
 * there anyway without a long detour, and every shadow sent makes the solve slower: all 4,342 rings around a 0.7 mile
 * walk (joined, about 1 MB) made the network time out after a minute (10 November 2026).
 */
const CORRIDOR = 90;

/** Degrees the joined shadow may move when simplified: about a metre on campus. */
const GENERALIZE = 0.00001;

/** The barriers a shaded walk is solved with, and what to draw. */
export interface ShadeBarrier {
  /** The shade, joined and simplified. */
  polygon: esri.Polygon;
  /** The buildings beside the walk, while they are likely open; drawn as indoor shade. */
  indoor?: esri.Polygon;
  buildingsOpen: boolean;
  indoorFactor: number;
  /** Every barrier, for the solve's `polygonBarriers`. */
  graphics: Array<esri.Graphic>;
  vertices: number;
}

export interface LonLatExtent {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
}

interface QueryResponse<A> {
  features?: Array<{ attributes: A; geometry?: { rings?: LonLat[][]; x?: number; y?: number } }>;
  exceededTransferLimit?: boolean;
  error?: { message: string };
}

/**
 * Reads the buildings and trees around a walk and casts their shadows for a moment, for shade-aware walking
 * directions. Buildings are today's campus structures, with heights from the 2019 SketchUp models where a building
 * number matches and from floor counts where not; trees are the campus tree inventory.
 */
@Injectable({ providedIn: 'root' })
export class ShadeService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(EnvironmentService);
  private readonly moduleProvider = inject(EsriModuleProviderService);

  /** Model heights by building number, read once: the layer has 731 models and no geometry is needed. */
  private modelHeights: Promise<Map<string, number>>;

  /**
   * An extent grown by `SURROUNDINGS` metres on each side, so that what shades the walk's edges is read as well.
   */
  public static around(points: Array<LonLat>): LonLatExtent {
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const dLat = SURROUNDINGS / 111320;
    const dLon = dLat / Math.cos((CAMPUS[1] * Math.PI) / 180);

    return {
      xmin: Math.min(...xs) - dLon,
      ymin: Math.min(...ys) - dLat,
      xmax: Math.max(...xs) + dLon,
      ymax: Math.max(...ys) + dLat
    };
  }

  /** Every shadow in an extent at a moment. */
  public async scene(extent: LonLatExtent, when: Date): Promise<ShadeScene> {
    const sun = sunPosition(when, CAMPUS[1], CAMPUS[0]);

    if (sun.altitude <= 0) {
      return shadeScene(when, sun, [], []);
    }

    const [buildings, trees] = await Promise.all([this.buildings(extent), this.trees(extent)]);

    return shadeScene(when, sun, buildings, trees);
  }

  /**
   * The scene's shadows joined into one polygon, as the scaled-cost polygon barrier a route solve takes: inside it the
   * walk's time counts at `SHADE_COST_FACTOR` of its real value, so the solve prefers it. The `Attr_Time` field name is
   * the routing network's: its Walk modes' impedance is `Time`, and it ignores the newer `ScaledTimeFactor` field
   * (tested 10 November 2026).
   */
  public async barrier(scene: ShadeScene, walk: Array<Array<LonLat>>): Promise<ShadeBarrier | undefined> {
    const near = ringsNearPath(scene.rings, walk, CORRIDOR);

    if (near.length === 0) {
      return undefined;
    }

    const [Polygon, Graphic, unionOperator, generalizeOperator]: [
      typeof esri.Polygon,
      typeof esri.Graphic,
      esri.unionOperator,
      esri.generalizeOperator
    ] = await this.moduleProvider.require(['Polygon', 'Graphic', 'unionOperator', 'generalizeOperator']);

    const join = (rings: Array<ShadowRing>): esri.Polygon | undefined => {
      if (rings.length === 0) {
        return undefined;
      }

      const parts = rings.map((ring) => new Polygon({ rings: [closed(ring)], spatialReference: { wkid: 4326 } }));
      const joined = unionOperator.executeMany(parts) as esri.Polygon;

      return (joined && generalizeOperator.execute(joined, GENERALIZE, { removeDegenerateParts: true })) as
        | esri.Polygon
        | undefined;
    };

    const polygon = join(near);

    if (!polygon) {
      return undefined;
    }

    // Building footprints as a second barrier on top of the shade, which already covers them: preferred over shade
    // while buildings are likely open, and no cheaper than open ground while they are not (`indoorBarrierFactor`).
    const open = buildingsLikelyOpen(scene.when);
    const indoor = join(ringsNearPath(scene.footprints.map((f) => f.ring), walk, CORRIDOR));
    const indoorFactor = indoorBarrierFactor(open);

    const graphics = [
      new Graphic({ geometry: polygon, attributes: { Name: 'Shade', BarrierType: 1, Attr_Time: SHADE_COST_FACTOR } })
    ];

    if (indoor) {
      graphics.push(
        new Graphic({ geometry: indoor, attributes: { Name: 'Indoors', BarrierType: 1, Attr_Time: indoorFactor } })
      );
    }

    return {
      polygon,
      indoor: open ? indoor : undefined,
      buildingsOpen: open,
      indoorFactor,
      graphics,
      vertices: [polygon, indoor].reduce((sum, p) => sum + (p?.rings ?? []).reduce((n, ring) => n + ring.length, 0), 0)
    };
  }

  private async buildings(extent: LonLatExtent): Promise<Array<BuildingCaster>> {
    const connections = this.env.value('Connections');
    const [features, heights] = await Promise.all([
      this.queryAll<{ bldg_number: string; numfloors: string; bldgabbrev: string }>(connections.buildingsUrl, extent, {
        where: "isbldg = 'Y'",
        outFields: 'bldg_number,numfloors,bldgabbrev'
      }),
      this.models()
    ]);

    return features
      .filter((f) => f.geometry?.rings?.length > 0)
      .flatMap((f) => {
        const number = `${f.attributes.bldg_number ?? ''}`.trim();
        const floors = parseInt(`${f.attributes.numfloors ?? ''}`, 10);

        // A building in several parts casts a shadow from each.
        return f.geometry.rings.map((ring) => ({
          number,
          abbreviation: `${f.attributes.bldgabbrev ?? ''}`.trim() || undefined,
          footprint: ring,
          modelHeight: heights.get(number),
          floors: Number.isFinite(floors) ? floors : undefined
        }));
      });
  }

  private async trees(extent: LonLatExtent): Promise<Array<TreeCaster>> {
    const connections = this.env.value('Connections');
    const features = await this.queryAll<{ height: number; canopy_spread: number }>(connections.campusTreesUrl, extent, {
      where: 'date_removed IS NULL',
      outFields: 'height,canopy_spread'
    });

    return features
      .filter((f) => Number.isFinite(f.geometry?.x))
      .map((f) => ({
        position: [f.geometry.x, f.geometry.y] as LonLat,
        heightFeet: f.attributes.height ?? undefined,
        spreadFeet: f.attributes.canopy_spread ?? undefined
      }));
  }

  private models(): Promise<Map<string, number>> {
    if (!this.modelHeights) {
      const url = this.env.value('Connections').buildingModelsUrl;

      this.modelHeights = firstValueFrom(
        this.http.get<
          QueryResponse<{ BldNum: string; WhereFrom: string; z_Roofmedian: string; z_Groundmedian: string }>
        >(`${url}/query`, {
          params: {
            where: '1=1',
            outFields: 'BldNum,WhereFrom,z_Roofmedian,z_Groundmedian',
            returnGeometry: 'false',
            f: 'json'
          }
        })
      )
        .then((response) => {
          const heights = new Map<string, number>();

          // Three building numbers have two models; the architects' ('arch') is the one the 3D map draws.
          const ordered = [...(response.features ?? [])].sort(
            (a, b) => Number(b.attributes.WhereFrom === 'arch') - Number(a.attributes.WhereFrom === 'arch')
          );

          for (const { attributes } of ordered) {
            const number = `${attributes.BldNum ?? ''}`.trim();
            const height = parseFloat(attributes.z_Roofmedian) - parseFloat(attributes.z_Groundmedian);

            if (number && height > 0 && !heights.has(number)) {
              heights.set(number, height);
            }
          }

          return heights;
        })
        .catch((error) => {
          console.warn('Could not read the building models; using floor counts for every building.', error);

          return new Map<string, number>();
        });
    }

    return this.modelHeights;
  }

  /** Every feature in an extent, a page at a time. */
  private async queryAll<A>(
    url: string,
    extent: LonLatExtent,
    params: { where: string; outFields: string }
  ): Promise<QueryResponse<A>['features']> {
    const features: QueryResponse<A>['features'] = [];

    for (let offset = 0; offset < 50000; ) {
      const response = await firstValueFrom(
        this.http.get<QueryResponse<A>>(`${url}/query`, {
          params: {
            ...params,
            geometry: JSON.stringify({ ...extent, spatialReference: { wkid: 4326 } }),
            geometryType: 'esriGeometryEnvelope',
            inSR: '4326',
            spatialRel: 'esriSpatialRelIntersects',
            outSR: '4326',
            orderByFields: 'objectid',
            resultOffset: `${offset}`,
            f: 'json'
          }
        })
      );

      if (response.error) {
        throw new Error(`${url}: ${response.error.message}`);
      }

      features.push(...(response.features ?? []));

      if (!response.exceededTransferLimit || !response.features?.length) {
        break;
      }

      offset += response.features.length;
    }

    return features;
  }
}

function closed(ring: ShadowRing): ShadowRing {
  const first = ring[0];
  const last = ring[ring.length - 1];

  return first[0] === last[0] && first[1] === last[1] ? ring : [...ring, first];
}
