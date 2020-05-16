import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  title = 'NurayWebProject';

  constructor(updates:  SwUpdate) {    
    updates.available.subscribe((event) => {
      updates.activateUpdate().then(() => document.location.reload());    
    });    
  }

  installDesktopApp(){
    alert("SOON!!!");
  }
}
