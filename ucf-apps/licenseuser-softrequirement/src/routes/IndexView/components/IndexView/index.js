import React, { Component } from 'react'
import { actions } from 'mirrorx';
import { Tabs, Loading } from 'tinper-bee';
import Grid from 'components/Grid';
import Header from 'components/Header';
import Button from 'components/Button';
import Alert from 'components/Alert';
import moment from 'moment';
import ButtonRoleGroup from 'components/ButtonRoleGroup';
import AcAttachment from 'ac-attachment';
import RefCommon from 'components/RefCommon';
import SelectMonth from 'components/SelectMonth';

import SearchArea from '../SearchArea/index';

import Softrequiremententity from '../softrequiremententitySubModal/index';

import { deepClone, Warning, getPageParam, success, getSortMap } from "utils";
import print from 'components/Print'
import { BpmButtonSubmit, BpmButtonRecall } from 'yyuap-bpm';
import 'ac-attachment/dist/ac-attachment.css';
import './index.less'

const { TabPane } = Tabs;
const format = "YYYY-MM-DD";

export default class IndexView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            delModalVisible: false,
            modalVisible: false, // 添加、编辑、详情 弹框
            delPicModalVisible: false, // 添加、编辑、详情 弹框
            checkTable: "softrequirement", //选中的表名 用于modal 弹框标记
            flag: -1, //按钮状态
            softrequiremententityIndex: 0,
            refdepartmentDropData: null,
            refbuDropData: null,
            filterable: false,
        }

    }
    componentDidMount() {
        this.loadPage({
            sortMap: [],
            whereParams: [],
        });
    }
    /**
     *
     *获取主表数据
     * @param {Object} [param={}]
     */
    loadPage = (param = {}) => {
        let { queryParam } = this.props;
        actions.masterDetailManysoftrequirement.loadList({ ...queryParam, ...param });
    }
    /**
     *
     * 关闭弹框 view update modal
     * @param {Boolean} isSave 判断是否添加或者更新
     * */
    onCloseModal = (isSave = false) => {
        this.setState({ modalVisible: false, flag: -1 });
        if ((typeof isSave) === 'boolean') {
            this.child.reset();
        }

    }
    /**
     *
     *
     * @param {string} resetObj 重置state，默认选中第一条
     */
    resetIndex = (resetObj) => {
        this.setState({ [resetObj]: 0 })
    }
    /**
     *
     *tab 切换
     * @param {string} tabKey uploadFill为文件上传，emergency子表，traveling子表
     */
    onChangeTab = (tabKey) => {
        if (tabKey !== "uploadFill") { // 判断是否文件上传
            const { softrequirementObj, softrequirementIndex, queryParam } = this.props;
            const { pageSize } = this.props[tabKey + "Obj"];
            const { id: search_billId } = softrequirementObj.list[softrequirementIndex] || {};
            if (search_billId) { //如果主表有数据，子表在获取数据
                const param = { search_billId, pageIndex: 0, pageSize };
                if (tabKey === "softrequiremententity") {
                    actions.masterDetailManysoftrequirement.loadsoftrequiremententityList(param);
                }
            }
        }
        actions.masterDetailManysoftrequirement.updateState({ tabKey });
    }


    /**
     * 显示删除弹框
     */
    onClickDel = (checkTable) => {
        this.setState({ delModalVisible: true, checkTable });
    }

    /**
     *
     * @param {Number} pageIndex 当前分页值 第几条
     * @param {string} tableObj 分页 table 名称
     */
    freshData = (pageIndex, tableObj) => {
        this.onPageSelect(pageIndex, 0, tableObj);
    }


    /**
     *
     * @param {number} pageIndex 当前分页值 第几条
     * @param {number} value 分页条数
     * @param {string} tableObj 分页table名称
     */
    onDataNumSelect = (pageIndex, value, tableObj) => {
        this.onPageSelect(value, 1, tableObj);
    }

    /**
     *
     *
     * @param {number} value  pageIndex 或者 pageSize值
     * @param {string} type  type为0标识为 pageIndex,为1标识 pageSize,
     * @param {string} tableName 分页table名称
     */
    onPageSelect = (value, type, tableName) => {
        let queryParam = deepClone(this.props.queryParam);
        let modalObj = this.props[tableName];

        let { pageIndex, pageSize } = getPageParam(value, type, modalObj);

        if (tableName === "softrequirementObj") { //主表分页
            queryParam.pageParams.pageSize = pageSize;
            queryParam.pageParams.pageIndex = pageIndex;
            actions.masterDetailManysoftrequirement.loadList(queryParam);
        } else {
            //子表分页
            const { softrequirementIndex, softrequirementObj } = this.props;
            const { id: search_billId } = softrequirementObj.list[softrequirementIndex];

            if (tableName === "softrequiremententityObj") {
                const temp = { search_billId, pageSize, pageIndex };
                actions.masterDetailManysoftrequirement.loadsoftrequiremententityList(temp);
            }
        }
        actions.masterDetailManysoftrequirement.updateState({ queryParam });
    }
    /**
     *
     * @param {string} type 当前选中的table
     * @param {number} status 状态 0 添加，1 编辑 2. 详情
     */
    onShowMainModal = (type, status) => {
        //关闭行过滤
        this.clearRowFilter();

        let search = `?checkTable=${type}&btnFlag=${status}`;

        //编辑或详情，添加id参数
        if (parseInt(status) > 0) {
            const { softrequirementObj, softrequirementIndex: currentIndex } = this.props;
            const { list } = softrequirementObj;
            const curRecord = list[currentIndex];
            const { id } = curRecord;
            search = `?checkTable=${type}&btnFlag=${status}&search_id=${id}`
        }

        //跳转的新页面
        actions.routing.push(
            {
                pathname: '/main',
                search: search
            }
        )
    }
    /**
     *
     * @param {string} type 当前选中的table
     * @param {number} status 状态 0 添加，1 编辑 2. 详情
     */
    onShowModal = (type, status) => {
        this.setState({
            modalVisible: true,
            flag: status,
            checkTable: type,
        });
    }
    /**
     *删除确定操作
     * @param {number} type 1.删除 2.取消
     */
    async confirmGoBack(type) {
        const { checkTable } = this.state; //获取删除的表名
        const { list } = this.props[checkTable + "Obj"];
        this.setState({ delModalVisible: false });
        if (type === 1 && list.length > 0) {
            if (checkTable === "softrequirement") { // 主表
                const { softrequirementIndex } = this.props;
                const record = list[softrequirementIndex];
                await actions.masterDetailManysoftrequirement.delsoftrequirement(record);
            }
            if (checkTable === "softrequiremententity") { // 子表
                const { softrequiremententityIndex } = this.state;
                const record = list[softrequiremententityIndex];
                this.setState({ softrequiremententityIndex: 0 }); //默认选中第一条
                await actions.masterDetailManysoftrequirement.delsoftrequiremententity(record);
            }
        }
    }
    /**
     *删除确定操作
     * @param {number} type 1.删除 2.取消
     */
    async confirmDelPic(type) {
        if (type === 1) {
            this.attach.fDelete();
        }
        this.setState({ delPicModalVisible: false });
    }

    /**
        *
        *触发过滤输入操作以及下拉条件的回调
        * @param {string} key 过滤字段名称
        * @param {*} value 过滤字段值
        * @param {string} condition 过滤字段条件
        */
    onFilterChange = (key, value, condition) => {
        let isAdd = true; //是否添加标识
        let queryParam = deepClone(this.props.queryParam);
        let { whereParams, pageParams } = queryParam;
        pageParams.pageIndex = 0; // 默认跳转第一页
        for (const [index, element] of whereParams.entries()) {
            if (element.key === key) { // 判断action 中是否有 过滤对象
                whereParams[index] = this.handleFilterData(key, value, condition);
                isAdd = false;
            }
        }
        if (isAdd) {
            const filterData = this.handleFilterData(key, value, condition);
            whereParams.push(filterData);
        }
        actions.masterDetailManysoftrequirement.loadList(queryParam);
    }
    /**
        *
        * 拼接过滤条件对象
        * @param {string} key 过滤字段名称
        * @param {*} value 过滤字段值
        * @param {string} condition 过滤字段条件
        */
    handleFilterData = (key, value, condition) => {
        const filterObj = { key, value, condition };
        if (Array.isArray(value)) { // 判断是否日期
            filterObj.value = this.handleDateFormat(value); // moment 格式转换
            filterObj.condition = "RANGE";
        }
        return filterObj;
    }
    /**
       *
       *行过滤，日期数组拼接
       * @param {Array} value 日期数组
       * @returns
       */
    handleDateFormat = (value) => {
        const beginFormat = "YYYY-MM-DD 00:00:00";
        const endFormat = "YYYY-MM-DD 23:59:59";
        let dateArray = value.map((item, index) => {
            let str = '';
            if (index === 0) {
                str = item.format(beginFormat);
            } else {
                str = item.format(endFormat);
            }
            return str;
        });
        return dateArray;
    }
    /**
        * 清除过滤条件的回调函数，回调参数为清空的字段
        * @param {string} key 清除过滤字段
        */
    onFilterClear = (key) => {
        let queryParam = deepClone(this.props.queryParam);
        let { whereParams, pageParams } = queryParam;
        for (const [index, element] of whereParams.entries()) {
            if (element.key === key) {
                whereParams.splice(index, 1);
                pageParams.pageIndex = 0; // 默认跳转第一页
                break;
            }
        }
        actions.masterDetailManysoftrequirement.loadList(queryParam);
    }
    /**
        *
        * @param {Boolean} status 控制栏位的显示/隐藏
        */
    afterRowFilter = (status) => {
        if (!status) {
            // 清空行过滤数据
            let { queryParam, cacheFilter } = deepClone(this.props);
            queryParam.whereParams = cacheFilter;
            actions.masterDetailManysoftrequirement.updateState({ queryParam }); //缓存查询条件
            actions.masterDetailManysoftrequirement.loadList(queryParam);
        }
        this.setState({ filterable: status });
    }
    clearRowFilter = () => {
        this.setState({ filterable: false });
    }

    softrequirementColumn = () => {
        const softrequirementColumn = [
            {
                title: "单据编号",
                dataIndex: "billno",
                key: "billno",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "申请人",
                dataIndex: "applicant",
                key: "applicant",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "申请部门",
                dataIndex: "department",
                key: "department",
                width: 150,
                exportKey: "departmentname",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: this.state.refdepartmentDropData,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.refdepartmentDropData) {
                        let param = {
                            distinctParams: ['department']
                        }
                        actions['masterDetailManysoftrequirement'].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return { key: item['departmentname'], value: item['department'] }
                            });

                            this.setState({
                                refdepartmentDropData: vals
                            })
                        })
                    }
                },
                render: (text, record, index) => {
                    return (<span>{record['departmentname']}</span>)
                },
            },
            {
                title: "状态",
                dataIndex: "status",
                key: "status",
                width: 150,
                sorter: true,
                exportKey: "statusEnumValue",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: [
                    { key: "草稿", value: "0" },
                    { key: "已提交", value: "1" },
                    { key: "已采购", value: "2" },
                    { key: "自动更新", value: "3" },
                ],
                render(text, record, index) {
                    return record['statusEnumValue'];
                }
            },
            {
                title: "入账单位",
                dataIndex: "bu",
                key: "bu",
                width: 150,
                exportKey: "buName",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: this.state.refbuDropData,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.refbuDropData) {
                        let param = {
                            distinctParams: ['bu']
                        }
                        actions['masterDetailManysoftrequirement'].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return { key: item['buName'], value: item['bu'] }
                            });

                            this.setState({
                                refbuDropData: vals
                            })
                        })
                    }
                },
                render: (text, record, index) => {
                    return (<span>{record['buName']}</span>)
                },
            },
            {
                title: "需求合计金额",
                dataIndex: "amount",
                key: "amount",
                width: 150,
                sorter: true,
                render: (text, record, index) => {
                    return (<span>{(typeof text) === 'number' ? text.toFixed(2) : ""}</span>)
                },
            },
            {
                title: "物资类别",
                dataIndex: "type",
                key: "type",
                width: 150,
                sorter: true,
                exportKey: "typeEnumValue",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: [
                    { key: "办公软件", value: "0" },
                    { key: "生产设计软件", value: "1" },
                ],
                render(text, record, index) {
                    return record['typeEnumValue'];
                }
            },
            {
                title: "要求完成时间",
                dataIndex: "fdate",
                key: "fdate",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "收货园区",
                dataIndex: "address",
                key: "address",
                width: 150,
                sorter: true,
                exportKey: "addressEnumValue",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: [
                    { key: "科珠", value: "1" },
                    { key: "云埔", value: "2" },
                    { key: "连云", value: "3" },
                ],
                render(text, record, index) {
                    return record['addressEnumValue'];
                }
            },
            {
                title: "采购方式",
                dataIndex: "procurement",
                key: "procurement",
                width: 150,
                sorter: true,
                exportKey: "procurementEnumValue",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: [
                    { key: "自行采购", value: "1" },
                    { key: "统一采购", value: "2" },
                    { key: "仓管补仓", value: "3" },
                ],
                render(text, record, index) {
                    return record['procurementEnumValue'];
                }
            },
            {
                title: "紧急程度",
                dataIndex: "level",
                key: "level",
                width: 150,
                sorter: true,
                exportKey: "levelEnumValue",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: [
                    { key: "一般", value: "1" },
                    { key: "急", value: "2" },
                    { key: "紧急", value: "3" },
                ],
                render(text, record, index) {
                    return record['levelEnumValue'];
                }
            },
            {
                title: "申请原因",
                dataIndex: "note",
                key: "note",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "流程状态",
                dataIndex: "bpmState",
                key: "bpmState",
                width: 150,
                sorter: true,
                render: (text, record, index) => {
                    let map = {
                        0: '待确认',
                        1: '执行中',
                        2: '已办结',
                        3: '终止'
                    }
                    return (<span>{map[parseInt(text)] || ''}</span>)
                }
            },
        ];

        return softrequirementColumn;
    }

    softrequiremententityColumn = () => {
        const softrequiremententityColumn = [
            {
                title: "物资编号",
                dataIndex: "wz_number",
                key: "wz_number",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "物资名称",
                dataIndex: "name",
                key: "name",
                width: 150,
                exportKey: "wzName",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: this.state.refnameDropDataSub,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.refnameDropDataSub) {
                        let param = {
                            distinctParams: ['name']
                        }
                        actions[''].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return { key: item['wzName'], value: item['name'] }
                            });

                            this.setState({
                                refnameDropDataSub: vals
                            })
                        })
                    }
                },
                render: (text, record, index) => {
                    return (<span>{record['wzName']}</span>)
                },
            },
            {
                title: "型号",
                dataIndex: "model",
                key: "model",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "规格描述",
                dataIndex: "description",
                key: "description",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "品牌",
                dataIndex: "brand",
                key: "brand",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "使用地点",
                dataIndex: "address",
                key: "address",
                width: 150,
                sorter: true,
                exportKey: "addressEnumValue",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: [
                    { key: "科珠", value: "1" },
                    { key: "云埔", value: "2" },
                    { key: "连云", value: "3" },
                ],
                render(text, record, index) {
                    return record['addressEnumValue'];
                }
            },
            {
                title: "申请数量",
                dataIndex: "qty",
                key: "qty",
                width: 150,
                sorter: true,
            },
            {
                title: "预计单价",
                dataIndex: "price",
                key: "price",
                width: 150,
                sorter: true,
                render: (text, record, index) => {
                    return (<span>{(typeof text) === 'number' ? text.toFixed(2) : ""}</span>)
                },
            },
            {
                title: "供应商",
                dataIndex: "supplier",
                key: "supplier",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
        ];

        return softrequiremententityColumn;
    }
    /**
     *
     *导出excel
     * @param {string} type 导出某个表
     */
    export = (type) => {
        this.refs[type].exportExcel();
    }
    /**
     *
     * 费用合计
     * @param {Array} data 费用原始数据
     * @returns
     */
    getTotalCost = (data) => {
        let cost = 0;
        for (const item of data) {
            if (item.cost) cost += Number(item.cost);
        }
        return cost;
    }
    /**
     *
     * @param {Object} data 组装分页参数
     */
    getBasicPage = (data) => {
        const { pageIndex, total, totalPages } = data;
        return {   // 分页
            activePage: pageIndex,//当前页
            total: total,//总条数
            items: totalPages,
            dataNum: 1, //默认数组第一个值
        };
    }
    onRef = (ref) => {
        this.child = ref
    }
    /**
        *
        * @description 提交初始执行函数
        * @param {string, string} operation为submit recall type 为start、success
        */
    bpmStart = (operation, type) => async () => {
        if (type == 'start') {
            await actions.masterDetailManysoftrequirement.updateState({
                showLoading: true
            })
        } else {
            let msg = operation == 'submit' && '单据提交成功' || '单据撤回成功';
            success(msg);
            const queryParam = deepClone(this.props.queryParam); // 深拷贝查询条件从action里
            this.loadPage(queryParam);
        }

    }
    /**
        *
        * @description 提交失败和结束执行的函数
        * @param {string,string} operation为submit recall type 为error、end
        */
    bpmEnd = (operation, type) => async (error) => {
        if (type == 'error') {
            Error(error.msg);
        }
        actions.masterDetailManysoftrequirement.updateState({
            showLoading: false
        })
    }
    handleBpmState = (list, selectIndex) => {
        let resObj = {
            submitForbid: true,
            recallForbid: true
        };
        if (list.length) {
            let rec = list[selectIndex];
            if (rec) {
                let bpmState = rec['bpmState'];
                let submitForbid = bpmState ? true : false,
                    recallForbid = bpmState == 1 ? false : true;

                resObj = {
                    submitForbid,
                    recallForbid
                }
            }
        }

        return resObj;
    }
    /**
     *
     *排序属性设置   
     * @param {Array} sortParam 排序参数对象数组
     */
    sortFun = (sortParam) => {
        let { queryParam } = this.props;
        queryParam.sortMap = getSortMap(sortParam);
        actions['masterDetailManysoftrequirement'].loadList(queryParam);
    }
    softrequiremententitySortFun = (sortParam) => {
        sortParam = getSortMap(sortParam);
        let { softrequirementObj, softrequiremententityObj, softrequirementIndex: index } = this.props;
        const { list } = softrequirementObj;
        const { pageSize } = softrequiremententityObj;
        const { id: search_billId } = list[index];
        const param = { search_billId, pageSize, pageIndex: 0, sortMap: sortParam };
        actions['masterDetailManysoftrequirement'].loadsoftrequiremententityList(param);
    }
    getDataNum = (queryParam) => {
        queryParam = queryParam || this.props.queryParam;
        let dataNumSelect = ["5", "10", "15", "20", "25", "50", "All"];
        let dataNum = 0;
        if (queryParam.pageParams) {
            dataNum = dataNumSelect.indexOf(String(queryParam.pageParams.pageSize));
        }
        return dataNum;
    }
    exportData = (obj) => {
        let exportData = deepClone(obj.list);
        let map = {
            0: '待确认',
            1: '执行中',
            2: '已办结',
            3: '终止'
        }
        exportData.forEach(function (item) {
            item.bpmState = map[parseInt(item.bpmState)];
        })
        //根据Switch布尔值转成字符串
        exportData = JSON.stringify(exportData);
        exportData = exportData.replace(/:true/ig, ':"是"').replace(/:false/ig, ':"否"');

        return JSON.parse(exportData);
    }
    render() {
        const _this = this;
        const {
            softrequirementObj,
            softrequirementIndex,
            showLoading,
            softrequiremententityObj,
            showsoftrequiremententityLoading,
            tabKey,
            queryParam
        } = this.props;
        const {
            delModalVisible, modalVisible, flag, checkTable,
            softrequiremententityIndex,
            delPicModalVisible
        } = this.state;

        let selectRow = softrequirementObj['list'][softrequirementIndex] || {};
        // 主表数据为空
        const softrequirementForbid = softrequirementObj.list.length > 0 ? false : true;
        const softrequiremententityForbid = softrequiremententityObj.list.length > 0 ? false : true;
        let { list } = softrequirementObj;
        const { id } = list[softrequirementIndex] || {};
        const { submitForbid, recallForbid } = _this.handleBpmState(list, softrequirementIndex);
        //处理导出数据中的状态
        let exportData = this.exportData(softrequirementObj)
        let dataNum = this.getDataNum(queryParam);


        return (
            <div className='master-detail-many'>
                <Header title='软件申请单领用' />
                <SearchArea queryParam={queryParam} softrequirementObj={softrequirementObj} onRef={this.onRef} clearRowFilter={this.clearRowFilter} />
                <div className='table-header'>
                    {/* <Button
                        className="ml8"
                        role="add"
                        colors="primary"
                        onClick={() => this.onShowMainModal('softrequirement', 0)}
                    >新增</Button>
                    <Button
                        className="ml8"
                        role="update"
                        shape='border'
                        disabled={softrequirementForbid}
                        onClick={() => _this.onShowMainModal("softrequirement", 1)}
                    >修改</Button>
                    <Button
                        className="ml8"
                        shape='border'
                        disabled={softrequirementForbid}
                        onClick={() => _this.onShowMainModal("softrequirement", 2)}
                    >详情</Button>
                    <Button
                        className="ml8"
                        role="delete"
                        shape='border'
                        disabled={softrequirementForbid}
                        onClick={() => _this.onClickDel("softrequirement")}
                    >删除</Button>
                    <Button
                        className="ml8"
                        shape='border'
                        disabled={softrequirementForbid}
                        onClick={() => _this.export("softrequirement")}
                    >导出</Button> */}
                    {/* <Button
                        className="ml8"
                        shape='border'
                        disabled={softrequirementForbid}
                        onClick={() => print.onPrint({ id: id, selectIndex: softrequirementIndex }, { nodekey: 'softrequirement', funCode: 'licenseuser', serverUrl: `${GROBAL_HTTP_CTX}/licenseuser/softrequirement/dataForPrint` })}
                    >
                        打印
                        </Button>
                    <BpmButtonSubmit
                        className="ml8"
                        checkedArray={[softrequirementObj['list'][softrequirementIndex]]}
                        funccode="licenseuser"
                        nodekey="003"
                        url={`${GROBAL_HTTP_CTX}` + '/licenseuser/softrequirement/submit'}
                        urlAssignSubmit={`${GROBAL_HTTP_CTX}` + '/licenseuser/softrequirement/assignSubmit'}
                        onStart={_this.bpmStart('submit', 'start')}
                        onSuccess={_this.bpmStart('submit', 'success')}
                        onError={_this.bpmEnd('submit', 'error')}
                        onEnd={_this.bpmEnd('submit', 'end')}
                    >
                        <Button className="ml8" size='sm' colors="primary"
                            disabled={submitForbid}>提交</Button>
                    </BpmButtonSubmit>
                    <BpmButtonRecall
                        checkedArray={[softrequirementObj['list'][softrequirementIndex]]}
                        url={`${GROBAL_HTTP_CTX}` + '/licenseuser/softrequirement/recall'}
                        onStart={_this.bpmStart('recall', 'start')}
                        onSuccess={_this.bpmStart('recall', 'success')}
                        onError={_this.bpmEnd('recall', 'error')}
                        onEnd={_this.bpmEnd('recall', 'end')}
                    >
                        <Button className="ml8" size='sm' colors="primary"
                            disabled={recallForbid}>收回</Button>
                    </BpmButtonRecall> */}
                </div>
                <Grid
                    ref="softrequirement"
                    data={softrequirementObj.list}
                    exportData={exportData}
                    rowKey={(r, i) => i}
                    columns={_this.softrequirementColumn()}
                    getSelectedDataFunc={this.getSelectedDataFunc}
                    showHeaderMenu={true}
                    showFilterMenu={true} //是否显示行过滤菜单
                    filterable={_this.state.filterable}//是否开启过滤数据功能
                    onFilterChange={_this.onFilterChange}  // 触发过滤输入操作以及下拉条件的回调
                    onFilterClear={_this.onFilterClear} //清除过滤条件的回调函数，回调参数为清空的字段
                    afterRowFilter={_this.afterRowFilter} //控制栏位的显示/隐藏
                    draggable={true}
                    multiSelect={false}
                    sort={{
                        mode: 'multiple',
                        backSource: true,
                        sortFun: _this.sortFun
                    }}
                    onRowClick={(record, index) => {
                        actions.masterDetailManysoftrequirement.updateState({ softrequirementIndex: index });
                        // 根据tab 页来获取子表数据
                        const {
                            softrequirementObj,
                            softrequiremententityObj,
                            tabKey,
                            queryParam
                        } = this.props;
                        const { list } = softrequirementObj;
                        const { id: search_billId } = list[index];
                        let param = { pageIndex: 0, search_billId };
                        if (tabKey === "softrequiremententity") { // tab为softrequiremententity获取softrequiremententity子表数据
                            param.pageSize = softrequiremententityObj.pageSize;
                            actions.masterDetailManysoftrequirement.loadsoftrequiremententityList(param)
                        }
                    }}
                    rowClassName={(record, index, indent) => { //判断是否选中当前行
                        return softrequirementIndex === index ? "selected" : "";
                    }}
                    paginationObj={{
                        ...this.getBasicPage(softrequirementObj),
                        freshData: (pageSize) => {
                            _this.freshData(pageSize, "softrequirementObj");
                        },
                        onDataNumSelect: (index, value) => {
                            _this.onDataNumSelect(index, value, "softrequirementObj");
                        },
                        dataNum: dataNum
                    }}
                />
                <div className="table-space"> </div>
                <div className={softrequirementForbid ? "tabel-header-wrap-hide" : "tabel-header-wrap"} >
                    <Tabs
                        defaultActiveKey={tabKey}
                        onChange={this.onChangeTab}
                    >
                        <TabPane tab='软件购买申请单需求明细' key="softrequiremententity">
                            <div className='table-header-child'>
                                {/* <ButtonRoleGroup funcCode="licenseuser"> */}
                                    {/* <Button iconType="uf-plus" className="ml8" role="add_em"
                                                colors="primary"
                                                disabled={softrequirementForbid}
                                                onClick={() => _this.onShowModal('softrequiremententity', 0)}
                                        >新增</Button> */}
                                    {/* <Button iconType="uf-pencil" className="ml8" role="update_em"
                                                shape="border"
                                                disabled={softrequiremententityForbid}
                                                onClick={() => {
                                                    _this.onShowModal("softrequiremententity", 1);
                                                }}
                                        >修改</Button> */}
                                    <Button iconType="uf-list-s-o" className="ml8"
                                        shape="border"
                                        disabled={softrequiremententityForbid}
                                        onClick={() => _this.onShowModal("softrequiremententity", 2)}
                                    >分配</Button>
                                    
                                    {/* <Button iconType="uf-del" className="ml8" role="delete_em"
                                        shape="border"
                                        disabled={softrequiremententityForbid}
                                        onClick={() => _this.onClickDel("softrequiremententity")}
                                    >删除1</Button> */}
                                    {/* <Button iconType="uf-export" className="ml8"
                                                shape="border"
                                                onClick={() => _this.export("softrequiremententity")}
                                        >导出</Button> */}
                                {/* </ButtonRoleGroup> */}
                            </div>
                            <div style={{ marginBottom: 24 }}>
                                <Grid
                                    ref="softrequiremententity"
                                    data={softrequiremententityObj.list}
                                    rowKey={(r, i) => i}
                                    columns={_this.softrequiremententityColumn()}
                                    showHeaderMenu={true}
                                    draggable={true}
                                    multiSelect={false}
                                    sort={{
                                        mode: 'multiple',
                                        backSource: true,
                                        sortFun: _this.softrequiremententitySortFun
                                    }}
                                    // 分页
                                    paginationObj={{
                                        ...this.getBasicPage(softrequiremententityObj),
                                        freshData: (pageSize) => {
                                            _this.freshData(pageSize, "softrequiremententityObj");
                                        },
                                        onDataNumSelect: (index, value) => {
                                            _this.onDataNumSelect(index, value, "softrequiremententityObj");
                                        },
                                    }}

                                    onRowClick={(record, index) => {
                                        _this.setState({ softrequiremententityIndex: index });
                                    }}
                                    rowClassName={(record, index, indent) => {
                                        if (_this.state.softrequiremententityIndex === index) {
                                            return 'selected';
                                        } else {
                                            return '';
                                        }
                                    }}
                                    loading={{
                                        show: (showsoftrequiremententityLoading && showLoading === false),
                                        loadingType: "line"
                                    }}
                                />
                            </div>
                        </TabPane>
                    </Tabs>
                </div>


                <Softrequiremententity
                    modalObj={softrequiremententityObj}
                    softrequirementIndex={softrequirementIndex}
                    softrequirementObj={softrequirementObj}
                    modalVisible={modalVisible && checkTable === "softrequiremententity" && flag !== -1}
                    btnFlag={flag}
                    onCloseModal={this.onCloseModal}
                    currentIndex={softrequiremententityIndex}
                    checkTable={checkTable}
                    resetIndex={this.resetIndex}
                />
                <Loading
                    loadingType="line"
                    show={showLoading}
                    fullScreen={true}
                />
                <Alert
                    show={delModalVisible}
                    context="确定删除这条记录吗 ?"
                    confirmFn={() => _this.confirmGoBack(1)}
                    cancelFn={() => _this.confirmGoBack(2)} />

                <Alert
                    show={delPicModalVisible}
                    context="确定删除文件吗 ?"
                    confirmFn={() => _this.confirmDelPic(1)}
                    cancelFn={() => _this.confirmDelPic(2)} />
            </div>

        )

    }
}
