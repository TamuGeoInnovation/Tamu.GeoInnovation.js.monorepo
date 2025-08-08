import { TestBed } from '@angular/core/testing';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';

import { LayerSourcesService } from './layer-sources.service';

describe('LayerSourcesService', () => {
  let service: LayerSourcesService;
  let environmentService: jest.Mocked<EnvironmentService>;

  const mockLayerSources = [
    { id: 'layer1', type: 'feature', url: 'test-url-1' },
    { id: 'layer2', type: 'feature', url: 'test-url-2' }
  ];

  beforeEach(() => {
    const environmentServiceMock = {
      value: jest.fn().mockReturnValue(mockLayerSources)
    } as unknown as jest.Mocked<EnvironmentService>;

    TestBed.configureTestingModule({
      providers: [LayerSourcesService, { provide: EnvironmentService, useValue: environmentServiceMock }]
    });

    service = TestBed.inject(LayerSourcesService);
    environmentService = TestBed.inject(EnvironmentService) as jest.Mocked<EnvironmentService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize layer sources from environment', () => {
    expect(environmentService.value).toHaveBeenCalledWith('LayerSources');
    expect(service.getLayerSources()).toEqual(mockLayerSources);
  });

  it('should set layer property override', () => {
    service.setLayerPropertyOverride('layer1', 'visible', false);

    const overrides = service.getLayerOverrides('layer1');
    expect(overrides).toEqual({ visible: false });
  });

  it('should set multiple layer overrides', () => {
    const overrides = { visible: false, opacity: 0.5 };
    service.setLayerOverrides('layer1', overrides);

    const result = service.getLayerOverrides('layer1');
    expect(result).toEqual(overrides);
  });

  it('should get layer sources with overrides applied', () => {
    service.setLayerPropertyOverride('layer1', 'visible', false);

    const result = service.getLayerSourcesWithOverrides();
    expect(result[0]).toEqual({ ...mockLayerSources[0], visible: false });
    expect(result[1]).toEqual(mockLayerSources[1]);
  });

  it('should remove layer property override', () => {
    service.setLayerOverrides('layer1', { visible: false, opacity: 0.5 });
    service.removeLayerPropertyOverride('layer1', 'visible');

    const overrides = service.getLayerOverrides('layer1');
    expect(overrides).toEqual({ opacity: 0.5 });
  });

  it('should remove all layer overrides', () => {
    service.setLayerOverrides('layer1', { visible: false, opacity: 0.5 });
    service.removeLayerOverrides('layer1');

    const overrides = service.getLayerOverrides('layer1');
    expect(overrides).toBeUndefined();
  });

  it('should clear all overrides', () => {
    service.setLayerPropertyOverride('layer1', 'visible', false);
    service.setLayerPropertyOverride('layer2', 'opacity', 0.5);
    service.clearAllOverrides();

    expect(service.getAllOverrides()).toEqual({});
  });

  it('should check if layer has overrides', () => {
    expect(service.hasLayerOverrides('layer1')).toBe(false);

    service.setLayerPropertyOverride('layer1', 'visible', false);
    expect(service.hasLayerOverrides('layer1')).toBe(true);
  });

  it('should refresh layer sources', () => {
    const newMockLayerSources = [{ id: 'layer3', type: 'feature', url: 'test-url-3' }];

    environmentService.value.mockReturnValue(newMockLayerSources);
    service.refreshLayerSources();

    expect(service.getLayerSources()).toEqual(newMockLayerSources);
  });
});
