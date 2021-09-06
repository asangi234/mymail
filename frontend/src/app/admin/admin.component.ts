import { Component, OnInit } from '@angular/core';
import {AdminService} from "../_services/admin.services"

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  logged_in_users = null;
  constructor(private adminService:AdminService) { 

  }


  ngOnInit(): void {
    this.load_users()
  }

  load_users(){
    this.adminService.logged_in_users().subscribe((users)=>{
        this.logged_in_users = users
    })
  }

  showurl(id,status){
      console.info(id,status);
      this.adminService.showurl(id,status);
      this.load_users()
  }

}
