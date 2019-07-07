/*用于定义两个以上页面公用的service*/
import request from "utils/request";

//定义接口地址
const URL = {
    "GET_soft_requirement_entity":  `${GROBAL_HTTP_CTX}` + `/softrequire/softrequiremententity/list`, // 获取子表
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
