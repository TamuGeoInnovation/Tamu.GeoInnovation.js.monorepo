import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { TripModeSwitch } from '../../trip-planner/trip-planner.service';
import esri = __esri;

@Injectable()
export class InrixService {
  constructor(private http: HttpClient) {}

  public annotateDriveFeature(f: esri.Graphic, modeSwitch: TripModeSwitch, minutesToCur: Date): Observable<esri.Graphic> {
    const vendorId = 0; // TODO FIND A WAY TO STORE THIS OUTSIDE GIT
    const consumerId = 'some-long-uuid-here'; // TODO FIND A WAY TO STORE THIS OUTSIDE GIT

    const security_url = `http://api.inrix.com/traffic/inrix.ashx?action=getsecuritytoken&VendorID=${vendorId}&ConsumerID=${consumerId}&format=json`;

    // TODO: Re-implement
    // return this.http.get(security_url).pipe(
    //   switchMap((payload: InrixTokenJson) => {
    //     const base_url = payload.result.serverPaths
    //       .filter((sp) => sp.region == 'NA')[0]
    //       .serverPath.filter((sp) => sp.type == 'API')[0].href;
    //     return of(`${base_url}?token=${payload.result.token}`);
    //   }),
    //   switchMap((base_url: string) => {
    //     const corner1 = modeSwitch.graphics[0];
    //     const corner2 = modeSwitch.graphics[modeSwitch.graphics.length - 1];
    //     return this.http.get(
    //       `${base_url}&action=GetSegmentSpeedInBox&corner1=${corner1.latitude}|${corner1.longitude}&corner2=${
    //         corner2.latitude
    //       }|${corner2.longitude}&Units=0&Format=JSON`
    //     );
    //   }),
    //   switchMap((payload: InrixSpeedJson) => {
    //     console.log(payload.result.segmentSpeeds[0].segments);
    //     // TODO Query against the shapefile provided to get segments, then use those segments to query real-time INRIX
    //     // f.attributes.relativeTime += on_bus_minutes + linger_minutes - f.attributes.time;
    //     return of(f);
    //   })
    // );

    return of(f);
  }
}

interface InrixTokenJson {
  result: {
    token: string;
    serverPaths: Array<{
      region: 'NA' | 'EU';
      serverPath: Array<{
        href: string;
        type: 'API' | 'TTS';
      }>;
    }>;
  };
}

interface InrixSpeedJson {
  result: {
    coverage: number;
    segmentSpeeds: {
      timestamp: string;
      segments: {
        type: 'TMC' | 'XDS'; // Type of segment
        code: string; // ID for this segment, either TMC or INRIX XD Segment ID

        score: 30 | 20 | 10; // 30 indicates live view, 20 means estimated, 10 means historical; refers to speed parameter below
        speedBucket: number; // Level of congestion

        reference: number; // Free flow speed for the given timestamp
        average: number; // Typical speed on this segment for the given timestamp
        speed: number; // Current speed on the segment

        travelTimeMinutes: number; // Expected time travel along the segment at the current speed

        'c-Value': number;
      }[];
    }[];
  };
}
