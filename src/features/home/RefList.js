import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import element from 'rs/common/element';

export default class RefList extends Component {
  static propTypes = {
    npmRef: PropTypes.object.isRequired,
    name: PropTypes.string.isRequired,
    showRefList: PropTypes.func.isRequired,
  };

  render() {
    const { name, npmRef, showRefList } = this.props;
    return (
      <div
        className="plugin-deps-manager_home-ref-list"
        ref={node => (this.rootNode = node)}
        onClick={evt => {
          if (evt.target === this.rootNode) showRefList('');
        }}
      >
        <div className="ref-list-content">
          <Icon type="close" onClick={() => showRefList('')} />
          <h6>References to the module: {name}</h6>

          <ul>
            {npmRef[name] &&
              npmRef[name].length &&
              npmRef[name]
                .sort((s1, s2) => s1.localeCompare(s2))
                .map(eleId => (
                  <li key={eleId} onClick={() => element.show(eleId)}>
                    {eleId}
                  </li>
                ))}
            {(!npmRef[name] || !npmRef[name].length) && (
              <li className="no-ref">
                <p>No refrences found.</p>
                <p style={{ color: '#666' }}>
                  Note it doesn't mean the module is not used in the project, maybe it's used as
                  plugins like babel plugins. Or it's not detected by deps manager plugin. You
                  should confirm it yourself before removing a package.
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  }
}
