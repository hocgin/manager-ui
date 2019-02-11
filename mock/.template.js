import { pageWrapper, success } from './util/result';

/**
 * API 相关描述
 */
export default {
    /**
     * 增加
     */
    'POST /example': (req, res) => {
        return res.json(success());
    },
    /**
     * 删除
     */
    'DELETE /example': (req, res) => {
        return res.json(success());
    },
    /**
     * 分页获取
     */
    'GET /example': (req, res) => {
        return res.json(
            success(
                pageWrapper({
                    records: [],
                })
            )
        );
    },
    /**
     * 获取单个
     */
    'GET /example/:uuid': (req, res) => {
        return res.json(success());
    },
};
