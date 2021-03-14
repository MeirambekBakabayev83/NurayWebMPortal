import { Component, OnInit, AfterViewInit, NgZone, ElementRef } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import {ActivatedRoute} from '@angular/router';
import { ViewEncapsulation } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { faHome, faBars, faShoppingBasket, faUser, faShoppingCart, faBackspace, faListUl } from '@fortawesome/free-solid-svg-icons';
import { Basket } from 'src/app/models/basket';
import { BuyerVerify } from 'src/app/models/buyer';
import { NgxSpinnerService } from "ngx-spinner";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeftNavMenuComponent } from './components/left-nav-menu/left-nav-menu.component'; 
import { Barcode, BarcodePicker, ScanSettings, configure } from "scandit-sdk";
import { filter, pairwise } from 'rxjs/operators';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],  
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'NurayWebProject';
  isComBack: boolean = false;
  isClearBasket: boolean = false;
  isReturnBasketList: boolean = false;  
  routeName: string = "home";
  warCode: string = "";

  basketModel: Basket = new Basket();  

  faHome = faHome;
  faBars = faBars;
  faShoppingBasket = faShoppingBasket;
  faShoppingCart = faShoppingCart;
  faUser = faUser;
  faBackspace = faBackspace;
  faListUl = faListUl;

  buyerData: any;
  errTxt: string;
  modalRef: any; 

  previousUrl: string;
  currentUrl: string;

  buyerVerifyModel: BuyerVerify = new BuyerVerify();

  constructor(updates:  SwUpdate, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private onlineStoreService: OnlineStoreService, private spinner: NgxSpinnerService, private http: HttpClient, private ngZone: NgZone, private elRef: ElementRef) {    
    updates.available.subscribe((event) => {
      updates.activateUpdate().then(() => document.location.reload());    
    });             

    this.router.events
    .pipe(filter((evt: any) => evt instanceof RoutesRecognized), pairwise())
    .subscribe((events: RoutesRecognized[]) => {
      console.log('previous url', events[0].url);
      console.log('current url', events[1].url);

      this.previousUrl = events[0].url;
      this.currentUrl = events[1].url;
    });
    
  }

  ngOnInit() {       

    this.isClearBasket = false;    

    //this.basketModel = this.onlineStoreService.getBasketModel();      
             
    this.onlineStoreService.isBasketUpd$.subscribe( basketModelFromService => {      
      this.basketModel = basketModelFromService;    
      //console.log("this.basketModel: " + JSON.stringify(this.basketModel));            
    })      

    this.onlineStoreService.isReturnBack$.subscribe(routeName => {
      this.routeName = routeName;      
      console.log("this.routeName: " + this.routeName);
      this.isComBack = true;
    })    

    this.onlineStoreService.isReturnBasketList$.subscribe(returnBasketList => {        
      this.isReturnBasketList = returnBasketList;
    })    

    this.onlineStoreService.isClearBasket$.subscribe(clearBasket => {        
      this.isClearBasket = clearBasket;
    })        

    if ((localStorage.getItem("buyerLogin") != "") && (localStorage.getItem("buyerLogin") != null)){
      this.getUserDatas(localStorage.getItem("buyerLogin"));
    } 
    
    
    //AutoSearch Products
    
    let autoComlUrl = environment.onlineStoreNsiServiceUrl + "getSearchProducts";     
    let return_data = new Array();

    $("#warCode").autocomplete({ 
      minLength: 4,                 
      source: function( request, response ) {
        $.ajax({                 
          url: autoComlUrl,
          type: 'get',          
          contentType: "application/json; charset=utf-8",
          maxHeight: 400,
          width: 600,
          deferRequestBy: 0,
          noCache: false,
          zIndex: 9999,
          dataType: 'json',           
          data: {
            jsonpCallback : "p",
            "productSearchTxt": request.term
          },               
          success: function( data ) {                              
            if (data != null) {     
              
              while(return_data.length > 0) {
                return_data.pop();
              }
              
              for(var i=0; i< data.length; i++){
                return_data.push({
                  'label': data[i].barCode + " - " + data[i].product.productNameRus,
                  'value': data[i].product.productCode,
                  'empObj': data[i]
                })
              }
              //this.goldWarsList = data;
            }                        
            response( return_data );                       
          },                                  
          error: function(x){
            console.log("request.term: " + request.term)
              $.gritter.add({      
                  title: "Уведомление!",                        
                  text: "Обнаружено ошибка при получении данных:" + JSON.stringify(x)
              });
          },          
        });
      },        
      select: function( event, ui ) {
        $.setProductDatas(ui.item);          
      }
    });

    window['angularComponentReference'] = {
      component: this,
      zone: this.ngZone,
      setProductObj: (productObj) => this.setProductObj(productObj)
    };

  }

  ngAfterViewInit(): void {

    this.basketModel = this.onlineStoreService.getBasketModel();      
    //console.log("this.basketModel: " + JSON.stringify(this.basketModel))    

    if ((localStorage.getItem("buyerBasketModel") != null) && (localStorage.getItem("buyerBasketModel") != "") && (localStorage.getItem("buyerBasketModel") != "null")) {
      this.basketModel = JSON.parse(localStorage.getItem("buyerBasketModel"));            
      //this.onlineStoreService.setBasketModel(this.basketModel);
    }     
    
    /*if (this.basketModel == null){
      this.basketModel.productsTotalCount = 0;
      this.basketModel.productsTotalSumm = 0;
      this.basketModel.deliverySumm = 0;
      this.basketModel.deliveryType = 1;
    } */ 

    this.onlineStoreService.setBasketModel(this.basketModel);            
  }

  setProductObj(productObj){
    this.warCode = "";    
    
    this.router.navigate(
      ['/productDetails', productObj.value], 
      {}
    );    

    this.onlineStoreService.goToReturn("home");
  }

  getUserDatas(userLogin){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getBuyerByCode?buyerCode=' + userLogin.toUpperCase();
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.buyerData=data;       
      //console.log("this.buyerData: " + JSON.stringify(this.buyerData));

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
        this.buyerVerifyModel.isEmployees = this.buyerData.isEmployees;   
        this.buyerVerifyModel.isPartners = this.buyerData.isPartners;   
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
    this.isComBack = false;
  }

  goToBack(){
    if (this.routeName == "home"){
      this.isComBack = false;
    }
    else if (this.routeName == "/home"){
      this.isComBack = false;
    }
    else if (this.routeName == ""){
      this.isComBack = false;
    }
    else if (this.routeName == undefined){
      this.isComBack = false;
    }    
    else {
      this.isComBack = true;
    }
    
    this.onlineStoreService.goToClearBasket(false);
    this.onlineStoreService.goToBasketList(false);
    this.router.navigate([this.routeName]);
  }

  goProductCategories() {
    this.router.navigate(["categoriesList"]);
    this.routeName = "Home";        

    this.onlineStoreService.goToReturn(this.routeName);
  }

  goBuyerBasket() {
    this.router.navigate(["buyerBasket"]);

    this.routeName = "Home";        

    this.onlineStoreService.goToReturn(this.routeName);
    //this.onlineStoreService.goToClearBasket(true);
  }

  goBuyerProfile() {
    this.router.navigate(["buyerProfile"]);
  }

  clearOrder(){
    this.onlineStoreService.clearBasketModel();
    this.basketModel = this.onlineStoreService.getBasketModel();
    this.onlineStoreService.goToClearBasket(false);        
  }

  viewListBasket(){
    this.isReturnBasketList = false;
    this.onlineStoreService.goToClearBasket(true);
    this.onlineStoreService.goToSenderBasket(false);
  }

  showMainNav(){
    // open show modal
    this.modalRef = this.modalService.open(LeftNavMenuComponent, { windowClass : "navLeftMenuClass"}); 
    this.modalRef.componentInstance.onRegistrySubject.subscribe(emmitedValue => {                   

        /*setTimeout(()=>{
          this.myTreeGrid.render();
        }, 1000);*/

    })
  }

  public contentScroll(){
    $.contentScroll();
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message   
    });
  }  

}
