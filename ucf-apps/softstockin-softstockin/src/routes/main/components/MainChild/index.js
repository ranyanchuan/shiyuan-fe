
import React, { Component } from "react";
import { actions } from "mirrorx";
import moment from "moment";
import { Col, Row, FormControl, Label, Switch, Checkbox } from "tinper-bee";
import InputNumber from "bee-input-number";
import { RefIuapDept } from 'components/RefViews';
import DatePicker from 'bee-datepicker';
import FormList from 'components/FormList';
import FormError from 'components/FormError';
import Select from 'bee-select';
import RefCommon from 'components/RefCommon';
import SelectMonth from 'components/SelectMonth';
import PreCode from 'components/PreCode';
import Radio from 'bee-radio';

import { getCookie } from "utils";

import './index.less';

const { Option } = Select;
const FormItem = FormList.Item;
const format = "YYYY-MM-DD";

const layoutOpt = {
    md: 4,
    xs: 6
}

class MainChild extends Component {
    render() {
        const _this = this;
        let { rowData, btnFlag, form } = _this.props;
        const { getFieldProps, getFieldError } = form;
        return (
            <FormList className='formlist detail-body form-panel order-panel'>
                <FormItem required label={"订单编号"} >

                    <PreCode
                        btnFlag={Number(typeof btnFlag != 'undefined' && btnFlag)}
                        billObjCode={'orderno'}
                        {
                        ...getFieldProps('billno', {
                            initialValue: (typeof rowData === 'undefined' || typeof rowData.billno === 'undefined') ? "" : String(rowData.billno)
                            ,
                            validateTrigger: 'onBlur',
                            rules: [{
                                type: 'string', required: false, pattern: /\S+/ig, message: '请输入订单编号',
                            }],
                            onChange(value) {
                                if (typeof rowData !== 'undefined') {
                                    let tempRow = Object.assign({}, rowData, { billno: value });
                                    _this.setState({
                                        rowData: tempRow
                                    })
                                }
                            }
                        }
                        )
                        }
                    />
                    <FormError errorMsg={getFieldError('billno')} />
                </FormItem>
                <FormItem label={"入账单位"} >
                    <RefCommon
                        rowData={typeof rowData !== 'undefined' && rowData}
                        btnFlag={typeof btnFlag !== 'undefined' && btnFlag}
                        type={2}
                        title={'入账单位'}
                        refPath={`${GROBAL_HTTP_CTX}/common-ref`
                        }
                        param={{
                            refCode: 'soft_require'
                        }}
                        {...getFieldProps('bu', {
                            initialValue: JSON.stringify({
                                refname: (typeof rowData !== 'undefined' && rowData['buName']) || '',
                                refpk: (typeof rowData !== 'undefined' && rowData['bu']) || ''
                            }),
                        })}
                        displayField="{refname}"//update 0623
                        onSave={record => {//update 0623
                            console.log("record:", record);
                            const supplierV = record[0].supplier;
                            const billdiV = record[0].billid;
                            rowData.supplier = record[0].supplier;
                            // //todo:需要根据申请单去查询真实的数据。
                            // const param = { "billId": billdiV, "supplier": supplierV, pageSize: 10, pageIndex: 0 };
                            // const selectData = actions.masterDetailMainsoftstockin.getDetailData(param);
                            this.props.handleSelect([{
                                "wzName": "苹果本",
                                "typeEnumValue": "办公软件",
                                "address": "",
                                "description": "1",
                                "type": "0",
                                "wzNumber": "WZ_2019000001",
                                "dr": 0,
                                "lastModifyUser": "U001",
                                "createTime": "2019-06-23 10:48:23 864",
                                "billId": "7f567136d353418da2e208fa3d9374f2",
                                "name": "6a924737d8ef4f099d6fcbf13f3dc55f",
                                "createUser": "U001",
                                "model": "1",
                                "lastModified": "2019-06-23 10:48:23 864",
                                "id": "2213d77a3c7448e6a61fbc58389416d7",
                                "brand": "1",
                                "ts": "2019-06-23 10:48:23 864"
                            }]);
                        }}

                    />
                    <FormError errorMsg={getFieldError('bu')} />
                </FormItem>
                <FormItem label={"供应商"} >
                    <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                    }
                        {
                        ...getFieldProps('supplier', {
                            initialValue: (typeof rowData === 'undefined' || typeof rowData.supplier === 'undefined') ? "" : String(rowData.supplier)
                            ,
                            validateTrigger: 'onBlur',
                            rules: [{
                                type: 'string', required: false
                                , pattern: /\S+/ig, message: '请输入供应商',
                            }],
                            onChange(value) {
                                if (typeof rowData !== 'undefined') {
                                    let tempRow = Object.assign({}, rowData, { supplier: value });
                                    _this.setState({
                                        rowData: tempRow
                                    })
                                }
                            }
                        }
                        )}
                    />
                    <FormError errorMsg={getFieldError('supplier')} />
                </FormItem>
                <FormItem label={"采购员"} >
                    <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                    }
                        {
                        ...getFieldProps('buyer', {
                            initialValue: (typeof rowData === 'undefined' || typeof rowData.buyer === 'undefined') ? "" : String(rowData.buyer)
                            ,
                            validateTrigger: 'onBlur',
                            rules: [{
                                type: 'string', required: false
                                , pattern: /\S+/ig, message: '请输入采购员',
                            }],
                            onChange(value) {
                                if (typeof rowData !== 'undefined') {
                                    let tempRow = Object.assign({}, rowData, { buyer: value });
                                    _this.setState({
                                        rowData: tempRow
                                    })
                                }
                            }
                        }
                        )}
                    />
                    <FormError errorMsg={getFieldError('buyer')} />
                </FormItem>
                <FormItem label={"备注"} >

                    <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                    }
                        {
                        ...getFieldProps('note', {
                            initialValue: (typeof rowData === 'undefined' || typeof rowData.note === 'undefined') ? "" : String(rowData.note)
                            ,
                            validateTrigger: 'onBlur',
                            rules: [{
                                type: 'string', required: false
                                , pattern: /\S+/ig, message: '请输入备注',
                            }],
                            onChange(value) {
                                if (typeof rowData !== 'undefined') {
                                    let tempRow = Object.assign({}, rowData, { note: value });
                                    _this.setState({
                                        rowData: tempRow
                                    })
                                }
                            }
                        }
                        )}
                    />
                    <FormError errorMsg={getFieldError('note')} />
                </FormItem>
            </FormList>

        )
    }
}

export default MainChild