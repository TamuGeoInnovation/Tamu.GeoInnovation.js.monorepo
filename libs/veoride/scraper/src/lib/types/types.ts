import { MDSStatusChangeDto, MDSTripDto, MDSVehicleDto, ResourceType } from '@tamu-gisc/veoride/common/entities';

export interface AbstractCollectorConstructorProperties {
  /**
   * Bearer token authorization key to be used in all resource requests.
   */
  token: string;

  url: string;

  /**
   * Interval to check for new resource objects in minutes.
   */
  interval: number;

  resourceName: ResourceType;
}

export interface BaseRequestParams {
  [key: string]: string;
}

export interface MDSResponse<ResourceType> {
  version: string;
  data: ResourceType;
}

/**
 * Request parameters for for trips from an MDS provider API
 */
export interface TripRequestParams extends BaseRequestParams {
  /**
   * Date time string representing the hour of data to be scraped.
   *
   * Per the MDS specification, only one hour at a time can be requested.
   */
  end_time: string;
}

/**
 * Request parameters for for status changes from an MDS provider API
 */
export interface StatusChangesRequestParams extends BaseRequestParams {
  /**
   * Date time string representing the hour of data to be scraped.
   *
   * Per the MDS specification, only one hour at a time can be requested.
   */
  event_time: string;
}

export interface MDSTripsPayloadDto {
  trips: Array<MDSTripDto>;
}

export interface MDSStatusChangesPayloadDto {
  status_changes: Array<MDSStatusChangeDto>;
}

export interface MDSVehiclesPayloadDto {
  vehicles: Array<MDSVehicleDto>;
}
