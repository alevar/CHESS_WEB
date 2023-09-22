import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  seqidValues: { [key: string]: string } = {};
  seqidValuesUpdated = new EventEmitter<{ [key: string]: string }>();
  constructor() { }
}