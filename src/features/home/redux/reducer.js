// This is the root reducer of the feature. It is used for:
//   1. Load reducers from each action in the feature and process them one by one.
//      Note that this part of code is mainly maintained by Rekit, you usually don't need to edit them.
//   2. Write cross-topic reducers. If a reducer is not bound to some specific action.
//      Then it could be written here.
// Learn more from the introduction of this approach:
// https://medium.com/@nate_wang/a-new-approach-for-managing-redux-actions-91c26ce8b5da.

import initialState from './initialState';
import { reducer as fetchDepsReducer } from './fetchDeps';
import { reducer as refreshReducer } from './refresh';
import { reducer as showRefListReducer } from './showRefList';
import { reducer as updatePackageReducer } from './updatePackage';
import { reducer as showOutputReducer } from './showOutput';
import { reducer as cancelCmdReducer } from './cancelCmd';
import { reducer as hideOutputReducer } from './hideOutput';
import { reducer as removePackageReducer } from './removePackage';

const reducers = [
  fetchDepsReducer,
  refreshReducer,
  showRefListReducer,
  updatePackageReducer,
  showOutputReducer,
  cancelCmdReducer,
  hideOutputReducer,
  removePackageReducer,
];

export default function reducer(state = initialState, action) {
  let newState = state;
  switch (action.type) {
    // Handle cross-topic actions here
    case 'HOME_FETCH_PROJECT_DATA_SUCCESS':
      if (action.data.pluginDepsManager) {
        const running = action.data.pluginDepsManager.running || null;
        newState = {
          ...state,
          running,
          outputVisible: !!running,
        };
      }
      break;
    case 'PLUGIN_DEPS_MANAGER_LATEST_VERSIONS': {
      newState = {
        ...state,
        latestVersions: {
          ...state.latestVersions,
          ...action.data,
        },
      };
      break;
    }
    case 'PLUGIN_DEPS_MANAGER_FETCH_ALL_DEPS_SUCCESS':
      newState = {
        ...state,
        deps: action.data,
      };
      break;
    case 'PLUGIN_DEPS_MANAGER_MANAGE_PACKAGE_EXIT':
      newState = {
        ...state,
        running: null,
      };
      break;
    case 'PLUGIN_DEPS_MANAGER_MANAGE_PACKAGE_STARTED':
      newState = {
        ...state,
        running: action.data,
        outputVisible: true,
      };
      break;

    default:
      newState = state;
      break;
  }
  return reducers.reduce((s, r) => r(s, action), newState);
}
