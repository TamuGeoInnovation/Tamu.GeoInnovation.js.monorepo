module.exports = {
  name: 'ui-kits-ngx-layout',
  preset: '../../../../jest.config.js',
  coverageDirectory: '../../../../coverage/libs/ui-kits/ngx/layout',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
