import { Component, OnInit, NgModule } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Injectable } from "@angular/core";
import { CommonModule } from '@angular/common';

import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit{
  seqids: any = [];
  seqidValues: { [key: string]: string } = {};

  constructor(private http: HttpClient, private dataService: DataService) {
    this.seqids.forEach((seqid: string) => {
       this.seqidValues[seqid] = '';
    });
  }

  ngOnInit() {
    this.http.get('http://localhost:5000/api/main/seqids').subscribe((response) => {
      this.seqids = response;
    });
  }

  submitForm() {
    this.dataService.seqidValues = this.seqidValues;
    this.dataService.seqidValuesUpdated.emit(this.seqidValues);
    // console.log(this.seqidValues);
  }
}