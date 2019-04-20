import {
  HOME_SHOW_REF_LIST,
} from '../../../../src/features/home/redux/constants';

import {
  showRefList,
  reducer,
} from '../../../../src/features/home/redux/showRefList';

describe('home/redux/showRefList', () => {
  it('returns correct action by showRefList', () => {
    expect(showRefList()).toHaveProperty('type', HOME_SHOW_REF_LIST);
  });

  it('handles action type HOME_SHOW_REF_LIST correctly', () => {
    const prevState = {};
    const state = reducer(
      prevState,
      { type: HOME_SHOW_REF_LIST }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = {};
    expect(state).toEqual(expectedState);
  });
});
