import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  HOME_FETCH_DEPS_BEGIN,
  HOME_FETCH_DEPS_SUCCESS,
  HOME_FETCH_DEPS_FAILURE,
  HOME_FETCH_DEPS_DISMISS_ERROR,
} from '../../../../src/features/home/redux/constants';

import {
  fetchDeps,
  dismissFetchDepsError,
  reducer,
} from '../../../../src/features/home/redux/fetchDeps';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('home/redux/fetchDeps', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when fetchDeps succeeds', () => {
    const store = mockStore({});

    return store.dispatch(fetchDeps())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_FETCH_DEPS_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_FETCH_DEPS_SUCCESS);
      });
  });

  it('dispatches failure action when fetchDeps fails', () => {
    const store = mockStore({});

    return store.dispatch(fetchDeps({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_FETCH_DEPS_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_FETCH_DEPS_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissFetchDepsError', () => {
    const expectedAction = {
      type: HOME_FETCH_DEPS_DISMISS_ERROR,
    };
    expect(dismissFetchDepsError()).toEqual(expectedAction);
  });

  it('handles action type HOME_FETCH_DEPS_BEGIN correctly', () => {
    const prevState = { fetchDepsPending: false };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsPending).toBe(true);
  });

  it('handles action type HOME_FETCH_DEPS_SUCCESS correctly', () => {
    const prevState = { fetchDepsPending: true };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsPending).toBe(false);
  });

  it('handles action type HOME_FETCH_DEPS_FAILURE correctly', () => {
    const prevState = { fetchDepsPending: true };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsPending).toBe(false);
    expect(state.fetchDepsError).toEqual(expect.anything());
  });

  it('handles action type HOME_FETCH_DEPS_DISMISS_ERROR correctly', () => {
    const prevState = { fetchDepsError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: HOME_FETCH_DEPS_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.fetchDepsError).toBe(null);
  });
});

