import React from 'react';
import { connect } from 'dva';
import { Avatar, Card, Divider } from 'antd';
import * as LangKit from '../../../../utils/LangKit';
import DescriptionList from '@/components/DescriptionList';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

const { Description } = DescriptionList;

@connect(
    ({
        staff: { detail },
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
        $fetch: (args = {}) => dispatch({ type: 'staff/fetch', ...args }),
    })
)
export default class Index extends React.Component {
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
                            <Description>
                                <Avatar shape="square" size={55} src={data.avatar} />
                            </Description>
                            <Description term="用户名">{data.username}</Description>
                            <Description term="昵称">{data.nickname}</Description>
                            <Description term="性别">{['女', '男'][data.gender]}</Description>
                            <Description term="过期状态">
                                {data.nonExpired ? '未过期' : '已过期'}
                            </Description>
                            <Description term="锁定状态">
                                {data.nonLocked ? '未锁定' : '锁定中'}
                            </Description>
                            <Description term="启用状态">
                                {data.enabled ? '启用' : '禁用'}
                            </Description>
                            <Description term="创建时间">
                                {LangKit.toUTC(data.createdAt)}
                            </Description>
                            <Description term="更新时间">
                                {LangKit.toUTC(data.updatedAt)}
                            </Description>
                        </DescriptionList>
                        <Divider style={{ marginBottom: 32 }} />
                        <DescriptionList size="large" title="扩展信息" style={{ marginBottom: 32 }}>
                            <Description term="角色列表">
                                {(data.roles || [{ name: '暂未分配' }])
                                    .map(({ name }) => name)
                                    .toString()}
                            </Description>
                        </DescriptionList>
                    </Card>
                </PageHeaderWrapper>
            )
        );
    }
}
