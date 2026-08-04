import 'jest-preset-angular/setup-jest';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { AppStorage } from '@tamu-gisc/common/ngx/local-store';
import { ANGULARTICS2_TOKEN, Angulartics2, RouterlessTracking } from 'angulartics2';

beforeEach(() => {
  TestBed.overrideProvider(ActivatedRoute, {
    useValue: {
      params: of({ eventId: '4h-roundup-2026' }),
      queryParams: of({}),
      snapshot: {
        data: {},
        params: { eventId: '4h-roundup-2026' },
        queryParams: {},
        queryParamMap: { get: () => null }
      }
    }
  });

  TestBed.overrideProvider(HttpClient, {
    useValue: {
      get: () => of({}),
      post: () => of({}),
      put: () => of({}),
      delete: () => of({}),
      patch: () => of({})
    }
  });

  TestBed.overrideProvider(EnvironmentService, {
    useValue: {
      value: () => [],
      values: () => []
    }
  });

  TestBed.overrideProvider(RouterlessTracking, {
    useValue: {}
  });

  TestBed.overrideProvider(Angulartics2, {
    useValue: {
      eventTrack: {
        next: () => undefined
      }
    }
  });

  TestBed.overrideProvider(ANGULARTICS2_TOKEN, {
    useValue: {}
  });

  TestBed.overrideProvider(AppStorage, {
    useValue: {
      get: () => null,
      set: () => null
    }
  });
});
