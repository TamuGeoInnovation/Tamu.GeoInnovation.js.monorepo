import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { IdentityService } from '@tamu-gisc/geoservices/core/ngx';

@Injectable()
export class LocalEmailGuard implements CanActivate {
    constructor(public id: IdentityService, public router: Router) {}

    canActivate(): boolean {
        
    }

}