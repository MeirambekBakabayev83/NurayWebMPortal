import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { ProductGroups } from 'src/app/models/productGroup';
import { ViewEncapsulation } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { faPlus, faMinus, faHome } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDetailsComponent implements OnInit {

  faPlus = faPlus;
  faMinus = faMinus;
  faHome = faHome;

  productCode: string;
  selectedProductData: any;
  errTxt: string;

  constructor(private activateRoute: ActivatedRoute, private router: Router, private http: HttpClient, private spinner: NgxSpinnerService, private onlineStoreService: OnlineStoreService) {
    this.productCode = this.activateRoute.snapshot.params['productCode'];        
    this.getProductGroupList();
  }

  ngOnInit(): void {
    
  }

  getProductGroupList(){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getProductCommonModel?productCode=' + this.productCode;
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.selectedProductData=data; 
      //console.log("this.productGroups: " + JSON.stringify(this.productGroups));
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении данных товара по коду: " + this.productCode);
      this.spinner.hide();      
    })    
  }

  addBasket(item: any){
    this.onlineStoreService.fillBasketModel(item);          
    item.viewBasket =true;    
  }

  addBasketThisProduct(item: any) {
    if (item.isWeight == 0){
      item.productCount = item.productCount + 1;
    } 
    else{
      item.productCount = item.productCount + 0.1;
    }

    this.onlineStoreService.addCorrectItemBasketModel(item);          
  }

  delBasketThisProduct(item: any) {                  
    
    let minusProductCount: number;

    if (item.isWeight == 0){      
      minusProductCount = 1;
    }
    else {      
      minusProductCount = 0.1;
    }

    this.onlineStoreService.delCorrectItemBasketModel(item, minusProductCount);    
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message      
    });
  }  

}
