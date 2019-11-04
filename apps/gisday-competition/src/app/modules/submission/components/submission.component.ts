import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss']
})
export class SubmissionComponent implements OnInit {

  public dataSource = [{
    name: "HELLO",
    value: "hello",
  },{
    name: "GOODBYE",
    value: "goodbye",
  }];

  constructor() { 
    // this.dataSource.push({
    //   name: "HELLO",
    //   value: "hello",
    // });
    // this.dataSource.push({
    //   name: "GOODBYE",
    //   value: "goodbye",
    // });
  }

  ngOnInit() {
  }

}
