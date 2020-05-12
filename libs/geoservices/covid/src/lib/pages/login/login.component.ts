import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tamu-gisc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor() { 
    window.location.href = "http://localhost:3333/api/oidc/login";
  }

  ngOnInit() {
  }

}
