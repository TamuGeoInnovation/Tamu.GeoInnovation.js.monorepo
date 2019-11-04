import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { LocationService } from '../providers/location.service';
import { ISubmission } from '../entity/submission.entity';
import { SubmissionService } from '../providers/submission.service';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit {
  public dataSource = [{
    name: "Fire lane sign",
    value: "firelane",
  },{
    name: "Visitor parking sign",
    value: "visitorparking",
  }, {
    name: "Speed limit sign",
    value: "speedlimit",
  }, {
    name: "Building entrance sign",
    value: "buildingentrance",
  }, {
    name: "Building loading zone sign",
    value: "buildingloadingzone",
  }, {
    name: "Motorcycle parking sign",
    value: "motorcycleparking",
  }, {
    name: "Ramp sign",
    value: "ramp",
  }, {
    name: "Accessible parking sign",
    value: "accessibleparking",
  }, {
    name: "Numbered parking sign",
    value: "numberedparking",
  }, {
    name: "Parking lot number sign",
    value: "parkinglotnumber",
  }, {
    name: "University business permit parking sign",
    value: "universitybusinessparking",
  }, {
    name: "Fire department connector (F.D.C.) sign",
    value: "firedepartmentconnector",
  }, {
    name: "Building overview sign",
    value: "buildingoverview",
  }, {
    name: "Loading zone parking sign",
    value: "loadingzone",
  }, {
    name: "No parking sign",
    value: "noparking",
  }, {
    name: "Parking garage sign",
    value: "parkinggarage",
  }, {
    name: "Stop sign",
    value: "stop",
  }, {
    name: "Building number sign",
    value: "buildingnumber",
  }];

  @ViewChild('imagePreview', {
    read: ElementRef,
    static: true
  })
  public imagePreviewRef: ElementRef;

  public signType: string;
  public signDetails: string;
  public canvasCtx: CanvasRenderingContext2D;

  constructor(
    public readonly locationService: LocationService,
    public readonly submissionService: SubmissionService,
  ) { }

  ngOnInit() {

  }

  onPhotoTaken(e) {
    this.canvasCtx = this.imagePreviewRef.nativeElement.getContext('2d');
    let file = null;
    let image = new Image();
    const fileList: FileList = e.target.files;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].type.match(/^image\//)) {
        file = fileList[i];
        break;
      }
    }
    image.onload = () => {
      this.canvasCtx.drawImage(image, 0, 0, 700, 300);
    }

    if (file !== null) {
      image.src = URL.createObjectURL(file);
      // contex.drawImage(file, 0, 0);
    }
  }

  onSelectionType(selectedSignType: string) {
    this.signType = selectedSignType;
  }

  verifySubmissionContents() {
    console.log(this.signType, this.signDetails)
    if (this.signType && this.signDetails) {
      this.submitSubmission()
      // alert("SENDING YOUR SUB");
      // this.resetSubmission();
      // alert(this.locationService.currentLocal.lat + ", " + this.locationService.currentLocal.lon);
    } else {
      // some information was not provided
    }
  }

  submitSubmission() {
    const sub: ISubmission = {
      userGuid: "",
      description: this.signDetails,
      signType: this.signType,
      local: {
        lat: this.locationService.currentLocal.lat,
        lon: this.locationService.currentLocal.lon,
        timestamp: this.locationService.currentLocal.timestamp,
        accuracy: this.locationService.currentLocal.accuracy,
        heading: this.locationService.currentLocal.heading,
        altitude: this.locationService.currentLocal.altitude,
        speed: this.locationService.currentLocal.speed,
      }
    }
    this.submissionService.postSubmission(sub).subscribe(result => {
      console.log(result);
    })
  }

  resetSubmission() {
    this.signType = undefined;
    this.signDetails = undefined;
    this.canvasCtx.clearRect(0, 0, 700, 300);
  }

}
