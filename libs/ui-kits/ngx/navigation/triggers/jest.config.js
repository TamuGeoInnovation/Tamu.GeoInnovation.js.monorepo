module.exports = {
  name: 'ui-kits-ngx-navigation-triggers',
  preset: '../../../../../jest.config.js',
  coverageDirectory: '../../../../../coverage/libs/ui-kits/ngx/navigation/triggers',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
