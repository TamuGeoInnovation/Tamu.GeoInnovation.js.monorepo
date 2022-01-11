import { LayerSource } from '@tamu-gisc/common/types';
import { ParticipantResponsePopupComponent } from '@tamu-gisc/cpa/ngx/viewer';

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
