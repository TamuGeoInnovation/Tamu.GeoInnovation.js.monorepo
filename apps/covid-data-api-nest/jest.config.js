module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/apps/covid-data-api-nest',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } },
  displayName: 'covid-data-api-nest',
};
