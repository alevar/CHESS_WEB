import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/data/data.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  data: any = {};

  constructor(private http: HttpClient, private dataService: DataService) {
    this.dataService.seqidValuesUpdated.subscribe((seqidValues) => {
      this.http.post('http://localhost:5000/api/main/getAttrCountsBySeqid', this.dataService.seqidValues).subscribe((response) => {
        this.data = response;
      });
    });
  }
}