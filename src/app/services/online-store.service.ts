import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {map} from 'rxjs/operators'; 
import { Subject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ProductGroups } from 'src/app/models/productGroup';

@Injectable({
  providedIn: 'root'
})
export class OnlineStoreService {

  constructor(private http: HttpClient) { }

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

}
