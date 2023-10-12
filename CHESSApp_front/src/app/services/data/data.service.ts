import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
<<<<<<< HEAD
  settings: { [key: string]: string } = {};
  settingsUpdated = new EventEmitter<{ [key: string]: string }>();
  constructor() { }
}

// We need two data storages
// one is loaded at the app launch and stores all global values such as sequences, tissues, etc

// the other one stores all user requested settings
=======
  seqidValues: { [key: string]: string } = {};
  seqidValuesUpdated = new EventEmitter<{ [key: string]: string }>();
  constructor() { }
}
>>>>>>> 1225b3da46b40bfdaf1e29b771d93d9e782770c0
