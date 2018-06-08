// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  fileUploadUrl: "https://rsml00spabackednapi.azurewebsites.net/api/FileUpload/{filename}?code=bUWcAyOAm4ah90anjtbCG4xh8T2MdYlULq9sdZ3e2IUW73H5DsStyg==",
  getPaymentsUrl: "http://localhost:7071/api/GetPayments/{state}?code=bUWcAyOAm4ah90anjtbCG4xh8T2MdYlULq9sdZ3e2IUW73H5DsStyg==",
  // createPaymentUrl: "https://rsml00spabackednapi.azurewebsites.net/api/CreatePayment?code=bUWcAyOAm4ah90anjtbCG4xh8T2MdYlULq9sdZ3e2IUW73H5DsStyg==",
  createPaymentUrl: 'http://localhost:7071/api/CreatePayment',
  imageBlobUrl: "https://rsml00storage.blob.core.windows.net/receipts-md/",
  storeImagesUrl: "https://rsml00storage.blob.core.windows.net/store-logos/"
};
