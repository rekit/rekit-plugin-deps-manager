import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  HOME_FETCH_DEPS_REMOTE_BEGIN,
  HOME_FETCH_DEPS_REMOTE_SUCCESS,
  HOME_FETCH_DEPS_REMOTE_FAILURE,
  HOME_FETCH_DEPS_REMOTE_DISMISS_ERROR,
} from '../../../../src/features/home/redux/constants';

import {
  fetchDepsRemote,
  dismissFetchDepsRemoteError,
  reducer,
} from '../../../../src/features/home/redux/fetchDepsRemote';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('home/redux/fetchDepsRemote', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when fetchDepsRemote succeeds', () => {
    const store = mockStore({});

    return store.dispatch(fetchDepsRemote())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_FETCH_DEPS_REMOTE_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_FETCH_DEPS_REMOTE_SUCCESS);
      });
  });

  it('dispatches failure action when fetchDepsRemote fails', () => {
    const store = mockStore({});

    return store.dispatch(fetchDepsRemote({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_FETCH_DEPS_REMOTE_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_FETCH_DEPS_REMOTE_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissFetchDepsRemoteError', () => {
    const expectedAction = {
      type: HOME_FETCH_DEPS_REMOTE_DISMISS_ERROR,
    };
    expect(dismissFetchDepsRemoteError()).toEqual(expectedAction);
  });

  it('handles action type HOME_FETCH_DEPS_REMOTE_BEGIN correctly', () => {
    const prevState = { fetchDepsRemotePending: false };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_REMOTE_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsRemotePending).toBe(true);
  });

  it('handles action type HOME_FETCH_DEPS_REMOTE_SUCCESS correctly', () => {
    const prevState = { fetchDepsRemotePending: true };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_REMOTE_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsRemotePending).toBe(false);
  });

  it('handles action type HOME_FETCH_DEPS_REMOTE_FAILURE correctly', () => {
    const prevState = { fetchDepsRemotePending: true };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_REMOTE_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsRemotePending).toBe(false);
    expect(state.fetchDepsRemoteError).toEqual(expect.anything());
  });

  it('handles action type HOME_FETCH_DEPS_REMOTE_DISMISS_ERROR correctly', () => {
    const prevState = { fetchDepsRemoteError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_REMOTE_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsRemoteError).toBe(null);
  });
});

