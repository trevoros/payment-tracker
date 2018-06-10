import { Component, Inject } from "@angular/core";
import { Payment } from "./receipt";
import { Http, Headers, RequestOptions } from "@angular/http";
declare const Buffer;
import * as fs from "fs";
import { environment } from "../environments/environment";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";


import { Router } from "@angular/router";
const shortId = require("shortid");

@Component({
  selector: "app-root",
  templateUrl: "./payment-detail.component.html"
})
export class PaymentDetailComponent {
  title = "Receipt entry";
  image = "assets/noimage.jpg";
  payment: Payment;
  processing = false;

  constructor(private http: Http, public dialog: MatDialog, private router: Router) {
    this.payment = new Payment();
    this.payment.name = "";
    this.payment.image_url = "assets/noimage.jpg";
    this.payment.state = "pending";
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: "400px",
      height: "215px",
      data: { name: this.payment.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("The dialog was closed");
      this.router.navigate(["/dashboard"]);
    });
  }

  executeUpload(base64encoded: string, filename: string) {
    const headers = new Headers();

    const options = new RequestOptions({
      headers: headers
    });
    let data = { filename: `${shortId.generate()}_${filename}`, data: base64encoded };
    let url = environment.fileUploadUrl.replace(/\{filename\}/, data.filename);
    this.http
      .post(encodeURI(url), data, options)
      .subscribe(data => console.log(data), error => console.log(error));
    this.payment.image_url = encodeURI(environment.imageBlobUrl + data.filename);
    this.payment.image_name =  data.filename;
    
    this.image = base64encoded;
    console.log("File encoded");
  }

  upload(list: any) {
    if (list.length <= 0) {
      return;
    }

    let f = list[0];
    let reader = new FileReader();
    let self = this;
    reader.addEventListener(
      "load",
      function() {
        let base64encoded = reader.result;
        self.executeUpload(base64encoded, f.name);
      },
      false
    );

    if (f) {
      reader.readAsDataURL(f);
    }
  }

  submit() {
    this.processing = true;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");

    const options = new RequestOptions({
      headers: headers
    });
    const requestObject = { properties: null, type: "object" };
    requestObject.properties = this.payment;

    console.log(JSON.stringify(this.payment));
    const data = this.payment;
    this.http.post(environment.createPaymentUrl, data, options).subscribe(
      data => {
        console.log(data);
        this.openDialog();
        this.processing = false;
      },
      error => console.log(error)
    );
  }
}

@Component({
  selector: "confirm-dialog",
  template: `
  <h2 mat-dialog-title>Success</h2>
  <mat-dialog-content>
  <p>Thank you for uploading!</p>
  <p>{{data.name}} is waiting for evaluation</p>
  </mat-dialog-content>
  <mat-dialog-actions>
    <button mat-button [mat-dialog-close]="true">Close</button>
  </mat-dialog-actions>
  `
})
export class ConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onClick(): void {
    this.dialogRef.close();
  }
}
