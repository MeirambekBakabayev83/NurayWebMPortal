import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

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
import { HomeComponent } from './components/home/home.component';
import { MatCarouselModule } from '@ngmodule/material-carousel';
import { CarouselModule } from 'ngx-owl-carousel-o';

polyfill();
enableProdMode();

// определение маршрутов
const appRoutes: Routes =[
  { path: '', pathMatch: 'full', component: HomeComponent},
  { path: 'home', runGuardsAndResolvers: "always", component: HomeComponent,  pathMatch:'full'},   
  { path: '**', redirectTo: '/'}
]

@NgModule({
  declarations: [    
    AppComponent,    
    HomeComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,        
    FormsModule,
    RouterModule.forRoot(appRoutes, {onSameUrlNavigation: "reload", useHash: true}),
    HttpClientModule,
    AppRoutingModule,        
    BrowserAnimationsModule,  
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatCarouselModule.forRoot(),
    CarouselModule
  ],
  providers: [AppGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
