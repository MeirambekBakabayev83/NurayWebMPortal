import { Component, OnInit, AfterViewInit } from '@angular/core';
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
export class BuyerBasketComponent implements OnInit, AfterViewInit {

  faPlus = faPlus;
  faMinus = faMinus;
  faHome = faHome;

  basketModel: Basket = new Basket();
  buyerVerifyModel: BuyerVerify = new BuyerVerify();
  isSendOrder: boolean = false;
  isSlectedDeliveryAddress: boolean = false;
  isSlectedDwhAddress: boolean = false;
  methodDelvery: number = 0;
  deliveryAddressId: number = 0;
  userDeliveryAddressList: any;
  selectedDeliveryAddress: any;
  dwhAddress: any;
  errTxt: string;
  buyerOrderData: any;
  udaID: number = 0;

  constructor(private activateRoute: ActivatedRoute, private router: Router, private http: HttpClient, private spinner: NgxSpinnerService, private onlineStoreService: OnlineStoreService) { }

  ngOnInit(): void {    

    /*if (localStorage.getItem("buyerBasketModel") != ""){
      this.basketModel = JSON.parse(localStorage.getItem("buyerBasketModel"));      
    }     
    else {
      this.basketModel = this.onlineStoreService.getBasketModel();        
    }    */

    this.basketModel = this.onlineStoreService.getBasketModel();        

  }

  ngAfterViewInit(): void{        

    this.basketModel = this.onlineStoreService.getBasketModel();        
    //console.log("this.basketModel: " + JSON.stringify(this.basketModel))    

    if ((localStorage.getItem("buyerBasketModel") != null) && (localStorage.getItem("buyerBasketModel") != "") && (localStorage.getItem("buyerBasketModel") != "null")) {
      this.basketModel = JSON.parse(localStorage.getItem("buyerBasketModel"));            
      console.log("this.basketModel123: " + JSON.stringify(this.basketModel))  
      this.onlineStoreService.setBasketModel(this.basketModel);
    }               

    if (this.basketModel?.basketProducts){      
      if (this.basketModel.basketProducts.length == 0){        
        this.onlineStoreService.goToClearBasket(false);        
      }            
      else {        
        this.onlineStoreService.goToClearBasket(true);        
      }
    }
    else {      
      this.onlineStoreService.goToClearBasket(false);
    }

    this.onlineStoreService.isSendOrder$.subscribe(senderOrder => {        
      this.isSendOrder = senderOrder;
    })    
    
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

    //console.log("this.basketModel: " + JSON.stringify(this.basketModel))

  }

  basketClose(item: any){
    this.onlineStoreService.delItemBasketModel(item);
  }

  sendOrder(){
    
    if (!this.basketModel?.basketProducts){
      this.showGritterNotify( "error", "Корзина пустая. Необходимо выбрать товары для оформления заказа. ");  
      return;
    }  

    if (this.basketModel?.basketProducts.length == 0){
      this.showGritterNotify( "error", "Корзина пустая. Необходимо выбрать товары для оформления заказа. ");  
      return;
    }  

    this.isSendOrder = true;
    this.buyerVerifyModel = this.onlineStoreService.getBuyerVerifyModel();
    this.basketModel.buyerModel = this.buyerVerifyModel;
    this.onlineStoreService.setBasketModel(this.basketModel);
    this.onlineStoreService.goToClearBasket(false);
    this.onlineStoreService.goToBasketList(true);
    this.getUserDeliveryAddresses();
    this.getFullDwhAddress("00-000001");
  }

  finishSendOrder(){

    if (this.methodDelvery == 0){
      this.showGritterNotify( "error", "Необходимо выбрать метод получения заказа (Самовывоз или доставка). ");  
      return;
    }      

    if (this.methodDelvery == 2){
      if (this.udaID == 0){
        this.showGritterNotify( "error", "Адрес доставки не выбран. Если у Вас пустой список адресов доставки, то предварительно необходимо составить их в порфиле пользователя.");  
        return;
      }
    }

    let varEmail = this.basketModel.buyerModel.eMail;

    if ((varEmail == "") || (varEmail == null) || (varEmail == undefined)){    
      this.showGritterNotify( "error", "Необходимо пройти процедуру авторизации покупателя в профиле пользователя. Без авторизации оформление заказа невозможно!");
      this.spinner.hide();
      return;
    }

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
      console.log("this.basketModel: " + JSON.stringify(this.basketModel));
      console.log("this.buyerOrderData: " + JSON.stringify(this.buyerOrderData));
      if ((this.buyerOrderData.errCode != null) && (this.buyerOrderData.errCode == 0)){        
        this.spinner.hide();
        this.onlineStoreService.clearBasketModel();
        this.showGritterNotify( "ERROR", "Ваш заказ сохранен успешно! В самое ближайшее время наши сотрудники службы онлайн доставки свяжутся с Вами. Спасибо за покупку!"); 
        this.router.navigate(["home"]);                                                   
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
    this.onlineStoreService.goToClearBasket(true);
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
      this.isSlectedDwhAddress = false;

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

  getFullDwhAddress(dwhCode){
    this.basketModel.deliverySumm = 500;    

    let buterDataUrl = environment.onlineStoreNsiServiceUrl + 'getDwhDatasByCode?dwhCode=' + dwhCode;
    this.http.get(buterDataUrl).subscribe((data:any) => 
    {
      this.dwhAddress=data;   
      //this.isSlectedDeliveryAddress = false;          
      //this.isSlectedDwhAddress = true;      

      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;      
      console.log("this.errTxt: " + JSON.stringify(this.errTxt));
      this.showGritterNotify( "error", "Ошибка при получении данных адреса магазина");
      this.spinner.hide();      
    }) 

  }  

  getUserDeliveryAddresses(){ 
    this.spinner.show(); 
    let varEmail = this.basketModel.buyerModel.eMail;

    if ((varEmail == "") || (varEmail == null) || (varEmail == undefined)){    
      this.showGritterNotify( "error", "Необходимо пройти процедуру авторизации покупателя в профиле пользователя. Без авторизации оформление заказа невозможно!");
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

    if (this.methodDelvery != 1) {              
      this.isSlectedDwhAddress = true;      
    }
    else {
      this.isSlectedDwhAddress = false;      
    }
    
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message   
    });
  }  

}
