module.exports = {
  name: 'aggiemap',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/aggiemap',
  snapshotSerializers: ['jest-preset-angular/AngularSnapshotSerializer.js', 'jest-preset-angular/HTMLCommentSerializer.js']
};
