import React from 'react';
import { shallow } from 'enzyme';
import { RefList } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<RefList />);
  expect(renderedComponent.find('.home-ref-list').length).toBe(1);
});
