import { Component, OnInit } from '@angular/core';
import { BuyerVerify } from 'src/app/models/buyer';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { faReply, faSave, faEdit, faAddressBook } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-dedlivery-addresses',
  templateUrl: './dedlivery-addresses.component.html',
  styleUrls: ['./dedlivery-addresses.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DedliveryAddressesComponent implements OnInit {

  buyerVerifyModel: BuyerVerify = new BuyerVerify();  

  faReply = faReply;
  faSave = faSave;
  faEdit = faEdit;
  faAddressBook = faAddressBook;

  constructor(private http: HttpClient, private onlineStoreService: OnlineStoreService, private router: Router, private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {
  }

  goBack(){
    this.router.navigate(["buyerRegistration"]); 
  }

  addDeliveryAddress(){

  }

}
