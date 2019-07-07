import { actions } from "mirrorx";
// 引入services，如不需要接口请求可不写
import * as api from "./service";
// 接口返回数据公共处理方法，根据具体需要
import { processData, deepAssign, structureObj, initStateObj, Error ,deepClone} from "utils";

/**
 *          btnFlag为按钮状态，新增、修改是可编辑，查看详情不可编辑，
 *          新增表格为空
 *          修改需要将行数据带上并显示在卡片页面
 *          查看详情携带行数据但是表格不可编辑
 *          0表示新增、1表示编辑，2表示查看详情 3提交
 *async loadList(param, getState) {
 *          rowData为行数据
 */

export default {
    // 确定 Store 中的数据模型作用域
    name: "masterDetailOnesoftstockin",
    // 设置当前 Model 所需的初始化 state
    initialState: {
        cacheData: [],//新增、修改缓存原始数据
        tableData: [],//表格最终处理渲染的数据
        selectData: [],//选中的状态数组
        status: 'view',//表格状态：view=查看、edit=编辑、new=新增、del=删除
        // 缓存行过滤条件
        cacheFilter: [],
        //查询条件参数
        queryParam: {
            pageParams: {
                pageIndex: 0,
                pageSize: 5,
            },
            sortMap: [],
            whereParams: [],
        },
        selectIndex: 0,
        showLoading: false,
        showModalCover: false,
        queryParent: {},
        softstockinObj: {
            list: [],
            pageIndex: 1,
            pageSize: 5,
            totalPages: 1,
            total: 0,
        },
        showsoftstockinentityLoading: false,
        softstockinentityObj: {
            list: [],
            pageIndex: 1,
            pageSize: 10,
            totalPages: 1,
            total: 0,
        },
        querysoftstockinentityObj: {
            list: [],
            pageIndex: 1,
            pageSize: 10,
            totalPages: 1,
            total: 0,
        },
    },
    reducers: {
        /**
         * 纯函数，相当于 Redux 中的 Reducer，只负责对数据的更新。
         * @param {*} state
         * @param {*} data
         */
        updateState(state, data) { //更新state
            return {
                ...state,
                ...deepClone(data)
            };
        },

        /**
         * 纯函数 合并 initialState
         * @param {*} state
         * @param {*} data
         */
        initState(state, data) { //更新state
            const assignState = deepAssign(state, data);
            return {
                ...assignState,
            };
        },

    },
    effects: {
        /**
         * 加载主列表数据
         * @param {*} param
         * @param {*} getState
         */
        async loadList(param, getState) {

            actions.masterDetailOnesoftstockin.updateState({ showLoading: true });   // 正在加载数据，显示加载 Loading 图标
            let { result } = processData(await api.getsoftstockin(param));  // 调用 getList 请求数据
            let { data: res } = result;
            // 默认选中第一条
            actions.masterDetailOnesoftstockin.updateState({ showLoading: false, selectIndex: 0, queryParam: param });
            let { content = [] } = res || {};

            if (content.length > 0) { // 获取子表数据
                let softstockinObj = structureObj(res, param);
                actions.masterDetailOnesoftstockin.updateState({ softstockinObj }); // 更新主表数据
                let { pageSize } = getState().masterDetailOnesoftstockin.softstockinentityObj;
                let { id: search_billId } = content[0];
                let paramObj = { pageSize, pageIndex: 0, search_billId };
                actions.masterDetailOnesoftstockin.loadsoftstockinentityList(paramObj);
            } else {
                // 如果请求出错,数据初始化
                const { 
                    softstockinObj, 
                    softstockinentityObj 
                } = getState().masterDetailOnesoftstockin;
                actions.masterDetailOnesoftstockin.updateState({
                        softstockinObj: initStateObj(softstockinObj),
                        softstockinentityObj: initStateObj(softstockinentityObj),
                    }
                );
            }
        },
        /**
         * getSelect：通过id查询主表数据
         * @param {*} param
         * @param {*} getState
         */
        async queryParent(param, getState) {
            actions.masterDetailOnesoftstockin.updateState({ showLoading: true });   // 正在加载数据，显示加载 Loading 图标
            let { result } = processData(await api.getsoftstockin(param));  // 调用 getList 请求数据
            actions.masterDetailOnesoftstockin.updateState({ showLoading: false });
            let { data: res, status } = result;

            // 跳转消息中心
            let { search_from } = param;
            // if (status !== 'success' && search_from) {
            //     window.history.go(-1);
            // }

            let { content = [] } = res || {};
            let queryParent = content[0] ? content[0] : {};
            actions.masterDetailOnesoftstockin.updateState({ queryParent });
            if (content.length > 0) { // 获取子表数据
                let { search_id: search_billId } = param;
                // const {pageSize} = getState().masterDetailOnesoftstockin.querysoftstockinentityObj;
                let paramObj = { pageSize: 10, pageIndex: 0, search_billId };
                actions.masterDetailOnesoftstockin.queryChild(paramObj);
            } else {
                // 如果请求出错,数据初始化
                let { querysoftstockinentityObj } = getState().masterDetailOnesoftstockin;
                actions.masterDetailOnesoftstockin.updateState({
                    querysoftstockinentityObj: initStateObj(querysoftstockinentityObj),
                    showModalCover: true,
                });
            }
        },
        /**
         * 删除主表数据
         * @param {*} param
         * @param {*} getState
         */
        async delsoftstockin(param, getState) {
            actions.masterDetailOnesoftstockin.updateState({ showLoading: true });
            let { result } = processData(await api.delsoftstockin([param]), '删除成功');
            actions.masterDetailOnesoftstockin.updateState({ showLoading: false });
            let { status } = result;
            if (status === 'success') {
                // 获取 pageSize
                let { softstockinObj } = getState().masterDetailOnesoftstockin;
                let { pageSize } = softstockinObj;
                let initPage = { pageIndex: 0, pageSize };
                let {queryParam} = getState().masterDetailOnesoftstockin;
                queryParam.pageParams = initPage;
                await actions.masterDetailOnesoftstockin.updateState({
                    selectIndex: 0
                });
                actions.masterDetailOnesoftstockin.loadList(queryParam);
            }
        },
        /**
         * 添加主表和子表
         * @param param
         * @param getState
         * @returns {Promise<void>}
         */
        async adds(param, getState) {
            actions.masterDetailOnesoftstockin.updateState({ showLoading: true });
            const { result } = processData(await api.savesoftstockin(param), '保存成功');
            const { data: res } = result;
            actions.masterDetailOnesoftstockin.updateState({ showLoading: false });
            if (res) {
                actions.routing.push({ pathname: '/' });
            }
        },
        /**
         * 加载子表信息
         * @param param
         * @param getState
         * @returns {Promise<void>}
         */
        async loadsoftstockinentityList(param, getState) {
            // 调用 getList 请求数据
            actions.masterDetailOnesoftstockin.updateState({ showsoftstockinentityLoading: true });
            const { result } = processData(await api.getsoftstockinentity(param));  // 调用 getList 请求数据
            actions.masterDetailOnesoftstockin.updateState({ showsoftstockinentityLoading: false });
            const { data: res } = result;
            if (res) {
                const softstockinentityObj = structureObj(res, param);
                actions.masterDetailOnesoftstockin.updateState({ softstockinentityObj });
            } else {
                // 如果请求出错,数据初始化
                const { softstockinentityObj } = getState().masterDetailOnesoftstockin;
                actions.masterDetailOnesoftstockin.updateState({ softstockinentityObj: initStateObj(softstockinentityObj) });
            }
        },
        /**
         * getSelect：通过id查询子表数据 紧急联系人
         * @param {*} param
         * @param {*} getState
         */
        async queryChild(param, getState) {
            actions.masterDetailOnesoftstockin.updateState({ showsoftstockinentityLoading: true });
            const { result } = processData(await api.getsoftstockinentity(param));  // 调用 getList 请求数据
            actions.masterDetailOnesoftstockin.updateState({ showsoftstockinentityLoading: false });
            const { data: res } = result;
            if (res) {
                const querysoftstockinentityObj = structureObj(res, param);
                actions.masterDetailOnesoftstockin.updateState({ querysoftstockinentityObj }); // 更新 子表
            } else {
                // 如果请求出错,数据初始化
                const { querysoftstockinentityObj } = getState().masterDetailOnesoftstockin;
                actions.masterDetailOnesoftstockin.updateState({ querysoftstockinentityObj: initStateObj(querysoftstockinentityObj) });
            }
        },
        /**
         * 删除子表数据
         * @param {*} param
         * @param {*} getState
         */
        async delsoftstockinentity(param, getState) {
            actions.masterDetailOnesoftstockin.updateState({ showLoading: true });
            let { result } = processData(await api.delsoftstockinentity(param), '删除成功');
            actions.masterDetailOnesoftstockin.updateState({ showLoading: false });
            return result;
        },
        //行过滤参照获取数据
        async getRefListByCol(param, getState){
            const {result} = processData(await api.getListByCol(param));
            const {data=[]} = result;
                
            return data;
        }
    }
};
