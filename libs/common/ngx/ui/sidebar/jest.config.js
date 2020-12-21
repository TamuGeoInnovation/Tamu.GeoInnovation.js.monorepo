module.exports = {
  name: 'common-ngx-ui-sidebar',
  preset: '../../../../../jest.config.js',
  coverageDirectory: '../../../../../coverage/libs/common/ngx/ui/sidebar',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
