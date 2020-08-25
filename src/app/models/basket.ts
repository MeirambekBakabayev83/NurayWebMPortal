export class Basket{
    productsTotalCount: number;
    productsTotalSumm: number;
    basketProducts: BasketProduct[]; 
}

export class BasketProduct{
    productId: number;
    productPrice: number;
    productCount: number;
    productSumm: number;
    productName: string;
}