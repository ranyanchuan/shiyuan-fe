
import React, {Component} from "react";
import moment from "moment";
import {Col, Row, FormControl, Label, Switch, Checkbox } from "tinper-bee";
import InputNumber from "bee-input-number";
import {RefIuapDept} from 'components/RefViews';
import DatePicker from 'bee-datepicker';
import FormList from 'components/FormList';
import FormError from 'components/FormError';
import Select from 'bee-select';
import RefCommon from 'components/RefCommon';
import SelectMonth from 'components/SelectMonth';
import PreCode from 'components/PreCode';
import Radio from 'bee-radio';

import {getCookie} from "utils";

import './index.less';

const {Option} = Select;
const FormItem = FormList.Item;
const format = "YYYY-MM-DD";

const layoutOpt = {
    md: 4,
    xs: 6
}

class MainChild extends Component {

    render() {
        const _this = this;
        let {rowData, btnFlag, form} = _this.props;
        const {getFieldProps, getFieldError} = form;
        return (
            <FormList className='formlist detail-body form-panel order-panel'>
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

        )
    }
}

export default MainChild

