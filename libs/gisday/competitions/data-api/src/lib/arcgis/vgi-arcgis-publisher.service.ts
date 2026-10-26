import { createHash } from 'crypto';

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { COMPETITION_VALIDATION_STATUS } from '@tamu-gisc/gisday/common';

import { CompetitionSubmission } from '../entities/all.entities';

/**
 * The fields of the season's ArcGIS Online layer that each submission fills (#2433). The layer is created
 * in ArcGIS Online with these names; the issue lists their types.
 */
export const VGI_ARCGIS_FIELDS = {
  id: 'submission_id',
  type: 'memorial_type',
  name: 'memorial_name',
  submitted: 'submitted',
  status: 'review_status',
  accuracy: 'accuracy_m',
  participant: 'participant'
} as const;

/**
 * Where to publish and how to sign in, from `gisday-nest`'s settings, or `undefined` when publishing is not
 * set up, as on a local or development run:
 *
 * - `VGI_ARCGIS_LAYER_URL`: the layer's REST address, ending in its index (`.../FeatureServer/0`);
 * - `VGI_ARCGIS_CLIENT_ID` and `VGI_ARCGIS_CLIENT_SECRET`: an ArcGIS Online application whose owner can
 *   edit the layer;
 * - `VGI_ARCGIS_PORTAL_URL`, optional: where to sign in, `https://www.arcgis.com` by default.
 */
export function vgiArcgisSettings(env: NodeJS.ProcessEnv = process.env) {
  const layerUrl = env.VGI_ARCGIS_LAYER_URL?.replace(/\/+$/, '');
  const clientId = env.VGI_ARCGIS_CLIENT_ID;
  const clientSecret = env.VGI_ARCGIS_CLIENT_SECRET;

  if (!layerUrl || !clientId || !clientSecret) {
    return undefined;
  }

  return {
    layerUrl,
    clientId,
    clientSecret,
    portalUrl: (env.VGI_ARCGIS_PORTAL_URL || 'https://www.arcgis.com').replace(/\/+$/, '')
  };
}

/**
 * Publishes VGI submissions to the season's ArcGIS Online layer (#2433): each as a point with its fields and
 * its photos as attachments, and again whenever its review status changes, so the layer matches the admin
 * Submissions page. A submission's point is found again by its id, so publishing twice updates rather than
 * duplicates.
 */
@Injectable()
export class VgiArcgisPublisher {
  private token?: { value: string; expires: number };

  constructor(@InjectRepository(CompetitionSubmission) private readonly submissionRepo: Repository<CompetitionSubmission>) {}

  /**
   * Publishes a submission without making the caller wait or ever fail: a participant's upload and an
   * admin's review succeed whatever ArcGIS Online does. A failure is logged, and the admin page's "Publish to
   * ArcGIS" sends it again.
   */
  public publishInBackground(submissionGuid: string): void {
    this.publish(submissionGuid).catch((err) =>
      Logger.error(
        `Could not publish submission ${submissionGuid} to ArcGIS Online: ${err?.message ?? err}`,
        'VgiArcgisPublisher'
      )
    );
  }

  /**
   * Adds the submission's point, or updates it when it is already published, and adds its photos when the
   * point has none.
   */
  public async publish(submissionGuid: string): Promise<'added' | 'updated' | 'not configured'> {
    const settings = vgiArcgisSettings();

    if (!settings) {
      return 'not configured';
    }

    const submission = await this.submissionRepo.findOne({
      where: { guid: submissionGuid },
      relations: { location: true, validationStatus: true, blobs: true, season: { form: true } }
    });

    if (!submission) {
      throw new Error('No such submission.');
    }

    const token = await this.signIn(settings);
    const feature = toFeature(submission);
    const found = await arcgis(`${settings.layerUrl}/query`, token, {
      where: `${VGI_ARCGIS_FIELDS.id} = '${submission.guid.replace(/'/g, "''")}'`,
      returnIdsOnly: 'true'
    });
    const objectIdField: string = found.objectIdFieldName ?? 'OBJECTID';
    const objectId: number | undefined = found.objectIds?.[0];

    if (objectId === undefined) {
      const added = await arcgis(`${settings.layerUrl}/addFeatures`, token, { features: JSON.stringify([feature]) }, 'POST');
      const result = added.addResults?.[0];

      if (!result?.success) {
        throw new Error(result?.error?.description ?? 'ArcGIS Online did not add the point.');
      }

      await this.addPhotos(settings.layerUrl, token, result.objectId, submission);

      return 'added';
    }

    const updated = await arcgis(
      `${settings.layerUrl}/updateFeatures`,
      token,
      { features: JSON.stringify([{ ...feature, attributes: { ...feature.attributes, [objectIdField]: objectId } }]) },
      'POST'
    );

    if (!updated.updateResults?.[0]?.success) {
      throw new Error(updated.updateResults?.[0]?.error?.description ?? 'ArcGIS Online did not update the point.');
    }

    const existing = await arcgis(`${settings.layerUrl}/${objectId}/attachments`, token, {});

    if (!existing.attachmentInfos?.length) {
      await this.addPhotos(settings.layerUrl, token, objectId, submission);
    }

    return 'updated';
  }

  /**
   * Publishes every submission of a competition season, one after another, and counts the ones that failed.
   * Safe to run again: points already published are updated, not duplicated.
   */
  public async publishSeason(
    competitionSeasonGuid: string
  ): Promise<{ published: number; failed: number; configured?: false }> {
    if (!vgiArcgisSettings()) {
      return { published: 0, failed: 0, configured: false };
    }

    const submissions = await this.submissionRepo.find({
      where: { season: { guid: competitionSeasonGuid } },
      select: { guid: true }
    });
    let published = 0;
    let failed = 0;

    for (const { guid } of submissions) {
      try {
        await this.publish(guid);
        published++;
      } catch (err) {
        failed++;
        Logger.error(`Could not publish submission ${guid} to ArcGIS Online: ${err?.message ?? err}`, 'VgiArcgisPublisher');
      }
    }

    return { published, failed };
  }

  private async addPhotos(layerUrl: string, token: string, objectId: number, submission: CompetitionSubmission) {
    for (const [i, photo] of (submission.blobs ?? []).entries()) {
      const form = new FormData();
      const type = photo.mimeType || 'image/jpeg';

      form.append(
        'attachment',
        new Blob([Uint8Array.from(photo.blob as unknown as Uint8Array)], { type }),
        `${photo.fieldName || `photo-${i + 1}`}.${type.split('/')[1] || 'jpg'}`
      );
      form.append('f', 'json');
      form.append('token', token);

      await answer(await fetch(`${layerUrl}/${objectId}/addAttachment`, { method: 'POST', body: form }));
    }
  }

  /**
   * A token for the application, reused until five minutes before it expires.
   */
  private async signIn(settings: NonNullable<ReturnType<typeof vgiArcgisSettings>>): Promise<string> {
    if (this.token && this.token.expires > Date.now()) {
      return this.token.value;
    }

    const response = await answer(
      await fetch(`${settings.portalUrl}/sharing/rest/oauth2/token`, {
        method: 'POST',
        body: new URLSearchParams({
          client_id: settings.clientId,
          client_secret: settings.clientSecret,
          grant_type: 'client_credentials',
          expiration: '120',
          f: 'json'
        })
      })
    );

    this.token = { value: response.access_token, expires: Date.now() + (Number(response.expires_in) - 300) * 1000 };

    return this.token.value;
  }
}

/**
 * A submission as a point in the layer: where it was found, and the fields `VGI_ARCGIS_FIELDS` names.
 */
function toFeature(submission: CompetitionSubmission) {
  const typeQuestion = submission.season?.form?.model?.find((q) => q.isDiscriminator === true);
  const type = typeQuestion ? submission.value?.[typeQuestion.attribute] : undefined;
  const nameAttribute = typeQuestion?.options?.find((option) => option.value === type)?.nameAttribute;
  const accuracy = Number(submission.location?.accuracy);

  return {
    geometry: {
      x: Number(submission.location?.longitude),
      y: Number(submission.location?.latitude),
      spatialReference: { wkid: 4326 }
    },
    attributes: {
      [VGI_ARCGIS_FIELDS.id]: submission.guid,
      [VGI_ARCGIS_FIELDS.type]: type ?? null,
      [VGI_ARCGIS_FIELDS.name]: nameAttribute ? (submission.value?.[nameAttribute] ?? null) : null,
      [VGI_ARCGIS_FIELDS.submitted]: new Date(submission.created).getTime(),
      [VGI_ARCGIS_FIELDS.status]: submission.validationStatus?.status ?? COMPETITION_VALIDATION_STATUS.unverified,
      [VGI_ARCGIS_FIELDS.accuracy]: accuracy > 0 ? accuracy : null,
      [VGI_ARCGIS_FIELDS.participant]: participantId(submission.userGuid)
    }
  };
}

/**
 * The same short id for each of a participant's submissions, from which their account cannot be read: the
 * layer never carries an email, a name or an Auth0 account id.
 */
function participantId(userGuid: string): string {
  return createHash('sha256').update(`gisday-vgi:${userGuid}`).digest('hex').slice(0, 16);
}

/**
 * Calls a layer endpoint with the token: a GET with its parameters in the address, or a form POST.
 */
async function arcgis(url: string, token: string, params: Record<string, string>, method: 'GET' | 'POST' = 'GET') {
  const all = new URLSearchParams({ ...params, f: 'json', token });

  return answer(method === 'GET' ? await fetch(`${url}?${all}`) : await fetch(url, { method, body: all }));
}

/**
 * The JSON of an ArcGIS Online answer, or an error with its message. ArcGIS Online reports most failures
 * with status 200 and an `error` in the body.
 */
async function answer(response: Response) {
  const body = await response.json().catch(() => ({}));

  if (!response.ok || body?.error) {
    throw new Error(body?.error?.message ?? `ArcGIS Online answered ${response.status}.`);
  }

  return body;
}
