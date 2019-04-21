// Rekit uses a new approach to organizing actions and reducers. That is
// putting related actions and reducers in one file. See more at:
// https://medium.com/@nate_wang/a-new-approach-for-managing-redux-actions-91c26ce8b5da

import {
  HOME_HIDE_OUTPUT,
} from './constants';

export function hideOutput() {
  return {
    type: HOME_HIDE_OUTPUT,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case HOME_HIDE_OUTPUT:
      return {
        ...state,
        outputVisible: false,
      };

    default:
      return state;
  }
}
