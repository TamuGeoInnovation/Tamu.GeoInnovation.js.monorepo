module.exports = {
  name: 'common-ngx-ui-notification',
  preset: '../../../../../jest.config.js',
  coverageDirectory: '../../../../../coverage/libs/common/ngx/ui/notification',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
