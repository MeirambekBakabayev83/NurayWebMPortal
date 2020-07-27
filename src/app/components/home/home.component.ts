import { Component, OnInit } from '@angular/core';
import { OnlineStoreService } from 'src/app/services/online-store.service';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Subject } from 'rxjs';
import { ViewEncapsulation } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxSpinnerService } from "ngx-spinner";
import { ProductGroups } from 'src/app/models/productGroup';
import { environment } from 'src/environments/environment';
import { MatCarousel, MatCarouselComponent } from '@ngmodule/material-carousel';
import { OwlOptions } from 'ngx-owl-carousel-o';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      200: {
        items: 2
      },
      400: {
        items: 3
      },
      600: {
        items: 4
      },
      800: {
        items: 5
      },      
      1000: {
        items: 6
      },          
      1200: {
        items: 7
      },           
      1400: {
        items: 8
      },           
      1600: {
        items: 9
      },
      1800: {
        items: 10
      }                        
    },
    nav: false
  }

  /*slides = [
    {'image': 'https://gsr.dev/material2-carousel/assets/demo.png',
      'productId': '1', 'title': '1 slide'
    }, 
    {'image': 'https://gsr.dev/material2-carousel/assets/demo.png',
      'productId': '2', 'title': '2 slide'
    }, 
    {'image': 'https://gsr.dev/material2-carousel/assets/demo.png',
      'productId': '3', 'title': '3 slide'
    }, 
    {'image': 'https://gsr.dev/material2-carousel/assets/demo.png',
      'productId': '4', 'title': '4 slide'
    }, 
    {'image': 'https://gsr.dev/material2-carousel/assets/demo.png',
      'productId': '5', 'title': '5 slide'
    }, 
  ];*/

  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};  
  dtTrigger: Subject<any> = new Subject();

  productGroups: ProductGroups[] = [];

  errTxt: string;

  constructor(private onlineStoreService: OnlineStoreService, private http: HttpClient, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.getProductGroupList();
  }

  getProductGroupList(){
    let productGroupListUrl = environment.onlineStoreNsiServiceUrl + 'getProductGroupModel';
    this.http.get(productGroupListUrl).subscribe((data:any) => 
    {
      this.productGroups=data; 
    },
    error => 
    {
      this.errTxt=error;      
      this.showGritterNotify( "error", "Ошибка при получении списка товаров");
      this.spinner.hide();      
    })    
  }

  installDesktopApp(){
    alert("SOON!!!");
  }  

  public showGritterNotify(type: string, message: string){
    $.gritter.add({      
      title: "Уведомление!",                        
      text: message      
    });
  }  

}
