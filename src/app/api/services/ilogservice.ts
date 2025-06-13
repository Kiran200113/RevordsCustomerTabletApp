import { Injectable } from '@angular/core';
import { File } from '@awesome-cordova-plugins/file/ngx';

@Injectable({
    providedIn: 'root'
})
export class ILoggerService {
    folderpath = "file:///storage/emulated/0/";

    constructor(private file: File) { }

    // async saveJsonFile(_logdata: any, folder: any) {
    //     const data = {
    //         datetime: new Date().toLocaleString(),
    //         logdata: _logdata
    //     };

    //     const folderName = folder;
    //     const fileName = "CustomerApp_" + this.getSafeFileName(new Date()) + '.json';

    //     this.file.checkDir(this.folderpath, folderName)
    //         .then(() => {
    //             this.appendJson(folderName, fileName, data);
    //         })
    //         .catch(() => {
    //             console.log('Directory does not exist. Creating...');
    //             this.file.createDir(this.folderpath, folderName, false)
    //                 .then(() => {
    //                     this.appendJson(folderName, fileName, data);
    //                 })
    //                 .catch(err => console.error('Error creating directory:', err));
    //         });
    // }

    // Append to JSON File Properly
    // private appendJson(folderName: string, fileName: string, newData: any) {
    //     const filePath = this.folderpath + folderName;

    //     this.file.readAsText(filePath, fileName).then(
    //         (data) => {
    //             // File exists, parse and append
    //             let logs = [];
    //             try {
    //                 logs = JSON.parse(data);
    //             } catch (e) {
    //                 console.error('Error parsing existing JSON, initializing as empty array.');
    //             }

    //             if (!Array.isArray(logs)) {
    //                 logs = [];
    //             }

    //             logs.push(newData);

    //             // Overwrite with updated JSON array
    //             this.file.writeFile(filePath, fileName, JSON.stringify(logs, null, 2), { replace: true })
    //                 .then(() => console.log('Data appended successfully!'))
    //                 .catch(err => console.error('Error writing file:', err));
    //         },
    //         () => {
    //             // File does not exist, create new array and write
    //             const logs = [newData];
    //             this.file.writeFile(filePath, fileName, JSON.stringify(logs, null, 2), { replace: true })
    //                 .then(() => console.log('New file created and data written!'))
    //                 .catch(err => console.error('Error creating file:', err));
    //         }
    //     );
    // }

    // Format date to avoid invalid characters in file name
    // private getSafeFileName(date: Date): string {
    //     const year = date.getFullYear();
    //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
    //     const day = date.getDate().toString().padStart(2, '0');
    //     return `${year}-${month}-${day}`;
    // }

    // Read File and Parse JSON
    // async readJsonFile() {
    //     const folderName = 'Download/Logs/';
    //     const fileName = "CustomerApp_" + this.getSafeFileName(new Date()) + '.json';
    //     const filePath = this.folderpath + folderName;

    //     this.file.readAsText(filePath, fileName).then(
    //         (data) => {
    //             console.log('File data:', data);
    //             try {
    //                 const parsedData = JSON.parse(data);
    //                 console.log('Parsed JSON:', parsedData);
    //             } catch (e) {
    //                 console.error('Error parsing JSON:', e);
    //             }
    //         },
    //         (err) => {
    //             console.error('Error reading file:', err);
    //         }
    //     );
    // }
}