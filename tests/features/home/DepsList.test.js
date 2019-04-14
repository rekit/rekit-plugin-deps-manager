import React from 'react';
import { shallow } from 'enzyme';
import { DepsList } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<DepsList />);
  expect(renderedComponent.find('.home-deps-list').length).toBe(1);
});
