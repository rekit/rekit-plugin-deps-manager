// This is the root reducer of the feature. It is used for:
//   1. Load reducers from each action in the feature and process them one by one.
//      Note that this part of code is mainly maintained by Rekit, you usually don't need to edit them.
//   2. Write cross-topic reducers. If a reducer is not bound to some specific action.
//      Then it could be written here.
// Learn more from the introduction of this approach:
// https://medium.com/@nate_wang/a-new-approach-for-managing-redux-actions-91c26ce8b5da.

import initialState from './initialState';
import { reducer as fetchDepsRemoteReducer } from './fetchDepsRemote';
import { reducer as fetchDepsReducer } from './fetchDeps';
import { reducer as refreshReducer } from './refresh';

const reducers = [fetchDepsRemoteReducer, fetchDepsReducer, refreshReducer];

export default function reducer(state = initialState, action) {
  let newState = state;
  switch (action.type) {
    // Handle cross-topic actions here
    case 'ON_SOCKET_MESSAGE': {
      if (action.data.type === 'DEPS_PLUGIN_LATEST_VERSION') {
        newState = {
          ...state,
          latestVersions: {
            ...state.latestVersions,
            ...action.data.payload,
          },
        };
      }
      break;
    }
    default:
      newState = state;
      break;
  }
  return reducers.reduce((s, r) => r(s, action), newState);
}
