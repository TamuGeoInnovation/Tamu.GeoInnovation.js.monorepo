import { ExistsPipe } from './exists.pipe';

describe('ExistsPipe', () => {
  it('create an instance', () => {
    const pipe = new ExistsPipe();
    expect(pipe).toBeTruthy();
  });
});
