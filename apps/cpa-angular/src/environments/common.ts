import { LayerSource } from '@tamu-gisc/common/types';
// Nx 17's module-boundary rule flags this: the viewer library is lazy-loaded by app.module.ts, and a
// static import here pulls it into the main bundle. It predates Nx 17, and cpa-angular does not build
// on development for other reasons (see the known failures in docs/releases/unreleased.md), so it
// is suppressed here rather than restructured (#1365).
// eslint-disable-next-line @nx/enforce-module-boundaries
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
