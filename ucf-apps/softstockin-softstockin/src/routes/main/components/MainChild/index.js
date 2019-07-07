import React, {Component} from "react";
import {actions} from "mirrorx";
import moment from "moment";
import {Col, Row, FormControl, Label, Switch, Checkbox} from "tinper-bee";
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
import queryString from "query-string";

const {Option} = Select;
const FormItem = FormList.Item;
const format = "YYYY-MM-DD";

const layoutOpt = {
    md: 4,
    xs: 6
}

class MainChild extends Component {


    constructor(props) {
        super(props);
        this.state = {
            rowData: this.props.rowData || {},
        }
    }


    render() {
        const _this = this;
        let {btnFlag, form} = _this.props;
        const {getFieldProps, getFieldError} = form;

        const {rowData} = this.state;

        return (
            <FormList className='formlist detail-body form-panel order-panel'>
                <FormItem required label={"订单编号"}>

                    <PreCode
                        btnFlag={Number(typeof btnFlag != 'undefined' && btnFlag)}
                        billObjCode={'orderno'}
                        {
                            ...getFieldProps('billno', {
                                    initialValue: (typeof rowData === 'undefined' || typeof rowData.billno === 'undefined') ? "" : String(rowData.billno),
                                    validateTrigger: 'onBlur',
                                    rules: [{
                                        type: 'string', required: false, pattern: /\S+/ig, message: '请输入订单编号',
                                    }],
                                }
                            )
                        }
                    />
                </FormItem>
                <FormItem label={"入账单位"}>
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
                            // todo xxx
                            const {billid, supplier} = record[0];
                            rowData.supplier = supplier || 'xxxxx';

                            console.log(record[0]);
                            //获取子表
                            actions.masterDetailMainsoftstockin.getDetailData({billId:billid, supplier}); // 获取主表
                            this.setState({rowData});
                        }}

                    />
                    <FormError errorMsg={getFieldError('bu')}/>
                </FormItem>
                <FormItem label={"供应商"}>
                    <FormControl
                        disabled={true}
                        {...getFieldProps('supplier', {
                                initialValue: rowData.supplier,
                            }
                        )}
                    />
                </FormItem>
                <FormItem label={"采购员"}>
                    <FormControl
                        disabled={typeof btnFlag != 'undefined' && btnFlag == 2}
                        {...getFieldProps('buyer', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.buyer === 'undefined') ? "" : String(rowData.buyer)
                                ,
                                validateTrigger: 'onBlur',
                                rules: [{
                                    type: 'string', required: false, pattern: /\S+/ig, message: '请输入采购员',
                                }],

                            }
                        )}
                    />
                    <FormError errorMsg={getFieldError('buyer')}/>
                </FormItem>
                <FormItem label={"备注"}>
                    <FormControl
                        disabled={btnFlag == 2}
                        {...getFieldProps('note', {
                            initialValue: rowData.note || '',
                            validateTrigger: 'onBlur',
                        })}
                    />
                </FormItem>
            </FormList>
        )
    }
}

export default MainChild
