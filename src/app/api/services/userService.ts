import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { catchError, map, throwError, timeout } from 'rxjs';
import { Router } from '@angular/router';
import { LoggingService } from './loggingService';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  ApiTimeoutPeriod: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private _loggingService: LoggingService
  ) { }

  Users(userData: any) {
    this.ApiTimeoutPeriod = JSON.parse(localStorage.getItem("ErroMessageData") || '{}');
    return this.http
      .post(CONSTANTS.API_ENDPOINT + 'Users/GetUserByUserNameForTablet', userData)
      .pipe(
        timeout(this.ApiTimeoutPeriod.timeoutPeriod), // Set timeout to 50 seconds
        map((member) => {
          return member;
        }),
        catchError((error) => {
          if (error.name === 'TimeoutError') {
            return throwError(() => new Error('Request timed out'));
          }
          return throwError(() => error);
        })
      );
  }

  GetTerminalOperatorDetails(toid: any) {
    return this.http
      .get(CONSTANTS.API_ENDPOINT + 'TerminalOperator/' + toid)
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  logout(): void {
    localStorage.removeItem('JWT_Token');
    localStorage.clear();
    const locationId = localStorage.getItem('businessLocationId');
    this._loggingService.PostLogger(
      'TokenInterceptor',
      'intercept()',
      `Token expired For Business Location ID - ${locationId}`
    );
    this.router.navigate(['']);
  }
}
