import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Spin } from 'antd';
import { fetchDeps } from './redux/actions';
import { DepsList } from './';

export class DepsManager extends Component {
  static propTypes = {
    deps: PropTypes.object.isRequired,
    fetchDepsError: PropTypes.object,
    actions: PropTypes.object.isRequired,
  };

  state = {
    outputVisible: false,
  };

  componentDidMount() {
    const { actions } = this.props;
    actions.fetchDeps();
  }

  componentDidUpdate2(prevProps) {
    if (this.props.config.fetchDepsPending) return;
    const depStatus = this.props.config.depStatus;
    const prevDepStatus = prevProps.config.depStatus;
    if (_.values(depStatus).filter(d => d).length < _.values(prevDepStatus).filter(d => d).length) {
      this.refresh();
    }
  }

  handleResize = pos => {
    this.props.actions.setDepsOutputHeight(pos.bottom);
  };

  handleOutputClose = () => {
    this.setState({ outputVisible: false });
  };

  renderLoading() {
    return (
      <div className="deps-manager_home-deps-manager page-loading">
        <Spin /> Loading...
      </div>
    );
  }

  renderToolbar() {
    return <div className="deps-manager-toolbar">aaa</div>;
  }

  renderError() {
    return <div className="deps-manager_home-deps-manager fetch-failed">
        Failed to fetch dependencies. You can try again by restarting Rekit Studio.
      </div>
  }

  render() {
    const { deps, fetchDepsError } = this.props;
    if (fetchDepsError) return this.renderError();
    if (!deps) return this.renderLoading();
    return (
      <div className="deps-manager_home-deps-manager">
        <DepsList />
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state) {
  return {
    deps: state.pluginDepsManager.home.deps,
    fetchDepsError: state.pluginDepsManager.home.fetchDepsError,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ fetchDeps }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DepsManager);
