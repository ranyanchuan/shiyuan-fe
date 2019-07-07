
import React, {Component} from "react";
import {actions} from "mirrorx";
import {Col, Row, Checkbox, FormControl, Label,Switch} from "tinper-bee";
import FormList from 'components/FormList';
import {getValidateFieldsTrim} from "utils";
import FormError from 'components/FormError';
import Select from 'bee-select';
import moment from "moment";
import InputNumber from "bee-input-number";
import DatePicker from 'bee-datepicker';
import SelectMonth from 'components/SelectMonth';
import PopDialog from 'components/Pop';
import RefCommon from 'components/RefCommon';
import PreCode from 'components/PreCode';
import Radio from 'bee-radio';

import zhCN from "rc-calendar/lib/locale/zh_CN";
import 'bee-datepicker/build/DatePicker.css';
import './index.less'

const FormItem = FormList.Item;
const {Option} = Select;
const {YearPicker} = DatePicker;
const format = "YYYY-MM-DD HH:mm:ss";
const formatYYYY = "YYYY";
let titleArr = ["新增", "修改", "详情"];

class PopupModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            rowData: {},
            btnFlag: 0,
            cancelFlag: false
        }
    }

    async componentWillReceiveProps(nextProps) {
        let _this = this;
        let {btnFlag, currentIndex} = this.props;
        let {btnFlag: nextBtnFlag, currentIndex: nextCurrentIndex, editModelVisible} = nextProps;
        // 判断是否 btnFlag新弹框状态  currentIndex当前选中行
        if (btnFlag !== nextBtnFlag || currentIndex !== nextCurrentIndex) {
            _this.props.form.resetFields();
            // 防止网络阻塞造成btnFlag显示不正常
            this.setState({btnFlag: nextBtnFlag});
            if (nextBtnFlag !== 0 && editModelVisible) {
                let {list} = this.props;
                let rowData = list[nextCurrentIndex] || {};
                this.setState({rowData});
            }
        }

    }

    /**
     * 关闭Modal
     */
    onCloseEdit = () => {
        this.setState({rowData: {}, btnFlag: 0});
        this.props.onCloseEdit();
    }

    /**
     * 提交表单信息
     */
    onSubmitEdit = () => {
        let _this = this;
        let {btnFlag}=_this.state;
        _this.props.form.validateFields((err, _values) => {
            let values = getValidateFieldsTrim(_values);
            if (!err) {
                values = _this.onHandleSaveData(values);
                this.onCloseEdit();
                values.btnFlag=btnFlag; // 弹框状态标识
                actions.popupEditsoftbaseinfo.savesoftbaseinfo(values);
            }
        });
    }

    /**
     *
     * @description 处理保存数据
     * @param {Object} values 待处理数据
     */
    onHandleSaveData = (values) => {
        let _this = this,
            {rowData} = this.state,
            resObj = {};

        if (rowData) {
            resObj = Object.assign({}, rowData, values);
        }
        //TODO 年月日类型支持，修改
        if(resObj.year){
            resObj.year = resObj.year.format(formatYYYY);
        }
        //修改状态日期格式化
        if(resObj.applyTime){
            resObj.applyTime=resObj.applyTime.format(format);
        }
        _this.onHandleRef(resObj);
        return resObj;
    }

    onHandleRef = (values) => {
        let arr = [];
        for (let i = 0, len = arr.length; i < len; i++) {
            if(values[arr[i]]){
                let item = JSON.parse(values[arr[i]]);
                values[arr[i]] = item['refpk'];
            }
        }
    }

    /**
     *
     * @description 底部按钮是否显示处理函数
     * @param {Number} btnFlag 为页面标识
     * @returns footer中的底部按钮
     */
    onHandleBtns = (btnFlag) => {
        let _this = this;
        let btns = [

            {
                label: '取消',
                fun: this.onCloseEdit,
                shape: 'border'
            },
            {
                label: '确定',
                fun: _this.onSubmitEdit,
                colors: 'primary'
            },
        ];

        if (btnFlag == 2) {
            btns = [];
        }
        return btns;
    }


    render() {
        const _this = this;
        let {form, editModelVisible} = _this.props;
        let {rowData, btnFlag} = _this.state;
        let {getFieldProps, getFieldError} = form;

        let btns = _this.onHandleBtns(btnFlag);

        return (
            <PopDialog show={editModelVisible}
                       title={titleArr[btnFlag]}
                       size='lg'
                       btns={btns}
                       autoFocus={false}
                       enforceFocus={false}
                       close={this.onCloseEdit}
                       className="single-table-pop-model" >
                    <FormList>
       <FormItem  label={"物资编号"} >

                <PreCode
                    btnFlag={Number(typeof btnFlag != 'undefined' && btnFlag)}
                    billObjCode = {'wzNo'}
                    {
                        ...getFieldProps('wzNumber', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.wzNumber === 'undefined') ? "" : String(rowData.wzNumber)
 ,
                                validateTrigger: 'onBlur',
                                rules: [{
                                    type:'string', required: false, pattern:/\S+/ig, message: '请输入物资编号',
                                }],
                                onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ wzNumber: value });
    _this.setState({
        rowData:tempRow
    })
}
                                }
                            }
                        )
                    }
                />
            <FormError errorMsg={getFieldError('wzNumber')}/>
       </FormItem>
       <FormItem  label={"物资名称"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                  {
                    ...getFieldProps('wzName', {
                        initialValue: (typeof rowData === 'undefined' || typeof rowData.wzName === 'undefined') ? "" : String(rowData.wzName)
 ,
                        validateTrigger: 'onBlur',
                        rules: [{
                            type:'string',required: false
 ,pattern:/\S+/ig, message: '请输入物资名称',
                        }],
                        onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ wzName: value });
    _this.setState({
        rowData:tempRow
    })
}
                        }
                    }
                    )}
                />
            <FormError errorMsg={getFieldError('wzName')}/>
       </FormItem>
       <FormItem  label={"型号"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                  {
                    ...getFieldProps('model', {
                        initialValue: (typeof rowData === 'undefined' || typeof rowData.model === 'undefined') ? "" : String(rowData.model)
 ,
                        validateTrigger: 'onBlur',
                        rules: [{
                            type:'string',required: false
 ,pattern:/\S+/ig, message: '请输入型号',
                        }],
                        onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ model: value });
    _this.setState({
        rowData:tempRow
    })
}
                        }
                    }
                    )}
                />
            <FormError errorMsg={getFieldError('model')}/>
       </FormItem>
       <FormItem  label={"规格描述"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                  {
                    ...getFieldProps('description', {
                        initialValue: (typeof rowData === 'undefined' || typeof rowData.description === 'undefined') ? "" : String(rowData.description)
 ,
                        validateTrigger: 'onBlur',
                        rules: [{
                            type:'string',required: false
 ,pattern:/\S+/ig, message: '请输入规格描述',
                        }],
                        onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ description: value });
    _this.setState({
        rowData:tempRow
    })
}
                        }
                    }
                    )}
                />
            <FormError errorMsg={getFieldError('description')}/>
       </FormItem>
       <FormItem  label={"供应商"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                  {
                    ...getFieldProps('supplier', {
                        initialValue: (typeof rowData === 'undefined' || typeof rowData.supplier === 'undefined') ? "" : String(rowData.supplier)
 ,
                        validateTrigger: 'onBlur',
                        rules: [{
                            type:'string',required: false
 ,pattern:/\S+/ig, message: '请输入供应商',
                        }],
                        onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ supplier: value });
    _this.setState({
        rowData:tempRow
    })
}
                        }
                    }
                    )}
                />
            <FormError errorMsg={getFieldError('supplier')}/>
       </FormItem>
                    </FormList>
            </PopDialog>
        )
    }
}

export default FormList.createForm()(PopupModal);
