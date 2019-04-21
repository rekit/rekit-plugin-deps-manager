import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  HOME_CANCEL_CMD_BEGIN,
  HOME_CANCEL_CMD_SUCCESS,
  HOME_CANCEL_CMD_FAILURE,
  HOME_CANCEL_CMD_DISMISS_ERROR,
} from '../../../../src/features/home/redux/constants';

import {
  cancelCmd,
  dismissCancelCmdError,
  reducer,
} from '../../../../src/features/home/redux/cancelCmd';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('home/redux/cancelCmd', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when cancelCmd succeeds', () => {
    const store = mockStore({});

    return store.dispatch(cancelCmd())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_CANCEL_CMD_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_CANCEL_CMD_SUCCESS);
      });
  });

  it('dispatches failure action when cancelCmd fails', () => {
    const store = mockStore({});

    return store.dispatch(cancelCmd({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_CANCEL_CMD_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_CANCEL_CMD_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissCancelCmdError', () => {
    const expectedAction = {
      type: HOME_CANCEL_CMD_DISMISS_ERROR,
    };
    expect(dismissCancelCmdError()).toEqual(expectedAction);
  });

  it('handles action type HOME_CANCEL_CMD_BEGIN correctly', () => {
    const prevState = { cancelCmdPending: false };
    const state = reducer(
      prevState,
      { type: HOME_CANCEL_CMD_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.cancelCmdPending).toBe(true);
  });

  it('handles action type HOME_CANCEL_CMD_SUCCESS correctly', () => {
    const prevState = { cancelCmdPending: true };
    const state = reducer(
      prevState,
      { type: HOME_CANCEL_CMD_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.cancelCmdPending).toBe(false);
  });

  it('handles action type HOME_CANCEL_CMD_FAILURE correctly', () => {
    const prevState = { cancelCmdPending: true };
    const state = reducer(
      prevState,
      { type: HOME_CANCEL_CMD_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.cancelCmdPending).toBe(false);
    expect(state.cancelCmdError).toEqual(expect.anything());
  });

  it('handles action type HOME_CANCEL_CMD_DISMISS_ERROR correctly', () => {
    const prevState = { cancelCmdError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: HOME_CANCEL_CMD_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.cancelCmdError).toBe(null);
  });
});

