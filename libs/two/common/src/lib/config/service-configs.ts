export const DIRECTORY_SERVICE = {
  protocol: 'http://',
  host: 'localhost',
  port: 4005
};

export const VALIDATION_SERVICE = {
  protocol: 'http://',
  host: 'localhost',
  port: 4010,
  validation_route: 'validate'
};

export const UPLOADER_SERVICE = {
  protocol: 'http://',
  host: 'localhost',
  port: 4015,
  upload_route: 'upload/weatherflux'
};

const EXTENSIONS = {
  CSV: '.csv',
  TSV: '.tsv'
};
export const ACCEPTABLE_EXTS: string[] = [EXTENSIONS.CSV, EXTENSIONS.TSV];
export const LIST_OF_SITE_CODES = 'SFPr|RFTA|RFAA|RFPr|TFPr|SUSM|DAFo|LCSh|LCGr';
export const FILENAME_REGEXP: RegExp = /^\d{6,8}\_(SFPr|RFTA|RFAA|RFPr|TFPr|SUSM|DAFo|LCSh|LCGr)\S*(CSIFormat.csv)$/;
