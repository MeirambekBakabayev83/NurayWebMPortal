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

  private isBuyerVerify = new Subject<BuyerVerify>();
  isBuyerVerify$ = this.isBuyerVerify.asObservable();

  private buyerDatas = new Subject<any>();
  buyerDatas$ = this.isBuyerVerify.asObservable();

  constructor(private http: HttpClient) { 
    this.basketModel.productsTotalCount = 0;
    this.basketModel.productsTotalSumm = 0;
    this.basketModel.deliverySumm = 0;
    this.basketModel.totalSumm = 0;
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

  fillBasketModel(productItem: any){          

    let basketProducts = [];              

    let itemProductCount = 0;

    if (productItem.isWeight == 0) {
      itemProductCount = 1;
      productItem.productCount = 1;
    }
    else{
      itemProductCount = 0.1;
      productItem.productCount = 0.1;
    }    

    for (let basket in this.basketModel.basketProducts)
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

    basketProducts.push(
      {
        "productId": productItem.productId,
        "productCode": productItem.productCode,
        "productPrice": productItem.productRetailPrice,
        "productCount": itemProductCount,
        "productSumm": (productItem.productRetailPrice ? itemProductCount * productItem.productRetailPrice : itemProductCount * productItem.productPrice),
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
  }

  addCorrectItemBasketModel(productItem: any){              

    let index = null;

    index = this.basketModel.basketProducts.findIndex(function (element) { 
      return element.productId == productItem.productId; 
    });

    console.log("index: " + index)

    if (index !== -1) {
      this.basketModel.basketProducts[index].productId = productItem.productId;
      this.basketModel.basketProducts[index].productCount = Number(productItem.productCount.toFixed(1));
      //this.basketModel.basketProducts[index].productPrice = productItem.productRetailPrice;          
      this.basketModel.basketProducts[index].productPrice = (productItem.productRetailPrice ? productItem.productRetailPrice: productItem.productPrice); 
      this.basketModel.basketProducts[index].productSumm = (productItem.productRetailPrice ? productItem.productCount * productItem.productRetailPrice : productItem.productCount * productItem.productPrice);          
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
  }  

  delCorrectItemBasketModel(productItem: any, minusProductCount: number){              

    let index = null;

    index = this.basketModel.basketProducts.findIndex(function (element) { 
      return element.productId == productItem.productId; 
    });

    if (index !== -1) {
      this.basketModel.basketProducts[index].productId = productItem.productId;
      this.basketModel.basketProducts[index].productCount = Number((this.basketModel.basketProducts[index].productCount - minusProductCount).toFixed(1));
      this.basketModel.basketProducts[index].productPrice = (productItem.productRetailPrice ? productItem.productRetailPrice: productItem.productPrice); 
      //this.basketModel.basketProducts[index].productSumm = Number((this.basketModel.basketProducts[index].productCount * productItem.productRetailPrice).toFixed(2));                   
      this.basketModel.basketProducts[index].productSumm = (productItem.productRetailPrice ? productItem.productCount * productItem.productRetailPrice : productItem.productCount * productItem.productPrice);
      this.basketModel.basketProducts[index].productName = (productItem.productNameRus ? productItem.productNameRus : productItem.productName);          
      productItem.productCount = this.basketModel.basketProducts[index].productCount;
      
    }

    if (productItem.isWeight == 0) {
      if (this.basketModel.basketProducts[index].productCount == 0){
        this.basketModel.basketProducts.splice(index, 1);
        this.basketModel.productsTotalCount = this.basketModel.productsTotalCount - 1;

        productItem.viewBasket = false;
      }
    }  
    else {
      if (this.basketModel.basketProducts[index].productCount < 0.1){
        this.basketModel.basketProducts.splice(index, 1);
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
  } 

  delItemBasketModel(productItem: any){              

    let index = null;

    index = this.basketModel.basketProducts.findIndex(function (element) { 
      return element.productId == productItem.productId; 
    });

    if (index !== -1) {
      this.basketModel.basketProducts.splice(index, 1);
      this.basketModel.productsTotalCount = this.basketModel.productsTotalCount - 1;      
    }    

    let productsTotalSumm = 0;
    for (let basket in this.basketModel.basketProducts)
    {
      productsTotalSumm = productsTotalSumm + (this.basketModel.basketProducts[basket].productCount * this.basketModel.basketProducts[basket].productPrice);
    }

    productsTotalSumm = Number(productsTotalSumm.toFixed(2));

    this.basketModel.productsTotalSumm = productsTotalSumm;        

    this.isBasketUpd.next(this.basketModel);
  } 

  clearBasketModel(){
    this.basketModel.productsTotalSumm = 0;        
    this.basketModel.productsTotalCount = 0;

    while(this.basketModel.basketProducts.length > 0) {
      this.basketModel.basketProducts.pop();
    }      

    this.isBasketUpd.next(this.basketModel);
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
    return this.basketModel;
  }

  setBasketModel(basketData: Basket){
    this.basketModel = basketData;
  }

}
