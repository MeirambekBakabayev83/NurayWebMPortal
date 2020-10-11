import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { ProductGroups } from 'src/app/models/productGroup';
import { ViewEncapsulation } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
declare var $: any;

@Component({
  selector: 'app-sub-product-groups',
  templateUrl: './sub-product-groups.component.html',
  styleUrls: ['./sub-product-groups.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SubProductGroupsComponent implements OnInit {

  customOptions: OwlOptions = {
    loop: false,    
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    margin:10,    
    navSpeed: 700,
    navText: ['', ''], 
    items: 1,   
    autoWidth: true,        
    nav: false
  }

  productGroupId: number;
  errTxt: string;
  productGroups: any;

  constructor(private activateRoute: ActivatedRoute, private router: Router, private http: HttpClient, private spinner: NgxSpinnerService) { 
    this.productGroupId = this.activateRoute.snapshot.params['productGroupId'];        
  }

  ngOnInit(): void {
    this.getProductGroupList();
  }

  goToHome(){
    this.router.navigate(['']);
  }

  getProductGroupList(){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getSubProductGroupModel?productGroupId=' + this.productGroupId;
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.productGroups=data; 
      //console.log("this.productGroups: " + JSON.stringify(this.productGroups));
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;      
      console.log("this.errTxt: " + JSON.stringify(this.errTxt));
      this.showGritterNotify( "error", "Ошибка при получении списка товаров");
      this.spinner.hide();      
    })    
  }  

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message      
    });
  }  

}
