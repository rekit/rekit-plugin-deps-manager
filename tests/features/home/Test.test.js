import React from 'react';
import { shallow } from 'enzyme';
import { Test } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Test />);
  expect(renderedComponent.find('.home-test').length).toBe(1);
});
