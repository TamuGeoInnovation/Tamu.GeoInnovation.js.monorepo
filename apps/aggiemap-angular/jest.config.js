module.exports = {
  name: 'aggiemap-angular',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/aggiemap-angular',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
