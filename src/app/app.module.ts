import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import {enableProdMode} from '@angular/core';
import { polyfill } from 'es6-promise';
import { AppGuard } from './app.guard';
import {Routes, RouterModule} from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NgxSpinnerModule } from "ngx-spinner";
import { HomeComponent } from './components/home/home.component';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CategoriesComponent } from './components/categories/categories.component';
import { BuyerBasketComponent } from './components/buyer-basket/buyer-basket.component';
import { BuyerProfileComponent } from './components/buyer-profile/buyer-profile.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select'; 
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker'; 
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatRadioModule } from '@angular/material/radio'; 
import { BuyerRegistrationComponent } from './components/buyer-registration/buyer-registration.component';
import { DedliveryAddressesComponent } from './components/dedlivery-addresses/dedlivery-addresses.component';
import { SubProductGroupsComponent } from './components/sub-product-groups/sub-product-groups.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { LeftNavMenuComponent } from './components/left-nav-menu/left-nav-menu.component';
import { BuyerSettingsComponent } from './components/buyer-settings/buyer-settings.component'; 
import { BarcodeScannerLivestreamModule } from "ngx-barcode-scanner";
import { ZXingScannerModule } from '@zxing/ngx-scanner';

polyfill();
enableProdMode();
registerLocaleData(localeFr, 'fr');

// определение маршрутов
const appRoutes: Routes =[
  { path: '', pathMatch: 'full', component: HomeComponent},
  { path: 'home', runGuardsAndResolvers: "always", component: HomeComponent,  pathMatch:'full'},   
  { path: 'categoriesList', canActivate: [AppGuard], component: CategoriesComponent,  pathMatch:'full'},   
  { path: 'buyerBasket', canActivate: [AppGuard], component: BuyerBasketComponent,  pathMatch:'full'},   
  { path: 'buyerSetting', canActivate: [AppGuard], component: BuyerSettingsComponent,  pathMatch:'full'},   
  { path: 'buyerProfile', canActivate: [AppGuard], component: BuyerProfileComponent,  pathMatch:'full'},   
  { path: 'buyerRegistration', canActivate: [AppGuard], component: BuyerRegistrationComponent,  pathMatch:'full'},   
  { path: 'deliveryAdresses', canActivate: [AppGuard], component: DedliveryAddressesComponent,  pathMatch:'full'},   
  { path: 'subProducts/:productGroupId', canActivate: [AppGuard], component: SubProductGroupsComponent, pathMatch:'full'},  
  { path: 'productDetails/:productCode', canActivate: [AppGuard], component: ProductDetailsComponent, pathMatch:'full'},  
  { path: '**', redirectTo: '/'}
]

const maskConfig: Partial<IConfig> = {
  validation: false,
};

@NgModule({
  declarations: [    
    AppComponent,    
    HomeComponent, CategoriesComponent, BuyerBasketComponent, BuyerProfileComponent, BuyerRegistrationComponent, DedliveryAddressesComponent, SubProductGroupsComponent, ProductDetailsComponent, LeftNavMenuComponent, BuyerSettingsComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,        
    FormsModule,
    NgbModule,
    RouterModule.forRoot(appRoutes, { onSameUrlNavigation: "reload", useHash: true, relativeLinkResolution: 'legacy' }),
    HttpClientModule,
    AppRoutingModule,        
    BrowserAnimationsModule,  
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatCarouselModule.forRoot(),
    CarouselModule,
    FontAwesomeModule,
    MatFormFieldModule,  
    MatSelectModule,
    NgxSpinnerModule,
    MatInputModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMomentDateModule,
    MatRadioModule,    
    BarcodeScannerLivestreamModule,
    ZXingScannerModule,
    NgxMaskModule.forRoot(maskConfig)
  ],
  providers: [AppGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
