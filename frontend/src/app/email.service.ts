import { Injectable } from '@angular/core';
import { Email, Contact } from "./entities"
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from "../environments/environment"

@Injectable({
    providedIn: 'root'
})
export class EmailService {
    private api_url = environment.apiUrl;  // URL to web api
    constructor(
        private http: HttpClient
    ) { }

    getEmails(): Observable<Email[]> {
        return this.http.get<Email[]>(this.api_url + "email")
            .pipe(
                map(
                    (emails) => {
                        let email_objs=new Array<Email>(emails.length)
                        for (let i = 0; i < emails.length; i++) {
                            email_objs[i] = Object.assign(new Email(),emails[i])
                            email_objs[i].date = new Date(emails[i].date)
                        }
                        return email_objs;
                    }
                )
            );
    }

    getEmail(id: String): Observable<Email> {
        return this.http.get<Email>(this.api_url + "email/" + id)
            .pipe(
                map(
                    (email) => {
                        email.date = new Date(email.date)
                        return Object.assign(new Email(),email)
                    }
                )
            );
    }

    set_as_read(id: String): Observable<Email> {
        return this.http.post<Email>(this.api_url + "email/" + id+"/read",{read:true})
            .pipe(
                map(
                    (email) => {
                        email.date = new Date(email.date)
                        return Object.assign(new Email(),email)
                    }
                )
            );
    }
}
