
import React, {Component} from "react";
import {actions} from "mirrorx";
import {Col, Row,  FormControl, Label, Switch, Checkbox } from "tinper-bee";
import DatePicker from 'bee-datepicker';
import moment from "moment";
import FormList from 'components/FormList';
import FormError from 'components/FormError';
import SelectMonth from 'components/SelectMonth';
import Select from 'bee-select';
import PopDialog from 'components/Pop';
import FormControlPhone from 'components/FormControlPhone';
import RefCommon from 'components/RefCommon';
import PreCode from 'components/PreCode';
import zhCN from "rc-calendar/lib/locale/zh_CN";
import Header from "components/Header";
import queryString from 'query-string';
import Alert from 'components/Alert';
import Button from 'components/Button';
import Radio from 'bee-radio';
import {handleEntity} from 'utils/tools';
import { BpmTaskApprovalWrap } from 'yyuap-bpm';
import './index.less'

const FormItem = FormList.Item;

const layoutOpt = null
const {Option} = Select;
const format = "YYYY-MM-DD";
let titleArr = ["新增", "修改", "详情"];

class AddEditsoftrequirement extends Component {
    constructor(props) {
        super(props);
        const searchObj = queryString.parse(props.location.search);
        let { btnFlag: flag, search_id: searchId, from, ...oterSearch } = searchObj;
        this.state = {
            rowData: {},
            btnFlag: 0,
            showPopBackVisible: false,
            ...oterSearch,
        }
    }
    componentDidMount(){
        const searchObj = queryString.parse(this.props.location.search);
        let { btnFlag: flag, checkTable: checkTable, search_id: search_id} = searchObj;
        const btnFlag = Number(flag);

        const { softrequirementObj, softrequirementIndex: currentIndex } = this.props;
        // 防止网络阻塞造成btnFlag显示不正常
        this.setState({btnFlag: btnFlag});
        let rowData = {};
        
        if(btnFlag > 0 && checkTable === "softrequirement"){
            this.props.form.resetFields();
            actions.masterDetailManysoftrequirement.querysoftrequirement({
                search_id: search_id
            }).then(data => {
                rowData = data;
                this.setState({rowData:rowData});
            }).catch(err => {
                console.log(err);
            })
        } 
    }
    /**
     * button关闭Modal 同时清空state
     * @param {Boolean} isSave 判断是否添加或者更新
     */
    onCloseEdit = (isSave) => {
        // 关闭当前 弹框清空当前的state的值，防止下次进入是上一次的数据
        this.setState({rowData: {}, btnFlag: 0});
        this.props.form.resetFields();
    }
    /**
     *  提交信息
     */
    onSubmitEdit = () => {
        const _this = this;
        const {btnFlag}=_this.state;
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                let {rowData} = _this.state;
                if (rowData && rowData.id) {
                    values.id = rowData.id;
                    values.ts = rowData.ts;
                }
                values = handleEntity(values);

                values.btnFlag=btnFlag;
                _this.onCloseEdit(true); // 关闭弹框 无论成功失败
                actions.masterDetailManysoftrequirement.savesoftrequirement(values); //保存主表数据
                //返回
                actions.routing.replace({ pathname: '/' });
            }
        });
    }
     /**
     * 清空
     */
    clearQuery() {
        this.props.form.resetFields();
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
    *
    * @param {Number} btnFlag
    * @param {*} appType
    * @param {数据id} id
    * @param {*} processDefinitionId 流程定义ID
    * @param {*} processInstanceId 流程实例ID
    * @param {行数据} rowData
    * @returns
    */
showBpmComponent = (btnFlag, appType, processDefinitionId, processInstanceId, rowData) => {
    let _this = this;
    // btnFlag为2表示为详情
    if ((btnFlag == 2) && rowData && rowData['id']) {
        return (
            <div style={{padding:'10px 0'}}>
                {appType == 1 && <BpmTaskApprovalWrap
                    id={rowData.id}
                    onBpmFlowClick={() => {
                        this.onClickToBPM(rowData)
                    }}
                    appType={appType}
                    onStart={_this.onBpmStart('start')}
                    onSuccess={_this.onBpmStart('success')}
                    onError={_this.onBpmEnd('error')}
                    onEnd={_this.onBpmEnd('end')}
                />}
                {appType == 2 && <BpmTaskApprovalWrap
                    id={this.state.id}
                    processDefinitionId={processDefinitionId}
                    processInstanceId={processInstanceId}
                    onBpmFlowClick={() => {
                        _this.onClickToBPM(rowData)
                    }}
                    appType={appType}
                    onStart={_this.onBpmStart('start')}
                    onSuccess={_this.onBpmStart('success')}
                    onError={_this.onBpmEnd('error')}
                    onEnd={_this.onBpmEnd('end')}
                />}
            </div>
        );
    }
}
/**
    *
    * @description 提交初始执行函数
    * @param {string, string} type 为start、success
    */
onBpmStart = (type) => async () => {
    if (type == 'start') {
        await actions.masterDetailManysoftrequirement.updateState({
            showLoading: true
        })
    } else {
        await actions.masterDetailManysoftrequirement.updateState({
            showLoading: false
        });
        this.onBack();
    }
}
/**
    *
    * @description 提交失败和结束执行的函数
    * @param {string,string} type 为error、end
    */
onBpmEnd = (type) => async (error) => {
    if (type == 'error') {
        Error(error.msg);
    }
    actions.masterDetailManysoftrequirement.updateState({
        showLoading: false
    })
}
/**
    *
    * @param rowData为行数据
    * @memberof AddEditPassenger
    */
onClickToBPM = (rowData) => {
    const searchObj = queryString.parse(this.props.location.search);
    let { from } = searchObj;
    actions.routing.push({
        pathname: '/bpm-chart',
        search: `?id=${rowData.id}`
    })
}
    render() {
        let _this = this;
        const {form, modalVisible} = _this.props;

        const { appType, processDefinitionId, processInstanceId } = queryString.parse(this.props.location.search);

        const {getFieldProps, getFieldError,} = form;
        const {rowData, btnFlag, showPopBackVisible } = _this.state;

        let isDisabled = btnFlag > 1 ? true : false;

        return (
            <div className="mainContainer">
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
                        <Button colors="primary" className="ml8" onClick={_this.onSubmitEdit}>保存</Button>
                        }
                    </div>
                </Header>
                {
                    _this.showBpmComponent(btnFlag, appType ? appType : "1", processDefinitionId, processInstanceId, rowData)
                }
                <FormList className="formlist">

       <FormItem required label={"单据编号"} >

                <PreCode
                    btnFlag={Number(typeof btnFlag != 'undefined' && btnFlag)}
                    billObjCode = {'billno'}
                    {
                        ...getFieldProps('billno', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.billno === 'undefined') ? "" : String(rowData.billno)
 ,
                                validateTrigger: 'onBlur',
                                rules: [{
                                    type:'string', required: false, pattern:/\S+/ig, message: '请输入单据编号',
                                }],
                                onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ billno: value });
    _this.setState({
        rowData:tempRow
    })
}
                                }
                            }
                        )
                    }
                />
            <FormError errorMsg={getFieldError('billno')}/>
       </FormItem>


       <FormItem required label={"申请人"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                  {
                    ...getFieldProps('applicant', {
                        initialValue: (typeof rowData === 'undefined' || typeof rowData.applicant === 'undefined') ? "" : String(rowData.applicant)
 ,
                        validateTrigger: 'onBlur',
                        rules: [{
                            type:'string',required: true
 ,pattern:/\S+/ig, message: '请输入申请人',
                        }],
                        onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ applicant: value });
    _this.setState({
        rowData:tempRow
    })
}
                        }
                    }
                    )}
                />
            <FormError errorMsg={getFieldError('applicant')}/>
       </FormItem>


       <FormItem required label={"申请部门"} >

            <RefCommon
                rowData={typeof rowData !== 'undefined' && rowData}
                btnFlag={typeof btnFlag !== 'undefined' && btnFlag}
                type={1}
                title={'申请部门'}
                refPath={'/newref/rest/iref_ctr'
}
                param={{
                    refCode: 'neworganizition'
                }}
                {...getFieldProps('department', {
                    initialValue: JSON.stringify({
                        refname: (typeof rowData !== 'undefined' && rowData['departmentname']) || '',
                        refpk: (typeof rowData !== 'undefined' && rowData['department']) || ''
                    }),
                    rules: [{
                        message: '请选择申请部门',
                        pattern: /[^({"refname":"","refpk":""}|{"refpk":"","refname":""})]/
                    }],
                })}
            />
            <FormError errorMsg={getFieldError('department')}/>
       </FormItem>


       <FormItem required label={"状态"} >

            <Select disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                {
                ...getFieldProps('status', {
                    initialValue: (typeof rowData === 'undefined' || typeof rowData.status === 'undefined') ? "" : String(rowData.status)
 ,
                    rules: [{
                        required: true
 , message: '请选择状态',
                    }],
                    onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ status: value });
    _this.setState({
        rowData:tempRow
    })
}
                    }
                }
                )}>
                <Option value="">请选择</Option>
                    <Option value={ '0' }>草稿</Option>
                    <Option value={ '1' }>已提交</Option>
                    <Option value={ '2' }>已采购</Option>
                    <Option value={ '3' }>自动更新</Option>
            </Select>
            <FormError errorMsg={getFieldError('status')}/>
       </FormItem>


       <FormItem required label={"入账单位"} >

            <RefCommon
                rowData={typeof rowData !== 'undefined' && rowData}
                btnFlag={typeof btnFlag !== 'undefined' && btnFlag}
                type={1}
                title={'入账单位'}
                refPath={'/newref/rest/iref_ctr'
}
                param={{
                    refCode: 'neworganizition'
                }}
                {...getFieldProps('bu', {
                    initialValue: JSON.stringify({
                        refname: (typeof rowData !== 'undefined' && rowData['buName']) || '',
                        refpk: (typeof rowData !== 'undefined' && rowData['bu']) || ''
                    }),
                    rules: [{
                        message: '请选择入账单位',
                        pattern: /[^({"refname":"","refpk":""}|{"refpk":"","refname":""})]/
                    }],
                })}
            />
            <FormError errorMsg={getFieldError('bu')}/>
       </FormItem>


       <FormItem  label={"需求合计金额"} >

            <InputNumber
                precision={2}
                min={0}
                max={Math.pow(10,10) - 1}
                className={"input-number"}
                disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                {
                    ...getFieldProps('amount', {
                            initialValue: (typeof rowData === 'undefined' || typeof rowData.amount === 'undefined')
 ? '' : Number(rowData.amount).toFixed(2),
                            rules: [
                                {required: false
 , message:'请输入需求合计金额'}
                            ],
                            onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ amount: value });
    _this.setState({
        rowData:tempRow
    })
}
                            }
                    })
                }
            />
            <FormError errorMsg={getFieldError('amount')}/>
       </FormItem>


       <FormItem required label={"物资类别"} >

            <Select disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                {
                ...getFieldProps('type', {
                    initialValue: (typeof rowData === 'undefined' || typeof rowData.type === 'undefined') ? "" : String(rowData.type)
 ,
                    rules: [{
                        required: true
 , message: '请选择物资类别',
                    }],
                    onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ type: value });
    _this.setState({
        rowData:tempRow
    })
}
                    }
                }
                )}>
                <Option value="">请选择</Option>
                    <Option value={ '0' }>办公软件</Option>
                    <Option value={ '1' }>生产设计软件</Option>
            </Select>
            <FormError errorMsg={getFieldError('type')}/>
       </FormItem>


       <FormItem required label={"要求完成时间"} >

            <DatePicker className='form-item' disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                format={'YYYY-MM-DD HH:mm:ss'}
                showTime={true}
                {
                ...getFieldProps('fdate', {
                    initialValue: (typeof rowData === 'undefined' || !rowData.fdate || rowData.fdate == 'Invalid date') ? moment() : moment(rowData.fdate)
,
                        validateTrigger: 'onBlur',
                        rules: [{
                            required: true
 , message: '请选择要求完成时间',
                        }],
                        onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ fdate: value });
    _this.setState({
        rowData:tempRow
    })
}
                        }
                }
                )}
            />
            <FormError errorMsg={getFieldError('fdate')}/>
       </FormItem>


       <FormItem required label={"收货园区"} >

            <Select disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                {
                ...getFieldProps('address', {
                    initialValue: (typeof rowData === 'undefined' || typeof rowData.address === 'undefined') ? "" : String(rowData.address)
 ,
                    rules: [{
                        required: true
 , message: '请选择收货园区',
                    }],
                    onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ address: value });
    _this.setState({
        rowData:tempRow
    })
}
                    }
                }
                )}>
                <Option value="">请选择</Option>
                    <Option value={ '1' }>科珠</Option>
                    <Option value={ '2' }>云埔</Option>
                    <Option value={ '3' }>连云</Option>
            </Select>
            <FormError errorMsg={getFieldError('address')}/>
       </FormItem>


       <FormItem required label={"采购方式"} >

            <Select disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                {
                ...getFieldProps('procurement', {
                    initialValue: (typeof rowData === 'undefined' || typeof rowData.procurement === 'undefined') ? "" : String(rowData.procurement)
 ,
                    rules: [{
                        required: true
 , message: '请选择采购方式',
                    }],
                    onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ procurement: value });
    _this.setState({
        rowData:tempRow
    })
}
                    }
                }
                )}>
                <Option value="">请选择</Option>
                    <Option value={ '1' }>自行采购</Option>
                    <Option value={ '2' }>统一采购</Option>
                    <Option value={ '3' }>仓管补仓</Option>
            </Select>
            <FormError errorMsg={getFieldError('procurement')}/>
       </FormItem>


       <FormItem required label={"紧急程度"} >

            <Select disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                {
                ...getFieldProps('level', {
                    initialValue: (typeof rowData === 'undefined' || typeof rowData.level === 'undefined') ? "" : String(rowData.level)
 ,
                    rules: [{
                        required: true
 , message: '请选择紧急程度',
                    }],
                    onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ level: value });
    _this.setState({
        rowData:tempRow
    })
}
                    }
                }
                )}>
                <Option value="">请选择</Option>
                    <Option value={ '1' }>一般</Option>
                    <Option value={ '2' }>急</Option>
                    <Option value={ '3' }>紧急</Option>
            </Select>
            <FormError errorMsg={getFieldError('level')}/>
       </FormItem>


       <FormItem required label={"申请原因"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                  {
                    ...getFieldProps('note', {
                        initialValue: (typeof rowData === 'undefined' || typeof rowData.note === 'undefined') ? "" : String(rowData.note)
 ,
                        validateTrigger: 'onBlur',
                        rules: [{
                            type:'string',required: true
 ,pattern:/\S+/ig, message: '请输入申请原因',
                        }],
                        onChange(value) {
if(typeof rowData !== 'undefined'){
    let tempRow = Object.assign({},rowData,{ note: value });
    _this.setState({
        rowData:tempRow
    })
}
                        }
                    }
                    )}
                />
            <FormError errorMsg={getFieldError('note')}/>
       </FormItem>

                </FormList>
            </div>
        )
    }
}

export default FormList.createForm()(AddEditsoftrequirement);
