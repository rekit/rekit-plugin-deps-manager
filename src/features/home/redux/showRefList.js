// Rekit uses a new approach to organizing actions and reducers. That is
// putting related actions and reducers in one file. See more at:
// https://medium.com/@nate_wang/a-new-approach-for-managing-redux-actions-91c26ce8b5da

import {
  HOME_SHOW_REF_LIST,
} from './constants';

export function showRefList(name) {
  return {
    type: HOME_SHOW_REF_LIST,
    data: name,
  };
}

export function reducer(state, action) {
  switch (action.type) {
    case HOME_SHOW_REF_LIST:
      return {
        ...state,
        showRefName: action.data,
      };

    default:
      return state;
  }
}
