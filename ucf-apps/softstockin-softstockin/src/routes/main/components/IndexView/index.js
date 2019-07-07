import React, { Component } from "react";
import { actions } from "mirrorx";
import { Loading, Icon, Modal } from "tinper-bee";
import queryString from 'query-string';
import moment from "moment";
import FormList from 'components/FormList';
import Grid from 'components/Grid';
import Header from "components/Header";
import Button from 'components/Button';
import Alert from 'components/Alert';
import MainChild from '../MainChild';
import FactoryComp from 'components/FactoryComp';
import RefCommon from 'components/RefCommon';
import SelectMonth from 'components/SelectMonth';
import PreCode from 'components/PreCode';
import { isMoment, handleEntity } from 'utils/tools';

import { uuid, deepClone, getCookie, Info, getPageParam } from "utils";
import './index.less'

let titleArr = ["新增", "修改", "详情"];

class IndexView extends Component {



    constructor(props) {
        super(props);
        const searchObj = queryString.parse(props.location.search);
        let { btnFlag: flag, search_id: searchId, from, ...oterSearch } = searchObj;
        const btnFlag = Number(flag);

        this.state = {
            showPopAlert: false,
            showPopBackVisible: false,
            searchId: searchId || "",
            btnFlag: btnFlag,
            selectData: [],
            ...oterSearch,
        }
    }

    //缓存数据
    oldData = []

    //缓存数据
    oldDataLicense = [];

    componentDidMount() {
        const searchObj = queryString.parse(this.props.location.search);
        let { btnFlag: flag, search_id: searchId, from } = searchObj;
        const { queryParent } = this.props;
        //非新增状态 当 没有提前设置主数据时 根据 search_id 向后台请求主表数据
        if (!queryParent.id && flag > 0) {
            const btnFlag = Number(flag);
            this.setState({ btnFlag, searchId });
            if (btnFlag && btnFlag > 0) {
                const param = { sortMap: [], whereParams: [{ key: "id", value: searchId, condition: "EQ" }] };
                actions.masterDetailMainsoftstockin.getQueryParent(param); // 获取主表
            }
        }
    }

    componentWillUnmount() {
        const { history } = this.props;
        if (history.action === "POP") {
            actions.masterDetailMainsoftstockin.initState();
        }
    }






    /**
     * 同步修改后的数据不操作State
     *
     * @param {string} field 字段
     * @param {any} value 值
     * @param {Number} index 位置
     */
    changeAllData = (field, value, index, refname) => {
        if (isMoment(value)) {
            value = value.format('YYYY-MM-DD hh:mm:ss');
        }

        if (value === true || value === false) {
            value = value.toString();
        }

        this.oldData[index][field] = value;

        //参照额外存储refname的值
        if (refname) {
            this.oldData[index][refname.refNameKey] = refname.refNameValue;
        }
    }

    /**
     * 处理验证后的状态
     *
     * @param {string} field 校验字段
     * @param {Object} flag 是否有错误
     * @param {Number} index 位置
     */
    // onValidate = (field, flag, index) => {
    //     //只要是修改过就启用校验
    //     if(this.oldData.length>index){
    //         this.oldData[index][`_${field}Validate`] = (flag == null);
    //     }
    // }

    /**
     * 清空
     */
    clearQuery() {
        this.props.form.resetFields();
        actions.masterDetailMainsoftstockin.updateState({ status: "view" });
        actions.masterDetailMainsoftstockin.initState({
            queryParent: {},
            querysoftstockinentityObj: { list: [], total: 0, pageIndex: 0 },
        });
    }

    softstockinentityColumn = [
        {
            title: "物资编码",
            dataIndex: "wzNumber",
            key: "wzNumber",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='FormControl'//业务组件类型
                        value={text}//初始化值
                        field='wzNumber'//修改的字段
                        dataIndex='wzNumber'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        conlumname='wz_number'
                    />
                )
            }
        },
        {
            title: "物资名称",
            dataIndex: "name",
            key: "name",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='RefWithInput'//业务组件类型
                        value={text}//初始化值
                        field='name'//修改的字段
                        dataIndex='name'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        title={'物资名称'}
                        param={{
                            refCode: 'wzBasicInfo'
                        }}
                        refType={6}
                        refCode={'wzBasicInfo'}
                        refName={'wzName'}
                        refPk={'name'}
                        refPath={`${GROBAL_HTTP_CTX}/common-ref`
                        }
                        conlumname='name'
                    />
                )
            }
        },
        {
            title: "物资类别",
            dataIndex: "type",
            key: "type",
            width: 200,
            render: (text, record, index) => {
                let enumData = [
                    {
                        key: '请选择',
                        value: '',
                    },
                    {
                        key: "办公软件",
                        value: "0"
                    },
                    {
                        key: "生产设计软件",
                        value: "1"
                    },
                ];
                return (
                    <FactoryComp
                        type='Select'//业务组件类型
                        value={text}//初始化值
                        field='type'//修改的字段
                        dataIndex='type'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        enums={enumData}
                        conlumname='type'
                    />
                )
            }
        },
        {
            title: "型号",
            dataIndex: "model",
            key: "model",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='FormControl'//业务组件类型
                        value={text}//初始化值
                        field='model'//修改的字段
                        dataIndex='model'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        conlumname='model'
                    />
                )
            }
        },
        {
            title: "规格描述",
            dataIndex: "description",
            key: "description",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='FormControl'//业务组件类型
                        value={text}//初始化值
                        field='description'//修改的字段
                        dataIndex='description'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        conlumname='description'
                    />
                )
            }
        },
        {
            title: "品牌",
            dataIndex: "brand",
            key: "brand",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='FormControl'//业务组件类型
                        value={text}//初始化值
                        field='brand'//修改的字段
                        dataIndex='brand'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        conlumname='brand'
                    />
                )
            }
        },
        {
            title: "使用地点",
            dataIndex: "address",
            key: "address",
            width: 200,
            render: (text, record, index) => {
                let enumData = [
                    {
                        key: '请选择',
                        value: '',
                    },
                    {
                        key: "科珠",
                        value: "1"
                    },
                    {
                        key: "云埔",
                        value: "2"
                    },
                    {
                        key: "连云",
                        value: "3"
                    },
                ];
                return (
                    <FactoryComp
                        type='Select'//业务组件类型
                        value={text}//初始化值
                        field='address'//修改的字段
                        dataIndex='address'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        enums={enumData}
                        conlumname='address'
                    />
                )
            }
        },
        {
            title: "申请数量",
            dataIndex: "r_qty",
            key: "r_qty",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='Integer'//业务组件类型
                        value={text}//初始化值
                        field='r_qty'//修改的字段
                        dataIndex='r_qty'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        conlumname='r_qty'
                    />
                )
            }
        },
        {
            title: "入库数量",
            dataIndex: "qty",
            key: "qty",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='Integer'//业务组件类型
                        value={text}//初始化值
                        field='qty'//修改的字段
                        dataIndex='qty'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        conlumname='qty'
                    />
                )
            }
        },
        {
            title: "预计单价",
            dataIndex: "price",
            key: "price",
            width: 200,
            render: (text, record, index) => {
                return (
                    <FactoryComp
                        type='InputNumber'//业务组件类型
                        value={text}//初始化值
                        field='price'//修改的字段
                        dataIndex='price'
                        index={index}//字段的行号
                        required={false}
                        record={record}//记录集用于多字段处理
                        onChange={this.changeAllData}//回调函数
                        onValidate={this.onValidate}//校验的回调
                        conlumname='price'
                    />
                )
            }
        },
    ];

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



    handleSelect = (value) => { //add 0623
        const querysoftstockinentityObj = deepClone(this.props.querysoftstockinentityObj);
        querysoftstockinentityObj.list = value;
        this.setState({ selectData: [] }); //清空选中的数据
        actions.masterDetailMainsoftstockin.updateState({ querysoftstockinentityObj, status: "edit", rowEditStatus: false });
    }

    /**
     * 新增行数据
     */
    handlerNew = () => {
        let list = this.oldData;
        const querysoftstockinentityObj = deepClone(this.props.querysoftstockinentityObj);

        let { list: querysoftstockinentityList } = querysoftstockinentityObj; // 获取子表数据
        // 如果是第一次添加，则从action取值
        if (list.length === 0) {
            list = querysoftstockinentityList;
        }
        // 行数据
        let tmp = {
            key: uuid(),
            _edit: true,
            _isNew: true,
            _checked: false,
            wzNumber: '',
            _wzNumberValidate: true,
            name: '',
            _nameValidate: true,
            type: '',
            _typeValidate: true,
            model: '',
            _modelValidate: true,
            description: '',
            _descriptionValidate: true,
            brand: '',
            _brandValidate: true,
            address: '',
            _addressValidate: true,
            r_qty: '',
            _r_qtyValidate: true,
            qty: '',
            _qtyValidate: true,
            price: '',
            _priceValidate: true,
        }
        list.unshift(tmp);//插入到最前
        //禁用其他checked
        for (let i = 0; i < list.length; i++) {
            if (!list[i]['_isNew']) {
                list[i]['_checked'] = false;
                list[i]['_status'] = 'new';
            }
        }
        //同步状态数据
        this.oldData = deepClone(list);

        //保存处理后的数据，并且切换操作态'新增'
        querysoftstockinentityObj.list = list;
        this.setState({ selectData: [] }); //清空选中的数据
        actions.masterDetailMainsoftstockin.updateState({ querysoftstockinentityObj, status: "new", rowEditStatus: false });
    }



    /**
     * 新增行数据
     */
    handlerNewLicense = () => {


        console.log("props:", this.props);
        let newDataLicense = deepClone(this.props.licenseList);//克隆原始数据


        console.log("newDataLicense:", newDataLicense);
        //这里是新增后的新数据模板，用于默认值
        let tmp = {
            key: uuid(),
            ...this.newDataTmp
        }

        //当第一次新增的时候
        // 禁用其他checked
        //重置表头状态
        // if (this.oldDataLicense.length <= 0) {
        //     newDataLicense.forEach(item => {
        //         item['_disabled'] = true;
        //         item['_checked'] = false;
        //     })
        //     this.grid.resetColumns(this.column());
        // }



        this.oldDataLicense.unshift(tmp);//插入到最前
        newDataLicense.unshift(tmp);

        if (this.oldDataLicense.length != 0) {
            for (let index = 0; index < this.oldDataLicense.length; index++) {
                const element = this.oldDataLicense[index];
                for (let i = 0; i < newDataLicense.length; i++) {
                    if (element.key === newDataLicense[i].key) {
                        newDataLicense[i] = { ...element };
                        break;
                    }
                }
            }
        }
        console.log(" ---oldDataLicense---- ", this.oldDataLicense);
        //保存处理后的数据，并且切换操作态'新增' this.oldData.concat(
        actions.inlineEditlicensesoft.updateState({ list: newDataLicense, status: "new", rowEditStatus: false, selectData: [] });
    }




    /**
     * 子表从其他状态切换到修改状态
     */
    onClickUpdate = () => {
        let list = this.oldData;
        const querysoftstockinentityObj = deepClone(this.props.querysoftstockinentityObj);

        let { list: querysoftstockinentityList } = querysoftstockinentityObj; // 获取子表数据
        // 如果是第一次修改，则从action取值
        if (list.length === 0) {
            list = querysoftstockinentityList;
        }
        //当前行数据设置编辑态
        for (const index in list) {
            list[index]['_checked'] = false;
            list[index]['_status'] = 'edit';
            list[index]['_edit'] = true;
        }
        //同步状态数据
        this.oldData = deepClone(list);
        //保存处理后的数据，并且切换操作态'编辑'
        querysoftstockinentityObj.list = list;
        this.setState({ selectData: [] }); //清空选中的数据
        actions.masterDetailMainsoftstockin.updateState({ querysoftstockinentityObj, status: "edit", rowEditStatus: false });
    }


    onClickDel = () => {
        const { selectData } = this.state;
        if (selectData.length === 0) {
            Info('请勾选数据后再删除');
        } else {
            this.setState({ showPopAlert: true });
        }
    }


    /**
     *
     * 删除子表选中的数据
     * @param {Number} type 1、取消 2、确定
     * @memberof Order
     */
    async confirmDel(type) {
        this.setState({ showPopAlert: false });
        if (type === 1) { // 确定
            const { selectData, searchId } = this.state;
            if (this.clearOldData()) {
                const { status } = await actions.masterDetailMainsoftstockin.delsoftstockinentity(selectData);
                if (status === "success") {
                    actions.masterDetailMainsoftstockin.queryChild({ search_billId: searchId }); // 获取子表
                    this.oldData = []; //清空用于编辑和添加的缓存数据
                }
            }
        }
        this.setState({ showPopAlert: false });
    }

    /**
     * @description 判断选中的行数据中是否有从后端的数据，有则后端删除，没有则前端删除
     */
    clearOldData = () => {
        const querysoftstockinentityObj = deepClone(this.props.querysoftstockinentityObj);
        let { list } = querysoftstockinentityObj;
        this.asyncOldDataOrList(list);
        let { selectData } = this.state;
        for (const elementSelect of selectData) {
            for (const [indexOld, elementOld] of list.entries()) {
                // 判断当前数据是否来自后端，如果是来自后端，后端删除,
                if (elementSelect.id && elementOld.id === elementSelect.id) {
                    return true;
                }
                // 判断当前数据是否新增，如果是新增，前端删除
                if (elementSelect.key && elementOld.key === elementSelect.key) {
                    list.splice(indexOld, 1);
                }
            }
        }
        this.oldData = list; //将数据加入缓存
        querysoftstockinentityObj.list = list;
        this.setState({ selectData: [] }); //清空选中的数据
        actions.masterDetailMainsoftstockin.updateState({ querysoftstockinentityObj });  //更新action里的子表数据
        return false
    }
    asyncOldDataOrList = (list) => {
        list.forEach((da, i) => {
            if (da.key === (this.oldData[i])['key']) {
                list[i] = this.oldData[i]
            }
        })
    }
    /**
     *
     * 返回上一级弹框提示
     * @param {Number} type 1、取消 2、确定
     * @memberof Order
     */
    async confirmGoBack(type) {
        this.setState({ showPopBackVisible: false });
        if (type === 1) { // 确定
            this.clearQuery();
            actions.routing.replace({ pathname: '/' });
        }
    }

    /**
     * 返回
     * @returns {Promise<void>}
     */

    onBack = async () => {
        const { btnFlag } = this.state;
        if (btnFlag === 2) { //判断是否为详情态
            const searchObj = queryString.parse(this.props.location.search);
            let { from } = searchObj;
            switch (from) {
                case undefined:
                    this.clearQuery();
                    actions.routing.replace({ pathname: '/' });
                    break;
                default:
                    window.parent.bpmCloseOrder ? window.parent.bpmCloseOrder() : window.history.go(-1);
            }

        } else {
            this.setState({ showPopBackVisible: true });
        }
    }


    /**
     *
     *对添加数据中的日期数据格式化
     * @param {Object} data form表单数据
     * @returns
     */
    filterDataParam = (data) => {
        for (const [index, detailItem] of data.entries()) {
            data[index] = handleEntity(detailItem);
        }
        return data;
    }

    /**
     *
     *验证子表的数据是否通过，
     * @param {*} data 子表数据集
     * @returns
     */
    filterListKey = (childData) => {
        const data = this.validateChild(childData);
        let flag = true;
        for (const [index, rowObj] of data.entries()) {
            for (const key in rowObj) {
                // 默认验证通过
                data[index]['_validate'] = false;
                // 只要一个值为空，验证不通过
                if (key.includes("Validate") && rowObj[key] === false) {
                    data[index]['_validate'] = true;
                    flag = false;
                    break
                }
            }
        }
        return { rowData: data, flag }
    }


    /**
     *
     *
     * @param {*} entity 获取主表数据
     * @returns
     */
    filterOrder = (entity) => {
        const btnFlag = Number(this.state.btnFlag);
        if (btnFlag === 1) {  //为主表添加编辑信息
            const { queryParent: rowData } = this.props;
            if (rowData && rowData.id) {
                entity.id = rowData.id;
                entity.ts = rowData.ts;
            }
        }

        return entity;
    }
    /**
     * 保存
     */
    onClickSave = async () => {
        const querysoftstockinentityObj = deepClone(this.props.querysoftstockinentityObj);
        let { form } = this.props;
        let entity = {};
        let formValidate = false;

        //对主表数据进行处理
        form.validateFields((error, value) => {
            if (!error) {
                entity = this.filterOrder(value);
                //entity.orderUser = decodeURIComponent(getCookie("_A_P_userId"));
                formValidate = true;
            }
        });

        //开始校验
        const { rowData, flag } = this.filterListKey(this.oldData);
        querysoftstockinentityObj.list = rowData;
        actions.masterDetailMainsoftstockin.updateState({ querysoftstockinentityObj: deepClone(querysoftstockinentityObj) });
        //检查是否验证通过
        if (flag && formValidate) {
            const softstockinentityList = this.filterDataParam(rowData);
            const sublist = { softstockinentityList };

            entity = handleEntity(entity);
            const param = { entity, sublist };
            await actions.masterDetailMainsoftstockin.adds(param);
            actions.masterDetailMainsoftstockin.updateState({ status: "view" });  // 更新按钮状态
            this.clearQuery();
        }

    }
    /**
     * 处理验证后的状态
     *
     * @param {string} field 校验字段
     * @param {Object} flag 是否有错误
     * @param {Number} index 位置
     */
    validateChild = (data) => {
        for (const [index, ele] of data.entries()) {
            for (const field in ele) {
                if (data[index][field] && data[index][`_${field}Validate`] !== undefined) {
                    data[index][`_${field}Validate`] = true;
                }
            }
        }
        return data;
    }

    /**
     *
     * @param {Number} pageIndex 指定页数
     */
    freshData = (pageIndex) => {
        this.onPageSelect(pageIndex, 0);
    }

    /**
     *
     * @param {Number} index 分页页数
     * @param {Number} value 风页条数
     */
    onDataNumSelect = (index, value) => {
        this.onPageSelect(value, 1);
    }

    /**
     *
     * @param {Number} value pageIndex 或者 pageSize
     * @param {Number} type type 为0标识为 pageIndex,为1标识 pageSize
     */
    onPageSelect = (value, type) => {
        const { querysoftstockinentityObj, queryParent } = this.props;
        const { pageIndex, pageSize } = getPageParam(value, type, querysoftstockinentityObj);
        const { id: search_billId } = queryParent;
        const temp = { search_billId, pageSize, pageIndex };
        actions.masterDetailMainsoftstockin.querysoftstockinentity(temp);
    }

    /**
     *
     * @param {*} selectData 点击多选框回调函数
     */
    getSelectedDataFunc = (selectData, record, index) => {

        console.log("select");
        this.setState({ selectData });
        let { querysoftstockinentityObj } = this.props;

        let _list = deepClone(querysoftstockinentityObj.list);
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
        querysoftstockinentityObj.list = _list;
        actions.masterDetailMainsoftstockin.updateState({ querysoftstockinentityObj });
    }


    closeModal() {
        actions.masterDetailMainsoftstockin.updateState({
            showModalCover: false
        });
        window.history.go(-1);
    }





    render() {
        const _this = this;
        const {
            querysoftstockinentityObj,
            showsoftstockinentityLoading,
            status, showLoading, form, queryParent: rowData,
            showModalCover,
            licenseList
        } = _this.props;


        const { showPopAlert, showPopBackVisible, btnFlag: flag } = _this.state;
        const btnFlag = Number(flag);

        const paginationObj = {   // 分页
            activePage: querysoftstockinentityObj.pageIndex,//当前页
            total: querysoftstockinentityObj.total,//总条数
            items: querysoftstockinentityObj.totalPages,
            freshData: _this.freshData,
            onDataNumSelect: _this.onDataNumSelect,
            dataNum: 1,
            disabled: status !== "view"
        }
        const btnForbid = querysoftstockinentityObj.list.length > 0 ? false : true;

        const rowEditStatus = btnFlag === 2 ? true : false;

        return (
            <div className='mainContainer'>
                <Loading showBackDrop={true} loadingType="line" show={showLoading} fullScreen={true} />
                <Alert
                    show={showPopBackVisible}
                    context="数据未保存，确定离开 ?"
                    confirmFn={() => {
                        _this.confirmGoBack(1)
                    }}
                    cancelFn={() => {
                        _this.confirmGoBack(2)
                    }} />
                <Header backFn={this.onBack} back title={titleArr[btnFlag]}>
                    <div className='head-btn'>
                        <Button shape="border" className="ml8" onClick={_this.onBack}>取消</Button>
                        {(btnFlag !== 2) &&
                            <Button colors="primary" className="ml8" onClick={_this.onClickSave}>保存</Button>
                        }
                    </div>

                </Header>
                <MainChild rowData={rowData} btnFlag={btnFlag} form={form} handleSelect={this.handleSelect}></MainChild>


                <div className='table-header'>
                    {/* <Button
                        disabled={btnFlag === 2}
                        className="ml8"
                        size='sm'
                        colors="primary"
                        onClick={this.handlerNew}>
                        新增
                    </Button> */}
                    <Button
                        shape="border"
                        disabled={btnFlag === 2 || btnForbid}
                        className="ml8"
                        size='sm'
                        onClick={this.onClickUpdate}>
                        修改
                    </Button>
                    <Button
                        shape="border"
                        disabled={btnFlag === 2 || btnForbid}
                        className="ml8"
                        size='sm'
                        onClick={this.onClickDel}>
                        删除
                    </Button>
                    <Alert
                        show={showPopAlert}
                        context="新增、修改数据未保存将无法生效，确定删除这些记录吗 ?"
                        confirmFn={() => {
                            _this.confirmDel(1)
                        }}
                        cancelFn={() => {
                            _this.confirmDel(2)
                        }} />
                </div>
                <div className='grid-parent'>
                    <Grid
                        ref={(el) => this.grid = el}
                        // data={querysoftstockinentityObj.list}
                        data={querysoftstockinentityObj.list}
                        rowKey={(r, i) => r.id ? r.id : r.key}
                        columns={this.softstockinentityColumn}
                        paginationObj={paginationObj}
                        columnFilterAble={rowEditStatus}
                        showHeaderMenu={rowEditStatus}
                        dragborder={rowEditStatus}
                        draggable={rowEditStatus}
                        syncHover={rowEditStatus}
                        getSelectedDataFunc={this.getSelectedDataFunc}
                        loading={{ show: (!showLoading && showsoftstockinentityLoading), loadingType: "line" }}
                    />
                </div>

                <div className='inline-edit'>
                    <Header title='软件license' />

                    <div className='table-header'>
                        <Button role="add"

                            className="ml8"
                            colors="primary"
                            onClick={this.handlerNewLicense}
                        >
                            新增
                        </Button>
                        <Button
                            role="update"
                            shape="border"

                            className="ml8"
                        // onClick={this.onClickUpdate}
                        >
                            修改
                        </Button>
                        <Button
                            role="delete"
                            shape="border"

                            className="ml8"
                        // onClick={this.onClickDelConfirm}
                        >
                            删除
                          </Button>



                    </div>
                    <div className='grid-parent'>
                        <Grid
                            ref={(el) => this.grid = el}//ref用于调用内部方法
                            data={licenseList}//数据
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
                            scroll={{ y: 200 }}
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
                    <Loading fullScreen={true} show={showLoading} />
                </div>



                <Modal
                    show={showModalCover}
                    onHide={this.close} >
                    <Modal.Header>
                        <Modal.Title>警告</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        未获取到单据信息
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.closeModal}>是</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }
}

export default FormList.createForm()(IndexView);