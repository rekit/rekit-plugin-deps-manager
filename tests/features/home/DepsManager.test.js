import React from 'react';
import { shallow } from 'enzyme';
import { DepsManager } from '../../../src/features/home/DepsManager';

describe('home/DepsManager', () => {
  it('renders node with correct class name', () => {
    const props = {
      home: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <DepsManager {...props} />
    );

    expect(
      renderedComponent.find('.home-deps-manager').length
    ).toBe(1);
  });
});
