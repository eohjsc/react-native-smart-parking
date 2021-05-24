import React from 'react';
import { RNCamera } from 'react-native-camera';
import { act, create } from 'react-test-renderer';
import axios from 'axios';
import Routes from '../../../utils/Route';
import SMScanQR from '..';
import { API } from '../../../configs';

const mockedGoBack = jest.fn();
const mockedNavigate = jest.fn();
const mockedDangerouslyGetState = jest.fn();

jest.mock('axios');

jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: mockedNavigate,
      goBack: mockedGoBack,
      dangerouslyGetState: mockedDangerouslyGetState,
    }),
    useIsFocused: jest.fn(),
  };
});

jest.mock('react-native-toast-message');

describe('Test Scan QR', () => {
  beforeEach(() => {
    Date.now = jest.fn(() => new Date('2021-01-24T12:00:00.000Z'));
  });
  afterEach(() => {
    mockedDangerouslyGetState.mockClear();
    mockedNavigate.mockClear();
    axios.get.mockClear();
    axios.post.mockClear();
  });

  test('render Scan QR', async () => {
    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findAllByType(RNCamera);
    expect(RNCam).toHaveLength(1);
  });

  test('onBarCodeRead invalid data cause not a JSON type', async () => {
    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    act(() => {
      const e = { data: 'abc' };
      RNCam.props.onBarCodeRead(e);
    });

    expect(mockedGoBack).toHaveBeenCalled();
  });

  test('onBarCodeRead invalid data cause undefined parking and spot', async () => {
    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    act(() => {
      const e = { data: JSON.stringify({ parking: undefined, id: undefined }) };
      RNCam.props.onBarCodeRead(e);
    });

    expect(mockedGoBack).toHaveBeenCalled();
  });

  test('onBarCodeRead valid data but failed to fetch', async () => {
    const response = {
      status: 400,
      data: {},
    };
    axios.get.mockImplementation(async () => {
      return response;
    });

    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    act(() => {
      const e = { data: JSON.stringify({ parking: 1, id: 1 }) };
      RNCam.props.onBarCodeRead(e);
    });

    expect(axios.get).toHaveBeenCalledWith(API.BOOKING.ACTIVE_SESSION, {});
    expect(mockedGoBack).toHaveBeenCalled();
  });

  test('onBarCodeRead valid data, has active session, then scanToConfirm, then route to MapDashboard', async () => {
    const responseGet = {
      status: 200,
      data: { id: 1 },
    };
    axios.get.mockImplementation(async () => {
      return responseGet;
    });

    let postData = { status: 'booking_activated' };
    const responsePost = {
      status: 200,
      data: postData,
    };
    axios.post.mockImplementation(async () => {
      return responsePost;
    });

    mockedDangerouslyGetState.mockImplementation(() => ({
      routes: [
        { name: 'route 1' },
        { name: Routes.SmartParkingMapDrawer },
        { name: 'route 2' },
      ],
    }));

    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    await act(async () => {
      const e = { data: JSON.stringify({ parking: 1, id: 2 }) };
      await RNCam.props.onBarCodeRead(e);
    });

    expect(axios.get).toHaveBeenCalledWith(API.BOOKING.ACTIVE_SESSION, {});
    expect(axios.post).toHaveBeenCalledWith(API.BOOKING.SCAN_TO_CONFIRM, {
      spot_id: 2,
    });
    expect(mockedNavigate).toHaveBeenCalledWith(Routes.MapDashboard, {
      scanDataResponse: postData,
    });
  });

  test('onBarCodeRead valid data, has active session then scanToConfirm route SmartParkingBookingDetails', async () => {
    const responseGet = {
      status: 200,
      data: { id: 1 },
    };
    axios.get.mockImplementation(async () => {
      return responseGet;
    });

    let postData = { status: 'booking_activated', booking: { id: 1 } };
    const responsePost = {
      status: 200,
      data: postData,
    };
    axios.post.mockImplementation(async () => {
      return responsePost;
    });

    mockedDangerouslyGetState.mockImplementation(() => ({
      routes: [
        { name: 'route 1' },
        { name: Routes.BookingDetail },
        { name: 'route 3' },
      ],
    }));

    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    await act(async () => {
      const e = { data: JSON.stringify({ parking: 1, id: 2 }) };
      await RNCam.props.onBarCodeRead(e);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(
      Routes.SmartParkingBookingDetails,
      {
        scanDataResponse: postData,
        id: 1,
      }
    );
  });

  test('onBarCodeRead valid data, has active session, then scanToConfirm, then route to MyBookingList', async () => {
    const responseGet = {
      status: 200,
      data: { id: 1 },
    };
    axios.get.mockImplementation(async () => {
      return responseGet;
    });

    let postData = { status: 'booking_activated' };
    const responsePost = {
      status: 200,
      data: postData,
    };
    axios.post.mockImplementation(async () => {
      return responsePost;
    });

    mockedDangerouslyGetState.mockImplementation(() => ({
      routes: [
        { name: 'SmartParkingMapDrawer' },
        { name: Routes.MyBookingList },
        { name: 'SmartParkingScanQR' },
      ],
    }));

    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    await act(async () => {
      const e = { data: JSON.stringify({ parking: 1, id: 2 }) };
      await RNCam.props.onBarCodeRead(e);
    });

    expect(mockedNavigate).toHaveBeenCalledWith(Routes.MyBookingList, {
      scanDataResponse: postData,
    });
  });

  test('onBarCodeRead valid data, not active session then scanToBook and canBook ', async () => {
    const responseGet = {
      status: 200,
      data: undefined,
    };
    axios.get.mockImplementation(async () => {
      return responseGet;
    });

    let postData = { spot_id: 1 };
    const responsePost = {
      status: 200,
      canBook: true,
      data: postData,
    };
    axios.post.mockImplementation(async () => {
      return responsePost;
    });

    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    await act(async () => {
      const e = { data: JSON.stringify({ parking: 1, id: 2 }) };
      await RNCam.props.onBarCodeRead(e);
    });

    expect(axios.get).toHaveBeenCalledWith(API.BOOKING.ACTIVE_SESSION, {});
    expect(mockedNavigate).toHaveBeenCalledWith(
      Routes.SmartParkingParkingAreaDetail,
      {
        id: 1,
        spot_id: 2,
      }
    );
  });

  test('onBarCodeRead valid data, not active session then scanToBook and not canBook ', async () => {
    const responseGet = {
      status: 200,
      data: undefined,
    };
    axios.get.mockImplementation(async () => {
      return responseGet;
    });

    let postData = { status: 'parking_nearest' };
    const responsePost = {
      status: 400,
      data: postData,
    };
    axios.post.mockImplementation(async () => {
      return responsePost;
    });

    let tree;
    act(() => {
      tree = create(<SMScanQR />);
    });
    const instance = tree.root;
    const RNCam = instance.findByType(RNCamera);

    await act(async () => {
      const e = { data: JSON.stringify({ parking: 1, id: 2 }) };
      await RNCam.props.onBarCodeRead(e);
    });

    expect(axios.get).toHaveBeenCalledWith(API.BOOKING.ACTIVE_SESSION, {});
    expect(mockedNavigate).toHaveBeenCalledWith(Routes.MapDashboard, {
      scanDataResponse: postData,
    });
  });
});
