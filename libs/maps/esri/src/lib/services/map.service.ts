import { Injectable } from '@angular/core';
import { EsriModuleProviderService } from './module-provider.service';
import { AsyncSubject, Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  constructor() {}
}
