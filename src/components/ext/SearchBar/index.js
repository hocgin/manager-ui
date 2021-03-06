import React from 'react';
import { Button, Col, Form, Icon, Row } from 'antd';
import * as LangKit from '../../../utils/LangKit';
import styles from './index.less';
import PropTypes from 'prop-types';

@Form.create()
export default class SearchBar extends React.PureComponent {
    static propTypes = {
        children: PropTypes.func,
        onSubmit: PropTypes.func,
    };

    static defaultProps = {
        children: form => {},
        onSubmit: fieldsValue => {},
    };

    state = {
        isExpand: false,
    };

    render() {
        const { children } = this.props;
        const { form } = this.props;
        let { isExpand } = this.state;
        let ele = children(form);
        return (
            <div className={styles.tableListForm}>
                <Form onSubmit={this.onSubmit} layout="inline">
                    {isExpand ? (
                        LangKit.chunk(ele, 3)
                            .map((el, index) => (
                                <Row key={index} gutter={{ md: 8, lg: 24, xl: 48 }}>
                                    {el.map((item, index) => (
                                        <Col key={index} md={8} sm={24}>
                                            {item}
                                        </Col>
                                    ))}
                                </Row>
                            ))
                            .concat(
                                <div key={3} style={{ overflow: 'hidden' }}>
                                    <div style={{ float: 'right', marginBottom: 24 }}>
                                        <Button type="primary" htmlType="submit">
                                            查询
                                        </Button>
                                        <Button
                                            htmlType="button"
                                            style={{ marginLeft: 8 }}
                                            onClick={this.onReset}
                                        >
                                            重置
                                        </Button>
                                        <a
                                            style={{ marginLeft: 8 }}
                                            onClick={this.onClickToggleExpand}
                                        >
                                            收起 <Icon type="up" />
                                        </a>
                                    </div>
                                </div>
                            )
                    ) : (
                        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                            {LangKit.slice(ele, 2)
                                .map((item, index) => (
                                    <Col key={index} md={8} sm={24}>
                                        {item}
                                    </Col>
                                ))
                                .concat(
                                    <Col key={ele.length + 1} md={8} sm={24}>
                                        <span className={styles.submitButtons}>
                                            <Button type="primary" htmlType="submit">
                                                查询
                                            </Button>
                                            <Button
                                                htmlType="button"
                                                style={{ marginLeft: 8 }}
                                                onClick={this.onReset}
                                            >
                                                重置
                                            </Button>
                                            <a
                                                style={{ marginLeft: 8 }}
                                                onClick={this.onClickToggleExpand}
                                            >
                                                展开 <Icon type="down" />
                                            </a>
                                        </span>
                                    </Col>
                                )}
                        </Row>
                    )}
                </Form>
            </div>
        );
    }

    /**
     * 提交数据
     * - 仅校验通过的会触发上层函数
     * @param e
     */
    onSubmit = e => {
        e.preventDefault();
        const { form, onSubmit } = this.props;
        form.validateFields((err, fieldsValue) => {
            if (err) return;
            onSubmit(fieldsValue);
        });
    };
    /**
     * 重置输入框
     */
    onReset = () => {
        const { form } = this.props;
        form.resetFields();
    };

    /**
     * 切换展开状态
     */
    onClickToggleExpand = () => {
        this.setState(({ isExpand }) => ({
            isExpand: !isExpand,
        }));
    };
}
