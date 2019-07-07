import request from "utils/request";
import { deepClone } from 'utils';

//定义接口地址
const URL = {
    "GET_soft_baseinfo": `${GROBAL_HTTP_CTX}` + `/wzbasic/softbaseinfo/list`, //通过search_id 查询列表详情
    "SAVE_soft_baseinfo": `${GROBAL_HTTP_CTX}` + `/wzbasic/softbaseinfo/insertSelective`, //添加
    "UPDATE_soft_baseinfo": `${GROBAL_HTTP_CTX}` + `/wzbasic/softbaseinfo/updateSelective`, //修改
    "DEL_soft_baseinfo": `${GROBAL_HTTP_CTX}` + `/wzbasic/softbaseinfo/deleteBatch`,
    "GET_LIST": `${GROBAL_HTTP_CTX}` + `/wzbasic/softbaseinfo/list`, //获取列表
    //行过滤
    "GET_LIST_BY_COL": `${GROBAL_HTTP_CTX}` + `/wzbasic/softbaseinfo/distinct`,
}


/**
 * 通过search_id 查询列表详情
 */
export const getsoftbaseinfo = (param) => {
    return request(URL.GET_soft_baseinfo, {
        method: "get",
        param
    });
}

/**
 * 删除table数据
 * @param {*} params
 */
export const deletesoftbaseinfo = (params) => {
    return request(URL.DEL_soft_baseinfo, {
        method: "post",
        data: params
    });
}

/**
 * 添加
 * @param {*} params
 */

export const savesoftbaseinfo = (params) => {
    return request(URL.SAVE_soft_baseinfo, {
        method: "post",
        data: params
    });
}

/**
 * 修改
 * @param {*} params
 */

export const updatesoftbaseinfo = (params) => {
    return request(URL.UPDATE_soft_baseinfo, {
        method: "post",
        data: params
    });
}

/**
 * 获取列表
 * @param {*} params
 */
export const getList = (param) => {
    let newParam = Object.assign({}, param),
        pageParams = deepClone(newParam.pageParams);

    delete newParam.pageParams;
    return request(URL.GET_LIST, {
        method: "post",
        data: param,
        param: pageParams
    });
}

/**
 * 获取行过滤的下拉数据
 *   @param {*} params
 */
export const getListByCol = (param) => {
    return request(URL.GET_LIST_BY_COL, {
        method: "post",
        data: param
    });
}