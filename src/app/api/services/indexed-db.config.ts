import { DBConfig } from 'ngx-indexed-db';

export const dbConfig: DBConfig = {
  name: 'AppLogsDB',
  version: 1,
  objectStoresMeta: [
    {
      store: 'logs',
      storeConfig: { keyPath: 'id', autoIncrement: true },
      storeSchema: [
        { name: 'deviceType', keypath: 'deviceType', options: { unique: false } },
        { name: 'message', keypath: 'message', options: { unique: false } },
        { name: 'timestamp', keypath: 'timestamp', options: { unique: false } },
      ],
    },
  ],
};