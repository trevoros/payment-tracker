import { NgModule }     from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { PaymentDetailComponent } from './payment-detail.component';

const routes: Routes = [
    { path: '', redirectTo: '/payments', pathMatch: 'full' },
    { path: 'payments', component: DashboardComponent },
    { path: 'detail', component: PaymentDetailComponent }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes)],
    exports: [ RouterModule]
})
export class AppRoutingModule {}
