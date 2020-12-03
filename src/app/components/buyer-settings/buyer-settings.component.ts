import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-buyer-settings',
  templateUrl: './buyer-settings.component.html',
  styleUrls: ['./buyer-settings.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BuyerSettingsComponent implements OnInit {

  buyerCode: string = "";

  constructor(private router: Router, private spinner: NgxSpinnerService, private http: HttpClient, private onlineStoreService: OnlineStoreService) { }

  ngOnInit(): void {
  }

}
