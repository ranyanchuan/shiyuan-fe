/**
 * A2单表行内编辑示例
 */

//React组件
import React, { Component } from 'react';
//状态管理
import { actions } from 'mirrorx';
//Tinper-bee 组件库
import { Loading, Message } from 'tinper-bee';
//日期处理
import moment from 'moment'

//工具类
import { uuid, deepClone, success, Error, Info, getButtonStatus, getHeight, getPageParam, getSortMap } from "utils";
import { isMoment } from 'utils/tools';

//Grid组件
import Grid from 'components/Grid';
//布局类组件
import Header from 'components/Header';
//项目级按钮
import Button from 'components/Button';
//项目级提示框
import Alert from 'components/Alert';
//按钮权限组件
import ButtonRoleGroup from 'components/ButtonRoleGroup';

//搜索区组件
import SearchAreaForm from '../Search-area';
//行编辑组件工厂
import FactoryComp from 'components/FactoryComp';

//组件样式引用
import './index.less';


class IndexView extends Component {
    /**
     * Creates an instance of InlineEdit.
     * @param {*} props
     * @memberof InlineEdit
     */
    constructor(props) {
        super(props);
        this.state = {
            tableHeight: 0,
            showPop: false,//删除需要的状态
            showPopCancel: false,//取消提示的状态
            validate: false,
            refwzNumberDropData: null,
            filterable: false,
        }
    }

    //缓存数据
    oldData = [];

    componentWillMount() {
        //计算表格滚动条高度
        this.resetTableHeight(true);
    }
    /**
     * 渲染后执行的函数
     *
     * @memberof InlineEdit
     */
    componentDidMount() {
        //生命周期加载数据
        actions.inlineEditlicensesoft.loadList(this.props.queryParam);//初始化Grid数据
    }

    column = () => {
        //定义Grid的Column
        const column = [
            {
                title: "流水号",
                dataIndex: "serialId",
                key: "serialId",
                width: 200,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
                render: (text, record, index) => {
                    return (
                        <FactoryComp
                            type='FormControl'//业务组件类型
                            codeType='1'
                            codeRule='licenseNo'
                            value={text}//初始化值
                            field='serialId'//修改的字段
                            dataIndex='serialId'
                            index={index}//字段的行号
                            required={false}
                            record={record}//记录集用于多字段处理
                            onChange={this.changeAllData}//回调函数
                            onValidate={this.onValidate}//校验的回调
                            conlumname='serial_id'
                        />
                    )
                }
            },
            {
                title: "SN",
                dataIndex: "license",
                key: "license",
                width: 200,
                sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
                render: (text, record, index) => {
                    return (
                        <FactoryComp
                            type='FormControl'//业务组件类型
                            value={text}//初始化值
                            field='license'//修改的字段
                            dataIndex='license'
                            index={index}//字段的行号
                            required={false}
                            record={record}//记录集用于多字段处理
                            onChange={this.changeAllData}//回调函数
                            onValidate={this.onValidate}//校验的回调
                            conlumname='license'
                        />
                    )
                }
            },
            {
                title: "物资编号",
                dataIndex: "wzNumber",
                key: "wzNumber",
                width: 200,
                exportKey: "wzName",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: this.state.refwzNumberDropData,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.refwzNumberDropData) {
                        let param = {
                            distinctParams: ['wzNumber']
                        }
                        actions['inlineEditlicensesoft'].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return { key: item['wzName'], value: item['wzNumber'] }
                            });

                            this.setState({
                                refwzNumberDropData: vals
                            })
                        })
                    }
                },
                render: (text, record, index) => {
                    return (
                        <FactoryComp
                            type='RefWithInput'//业务组件类型
                            value={text}//初始化值
                            field='wzNumber'//修改的字段
                            dataIndex='wzNumber'
                            index={index}//字段的行号
                            required={false}
                            record={record}//记录集用于多字段处理
                            onChange={this.changeAllData}//回调函数
                            onValidate={this.onValidate}//校验的回调
                            title={'物资编号'}
                            param={{
                                refCode: 'wzBasicInfo'
                            }}
                            refType={6}
                            refCode={'wzBasicInfo'}
                            refName={'wzName'}
                            refPk={'wzNumber'}
                            refPath={`${GROBAL_HTTP_CTX}/common-ref`
                            }
                            conlumname='wz_number'
                        />
                    )
                }
            },
            {
                title: "生效日期",
                dataIndex: "startDate",
                key: "startDate",
                width: 200,
                sorter: true,
                filterDropdown: "hide",
                filterType: "daterange",
                filterDropdownType: "daterange",
                render: (text, record, index) => {
                    return (
                        <FactoryComp
                            type='DatePicker'//业务组件类型
                            value={text}//初始化值
                            field='startDate'//修改的字段
                            dataIndex='startDate'
                            index={index}//字段的行号
                            required={false}
                            record={record}//记录集用于多字段处理
                            onChange={this.changeAllData}//回调函数
                            onValidate={this.onValidate}//校验的回调
                            conlumname='start_date'
                        />
                    )
                }
            },
            {
                title: "过期日期",
                dataIndex: "endDate",
                key: "endDate",
                width: 200,
                sorter: true,
                filterDropdown: "hide",
                filterType: "daterange",
                filterDropdownType: "daterange",
                render: (text, record, index) => {
                    return (
                        <FactoryComp
                            type='DatePicker'//业务组件类型
                            value={text}//初始化值
                            field='endDate'//修改的字段
                            dataIndex='endDate'
                            index={index}//字段的行号
                            required={false}
                            record={record}//记录集用于多字段处理
                            onChange={this.changeAllData}//回调函数
                            onValidate={this.onValidate}//校验的回调
                            conlumname='end_date'
                        />
                    )
                }
            },
        ];

        return column;
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
        actions.inlineEditlicensesoft.loadList(queryParam);
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
        actions.inlineEditlicensesoft.loadList(queryParam);
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
            actions.inlineEditlicensesoft.updateState({ queryParam }); //缓存查询条件
            actions.inlineEditlicensesoft.loadList(queryParam);
        }
        this.setState({ filterable: status });
    }
    clearRowFilter = () => {
        this.setState({ filterable: false });
    }

    /**
     * 同步修改后的数据不操作State
     *
     * @param {string} field 字段
     * @param {any} value 值
     * @param {number} index 位置
     */
    changeAllData = (field, value, index, refname) => {
        let oldData = this.oldData;
        let _sourseData = deepClone(this.props.list);

        if (isMoment(value)) {
            value = value.format('YYYY-MM-DD hh:mm:ss');
        }

        if (value === true || value === false) {
            value = value.toString();
        }

        oldData[index][field] = value;

        if (refname) {
            oldData[index][refname.refNameKey] = refname.refNameValue;
        }

        //有字段修改后去同步左侧对号checkbox
        if (!_sourseData[index]['_checked']) {
            _sourseData[index]['_checked'] = true;
            actions.inlineEditlicensesoft.updateState({ list: _sourseData });
        }
        oldData[index]['_checked'] = true;
        this.oldData = oldData;
    }

    /**
     * 处理验证后的状态
     *
     * @param {string} field 校验字段
     * @param {objet} flag 是否有错误
     * @param {number} index 位置
     */
    onValidate = (field, flag, index) => {
        //只要是修改过就启用校验
        if (this.oldData.length > 0) {
            this.oldData[index][`_${field}Validate`] = (flag == null);
        }

    }

    /**
     * 点击多选框回调函数
     *
     * @param {object} selectData 选择的数据
     * @param {object} record 当前行数据，空为点击全选
     * @param {number} index 当前索引
     */
    getSelectedDataFunc = (selectData, record, index) => {
        let { list } = this.props;
        let _list = deepClone(list);
        //当第一次没有同步数据
        // if (this.oldData.length == 0) {
        //     this.oldData = deepClone(list);
        // }
        //同步list数据状态
        if (index != undefined) {
            _list[index]['_checked'] = !_list[index]['_checked'];
        } else {//点击了全选
            if (selectData.length > 0) {//全选
                _list.map(item => {
                    if (!item['_disabled']) {
                        item['_checked'] = true
                    }
                });
            } else {//反选
                _list.map(item => {
                    if (!item['_disabled']) {
                        item['_checked'] = false
                    }
                });
            }
        }
        actions.inlineEditlicensesoft.updateState({ selectData, list: _list });
    }
    /**
     * 跳转指定页码
     *
     * @param {*} pageIndex
     */
    freshData = (pageIndex) => {
        this.onPageSelect(pageIndex, 0);
    }

    /**
     * 分页  跳转指定页数和设置一页数据条数
     *
     * @param {*} index
     * @param {*} value
     */
    onDataNumSelect = (index, value) => {
        this.onPageSelect(value, 1);
    }

    /**
     * type为0标识为pageIndex,为1标识pageSize
     *
     * @param {*} value
     * @param {*} type
     */
    onPageSelect = (value, type) => {
        let queryParam = deepClone(this.props.queryParam); // 深拷贝查询条件从action里
        let { pageIndex, pageSize } = getPageParam(value, type, queryParam.pageParams);
        queryParam['pageParams'] = { pageIndex, pageSize };
        actions.inlineEditlicensesoft.updateState(queryParam); // 更新action queryParam
        actions.inlineEditlicensesoft.loadList(queryParam);
    }
    /**
     * 过滤数组中的非法null
     *
     * @param {array} arr
     */
    filterArrayNull = (arr) => {
        return arr.filter(item => (item != null));
    }
    /**
     * 检查是否可选状态
     *
     */
    hasCheck = () => {
        let { selectData, list } = this.props;
        let flag = false;
        selectData.forEach(item => {
            if (item._checked == true) {
                flag = true;
            }
        });
        list.forEach(item => {
            if (item._checked == true) {
                flag = true;
            }
        });
        return flag
    }

    //新增数据模版
    newDataTmp = {
        _edit: true,
        _isNew: true,
        _checked: false,
        _disabled: false,
        _flag: false,
        serialId: '',
        license: '',
        wzNumber: '',
        startDate: moment().format('YYYY-MM-DD hh:mm:ss'),
        endDate: moment().format('YYYY-MM-DD hh:mm:ss'),
        billId: '',
        wzName: '',
    }

    /**
     * 新增行数据
     */
    handlerNew = () => {


        console.log("props:",this.props);
        let newData = deepClone(this.props.list);//克隆原始数据


        
        console.log("newData:",newData);
        //这里是新增后的新数据模板，用于默认值
        let tmp = {
            key: uuid(),
            ...this.newDataTmp
        }

        //当第一次新增的时候
        // 禁用其他checked
        //重置表头状态
        if (this.oldData.length <= 0) {
            newData.forEach(item => {
                item['_disabled'] = true;
                item['_checked'] = false;
            })
            this.grid.resetColumns(this.column());
        }

        this.oldData.unshift(tmp);//插入到最前
        newData.unshift(tmp);

        if (this.oldData.length != 0) {
            for (let index = 0; index < this.oldData.length; index++) {
                const element = this.oldData[index];
                for (let i = 0; i < newData.length; i++) {
                    if (element.key === newData[i].key) {
                        newData[i] = { ...element };
                        break;
                    }
                }
            }
        }
        console.log(" ---oldData---- ", this.oldData);
        //保存处理后的数据，并且切换操作态'新增' this.oldData.concat(
        actions.inlineEditlicensesoft.updateState({ list: newData, status: "new", rowEditStatus: false, selectData: [] });
    }

    /**
     * 修改
     */
    onClickUpdate = () => {
        //当前行数据设置编辑态
        let editData = this.props.list.map(item => {
            item['_edit'] = true;
            item['_checked'] = false;
            item['_status'] = 'edit';
            return item
        });

        //重置操作栏位
        this.grid.resetColumns(this.column());
        //同步操作数据
        this.oldData = deepClone(editData);
        //保存处理后的数据，并且切换操作态'编辑'
        actions.inlineEditlicensesoft.updateState({ list: editData, status: "edit", rowEditStatus: false });
    }

    /**
     * 下载模板
     *
     */
    onClickDownloadTemplate = () => {
        window.open(`${GROBAL_HTTP_CTX}/licensesoft/licensesoft/excelTemplateDownload`);
    }


    /**
     * 根据key关联对应数据后校验
     *
     * @param {array} data 要关联数据
     * @param {array} list 被关联数据
     * @returns
     */
    filterList = (data, list, key) => {
        let newList = list.slice();
        let selectList = []
        data.forEach((_data) => {
            newList.forEach((item, i) => {
                if (_data[key] === item[key] && item['_checked']) {
                    item['_validate'] = true;
                    selectList.push(_data)
                }
            });
        });
        return {
            newList,
            selectList
        };
    }
    /**
     * 验证数据否正确
     *
     * @param {array} data 欲验证的数据
     * @returns {bool}
     */
    isVerifyData = (data) => {
        let flag = true;
        let pattern = /Validate\b/;//校验的正则结尾


        data.forEach((item, index) => {
            let keys = Object.keys(item);
            //如果标准为false直接不参与计算说明已经出现了错误
            if (flag) {
                for (let i = 0; i < keys.length; i++) {
                    if (pattern.test(keys[i])) {
                        if (data[index][keys[i]]) {
                            flag = true;
                        } else {
                            flag = false;
                            break;
                        }
                    }
                }
            }
        });
        return flag
    }

    /**
     * 保存
     */
    onClickSave = async () => {
        let { status, list } = this.props;
        let filterResult = null;
        let ajaxFun = null;
        let msg = "请勾选数据后再新增";
        switch (status) {
            case 'new':
                filterResult = this.filterList(this.oldData, list, 'key');
                ajaxFun = actions.inlineEditlicensesoft.adds;
                break;
            case 'edit':
                filterResult = this.filterList(this.oldData, list, 'id');
                ajaxFun = actions.inlineEditlicensesoft.updates;
                msg = '请勾选数据后再更新';
                break;
            default:
                break;
        }

        if (filterResult.selectList.length > 0) {
            //开始校验actions
            await actions.inlineEditlicensesoft.updateState({ list: filterResult.newList });
            //检查是否验证通过
            if (this.isVerifyData(filterResult.selectList)) {

                let newResult = await ajaxFun(filterResult.selectList);
                if (newResult) {
                    this.oldData = [];
                }
            } else {
                Info('数据填写不完整')
            }
        } else {
            Info(msg);
        }
    }
    /**
     * 删除询问Pop
     *
     */
    onClickDelConfirm = () => {
        let { selectData } = this.props;
        if (selectData.length > 0) {
            this.setState({
                showPop: true
            });
        } else {
            Info('请勾选数据后再删除');
        }
    }
    /**
     * 删除
     */
    onClickDel = async () => {
        let { selectData } = this.props;
        let delResult = await actions.inlineEditlicensesoft.removes(selectData);
        if (delResult) {
            this.oldData = [];
        }
        this.setState({
            showPop: false
        });
    }

    /**
     * 取消
     *
     */
    onClickPopCancel = () => {
        this.setState({
            showPop: false
        });
    }
    /**
     * 表格内的取消
     */
    onClickCancel = () => {
        //检查是否有修改过的选中
        if (this.hasCheck()) {
            this.setState({ showPopCancel: true });
        } else {
            this.oldData = [];//清空上一次结果
            //重置store内的数据
            actions.inlineEditlicensesoft.resetData(true);
            //清空选中的数据
            actions.inlineEditlicensesoft.updateState({ selectData: [], rowEditStatus: true });
        }
    }
    /**
     *  新增或修改给出的确定
     *
     */
    onClickPopUnSaveOK = () => {
        //重置store内的数据
        actions.inlineEditlicensesoft.resetData(true);
        //清空选中的数据
        actions.inlineEditlicensesoft.updateState({ selectData: [], rowEditStatus: true });
        this.setState({ showPopCancel: false });
        this.oldData = [];
    }
    /**
     *  新增或修改给出的取消
     *
     */
    onClickPopUnSaveCancel = () => {
        this.setState({ showPopCancel: false });
    }
    /**
     * 导出数据
     *
     */
    onClickExport = () => {
        this.grid.exportExcel();
    }


    /**
     * 重置表格高度计算回调
     *
     * @param {bool} isopen 是否展开
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
        let { queryParam } = this.props;
        queryParam.sortMap = getSortMap(sortParam);
        actions['inlineEditlicensesoft'].loadList(queryParam);
    }
    render() {
        const _this = this;
        let { showPop, showPopCancel, tableHeight } = _this.state;
        let { list, showLoading, pageIndex, pageSize, totalPages, total, status, rowEditStatus, queryParam, selectIndex } = _this.props;
        //分页条数据
        let paginationObj = {
            activePage: pageIndex,//当前页
            total: total,//总条数
            items: totalPages,
            freshData: _this.freshData,//刷新数据
            onDataNumSelect: _this.onDataNumSelect,//选择记录行
            disabled: status !== "view"//分页条禁用状态
        }
        const { id } = list[selectIndex] || {};
        let btnForbid = list.length > 0 ? false : true;

        return (
            <div className='inline-edit'>
                <Header title='软件license' />
                <div className='table-header'>
                    <Button role="add"
                        disabled={getButtonStatus('add', status)}
                        className="ml8"
                        colors="primary"
                        onClick={this.handlerNew}
                    >
                        新增
                    </Button>
                 
                </div>
                <div className='grid-parent'>
                    <Grid
                        ref={(el) => this.grid = el}//ref用于调用内部方法
                        data={list}//数据
                        rowKey={r => r.id ? r.id : r.key}
                        columns={this.column()}//定义列
                        paginationObj={paginationObj}//分页数据
                        columnFilterAble={rowEditStatus}//是否显示右侧隐藏行
                        showHeaderMenu={rowEditStatus}//是否显示菜单
                        showFilterMenu={true} //是否显示行过滤菜单
                        filterable={_this.state.filterable}//是否开启过滤数据功能
                        onFilterChange={_this.onFilterChange}  // 触发过滤输入操作以及下拉条件的回调
                        onFilterClear={_this.onFilterClear} //清除过滤条件的回调函数，回调参数为清空的字段
                        afterRowFilter={_this.afterRowFilter} //控制栏位的显示/隐藏
                        dragborder={rowEditStatus}//是否调整列宽
                        draggable={rowEditStatus}//是否拖拽
                        syncHover={rowEditStatus}//是否同步状态
                        getSelectedDataFunc={this.getSelectedDataFunc}//选择数据后的回调
                        scroll={{ y: tableHeight }}
                        sort={{
                            mode: 'multiple',
                            backSource: true,
                            sortFun: _this.sortFun
                        }}
                        onRowClick={(record, index) => {
                            actions.inlineEditlicensesoft.updateState({ selectIndex: index }); // 更新默认主表行 数据
                        }}
                        rowClassName={(record, index, indent) => { //判断是否选中当前行
                            return selectIndex === index ? "selected" : "";
                        }}
                    />
                </div>

            </div>
        )
    }
}

export default IndexView;
