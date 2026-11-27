// The definitions, their popups and the settings service import one another. Loading the service
// first is the order the application loads them in; starting from a definition finds a popup's base
// class still undefined.
import '../services/settings/event-settings.service';

import { LayerSource } from '@tamu-gisc/common/types';
import { Popups } from '@tamu-gisc/aggiemap/ngx/popups';

import { EventPopups } from '../modules/popups/popups';
import { EventDefinitions } from './all.definitions';

/**
 * Every key a layer's popup data resolves is one its popup can read (#3808).
 *
 * The markdown popups read `name` and `description` and nothing else. A layer that resolves its fields into other keys
 * shows none of them: the New Student Conference map dropped every lot's permit instructions under `notes` (#3671), and
 * the motorcycle parking map's popup showed only its layer's title, its lot name resolved into `lotName`. Any key is
 * readable where the layer declares `popupDataResolutionStrategy: 'cumulative'`, which lets a `name` or `description`
 * template read the other keys, as the main parking map's lots do.
 */
const READ_BY_MARKDOWN = new Set(['name', 'description']);
const MARKDOWN = new Set<unknown>([
  EventPopups.MarkdownPopupComponent,
  EventPopups.MarkdownWDirectionsPopupComponent,
  Popups.MarkdownPopupComponent,
  Popups.MarkdownWDirectionsPopupComponent
]);

describe('popup data keys (#3808)', () => {
  it("resolves no layer's fields into a key its markdown popup cannot read", () => {
    const unread: Array<string> = [];

    for (const definition of EventDefinitions) {
      const layers: Array<LayerSource> = [...(definition.sources ?? []), ...(definition.developmentSources ?? [])];

      for (const layer of layers) {
        if (!layer.popupData || !MARKDOWN.has(layer.popupComponent) || layer.popupDataResolutionStrategy === 'cumulative') {
          continue;
        }

        const keys = Object.keys(layer.popupData).filter((key) => !READ_BY_MARKDOWN.has(key));

        if (keys.length > 0) {
          unread.push(`${definition.configuration?.id} / ${layer.id}: ${keys.join(', ')}`);
        }
      }
    }

    expect([...new Set(unread)]).toEqual([]);
  });
});
