import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { PtyOutput } from 'rs/features/pty';
import { Icon, Modal } from 'antd';
import { hideOutput, cancelCmd } from './redux/actions';
import { clearOutput } from 'rs/features/pty/redux/actions';

export class OutputView extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    running: PropTypes.object,
  };

  handleCancel = () => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure to cancel?',
      okText: 'Yes',
      onOk: () => {
        this.props.actions.clearOutput('manage_package_term');
        this.props.actions.cancelCmd();
      },
    });
  };
  handleClose = () => {
    this.props.actions.hideOutput();
    this.props.actions.clearOutput('manage_package_term');
  };

  render() {
    this.running = this.running || this.props.running;
    const running = this.running || {};
    const actionMap = {
      update: 'Updating',
      uninstall: 'Uninstalling',
    };
    return (
      <div className="plugin-deps-manager_home-output-view">
        <div className="output-content">
          <h6>
            {this.props.running && <Icon type="loading-3-quarters" spin />}
            {actionMap[running.action]} package {running.pkgName}
          </h6>
          <div className="header-buttons">
            {this.props.running && (
              <button type="button" className="btn-cancel" onClick={this.handleCancel}>
                Cancel
              </button>
            )}
            {!this.props.running && (
              <button type="button" className="btn-close" onClick={this.handleClose}>
                Close
              </button>
            )}
          </div>
          <div className="output-container">
            <PtyOutput id="manage_package_term" />
          </div>
        </div>
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    running: state.pluginDepsManager.home.running,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ hideOutput, cancelCmd, clearOutput }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OutputView);
