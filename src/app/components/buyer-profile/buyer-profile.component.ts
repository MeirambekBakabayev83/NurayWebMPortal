import { Component, OnInit, Renderer2 } from '@angular/core';
import { faRegistered, faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { ViewEncapsulation } from '@angular/core';
import { BuyerVerify } from 'src/app/models/buyer';
declare var $: any;

@Component({
  selector: 'app-buyer-profile',
  styles: [`
  input.ng-touched.ng-invalid {border:solid red 2px;}
  input.ng-touched.ng-valid {border:solid green 2px;}
  `],  
  templateUrl: './buyer-profile.component.html',
  styleUrls: ['./buyer-profile.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class BuyerProfileComponent implements OnInit {

  buyerPhoneNumber: string;  
  buyerPassw: string;  
  buyerEMail: string;
  isCheckBuyerEMail: number = 0;

  fCode: string = "";
  sCode: string = "";
  thCode: string = "";
  fourCode: string = "";
  fiveCode: string = "";

  fPIN: string = "";
  sPIN: string = "";
  thPIN: string = "";
  fourPIN: string = "";
  
  fRPIN: string = "";
  sRPIN: string = "";
  thRPIN: string = "";
  fourRPIN: string = "";  

  faRegistered = faRegistered;
  faDoorOpen = faDoorOpen;  

  errTxt: string;
  sendEmailObj: any;
  emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"; 

  sendVerifyCodeResult: any;
  sendVerifyEMailResult: any;
  buyerData: any;

  buyerVerifyModel: BuyerVerify = new BuyerVerify();

  constructor(private router: Router, private spinner: NgxSpinnerService, private http: HttpClient, private onlineStoreService: OnlineStoreService, private renderer: Renderer2) { 
    this.buyerPhoneNumber = "";
  }

  ngOnInit(): void {
    //this.spinner.show(); 
    this.onlineStoreService.goToClearBasket(false);
    this.onlineStoreService.goToBasketList(false);
  }

  checkBuyerLogin(){ 
    this.spinner.show(); 
    let varEmail = (<HTMLInputElement>document.getElementById("buyerEMail")).value;   

    if ((varEmail == "") || (varEmail == null) || (varEmail == undefined)){    
      this.showGritterNotify( "error", "Пожалуйста, заполните электронную почту.");
      //this.spinner.hide();
      return;
    }

    let buterDataUrl = environment.onlineStoreNsiServiceUrl + 'getBuyerByCode?buyerCode=' + varEmail.toUpperCase();
    this.http.get(buterDataUrl).subscribe((data:any) => 
    {
      this.buyerData=data; 
      
      if ((this.buyerData) && (this.buyerData.userId) && (this.buyerData.userId != null) && (this.buyerData.userId != 0)){
        this.isCheckBuyerEMail = 1;
      }
      else {
        this.isCheckBuyerEMail = 2;
        this.showGritterNotify( "error", "Пользователь с электронной почтой " + varEmail + " не обнаружен в системе. Необходимо ввести корректные данные либо пройти процедуру регистрации.");
      }

      this.spinner.hide();
    },
    error => 
    {
      this.errTxt=error;      
      console.log("this.errTxt: " + JSON.stringify(this.errTxt));
      this.showGritterNotify( "error", "Ошибка при проверке электронной почты пользователя");
      this.spinner.hide();      
    })    

  }

  sendEMailForGetVerifyCode(){ 
    this.spinner.show(); 
    let varEmail = (<HTMLInputElement>document.getElementById("buyerEMail")).value;   
    
    if ((varEmail == "") || (varEmail == null) || (varEmail == undefined)){    
      this.showGritterNotify( "error", "Пожалуйста, заполните электронную почту.");
      //this.spinner.hide();
      return;
    }

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
        //this.showGritterNotify( "success", "Параметр успешно сохранен!");    

        this.buyerVerifyModel.eMail = this.buyerVerifyModel.eMail;
        this.buyerVerifyModel.verifyCode = verifyCode;

        this.onlineStoreService.setBuyerVerify(this.buyerVerifyModel);

        // Send verify EMail
        let sendVerifyEMailUrl = environment.onlineStoreMailServiceUrl + 'sendMail'; 

        let recipientsArr: string[] = new Array(this.buyerVerifyModel.eMail);

        this.http.post<any>(sendVerifyEMailUrl, 
          {         
            msgSubject: "МАГАЗИН НҰРАЙ",
            msgText: "Ваш персональный код для подтверждения авторизации: <b>" + this.buyerVerifyModel.verifyCode + 
                     "</b>.<br/> Во избежание недоразумении просим не сообщать персональный код третьим лицам, спасибо!",
            sender: "onlinestore.nuray@gmail.com",
            recipients: recipientsArr,
            recipientsCC: null

          }
        ).subscribe((data:any) => {
          this.sendVerifyEMailResult = data;
          if ((this.sendVerifyEMailResult.errCode == 0) || (this.sendVerifyEMailResult.errCode == "0")) {
            this.spinner.hide();
            this.router.navigate(["buyerRegistration"]); 
          }
          else {
            this.showGritterNotify( "ERROR", "Ошибка при отправке кода верификации по почте! Текст ошибки: " + this.sendVerifyEMailResult.errMsg);                                                    
            this.spinner.hide();
          }
        }, 
        error => {
          this.errTxt=error;                                                                         
          this.showGritterNotify( "error", "Ошибка при отправке кода верификации по почте! Текст ошибки: " + JSON.stringify(this.errTxt));  
          this.spinner.hide();                                                
        });                            
        
        //this.spinner.hide();   
      }
      else {
        this.showGritterNotify( "ERROR", "Ошибка при отправке кода верификации по почте! Текст ошибки: " + this.sendVerifyCodeResult.errMsg);                                                    
        this.spinner.hide();
      }
                              
    }, 
    error => {
      this.errTxt=error;                                                                         
      this.showGritterNotify( "error", "Ошибка при отправке кода верификации по почте! Текст ошибки: " + JSON.stringify(this.errTxt));  
      this.spinner.hide();                                                
    });        
      
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

  checkBuyerPsw(){

    this.spinner.show();

    if ((this.fPIN == "") || (this.sPIN == "") || (this.thPIN == "") || (this.fourPIN == "")){
      this.showGritterNotify( "ERROR", "Не все символы введены в PIN коде!");                                                    
      this.spinner.hide();
      return;
    }    

    let varEmail = (<HTMLInputElement>document.getElementById("buyerEMail")).value;       

    let checkBuyerUrl = environment.onlineStoreNsiServiceUrl + 'checkBuyer'; 
    this.http.post<any>(checkBuyerUrl, 
      {         
        userLogin: varEmail.toUpperCase(),
        userPsw: this.fPIN + this.sPIN + this.thPIN + this.fourPIN
      }
    ).subscribe((data:any) => { 
      this.buyerData = data; 
      if ((this.buyerData) && (this.buyerData.userId) && (this.buyerData.userId != null) && (this.buyerData.userId != 0)){

        this.buyerVerifyModel.eMail = this.buyerData.userLogin;
        this.buyerVerifyModel.verifyCode = 0;        
        this.buyerVerifyModel.pinCode = Number(this.fPIN + this.sPIN + this.thPIN + this.fourPIN);        
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
        localStorage.setItem("buyerLogin", this.buyerVerifyModel.eMail);  
        this.spinner.hide();
        this.router.navigate(["buyerRegistration"]); 
      }
      else {
        this.showGritterNotify( "ERROR", "Ошибка при идентификации пользователя! Не корректный ПИН - код. Введитый корректный ПИН - код, либо пройдите процедуру регистрации повторно.");                                                    
        this.spinner.hide();
      }
                              
    }, 
    error => {
      this.errTxt=error;                                                                         
      this.showGritterNotify( "error", "Ошибка при идентификации пользователя! Текст ошибки: " + JSON.stringify(this.errTxt));  
      this.spinner.hide();                                                
    });
  }

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message   
    });
  }  

}
