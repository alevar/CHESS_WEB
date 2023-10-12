import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  settings: { [key: string]: string } = {};
  settingsUpdated = new EventEmitter<{ [key: string]: string }>();
  constructor() { }
}

// We need two data storages
// one is loaded at the app launch and stores all global values such as sequences, tissues, etc

// the other one stores all user requested settings