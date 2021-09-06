import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {environment} from "../../environments/environment"



@Injectable({ providedIn: 'root' })
export class AdminService {
    
    constructor(private http: HttpClient) {
    
    }

    logged_in_users(): Observable<any[]> {
        return this.http.get<any[]>(environment.apiUrl + "users/logged_in_users")
    }

    showurl(id,status){
        this.http.post<any>(environment.apiUrl + "user/"+id+"/showurl",{"showurl":status}).pipe(
            catchError(this.handleError())
        ).subscribe()
    }

    private handleError<T>(result?: T) {
        return (error: any): Observable<T> => {
          console.log(`failed: ${error.message}`);
          return of(result as T);
        };
      }
    
}
