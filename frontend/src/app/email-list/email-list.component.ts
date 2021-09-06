import { Component, OnInit,EventEmitter, Input, Output} from '@angular/core';
import {EmailService} from "../email.service";
import { Email } from '../entities';
import {DatePipe} from "@angular/common"
import {AuthenticationService} from "../_services/authentication.service"

@Component({
  selector: 'app-email-list',
  templateUrl: './email-list.component.html',
  styleUrls: ['./email-list.component.css']
})
export class EmailListComponent implements OnInit {

    private datePipe:DatePipe
  constructor(private emailService:EmailService,private authService:AuthenticationService) { 
      this.datePipe = new DatePipe(navigator.languages[0]);
  }

  emails:Email[];

  todayDate : Date = new Date();

  @Output() selected_email = new EventEmitter<String>();
  _selected:Email;

  ngOnInit(): void {
      this.emailService.getEmails().subscribe(
          emails=>this.emails = emails
      );
  }

  load_email(i,email:Email){
      this._selected = email;
      this.selected_email.emit(email.id);
      if (this._selected.read==false){
      this.emailService.set_as_read(email.id).subscribe(
        email=>{
            this.emails[i] = email;
            this._selected = email;
        }
      )
      }

  }

  isTestUser():boolean{
      return this.authService.currentUserValue.username.startsWith("test")
  }

  get_date_representation(date:Date){

      if ((date.getUTCFullYear() == this.todayDate.getUTCFullYear()) && (date.getUTCMonth() == this.todayDate.getUTCMonth()) && (date.getUTCDate() == this.todayDate.getUTCDate())){
          return this.datePipe.transform(date,"HH:mm")
      }
      if (date.getUTCFullYear() == this.todayDate.getUTCFullYear()){
          return this.datePipe.transform(date,"MMM dd")
      }
      


      return   this.datePipe.transform(date,"dd/mm/yyyy")
  }

}
