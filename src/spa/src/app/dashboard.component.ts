import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Http, Headers, RequestOptions } from '@angular/http';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  title = 'Payments Tracking';
  state = 'approved';
  payments = [];
  pendingPayments = [];

  baseStoreUrl = '';

  constructor(private router: Router, private http: Http) {
    console.log('constructor');
    this.payments = JSON.parse(localStorage.getItem('payments')) || [];
    this.pendingPayments = JSON.parse(localStorage.getItem('pendingPayments')) || [];
    this.baseStoreUrl = environment.storeImagesUrl;
  }

  ngOnInit(): void {

    const headers = new Headers();

    const options = new RequestOptions({
      headers: headers
    });
    const url = environment.getPaymentsUrl.replace(/\{state\}/, 'complete');
    this.http.get(url)
    .subscribe(
      data => {
        const allPayments = data.json();
        this.payments = allPayments.filter(p => p.state === 'complete');
        this.pendingPayments = allPayments.filter(p => p.state === 'pending');
        localStorage.setItem('payments', JSON.stringify(data.json()));
        localStorage.setItem('pendingPayments', JSON.stringify(data.json()));
        console.log(data.json());
      },
      error => {
        this.payments = [];
        this.pendingPayments = [];
        localStorage.setItem('payments', "[]");
        localStorage.setItem('pendingPayments', "[]");
        console.log(error);
      }
    );
  }

  gotoDetail(): void {
    this.router.navigate(['/detail']);
  }


}
