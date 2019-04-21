import {
  HOME_HIDE_OUTPUT,
} from '../../../../src/features/home/redux/constants';

import {
  hideOutput,
  reducer,
} from '../../../../src/features/home/redux/hideOutput';

describe('home/redux/hideOutput', () => {
  it('returns correct action by hideOutput', () => {
    expect(hideOutput()).toHaveProperty('type', HOME_HIDE_OUTPUT);
  });

  it('handles action type HOME_HIDE_OUTPUT correctly', () => {
    const prevState = {};
    const state = reducer(
      prevState,
      { type: HOME_HIDE_OUTPUT }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = {};
    expect(state).toEqual(expectedState);
  });
});
