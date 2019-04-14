import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  HOME_REFRESH_BEGIN,
  HOME_REFRESH_SUCCESS,
  HOME_REFRESH_FAILURE,
  HOME_REFRESH_DISMISS_ERROR,
} from '../../../../src/features/home/redux/constants';

import {
  refresh,
  dismissRefreshError,
  reducer,
} from '../../../../src/features/home/redux/refresh';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('home/redux/refresh', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when refresh succeeds', () => {
    const store = mockStore({});

    return store.dispatch(refresh())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_REFRESH_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_REFRESH_SUCCESS);
      });
  });

  it('dispatches failure action when refresh fails', () => {
    const store = mockStore({});

    return store.dispatch(refresh({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_REFRESH_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_REFRESH_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissRefreshError', () => {
    const expectedAction = {
      type: HOME_REFRESH_DISMISS_ERROR,
    };
    expect(dismissRefreshError()).toEqual(expectedAction);
  });

  it('handles action type HOME_REFRESH_BEGIN correctly', () => {
    const prevState = { refreshPending: false };
    const state = reducer(
      prevState,
      { type: HOME_REFRESH_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.refreshPending).toBe(true);
  });

  it('handles action type HOME_REFRESH_SUCCESS correctly', () => {
    const prevState = { refreshPending: true };
    const state = reducer(
      prevState,
      { type: HOME_REFRESH_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.refreshPending).toBe(false);
  });

  it('handles action type HOME_REFRESH_FAILURE correctly', () => {
    const prevState = { refreshPending: true };
    const state = reducer(
      prevState,
      { type: HOME_REFRESH_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.refreshPending).toBe(false);
    expect(state.refreshError).toEqual(expect.anything());
  });

  it('handles action type HOME_REFRESH_DISMISS_ERROR correctly', () => {
    const prevState = { refreshError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: HOME_REFRESH_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.refreshError).toBe(null);
  });
});

