import { Component, OnInit, Renderer2, ElementRef } from '@angular/core';
import { BuyerVerify } from 'src/app/models/buyer';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from 'src/environments/environment';
import { faReply, faSave, faEdit } from '@fortawesome/free-solid-svg-icons';
import { DateAdapter } from '@angular/material/core';
declare var $: any;

@Component({
  selector: 'app-buyer-registration',
  templateUrl: './buyer-registration.component.html',
  styleUrls: ['./buyer-registration.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BuyerRegistrationComponent implements OnInit {

  fCode: String = "";
  sCode: String = "";
  thCode: String = "";
  fourCode: String = "";
  fiveCode: String = "";

  fPIN: String = "";
  sPIN: String = "";
  thPIN: String = "";
  fourPIN: String = "";
  
  fRPIN: String = "";
  sRPIN: String = "";
  thRPIN: String = "";
  fourRPIN: String = "";  

  isAuthView: boolean = true;
  isBuyerSave: boolean = false;

  buyerVerifyModel: BuyerVerify = new BuyerVerify();  

  faReply = faReply;
  faSave = faSave;
  faEdit = faEdit;

  sendVerifyCodeResult: any;
  sendVerifyEMailResult: any;
  saveBuyerResult: any;
  errTxt: string;  
  buyerData: any;

  //phoneMask = ['(', /999/, ')', ' ', /999/, ' ',   /99/, ' ',  /99/];
  phoneMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];

  constructor(private http: HttpClient, private onlineStoreService: OnlineStoreService, private router: Router, private renderer: Renderer2, private spinner: NgxSpinnerService
             , private dateAdapter: DateAdapter<Date>) { 
    this.buyerVerifyModel.firstName = "";
    this.buyerVerifyModel.name = "";
    this.buyerVerifyModel.lastName = "";
    this.dateAdapter.setLocale('ru-RU');
  }

  ngOnInit(): void {         
    
    this.onlineStoreService.buyerDatas$.subscribe(buyerDatas => {
      this.buyerData = buyerDatas;            
    })    
    
    this.buyerVerifyModel = this.onlineStoreService.getBuyerVerifyModel();    

    if ((this.buyerVerifyModel.buyerCode) && (this.buyerVerifyModel.buyerCode != "")) {
      this.isBuyerSave = true;
      this.isAuthView = false;
    }
    else {
      this.buyerVerifyModel.firstName = "";
      this.buyerVerifyModel.name = "";
      this.buyerVerifyModel.lastName = "";
      this.buyerVerifyModel.sex = "U";
      this.buyerVerifyModel.birthDate = "";
      this.buyerVerifyModel.contactPhone = "";
      this.isBuyerSave = false;
      this.isAuthView = true;
    }    
  }

  goBack(){
    this.router.navigate(["buyerProfile"]); 
  }

  buyerSave(){
    // Проверки
    console.log("this.buyerVerifyModel.firstName: " + this.buyerVerifyModel.firstName);
    if (this.buyerVerifyModel.firstName == ""){
      this.showGritterNotify( "ERROR", "Фамилия не заполнено!");
      return;
    }

    if (this.buyerVerifyModel.name == ""){
      this.showGritterNotify( "ERROR", "Имя не заполнено!");
      return;
    }

    if (this.buyerVerifyModel.sex == "U"){
      this.showGritterNotify( "ERROR", "Пол не выбран!");
      return;
    }

    if (this.buyerVerifyModel.contactPhone == ""){
      this.showGritterNotify( "ERROR", "Контактный телефон не заполнен!");
      return;
    }

    if (this.buyerVerifyModel.birthDate == ""){
      this.showGritterNotify( "ERROR", "Дата рождения не заполнена!");
      return;
    }

    let birthDate = Date.parse(this.buyerVerifyModel.birthDate);

    if (birthDate == NaN){
      this.showGritterNotify( "ERROR", "Дата рождения заполнена не корректно! Для корректного ввода просим выбрать из списка при помощи иконки.");
      return;
    }

    let saveBuyerUrl = environment.onlineStoreNsiServiceUrl + 'saveBuyerDatas'; 

    this.http.post<any>(saveBuyerUrl, this.buyerVerifyModel
    ).subscribe((data:any) => {
      this.saveBuyerResult = data;
      if ((this.saveBuyerResult.errCode == 0) || (this.saveBuyerResult.errCode == "0")) {        
        this.onlineStoreService.setBuyerVerify(this.buyerVerifyModel);
        localStorage.setItem("buyerLogin", this.buyerVerifyModel.eMail);  
        this.isBuyerSave = true;
        this.spinner.hide();
        this.showGritterNotify( "ERROR", "Сохранение завершено успешно!");
      }
      else {
        this.isBuyerSave = false;
        this.spinner.hide();
        this.showGritterNotify( "ERROR", "Ошибка при сохранении! Текст ошибки: " + this.saveBuyerResult.errMsg);                                                            
      }
    }, 
    error => {
      this.errTxt=error;         
      this.isBuyerSave = false;                                                                
      this.spinner.hide();                                                
      this.showGritterNotify( "error", "Ошибка при сохранении! Текст ошибки: " + JSON.stringify(this.errTxt));        
    }); 

  }

  replySendCode(){
    this.spinner.show();
    let sendVerifyCodeUrl = environment.onlineStoreMailServiceUrl + 'sendVerifyCode'; 
    let verifyCode = Math.round(Math.random() * 100000);

    if (verifyCode.toString().length != 5) {
      do {
        verifyCode = Math.round(Math.random() * 100000);
      }
      while (verifyCode.toString().length == 5);
    }    

    this.http.post<any>(sendVerifyCodeUrl, 
    {         
      email: this.buyerVerifyModel.eMail,
      verifyCode: verifyCode
    }
    ).subscribe((data:any) => { 
      this.sendVerifyCodeResult = data; 
      if ((this.sendVerifyCodeResult.errCode == 0) || (this.sendVerifyCodeResult.errCode == "0")) {

        this.buyerVerifyModel.eMail = this.buyerVerifyModel.eMail;
        this.buyerVerifyModel.verifyCode = verifyCode;

        this.onlineStoreService.setBuyerVerify(this.buyerVerifyModel);

        // Send verify EMail
        let sendVerifyEMailUrl = environment.onlineStoreMailServiceUrl + 'sendMail'; 

        let recipientsArr: string[] = new Array(this.buyerVerifyModel.eMail);

        this.http.post<any>(sendVerifyEMailUrl, 
          {         
            msgSubject: "МАГАЗИН НҰРАЙ",
            msgText: "Ваш повторный персональный код для подтверждения авторизации: <b>" + this.buyerVerifyModel.verifyCode + 
                     "</b>.<br/> Во избежание недоразумении просим не сообщать персональный код третьим лицам, спасибо!",
            sender: "onlinestore.nuray@gmail.com",
            recipients: recipientsArr,
            recipientsCC: null

          }
        ).subscribe((data:any) => {
          this.sendVerifyEMailResult = data;
          if ((this.sendVerifyEMailResult.errCode == 0) || (this.sendVerifyEMailResult.errCode == "0")) {
            this.spinner.hide();
            this.showGritterNotify( "SUCCESS", "Код верификации повторно отправлен на почтовый адрес: " + this.buyerVerifyModel.eMail);            
          }
          else {
            this.spinner.hide();
            this.showGritterNotify( "ERROR", "Ошибка при повторной отправке кода верификации по почте! Текст ошибки: " + this.sendVerifyEMailResult.errMsg);                                                                
          }
        }, 
        error => {
          this.errTxt=error;                                                                         
          this.spinner.hide();                                                
          this.showGritterNotify( "error", "Ошибка при повторной отправке кода верификации по почте! Текст ошибки: " + JSON.stringify(this.errTxt));            
        }); 
        
      }
      else {
        this.spinner.hide();
        this.showGritterNotify( "ERROR", "Ошибка при повторной отправке кода верификации по почте! Текст ошибки: " + this.sendVerifyCodeResult.errMsg);                                                            
      }
    }, 
    error => {
      this.errTxt=error;                                                                         
      this.spinner.hide(); 
      this.showGritterNotify( "error", "Ошибка при повторной отправке кода верификации по почте! Текст ошибки: " + JSON.stringify(this.errTxt));                                                       
    });
  }

  nextRegistration(){
    let entryVerifyCode =  this.fCode.toString() + this.sCode + this.thCode + this.fourCode + this.fiveCode;
    let entryPINCode =  this.fPIN.toString() + this.sPIN + this.thPIN + this.fourPIN;
    let entryReplyPINCode =  this.fRPIN.toString() + this.sRPIN + this.thRPIN + this.fourRPIN;

    // Проверки
    if (entryVerifyCode.length != 5){
      this.showGritterNotify( "ERROR", "Не все символы введены в коде верификации!");
      return;
    }
    else {
      if (entryVerifyCode != this.buyerVerifyModel.verifyCode.toString()){
        this.showGritterNotify( "ERROR", "Введенный код верификации не корректный!");
        return;
      }
    }

    if (entryPINCode.length != 4){
      this.showGritterNotify( "ERROR", "Не все символы введены в PIN коде!");
      return;
    }

    if (entryReplyPINCode.length != 4){
      this.showGritterNotify( "ERROR", "Не все символы введены в повторе PIN кода!");
      return;
    }

    if (entryReplyPINCode != entryPINCode){
      this.showGritterNotify( "ERROR", "PIN код и повтор PIN кода не совпадают!");
      return;
    }

    this.buyerVerifyModel.pinCode = Number(entryPINCode);
    this.isAuthView = false;
    
  }

  chgFCode(value){           
    
    switch(value) {
      case "sCode": { 
        if ((this.fCode != "") && (this.fCode != null) && (this.fCode != "undefined") && (this.fCode != undefined)) {
          this.renderer.selectRootElement('#sCode').focus();
        }    
        break; 
     } 
     case "thCode": { 
      if ((this.sCode != "") && (this.sCode != null) && (this.sCode != "undefined") && (this.sCode != undefined)) {
        this.renderer.selectRootElement('#thCode').focus();
      }    
      break; 
     } 
      case "fourCode": { 
        if ((this.thCode != "") && (this.thCode != null) && (this.thCode != "undefined") && (this.thCode != undefined)) {
          this.renderer.selectRootElement('#fourCode').focus();
        }    
        break; 
      } 
      case "fiveCode": { 
        if ((this.fourCode != "") && (this.fourCode != null) && (this.fourCode != "undefined") && (this.fourCode != undefined)) {
          this.renderer.selectRootElement('#fiveCode').focus();
        }    
        break; 
      }       
      
      // PIN
      case "fPIN": { 
        if ((this.fiveCode != "") && (this.fiveCode != null) && (this.fiveCode != "undefined") && (this.fiveCode != undefined)) {
          this.renderer.selectRootElement('#fPIN').focus();
        }    
        break; 
      }       
      case "sPIN": { 
        if ((this.fPIN != "") && (this.fPIN != null) && (this.fPIN != "undefined") && (this.fPIN != undefined)) {
          this.renderer.selectRootElement('#sPIN').focus();
        }    
        break; 
      }       
      case "thPIN": { 
        if ((this.sPIN != "") && (this.sPIN != null) && (this.sPIN != "undefined") && (this.sPIN != undefined)) {
          this.renderer.selectRootElement('#thPIN').focus();
        }    
        break; 
      }             
      case "fourPIN": { 
        if ((this.thPIN != "") && (this.thPIN != null) && (this.thPIN != "undefined") && (this.thPIN != undefined)) {
          this.renderer.selectRootElement('#fourPIN').focus();
        }    
        break; 
      }  
      
      // REPLY PIN      
      case "fRPIN": { 
        if ((this.fourPIN != "") && (this.fourPIN != null) && (this.fourPIN != "undefined") && (this.fourPIN != undefined)) {
          this.renderer.selectRootElement('#fRPIN').focus();
        }    
        break; 
      }                       
      case "sRPIN": { 
        if ((this.fRPIN != "") && (this.fRPIN != null) && (this.fRPIN != "undefined") && (this.fRPIN != undefined)) {
          this.renderer.selectRootElement('#sRPIN').focus();
        }    
        break; 
      }                     
      case "thRPIN": { 
        if ((this.sRPIN != "") && (this.sRPIN != null) && (this.sRPIN != "undefined") && (this.sRPIN != undefined)) {
          this.renderer.selectRootElement('#thRPIN').focus();
        }    
        break; 
      }                     
      case "fourRPIN": { 
        if ((this.thRPIN != "") && (this.thRPIN != null) && (this.thRPIN != "undefined") && (this.thRPIN != undefined)) {
          this.renderer.selectRootElement('#fourRPIN').focus();
        }    
        break; 
      }                                            

      //default
      default: { 
        this.renderer.selectRootElement('#fCode').focus();
        break; 
      }                  

    }    
  }

  onFocus(value){           
    
    switch(value) {
      case "fCode": { 
        this.fCode = "";
        break; 
      }       
      case "sCode": { 
        this.sCode = "";
        break; 
      } 
      case "thCode": { 
        this.thCode = "";
        break; 
      } 
      case "fourCode": { 
        this.fourCode = "";
        break; 
      } 
      case "fiveCode": { 
        this.fiveCode = "";
        break; 
      }       
      
      // PIN
      case "fPIN": { 
        this.fPIN = "";
        break; 
      }       
      case "sPIN": { 
        this.sPIN = "";
        break; 
      }       
      case "thPIN": { 
        this.thPIN = "";
        break; 
      }             
      case "fourPIN": { 
        this.fourPIN = "";
        break; 
      }  
      
      // REPLY PIN      
      case "fRPIN": { 
        this.fRPIN = "";
        break; 
      }                       
      case "sRPIN": { 
        this.sRPIN = "";
        break; 
      }                     
      case "thRPIN": { 
        this.thRPIN = "";
        break; 
      }                     
      case "fourRPIN": { 
        this.fourRPIN = "";
        break; 
      }                                            

      //default
      default: { 
        this.renderer.selectRootElement('#fCode').focus();
        break; 
      }                  
    }    
  }

  buyerCorrect(){
    this.isBuyerSave = false;
  }

  goToDeliveryAddresses(){
    this.router.navigate(["deliveryAdresses"]);  
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message   
    });
  }  

}
