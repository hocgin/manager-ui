import React, {Fragment, PureComponent} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import {
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Dropdown,
    Form,
    Icon,
    Input,
    Menu,
    message,
    Modal,
    Row,
    Select,
    Tree,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import CreateModal from './Modal/CreateModal';

import styles from './Index.less';

const status = () => {
    return [
        {
            status: 'error',
            text: '禁用',
        },
        {
            status: 'success',
            text: '启用',
        },
    ];
};

/* eslint react/no-multi-comp:0 */
@connect(({resource, loading}) => ({
    result: resource.result,
    // data 数据的加载状态
    loading: loading.models.result,
}))
@Form.create()
export default class Index extends PureComponent {
    state = {
        expandForm: false,
        // 选中行的ID
        selectedRows: [],
        // 右键位置
        rightEvent: null,
        rightNode: null
    };

    constructor(props) {
        super(props);

        /**
         * 挂载函数
         */
        [this.methods(), this.rendering(), this.listener()]
            .map(item => {
                return Object.keys(item).map(key => {
                    return item[key];
                });
            })
            .reduce((func1, func2) => {
                return [...func1, ...func2];
            })
            .forEach(func => {
                this[func.name] = func;
            });
    }

    /**
     * @组件挂载后
     */
    componentDidMount() {
        const {dispatch} = this.props;
        dispatch({
            type: 'resource/query',
        });
    }

    render() {
        const {result, dispatch} = this.props;
        const {selectedRows, createModalVisible} = this.state;
        const menu = (
            <Menu onClick={this.onClickMenus} selectedKeys={[]}>
                <Menu.Item key="remove">删除</Menu.Item>
                <Menu.Item key="approval">批量审批</Menu.Item>
            </Menu>
        );

        return (
            <PageHeaderWrapper title="资源管理">
                <Card bordered={false}>
                    <div className={styles.tableList}>
                        {/*搜索层*/}
                        <div className={styles.tableListForm}>{this.renderForm()}</div>
                        {/*工具栏(新建/批量操作)层*/}
                        <div className={styles.tableListOperator}>
                            <Button
                                icon="plus"
                                type="primary"
                                onClick={() => {
                                    this.onShow('createModalVisible');
                                }}
                                htmlType="button">
                                新建
                            </Button>
                            {selectedRows.length > 0 && (<span>
                              <Button onClick={this.onClickBatchDelete} htmlType="button">批量删除</Button>
                              <Dropdown overlay={menu}>
                                <Button htmlType="button">
                                  更多操作 <Icon type="down"/>
                                </Button>
                              </Dropdown>
                            </span>)}
                        </div>
                        <Tree showIcon
                              multiple
                              onSelect={this.onSelectTreeNodeRow}
                              onRightClick={this.onRightClickNode}
                        >
                            {this.renderTreeNode(result)}
                        </Tree>
                    </div>
                </Card>
                <CreateModal
                    visible={createModalVisible}
                    nodes={result}
                    onCancel={() => {
                        this.onHidden('createModalVisible');
                    }}
                    onDone={formVals => {
                        dispatch({
                            type: 'resource/save',
                            payload: formVals,
                            callback: () => {
                                this.onHidden('createModalVisible');
                                message.success('新增成功');
                            },
                        });
                    }}
                />
                {this.renderRightPanel()}
            </PageHeaderWrapper>
        );
    }

    methods() {
        const that = this;
        return {
            getContainer() {
                if (!this.cmContainer) {
                    this.cmContainer = document.createElement('div');
                    document.body.appendChild(this.cmContainer);
                }
                return this.cmContainer;
            }
        };
    }

    rendering() {
        const that = this;
        return {
            /**
             * 渲染节点
             * 节点数据格式:
             * children: (2) [{…}, {…}]
             * depth: 0
             * description: "描述信息"
             * enabled: true
             * icon: "warning"
             * id: "root"
             * lft: 1
             * method: "GET"
             * name: "根"
             * path: "/"
             * rgt: 12
             * type: 0
             * @param nodes
             */
            renderTreeNode(nodes) {
                return (nodes || []).map(node => {
                    return (
                        <Tree.TreeNode
                            disabled={!node.enabled}
                            title={(<span>
                                  {node.name} <span>{node.enabled ? '启用' : '禁用'}</span>
                                </span>)}
                            key={node.id}
                            icon={<Icon type={node.icon}/>}
                        >
                            {node.children && node.children.length ? that.renderTreeNode(node.children) : null}
                        </Tree.TreeNode>
                    );
                });
            },
            /**
             * 根据情况渲染搜索框
             */
            renderForm() {
                const {expandForm} = that.state;
                return expandForm ? that.renderAdvancedForm() : that.renderSimpleForm();
            },
            /**
             * 渲染搜索框展开状态
             */
            renderAdvancedForm() {
                const {
                    form: {getFieldDecorator},
                } = this.props;
                return (
                    <Form onSubmit={that.onClickSearchButton} layout="inline">
                        <Row gutter={{md: 8, lg: 24, xl: 48}}>
                            <Col md={8} sm={24}>
                                <Form.Item label="角色名称">
                                    {getFieldDecorator('name')(<Input placeholder="请输入"/>)}
                                </Form.Item>
                            </Col>
                            <Col md={8} sm={24}>
                                <Form.Item label="使用状态">
                                    {getFieldDecorator('status')(
                                        <Select placeholder="请选择" style={{width: '100%'}}>
                                            {status().map(({status, text}) => {
                                                return (
                                                    <Select.Option key={status} value={status}>
                                                        {text}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col md={8} sm={24}>
                                <Form.Item label="创建日期">
                                    {getFieldDecorator('createdAt')(
                                        <DatePicker style={{width: '100%'}} placeholder="请输入更新日期"/>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row>
                        <div style={{overflow: 'hidden'}}>
                            <div style={{float: 'right', marginBottom: 24}}>
                                <Button type="primary" htmlType="submit">
                                    查询
                                </Button>
                                <Button style={{marginLeft: 8}} onClick={that.handleFormReset}>
                                    重置
                                </Button>
                                <a style={{marginLeft: 8}} onClick={that.onClickToggleSearchMode}>
                                    收起 <Icon type="up"/>
                                </a>
                            </div>
                        </div>
                    </Form>
                );
            },
            /**
             * 渲染搜索框收起状态
             */
            renderSimpleForm() {
                const {
                    form: {getFieldDecorator},
                } = this.props;
                return (
                    <Form onSubmit={that.onClickSearchButton} layout="inline">
                        <Row gutter={{md: 8, lg: 24, xl: 48}}>
                            <Col md={8} sm={24}>
                                <Form.Item label="角色名称">
                                    {getFieldDecorator('name')(<Input placeholder="请输入"/>)}
                                </Form.Item>
                            </Col>
                            <Col md={8} sm={24}>
                                <Form.Item label="使用状态">
                                    {getFieldDecorator('status')(
                                        <Select placeholder="请选择" style={{width: '100%'}}>
                                            {status().map(({status, text}) => {
                                                return (
                                                    <Select.Option key={status} value={status}>
                                                        {text}
                                                    </Select.Option>
                                                );
                                            })}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                            <Col md={8} sm={24}>
                <span className={styles.submitButtons}>
                  <Button type="primary" htmlType="submit">
                    查询
                  </Button>
                  <Button style={{marginLeft: 8}} onClick={that.onClickResetSearch}>
                    重置
                  </Button>
                  <a style={{marginLeft: 8}} onClick={that.onClickToggleSearchMode}>
                    展开 <Icon type="down"/>
                  </a>
                </span>
                            </Col>
                        </Row>
                    </Form>
                );
            },
            /**
             * 渲染树节点菜单
             * @param e
             */
            renderRightPanel() {
                const {rightEvent, rightNode} = that.state;
                if (!rightEvent) {
                    return null;
                }
                console.log('右键菜单', rightNode);
                let {pageX, pageY} = rightEvent;
                const tmpStyle = {
                    position: 'absolute',
                    left: `${pageX}px`,
                    top: `${pageY}px`,
                };
                return (<Menu
                    style={tmpStyle}
                    onMouseLeave={() => {
                        that.setState({rightEvent: null, rightNode: null});
                    }}
                    onClick={this.onClickMenus}
                >
                    <Menu.Item key={rightNode.props.disabled ? 'enable' : 'disable'}>
                        <Icon type="edit"/>
                        {rightNode.props.disabled ? '启用' : '禁用'}
                    </Menu.Item>
                    <Menu.Item key="edit">
                        <Icon type="edit"/>
                        {'修改'}
                    </Menu.Item>
                    <Menu.Item key="appendNode">
                        <Icon type="plus-circle"/>
                        {'加同级'}
                    </Menu.Item>
                    <Menu.Item key="addChild">
                        <Icon type="plus-circle-o"/>
                        {'加下级'}
                    </Menu.Item>
                    <Menu.Item key="deleteGroup">
                        <Icon type="minus-circle-o"/>
                        {'删除目录'}
                    </Menu.Item>
                    <Menu.Item key="deleteOne">
                        <Icon type="minus-circle-o"/>
                        {'仅移除该节点'}
                    </Menu.Item>
                </Menu>);
            },
        };
    }

    listener() {
        const that = this;
        return {
            onShow(key) {
                that.setState({
                    [key]: true,
                });
            },
            onHidden(key) {
                that.setState({
                    [key]: false,
                });
            },
            /**
             * 批量删除
             */
            onClickBatchDelete() {
                const {selectedRows} = that.state;
                const {dispatch} = that.props;
                if (!selectedRows.length) {
                    return;
                }
                Modal.confirm({
                    title: '警告!',
                    content: '该操作将会删除该节点及其子节点, 请谨慎操作。',
                    onOk() {
                        dispatch({
                            type: 'resource/deletes',
                            payload: {
                                id: selectedRows,
                                mode: 0,
                            },
                            callback: () => {
                                message.success('删除成功');
                            },
                        });
                    },
                    onCancel() {
                    },
                });
            },
            /**
             * 菜单点击
             * @param e
             */
            onClickMenus({item, key, keyPath}) {
                const {dispatch} = that.props;
                switch (key) {
                    case 'enable': {

                        break;
                    }
                    case 'disable': {

                        break;
                    }
                    case 'edit': {

                        break;
                    }
                    case 'appendNode': {

                        break;
                    }
                    case 'addChild': {

                        break;
                    }
                    case 'deleteGroup': {
                        const {rightNode} = that.state;
                        Modal.confirm({
                            title: '警告!',
                            content: '该操作将会删除该节点及其子节点, 请谨慎操作。',
                            onOk() {
                                dispatch({
                                    type: 'resource/deletes',
                                    payload: {
                                        id: [rightNode.props.eventKey],
                                        mode: 0,
                                    },
                                    callback: () => {
                                        message.success('删除成功');
                                    },
                                });
                            },
                            onCancel() {
                            },
                        });
                        break;
                    }
                    case 'deleteOne': {
                        const {rightNode} = that.state;
                        Modal.confirm({
                            title: '警告!',
                            content: '该操作将会删除该节点并将其子节点提升到该节点级别, 请谨慎操作。',
                            onOk() {
                                dispatch({
                                    type: 'resource/deletes',
                                    payload: {
                                        id: [rightNode.props.eventKey],
                                        mode: 1,
                                    },
                                    callback: () => {
                                        message.success('删除成功');
                                    },
                                });
                            },
                            onCancel() {
                            },
                        });
                        break;
                    }
                    default:
                        console.log('[ERROR]未定义Key', key);

                }
            },
            /**
             * 选择树节点
             */
            onSelectTreeNodeRow(selectedKeys, e) {
                console.log(selectedKeys);
                that.setState({
                    selectedRows: selectedKeys,
                });
            },
            /**
             * 右键点击节点
             * @param event
             * @param node
             */
            onRightClickNode({event, node}) {
                console.log(event, node);
                const {pageX, pageY} = event;
                that.setState({
                    rightNode: node,
                    rightEvent: {
                        pageX,
                        pageY,
                    },
                });
            },
            /**
             * 处理展开/收起
             */
            onClickToggleSearchMode() {
                const {expandForm} = that.state;
                that.setState({
                    expandForm: !expandForm,
                });
            },
            /**
             * 处理搜索条件重置
             */
            onClickResetSearch() {
                const {form} = that.props;
                form.resetFields();
            },
        };
    }
}
