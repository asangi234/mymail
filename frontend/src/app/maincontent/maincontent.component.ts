import { Component, OnInit, ViewChild } from '@angular/core';
import { EmailDirsComponent } from '../email-dirs/email-dirs.component';

@Component({
  selector: 'app-maincontent',
  templateUrl: './maincontent.component.html',
  styleUrls: ['./maincontent.component.css']
})
export class MaincontentComponent implements OnInit {
  @ViewChild(EmailDirsComponent) emailDir;

  showFiller = true;

  constructor() { }

  ngOnInit(): void {
  }

  show(){
    this.showFiller = true;
  }
  hide(){
    this.showFiller = false;
  }
  toggle(){
    this.showFiller = !this.showFiller;
    this.emailDir.longForm = this.showFiller;
    console.log(this.showFiller);
  }

}
