import React from 'react';
import { shallow } from 'enzyme';
import { NpmExecutor } from '../../../src/features/home/NpmExecutor';

describe('home/NpmExecutor', () => {
  it('renders node with correct class name', () => {
    const props = {
      home: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <NpmExecutor {...props} />
    );

    expect(
      renderedComponent.find('.home-npm-executor').length
    ).toBe(1);
  });
});
