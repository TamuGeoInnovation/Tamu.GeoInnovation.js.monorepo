import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LocationService } from '../providers/location.service';
import { SubmissionService } from '../providers/submission.service';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit {
  public dataSource = [
    {
      name: 'Building Identification',
      value: '54AAB1B5-F925-459C-9E28-C8722EAF5A0C'
    },
    {
      name: 'Accessible Building Signs',
      value: 'FD68B430-ED9C-430D-A59A-EF30EC746CE7'
    },
    {
      name: 'Memorial Bench & Tree Plaques',
      value: '8E3679FA-15D4-456A-A596-FD0E14B25EF9'
    },
    {
      name: 'Historical Markers',
      value: '5617C23F-5B7F-4A6C-BA8E-F40D7417356C'
    },
    {
      name: 'Parking Lot and Vehicular Direction',
      value: '4A041D35-A4A9-421A-94F6-FD534C0281DD'
    },
    {
      name: 'Other',
      value: 'D5E20F64-82C1-459B-A73E-F5F73EE5A3A2'
    },
  ];

  @ViewChild('imagePreview', {
    read: ElementRef,
    static: true
  })
  public imagePreviewRef: ElementRef;

  public signType: string;
  public signDetails: string;
  public file: File;
  public fileUrl: string;

  constructor(public readonly locationService: LocationService, public readonly submissionService: SubmissionService) {}

  public ngOnInit() {}

  public onPhotoTaken(e) {
    const fileList: FileList = e.target.files;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.match(/^image\//)) {
        this.file = fileList[i];
        break;
      }
    }

    if (this.file !== null) {
      this.fileUrl = URL.createObjectURL(this.file);
    }
  }

  public onSelectionType(selectedSignType: string) {
    this.signType = selectedSignType;
  }

  public verifySubmissionContents() {
    console.log(this.signType, this.signDetails);
    if (this.signType && this.signDetails) {
      // this.submitSubmission();
      // this.resetSubmission();
      // alert(this.locationService.currentLocal.lat + ", " + this.locationService.currentLocal.lon);
    } else {
      // some information was not provided
    }
  }

  public submitSubmission() {
    const data: FormData = new FormData();
    data.append('UserGuid', 'CHANGE ME');
    data.append('Description', this.signDetails);
    data.append('SignType', this.signType);
    data.append('Lat', this.locationService.currentLocal.lat);
    data.append('Lon', this.locationService.currentLocal.lon);
    data.append('Accuracy', this.locationService.currentLocal.timestamp);
    data.append('Timestamp', this.locationService.currentLocal.accuracy);
    data.append('Heading', this.locationService.currentLocal.heading);
    data.append('Altitude', this.locationService.currentLocal.altitude);
    data.append('Speed', this.locationService.currentLocal.speed);
    data.append('photoA', this.file);

    this.submissionService.postSubmission(data).subscribe((result) => {
      console.log(result);
    });
  }

  public resetSubmission() {
    this.signType = undefined;
    this.signDetails = undefined;
  }
}
