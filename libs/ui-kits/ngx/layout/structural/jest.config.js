module.exports = {
  name: 'ui-kits-ngx-layout-structural',
  preset: '../../../../../jest.config.js',
  coverageDirectory: '../../../../../coverage/libs/ui-kits/ngx/layout/structural',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
