import request from "utils/request";
import { deepClone } from 'utils';

//定义接口地址
const URL = {
    "GET_soft_license_user": `${GROBAL_HTTP_CTX}` + `/lingyong/licenseuser/list`, //通过search_id 查询列表详情
    "SAVE_soft_license_user": `${GROBAL_HTTP_CTX}` + `/lingyong/licenseuser/insertSelective`, //添加
    "UPDATE_soft_license_user": `${GROBAL_HTTP_CTX}` + `/lingyong/licenseuser/updateSelective`, //修改
    "DEL_soft_license_user": `${GROBAL_HTTP_CTX}` + `/lingyong/licenseuser/deleteBatch`,
    "GET_LIST": `${GROBAL_HTTP_CTX}` + `/lingyong/licenseuser/list`, //获取列表
    //行过滤
    "GET_LIST_BY_COL": `${GROBAL_HTTP_CTX}` + `/lingyong/licenseuser/distinct`,
}


/**
 * 通过search_id 查询列表详情
 */
export const getlicenseUser = (param) => {
    return request(URL.GET_soft_license_user, {
        method: "get",
        param
    });
}

/**
 * 删除table数据
 * @param {*} params
 */
export const deletelicenseUser = (params) => {
    return request(URL.DEL_soft_license_user, {
        method: "post",
        data: params
    });
}

/**
 * 添加
 * @param {*} params
 */

export const savelicenseUser = (params) => {
    return request(URL.SAVE_soft_license_user, {
        method: "post",
        data: params
    });
}

/**
 * 修改
 * @param {*} params
 */

export const updatelicenseUser = (params) => {
    return request(URL.UPDATE_soft_license_user, {
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