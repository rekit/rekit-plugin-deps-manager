import DepsManager from '../features/home/DepsManager';


const bottomDrawer = {
  getPanes() {
    return [
      {
        tab: 'Dependencies',
        key: 'dependencies',
        order: 10,
        component: DepsManager,
      },
    ];
  },
};

export default bottomDrawer;
