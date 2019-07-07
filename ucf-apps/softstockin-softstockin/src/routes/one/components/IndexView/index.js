import React, { Component } from 'react'
import { actions } from 'mirrorx';
import { Loading, Tabs } from 'tinper-bee';
import Grid from 'components/Grid';
import moment from 'moment'
import Header from 'components/Header';
import Button from 'components/Button';
import Alert from 'components/Alert';
import SearchArea from '../SearchArea/index';
import ButtonRoleGroup from 'components/ButtonRoleGroup';

import { deepClone, success, Error, getPageParam, getSortMap } from "utils";
import print from 'components/Print'
import './index.less';

const { TabPane } = Tabs;
const format = "YYYY-MM-DD";

export default class IndexView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            delModalVisible: false,
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
        let { pageSize, pageIndex } = this.props.softstockinObj;
        let tempPageSize = pageIndex ? pageIndex : 1; //默认第一页
        let initPage = { pageIndex: tempPageSize - 1, pageSize };
        let { queryParam } = this.props;
        queryParam = deepClone(queryParam);
        queryParam.pageParams = initPage;

        actions.masterDetailOnesoftstockin.loadList({ ...queryParam, ...param });
    }

    /**
     * 通过btnFlag判断用户是添加、修改和详情操作
     * @param {Number} btnFlag 0标识为新增，1标识为修改，2标识为详情
     */
    onClickAddEditView = (btnFlag) => {
        let { selectIndex, softstockinObj } = this.props;
        let { list = [] } = softstockinObj;
        let softstockinInfo = null;

        if (btnFlag !== 0) {
            softstockinInfo = list[selectIndex]
        }

        //关闭行过滤
        this.clearRowFilter();

        //跳转的新页面
        this.goToOrder(softstockinInfo, btnFlag);
    }

    /**
     *
     *通过URL跳转
     * @param {string} id 主表id
     * @param {Number} btnFlag 页面状态 0标识为新增，1标识为修改，2标识为详情
     */
    goToOrder = (softstockinInfo, btnFlag) => {
        actions.masterDetailMainsoftstockin.setQueryParent(softstockinInfo);
        let searchId = softstockinInfo ? softstockinInfo.id : "";
        actions.routing.push(
            {
                pathname: 'softstockin',
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
        let { pageIndex, pageSize } = getPageParam(value, type, modalObj);

        if (tableName === "softstockinObj") { //主表分页
            queryParam.pageParams.pageSize = pageSize;
            queryParam.pageParams.pageIndex = pageIndex;
            actions.masterDetailOnesoftstockin.updateState({ queryParam });
            actions.masterDetailOnesoftstockin.loadList(queryParam);
        }
        if (tableName === "softstockinentityObj") { //detail 表分页
            let { selectIndex, softstockinObj } = this.props;
            let { id: search_billId } = softstockinObj.list[selectIndex];
            let temp = { search_billId, pageSize, pageIndex };
            actions.masterDetailOnesoftstockin.loadsoftstockinentityList(temp);
        }
    }

    /**
     *  删除 弹框展示
     */

    onClickDel = () => this.setState({ delModalVisible: true });

    /**
     *
     * @param {Number} status  1确定删除 2 取消删除
     */
    async confirmGoBack(status) {
        let { selectIndex, softstockinObj } = this.props;
        let { list = [] } = softstockinObj;
        let record = list[selectIndex];
        this.setState({ delModalVisible: false });
        if (status === 1) { // 主表
            await actions.masterDetailOnesoftstockin.delsoftstockin(record);
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
        actions.masterDetailOnesoftstockin.loadList(queryParam);
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
        actions.masterDetailOnesoftstockin.loadList(queryParam);
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
            actions.masterDetailOnesoftstockin.updateState({ queryParam }); //缓存查询条件
            actions.masterDetailOnesoftstockin.loadList(queryParam);
        }
        this.setState({ filterable: status });
    }
    clearRowFilter = () => {
        this.setState({ filterable: false });
    }

    softstockinColumn = () => {
        const softstockinColumn = [
            {
                title: "订单编号",
                dataIndex: "billno",
                key: "billno",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
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
                        actions['masterDetailOnesoftstockin'].getRefListByCol(param).then(data => {
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
                title: "供应商",
                dataIndex: "supplier",
                key: "supplier",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "采购员",
                dataIndex: "buyer",
                key: "buyer",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
            {
                title: "备注",
                dataIndex: "note",
                key: "note",
                width: 150,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
            },
        ];

        return softstockinColumn;
    }

    softstockinentityColumn = () => {
        const softstockinentityColumn = [
            {
                title: "物资编码",
                dataIndex: "wzNumber",
                key: "wzNumber",
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
                dataIndex: "r_qty",
                key: "r_qty",
                width: 150,
                sorter: true,
            },
            {
                title: "入库数量",
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
        ];

        return softstockinentityColumn;
    }

    /**
     *
     * 组装分页参数
     * @param {Object} data 后端返回的数据，拼接成分页组件要求的格式
     * @returns
     */
    getBasicPage = (data) => {
        let { pageIndex, total, totalPages } = data;
        return {   // 分页
            activePage: pageIndex,//当前页
            total: total,//总条数
            items: totalPages,
            dataNum: 1, //默认数组第一个值
        };

    }
    getDataNum = (num) => {
        const val = { "5": 0, "10": 1, "15": 2, "20": 3, "25": 4, "50": 5 };
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
        exportData = exportData.replace(/:true/ig, ':"是"').replace(/:false/ig, ':"否"');

        return JSON.parse(exportData);
    }
    /**
     *
     *排序属性设置   
     * @param {Array} sortParam 排序参数对象数组
     */
    sortFun = (sortParam) => {
        let { queryParam } = this.props;
        queryParam.sortMap = getSortMap(sortParam);
        actions['masterDetailOnesoftstockin'].loadList(queryParam);
    }
    softstockinentitySortFun = (sortParam) => {
        sortParam = getSortMap(sortParam);
        let { softstockinObj, softstockinentityObj, selectIndex: index } = this.props;
        const { list } = softstockinObj;
        const { pageSize } = softstockinentityObj;
        const { id: search_billId } = list[index];
        const param = { search_billId, pageSize, pageIndex: 0, sortMap: sortParam };
        actions['masterDetailOnesoftstockin'].loadsoftstockinentityList(param);
    }
    render() {
        const _this = this;
        let { delModalVisible } = _this.state;
        let {
            showLoading,
            softstockinObj,
            softstockinentityObj,
            showsoftstockinentityLoading,
            selectIndex,
            queryParam
        } = this.props;

        let { list } = softstockinObj;
        //  数据为空，按钮disable
        const btnForbid = list.length > 0 ? false : true;
        const { id } = list[selectIndex] || {};

        return (
            <div className="master-detail-one">
                <Header title='软件入库单' />
                <SearchArea queryParam={queryParam} softstockinObj={softstockinObj} clearRowFilter={this.clearRowFilter} />
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
                        disabled={btnForbid}
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
                        disabled={btnForbid}
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
                        onClick={() => print.onPrint({ id: id, selectIndex: selectIndex }, { nodekey: 'softstockin', funCode: 'softstockin', serverUrl: `${GROBAL_HTTP_CTX}/softstockin/softstockin/dataForPrint` })}
                    >
                        打印
                        </Button>
                </div>
                <Grid
                    ref={(el) => this.grid = el}
                    data={softstockinObj.list}
                    rowKey={(r, i) => i}
                    columns={this.softstockinColumn()}
                    multiSelect={false}
                    dragborder={true}
                    showFilterMenu={true} //是否显示行过滤菜单
                    filterable={_this.state.filterable}//是否开启过滤数据功能
                    onFilterChange={_this.onFilterChange}  // 触发过滤输入操作以及下拉条件的回调
                    onFilterClear={_this.onFilterClear} //清除过滤条件的回调函数，回调参数为清空的字段
                    afterRowFilter={_this.afterRowFilter} //控制栏位的显示/隐藏
                    onRowClick={(record, index) => {
                        // 获取子表数据
                        actions.masterDetailOnesoftstockin.updateState({ selectIndex: index }); // 更新默认主表行 数据
                        const { list } = softstockinObj;
                        const { pageSize } = softstockinentityObj;
                        const { id: search_billId } = list[index];
                        const param = { search_billId, pageSize, pageIndex: 0 };
                        actions.masterDetailOnesoftstockin.loadsoftstockinentityList(param);
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
                        ...this.getBasicPage(softstockinObj),
                        freshData: pageSize => _this.freshData(pageSize, "softstockinObj"),
                        onDataNumSelect: (index, value) => _this.onDataNumSelect(index, value, "softstockinObj"),
                        dataNum: _this.getDataNum(softstockinObj.pageSize),
                    }}
                />
                <div className="table-space"> </div>
                <div className='gird-parent'>
                    <Tabs>
                        <TabPane tab='入库登记单详情' key="softstockinentity">
                            <Grid
                                data={softstockinentityObj.list}
                                rowKey={(r, i) => i}
                                columns={this.softstockinentityColumn()}
                                multiSelect={false}
                                sort={{
                                    mode: 'multiple',
                                    backSource: true,
                                    sortFun: _this.softstockinentitySortFun
                                }}
                                // 分页
                                paginationObj={{
                                    ...this.getBasicPage(softstockinentityObj),
                                    freshData: pageSize => _this.freshData(pageSize, "softstockinentityObj"),
                                    onDataNumSelect: (index, value) => _this.onDataNumSelect(index, value, "softstockinentityObj"),
                                    dataNum: _this.getDataNum(softstockinentityObj.pageSize),
                                }}
                                loading={{ show: (!showLoading && showsoftstockinentityLoading), loadingType: "line" }}
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
