import { Component, OnInit,  EventEmitter, Output } from '@angular/core';
import {AuthenticationService} from "../_services/authentication.service"
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavbarComponent implements OnInit {
  
  

  constructor(
      private authenticationService: AuthenticationService,
      private router: Router,
    ) { }
  @Output() toggle = new EventEmitter<void>();

  ngOnInit(): void {
      
  }

  showhide(){
    this.toggle.emit()
  }

  logout(){
    this.authenticationService.logout()
  }
}
