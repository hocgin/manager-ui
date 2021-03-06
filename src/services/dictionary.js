import request from '@/utils/request';
/**
 * 列出所有
 */
export async function query(params){
    return request('/api/dictionary');
}
/**
 * 删除
 */
export async function remove(params){
    return request(`/api/dictionary`, {
        method: 'DELETE',
        body: {
            ...params
        },
    });
}

/**
 * 查询单条
 */
export async function fetch(params) {
    return request(`/api/dictionary/1`);
}