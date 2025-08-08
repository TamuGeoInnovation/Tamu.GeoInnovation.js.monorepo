# Layer Sources Service

This service provides a centralized store for managing layer sources from the environment service and allows for dynamic property overrides.

## Features

- **Layer Sources Store**: Centralized management of layer sources from environment service
- **Property Overrides**: Inject layer source property overrides by layer ID
- **Reactive Updates**: Observable-based updates for layer sources and overrides
- **Type Safety**: Full TypeScript support with proper typing

## Usage

### Basic Layer Sources Management

```typescript
import { LayerSourcesService } from '@tamu-gisc/maps/esri';

constructor(private layerSourcesService: LayerSourcesService) {}

// Get current layer sources
const sources = this.layerSourcesService.getLayerSources();

// Get layer sources with overrides applied
const sourcesWithOverrides = this.layerSourcesService.getLayerSourcesWithOverrides();

// Subscribe to layer sources changes
this.layerSourcesService.layerSources$.subscribe(sources => {
  console.log('Layer sources updated:', sources);
});
```

### Property Overrides

```typescript
// Set layer visibility
this.layerSourcesService.setLayerPropertyOverride('parking-lots', 'visible', false);

// Set layer opacity
this.layerSourcesService.setLayerPropertyOverride('parking-lots', 'opacity', 0.5);

// Set multiple overrides at once
this.layerSourcesService.setLayerOverrides('parking-lots', {
  visible: true,
  opacity: 0.8,
  minScale: 1000000
});

// Check if layer has overrides
const hasOverrides = this.layerSourcesService.hasLayerOverrides('parking-lots');

// Get specific layer overrides
const overrides = this.layerSourcesService.getLayerOverrides('parking-lots');
```

### Integration with Map Service

The map service now automatically uses the layer sources service:

```typescript
import { EsriMapService } from '@tamu-gisc/maps/esri';

constructor(private mapService: EsriMapService) {}

// Access layer sources service through map service
const layerSourcesService = this.mapService.getLayerSourcesService();

// Convenience methods on map service
this.mapService.setLayerVisibility('parking-lots', false);
this.mapService.setLayerOpacity('parking-lots', 0.5);
this.mapService.setLayerOverrides('parking-lots', { visible: true, opacity: 0.8 });

// filterLayerSources now automatically includes overrides
const filteredSources = this.mapService.filterLayerSources(null, { params: true });
```

### Override Management

```typescript
// Remove specific property override
this.layerSourcesService.removeLayerPropertyOverride('parking-lots', 'visible');

// Remove all overrides for a layer
this.layerSourcesService.removeLayerOverrides('parking-lots');

// Clear all overrides for all layers
this.layerSourcesService.clearAllOverrides();

// Subscribe to override changes
this.layerSourcesService.overrides$.subscribe((overrides) => {
  console.log('Overrides updated:', overrides);
});
```

## Types

```typescript
export interface LayerSourceOverride {
  [key: string]: unknown;
}

export interface LayerSourceOverrides {
  [layerId: string]: LayerSourceOverride;
}
```

## Benefits

1. **Separation of Concerns**: Layer source management is separated from map service
2. **Centralized Store**: Single source of truth for layer sources and their overrides
3. **Reactive**: Observable-based for real-time updates
4. **Flexible**: Can override any layer source property including native Esri properties
5. **Type Safe**: Full TypeScript support with proper interfaces
6. **Backward Compatible**: Map service API remains the same with additional convenience methods
