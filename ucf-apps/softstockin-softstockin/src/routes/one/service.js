import request from "utils/request";
import { deepClone } from 'utils';

//定义接口地址
const URL = {
    "GET_soft_stock_in":  `${GROBAL_HTTP_CTX}` + '/softstockin/softstockin/list', // 获取主表
    "DEL_soft_stock_in":  `${GROBAL_HTTP_CTX}` + '/softstockin/softstockin/deleAssoVo', // 删除主表
    "SAVE_soft_stock_in":  `${GROBAL_HTTP_CTX}` + '/softstockin/softstockin/saveAssoVo', //保存

    "GET_soft_stock_in_entity":  `${GROBAL_HTTP_CTX}` + '/softstockin/softstockinentity/list', // 获取子表
    "DEL_soft_stock_in_entity":  `${GROBAL_HTTP_CTX}` + '/softstockin/softstockinentity/deleteBatch', // 删除子表

    "GET_USER": `${GROBAL_HTTP_CTX}` + '/softstockin/softstockin/listForAdd', //保存
    //行过滤
    "GET_LIST_BY_COL": `${GROBAL_HTTP_CTX}` + `/softstockin/softstockin/distinct`,
}


/**
 * 获取主列表，支持行过滤
 * @param {*} params
 */
export const getsoftstockin = (param) => {
    let newParam = Object.assign({}, param),
        pageParams = deepClone(newParam.pageParams);

    delete newParam.pageParams;

    return request(URL.GET_soft_stock_in, {
        method: "post",
        data: newParam,
        param: pageParams
    });
}

/**
 * 保存
 * @param {*} params
 */
export const savesoftstockin = (params) => {
    return request(URL.SAVE_soft_stock_in, {
        method: "post",
        data:params
    });
}

/**
 * 删除数据
 * @param {*} params
 */
export const delsoftstockin = (params) => {
    return request(URL.DEL_soft_stock_in, {
        method: "post",
        data:params
    });
}

/**
 * 获取子列表 入库登记单详情
 * @param {*} params
 */
export const getsoftstockinentity = (param) => {
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

    return request(URL.GET_soft_stock_in_entity, {
        method: "post",
        data: postParam,
        param: queryParam
    });
}
/**
 * 删除子表数据
 * @param {*} params
 */
export const delsoftstockinentity = (params) => {
    return request(URL.DEL_soft_stock_in_entity, {
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