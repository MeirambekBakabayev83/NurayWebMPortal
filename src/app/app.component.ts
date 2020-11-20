import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { faHome, faBars, faShoppingBasket, faUser, faShoppingCart, faBackspace } from '@fortawesome/free-solid-svg-icons';
import { Basket } from 'src/app/models/basket';
import { BuyerVerify } from 'src/app/models/buyer';
import { NgxSpinnerService } from "ngx-spinner";
import {HttpClient, HttpHeaders} from '@angular/common/http';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],  
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'NurayWebProject';
  isComBack: boolean = false;
  routeName: string = "home";

  basketModel: Basket = new Basket();

  faHome = faHome;
  faBars = faBars;
  faShoppingBasket = faShoppingBasket;
  faShoppingCart = faShoppingCart;
  faUser = faUser;
  faBackspace = faBackspace;

  buyerData: any;
  errTxt: string;

  buyerVerifyModel: BuyerVerify = new BuyerVerify();

  constructor(updates:  SwUpdate, private router: Router, private onlineStoreService: OnlineStoreService, private spinner: NgxSpinnerService, private http: HttpClient) {    
    updates.available.subscribe((event) => {
      updates.activateUpdate().then(() => document.location.reload());    
    });        
  }

  ngOnInit() {    
             
    this.onlineStoreService.isBasketUpd$.subscribe( basketModelFromService => {      
      this.basketModel = basketModelFromService;    
      console.log("this.basketModel: " + JSON.stringify(this.basketModel));            
    })            

    this.onlineStoreService.isReturnBack$.subscribe(routeName => {
      this.routeName = routeName;      
      this.isComBack = true;
    })    

    if (localStorage.getItem("buyerLogin")){
      this.getUserDatas(localStorage.getItem("buyerLogin"));
    }

  }

  getUserDatas(userLogin){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getBuyerByCode?buyerCode=' + userLogin.toUpperCase();
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.buyerData=data;       

      if ((this.buyerData) && (this.buyerData.userId) && (this.buyerData.userId != null) && (this.buyerData.userId != 0)){

        this.buyerVerifyModel.eMail = this.buyerData.userLogin;
        this.buyerVerifyModel.verifyCode = 0;        
        this.buyerVerifyModel.pinCode = Number(this.buyerData.userPsw);        
        this.buyerVerifyModel.firstName = this.buyerData.firstName;
        this.buyerVerifyModel.name = this.buyerData.name;
        this.buyerVerifyModel.lastName = this.buyerData.lastName;
        this.buyerVerifyModel.sex = this.buyerData.userSex;
        this.buyerVerifyModel.birthDate = this.buyerData.birthDate;
        for (let i = 0; i < this.buyerData.userContacts.length; i ++){
          if (this.buyerData.userContacts[i].contact_types.contactTypeCode == "mphone") {
            this.buyerVerifyModel.contactPhone = this.buyerData.userContacts[i].contactValue;
          }          
        }        
        this.buyerVerifyModel.buyerCode = this.buyerData.userCode;                      
        this.onlineStoreService.setBuyerVerify(this.buyerVerifyModel);                          
      }

      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;      
      console.log("this.errTxt: " + JSON.stringify(this.errTxt));
      this.showGritterNotify( "error", "Ошибка при получении данных пользователя");
      this.spinner.hide();      
    })    
  }
  
  goHome() {
    this.router.navigate(["home"]);
  }

  goToBack(){
    if (this.routeName == "home"){
      this.isComBack = false;
    }
    else {
      this.isComBack = true;
    }
    
    this.router.navigate([this.routeName]);
  }

  goProductCategories() {
    this.router.navigate(["categoriesList"]);
  }

  goBuyerBasket() {
    this.router.navigate(["buyerBasket"]);

    this.routeName = "Home";    

    this.routeName = this.router.url;

    this.onlineStoreService.goToReturn(this.routeName);
  }

  goBuyerProfile() {
    this.router.navigate(["buyerProfile"]);
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message   
    });
  }  

}
