import request from "utils/request";
import { deepClone } from 'utils';


//定义接口地址
const URL = {
    "GET_soft_requirement": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequirement/list', // 获取主表
    "SAVE_soft_requirement": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequirement/insertSelective', // 保存主表
    "UPDATE_soft_requirement": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequirement/updateSelective', // 更新主表
    "DEL_soft_requirement": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequirement/deleteBatch', // 删除主表
    "GET_soft_requirement_entity": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequiremententity/list', // 获取子表 紧急联系人
    "SAVE_soft_requirement_entity": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequiremententity/insertSelective', // 保存子表 紧急联系人
    "UPDATE_soft_requirement_entity": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequiremententity/updateSelective', // 修改子表 紧急联系人
    "DEL_soft_requirement_entity": `${GROBAL_HTTP_CTX}` + '/licenseuser/softrequiremententity/deleteBatch', //删除字表 紧急联系人
    "GET_QUERYPRINTTEMPLATEALLOCATE": `/eiap-plus/appResAllocate/queryPrintTemplateAllocate`,  // 查询打印模板
    "PRINTSERVER": '/print_service/print/preview',                                              // 打印
    
    //行过滤
    "GET_LIST_BY_COL": `${GROBAL_HTTP_CTX}` + `/licenseuser/softrequirement/distinct`,
}


export const getsoftrequirementList = (param) => {
    return request(URL.GET_soft_requirement, {
        method: "get",
        param
    });
}
/**
 * 获取主列表
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
 * 保存主表数据
 * @param {*} params
 */
export const savesoftrequirement = (params) => {
    return request(URL.SAVE_soft_requirement, {
        method: "post",
        data: params
    });
}
/**
 * 更新主表数据
 * @param {*} params
 */
export const updatesoftrequirement = (params) => {
    return request(URL.UPDATE_soft_requirement, {
        method: "post",
        data: params
    });
}
/**
 * 删除主表数据
 * @param {*} params
 */
export const delsoftrequirement = (params) => {
    return request(URL.DEL_soft_requirement, {
        method: "post",
        data: params
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
 * 保存子表数据 软件购买申请单需求明细
 * @param {*} params
 */
export const savesoftrequiremententity = (params) => {
    return request(URL.SAVE_soft_requirement_entity, {
        method: "post",
        data: params
    });
}
/**
 * 更新子表数据 软件购买申请单需求明细
 * @param {*} params
 */
export const updatesoftrequiremententity = (params) => {
    return request(URL.UPDATE_soft_requirement_entity, {
        method: "post",
        data: params
    });
}
/**
 * 删除子表 软件购买申请单需求明细
 * @param {*} params
 */
export const delsoftrequiremententity = (params) => {
    return request(URL.DEL_soft_requirement_entity, {
        method: "post",
        data: params
    });
}

/**
 *
 * 查询打印模板
 * @param {*} params
 * @returns
 */
export const queryPrintTemplateAllocate = (params) => {
    return request(URL.GET_QUERYPRINTTEMPLATEALLOCATE, {
        method: "get",
        param: params
    });
}

export const printDocument = (params) => {
    let search = [];
    for (let key in params) {
        search.push(`${key}=${params[key]}`)
    }
    let exportUrl = `${URL.PRINTSERVER}?${search.join('&')}`;
    
    window.open(exportUrl);
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
