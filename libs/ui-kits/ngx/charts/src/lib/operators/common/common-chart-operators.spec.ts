import { average, categorize, count } from './common-chart-operators';

const input = [
  { test: '1', key: 1 },
  { test: '1', key: 2 },
  { test: '2', key: 3 },
  { test: '3', key: 4 }
];
const categorized = [
  {
    identity: '1',
    items: [
      {
        key: 1,
        test: '1'
      },
      {
        key: 2,
        test: '1'
      }
    ]
  },
  {
    identity: '2',
    items: [
      {
        key: 3,
        test: '2'
      }
    ]
  },
  {
    identity: '3',
    items: [
      {
        key: 4,
        test: '3'
      }
    ]
  }
];

describe('common-chart-operators.categorize', () => {
  it('should run for simple input', () => {
    expect(categorize(input, 'test')).toEqual(categorized);
  });
});

describe('common-chart-operators.count', () => {
  it('should run for simple input', () => {
    expect(count(categorized)).toEqual({ data: [2, 1, 1], labels: ['1', '2', '3'] });
  });

  it('should return early for invalid input', () => {
    expect(
      count([
        {
          identity: '1'
        }
      ])
    ).toEqual({ data: [], labels: [] });
  });
});

describe('common-chart-operators.average', () => {
  it('should run for simple input', () => {
    expect(average(categorized, 'key')).toEqual({ data: [1.5, 3, 4], labels: ['1', '2', '3'] });
  });

  it('should return early for invalid input', () => {
    expect(
      average(
        [
          {
            identity: '1'
          }
        ],
        'not_used'
      )
    ).toEqual({ data: [], labels: [] });
  });

  it('should throw an error for non-averagable values', () => {
    expect(() =>
      average(
        [
          {
            identity: '1',
            items: [
              {
                key: 'not_number'
              }
            ]
          }
        ],
        'key'
      )
    ).toThrow(new Error('Averaging property (key) does not exist or is invalid in at least one collection item.'));
  });
});
