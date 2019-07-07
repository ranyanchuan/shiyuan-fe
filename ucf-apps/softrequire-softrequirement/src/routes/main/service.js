import request from "utils/request";

//定义接口地址
const URL = {
    "SAVE_soft_requirement":  `${GROBAL_HTTP_CTX}` + `/softrequire/softrequirement/saveAssoVo`, //保存

    "DEL_soft_requirement_entity":  `${GROBAL_HTTP_CTX}` + `/softrequire/softrequiremententity/deleteBatch`, // 删除子表

    "GET_USER": `${GROBAL_HTTP_CTX}/softrequire/softrequirement/listForAdd`, //保存
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

