import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from "../../environments/environment"
import { Router} from '@angular/router';

import { User } from '../entities';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient, private router:Router) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(username: string, password: string) {
        return this.http.post<any>(`${environment.apiUrl}user/authenticate`, { username, password })
            .pipe(map(status => {
                // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                console.log(status)
                if (status["status"] =="fail"){
                    return status
                }else{
                    let user = status["user"];
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.currentUserSubject.next(user);
                    return status;
                }
            }));
    }


    logout() {
        // remove user from local storage to log user out
        this.http.get<any>(`${environment.apiUrl}user/logout`)
            .pipe(map(status => {
                // store user details and basic auth credentials in local storage to keep user logged in between page refreshes
                console.log(status);
                return status;
            })).subscribe(
                ()=>{
                    localStorage.removeItem('currentUser');
                    this.currentUserSubject.next(null);
                    this.router.navigate(["login"],{queryParams: { returnUrl: "" }})
                }
            );
    }
}