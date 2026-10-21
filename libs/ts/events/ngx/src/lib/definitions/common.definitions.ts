import { LayerSource } from '@tamu-gisc/common/types';

type FeatureNative = Extract<LayerSource, { type: 'feature' }>['native'];
type FeatureRenderer = NonNullable<NonNullable<FeatureNative>['renderer']>;

/**
 * One solid fill, with no outline, for every feature a layer draws: a renderer that tests no field.
 *
 * Only for a layer whose service renderer cannot draw what the layer holds, as a deliberate override
 * (docs/map-layers.md). Each use says beside it why the service's renderer fails, takes `color` from
 * the service's own symbol for the features the layer selects, and says what would let it be removed.
 * Business Parking (#1981) and Vendor Parking (#1991) use it because their services' renderers key on
 * `GIS.TS.ParkingLots.LotType`, which the services do not publish.
 */
export function lotFill(label: string, color: [number, number, number, number]): FeatureRenderer {
  return {
    type: 'simple',
    label,
    symbol: { type: 'simple-fill', style: 'solid', color, outline: null }
  } as FeatureRenderer;
}

export const commonSymbols = {
  GREEN_ARROW: {
    type: 'simple-line',
    color: 'rgb(56, 168, 0)',
    width: 2,
    marker: {
      type: 'line-marker',
      style: 'arrow',
      color: 'rgb(56, 168, 0)',
      placement: 'end'
    }
  },
  RED_ARROW: {
    type: 'simple-line',
    color: 'rgb(230, 0, 0)',
    width: 2,
    marker: {
      type: 'line-marker',
      style: 'arrow',
      color: 'rgb(230, 0, 0)',
      placement: 'end'
    }
  }
};
