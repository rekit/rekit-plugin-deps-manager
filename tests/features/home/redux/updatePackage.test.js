import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  HOME_UPDATE_PACKAGE_BEGIN,
  HOME_UPDATE_PACKAGE_SUCCESS,
  HOME_UPDATE_PACKAGE_FAILURE,
  HOME_UPDATE_PACKAGE_DISMISS_ERROR,
} from '../../../../src/features/home/redux/constants';

import {
  updatePackage,
  dismissUpdatePackageError,
  reducer,
} from '../../../../src/features/home/redux/updatePackage';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('home/redux/updatePackage', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when updatePackage succeeds', () => {
    const store = mockStore({});

    return store.dispatch(updatePackage())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_UPDATE_PACKAGE_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_UPDATE_PACKAGE_SUCCESS);
      });
  });

  it('dispatches failure action when updatePackage fails', () => {
    const store = mockStore({});

    return store.dispatch(updatePackage({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_UPDATE_PACKAGE_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_UPDATE_PACKAGE_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissUpdatePackageError', () => {
    const expectedAction = {
      type: HOME_UPDATE_PACKAGE_DISMISS_ERROR,
    };
    expect(dismissUpdatePackageError()).toEqual(expectedAction);
  });

  it('handles action type HOME_UPDATE_PACKAGE_BEGIN correctly', () => {
    const prevState = { updatePackagePending: false };
    const state = reducer(
      prevState,
      { type: HOME_UPDATE_PACKAGE_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.updatePackagePending).toBe(true);
  });

  it('handles action type HOME_UPDATE_PACKAGE_SUCCESS correctly', () => {
    const prevState = { updatePackagePending: true };
    const state = reducer(
      prevState,
      { type: HOME_UPDATE_PACKAGE_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.updatePackagePending).toBe(false);
  });

  it('handles action type HOME_UPDATE_PACKAGE_FAILURE correctly', () => {
    const prevState = { updatePackagePending: true };
    const state = reducer(
      prevState,
      { type: HOME_UPDATE_PACKAGE_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.updatePackagePending).toBe(false);
    expect(state.updatePackageError).toEqual(expect.anything());
  });

  it('handles action type HOME_UPDATE_PACKAGE_DISMISS_ERROR correctly', () => {
    const prevState = { updatePackageError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: HOME_UPDATE_PACKAGE_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.updatePackageError).toBe(null);
  });
});

