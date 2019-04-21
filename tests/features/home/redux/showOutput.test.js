import {
  HOME_SHOW_OUTPUT,
} from '../../../../src/features/home/redux/constants';

import {
  showOutput,
  reducer,
} from '../../../../src/features/home/redux/showOutput';

describe('home/redux/showOutput', () => {
  it('returns correct action by showOutput', () => {
    expect(showOutput()).toHaveProperty('type', HOME_SHOW_OUTPUT);
  });

  it('handles action type HOME_SHOW_OUTPUT correctly', () => {
    const prevState = {};
    const state = reducer(
      prevState,
      { type: HOME_SHOW_OUTPUT }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = {};
    expect(state).toEqual(expectedState);
  });
});
