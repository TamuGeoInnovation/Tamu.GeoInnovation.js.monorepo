import { Component, OnInit } from '@angular/core';

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

  public signType: string;
  public signDetails: string;

  constructor() { }

  ngOnInit() {

  }

  onSelectionType(selectedSignType: string) {
    this.signType = selectedSignType;
  }

  verifySubmissionContents() {
    console.log(this.signType, this.signDetails)
  }

}
