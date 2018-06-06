import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit{
  
  title = 'Payments Tracking';
  state = 'approved';
  payments = [];
  rejectedCars = [];
  pendingCars = [];

  constructor(private router: Router, private http: Http) {
    console.log('constructor');
    this.payments = JSON.parse(localStorage.getItem("payments")) || [];
    this.rejectedCars = JSON.parse(localStorage.getItem("rejectedCars")) || [];
    this.pendingCars = JSON.parse(localStorage.getItem("pendingCars")) || [];
    this.baseStoreUrl = environment.storeImagesUrl;
  }
  
  ngOnInit(): void {

    let headers = new Headers();
    
    let options = new RequestOptions({
      headers: headers
    });
    let url = environment.getPaymentsUrl.replace(/\{state\}/, 'approved')
    this.http.get(url)
    .subscribe(
      data => {
        this.payments = data.json();
        localStorage.setItem('payments', JSON.stringify(data.json()));
        console.log(data.json());
      },
      error => {
        this.payments = [];
        localStorage.setItem('payments', "[]");
        console.log(error);
      }
    );
   
  }

  gotoDetail(): void {
    this.router.navigate(['/detail']);
  }


}
