import { BuyerVerify } from './buyer';

export class Basket{
    productsTotalCount: number;
    productsTotalSumm: number;
    deliverySumm: number;
    totalSumm: number;
    deliveryType: number;
    deliveryAddressId: number;
    deliveryFullAddress: string;
    kindPriseCode: string;
    basketProducts: BasketProduct[]; 
    buyerModel: BuyerVerify;

}

export class BasketProduct{
    productId: number;
    productCode: string;
    productPrice: number;
    productBulkPrice: number;
    productCount: number;
    productSumm: number;
    productName: string;
    productPhotoUrl: string;
    isWeight: number;
    productUnitName: string;
}