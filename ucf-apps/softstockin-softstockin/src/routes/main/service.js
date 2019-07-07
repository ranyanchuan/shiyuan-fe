import request from "utils/request";

//定义接口地址
const URL = {
    "SAVE_soft_stock_in":  `${GROBAL_HTTP_CTX}` + `/softstockin/softstockin/saveAssoVo`, //保存

    "DEL_soft_stock_in_entity":  `${GROBAL_HTTP_CTX}` + `/softstockin/softstockinentity/deleteBatch`, // 删除子表

    "GET_USER": `${GROBAL_HTTP_CTX}/softstockin/softstockin/listForAdd`, //保存


    "GET_DETAIL":`${GROBAL_HTTP_CTX}//softrequire/softrequiremententity/selectBySupplier`, //获取
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



export const getDetailData = (param) => {
    return request(URL.GET_DETAIL, {
        method: "post",
        data:param
    });
}


