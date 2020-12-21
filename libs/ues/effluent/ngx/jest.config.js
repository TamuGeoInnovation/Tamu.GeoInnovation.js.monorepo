module.exports = {
  name: 'ues-effluent',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/ues/effluent',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
