import { LayerSource } from '@tamu-gisc/common/types';
// tslint:disable-next-line: nx-enforce-module-boundaries
import { ParticipantResponsePopupComponent } from '@tamu-gisc/cpa/common/ngx';

const commonLayerProps = {
  minScale: 10000000,
  maxScale: 0
};

export const SearchSources = [];

export const LayerSources: LayerSource[] = [
  {
    type: 'graphics',
    id: 'drawing-layer',
    title: 'Drawn Features',
    popupComponent: ParticipantResponsePopupComponent,
    native: {
      ...commonLayerProps
    }
  }
];

export const NotificationEvents = [];
