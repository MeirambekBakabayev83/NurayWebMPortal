import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map} from 'rxjs/operators'; 
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductGroups } from 'src/app/models/productGroup';
import { Basket } from 'src/app/models/basket';
import { BuyerVerify } from 'src/app/models/buyer';

@Injectable({
  providedIn: 'root'
})
export class OnlineStoreService {

  private basketModel: Basket = new Basket();
  private buyerVerifyModel: BuyerVerify = new BuyerVerify(); 

  private isBasketUpd = new Subject<Basket>();
  isBasketUpd$ = this.isBasketUpd.asObservable(); 

  private isReturnBack = new Subject<string>();
  isReturnBack$ = this.isReturnBack.asObservable(); 

  private isClearBasket = new Subject<boolean>();
  isClearBasket$ = this.isClearBasket.asObservable(); 

  private isReturnBasketList = new Subject<boolean>();
  isReturnBasketList$ = this.isReturnBasketList.asObservable();   

  private isSendOrder = new Subject<boolean>();
  isSendOrder$ = this.isSendOrder.asObservable();   

  private isBuyerVerify = new Subject<BuyerVerify>();
  isBuyerVerify$ = this.isBuyerVerify.asObservable();

  private buyerDatas = new Subject<any>();
  buyerDatas$ = this.isBuyerVerify.asObservable();

  constructor(private http: HttpClient) { 
    this.basketModel.productsTotalCount = 0;
    this.basketModel.productsTotalSumm = 0;
    this.basketModel.deliverySumm = 0;
    this.basketModel.totalSumm = 0;    
    this.basketModel.basketProducts = [];
  }

  getProductgroupsList() : Observable<ProductGroups[]>{        

    return this.http.get(environment.onlineStoreNsiServiceUrl + 'getProductGroupHiNullList').pipe(map((data: Response)=>{
      let pgList = JSON.parse(JSON.stringify(data));//data[''];        
      return pgList.map(function(pg:ProductGroups) {                
        return {                            
          productGroupId: pg.productGroupId, 
          productGroupIdHi: pg.productGroupIdHi,
          productGroupCode: pg.productGroupCode,
          productGroupGuid: pg.productGroupGuid,
          productGroupNameKaz: pg.productGroupNameKaz,
          productGroupNameRus: pg.productGroupNameRus,
          productGroupNameEng: pg.productGroupNameEng,
          createTime: pg.createTime,
          isArc: pg.isArc
        };
      })
    }));
       
  }

  goToReturn(routeName: string){    
    
    this.isReturnBack.next(routeName);    
    
  }

  goToClearBasket(isClearBasket: boolean){    
    
    this.isClearBasket.next(isClearBasket);    
    
  }

  goToBasketList(isReturnBasketList: boolean){    
    
    this.isReturnBasketList.next(isReturnBasketList);    
    
  }  

  goToSenderBasket(isSenderOrder: boolean){    
    
    this.isSendOrder.next(isSenderOrder);    
    
  }    

  fillBasketModel(productItem: any){          

    //console.log("productItem1: " + JSON.stringify(productItem));
    console.log("check basketModel: " + JSON.stringify(this.basketModel));

    let basketProducts = [];              

    let itemProductCount = 0;

    let itemProductPrise = 0;

    if (this.buyerVerifyModel.isPartners == 1){
      itemProductPrise = productItem.productBulkPrice;
    }
    else {
      itemProductPrise = productItem.productRetailPrice;
    }

    if (productItem.isWeight == 0) {
      itemProductCount = 1;
      productItem.productCount = 1;
    }
    else{
      itemProductCount = 0.1;
      productItem.productCount = 0.1;
    }   
    
    if (this.basketModel == null) {

      let localBasketModel: Basket = new Basket();

      localBasketModel.productsTotalCount = 0;
      localBasketModel.productsTotalSumm = 0;
      localBasketModel.deliverySumm = 0;
      localBasketModel.totalSumm = 0;    
      localBasketModel.basketProducts = [];      

      this.basketModel = localBasketModel;      
    }

    if (this.basketModel?.basketProducts) {
      for (let basket in this.basketModel?.basketProducts)
      {
        basketProducts.push(
          {
            "productId": this.basketModel.basketProducts[basket].productId,
            "productCode": this.basketModel.basketProducts[basket].productCode,
            "productPrice": this.basketModel.basketProducts[basket].productPrice,
            "productCount": this.basketModel.basketProducts[basket].productCount,
            "productSumm": this.basketModel.basketProducts[basket].productSumm,
            "productName": this.basketModel.basketProducts[basket].productName,
            "productPhotoUrl": this.basketModel.basketProducts[basket].productPhotoUrl,
            "isWeight": this.basketModel.basketProducts[basket].isWeight,
            "productUnitName": this.basketModel.basketProducts[basket].productUnitName
          }
        );      
      }
    }

    basketProducts.push(
      {
        "productId": productItem.productId,
        "productCode": productItem.productCode,
        "productPrice": itemProductPrise,
        "productCount": itemProductCount,
        //"productSumm": (productItem.productRetailPrice ? itemProductCount * itemProductPrise : itemProductCount * productItem.productPrice),
        "productSumm": itemProductCount * itemProductPrise,
        "productName": productItem.productNameRus,
        "productPhotoUrl": productItem.productPhotoUrl,
        "isWeight": productItem.isWeight,
        "productUnitName": productItem.productUnitName
      }
    );          

    this.basketModel.basketProducts = basketProducts;                

    this.basketModel.productsTotalCount = this.basketModel.productsTotalCount + 1;

    let productsTotalSumm = 0;
    for (let basket in this.basketModel.basketProducts)
    {
      productsTotalSumm = productsTotalSumm + (this.basketModel.basketProducts[basket].productCount * this.basketModel.basketProducts[basket].productPrice);
    }

    productsTotalSumm = Number(productsTotalSumm.toFixed(2));

    this.basketModel.productsTotalSumm = productsTotalSumm;

    this.isBasketUpd.next(this.basketModel);

    console.log("check: " + JSON.stringify(this.basketModel))    

    localStorage.setItem("buyerBasketModel", JSON.stringify(this.basketModel));  
  }

  addCorrectItemBasketModel(productItem: any){              

    let index = null;

    let itemProductPrise = 0;

    if (this.buyerVerifyModel.isPartners == 1){
      itemProductPrise = productItem.productBulkPrice;      
    }
    else {
      itemProductPrise = productItem.productRetailPrice;      
    }    

    if ((itemProductPrise == null) || (itemProductPrise == undefined)){
      itemProductPrise = productItem.productPrice;
    }
               

    index = this.basketModel?.basketProducts.findIndex(function (element) { 
      return element.productId == productItem.productId; 
    });    

    if (index !== -1) {
      this.basketModel.basketProducts[index].productId = productItem.productId;
      this.basketModel.basketProducts[index].productCount = Number(productItem.productCount.toFixed(1));
      //this.basketModel.basketProducts[index].productPrice = productItem.productRetailPrice;          
      this.basketModel.basketProducts[index].productPrice = itemProductPrise
      //this.basketModel.basketProducts[index].productSumm = (productItem.productRetailPrice ? productItem.productCount * itemProductPrise : productItem.productCount * productItem.productPrice);          
      this.basketModel.basketProducts[index].productSumm = productItem.productCount * itemProductPrise
      this.basketModel.basketProducts[index].productName = (productItem.productNameRus ? productItem.productNameRus : productItem.productName);          
    }                                         

    let productsTotalSumm = 0;
    for (let basket in this.basketModel.basketProducts)
    {
      productsTotalSumm = productsTotalSumm + (this.basketModel.basketProducts[basket].productCount * this.basketModel.basketProducts[basket].productPrice);
    }

    productsTotalSumm = Number(productsTotalSumm.toFixed(2));

    this.basketModel.productsTotalSumm = productsTotalSumm;

    this.isBasketUpd.next(this.basketModel);

    //console.log("this.basketModel: " + JSON.stringify(this.basketModel))

    localStorage.setItem("buyerBasketModel", JSON.stringify(this.basketModel));  
  }  

  delCorrectItemBasketModel(productItem: any, minusProductCount: number){              

    let index = null;

    let itemProductPrise = 0;

    if (this.buyerVerifyModel.isPartners == 1){
      itemProductPrise = productItem.productBulkPrice;
    }
    else {
      itemProductPrise = productItem.productRetailPrice;
    }

    if ((itemProductPrise == null) || (itemProductPrise == undefined)){
      itemProductPrise = productItem.productPrice;
    }    

    productItem.productCount = productItem.productCount - minusProductCount

    index = this.basketModel?.basketProducts.findIndex(function (element) { 
      return element.productId == productItem.productId; 
    });

    if (index !== -1) {
      this.basketModel.basketProducts[index].productId = productItem.productId;
      this.basketModel.basketProducts[index].productCount = Number(productItem.productCount.toFixed(1));
      //this.basketModel.basketProducts[index].productPrice = (productItem.productRetailPrice ? itemProductPrise: productItem.productPrice); 
      this.basketModel.basketProducts[index].productPrice = itemProductPrise; 
      //this.basketModel.basketProducts[index].productSumm = Number((this.basketModel.basketProducts[index].productCount * productItem.productRetailPrice).toFixed(2));                   
      this.basketModel.basketProducts[index].productSumm = productItem.productCount * itemProductPrise;
      this.basketModel.basketProducts[index].productName = (productItem.productNameRus ? productItem.productNameRus : productItem.productName);          
      //productItem.productCount = this.basketModel.basketProducts[index].productCount;
      
    }

    if (productItem.isWeight == 0) {
      if (this.basketModel?.basketProducts[index].productCount == 0){
        this.basketModel?.basketProducts.splice(index, 1);
        this.basketModel.productsTotalCount = this.basketModel.productsTotalCount - 1;

        productItem.viewBasket = false;
      }
    }  
    else {
      if (this.basketModel?.basketProducts[index].productCount < 0.1){
        this.basketModel?.basketProducts.splice(index, 1);
        this.basketModel.productsTotalCount = this.basketModel.productsTotalCount - 1;
        productItem.viewBasket = false;
      }      
    }  

    let productsTotalSumm = 0;
    for (let basket in this.basketModel.basketProducts)
    {
      productsTotalSumm = productsTotalSumm + (this.basketModel.basketProducts[basket].productCount * this.basketModel.basketProducts[basket].productPrice);
    }

    productsTotalSumm = Number(productsTotalSumm.toFixed(2));

    this.basketModel.productsTotalSumm = productsTotalSumm;        

    this.isBasketUpd.next(this.basketModel);

    localStorage.setItem("buyerBasketModel", JSON.stringify(this.basketModel));  
  } 

  delItemBasketModel(productItem: any){              

    let index = null;    

    index = this.basketModel?.basketProducts.findIndex(function (element) { 
      return element.productId == productItem.productId; 
    });

    if (index !== -1) {
      this.basketModel.basketProducts.splice(index, 1);
      this.basketModel.productsTotalCount = this.basketModel.productsTotalCount - 1;      
    }    

    let productsTotalSumm = 0;
    for (let basket in this.basketModel?.basketProducts)
    {
      productsTotalSumm = productsTotalSumm + (this.basketModel.basketProducts[basket].productCount * this.basketModel.basketProducts[basket].productPrice);
    }

    productsTotalSumm = Number(productsTotalSumm.toFixed(2));

    this.basketModel.productsTotalSumm = productsTotalSumm;        

    this.isBasketUpd.next(this.basketModel);

    localStorage.setItem("buyerBasketModel", JSON.stringify(this.basketModel));  

  } 

  clearBasketModel(){
    this.basketModel.productsTotalSumm = 0;        
    this.basketModel.productsTotalCount = 0;
    this.basketModel.deliverySumm = 0;
    this.basketModel.totalSumm = 0;

    while(this.basketModel?.basketProducts.length > 0) {
      this.basketModel.basketProducts.pop();
    }      
    

    this.isBasketUpd.next(this.basketModel);

    localStorage.setItem("buyerBasketModel", JSON.stringify(this.basketModel));  
  }
  
  setBuyerVerify(_buyerVerify: BuyerVerify){
    this.isBuyerVerify.next(_buyerVerify);
    this.buyerVerifyModel = _buyerVerify;
  }

  setBuyerDatas(_buyerDatas: any){
    this.buyerDatas.next(_buyerDatas);    
  }

  getBuyerVerifyModel(){
    return this.buyerVerifyModel;
  }

  getBasketModel(){

    if (this.basketModel == null) {

      let localBasketModel: Basket = new Basket();

      localBasketModel.productsTotalCount = 0;
      localBasketModel.productsTotalSumm = 0;
      localBasketModel.deliverySumm = 0;
      localBasketModel.totalSumm = 0;    
      localBasketModel.basketProducts = [];      

      this.basketModel = localBasketModel;
    }    

    return this.basketModel;
  }

  setBasketModel(basketData: Basket){
    this.basketModel = basketData;
    //this.isBasketUpd.next(basketData);
  }

}
