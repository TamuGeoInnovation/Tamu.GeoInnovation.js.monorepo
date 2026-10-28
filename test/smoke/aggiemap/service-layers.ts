import type { APIRequestContext } from '@playwright/test';

/** What a layer's own metadata says, the part the consistency checks read. */
export interface LayerMetadata {
  name?: string;
  objectIdField?: string;
  displayField?: string;
  fields?: Array<{ name: string }>;
  serviceItemId?: string;
  error?: unknown;
}

/** One layer of a hosted service and the metadata it published. */
export interface ServiceLayer {
  url: string;
  id: number;
  metadata: LayerMetadata | null;
}

/** The checks, named as they appear in `allowedServiceMetadataFailures` keys. */
export type MetadataCheck = 'objectIdField' | 'displayField' | 'countQuery';

export interface MetadataProblem {
  check: MetadataCheck;
  message: string;
}

/** The layer endpoints a service URL stands for: itself when it names a layer, otherwise each leaf layer of its service. */
export async function layerUrlsOf(request: APIRequestContext, url: string): Promise<string[]> {
  if (/\/(MapServer|FeatureServer)\/\d+$/.test(url)) {
    return [url];
  }

  const root = await (await request.get(`${url}?f=json`, { timeout: 30_000 })).json();

  return ((root.layers ?? []) as Array<{ id: number; subLayerIds?: number[] | null }>)
    .filter((layer) => !layer.subLayerIds?.length)
    .map((layer) => `${url}/${layer.id}`);
}

const cache = new Map<string, Promise<ServiceLayer[]>>();

/**
 * Each layer of a service with its metadata. Asked for once per worker, so the specs that read the same
 * service (`portal-renderers.spec.ts`, `service-metadata.spec.ts`) share the request.
 */
export function serviceLayers(request: APIRequestContext, url: string): Promise<ServiceLayer[]> {
  if (!cache.has(url)) {
    cache.set(
      url,
      (async () => {
        const layerUrls = await layerUrlsOf(request, url).catch(() => [] as string[]);

        return Promise.all(
          layerUrls.map(async (layerUrl) => ({
            url: layerUrl,
            id: Number(layerUrl.split('/').pop()),
            metadata: (await (await request.get(`${layerUrl}?f=json`, { timeout: 30_000 })).json().catch(() => null)) as LayerMetadata | null
          }))
        );
      })()
    );
  }

  return cache.get(url) as Promise<ServiceLayer[]>;
}

/**
 * The inconsistencies in what a layer says about its own fields (#2510). Field names compare without regard to
 * case, as the portal renderer check does: the service itself is not strict about it.
 */
export function metadataProblems(metadata: LayerMetadata | null): MetadataProblem[] {
  if (!metadata || metadata.error) {
    return [];
  }

  const names = new Set((metadata.fields ?? []).map((field) => field.name.toLowerCase()));
  const problems: MetadataProblem[] = [];

  if (metadata.objectIdField && !names.has(metadata.objectIdField.toLowerCase())) {
    problems.push({
      check: 'objectIdField',
      message: `objectIdField "${metadata.objectIdField}" is not one of its fields`
    });
  }

  if (metadata.displayField && !names.has(metadata.displayField.toLowerCase())) {
    problems.push({
      check: 'displayField',
      message: `displayField "${metadata.displayField}" is not one of its fields`
    });
  }

  return problems;
}

/** Why the simplest query fails, or null when the layer answers it. An error can arrive with a 200 status. */
export function countQueryProblem(response: { ok: boolean; status: number; body: unknown }): MetadataProblem | null {
  const body = response.body as { count?: unknown; error?: { code?: number; message?: string } } | null;

  if (body?.error) {
    return { check: 'countQuery', message: `where=1=1&returnCountOnly=true returned error ${body.error.code}: ${body.error.message}` };
  }

  if (!response.ok) {
    return { check: 'countQuery', message: `where=1=1&returnCountOnly=true returned HTTP ${response.status}` };
  }

  if (typeof body?.count !== 'number') {
    return { check: 'countQuery', message: 'where=1=1&returnCountOnly=true returned no count' };
  }

  return null;
}
