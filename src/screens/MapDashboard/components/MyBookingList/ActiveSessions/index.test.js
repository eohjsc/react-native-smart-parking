import React from 'react';
import renderer, { act } from 'react-test-renderer';
import moment from 'moment';

import ActiveSessions from './index';

describe('Test active session', () => {
  const activeSessions = [
    {
      arrive_at: moment('2021-01-26T07:00:00.025000Z'),
      billing_id: 1127,
      confirmed_arrival_at: null,
      created_at: moment('2021-01-26T06:51:39.791370Z'),
      grand_total: '1200.00',
      id: 1020,
      is_paid: false,
      leave_at: moment('2021-01-26T08:00:00.025000Z'),
      parking: {
        address:
          '2 Võ Oanh, Phường 25, Bình Thạnh, Thành phố Hồ Chí Minh, Việt Nam',
        background: '',
        id: 9,
        lat: 10.8046919,
        lng: 106.7169677,
        name: 'Trường Đại học Giao thông Vận tải TP.HCM',
        parking_charges: [Array],
      },
      payment_method: 'stripe',
      payment_url: '',
      spot: 11,
      spot_name: 'A1',
      start_countdown: false,
      status: '----',
      time_remaining: 3600,
    },
  ];
  let tree;

  test('test create active session with default', () => {
    act(() => {
      tree = renderer.create(
        <ActiveSessions activeSessions={activeSessions} />
      );
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });
  test('test rerender active session with paid but not arrive', () => {
    activeSessions.is_paid = true;
    act(() => {
      tree = renderer.create(
        <ActiveSessions activeSessions={activeSessions} />
      );
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });
  test('test rerender active session with confirm arrival and paid', () => {
    activeSessions.confirmed_arrival_at = moment('2021-01-26T07:00:00.025000Z');
    activeSessions.is_paid = true;
    act(() => {
      tree = renderer.create(
        <ActiveSessions activeSessions={activeSessions} />
      );
    });
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
