import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../modules/auth/services/auth.service';

@Component({
  selector: 'tamu-gisc-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {
  constructor(private readonly auth: AuthService) {}

  public ngOnInit(): void {}
}
