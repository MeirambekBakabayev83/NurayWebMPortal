import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute} from '@angular/router';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { ViewEncapsulation } from '@angular/core';
import { BuyerVerify } from 'src/app/models/buyer';
import { DateAdapter } from '@angular/material/core';
import { faSearch, faShare, faReply } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
declare var $: any;

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class CategoriesComponent implements OnInit, AfterViewInit {
  
  userOrders: any;
  userOrderWars: any;
  userOrderStatus: any;
  orderCancelledReasonList: any;
  orderCancelledResult: any;
  buyerVerifyModel: BuyerVerify = new BuyerVerify();    

  errTxt: string;
  searchOrderNumber: string = "";
  searchOrderDate: string = "";
  userOrdersCnt: number = 0;
  userOrderStatusValue: string = "";
  userOrderWarsCnt: number = 0;
  isViewOrderWars: boolean = false;
  isViewOrderCancelled: boolean = true;

  orderTotalSumm: number = 0;
  orderSumm: number = 0;  
  orderDeliverySumm: number = 0;
  orderId: number = 0;  
  orderCode1C: string = "";

  orderCancelledReasonId: number = 0;

  faSearch = faSearch;
  faShare = faShare;
  faReply = faReply;
  //selectedDate = new FormControl(moment());

  constructor(private activateRoute: ActivatedRoute, private router: Router, private http: HttpClient, private spinner: NgxSpinnerService, private onlineStoreService: OnlineStoreService, private dateAdapter: DateAdapter<Date>) { 
    this.dateAdapter.setLocale('ru-RU');    
  }

  ngOnInit(): void {
    this.buyerVerifyModel = this.onlineStoreService.getBuyerVerifyModel();                    
    this.getUserOrdersList();
  }

  ngAfterViewInit() {
    //this.barcodeScanner.start();
  }
  


  getUserOrdersList(){
    this.spinner.show();

    let varEmail = this.buyerVerifyModel.eMail;

    if ((varEmail == "") || (varEmail == null) || (varEmail == undefined)){    
      this.showGritterNotify( "error", "Необходимо пройти процедуру авторизации покупателя в профиле пользователя. Без авторизации оформление заказа невозможно!");
      this.spinner.hide();
      return;
    }

    let userOrdersListUrl = environment.onlineStoreOrderServiceUrl + 'getUserOrdersForPage?userEMail=' + this.buyerVerifyModel.eMail;
    this.http.get(userOrdersListUrl).subscribe((data:any) => 
    {
      this.userOrders=data;   
      this.userOrdersCnt = this.userOrders.length;
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении списка заказов пользователя по коду: " + this.buyerVerifyModel.eMail);
      this.spinner.hide();      
    })    
  }  

  getSearxhUserOrdersList(){
    this.spinner.show();
    let searchOrderDate = null;        

    if (this.searchOrderDate == ""){     
      let searchDate = new Date("2000-01-01T00:00:00") ;
      searchOrderDate = moment(searchDate).format('DD.MM.YYYY');
    }
    else {
      searchOrderDate = moment(this.searchOrderDate).format('DD.MM.YYYY');
    }    
    
    let userOrdersListUrl = environment.onlineStoreOrderServiceUrl + 'getSearchUserOrdersForPage?userEMail=' + this.buyerVerifyModel.eMail + '&orderNumber=' + this.searchOrderNumber + '&orderDate=' + searchOrderDate;
    this.http.get(userOrdersListUrl).subscribe((data:any) => 
    {
      this.userOrders=data;             
      this.userOrdersCnt = this.userOrders.length;
      this.searchOrderNumber = "";
      this.searchOrderDate = "";
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при поиске заказов пользователя.");
      console.log("search error: " + JSON.stringify(error));
      this.spinner.hide();      
    })    
  }
  
  getUserOrderWarsList(orderId){
    this.spinner.show();
    let userOrdersListUrl = environment.onlineStoreOrderServiceUrl + 'getOrderWars?orderId=' + orderId;
    this.http.get(userOrdersListUrl).subscribe((data:any) => 
    {
      this.userOrderWars=data;   
      this.userOrderWarsCnt = this.userOrderWars.length;
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении списка товаров заказа по идентификатору: " + orderId);
      this.spinner.hide();      
    })    
  }    

  getUserOrderStatus(orderId){
    this.spinner.show();
    let userOrdersListUrl = environment.onlineStoreOrderServiceUrl + 'getOrderStatus?orderId=' + orderId;
    this.http.get(userOrdersListUrl).subscribe((data:any) => 
    {
      this.userOrderStatus=data;   
      this.userOrderStatusValue = this.userOrderStatus[0].orderStatusEntity.orderStatusRusName;

      console.log("orderStatusCode" + this.userOrderStatus[0].orderStatusEntity.orderStatusCode);

      switch ( this.userOrderStatus[0].orderStatusEntity.orderStatusCode ) {
        case "order_deleted":
          this.isViewOrderCancelled = false;
          break;
        case "order_cancelled_buyer":
          this.isViewOrderCancelled = false;
          break;
        case "order_delivered":
          this.isViewOrderCancelled = false;
          break;
        case "order_closed":
          this.isViewOrderCancelled = false;
          break;
        case "order_issued":
          this.isViewOrderCancelled = false;
          break;
        case "order_cancelled_user":
          this.isViewOrderCancelled = false;
          break;                                                  
        default: 
        this.isViewOrderCancelled = true;
        break;
      }

      console.log("this.isViewOrderCancelled" + this.isViewOrderCancelled);

      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении статуса заказа по идентификатору: " + orderId);
      this.spinner.hide();      
    })    
  }      

  getOrderCancelledReasonList(){
    this.spinner.show();
    let userOrdersListUrl = environment.onlineStoreNsiServiceUrl + 'getOCRList';
    this.http.get(userOrdersListUrl).subscribe((data:any) => 
    {
      this.orderCancelledReasonList=data;   

      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении списка причин отмены заказа.");
      this.spinner.hide();      
    })    
  }        

  cancelledOrder(){
    if ((this.orderCancelledReasonId == null) || (this.orderCancelledReasonId == 0)){
      this.showGritterNotify( "ERROR", "Необходимо выбрать причину отмены заказа из списка.");
      return;
    }    

    this.spinner.show();  
    let orderCancelledUrl = environment.onlineStoreOrderServiceUrl + 'orderCancelled'; 

    this.http.post<any>(orderCancelledUrl, 
      {         
        orderCode1C: this.orderCode1C,
        ocrId: this.orderCancelledReasonId,
        orderStatusCode: "order_cancelled_buyer"
      }
    ).subscribe((data:any) => { 
      this.orderCancelledResult = data; 
      if ((this.orderCancelledResult.errCode == 0) || (this.orderCancelledResult.errCode == "0")) {                          
        this.showGritterNotify( "ERROR", "Отмена заказа завершено успешно. Будем рады увидеть Вас снова!");                                                    
        this.isViewOrderCancelled = false;        
        this.spinner.hide();   
      }
      else {
        this.showGritterNotify( "ERROR", "Ошибка при отмене заказа! Текст ошибки: " + this.orderCancelledResult.errMsg);                                                    
        this.spinner.hide();
      }
                              
    }, 
    error => {
      this.errTxt=error;                                                                         
      this.showGritterNotify( "error", "Ошибка при отмене заказа! Текст ошибки: " + JSON.stringify(this.errTxt));  
      this.spinner.hide();                                                
    }); 

  }

  searchOrder(){
    if ((this.searchOrderNumber == "") && (this.searchOrderDate == "")){
      this.showGritterNotify( "ERROR", "Необходимо заполнить критерий поиска! Пожалуйста заполните номер заказа и/либо дату заказа.");
      return;
    }

    this.getSearxhUserOrdersList();
  }

  goToOrderDetails(order){    
    this.isViewOrderWars = true;
    this.orderCode1C = order.orderCode1c;
    this.orderSumm = order.productsSumm
    this.orderDeliverySumm = order.deliverySumm
    this.orderTotalSumm = order.orderTotalSumm
    this.getUserOrderWarsList(order.orderId);
    this.getUserOrderStatus(order.orderId);
    this.getOrderCancelledReasonList();
    this.orderId = order.orderId;
    console.log("isViewOrderCancelled: " + this.isViewOrderCancelled);
  }

  goToOrderList(){    
    this.isViewOrderWars = false;
    this.orderSumm = 0;
    this.orderDeliverySumm = 0;
    this.orderTotalSumm = 0;    
  }

  goToProductDetails(productCode){
    this.router.navigate(
      ['/productDetails', productCode], 
      {}
    );

    this.onlineStoreService.goToReturn("categoriesList");
  }    

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message      
    });
  }  

}
