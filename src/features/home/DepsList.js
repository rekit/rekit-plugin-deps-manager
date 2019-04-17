import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Icon, Input, Table, Spin, Menu, Modal } from 'antd';
import semverDiff from 'semver-diff';
import * as actions from './redux/actions';
// import { getDeps } from '../selectors/depsSelector';
import { createSelector } from 'reselect';

export class DepsList extends Component {
  static propTypes = {
    deps: PropTypes.object.isRequired,
    latestVersions: PropTypes.object.isRequired,
  };

  state = {
    statusFilter: [],
    statusFilterDropdownVisible: false,
    inputValue: '',
    onShowOutput() {},
  };

  getColumns() {
    return [
      {
        dataIndex: 'name',
        title: 'Name',
        render(name) {
          return (
            <a href={`https://www.npmjs.com/package/${name}`} target="_blank">
              {name}
            </a>
          );
        },
      },
      {
        dataIndex: 'requiredVersion',
        title: 'Required',
        width: 110,
      },
      {
        dataIndex: 'installedVersion',
        title: 'Installed',
        width: 110,
      },
      {
        dataIndex: 'status',
        title: 'Latest',
        width: 140,
        filterDropdown: (
          <div className="deps-manager_deps-list-status-filter">
            <Menu
              className="status-filter-menu"
              selectedKeys={this.state.statusFilter}
              multiple
              onSelect={this.handleStatusFilter}
              onDeselect={this.handleStatusFilter}
            >
              <Menu.Item key="null">
                <span className="status-icon status-icon-null" /> Up to date
              </Menu.Item>
              <Menu.Item key="patch">
                <span className="status-icon status-icon-patch" /> Patch update
              </Menu.Item>
              <Menu.Item key="minor">
                <span className="status-icon status-icon-minor" /> Minor update
              </Menu.Item>
              <Menu.Item key="major">
                <span className="status-icon status-icon-major" /> Major update
              </Menu.Item>
            </Menu>
            <div className="filter-footer">
              <Button size="small" type="primary" onClick={this.handleApplyStatusFilter}>
                Ok
              </Button>
              <Button size="small" onClick={this.handleResetStatusFilter}>
                Reset
              </Button>
            </div>
          </div>
        ),
        filterIcon: (
          <Icon
            type="filter"
            style={{ color: this.state.statusFilter.length ? '#03a9f4' : '#aaa' }}
          />
        ),
        filterDropdownVisible: this.state.statusFilterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState({
            statusFilterDropdownVisible: visible,
          });
        },
        render(status, record) {
          return (
            <span className={`status-${record.status}`}>
              {status ? (
                <span className={`status-icon status-icon-${status}`} title={`${status}`} />
              ) : (
                ''
              )}{' '}
              {record.latestVersion || '...'}
            </span>
          );
        },
      },
      {
        dataIndex: 'action',
        title: 'Action',
        width: 100,
        align: 'center',
        render: (__, item) => {
          return (
            <div className="actions">
              <Icon
                type="arrow-up"
                title="Upgrade to the latest version."
                onClick={() => this.handleUpdatePackage(item.name)}
              />
              <Icon
                type="close"
                title="Remove"
                onClick={() => this.handleRemovePackage(item.name)}
              />
            </div>
          );
        },
      },
    ];
  }

  getData = createSelector(
    props => props.deps,
    props => props.latestVersions,
    (props, state) => state.statusFilter,
    (deps, latestVersions, statusFilter) => {
      const allDeps = Object.keys(deps).map(key => {
        try {
          const latestVersion = latestVersions[key];
          const dep = deps[key];
          const status =
            latestVersion && dep.installedVersion !== '--'
              ? semverDiff(dep.installedVersion, latestVersion) + '' // eslint-disable-line
              : '';
          return {
            ...dep,
            name: key,
            latestVersion,
            status,
          };
        } catch (err) {
          return {
            ...deps[key],
            name: key,
            latestVersion: latestVersions[key] || null,
          }
        }
      });
      if (!statusFilter.length) return allDeps;
      return allDeps.filter(d => statusFilter.includes(d.status));
    },
  );

  handleInputChange = evt => {
    this.setState({ inputValue: evt.target.value });
  };

  handleAddPackage = () => {
    if (!this.state.inputValue) return;
    this.props.onShowOutput();
    this.props.actions.installPackage(this.state.inputValue).catch(e => {
      Modal.error({
        title: 'Failed to install package',
        content: 'Please retry or raise an issue on github.com/supnate/rekit',
      });
    });
  };

  handleUpdatePackage = name => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure to update the package to the latest version?',
      okText: 'Yes',
      onOk: () => {
        this.props.onShowOutput();
        this.props.actions.updatePackage(name).catch(e => {
          Modal.error({
            title: 'Failed to update package',
            content: 'Please retry or raise an issue on github.com/supnate/rekit',
          });
        });
      },
    });
  };
  handleRemovePackage = name => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure to remove the package?',
      okText: 'Yes',
      okType: 'danger',
      onOk: () => {
        this.props.onShowOutput();
        this.props.actions.removePackage(name).catch(e => {
          Modal.error({
            title: 'Failed to remote package',
            content: 'Please retry or raise an issue on github.com/supnate/rekit',
          });
        });
      },
    });
  };

  handleStatusFilter = args => {
    this.setState({
      statusFilter: args.selectedKeys,
    });
  };

  handleApplyStatusFilter = () => {
    this.setState({ statusFilterDropdownVisible: false });
  };
  handleResetStatusFilter = () => {
    this.setState({
      statusFilterDropdownVisible: false,
      statusFilter: [],
    });
  };

  handleLoadingIconClick = () => {
    this.props.onShowOutput();
  };

  render() {
    return (
      <div className="deps-manager_home-deps-list">
        <Table
          columns={this.getColumns()}
          dataSource={this.getData(this.props, this.state)}
          size="small"
          pagination={false}
          rowKey="name"
          scroll={{y:true}}
        />
      </div>
    );
  }
}

/* istanbul ignore next */
function mapStateToProps(state, props) {
  return {
    deps: state.pluginDepsManager.home.deps,
    latestVersions: state.pluginDepsManager.home.latestVersions,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({ ...actions }, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DepsList);
