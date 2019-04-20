import _ from 'lodash';
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
    statusFilter: 'all',
    statusFilterDropdownVisible: false,
    typeFilter: 'all_key',
    inputValue: '',
    onShowOutput() {},
  };

  getColumns() {
    const allDeps = this.getData(this.props, this.state);
    const allTypes = ['all'].concat(allDeps.types);
    return [
      {
        dataIndex: 'name',
        title: 'Name',
        filterDropdown: (
          <div className="deps-manager_deps-list-type-filter">
            <Menu
              className="filter-menu"
              selectedKeys={[this.state.typeFilter]}
              onSelect={this.handleTypeFilter}
            >
              {allTypes.map(t => (
                <Menu.Item key={`${t}_key`}>
                  {_.capitalize(t)} Deps
                </Menu.Item>
              ))}
            </Menu>
          </div>
        ),
        filterIcon: (
          <Icon
            type="filter"
            style={{ color: this.state.typeFilter !== 'all_key' ? '#03a9f4' : '#aaa' }}
          />
        ),
        filterDropdownVisible: this.state.typeFilterDropdownVisible,
        onFilterDropdownVisibleChange: visible => {
          this.setState({
            typeFilterDropdownVisible: visible,
          });
        },
        render(name, item) {
          return (
            <React.Fragment>
              <a href={`https://www.npmjs.com/package/${name}`} target="_blank">
                {name}
              </a>
              {item.type && <span className="dep-type">{item.type}</span>}
            </React.Fragment>
          );
        },
      },
      {
        dataIndex: 'refs',
        title: 'Refs',
        width: 80,
        render: () => {
          return <span>6</span>;
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
              className="filter-menu"
              selectedKeys={[this.state.statusFilter]}
              onSelect={this.handleStatusFilter}
            >
              <Menu.Item key="all">
                <span className="status-icon status-icon-all" /> All
              </Menu.Item>
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
          </div>
        ),

        filterIcon: (
          <Icon
            type="filter"
            style={{ color: this.state.statusFilter !== 'all' ? '#03a9f4' : '#aaa' }}
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
        width: 80,
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
    (props, state) => state.typeFilter.replace(/_key$/, ''),
    (deps, latestVersions, statusFilter, typeFilter) => {
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
          };
        }
      });
      const types = allDeps.map(d => d.type);
      const countMap = _.mapValues(_.groupBy(types, a => a), arr => arr.length);
      countMap.all = allDeps.length;
      allDeps.types = _.uniq(types);
      allDeps.typeCountMap = countMap;

      if (!statusFilter.length && typeFilter === 'all') return allDeps;
      const filteredAllDeps = allDeps.filter(d => {
        return (
          (statusFilter === 'all' || statusFilter === d.status) &&
          (typeFilter === 'all' || d.type === typeFilter)
        );
      });
      filteredAllDeps.types = allDeps.types;
      filteredAllDeps.typeCountMap = allDeps.typeCountMap;
      return filteredAllDeps;
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
      statusFilter: args.key,
      statusFilterDropdownVisible: false,
    });
  };

  handleTypeFilter = args => {
    console.log('handle type filter: ', args);
    this.setState({
      typeFilter: args.key,
      typeFilterDropdownVisible: false,
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
          scroll={{ y: true }}
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
