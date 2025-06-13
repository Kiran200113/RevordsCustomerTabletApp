// src/app/interceptors/token.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { UserService } from './userService';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private _userService: UserService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (this.isTokenExpired()) {
      this._userService.logout();
      return throwError('Token expired');
    }

    const jwtToken = localStorage.getItem('JWT_Token');
    if (jwtToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status == 401) {
          this._userService.logout();
        }
        return throwError(error);
      })
    );
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('JWT_Token');
    if (!token) {
      return false; // No token means expired or not logged in
    }

    try {
      const decoded: any = jwtDecode(token);
      const expirationDate = new Date(decoded.exp * 1000); // Convert exp to milliseconds   
      return expirationDate < new Date();
    } catch (error) {
      return true; // Decoding failed, assume expired
    }
  }
}
