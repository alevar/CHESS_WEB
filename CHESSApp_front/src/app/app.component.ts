/// Encapsulates the entire user interface of the application.
/// Defines logic and behavior for the application at the top level.
/// Use lifecycle hooks (OnInit, OnDestroy, etc.) to perform logic on the entire application.
/// First component to be loaded by the application.
/// Can communicate with other components by passing data through the @Input() and @Output() decorators.

import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Injectable } from "@angular/core";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  data: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get('http://localhost:5000/api/main/seqids').subscribe((response) => {
      this.data = response;
    });
  }
}