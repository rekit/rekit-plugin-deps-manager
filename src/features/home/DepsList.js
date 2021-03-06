import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, Table, Menu, Modal } from 'antd';
import semverDiff from 'semver-diff';
import { fetchDeps, refresh, showRefList, updatePackage, removePackage } from './redux/actions';
import { createSelector } from 'reselect';
import { RefList, OutputView } from './';
import { clearOutput } from 'rs/features/pty/redux/actions';

export class DepsList extends Component {
  static propTypes = {
    deps: PropTypes.object.isRequired,
    latestVersions: PropTypes.object.isRequired,
    showRefName: PropTypes.string.isRequired,
    running: PropTypes.object,
  };

  static defaultProps = {
    running: null,
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
    const npmRef = allDeps.npmRef;
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
                <Menu.Item key={`${t}_key`}>{_.capitalize(t)} Deps</Menu.Item>
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
              <a href={`https://www.npmjs.com/package/${name}`} target="_blank" rel="noopener noreferrer">
                {name}
              </a>
              {item.type && <span className="dep-type">{item.type}</span>}
              {item.duplicated && item.duplicated.length > 0 && (
                <span className="dup-items">
                  Duplicated in:
                  {item.duplicated.map(d => (
                    <span key={d} className="dup-item">
                      {d}
                    </span>
                  ))}
                </span>
              )}
            </React.Fragment>
          );
        },
      },
      {
        dataIndex: 'refs',
        title: 'Refs',
        align: 'center',
        width: 100,
        render: (_, item) => {
          return (
            <div className="ref-count" onClick={() => this.props.actions.showRefList(item.name)}>
              {npmRef[item.name] ? npmRef[item.name].length : 0}
            </div>
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
        title: (
          <span>
            Latest{' '}
            <Icon
              type="reload"
              spin={_.isEmpty(this.props.latestVersions)}
              onClick={this.handleRefresh}
            />
          </span>
        ),
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
                className="update-in-range"
                title="Update according to the required range."
                onClick={() => this.handleUpdatePackage(item, { inRange: true })}
              />
              <Icon
                type="vertical-right"
                className="update-to-latest"
                title="Update to the latest version."
                onClick={() => this.handleUpdatePackage(item)}
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
    props => props.elementById,
    (props, state) => state.statusFilter,
    (props, state) => state.typeFilter.replace(/_key$/, ''),
    (deps, latestVersions, elementById, statusFilter, typeFilter) => {
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
      // const countMap = _.mapValues(_.groupBy(types, a => a), arr => arr.length);
      // countMap.all = allDeps.length;
      allDeps.types = _.uniq(types);
      // allDeps.typeCountMap = countMap;

      const npmRef = {};
      Object.values(elementById).forEach(ele => {
        if (ele.deps) {
          ele.deps.forEach(dep => {
            if (dep.type !== 'npm') return;
            const arr = dep.id.split('/');
            let depId = arr[0];
            if (arr[0].startsWith('@') && arr.length > 1) depId = depId + '/' + arr[1];
            if (!npmRef[depId]) npmRef[depId] = [];
            if (!npmRef[depId].includes(ele.id)) npmRef[depId].push(ele.id);
          });
        }
      });
      allDeps.npmRef = npmRef;
      if (!statusFilter.length && typeFilter === 'all') return allDeps;
      const filteredAllDeps = allDeps.filter(d => {
        return (
          (statusFilter === 'all' || statusFilter === d.status) &&
          (typeFilter === 'all' || d.type === typeFilter)
        );
      });
      filteredAllDeps.types = allDeps.types;
      filteredAllDeps.npmRef = npmRef;
      // filteredAllDeps.typeCountMap = allDeps.typeCountMap;
      return filteredAllDeps;
    },
  );

  handleRefresh = () => {
    if (_.isEmpty(this.props.latestVersions)) return;
    this.props.actions.refresh();
  };

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

  handleUpdatePackage = (item, args = {}) => {
    Modal.confirm({
      title: 'Confirm',
      content: 'Are you sure to update the package?',
      okText: 'Yes',
      onOk: () => {
        this.props.actions.clearOutput('manage_package_term');
        this.props.actions
          .updatePackage({
            action: args.inRange ? 'update-in-range' : 'update',
            pkgName: item.name,
            version: item.latestVersion || null,
            type: item.type,
          })
          .catch(e => {
            Modal.error({
              title: 'Failed to update package',
              content: 'Please retry or raise an issue on github.com/rekit/rekit',
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
        this.props.actions.clearOutput('manage_package_term');
        this.props.actions.removePackage(name);
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
    const { actions, showRefName } = this.props;
    const data = this.getData(this.props, this.state);
    return (
      <div className="deps-manager_home-deps-list">
        {showRefName && (
          <RefList
            name={showRefName}
            npmRef={data.npmRef || {}}
            showRefList={actions.showRefList}
          />
        )}
        {(this.props.running || this.props.outputVisible) && <OutputView />}
        <Table
          columns={this.getColumns()}
          dataSource={data}
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
    outputVisible: state.pluginDepsManager.home.outputVisible,
    running: state.pluginDepsManager.home.running,
    showRefName: state.pluginDepsManager.home.showRefName,
    latestVersions: state.pluginDepsManager.home.latestVersions,
    elementById: state.home.elementById,
  };
}

/* istanbul ignore next */
function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(
      { fetchDeps, refresh, showRefList, updatePackage, removePackage, clearOutput },
      dispatch,
    ),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DepsList);
