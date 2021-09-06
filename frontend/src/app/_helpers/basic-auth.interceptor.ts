import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable ,throwError} from 'rxjs';
import { catchError} from 'rxjs/operators';
import { Router } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService,private router: Router, private _snackBar: MatSnackBar) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add authorization header with basic auth credentials if available
        const currentUser = this.authenticationService.currentUserValue;
        if (currentUser && currentUser.session_id) {
            request = request.clone({
                setHeaders: { 
                    Authorization: `Basic ${currentUser.session_id}`
                }
            });
        }
        return next.handle(request)
        .pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = '';
                if (error.error instanceof ErrorEvent) {
                    // client-side error
                    errorMessage = `Error: ${error.error.message}`;
                } else {
                    // server-side error
                    errorMessage = `Error Status: ${error.status} \nMessage: ${error.message}`;
                    if (error.status==401){
                        localStorage.removeItem('currentUser')
                        // if (!request.url.includes("logout")){
                        //     this.authenticationService.logout();
                        // }
                        this.router.navigate(["login"],{queryParams: { returnUrl: "" }})
                    }
                }
                console.log(errorMessage);
                this._snackBar.open(errorMessage,"Dismiss",{
                    duration: 10000,
                  })
                return throwError(errorMessage);
              }
            )
        );
    }
}
