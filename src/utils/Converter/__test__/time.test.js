import moment from 'moment';
import { t } from 'i18n-js';

const {
  transformDatetime,
  timeDifference,
  calcTime,
  getDateFormatString,
} = require('../time');

describe('test time utils, transformDatetime', () => {
  const timeSample = '2020-10-05T08:00:00.000Z';

  test('test transformDatetime', () => {
    let data = {
      time: timeSample,
    };
    transformDatetime(data, ['time']);
    expect(data.time).toEqual(moment(timeSample));
  });

  test('test all case transformDatetime data null', () => {
    transformDatetime();
    let data = {
      time: [''],
    };
    transformDatetime(data, ['time']);
    expect(data.time).toEqual(['']);
    data.time = '';
    transformDatetime(data, ['time']);
    expect(data.time).toEqual('');
  });

  test('test transformDatetime not own property', () => {
    let data = {
      time: timeSample,
    };
    transformDatetime(data, ['timeXXX']);
    expect(data).toEqual({
      time: timeSample,
    });
  });

  test('test transformDatetime array property', () => {
    let data = {
      time: [timeSample],
    };
    let result = [...data.time];
    result = result.map((item) => (item ? moment(item) : item));
    transformDatetime(data, ['time']);
    expect(data.time).toEqual(result);
  });
});

describe('test time utils, timeDifference', () => {
  const _testTime = (current, lastUpdated, result) => {
    const timeString = timeDifference(new Date(current), new Date(lastUpdated));
    expect(timeString).toEqual(result);
  };

  test('test timeDifference seconds ago', () => {
    const current = '2020-10-05T08:00:01.000Z';
    const lastUpdated = '2020-10-05T08:00:00.000Z';
    const result = `1 ${t('seconds_ago')}`;
    _testTime(current, lastUpdated, result);
  });

  test('test timeDifference minutes ago', () => {
    const current = '2020-10-05T08:01:00.000Z';
    const lastUpdated = '2020-10-05T08:00:00.000Z';
    const result = `1 ${t('minutes_ago')}`;
    _testTime(current, lastUpdated, result);
  });

  test('test timeDifference hours ago', () => {
    const current = '2020-10-05T09:00:00.000Z';
    const lastUpdated = '2020-10-05T08:00:00.000Z';
    const result = `1 ${t('hours_ago')}`;
    _testTime(current, lastUpdated, result);
  });

  test('test timeDifference days ago', () => {
    const current = '2020-10-06T08:00:00.000Z';
    const lastUpdated = '2020-10-05T08:00:00.000Z';
    const result = `1 ${t('days_ago')}`;
    _testTime(current, lastUpdated, result);
  });

  test('test timeDifference months ago', () => {
    const current = '2020-11-05T08:00:00.000Z';
    const lastUpdated = '2020-10-05T08:00:00.000Z';
    const result = `1 ${t('months_ago')}`;
    _testTime(current, lastUpdated, result);
  });

  test('test timeDifference years ago', () => {
    const current = '2021-10-05T08:00:00.000Z';
    const lastUpdated = '2020-10-05T08:00:00.000Z';
    const result = `1 ${t('years_ago')}`;
    _testTime(current, lastUpdated, result);
  });
});

describe('test time utils, calcTime', () => {
  const testTime = '2021-01-23T04:34:57.465029Z';
  const inputFormat = 'HH:mm';
  const outputFormat = 'LT, DD/MM/YYYY';
  const result = calcTime(testTime, inputFormat, outputFormat);
  expect(result).toBe(moment(testTime, inputFormat).format(outputFormat));
});

describe('test time utils, getDateFormatString', () => {
  Date.now = jest.fn(() => new Date('2021-07-24T07:46:00.025000Z'));

  const _testTime = (date, expectedResult) => {
    const result = getDateFormatString(date);
    expect(result).toBe(expectedResult);
  };

  test('test return today', () => {
    _testTime(moment(), 'Hôm nay');
  });

  test('test return yesterday', () => {
    _testTime(moment().add(-1, 'days'), 'Hôm qua');
  });

  test('test return this week', () => {
    _testTime(moment().add(-3, 'days'), 'Tuần này');
  });

  test('test return this month', () => {
    _testTime(moment().add(-1, 'weeks'), 'Tháng này');
  });

  test('test return format MM/YYYY', () => {
    _testTime(moment().add(-2, 'month'), '05/2021');
  });
});
