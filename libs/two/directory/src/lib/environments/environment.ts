// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

export const ACCEPTABLE_EXTS = ['.csv', '.tsv'];
export const FILENAME_REGEXP = /^\d{6,8}\_(SFPr|RFTA|RFAA|RFPr|TFPr|SUSM|DAFo|LCSh|LCGr)\S*(CSIFormat.csv)$/;
export const DIRECTORY_SERVICE = {
  protocol: 'http://',
  host: 'localhost',
  port: 4005,
};
export const VALIDATION_SERVICE = {
  protocol: 'http://',
  host: 'localhost',
  port: 4010,
  validation_route: 'validate',
};
export const UPLOADER_SERVICE = {
  protocol: 'http://',
  host: 'localhost',
  port: 4015,
  upload_route: 'upload/weatherflux',
};
export const LIST_OF_SITE_CODES = "SFPr|RFTA|RFAA|RFPr|TFPr|SUSM|DAFo|LCSh|LCGr";
export const FILENAME = '04212017_SFPr_TEST_CSIFormat.csv';
export const FILES = 'DAFo_Flux_CSIFormat.dat,SUSm_Flux_CSIFormat.dat,RFPr_Flux_CSIFormat.dat,RFTA_Flux_CSIFormat.dat,TFPr_Flux_CSIFormat.dat,RFAA_Flux_CSIFormat.dat,SFPr_Flux_CSIFormat.dat,LCGr_Flux_CSIFormat.dat';
export const SOURCE_DIRECTORY = 'C:\\Upload';
export const WORK_DIRECTORY = 'C:\\Upload\\Work';
export const ARCHIVE_DIRECTORY = 'C:\\Upload\\Archive';