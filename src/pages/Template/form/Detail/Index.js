import React from 'react';
import { connect } from 'dva';
import { Card, Divider } from 'antd';
import * as LangKit from '../../../../utils/LangKit';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

const { Description } = DescriptionList;

@connect(
    ({
        example: { detail },
        loading,
        routing: {
            location: { query },
        },
    }) => {
        return {
            data: detail,
            id: query.id,
        };
    },
    dispatch => ({
        $fetch: (args = {}) => dispatch({ type: 'example/$fetch', ...args }),
    })
)
export default class Index extends React.Component {
    componentDidMount() {
        const { $fetch, id } = this.props;
        $fetch({
            payload: {
                id,
            },
        });
    }

    render() {
        const {
            route: { name },
            data,
        } = this.props;
        return (
            data && (
                <PageHeaderWrapper title={name}>
                    <Card bordered={false}>
                        <DescriptionList size="large" title="基础信息" style={{ marginBottom: 32 }}>
                            <Description term="名称">{data.name}</Description>
                            <Description term="创建时间">
                                {LangKit.toUTC(data.createdAt)}
                            </Description>
                            <Description term="更新时间">
                                {LangKit.toUTC(data.updatedAt)}
                            </Description>
                        </DescriptionList>
                        <Divider style={{ marginBottom: 32 }} />
                        <DescriptionList
                            size="large"
                            title="扩展信息"
                            style={{ marginBottom: 32 }}
                        />
                    </Card>
                </PageHeaderWrapper>
            )
        );
    }
}
