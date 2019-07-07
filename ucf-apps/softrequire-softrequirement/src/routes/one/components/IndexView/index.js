import React, {Component} from 'react'
import {actions} from 'mirrorx';
import {Loading,Tabs} from 'tinper-bee';
import Grid from 'components/Grid';
import moment from 'moment'
import Header from 'components/Header';
import Button from 'components/Button';
import Alert from 'components/Alert';
import SearchArea from '../SearchArea/index';
import ButtonRoleGroup from 'components/ButtonRoleGroup';

import {deepClone, success, Error,getPageParam,getSortMap} from "utils";
import print from 'components/Print'
import {BpmButtonSubmit, BpmButtonRecall} from 'yyuap-bpm';
import './index.less';

const {TabPane} = Tabs;
const format = "YYYY-MM-DD";

export default class IndexView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            delModalVisible: false,
        refdepartmentDropData: null,
        refbuDropData: null,
    filterable: false,
        }
    }

    componentDidMount() {
        this.loadPage({
            pageParams: {
                pageIndex: 0,
                pageSize: 5,
            },
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
        // 获取默认请求的 分页信息
        let {pageSize, pageIndex} = this.props.softrequirementObj;
        let tempPageSize = pageIndex ? pageIndex : 1; //默认第一页
        let initPage = {pageIndex: tempPageSize - 1, pageSize};
        let {queryParam} = this.props;
        queryParam = deepClone(queryParam);
        queryParam.pageParams = initPage;

        actions.masterDetailOnesoftrequirement.loadList({...queryParam,...param});
    }

    /**
     * 通过btnFlag判断用户是添加、修改和详情操作
     * @param {Number} btnFlag 0标识为新增，1标识为修改，2标识为详情
     */
    onClickAddEditView = (btnFlag) => {
        let {selectIndex, softrequirementObj} = this.props;
        let {list = []} = softrequirementObj;
        let softrequirementInfo = null;

        if (btnFlag !== 0) {
            softrequirementInfo = list[selectIndex]
        }

        //关闭行过滤
        this.clearRowFilter();

        //跳转的新页面
        this.goToOrder(softrequirementInfo, btnFlag);
    }

    /**
     *
     *通过URL跳转
     * @param {string} id 主表id
     * @param {Number} btnFlag 页面状态 0标识为新增，1标识为修改，2标识为详情
     */
    goToOrder = (softrequirementInfo, btnFlag) => {
        actions.masterDetailMainsoftrequirement.setQueryParent(softrequirementInfo);
        let searchId = softrequirementInfo ? softrequirementInfo.id : "";
        actions.routing.push(
            {
                pathname: 'softrequirement',
                search: `?search_id=${searchId}&btnFlag=${btnFlag}&t=${Math.random()}`
            }
        )
    }
    
    /**
     *
     * @param {Number} pageIndex 当前分页值 第几条
     * @param {string} tableObj 分页table
     */
    freshData = (pageIndex, tableObj) => {
        this.onPageSelect(pageIndex, 0, tableObj);
    }

    /**
     *
     *
     * @param {Number} pageIndex 当前分页值 第几条
     * @param {Number} value 分页条数
     * @param {string} tableObj 分页table
     */
    onDataNumSelect = (pageIndex, value, tableObj) => {
        this.onPageSelect(value, 1, tableObj);
    }

    /**
     *
     * @param {Number} value pageIndex或者pageSize值
     * @param {Number} type type为0标识为 pageIndex,为1标识 pageSize,
     * @param {string} tableName 分页 table 名称
     */
    onPageSelect = (value, type, tableName) => {
        let queryParam = deepClone(this.props.queryParam); // 深拷贝查询条件从action里
        let modalObj = this.props[tableName];
        let {pageIndex, pageSize} = getPageParam(value,type,modalObj);

        if (tableName === "softrequirementObj") { //主表分页
            queryParam.pageParams.pageSize = pageSize;
            queryParam.pageParams.pageIndex = pageIndex;
            actions.masterDetailOnesoftrequirement.updateState({queryParam});
            actions.masterDetailOnesoftrequirement.loadList(queryParam);
        }
        if (tableName === "softrequiremententityObj") { //detail 表分页
            let {selectIndex, softrequirementObj} = this.props;
            let {id: search_billId} = softrequirementObj.list[selectIndex];
            let temp = {search_billId, pageSize, pageIndex};
            actions.masterDetailOnesoftrequirement.loadsoftrequiremententityList(temp);
        }
    }

    /**
     *  删除 弹框展示
     */

    onClickDel = () => this.setState({delModalVisible: true});

    /**
     *
     * @param {Number} status  1确定删除 2 取消删除
     */
    async confirmGoBack(status) {
        let {selectIndex, softrequirementObj} = this.props;
        let {list = []} = softrequirementObj;
        let record = list[selectIndex];
        this.setState({delModalVisible: false});
        if (status === 1) { // 主表
            await actions.masterDetailOnesoftrequirement.delsoftrequirement(record);
        }
    }

    /**
     * 导出excel
     */
    export = () => {
        this.grid.exportExcel();
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
    let {whereParams, pageParams} = queryParam;
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
    actions.masterDetailOnesoftrequirement.loadList(queryParam);
}
/**
    *
    * 拼接过滤条件对象
    * @param {string} key 过滤字段名称
    * @param {*} value 过滤字段值
    * @param {string} condition 过滤字段条件
    */
handleFilterData = (key, value, condition) => {
    const filterObj = {key, value, condition};
    if (Array.isArray(value)) { // 判断是否日期
        filterObj.value = this.handleDateFormat(value); // moment 格式转换
        filterObj.condition="RANGE";
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
    let {whereParams, pageParams} = queryParam;
    for (const [index, element] of whereParams.entries()) {
        if (element.key === key) {
            whereParams.splice(index, 1);
            pageParams.pageIndex = 0; // 默认跳转第一页
            break;
        }
    }
    actions.masterDetailOnesoftrequirement.loadList(queryParam);
}
/**
    *
    * @param {Boolean} status 控制栏位的显示/隐藏
    */
afterRowFilter = (status) => {
    if (!status) { 
        // 清空行过滤数据
        let {queryParam, cacheFilter} = deepClone(this.props);
        queryParam.whereParams = cacheFilter;
        actions.masterDetailOnesoftrequirement.updateState({queryParam}); //缓存查询条件
        actions.masterDetailOnesoftrequirement.loadList(queryParam);
    }
    this.setState({filterable: status});
}
clearRowFilter = () => {
    this.setState({filterable: false});
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
                filterDropdownData: this.state.    refdepartmentDropData,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.    refdepartmentDropData) {
                        let param = {
                            distinctParams: ['department']
                        }
                        actions['masterDetailOnesoftrequirement'].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return {key:item['departmentname'],value:item['department']}
                            });

                            this.setState({
                                    refdepartmentDropData : vals
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
                    {key:"草稿",value:"0"},
                    {key:"已提交",value:"1"},
                    {key:"已采购",value:"2"},
                    {key:"自动更新",value:"3"},
                ],
                render(text,record,index){
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
                filterDropdownData: this.state.    refbuDropData,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.    refbuDropData) {
                        let param = {
                            distinctParams: ['bu']
                        }
                        actions['masterDetailOnesoftrequirement'].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return {key:item['buName'],value:item['bu']}
                            });

                            this.setState({
                                    refbuDropData : vals
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
                    return (<span>{(typeof text)==='number'? text.toFixed(2):""}</span>)
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
                    {key:"办公软件",value:"0"},
                    {key:"生产设计软件",value:"1"},
                ],
                render(text,record,index){
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
                    {key:"科珠",value:"1"},
                    {key:"云埔",value:"2"},
                    {key:"连云",value:"3"},
                ],
                render(text,record,index){
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
                    {key:"自行采购",value:"1"},
                    {key:"统一采购",value:"2"},
                    {key:"仓管补仓",value:"3"},
                ],
                render(text,record,index){
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
                    {key:"一般",value:"1"},
                    {key:"急",value:"2"},
                    {key:"紧急",value:"3"},
                ],
                render(text,record,index){
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
                filterDropdownData: this.state.    refnameDropDataSub,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.    refnameDropDataSub) {
                        let param = {
                            distinctParams: ['name']
                        }
                        actions[''].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return {key:item['wzName'],value:item['name']}
                            });

                            this.setState({
                                    refnameDropDataSub : vals
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
                    {key:"科珠",value:"1"},
                    {key:"云埔",value:"2"},
                    {key:"连云",value:"3"},
                ],
                render(text,record,index){
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
                    return (<span>{(typeof text)==='number'? text.toFixed(2):""}</span>)
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
     * 组装分页参数
     * @param {Object} data 后端返回的数据，拼接成分页组件要求的格式
     * @returns
     */
    getBasicPage = (data) => {
        let {pageIndex, total, totalPages} = data;
        return {   // 分页
            activePage: pageIndex,//当前页
            total: total,//总条数
            items: totalPages,
            dataNum: 1, //默认数组第一个值
        };

    }
    getDataNum = (num) => {
        const val = {"5": 0, "10": 1, "15": 2, "20": 3, "25": 4, "50": 5};
        let dataNum = val[num];
        if (dataNum === undefined) {
            dataNum = 6;
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
        exportData  = exportData.replace(/:true/ig,':"是"').replace(/:false/ig,':"否"');

        return JSON.parse(exportData);
    }
/**
    *
    * @description 提交初始执行函数
    * @param {string, string} operation为submit recall type 为start、success
    */
bpmStart = (operation, type) => async () => {
    if (type == 'start') {
        await actions.masterDetailOnesoftrequirement.updateState({
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
    actions.masterDetailOnesoftrequirement.updateState({
        showLoading: false
    })
}
handleBpmState = (list, selectIndex) => {
    let resObj = {
        submitForbid : true,
        recallForbid : true
    };
    if ( list.length ) {
        let rec = list[selectIndex];
        if(rec){
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
    let {queryParam} = this.props;
    queryParam.sortMap = getSortMap(sortParam);
    actions['masterDetailOnesoftrequirement'].loadList(queryParam);
}
    softrequiremententitySortFun = (sortParam) => {
        sortParam = getSortMap(sortParam);
        let {softrequirementObj,softrequiremententityObj,selectIndex:index} = this.props;
        const {list} = softrequirementObj;
        const {pageSize} = softrequiremententityObj;
        const {id: search_billId} = list[index];
        const param = {search_billId, pageSize, pageIndex: 0, sortMap: sortParam};
        actions['masterDetailOnesoftrequirement'].loadsoftrequiremententityList(param);
    }
    render() {
        const _this = this;
        let {delModalVisible} = _this.state;
        let {
            showLoading, 
            softrequirementObj,
            softrequiremententityObj, 
            showsoftrequiremententityLoading, 
            selectIndex,
            queryParam
        } = this.props;

        let {list} = softrequirementObj;
        //  数据为空，按钮disable
        const btnForbid = list.length > 0 ? false : true;
        const {id} = list[selectIndex] || {};
        const {submitForbid, recallForbid} = _this.handleBpmState(list, selectIndex);
        //处理导出数据中的状态
        let exportData = this.exportData(softrequirementObj);

        return (
            <div className="master-detail-one">
                <Header title='软件购买申请单'/>
                <SearchArea queryParam={queryParam} softrequirementObj={softrequirementObj} clearRowFilter={this.clearRowFilter} />
                <div className='table-header'>
                        <Button
                            colors="primary"
                            className="ml8"
                            role="add"
                            onClick={() => _this.onClickAddEditView(0)}
                        >新增</Button>
                        <Button
                            shape="border"
                            className="ml8"
                            role="update"
                            disabled={ submitForbid || btnForbid }
                            onClick={() => _this.onClickAddEditView(1)}
                        >修改</Button>
                        <Button
                            shape="border"
                            className="ml8"
                            role="check"
                            disabled={btnForbid}
                            onClick={() => _this.onClickAddEditView(2)}
                        >详情</Button>
                        <Button
                            role="delete"
                            shape="border"
                            className="ml8"
                            disabled={ submitForbid || btnForbid}
                            onClick={_this.onClickDel}
                        >删除</Button>
                        <Alert show={delModalVisible} context="是否要删除 ?"
                               confirmFn={() => _this.confirmGoBack(1)}
                               cancelFn={() => _this.confirmGoBack(2)}
                        />
                        <Button 
                            shape="border" 
                            key="export" 
                            className="ml8" 
                            disabled={btnForbid}
                            onClick={_this.export}>
                            导出
                        </Button>
                        <Button
                            className="ml8"
                            shape='border'
                            disabled={btnForbid}
                            onClick={() => print.onPrint({id:id,selectIndex:selectIndex},{nodekey:'softrequirement',funCode:'softrequire', serverUrl: `${GROBAL_HTTP_CTX}/softrequire/softrequirement/dataForPrint`})}
                        >
                            打印
                        </Button>
                        <BpmButtonSubmit
                            className="ml8"
                            checkedArray={[softrequirementObj['list'][selectIndex]]}
                            funccode="softrequire"
                            nodekey="003"
                            url={`${GROBAL_HTTP_CTX}` + '/softrequire/softrequirement/submit'}
                            urlAssignSubmit={`${GROBAL_HTTP_CTX}` + '/softrequire/softrequirement/assignSubmit'}
                            onStart={_this.bpmStart('submit', 'start')}
                            onSuccess={_this.bpmStart('submit', 'success')}
                            onError={_this.bpmEnd('submit', 'error')}
                            onEnd={_this.bpmEnd('submit', 'end')}
                        >
                            <Button className="ml8"  size='sm' colors="primary"
                                disabled={submitForbid || btnForbid}>提交</Button>
                        </BpmButtonSubmit>
                        <BpmButtonRecall
                            checkedArray={[softrequirementObj['list'][selectIndex]]}
                            url={`${GROBAL_HTTP_CTX}` + '/softrequire/softrequirement/recall'}
                            onStart={_this.bpmStart('recall', 'start')}
                            onSuccess={_this.bpmStart('recall', 'success')}
                            onError={_this.bpmEnd('recall', 'error')}
                            onEnd={_this.bpmEnd('recall', 'end')}
                        >
                            <Button className="ml8" size='sm' colors="primary"
                                disabled={recallForbid || btnForbid}>收回</Button>
                        </BpmButtonRecall>
                </div>
                <Grid
                    ref={(el) => this.grid = el}
                    data={softrequirementObj.list}
                        exportData = {exportData}
                    rowKey={(r, i) => i}
                    columns={this.softrequirementColumn()}
                    multiSelect={false}
                    dragborder={true}
                    showFilterMenu={true} //是否显示行过滤菜单
                    filterable={_this.state.filterable}//是否开启过滤数据功能
                    onFilterChange={_this.onFilterChange}  // 触发过滤输入操作以及下拉条件的回调
                    onFilterClear={_this.onFilterClear} //清除过滤条件的回调函数，回调参数为清空的字段
                    afterRowFilter={_this.afterRowFilter} //控制栏位的显示/隐藏
                    onRowClick={(record, index) => {
                        // 获取子表数据
                        actions.masterDetailOnesoftrequirement.updateState({selectIndex: index}); // 更新默认主表行 数据
                        const {list} = softrequirementObj;
                        const {pageSize} = softrequiremententityObj;
                        const {id: search_billId} = list[index];
                        const param = {search_billId, pageSize, pageIndex: 0};
                        actions.masterDetailOnesoftrequirement.loadsoftrequiremententityList(param);
                    }}
                    rowClassName={(record, index, indent) => {
                        return selectIndex === index ? "selected" : "";
                    }}
                    sort={{  
                        mode: 'multiple',
                        backSource: true,
                        sortFun: _this.sortFun
                    }}
                    // 分页
                    paginationObj={{
                        ...this.getBasicPage(softrequirementObj),
                        freshData: pageSize => _this.freshData(pageSize, "softrequirementObj"),
                        onDataNumSelect: (index, value) => _this.onDataNumSelect(index, value, "softrequirementObj"),
                        dataNum: _this.getDataNum(softrequirementObj.pageSize),
                    }}
                />
                <div className="table-space"> </div>
                <div className='gird-parent'>
                    <Tabs>
                        <TabPane tab='软件购买申请单需求明细' key="softrequiremententity">
                            <Grid
                                data={softrequiremententityObj.list}
                                rowKey={(r, i) => i}
                                columns={this.softrequiremententityColumn()}
                                multiSelect={false}
                                sort={{  
                                    mode: 'multiple',
                                    backSource: true,
                                    sortFun: _this.softrequiremententitySortFun
                                }}
                                // 分页
                                paginationObj={{
                                    ...this.getBasicPage(softrequiremententityObj),
                                    freshData: pageSize => _this.freshData(pageSize, "softrequiremententityObj"),
                                    onDataNumSelect: (index, value) => _this.onDataNumSelect(index, value, "softrequiremententityObj"),
                                    dataNum: _this.getDataNum(softrequiremententityObj.pageSize),
                                }}
                                loading={{show: (!showLoading && showsoftrequiremententityLoading), loadingType: "line"}}
                            />
                        </TabPane>
                    </Tabs>
                    <Loading
                        show={showLoading}
                        fullScreen={true}
                    />
                </div>
            </div>

        )

    }
}
