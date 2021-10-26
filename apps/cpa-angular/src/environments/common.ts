import { LayerSource } from '@tamu-gisc/common/types';
import { BasePopupComponent } from '@tamu-gisc/maps/feature/popup';

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
    popupComponent: BasePopupComponent,
    native: {
      ...commonLayerProps
    }
  }
];

export const NotificationEvents = [];
