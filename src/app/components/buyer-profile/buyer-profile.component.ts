import { Component, OnInit } from '@angular/core';
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

  faRegistered = faRegistered;
  faDoorOpen = faDoorOpen;  

  errTxt: string;
  sendEmailObj: any;
  emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"; 

  sendVerifyCodeResult: any;
  sendVerifyEMailResult: any;

  buyerVerifyModel: BuyerVerify = new BuyerVerify();

  constructor(private router: Router, private spinner: NgxSpinnerService, private http: HttpClient, private onlineStoreService: OnlineStoreService) { 
    this.buyerPhoneNumber = "";
  }

  ngOnInit(): void {
    //this.spinner.show(); 
  }

  sendEMailForGetVerifyCode(){ 
    this.spinner.show(); 
    let varEmail = (<HTMLInputElement>document.getElementById("buyerEMail")).value;   
    console.log("varEmail: " + varEmail);    
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

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message   
    });
  }  

}
