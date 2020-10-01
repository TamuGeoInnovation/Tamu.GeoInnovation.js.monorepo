import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TagService } from '@tamu-gisc/gisday/data-access';
import { Tag } from '@tamu-gisc/gisday/data-api';
import { BaseAdminAddComponent } from '../../base-admin-add/base-admin-add.component';

const config = {
  name: ['']
};

@Component({
  selector: 'tamu-gisc-admin-add-tags',
  templateUrl: './admin-add-tags.component.html',
  styleUrls: ['./admin-add-tags.component.scss']
})
export class AdminAddTagsComponent extends BaseAdminAddComponent<Tag, TagService> {
  constructor(private fb1: FormBuilder, private tagService: TagService) {
    super(fb1, tagService, config);
  }
}

// export class AdminAddTagsComponent implements OnInit {
//   public form: FormGroup;

//   constructor(private fb: FormBuilder, private tagService: TagService) {}

//   ngOnInit(): void {
//     this.form = this.fb.group({
//       name: ['', Validators.required]
//     });
//   }

//   public submitNewTag() {
//     this.tagService.createEntity(this.form.value);
//   }
// }
