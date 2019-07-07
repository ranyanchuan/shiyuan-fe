/*用于定义两个以上页面公用的service*/
import request from "utils/request";

//定义接口地址
const URL = {
    "GET_soft_stock_in_entity":  `${GROBAL_HTTP_CTX}` + `/softstockin/softstockinentity/list`, // 获取子表
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
