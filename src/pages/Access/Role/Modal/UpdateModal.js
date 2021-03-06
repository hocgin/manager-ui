import React, { PureComponent } from 'react';
import { Button, Form, Input, message, Modal, Steps, TreeSelect } from 'antd';
import { connect } from 'dva';
import * as LangKit from '../../../../utils/LangKit';

/**
 * 更新弹窗
 * - visible 是否可见
 * - onCancel 取消时触发
 * - onDone 完成时触发
 */
@connect(({ resource, role, loading }) => {
    return {
        allResource: resource.all,
        detail: role.detail,
    };
})
@Form.create()
export default class UpdateModal extends PureComponent {
    state = {
        // 当前步骤
        step: 0,
        // 待提交的值
        formVals: {},
    };
    formLayout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 13 },
    };

    constructor(props) {
        super(props);
    }

    /**
     * @组件挂载后
     */
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'role/detail',
            payload: {
                id: this.props.id,
            },
        });
        dispatch({
            type: 'resource/selectAll',
        });
    }

    /**
     * 渲染步骤内容
     */
    renderSteps = () => {
        const { step } = this.state;
        const { form, detail } = this.props;
        const that = this;

        // 上一页
        const onPrevious = () => {
                that.setState({
                    step: step - 1,
                });
            },
            // 下一页 & 完成
            onNextAndDone = () => {
                const { dispatch, form } = that.props;
                form.validateFields((err, fieldsValue) => {
                    if (err) return;
                    const formVals = { ...that.state.formVals, ...fieldsValue };
                    that.setState({ formVals }, () => {
                        if (step + 1 < that.renderSteps().length) {
                            that.setState({
                                step: step + 1,
                            });
                        } else {
                            dispatch({
                                type: 'role/updateOne',
                                payload: {
                                    id: that.props.id,
                                    body: formVals,
                                },
                                callback: () => {
                                    console.log('提交数据', formVals);
                                    message.success('提交成功');
                                    form.resetFields();
                                    that.props.onDone();
                                },
                            });
                        }
                    });
                });
            },
            // 取消
            onCancel = that.props.onCancel;
        const previousBtn = (
                <Button
                    key="previous"
                    htmlType="button"
                    style={{ float: 'left' }}
                    onClick={onPrevious}
                >
                    上一步
                </Button>
            ),
            nextBtn = (
                <Button key="next" type="primary" htmlType="button" onClick={onNextAndDone}>
                    下一步
                </Button>
            ),
            cancelBtn = (
                <Button key="cancel" htmlType="button" onClick={onCancel}>
                    取消
                </Button>
            ),
            doneBtn = (
                <Button key="submit" htmlType="button" type="primary" onClick={onNextAndDone}>
                    完成
                </Button>
            );

        return [
            {
                content() {
                    return [
                        <Form.Item key={0} {...that.formLayout} label="角色名称" hasFeedback>
                            {form.getFieldDecorator('name', {
                                initialValue: detail.name,
                                rules: [{ required: true, message: '请输入角色名称' }],
                            })(<Input style={{ width: '100%' }} />)}
                        </Form.Item>,
                        <Form.Item
                            key={1}
                            {...that.formLayout}
                            label="角色标识"
                            hasFeedback
                            extra={'请使用"ROLE_"开头的大写字符'}
                        >
                            {form.getFieldDecorator('mark', {
                                initialValue: detail.mark,
                                rules: [{ required: true, message: '请输入角色唯一标识' }],
                            })(<Input style={{ width: '100%' }} />)}
                        </Form.Item>,
                        <Form.Item key={2} {...that.formLayout} label="角色描述" hasFeedback>
                            {form.getFieldDecorator('description', {
                                initialValue: detail.description,
                            })(
                                <Input.TextArea
                                    autosize={{ minRows: 3, maxRows: 6 }}
                                    style={{ width: '100%' }}
                                />
                            )}
                        </Form.Item>,
                    ];
                },
                footer() {
                    return [cancelBtn, nextBtn];
                },
            },
            {
                content() {
                    const { allResource } = that.props;
                    const resourceId = (detail.resources || []).map(resource => {
                        return resource.id;
                    });
                    const treeData = LangKit.toAntTreeData([LangKit.buildTree2(allResource)]);
                    console.log('resourceId', resourceId);
                    console.log('treeData', treeData);
                    return [
                        <Form.Item key={0} {...that.formLayout} label="分配资源">
                            {form.getFieldDecorator('resources', {
                                initialValue: resourceId,
                            })(
                                <TreeSelect
                                    treeCheckable
                                    treeData={treeData}
                                    searchPlaceholder="请选择赋予角色资源权限"
                                    style={{ width: '100%' }}
                                />
                            )}
                        </Form.Item>,
                    ];
                },
                footer() {
                    return [previousBtn, cancelBtn, doneBtn];
                },
            },
        ];
    };

    render() {
        const { visible, onCancel, detail } = this.props;
        const { step } = this.state;
        const Step = this.renderSteps()[step];
        return (
            detail && (
                <Modal
                    width={640}
                    bodyStyle={{ padding: '32px 40px 48px' }}
                    title="更新角色"
                    visible={visible}
                    onCancel={onCancel}
                    footer={Step.footer()}
                >
                    <Steps size="small" current={step} style={{ marginBottom: 28 }}>
                        <Steps.Step title="基本信息" />
                        <Steps.Step title="分配资源" />
                    </Steps>
                    {Step.content()}
                </Modal>
            )
        );
    }
}
