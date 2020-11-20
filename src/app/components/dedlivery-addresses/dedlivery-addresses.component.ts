import { Component, OnInit } from '@angular/core';
import { BuyerVerify } from 'src/app/models/buyer';
import { KatoList } from 'src/app/models/katoModel';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { faReply, faSave, faEdit, faAddressBook, faMinus } from '@fortawesome/free-solid-svg-icons';
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
  faMinus = faMinus;
  faAddressBook = faAddressBook;

  userDeliveryAddresses: any;
  userUDA: any;

  permissionsKatoObjects: KatoList[] = [];
  permissionsDistrictList: KatoList[] = [];
  permissionsAreaList: KatoList[] = [];
  permissionsPlaceList: KatoList[] = [];
  deliveryRegionId: number;  
  deliveryDistrictId: number = 0;
  deliveryAreaId: number = 0;
  deliveryPlaceId: number = 0;
  udaId: number = 0;
  deliveryStreet: string = "";
  deliveryHouseNumber: string = "";
  deliveryFlatNumber: string;
  deliveryPlaceName: string = "";

  isRegionDisabled: boolean = true;
  isViewDeliveryAddressList: boolean = false;
  isCorrectDeliveryAddressList: boolean = false;

  errTxt: string;  
  deliveryAddressData: any;

  constructor(private http: HttpClient, private onlineStoreService: OnlineStoreService, private router: Router, private spinner: NgxSpinnerService) {

  }

  ngOnInit(): void {    
    this.buyerVerifyModel = this.onlineStoreService.getBuyerVerifyModel();        
    this.getUserDeliveryAddresses();   
    this.getPermissionsKatoObjects();
    this.deliveryRegionId = 3;     
  }

  getPermissionsKatoObjects(){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getPermissionsCatoList';
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.permissionsKatoObjects=data;       
      this.permissionsDistrictList = this.permissionsKatoObjects.filter(x => x.katoIdHi == this.deliveryRegionId);            
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении списка адресов доставки!");
      this.spinner.hide();      
    })    
  }

  getUserDeliveryAddresses(){
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getUserDeliveryAddresses?userLogin=' + this.buyerVerifyModel.eMail;
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.userDeliveryAddresses=data;      

      if (this.userDeliveryAddresses.length > 0){
        this.isViewDeliveryAddressList = true;
      }      
      
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении списка адресов доставки!");
      this.spinner.hide();      
    })    
  }

  getPermissionsAreaList(value){
    this.permissionsAreaList = this.permissionsKatoObjects.filter(x => x.katoIdHi == value);    
    this.deliveryAreaId = null;  
    this.deliveryPlaceId = null;
  }

  getPermissionsPlaceList(value){
    console.log("value: " + value);
    this.spinner.show();
    this.deliveryPlaceId = null;
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getKatoChildList?katoId=' + value;
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.permissionsPlaceList=data;       
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении списка адресов доставки!");
      this.spinner.hide();      
    })    
  }  

  goBack(){
    this.router.navigate(["buyerRegistration"]); 
  }

  addDeliveryAddress(){
    this.isViewDeliveryAddressList = false;
    this.isCorrectDeliveryAddressList = false;

    this.deliveryRegionId = 3;     
    this.getPermissionsKatoObjects();    

    this.deliveryDistrictId = 0;    
    this.deliveryAreaId = 0;    
    this.deliveryPlaceId = 0;

    this.deliveryStreet = "";
    this.deliveryHouseNumber = "";
    this.deliveryFlatNumber = "";
    this.deliveryPlaceName = ""; 

  }

  saveDeliveryAddress(){    

    if ((this.deliveryDistrictId == 0) || (this.deliveryDistrictId == null)) {
      this.showGritterNotify( "ERROR", "Необходимо выбрать район из списка.");                                                    
      this.spinner.hide();
      return;
    }

    if ((this.deliveryAreaId == 0) || (this.deliveryAreaId == null)) {    
      this.showGritterNotify( "ERROR", "Необходимо выбрать территориальную принадлежность из списка.");                                                    
      this.spinner.hide();
      return;
    }    

    if ((this.deliveryPlaceId == 0) || (this.deliveryPlaceId == null)) {        
      this.showGritterNotify( "ERROR", "Необходимо выбрать населенный пункт из списка.");                                                    
      this.spinner.hide();
      return;
    }    

    if (this.deliveryStreet == "") {
      this.showGritterNotify( "ERROR", "Необходимо заполнить улицу.");                                                    
      this.spinner.hide();
      return;
    }    

    if (this.deliveryHouseNumber == "") {
      this.showGritterNotify( "ERROR", "Необходимо заполнить номер дома.");                                                    
      this.spinner.hide();
      return;
    }        

    if (this.deliveryPlaceName == "") {
      this.showGritterNotify( "ERROR", "Необходимо заполнить поле краткое обозначение.");                                                    
      this.spinner.hide();
      return;
    }            

    let saveDeliveryAddressUrl = environment.onlineStoreNsiServiceUrl + 'saveBuyerDeliveryAddress'; 
    if (!this.isCorrectDeliveryAddressList){
      this.http.post<any>(saveDeliveryAddressUrl, 
        {         
          userLogin: this.buyerVerifyModel.eMail,
          deliveryRegionId: this.deliveryRegionId,
          deliveryDistrictId: this.deliveryDistrictId,
          deliveryAreaId: this.deliveryAreaId,
          deliveryPlaceId: this.deliveryPlaceId,
          deliveryStreet: this.deliveryStreet,
          deliveryHouseNumber: this.deliveryHouseNumber,
          deliveryFlatNumber: this.deliveryFlatNumber,
          deliveryPlaceName: this.deliveryPlaceName,
        }
      ).subscribe((data:any) => { 
        this.deliveryAddressData = data; 
        if ((this.deliveryAddressData.errCode == 0) || (this.deliveryAddressData.errCode == "0")) {  
          this.showGritterNotify( "ERROR", "Добавление адреса доставки завершено успешно.");  
          this.isViewDeliveryAddressList = true;                                                                                                                 
          this.getUserDeliveryAddresses();             
          this.spinner.hide();        
        }
        else {
          this.showGritterNotify( "ERROR", "Ошибка при сохранении адреса доставки. Текст ошибки: " + this.deliveryAddressData.errMsg);                                                    
          this.spinner.hide();
        }
                                
      }, 
      error => {
        this.errTxt=error;                                                                         
        this.showGritterNotify( "error", "Ошибка при сохранении адреса доставки. Текст ошибки: " + JSON.stringify(this.errTxt));  
        this.spinner.hide();                                                
      });
    }
    else {
      this.http.post<any>(saveDeliveryAddressUrl, 
        {  
          udaId: this.udaId,       
          userLogin: this.buyerVerifyModel.eMail,
          deliveryRegionId: this.deliveryRegionId,
          deliveryDistrictId: this.deliveryDistrictId,
          deliveryAreaId: this.deliveryAreaId,
          deliveryPlaceId: this.deliveryPlaceId,
          deliveryStreet: this.deliveryStreet,
          deliveryHouseNumber: this.deliveryHouseNumber,
          deliveryFlatNumber: this.deliveryFlatNumber,
          deliveryPlaceName: this.deliveryPlaceName,
        }
      ).subscribe((data:any) => { 
        this.deliveryAddressData = data; 
        if ((this.deliveryAddressData.errCode == 0) || (this.deliveryAddressData.errCode == "0")) {  
          this.showGritterNotify( "ERROR", "Редактирование адреса доставки завершено успешно."); 
          this.isViewDeliveryAddressList = true;                                                         
          this.getUserDeliveryAddresses();             
          this.spinner.hide();        
        }
        else {
          this.showGritterNotify( "ERROR", "Ошибка при сохранении адреса доставки. Текст ошибки: " + this.deliveryAddressData.errMsg);                                                    
          this.spinner.hide();
        }
                                
      }, 
      error => {
        this.errTxt=error;                                                                         
        this.showGritterNotify( "error", "Ошибка при сохранении адреса доставки. Текст ошибки: " + JSON.stringify(this.errTxt));  
        this.spinner.hide();                                                
      });
    }    
  }

  correctDeliveryAddress(udaId){    
    this.isCorrectDeliveryAddressList = true;
    this.udaId = udaId;
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getUDAById?udaId=' + udaId;
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.userUDA = data;      
      console.log("this.userUDA: " + JSON.stringify(this.userUDA))

      if ((this.userUDA.udaId != null) && (this.userUDA.udaId != 0)){
        this.deliveryRegionId = this.userUDA.deliveryRegionId;
        this.permissionsDistrictList = this.permissionsKatoObjects.filter(x => x.katoIdHi == this.deliveryRegionId);            

        this.deliveryDistrictId = this.userUDA.deliveryDistrictId;
        this.permissionsAreaList = this.permissionsKatoObjects.filter(x => x.katoIdHi == this.deliveryDistrictId);    

        this.deliveryAreaId = this.userUDA.deliveryAreaId;
        this.getPermissionsPlaceList(this.deliveryAreaId);

        this.deliveryPlaceId = this.userUDA.user_kato_address.katoId;

        this.deliveryStreet = this.userUDA.street;
        this.deliveryHouseNumber = this.userUDA.houseNumber;
        this.deliveryFlatNumber = this.userUDA.flatNumber;
        this.deliveryPlaceName = this.userUDA.addressNote; 
        
        this.isViewDeliveryAddressList = false;

      }      
      
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при получении списка адресов доставки!");
      this.spinner.hide();      
    })    
  }

  delDeliveryAddress(udaId){        
    this.udaId = udaId;
    this.spinner.show();
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'delUserDeliveryAddresses?udaId=' + udaId;
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.userUDA = data;      
      console.log("this.userUDA: " + JSON.stringify(this.userUDA))

      if ((this.userUDA.errCode != null) && (this.userUDA.errCode == 0)){        
        this.showGritterNotify( "error", "Удаление адреса доставки завершено успешно!");
        this.isViewDeliveryAddressList = true;                                                         
        this.getUserDeliveryAddresses();                   
      }      
      else {
        this.showGritterNotify( "error", "Ошибка при удалении адреса доставки! Текст ошибки: " + this.userUDA.errMsg);
      }
      
      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;           
      this.showGritterNotify( "error", "Ошибка при удалении адреса доставки! Текст ошибки: " + JSON.stringify(error));
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
