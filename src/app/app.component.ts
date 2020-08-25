import { Component, OnInit } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import { faHome, faBars, faShoppingBasket, faUser, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { Basket } from 'src/app/models/basket';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],  
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  title = 'NurayWebProject';

  basketModel: Basket = new Basket();

  faHome = faHome;
  faBars = faBars;
  faShoppingBasket = faShoppingBasket;
  faShoppingCart = faShoppingCart;
  faUser = faUser;

  constructor(updates:  SwUpdate, private router: Router, private onlineStoreService: OnlineStoreService) {    
    updates.available.subscribe((event) => {
      updates.activateUpdate().then(() => document.location.reload());    
    });        
  }

  ngOnInit() {
    console.log("Test basket1");   
             
    this.onlineStoreService.isBasketUpd$.subscribe( basketModelFromService => {      
      this.basketModel = basketModelFromService;    
      console.log("this.basketModel: " + JSON.stringify(this.basketModel));            
    })            
  }
  
  goHome() {
    this.router.navigate(["home"]);
  }

  goProductCategories() {
    this.router.navigate(["categoriesList"]);
  }

  goBuyerBasket() {
    this.router.navigate(["buyerBasket"]);
  }

  goBuyerProfile() {
    this.router.navigate(["buyerProfile"]);
  }

}
