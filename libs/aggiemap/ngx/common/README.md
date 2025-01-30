# aggiemap-ngx-common

This library contains common definitions and data sources used in Aggiemap and Aggiemap derived applications in an effort to consolidate and standardize the data sources and definitions used across the applications to reduce duplication and facilitate source updates for all applications.

## Using

```js
// Import the factory function to generate the common data sources
import { factory } from '@tamu-gisc/aggiemap/ngx/common';

// Export symbols and other pre-defined data sources
export { SelectionSymbols, Polygons } from '@tamu-gisc/aggiemap/ngx/common';
```

### Generating sources

```js
const sources = factory();

export const { Definitions, Connections, LegendSources, SearchSources, ThreeDLayers, LayerSources } = sources;
```

`factory()` returns an object with the following properties:

- `Connections` - An array of connection definitions that are used to connect to various data sources.
- `Definitions` - Centralized key-value map of definitions used as a namespace referenced in layer, legend, and search sources.
- `LayerSources` - An array of hot layer sources, added to the map on initialization.
- `LegendSources` - An array of static legend sources to be displayed in the legend component.
- `SearchSources` - An array of search sources used in places such as omnisearch, url search, routing, etc.
- `ThreeDLayers` - An array of sources that are applied when the 3D view is active.

## Options

The factory function accepts an options object that can be used to customize the behavior of the factory function.

```js
const sources = factory({
  environment: 'dev', // Optional. Default is 'dev'. Can be 'dev' or 'prod'.
  layerSources: {
    // Optional. Settings that determine how and which layer sources are generated. Useful for excluding certain sources in different environments.
    exclude: ['BUILDINGS']
  },
  searchSources: {
    // Optional. Settings that determine how and which search sources are generated. Useful for excluding certain sources in different environments.
    exclude: ['BUILDING']
  }
});
```
