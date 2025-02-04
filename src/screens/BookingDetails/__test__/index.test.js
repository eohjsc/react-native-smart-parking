import React, { useState } from 'react';
import axios from 'axios';
import { TouchableOpacity } from 'react-native';

import { act, create } from 'react-test-renderer';
import BookingDetails from '../index';
import { API } from '../../../configs';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { t } from 'i18n-js';
import { TESTID, BOOKING_STATUS } from '../../../configs/Constants';
import { AlertAction, ButtonPopup, FullLoading } from '../../../commons';
import { ButtonDrawner } from '../components/ButtonDrawner';
import { ItemPaymentMethod } from '../../BookingConfirm/components/ItemPaymentMethod';
import Routes from '../../../utils/Route';
import ScanningResponsePopup from '../../MapDashboard/components/ScanningResponsePopup';
import ExtendPopup from '../components/ExtendPopup';
import DisplayChecking from '../../../commons/DisplayChecking';
import { SPProvider } from '../../../context';

let mockGoBackGlobal;
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: jest.fn(),
  memo: (x) => x,
  createRef: () => {
    const mockGoBack = jest.fn();
    const mockNavigate = jest.fn();
    mockGoBackGlobal = mockGoBack;
    return {
      current: { navigate: mockNavigate, goBack: mockGoBack },
    };
  },
}));

jest.mock('axios');

const mockNavigateReact = jest.fn();
const mockDangerouslyGetState = jest.fn();
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockNavigateReact,
      dangerouslyGetState: mockDangerouslyGetState,
    }),
    useIsFocused: jest.fn(),
  };
});

const mockSetState = jest.fn();

const componentWithRouteData = (route) => (
  <SPProvider>
    <BookingDetails route={route} />
  </SPProvider>
);

describe('Test BookingDetails', () => {
  let route = {
    params: {
      id: 1,
      isShowExtendNow: false,
      scanDataResponse: {},
    },
  };

  const bookingDetailUrl = API.BOOKING.DETAIL(1);

  const bookingData = {
    arrive_at: moment(new Date('2021-01-20T05:00:00.629Z')),
    billing_id: 1368,
    book_at: moment(new Date('2021-01-20T04:29:00.629Z')),
    confirmed_arrival_at: '2021-02-02T10:23:11Z',
    discount: '0.00',
    extend_at: [moment(new Date('2021-01-20T05:29:00.629Z'))],
    extend_fee: '15000.00',
    grand_total: '30000.00',
    hour_arrive_at: 10,
    hour_leave_at: 11,
    id: 1,
    is_paid: true,
    leave_at: moment(new Date('2021-01-20T05:00:00.629Z')),
    num_of_hour_parking: 1,
    parking_address:
      '2 Nguyễn Bỉnh Khiêm, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh, Việt Nam',
    parking_area: 'Thảo cầm viên parking street',
    parking_id: 3,
    parking_lat: 10.787944,
    parking_lng: 106.7049902,
    pay_at: moment(new Date('2021-01-20T04:30:00.629Z')),
    pay_before: moment(new Date('2021-01-20T05:15:00.629Z')),
    payment_method: 'Visa/Master',
    payment_method_code: 'stripe',
    payment_url:
      "{'zptranstoken': '', 'orderurl': '', 'returncode': -2, 'returnmessage': ''}",
    plate_number: '12A-456.78',
    service_fee: '0.00',
    spot_name: '4444444444',
    start_countdown: true,
    status: BOOKING_STATUS.ON_GOING,
    time_remaining: 4492,
    total: '15000.00',
  };

  beforeEach(() => {
    mockSetState.mockClear();
    useIsFocused.mockClear();
    axios.get.mockClear();
    axios.post.mockClear();
  });

  let wrapper;

  const mockApiDetail = (bookingDetail = { id: 1 }) => {
    useState.mockImplementation((init) => [init, mockSetState]);
    useIsFocused.mockImplementation(() => true);

    let data = {
      ...bookingData,
      ...bookingDetail,
    };

    const response = {
      status: 200,
      data: data,
    };
    axios.get.mockImplementation(async (url) => response);
  };

  const mockInitBookingDetail = (
    bookingDetail = { id: 1 },
    customMethod = null
  ) => {
    const initBookingDetail = { ...bookingData, ...bookingDetail };
    useState.mockImplementation((init) => {
      if (customMethod) {
        const result = customMethod(init);
        if (result) {
          return result;
        }
      }
      if (typeof init === 'object' && init !== null && 'extend_at' in init) {
        return [initBookingDetail, mockSetState];
      }
      return [init, mockSetState];
    });
  };

  test('render BookingDetails', async () => {
    mockApiDetail();
    const state = {
      routes: [
        { name: 'SmartParkingMapDrawer' },
        { name: 'MyBookingList' },
        { name: 'SmartParkingBookingDetails', params: { id: 111 } },
      ],
    };
    mockDangerouslyGetState.mockReturnValueOnce(state);

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    expect(axios.get).toHaveBeenCalledWith(bookingDetailUrl, {});
    const instance = wrapper.root;

    const headerUnit = instance.find(
      (el) => el.props.testID === TESTID.HEADER_BOOKING_DETAILS
    );
    expect(headerUnit).toBeDefined();
    act(() => {
      headerUnit.props.onBack();
    });
    expect(mockGoBackGlobal).toHaveBeenCalled();
  });

  test('render BookingDetails when go from booking success', async () => {
    mockApiDetail();
    const state = {
      routes: [
        { name: 'SmartParkingMapDrawer' },
        { name: 'SmartParkingParkingAreaDetail', params: { id: 1 } },
        {
          name: 'SmartParkingBookingConfirm',
          params: { body: {}, item: {}, methodItem: {} },
        },
        {
          name: 'ProcessPayment',
          params: { billingId: 2145, handleSuccess: jest.fn() },
        },
        {
          name: 'SmartParkingBookingSuccess',
          params: { billing: {}, booking: {} },
        },
        { name: 'SmartParkingBookingDetails', params: { id: 2 } },
      ],
    };
    mockDangerouslyGetState.mockReturnValueOnce(state);

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;
    const headerUnit = instance.find(
      (el) => el.props.testID === TESTID.HEADER_BOOKING_DETAILS
    );
    expect(headerUnit).toBeDefined();
    act(() => {
      headerUnit.props.onBack();
    });
    expect(mockNavigateReact).toHaveBeenCalled();
  });

  test('render active BookingDetails will call setTimeout for fetching detail', async () => {
    mockApiDetail();
    jest.useFakeTimers();

    mockInitBookingDetail();

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });

    expect(axios.get).toHaveBeenCalledTimes(1);
    await act(async () => {
      jest.runAllTimers();
    });

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenNthCalledWith(2, bookingDetailUrl, {});
  });

  test('render completed BookingDetails will not refresh detail', async () => {
    mockApiDetail({
      start_countdown: false,
    });
    jest.useFakeTimers();

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });

    expect(axios.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.runAllTimers();
    });
    expect(axios.get).toHaveBeenCalledTimes(1); // no more called
  });

  test('on user press stop booking', async () => {
    mockApiDetail();
    const mockSetStateAlertStop = jest.fn();
    mockInitBookingDetail({}, (init) => {
      if (
        typeof init === 'object' &&
        init !== null &&
        'leftButton' in init &&
        'rightButton' in init
      ) {
        // stateAlertStop
        return [init, mockSetStateAlertStop];
      }
    });

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });

    const instance = wrapper.root;

    const stopButton = instance.find(
      (el) =>
        el.props.testID === TESTID.BOTTOM_VIEW_SECONDARY &&
        el.type === TouchableOpacity
    );

    expect(mockSetStateAlertStop).toHaveBeenCalledTimes(0);
    mockSetStateAlertStop.mockImplementationOnce((func) => {
      func();
    });
    await act(async () => {
      stopButton.props.onPress();
    });

    expect(mockSetStateAlertStop).toHaveBeenCalledTimes(1);
  });
  test('on user press cancel booking', async () => {
    mockApiDetail();
    const mockSetStateAlertCancel = jest.fn();
    mockInitBookingDetail({}, (init) => {
      if (
        typeof init === 'object' &&
        init !== null &&
        'leftButton' in init &&
        'rightButton' in init
      ) {
        // stateAlertCancel
        init.rightButton = t('yes_cancel');
        init.visible = true;
        return [init, mockSetStateAlertCancel];
      }
    });

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const cancelButton = instance.find(
      (el) =>
        el.props.testID ===
          `${TESTID.PREFIX.ALERT_CANCEL}${TESTID.VIEW_BUTTON_BOTTOM_RIGHT_BUTTON}` &&
        el.type === TouchableOpacity
    );

    expect(mockSetStateAlertCancel).toHaveBeenCalledTimes(0);
    await act(async () => {
      cancelButton.props.onPress();
    });

    expect(axios.post).toHaveBeenCalledWith(API.BOOKING.CANCEL(1));
  });

  test('render cancelled booking', async () => {
    mockInitBookingDetail({
      city: {},
      status: BOOKING_STATUS.CANCELLED,
    });

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const textStatus = instance.find(
      (el) => el.props.testID === TESTID.BOOKING_DETAIL_TEST_STATUS
    );
    expect(textStatus.children[0].props.children).toEqual(t('Cancelled'));
  });

  test('render wait for confirm booking', async () => {
    mockInitBookingDetail({
      city: {},
      status: BOOKING_STATUS.ON_GOING,
      is_paid: true,
      confirmed_arrival_at: null,
    });

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const buttons = instance.findAllByType(ButtonDrawner);
    expect(buttons).toHaveLength(1);

    const button = buttons[0];
    expect(button.props.mainTitle).toEqual(t('scan_qr'));
  });

  test('press pay fine for violated booking', async () => {
    mockInitBookingDetail({
      is_violated: true,
      is_paid: false,
      city: {},
    });

    const modifiedRoute = {
      ...route,
      params: {
        ...route.params,
        methodItem: {
          last4: '1234',
          id: 'id_xxx',
        },
      },
    };

    await act(async () => {
      wrapper = await create(componentWithRouteData(modifiedRoute));
    });
    const instance = wrapper.root;

    const bottomPanels = instance.findAllByType(ButtonDrawner);
    expect(bottomPanels).toHaveLength(1);

    const bottomPanel = bottomPanels[0];
    expect(bottomPanel.props.secondaryTitle).toEqual(t('pay_a_fine'));
    act(() => {
      bottomPanel.props.onPressSecondary();
    });
    expect(axios.post).toBeCalledWith(API.BOOKING.PAY_FINE(1), {
      payment_method: 'stripe',
      payment_card_id: 'id_xxx',
    });
  });

  test('render violated booking with select payment method', async () => {
    mockInitBookingDetail({
      is_violated: true,
      is_paid: false,
      city: {},
    });

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const itemPaymentMethods = instance.findAllByType(ItemPaymentMethod);
    expect(itemPaymentMethods).toHaveLength(1);

    const itemPaymentMethod = itemPaymentMethods[0];

    const { navigate } = useNavigation();
    navigate.mockClear();

    act(() => {
      itemPaymentMethod.props.onPressChange();
    });
    expect(navigate).toBeCalledWith(Routes.SmartParkingSelectPaymentMethod, {
      routeName: Routes.SmartParkingBookingDetails,
      routeData: route.params,
    });
  });

  test('render FullLoading', async () => {
    mockApiDetail();
    useState.mockImplementation((init) => [init, mockSetState]);
    useIsFocused.mockImplementation(() => true);

    let data = {
      ...bookingData,
    };

    const response = {
      status: 200,
      data,
    };
    axios.get.mockImplementation(async (url) => {
      return response;
    });
    jest.useFakeTimers();
    jest.runOnlyPendingTimers();
    act(() => {
      wrapper = create(componentWithRouteData(route));
    });
    const instance = wrapper.root;
    const FullLoadingElement = instance.findAllByType(FullLoading);
    expect(FullLoadingElement).toHaveLength(1);
  });

  test('press close popup payment success', async () => {
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [false, mockSetState]);
    useState.mockImplementationOnce((init) => [
      {
        id: 1,
        extend_at: [],
      },
      mockSetState,
    ]);
    useState.mockImplementation((init) => [init, mockSetState]);

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const buttonPopups = instance.findAllByType(ButtonPopup);
    expect(buttonPopups[1].props.visible).toBeFalsy();
    await act(async () => {
      buttonPopups[1].props.onPressMain();
    });
    expect(buttonPopups[1].props.visible).toBeFalsy();
  });

  test('render BookingDetails with scan active', async () => {
    const setScanResponse = jest.fn();
    useState.mockImplementationOnce((init) => [init, setScanResponse]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [false, mockSetState]);
    useState.mockImplementationOnce((init) => [
      {
        id: 1,
        extend_at: [],
      },
      mockSetState,
    ]);
    useState.mockImplementation((init) => [init, mockSetState]);
    route = {
      params: {
        id: 1,
        isShowExtendNow: false,
        scanDataResponse: true,
      },
    };
    await act(async () => {
      wrapper = await create(
        componentWithRouteData({
          params: { ...route.params, scanDataResponse: true },
        })
      );
    });
    expect(setScanResponse).toHaveBeenCalledWith(true);

    const popup = wrapper.root.findByType(ScanningResponsePopup);
    await act(async () => {
      popup.props.hideModal();
    });
    expect(setScanResponse).toHaveBeenCalledWith(false);
  });

  test('render BookingDetails with extend active', async () => {
    const setExtendState = jest.fn();
    const setExtendCheckingState = jest.fn();
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [false, mockSetState]);
    useState.mockImplementationOnce((init) => [
      {
        id: 1,
        extend_at: [],
      },
      mockSetState,
    ]);
    useState.mockImplementationOnce((init) => [init, setExtendState]); // extend state
    useState.mockImplementationOnce((init) => [init, setExtendCheckingState]); // extend checking state

    mockApiDetail();
    jest.useFakeTimers();

    await act(async () => {
      wrapper = await create(
        componentWithRouteData({
          params: { ...route.params, isShowExtendNow: true },
        })
      );
    });

    expect(setExtendState).toHaveBeenCalledTimes(0);
    await act(async () => {
      jest.runOnlyPendingTimers();
    });
    expect(setExtendState).toHaveBeenCalledWith(true);

    const popup = wrapper.root.findByType(ExtendPopup);
    act(() => {
      popup.props.onClose();
    });
    expect(setExtendState).toHaveBeenCalledWith(false);

    axios.post.mockClear();
    axios.post.mockImplementationOnce(async () => ({ status: 200, data: {} }));
    act(() => {
      popup.props.onExtend(() => {});
    });
    expect(axios.post).toBeCalled();

    const checkinPopup = wrapper.root.findByType(DisplayChecking);
    act(() => {
      checkinPopup.props.onClose();
    });
    expect(setExtendCheckingState).toHaveBeenCalledWith(false);
  });

  test('press close popup booking cancel', async () => {
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [false, mockSetState]);
    useState.mockImplementationOnce((init) => [
      {
        id: 1,
        extend_at: [],
      },
      mockSetState,
    ]);
    useState.mockImplementation((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [{}, mockSetState]);

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const buttonPopups = instance.findAllByType(AlertAction);

    expect(buttonPopups).toHaveLength(2);

    mockSetState.mockClear();
    await act(async () => {
      buttonPopups[0].props.hideModal();
    });
    expect(mockSetState).toBeCalledWith({
      leftButton: 'Không',
      message: '',
      rightButton: '',
      title: '',
      visible: false,
    });
  });

  test('press show popup booking cancel', async () => {
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [init, mockSetState]);
    useState.mockImplementationOnce((init) => [false, mockSetState]);
    useState.mockImplementationOnce((init) => [
      {
        ...init,
        id: 1,
        extend_at: [],
        status: BOOKING_STATUS.ON_GOING,
      },
      mockSetState,
    ]);
    useState.mockImplementation((init) => [init, mockSetState]);

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const buttonPopups = instance.findAllByType(ButtonDrawner);

    mockSetState.mockClear();
    let calledFunc = null;
    mockSetState.mockImplementationOnce((func) => {
      func();
      calledFunc = func;
    });
    await act(async () => {
      buttonPopups[0].props.onPressSecondary();
    });
    expect(calledFunc).not.toBeNull();
    expect(mockSetState).toBeCalledWith(calledFunc);
  });

  test('render completed booking', async () => {
    mockInitBookingDetail({
      city: {},
      status: BOOKING_STATUS.COMPLETED,
    });

    await act(async () => {
      wrapper = await create(componentWithRouteData(route));
    });
    const instance = wrapper.root;

    const buttons = instance.findAllByType(ButtonDrawner);
    expect(buttons).toHaveLength(1);

    const button = buttons[0];
    expect(button.props.mainTitle).toEqual(t('rebook'));
  });
});
