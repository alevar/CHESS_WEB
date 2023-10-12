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
  setting_names: any = [];
  settings: { [key: string]: string } = {};
  settingsControl = new FormControl();

  constructor(private http: HttpClient, private dataService: DataService) {
    this.setting_names.forEach((seqid: string) => {
       this.settings[seqid] = '';
    });
  }

  ngOnInit() {
    this.http.get('http://localhost:5000/api/main/seqids').subscribe((response) => {
      this.setting_names = response;
    });
  }

  submitForm() {
    this.dataService.settings = this.settings;
    this.dataService.settingsUpdated.emit(this.settings);
    // console.log(this.seqidValues);
  }
}