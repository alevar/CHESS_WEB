import { Component, OnInit, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Injectable } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormControl } from '@angular/forms';

import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit{
<<<<<<< HEAD
  setting_names: any = [];
  settings: { [key: string]: string } = {};
  settingsControl = new FormControl();

  constructor(private http: HttpClient, private dataService: DataService) {
    this.setting_names.forEach((seqid: string) => {
       this.settings[seqid] = '';
=======
  seqids: any = [];
  seqidValues: { [key: string]: string } = {};
  seqidControl = new FormControl(); // Define the seqidControl property

  constructor(private http: HttpClient, private dataService: DataService) {
    this.seqids.forEach((seqid: string) => {
       this.seqidValues[seqid] = '';
>>>>>>> 1225b3da46b40bfdaf1e29b771d93d9e782770c0
    });
  }

  ngOnInit() {
    this.http.get('http://localhost:5000/api/main/seqids').subscribe((response) => {
<<<<<<< HEAD
      this.setting_names = response;
=======
      this.seqids = response;
>>>>>>> 1225b3da46b40bfdaf1e29b771d93d9e782770c0
    });
  }

  submitForm() {
<<<<<<< HEAD
    this.dataService.settings = this.settings;
    this.dataService.settingsUpdated.emit(this.settings);
=======
    this.dataService.seqidValues = this.seqidValues;
    this.dataService.seqidValuesUpdated.emit(this.seqidValues);
>>>>>>> 1225b3da46b40bfdaf1e29b771d93d9e782770c0
    // console.log(this.seqidValues);
  }
}