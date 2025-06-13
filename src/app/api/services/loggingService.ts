import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as CONSTANTS from './Constants';
import { map } from 'rxjs';
import { ILoggerService } from './ilogservice';
import { User } from '../model';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Injectable({
  providedIn: 'root',
})
export class LoggingService {
  constructor(private dbService: NgxIndexedDBService, private http: HttpClient) { }

  PostLogger(page: any, method: any, message: any) {
    let LocationName = localStorage.getItem('sourceName');
    let msg = LocationName + ' > ' + page + ' > ' + method + ' > ' + message;
    let log = {
      deviceType: CONSTANTS.DeviceTypeForLog,
      message: msg,
    };


    this.PostLoggerForFrontEnd(log).subscribe(
      async (res: any) => {

      },
      async (error) => {
        // const folderName = 'Download/CustomerApp_Error-Logs/';
        // this._iloggerService.saveJsonFile(msg, folderName);
        this.saveLogOffline(log);
      }
    );
  }

  saveLogOffline(log: any) {
    this.dbService.add('logs', log).subscribe(
      async (res: any) => { },
      async (error) => {
        // this.PostLogger("LoggingService", "saveLogOffline()", error.message);
      }
    );
  }

  uploadOfflineLogs() {
    try {
      this.dbService.getAll('logs').subscribe(async (logs) => {
        if (logs.length === 0) {
          return;
        }

        // Update message for each log first
        logs.forEach((log: any) => {
          log.message = log.message + ' Offline';
        });

        this.PostFrontEndLogErrorBatch(logs).subscribe(async (res: any) => {
          await this.dbService.clear('logs').toPromise();
        },
          async (error) => {
          });

        // logs.forEach((log: any) => {
        //   this.PostLoggerForFrontEnd(log).subscribe(
        //     () => {
        //       // Remove log after successful upload
        //       this.dbService.delete('logs', log.id).subscribe(async () => { });
        //     },
        //     async (error) => { }
        //   );
        // });
      });
    } catch (error: any) {
      this.PostLogger("LoggingService", "uploadOfflineLogs()", error.message);
    }
  }

  PostFrontEndLogErrorBatch(Message: any) {
    return this.http.post(CONSTANTS.API_ENDPOINT + 'Logging/FrontEndLogErrorBatch', Message).pipe(map(res => {
      return res;
    }));
  }

  PostLoggerForFrontEnd(data: any) {
    return this.http
      .post(CONSTANTS.API_ENDPOINT + 'Logging/FrontEndlogError', data)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
}
