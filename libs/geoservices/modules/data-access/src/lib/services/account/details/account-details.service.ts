import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { EnvironmentService } from '@tamu-gisc/common/ngx/environment';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountDetailsService {
  public resource: string;

  constructor(private env: EnvironmentService, private http: HttpClient) {
    this.resource = this.env.value('api_url') + 'userServices/getDetails';
  }

  public get details() {
    return this.http.get<IAccountDetails>(this.resource, {
      withCredentials: true
    });
  }

  public updateDetails(details: IAccountDetails): void {
    forkJoin([
      this._updateAccount(details),
      this._updateCompany(details),
      this._updateContact(details),
      this._updateMailing(details)
    ]).subscribe((res) => {
      console.log('updated', res);
    });
  }

  private _updateAccount(d: IAccountDetails) {
    return this.http.get(`${this.env.value('api_url')}userServices/updateAccountData`, {
      withCredentials: true,
      params: {
        UserName: d.UserName
      }
    });
  }

  private _updateCompany(d: IAccountDetails) {
    return this.http.get(`${this.env.value('api_url')}userServices/updateCompanyData`, {
      withCredentials: true,
      params: {
        Organization: d.Organization,
        Position: d.Position,
        Department: d.Department
      }
    });
  }

  private _updateContact(d: IAccountDetails) {
    return this.http.get(`${this.env.value('api_url')}userServices/updateContactData`, {
      withCredentials: true,
      params: {
        FirstName: d.FirstName,
        LastName: d.LastName,
        Email: d.Email,
        BillingEmail: d.BillingEmail,
        Phone: d.Phone,
        Website: d.Website
      }
    });
  }

  private _updateMailing(d: IAccountDetails) {
    return this.http.get(`${this.env.value('api_url')}userServices/updateMailingData`, {
      withCredentials: true,
      params: {
        StreetAddress1: d.Address1,
        StreetAddress2: d.Address2,
        City: d.City,
        State: d.State,
        Zip: d.Zip,
        Country: d.Country
      }
    });
  }
}

export interface IAccountDetails {
  Active: string;
  Added: string;
  Address1: string;
  Address2: string;
  City: string;
  Country: string;
  Department: string;
  Email: string;
  BillingEmail: string;
  FirstName: string;
  Guid: string;
  Id: string;
  LastName: string;
  LastIPAddress: string;
  NotifyNewsUpdates: string;
  Organization: string;
  Phone: string;
  Position: string;
  State: string;
  SignupIPAddress: string;
  UserName: string;
  Website: string;
  Zip: string;
}
