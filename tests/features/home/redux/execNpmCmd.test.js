import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import nock from 'nock';

import {
  HOME_EXEC_NPM_CMD_BEGIN,
  HOME_EXEC_NPM_CMD_SUCCESS,
  HOME_EXEC_NPM_CMD_FAILURE,
  HOME_EXEC_NPM_CMD_DISMISS_ERROR,
} from '../../../../src/features/home/redux/constants';

import {
  execNpmCmd,
  dismissExecNpmCmdError,
  reducer,
} from '../../../../src/features/home/redux/execNpmCmd';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('home/redux/execNpmCmd', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('dispatches success action when execNpmCmd succeeds', () => {
    const store = mockStore({});

    return store.dispatch(execNpmCmd())
      .then(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_EXEC_NPM_CMD_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_EXEC_NPM_CMD_SUCCESS);
      });
  });

  it('dispatches failure action when execNpmCmd fails', () => {
    const store = mockStore({});

    return store.dispatch(execNpmCmd({ error: true }))
      .catch(() => {
        const actions = store.getActions();
        expect(actions[0]).toHaveProperty('type', HOME_EXEC_NPM_CMD_BEGIN);
        expect(actions[1]).toHaveProperty('type', HOME_EXEC_NPM_CMD_FAILURE);
        expect(actions[1]).toHaveProperty('data.error', expect.anything());
      });
  });

  it('returns correct action by dismissExecNpmCmdError', () => {
    const expectedAction = {
      type: HOME_EXEC_NPM_CMD_DISMISS_ERROR,
    };
    expect(dismissExecNpmCmdError()).toEqual(expectedAction);
  });

  it('handles action type HOME_EXEC_NPM_CMD_BEGIN correctly', () => {
    const prevState = { execNpmCmdPending: false };
    const state = reducer(
      prevState,
      { type: HOME_EXEC_NPM_CMD_BEGIN }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.execNpmCmdPending).toBe(true);
  });

  it('handles action type HOME_EXEC_NPM_CMD_SUCCESS correctly', () => {
    const prevState = { execNpmCmdPending: true };
    const state = reducer(
      prevState,
      { type: HOME_EXEC_NPM_CMD_SUCCESS, data: {} }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.execNpmCmdPending).toBe(false);
  });

  it('handles action type HOME_EXEC_NPM_CMD_FAILURE correctly', () => {
    const prevState = { execNpmCmdPending: true };
    const state = reducer(
      prevState,
      { type: HOME_EXEC_NPM_CMD_FAILURE, data: { error: new Error('some error') } }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.execNpmCmdPending).toBe(false);
    expect(state.execNpmCmdError).toEqual(expect.anything());
  });

  it('handles action type HOME_EXEC_NPM_CMD_DISMISS_ERROR correctly', () => {
    const prevState = { execNpmCmdError: new Error('some error') };
    const state = reducer(
      prevState,
      { type: HOME_EXEC_NPM_CMD_DISMISS_ERROR }
    );
    expect(state).not.toBe(prevState); // should be immutable
    expect(state.execNpmCmdError).toBe(null);
  });
});

