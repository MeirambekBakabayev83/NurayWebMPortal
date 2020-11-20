import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Basket } from 'src/app/models/basket';
import { BuyerVerify } from 'src/app/models/buyer';
import { Subject } from 'rxjs';
import { MatRadioChange } from '@angular/material/radio';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { ViewEncapsulation } from '@angular/core';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { faPlus, faMinus, faHome } from '@fortawesome/free-solid-svg-icons';
declare var $: any;

@Component({
  selector: 'app-buyer-basket',
  templateUrl: './buyer-basket.component.html',
  styleUrls: ['./buyer-basket.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BuyerBasketComponent implements OnInit {

  faPlus = faPlus;
  faMinus = faMinus;
  faHome = faHome;

  basketModel: Basket = new Basket();
  buyerVerifyModel: BuyerVerify = new BuyerVerify();
  isSendOrder: boolean = false;
  isSlectedDeliveryAddress: boolean = false;
  methodDelvery: number;
  deliveryAddressId: number;
  userDeliveryAddressList: any;
  selectedDeliveryAddress: any;
  errTxt: string;
  buyerOrderData: any;
  udaID: number;

  constructor(private activateRoute: ActivatedRoute, private router: Router, private http: HttpClient, private spinner: NgxSpinnerService, private onlineStoreService: OnlineStoreService) { }

  ngOnInit(): void {    
    this.basketModel = this.onlineStoreService.getBasketModel();    
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

    this.basketModel = this.onlineStoreService.getBasketModel();
  }

  addBasketThisProduct(item: any) {
    if (item.isWeight == 0){
      item.productCount = item.productCount + 1;
    } 
    else{
      item.productCount = item.productCount + 0.1;
    }

    this.onlineStoreService.addCorrectItemBasketModel(item);          

    this.basketModel = this.onlineStoreService.getBasketModel();

    console.log("this.basketModel: " + JSON.stringify(this.basketModel))

  }

  basketClose(item: any){
    this.onlineStoreService.delItemBasketModel(item);
  }

  sendOrder(){

    if (this.basketModel.basketProducts.length == 0){
      this.showGritterNotify( "error", "Корзина пустая. Необходимо выбрать товары для оформления заказа. ");  
      return;
    }  

    this.isSendOrder = true;
    this.buyerVerifyModel = this.onlineStoreService.getBuyerVerifyModel();
    this.basketModel.buyerModel = this.buyerVerifyModel;
    this.onlineStoreService.setBasketModel(this.basketModel);
    this.getUserDeliveryAddresses();
  }

  finishSendOrder(){
    this.spinner.show();  
    
    this.basketModel.deliveryType = this.methodDelvery;
    this.basketModel.kindPriseCode = "retail";

    if (this.methodDelvery == 1) {
      this.basketModel.deliverySumm = 0;
      this.basketModel.totalSumm = this.basketModel.productsTotalSumm;
      this.basketModel.deliveryFullAddress = "";
      this.basketModel.deliveryAddressId = 0;
      this.basketModel.deliveryType = this.methodDelvery;
    }
    else if (this.methodDelvery == 2) {
      this.basketModel.deliverySumm = 500;
      this.basketModel.totalSumm = this.basketModel.productsTotalSumm + this.basketModel.deliverySumm;
      this.basketModel.deliveryFullAddress = this.selectedDeliveryAddress.rusFullAddress;
      this.basketModel.deliveryAddressId = this.udaID;
      this.basketModel.deliveryType = this.methodDelvery;
    }

    let saveBuyerOrderUrl = environment.onlineStoreOrderServiceUrl + 'saveBuyerOrder'; 
    this.http.post<any>(saveBuyerOrderUrl, this.basketModel
    ).subscribe((data:any) => { 
      this.buyerOrderData = data; 
      if ((this.buyerOrderData.errCode != null) && (this.buyerOrderData.errCode == 0)){        
        this.spinner.hide();
        this.showGritterNotify( "ERROR", "Ваш заказ сохранен успешно! В самое ближайшее время наши сотрудники службы онлайн доставки свяжутся с Вами. Спасибо за покупку!");                                                    
      }
      else {
        this.showGritterNotify( "ERROR", "Ошибка при сохранении заказа!");                                                    
        this.spinner.hide();
      }
                              
    }, 
    error => {
      this.errTxt=error;                                                                         
      this.showGritterNotify( "error", "Ошибка при сохранении заказа! Текст ошибки: " + JSON.stringify(this.errTxt));  
      this.spinner.hide();                                                
    });
  }

  clearOrder(){
    this.onlineStoreService.clearBasketModel();
    this.basketModel = this.onlineStoreService.getBasketModel();
  }

  viewListBasket(){
    this.isSendOrder = false;
  }

  goToProductDetails(productCode){
    this.router.navigate(
      ['/productDetails', productCode], 
      {}
    );

    this.onlineStoreService.goToReturn("buyerBasket");
  }  

  getFullDeliveryAddress(address){
    this.basketModel.deliverySumm = 500;
    this.udaID = address;

    let buterDataUrl = environment.onlineStoreNsiServiceUrl + 'getUDAById?udaId=' + this.udaID;
    this.http.get(buterDataUrl).subscribe((data:any) => 
    {
      this.selectedDeliveryAddress=data;   
      this.isSlectedDeliveryAddress = true;          

      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;      
      console.log("this.errTxt: " + JSON.stringify(this.errTxt));
      this.showGritterNotify( "error", "Ошибка при получении данных адреса доставки пользователя");
      this.spinner.hide();      
    }) 

  }

  getUserDeliveryAddresses(){ 
    this.spinner.show(); 
    let varEmail = this.basketModel.buyerModel.eMail;

    if ((varEmail == "") || (varEmail == null) || (varEmail == undefined)){    
      this.showGritterNotify( "error", "Пожалуйста, заполните электронную почту.");
      this.spinner.hide();
      return;
    }

    let buterDataUrl = environment.onlineStoreNsiServiceUrl + 'getUserDeliveryAddresses?userLogin=' + varEmail.toUpperCase();
    this.http.get(buterDataUrl).subscribe((data:any) => 
    {
      this.userDeliveryAddressList=data;             

      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;      
      console.log("this.errTxt: " + JSON.stringify(this.errTxt));
      this.showGritterNotify( "error", "Ошибка при получении списка адресов доставки пользователя");
      this.spinner.hide();      
    })    

  }  

  radioChange(event: MatRadioChange) {
    this.basketModel.deliverySumm = 0;    
    this.deliveryAddressId = 0;
    this.isSlectedDeliveryAddress = false;
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message   
    });
  }  

}
