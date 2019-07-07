
import React, {Component} from 'react';
import {actions} from 'mirrorx';
import moment from 'moment'
import {Tooltip} from 'tinper-bee';
import Grid from 'components/Grid';
import Header from 'components/Header';
import Button from 'components/Button';
import Alert from 'components/Alert';
import ButtonRoleGroup from 'components/ButtonRoleGroup';
import SearchArea from '../SearchArea';
import PopupModal from '../PopupModal';

import {deepClone, Info, success,getHeight,getPageParam,getSortMap} from "utils";
import './index.less';

const formatDate = "YYYY-MM-DD HH:mm:ss";

class IndexView extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableHeight: 0,
            selectedIndex: 0, //默认选中行
            editModelVisible: false,
            btnFlag: 0,
            delModalVisible: false, //删除弹框
    filterable: false,
        }

    }
    componentWillMount() {
        //计算表格滚动条高度
        this.resetTableHeight(true);
    }
    componentDidMount() {
        this.onRefreshList();
    }

    onRefreshList = () => {
        actions.popupEditsoftbaseinfo.loadList(this.props.queryParam);
    }

    /**
     *
     * @param {Number} pageIndex 跳转指定页数
     */
    freshData = (pageIndex) => {
        this.onPageSelect(pageIndex, 0);
    }

    /**
     *
     * @param {*} index 跳转指定页数
     * @param {*} value 设置一页数据条数
     */
    onDataNumSelect = (index, value) => {
        this.onPageSelect(value, 1);
    }

    /**
     *
     * @param {Number} value  pageIndex 或者 pageIndex
     * @param {Number} type 为0标识为 pageIndex,为1标识 pageSize
     */
    onPageSelect = (value, type) => {
        let queryParam = deepClone(this.props.queryParam);
        let {pageIndex, pageSize} = getPageParam(value, type,queryParam.pageParams);
        queryParam['pageParams'] = {pageIndex, pageSize};
        this.setState({selectedIndex: 0}); //默认选中第一行
        actions.popupEditsoftbaseinfo.loadList(queryParam);
    }

    /**
     *
     * @param {Number} btnFlag 弹框框状态 0为添加、1为修改、2为详情
     */
    onClickShowModel = (btnFlag) => {
        this.setState({editModelVisible: true, btnFlag});
    }

    /**
     * 关闭修改model
     */
    onCloseEdit = () => {
        this.setState({editModelVisible: false, btnFlag: -1});
    }

    /**
     *
     * @param {Number} type 1、取消 2、确定
     * @returns {Promise<void>}
     */
    confirmGoBack(type) {
        this.setState({delModalVisible: false});
        if (type === 1) { // 确定
            const {list} = this.props;
            const {selectedIndex: index} = this.state;
            const record = list[index];
            actions.popupEditsoftbaseinfo.removeList(record);
        }
    }

    /**
     * 删除modal 显示
     */
    onClickDel = () => {
        let {list} = this.props;
        if (list.length > 0) {
            this.setState({
                delModalVisible: true
            });
        } else {
            Info("数据为空，不能删除");
        }
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
    actions.popupEditsoftbaseinfo.loadList(queryParam);
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
    actions.popupEditsoftbaseinfo.loadList(queryParam);
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
        actions.popupEditsoftbaseinfo.updateState({queryParam}); //缓存查询条件
        actions.popupEditsoftbaseinfo.loadList(queryParam);
    }
    this.setState({filterable: status});
}
clearRowFilter = () => {
    this.setState({filterable: false});
}

    column = () => {
        const column = [
        {
            title: "物资编号",
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
            dataIndex: "wzName",
            key: "wzName",
            width: 150,
            sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
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

        return column;
    }
    
    /**
     * 导出excel
     */
    export = () => {
        this.grid.exportExcel();
    }
    /**
     * 重置表格高度计算回调
     *
     * @param {Boolean} isopen 是否展开
     */
    resetTableHeight = (isopen) => {
        let tableHeight = 0;
        if (isopen) {
            //展开的时候并且适配对应页面数值px
            tableHeight = getHeight() - 420
        } else {
            //收起的时候并且适配对应页面数值px
            tableHeight = getHeight() - 270
        }
        this.setState({ tableHeight });
    }
/**
 *
 *排序属性设置   
 * @param {Array} sortParam 排序参数对象数组
 */
sortFun = (sortParam) => {
    let {queryParam} = this.props;
    queryParam.sortMap = getSortMap(sortParam);
    actions['popupEditsoftbaseinfo'].loadList(queryParam);
}
    render() {
        const _this = this;
        let {list, showLoading, pageIndex, totalPages, total} = _this.props;
        let {editModelVisible, selectedIndex, btnFlag, delModalVisible,tableHeight} = _this.state;
        let paginationObj = {   // 分页
            activePage: pageIndex,//当前页
            total: total,//总条数
            items: totalPages,
            freshData: _this.freshData,
            onDataNumSelect: _this.onDataNumSelect,
        }

        let btnForbid = list.length > 0 ? false : true;
        const {id} = list[selectedIndex] || {};

        return (
            <div className='single-table-popup'>
                <Header title='物资基础信息'/>
                <SearchArea
                {...this.props}
                onCloseEdit={this.onCloseEdit}
                onCallback={this.resetTableHeight}
                clearRowFilter={this.clearRowFilter}
                />
                <div className='table-header'>
                        <Button
                            role="add"
                            colors="primary"
                            className="ml8"
                            onClick={() => {
                                _this.onClickShowModel(0);
                            }}
                        >新增</Button>
                        <Button
                            role="update"
                            shape="border"
                            className="ml8"
                            disabled={btnForbid}
                            onClick={() => {
                                _this.onClickShowModel(1);
                            }}
                        >修改</Button>
                        <Button
                            role="check"
                            shape="border"
                            className="ml8"
                            disabled={btnForbid}
                            onClick={() => {
                                _this.onClickShowModel(2);
                            }}
                        >详情</Button>
                        <Button
                            role="delete"
                            shape="border"
                            className="ml8"
                            disabled={btnForbid}
                            onClick={_this.onClickDel}>
                            删除
                        </Button>
                    <Alert show={delModalVisible} context="是否要删除 ?"
                           confirmFn={() => {
                               _this.confirmGoBack(1);
                           }}
                           cancelFn={() => {
                               _this.confirmGoBack(2);
                           }}
                    />
                </div>
                <div className="gird-parent">
                    <Grid
                        ref={(el) => this.grid = el} //存模版
                        data={list}
                        rowKey={(r, i) => i}
                        columns={this.column()}
                        paginationObj={paginationObj}
                        selectedRow={this.selectedRow}
                        multiSelect={false}
                        onRowClick={(record, index) => {
                            _this.setState({selectedIndex: index, editModelVisible: false});
                        }}
                        rowClassName={(record, index, indent) => {
                            if (_this.state.selectedIndex === index) {
                                return 'selected';
                            } else {
                                return '';
                            }
                        }}
                        showHeaderMenu={true}
                        showFilterMenu={true} //是否显示行过滤菜单
                        filterable={_this.state.filterable}//是否开启过滤数据功能
                        onFilterChange={_this.onFilterChange}  // 触发过滤输入操作以及下拉条件的回调
                        onFilterClear={_this.onFilterClear} //清除过滤条件的回调函数，回调参数为清空的字段
                        afterRowFilter={_this.afterRowFilter} //控制栏位的显示/隐藏
                        sort={{  
                            mode: 'multiple',
                            backSource: true,
                            sortFun: _this.sortFun
                        }}
                        loading={{show: showLoading, loadingType: "line"}}
                        scroll={{ y: tableHeight }}
                        sheetHeader={{height: 30, ifshow: false}}
                    />
                </div>

                <PopupModal
                    editModelVisible={editModelVisible}
                    onCloseEdit={this.onCloseEdit}
                    currentIndex={selectedIndex}
                    btnFlag={btnFlag}
                    list={list}
                />
            </div>
        )

    }
}

export default IndexView;


