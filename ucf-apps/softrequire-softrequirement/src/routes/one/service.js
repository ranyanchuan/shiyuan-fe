import request from "utils/request";
import { deepClone } from 'utils';

//定义接口地址
const URL = {
    "GET_soft_requirement":  `${GROBAL_HTTP_CTX}` + '/softrequire/softrequirement/list', // 获取主表
    "DEL_soft_requirement":  `${GROBAL_HTTP_CTX}` + '/softrequire/softrequirement/deleAssoVo', // 删除主表
    "SAVE_soft_requirement":  `${GROBAL_HTTP_CTX}` + '/softrequire/softrequirement/saveAssoVo', //保存

    "GET_soft_requirement_entity":  `${GROBAL_HTTP_CTX}` + '/softrequire/softrequiremententity/list', // 获取子表
    "DEL_soft_requirement_entity":  `${GROBAL_HTTP_CTX}` + '/softrequire/softrequiremententity/deleteBatch', // 删除子表

    "GET_USER": `${GROBAL_HTTP_CTX}` + '/softrequire/softrequirement/listForAdd', //保存
    //行过滤
    "GET_LIST_BY_COL": `${GROBAL_HTTP_CTX}` + `/softrequire/softrequirement/distinct`,
}


/**
 * 获取主列表，支持行过滤
 * @param {*} params
 */
export const getsoftrequirement = (param) => {
    let newParam = Object.assign({}, param),
        pageParams = deepClone(newParam.pageParams);

    delete newParam.pageParams;

    return request(URL.GET_soft_requirement, {
        method: "post",
        data: newParam,
        param: pageParams
    });
}

/**
 * 保存
 * @param {*} params
 */
export const savesoftrequirement = (params) => {
    return request(URL.SAVE_soft_requirement, {
        method: "post",
        data:params
    });
}

/**
 * 删除数据
 * @param {*} params
 */
export const delsoftrequirement = (params) => {
    return request(URL.DEL_soft_requirement, {
        method: "post",
        data:params
    });
}

/**
 * 获取子列表 软件购买申请单需求明细
 * @param {*} params
 */
export const getsoftrequiremententity = (param) => {
    let {pageSize,pageIndex,search_billId,...postParam} = param;
    let queryParam = {
        pageIndex: pageIndex,
        pageSize: pageSize
    };

    if(postParam){
        let whereParams = postParam.whereParams || [];
        whereParams.push({
            key: 'billId',
            value: search_billId,
            condition: "EQ"
        });
        postParam.whereParams = whereParams;
    }

    return request(URL.GET_soft_requirement_entity, {
        method: "post",
        data: postParam,
        param: queryParam
    });
}
/**
 * 删除子表数据
 * @param {*} params
 */
export const delsoftrequiremententity = (params) => {
    return request(URL.DEL_soft_requirement_entity, {
        method: "post",
        data:params
    });
}

/**
 * 获取申请人信息
 * @param {*} params
 */
export const getUser = (param) => {
    return request(URL.GET_USER, {
        method: "get",
        param
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