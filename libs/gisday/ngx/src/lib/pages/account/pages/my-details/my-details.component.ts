import { Component, OnInit } from '@angular/core';
import { AuthService } from '@tamu-gisc/gisday/data-access';
import { Observable } from 'rxjs';

@Component({
  selector: 'tamu-gisc-my-details',
  templateUrl: './my-details.component.html',
  styleUrls: ['./my-details.component.scss']
})
export class MyDetailsComponent implements OnInit {
  public $userDetails: Observable<Partial<any>>;
  constructor(private readonly authService: AuthService) {
    this.fetchEntity();
  }

  ngOnInit(): void {}

  public fetchEntity() {
    this.$userDetails = this.authService.getUserRole();
    // this.authService.getUserRole().subscribe((result) => {
    //   console.log(result);
    // });
    // this.authService.state().subscribe((result) => {
    //   console.log(result);
    // });
  }
}
