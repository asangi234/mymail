import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule,HTTP_INTERCEPTORS} from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule} from './material.module';
import { NavbarComponent } from './navbar/navbar.component';
import { MaincontentComponent } from './maincontent/maincontent.component';
import { EmailDirsComponent } from './email-dirs/email-dirs.component';
import { AngularSplitModule } from 'angular-split';
import { EmailComponent,EmailContactComponent } from './email/email.component';
import { EmailListComponent } from './email-list/email-list.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ReactiveFormsModule } from '@angular/forms';

import {BasicAuthInterceptor} from "./_helpers/basic-auth.interceptor";
import { AdminComponent } from './admin/admin.component'



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    MaincontentComponent,
    EmailDirsComponent,
    EmailComponent,
    EmailContactComponent,
    EmailListComponent,
    HomeComponent,
    LoginComponent,
    AdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    ReactiveFormsModule,
    AngularSplitModule.forRoot()
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
