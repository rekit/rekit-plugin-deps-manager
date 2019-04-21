import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  HOME_REMOVE_PACKAGE_BEGIN,
  HOME_REMOVE_PACKAGE_SUCCESS,
  HOME_REMOVE_PACKAGE_FAILURE,
  HOME_REMOVE_PACKAGE_DISMISS_ERROR,
} from '../../../../src/features/home/redux/constants';

import {
  removePackage,
  dismissRemovePackageError,
  reducer,
} from '../../../../src/features/home/redux/removePackage';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('home/redux/removePackage', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when removePackage succeeds', () => {
    const store = mockStore({});

    return store.dispatch(removePackage())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_REMOVE_PACKAGE_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_REMOVE_PACKAGE_SUCCESS);
      });
  });

  it('dispatches failure action when removePackage fails', () => {
    const store = mockStore({});

    return store.dispatch(removePackage({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_REMOVE_PACKAGE_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_REMOVE_PACKAGE_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissRemovePackageError', () => {
    const expectedAction = {
      type: HOME_REMOVE_PACKAGE_DISMISS_ERROR,
    };
    expect(dismissRemovePackageError()).toEqual(expectedAction);
  });

  it('handles action type HOME_REMOVE_PACKAGE_BEGIN correctly', () => {
    const prevState = { removePackagePending: false };
    const state = reducer(
      prevState,
      { type: HOME_REMOVE_PACKAGE_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.removePackagePending).toBe(true);
  });

  it('handles action type HOME_REMOVE_PACKAGE_SUCCESS correctly', () => {
    const prevState = { removePackagePending: true };
    const state = reducer(
      prevState,
      { type: HOME_REMOVE_PACKAGE_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.removePackagePending).toBe(false);
  });

  it('handles action type HOME_REMOVE_PACKAGE_FAILURE correctly', () => {
    const prevState = { removePackagePending: true };
    const state = reducer(
      prevState,
      { type: HOME_REMOVE_PACKAGE_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.removePackagePending).toBe(false);
    expect(state.removePackageError).toEqual(expect.anything());
  });

  it('handles action type HOME_REMOVE_PACKAGE_DISMISS_ERROR correctly', () => {
    const prevState = { removePackageError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: HOME_REMOVE_PACKAGE_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.removePackageError).toBe(null);
  });
});

