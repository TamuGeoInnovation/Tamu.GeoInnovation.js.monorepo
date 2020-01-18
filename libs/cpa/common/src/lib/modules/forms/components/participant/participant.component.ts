import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'tamu-gisc-participant',
  templateUrl: './participant.component.html',
  styleUrls: ['./participant.component.scss']
})
export class ParticipantComponent implements OnInit {
  public form: FormGroup;
  
  constructor(private fb: FormBuilder) {}

  public ngOnInit() {}
}
