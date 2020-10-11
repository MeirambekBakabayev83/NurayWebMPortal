import { Component, OnInit } from '@angular/core';
import { Router} from '@angular/router';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Subject } from 'rxjs';
import { ViewEncapsulation } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from "ngx-spinner";
import { ProductGroups } from 'src/app/models/productGroup';
import { Basket } from 'src/app/models/basket';
import { environment } from 'src/environments/environment';
import { MatCarousel, MatCarouselComponent } from '@ngmodule/material-carousel';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { faPlus, faMinus, faHome } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],  
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  customOptions: OwlOptions = {
    loop: false,    
    stagePadding: 10,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    margin:10, 
    items: 1,   
    autoWidth: true,        
    nav: false,    
  }


  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};  
  dtTrigger: Subject<any> = new Subject();

  productGroups: ProductGroups[] = [];
  basketModel: Basket;

  errTxt: string;

  faPlus = faPlus;
  faMinus = faMinus;
  faHome = faHome;

  constructor(private onlineStoreService: OnlineStoreService, private http: HttpClient, private spinner: NgxSpinnerService, private router: Router) { }

  ngOnInit(): void {
    this.getProductGroupList();
  }

  getProductGroupList(){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getProductGroupModel';
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

  installDesktopApp(){
    alert("SOON!!!");
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

  goToSubProducts(productGroupId){
    this.router.navigate(
      ['/subProducts', productGroupId], 
      {}
    );
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message      
    });
  }  

}
