import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { TableColumn } from '@swimlane/ngx-datatable';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-aggiemap-directory',
  templateUrl: './directory.component.html',
  styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {
  public data: Observable<Array<BuildingDirectoryEntry>>;
  public rows: BuildingDirectoryEntry[] = [];
  public loadingIndicator = true;

  // Define the columns for the datatable
  public columns: TableColumn[] = [
    { name: 'Name', prop: 'BldgName', canAutoResize: true, width: 350 },
    { name: 'Number', prop: 'Bldg', canAutoResize: true },
    { name: 'Abbreviation', prop: 'BldgAbbr', canAutoResize: true }
  ];

  constructor(private readonly http: HttpClient) {}

  public ngOnInit(): void {
    this.data = this.http.get<Array<BuildingDirectoryEntry>>('/assets/data/building-directory-1756502603044.json');

    // Load data into rows array for the datatable
    this.data.subscribe({
      next: (buildings) => {
        this.rows = buildings;
        this.loadingIndicator = false;
      },
      error: (error) => {
        console.error('DirectoryComponent: Error loading data:', error);
        this.loadingIndicator = false;
      }
    });
  }
}

interface BuildingDirectoryEntry {
  Bldg: string;
  BldgName: string;
  BldgAbbr: string;
  OwnerFICE: string;
  OwnerAbbr: string;
  StatusCode: string;
  Status: string;
  SiteLocCode: string;
  SiteLocCodeDescription: string;
  LocationType: string;
  LocationTypeDescription: string;
  ConditionCode: string;
  TypeCode: string;
  YearBuilt: string | number;
  Address1: string;
  City: string;
  ZipCode: string | number;
}
