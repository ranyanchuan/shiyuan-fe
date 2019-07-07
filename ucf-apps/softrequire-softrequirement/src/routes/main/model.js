import { actions } from "mirrorx";
// 引入services，如不需要接口请求可不写
import * as api from "./service";
import * as oneApi from '../one/service'
import * as commonApi from '../../common/service'
// 接口返回数据公共处理方法，根据具体需要
import { processData, deepAssign, structureObj, initStateObj, Error } from "utils";

/**
 *          btnFlag为按钮状态，新增、修改是可编辑，查看详情不可编辑，
 *          新增表格为空
 *          修改需要将行数据带上并显示在卡片页面
 *          查看详情携带行数据但是表格不可编辑
 *          0表示新增、1表示编辑，2表示查看详情 3提交
 *async loadList(param, getState) {
 *          rowData为行数据
 */

const initialState = {
    status: 'view',//表格状态：view=查看、edit=编辑、new=新增、del=删除
    showLoading: false,
    showModalCover: false,
    searchParam: {},
    queryParent: {},
        showsoftrequiremententityLoading: false,
    querysoftrequiremententityObj: {
        list: [],
        pageIndex: 1,
        pageSize: 10,
        totalPages: 1,
        total: 0,
    },
}

export default {
    // 确定 Store 中的数据模型作用域
    name: "masterDetailMainsoftrequirement",
    // 设置当前 Model 所需的初始化 state
    initialState: initialState,
    reducers: {
        /**
         * 纯函数，相当于 Redux 中的 Reducer，只负责对数据的更新。
         * @param {*} state
         * @param {*} data
         */
        updateState(state, data) { //更新state
            return {
                ...state,
                ...data
            };
        },

        /**
         * 纯函数 合并 initialState
         * @param {*} state
         * @param {*} data
         */
        initState(state, data) { //更新state
            if (data) {
                const assignState = deepAssign(state, data);
                return {
                    ...assignState,
                };
            } else {
                return initialState
            }
        },

    },
    effects: {
        /**
         * 添加主表和子表
         * @param param
         * @param getState
         * @returns {Promise<void>}
         */
        async adds(param, getState) {
            actions.masterDetailMainsoftrequirement.updateState({ showLoading: true });
            const { result } = processData(await api.savesoftrequirement(param), '保存成功');
            const { data: res } = result;
            actions.masterDetailMainsoftrequirement.updateState({ showLoading: false });
            if (res) {
                actions.routing.push({ pathname: '/' });
            }
        },

        /**
         * setQueryParent 当从主页跳转过来的时候设置 queryParent
         * */
        setQueryParent(orderInfo) {
            if (orderInfo) {
                actions.masterDetailMainsoftrequirement.updateState({ queryParent: orderInfo });
                const paramObj = { pageSize: 10, pageIndex: 0, search_billId: orderInfo.id };
                actions.masterDetailMainsoftrequirement.queryChild(paramObj);
            } 
        },


        async getQueryParent(param, getState) {
            actions.masterDetailMainsoftrequirement.updateState({ showLoading: true });   // 正在加载数据，显示加载 Loading 图标
            let { result } = processData(await oneApi.getsoftrequirement(param));  // 调用 getList 请求数据
            actions.masterDetailMainsoftrequirement.updateState({ showLoading: false });
            let { data: res, status } = result;

            // 跳转消息中心
            // let { search_from } = param;
            // if (status !== 'success' && search_from) {
            //     window.history.go(-1);
            // }

            let { content = [] } = res || {};
            let queryParent = content[0] ? content[0] : {};
            actions.masterDetailMainsoftrequirement.updateState({ queryParent });
            if (content.length > 0) { // 获取子表数据
                let { value } = param.whereParams[0];
                // const {pageSize} = getState().masterDetailOnesoftrequirement.queryDetailObj;
                let paramObj = { pageSize: 10, pageIndex: 0, search_orderId: value};
                actions.masterDetailMainsoftrequirement.queryChild(paramObj);
            } else {
                // 如果请求出错,数据初始化
                let { queryDetailObj } = getState().masterDetailMainsoftrequirement;
                actions.masterDetailMainsoftrequirement.updateState({
                    queryDetailObj: initStateObj(queryDetailObj),
                    showModalCover: true,
                });
            }
        },




        /**
         * getSelect：通过id查询子表数据 紧急联系人
         * @param {*} param
         * @param {*} getState
         */
        async queryChild(param, getState) {

            actions.masterDetailMainsoftrequirement.updateState({ showDetailLoading: true });
            const { result } = processData(await commonApi.getsoftrequiremententity(param));  // 调用 getList 请求数据
            actions.masterDetailMainsoftrequirement.updateState({ showDetailLoading: false });
            const { data: res } = result;
            if (res) {
                const querysoftrequiremententityObj = structureObj(res, param);
                actions.masterDetailMainsoftrequirement.updateState({ querysoftrequiremententityObj }); // 更新 子表
            } else {
                // 如果请求出错,数据初始化
                const { querysoftrequiremententityObj } = getState().masterDetailMainsoftrequirement;
                actions.masterDetailMainsoftrequirement.updateState({ querysoftrequiremententityObj: initStateObj(querysoftrequiremententityObj) });
            }

        },
        /**
         * 删除子表数据
         * @param {*} param
         * @param {*} getState
         */
        async delsoftrequiremententity(param, getState) {
            actions.masterDetailMainsoftrequirement.updateState({ showLoading: true });
            const { result } = processData(await api.delsoftrequiremententity(param), '删除成功');
            actions.masterDetailMainsoftrequirement.updateState({ showLoading: false });
            return result;
        }
    }
};
