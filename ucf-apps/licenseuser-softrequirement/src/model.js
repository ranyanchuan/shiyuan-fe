import {actions} from "mirrorx";
// 引入services，如不需要接口请求可不写
import * as api from "./service";
// 接口返回数据公共处理方法，根据具体需要
import {processData, initStateObj, structureObj, Error, getCookie,deepClone} from "utils";

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
    name: "masterDetailManysoftrequirement",
    // 设置当前 Model 所需的初始化 state
    initialState: {
        tabKey: "softrequiremententity",
        softrequirementIndex: 0, // 默认选中第一行
        showLoading: false,
        showsoftrequiremententityLoading: false,
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
        softrequirementObj: {
            list: [],
            pageIndex: 1,
            pageSize: 5,
            totalPages: 1,
            total: 0,
        },
        softrequiremententityObj: {
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
            actions.masterDetailManysoftrequirement.updateState({showLoading: true});   // 正在加载数据，显示加载 Loading 图标
            let {result} = processData(await api.getsoftrequirement(param));  // 调用 getList 请求数据
            let {data: ressoftrequirement} = result;
            let {content = []} = ressoftrequirement || {};

            if (content.length > 0) { // 获取子表数据
                const softrequirementObj = structureObj(ressoftrequirement, param);
                actions.masterDetailManysoftrequirement.updateState({softrequirementObj}); // 更新主表数据
                const {tabKey} = getState().masterDetailManysoftrequirement;
                if (tabKey !== "uploadFill") {
                    const {pageSize} = getState().masterDetailManysoftrequirement[tabKey + "Obj"];
                    const {id: search_billId} = content[0];
                    let paramObj = {pageSize, pageIndex: 0, search_billId};
                    if (tabKey === "softrequiremententity") {
                        // 带上子表信息
                        actions.masterDetailManysoftrequirement.loadsoftrequiremententityList(paramObj)
                    }
                }
            } else {
                 const {
                    softrequirementObj,
                        softrequiremententityObj,
                } = getState().masterDetailManysoftrequirement;
                actions.masterDetailManysoftrequirement.updateState({   // 如果请求出错,数据初始化
                        softrequirementObj: initStateObj(softrequirementObj),
                        softrequiremententityObj: initStateObj(softrequiremententityObj),
                        softrequirementRow: {}
                    }
                );
            }
            actions.masterDetailManysoftrequirement.updateState({showLoading: false, softrequirementIndex: 0, queryParam: param});
        },
        /**
         * getSelect：保存主表数据
         * @param {*} param
         * @param {*} getState
         */
        async savesoftrequirement(param, getState) {
            actions.masterDetailManysoftrequirement.updateState({showLoading: true});   // 正在加载数据，显示加载 Loading 图标
            let {btnFlag} = param;
            let status = null;
            delete param.btnFlag; //删除标识字段
            if (btnFlag === 0) { // 添加数据
                let {result} = processData(await api.savesoftrequirement(param), '添加成功');
                status = result.status;
            }
            if (btnFlag === 1) { // 修改数据
                let {result} = processData(await api.updatesoftrequirement(param), '修改成功');
                status = result.status;
            }

            if (status === 'success') { // 如果不判断是会报错，param参数有错
                let queryParam = getState().masterDetailManysoftrequirement.queryParam;
                actions.masterDetailManysoftrequirement.getsoftrequirements(queryParam);
            }
            actions.masterDetailManysoftrequirement.updateState({showLoading: false});
        },
        /**
         * 删除主表数据
         * @param {*} param
         * @param {*} getState
         */
        async delsoftrequirement(param, getState) {
            const {id} = param;
            const {result}=processData(await api.delsoftrequirement([{id}]), '删除成功');
            const {status}=result;
            if(status==='success'){
                let queryParam = getState().masterDetailManysoftrequirement.queryParam;
                actions.masterDetailManysoftrequirement.getsoftrequirements(queryParam);
            }
        },
        async getsoftrequirements(queryParam){
            let pageSize = queryParam.pageParams.pageSize;
            let queryObj = {
                pageParams: {
                    pageIndex: 0,
                    pageSize: pageSize
                },
                sortMap: [],
                whereParams: []
            }
            
            actions.masterDetailManysoftrequirement.loadList(queryObj);
        },
        /**
         * getSelect：通过id查询主表数据
         * @param {*} param
         * @param {*} getState
         */
        async querysoftrequirement(param, getState) {
            const {result} = processData(await api.getsoftrequirementList(param));  // 调用 getList 请求数据
            let data = {};
            if(result.status == 'success'){
                data = result.data;
                if(data){
                    data = data.content;
                }
                if(data.length){
                    data = data[0];
                }
            }
            return data;
        },
        /**
         * 获取softrequiremententity列表
         * @param param
         * @param getState
         * @returns {Promise<void>}
         */
        async loadsoftrequiremententityList(param, getState) {
            actions.masterDetailManysoftrequirement.updateState({showsoftrequiremententityLoading: true});
            const {result} = processData(await api.getsoftrequiremententity(param)); // 请求获取softrequiremententity数据
            actions.masterDetailManysoftrequirement.updateState({showsoftrequiremententityLoading: false});
            const {data: res} = result;
            if (res) {
                const softrequiremententityObj = structureObj(res, param);
                actions.masterDetailManysoftrequirement.updateState({softrequiremententityObj});
            } else {
                const {softrequiremententityObj} = getState().masterDetailManysoftrequirement;
                actions.masterDetailManysoftrequirement.updateState({   // 如果请求出错,数据初始化
                    softrequiremententityObj: initStateObj(softrequiremententityObj),
                });
            }
        },
        /**
         * getSelect：保存子表数据 软件购买申请单需求明细
         * @param {*} param
         * @param {*} getState
         */
        async savesoftrequiremententity(param, getState) {
            actions.masterDetailManysoftrequirement.updateState({showLoading: true});
            let {btnFlag} = param;
            let status = null;
            delete param.btnFlag; //删除标识字段
            if (btnFlag === 0) { // 添加数据
                let {result} = processData(await api.savesoftrequiremententity(param), '保存成功');
                status = result.status;
            }
            if (btnFlag === 1) { // 修改数据
                let {result} = processData(await api.updatesoftrequiremententity(param), '修改成功');
                status = result.status;
            }
            if (status === 'success') {
                // 获取主表的id;
                const {softrequirementIndex, softrequirementObj, softrequiremententityObj} = getState().masterDetailManysoftrequirement;
                const {list} = softrequirementObj;
                const {id: search_billId} = list[softrequirementIndex];

                const {pageSize} = softrequiremententityObj;
                // 带上子表信息
                const param = {pageIndex: 0, pageSize, search_billId}; // 获softrequiremententity表信息
                actions.masterDetailManysoftrequirement.loadsoftrequiremententityList(param);
            }
            actions.masterDetailManysoftrequirement.updateState({showLoading: false});
        },
        /**
         * 删除子表 softrequiremententity 数据
         * @param {*} param
         * @param {*} getState
         */
        async delsoftrequiremententity(param, getState) {
            let {id, billId: search_billId} = param;
            let {result}=processData(await api.delsoftrequiremententity([{id}]), '删除成功');
            let {status}=result;
            if(status==='success'){
                // 获取表pageSize;
                const {softrequiremententityObj} = getState().masterDetailManysoftrequirement;
                const {pageSize} = softrequiremententityObj;
                const initPage = {pageIndex: 0, pageSize, search_billId};
                actions.masterDetailManysoftrequirement.loadsoftrequiremententityList(initPage);
            }
        },
        /**
         *
         *
         * @param {*} param
         * @returns
         */
        async printDocument(param) {
            let {result} = processData(await api.queryPrintTemplateAllocate(param.queryParams), '');
            const {data:res}=result;
            if (!res || !res.res_code) {
                return false;
            }
            await api.printDocument({
                tenantId: getCookie('tenantid'),
                printcode: res['res_code'],
                serverUrl: `${GROBAL_HTTP_CTX}/passenger/dataForPrint`,
                params: encodeURIComponent(JSON.stringify(param.printParams)),
                sendType: 'post'
            })
        },
        //行过滤参照获取数据
        async getRefListByCol(param, getState){
            const {result} = processData(await api.getListByCol(param));
            const {data=[]} = result;
                
            return data;
        },


          /**
         * 获取softrequiremententity列表
         * @param param
         * @param getState
         * @returns {Promise<void>}
         */
        async loadsoftrequiremententityList(param, getState) {
            actions.masterDetailManysoftrequirement.updateState({showsoftrequiremententityLoading: true});
            const {result} = processData(await api.getsoftrequiremententity(param)); // 请求获取softrequiremententity数据
            actions.masterDetailManysoftrequirement.updateState({showsoftrequiremententityLoading: false});
            const {data: res} = result;
            if (res) {
                const softrequiremententityObj = structureObj(res, param);
                actions.masterDetailManysoftrequirement.updateState({softrequiremententityObj});
            } else {
                const {softrequiremententityObj} = getState().masterDetailManysoftrequirement;
                actions.masterDetailManysoftrequirement.updateState({   // 如果请求出错,数据初始化
                    softrequiremententityObj: initStateObj(softrequiremententityObj),
                });
            }
        },






    }
};
