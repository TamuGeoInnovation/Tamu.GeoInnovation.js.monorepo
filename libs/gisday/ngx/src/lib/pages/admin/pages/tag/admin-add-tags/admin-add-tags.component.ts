import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TagService } from '@tamu-gisc/gisday/data-access';

@Component({
  selector: 'tamu-gisc-admin-add-tags',
  templateUrl: './admin-add-tags.component.html',
  styleUrls: ['./admin-add-tags.component.scss']
})
export class AdminAddTagsComponent implements OnInit {
  public form: FormGroup;

  constructor(private fb: FormBuilder, private tagService: TagService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  public submitNewTag() {
    this.tagService.createEntity(this.form.value);
  }
}
