import { Test } from './';
// This is the JSON way to define React Router rules in a Rekit app.
// Learn more from: http://rekit.js.org/docs/routing.html

export default {
  path: 'deps-manager',
  childRoutes: [
    { path: 'test1', component: Test },
  ],
};
