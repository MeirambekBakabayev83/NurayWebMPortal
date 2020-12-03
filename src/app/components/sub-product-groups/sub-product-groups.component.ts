import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { ViewEncapsulation } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { faPlus, faMinus, faHome } from '@fortawesome/free-solid-svg-icons';
import { Basket } from 'src/app/models/basket';
import { BuyerVerify } from 'src/app/models/buyer';
declare var $: any;

@Component({
  selector: 'app-sub-product-groups',
  templateUrl: './sub-product-groups.component.html',
  styleUrls: ['./sub-product-groups.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SubProductGroupsComponent implements OnInit, AfterViewInit {

  faPlus = faPlus;
  faMinus = faMinus;
  faHome = faHome;

  customOptions: OwlOptions = {
    loop: false,    
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    margin:5,    
    navSpeed: 700,
    navText: ['', ''], 
    items: 2,   
    autoWidth: true,        
    nav: false
  }

  productGroupId: number;
  selectedProductGroupId: number;
  errTxt: string;
  productGroups: any;
  subGroupProducts: any;
  basketModel: Basket;
  buyerVerifyModel: BuyerVerify = new BuyerVerify();

  constructor(private activateRoute: ActivatedRoute, private router: Router, private http: HttpClient, private spinner: NgxSpinnerService, private onlineStoreService: OnlineStoreService) { 
    this.productGroupId = this.activateRoute.snapshot.params['productGroupId'];        
  }

  ngOnInit(): void {

    this.onlineStoreService.goToReturn("home");

    /*this.onlineStoreService.isBuyerVerify$.subscribe(buyerData => {
      this.buyerVerifyModel = buyerData;                  
    })    */

    this.buyerVerifyModel = this.onlineStoreService.getBuyerVerifyModel();

  }  

  ngAfterViewInit(): void{
    this.getProductGroupList();
  }

  goToHome(){
    this.router.navigate(['']);
  }

  addBasket(item: any){
    this.onlineStoreService.fillBasketModel(item);          
    item.viewBasket =true;    
    console.log(JSON.stringify(item))
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

  getProductGroupList(){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getSubProductGroupModel?productGroupId=' + this.productGroupId;
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.productGroups=data;       
      if (localStorage.getItem("selectedProductGroupId")){
        this.selectedProductGroupId = parseInt(localStorage.getItem("selectedProductGroupId"));
        this.subGroupProducts = this.productGroups.find(x => x.productGroupId == this.selectedProductGroupId).products;    
      }    
      else {
        this.subGroupProducts = this.productGroups[0].products;     
        this.selectedProductGroupId = this.productGroups[0].productGroupId;
      }        
  
      this.basketModel = this.onlineStoreService.getBasketModel();
      

      if (this.basketModel?.basketProducts){
        for (let i = 0; i < this.productGroups.length; i ++){
          for (let j = 0; j < this.productGroups[i].products.length; j ++){
            if (this.basketModel.basketProducts.filter(x => x.productId == this.productGroups[i].products[j].productId).length > 0){
              
              this.productGroups[i].products[j].viewBasket = true; 
              this.productGroups[i].products[j].productCount = this.basketModel.basketProducts.filter(x => x.productId == this.productGroups[i].products[j].productId)[0].productCount;
              
            }                  
          }
        }
      }

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

  getListSubProducts(productGroupID){
    //alert(productGroupID);
    this.subGroupProducts = this.productGroups.find(x => x.productGroupId == productGroupID).products;
    this.selectedProductGroupId = productGroupID;
    localStorage.setItem("selectedProductGroupId", productGroupID);

    console.log("this.selectedProductGroupId: " + this.selectedProductGroupId) ;
  }

  goToProductDetails(productCode){
    this.router.navigate(
      ['/productDetails', productCode], 
      {}
    );

    this.onlineStoreService.goToReturn("subProducts/" + this.productGroupId);
  }  

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message      
    });
  }  

}
