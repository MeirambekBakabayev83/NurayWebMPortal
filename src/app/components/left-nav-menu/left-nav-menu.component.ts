import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { faBackspace } from '@fortawesome/free-solid-svg-icons';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-left-nav-menu',
  templateUrl: './left-nav-menu.component.html',
  styleUrls: ['./left-nav-menu.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LeftNavMenuComponent implements OnInit {

  faBackspace = faBackspace;

  @Output() onSubmitSubject: Subject<boolean> = new Subject<boolean>();  
  @Output() onRegistrySubject = new EventEmitter<number>();  
  @Output() onDecided = new EventEmitter<number>();

  constructor(public activeModal: NgbActiveModal, private router: Router) { }

  ngOnInit(): void {
  }

  close(){
    this.activeModal.close();
    this.onSubmitSubject.next(true); 
  }

  goToBuyerSetting(){
    this.router.navigate(["buyerSetting"]);
    this.close();
  }

}
