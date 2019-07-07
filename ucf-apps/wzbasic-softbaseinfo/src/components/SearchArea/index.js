
import React, {Component} from 'react'
import {actions} from "mirrorx";
import {Col, Row, FormControl, Label, Checkbox,Switch} from "tinper-bee";
import FormList from 'components/FormList';
import FormError from 'components/FormError';
import Select from 'bee-select';
import DatePicker from 'bee-datepicker';
import SearchPanel from 'components/SearchPanel';
import SelectMonth from 'components/SelectMonth';
import RefCommon from 'components/RefCommon';
import PreCode from 'components/PreCode';
import InputNumber from 'bee-input-number';
import moment from 'moment';
import {handleEntity} from 'utils/tools';
import Radio from 'bee-radio';

import {deepClone,getValidateFieldsTrim} from "utils";
import zhCN from "rc-calendar/lib/locale/zh_CN";

import './index.less'

const FormItem = FormList.Item;
const {Option} = Select;
const format = "YYYY";
const {YearPicker} = DatePicker;

class SearchAreaForm extends Component {

    /** 查询数据
     * @param {*} error 校验是否成功
     * @param {*} values 表单数据
     */
    search = () => {
        this.props.form.validateFields((err, _values) => {
            let values = getValidateFieldsTrim(_values);
            values = handleEntity(values);

            this.props.clearRowFilter();
            this.getQuery(values, 0);
        })
    }

    /**
     * 重置 如果无法清空，请手动清空
     */
    reset = () => {
        this.props.form.resetFields();
    }


    /** 查询数据
     * @param {Object} values 表单对象
     * @param {Number} type 1位清空操作，0位查询操作
     */
    getQuery = (values, type) => {
        let queryParam = deepClone(this.props.queryParam);
        let {pageParams, whereParams} = queryParam;
        whereParams = deepClone(whereParams);
        pageParams.pageIndex = 0;
        for (let key in values) {
            for (let [index, elem] of whereParams.entries()) {
                if (key === elem.key) {
                    whereParams.splice(index, 1);
                    break;
                }
            }

            if ((values[key] || values[key] === 0) && type === 0) {
                let condition = "LIKE";
                // 这里通过根据项目自己优化
                let equalArray = ["code", "month"];
                if (equalArray.includes(key)) { // 等于
                    condition = "EQ";
                }
                whereParams.push({key, value: values[key], condition}); //前后端约定
            }
        }
        queryParam.whereParams = whereParams;
        actions.popupEditsoftbaseinfo.updateState(queryParam);
        if (type === 0) {
            actions.popupEditsoftbaseinfo.loadList(queryParam);
        }
        this.props.onCloseEdit();

    }



    render() {
        let {form,onCallback} = this.props;
        let {getFieldProps} = form;

        return (
            <SearchPanel
                className='search-area-form small'
                form={form}
                reset={this.reset}
                onCallback={onCallback}
                search={this.search}>
                <FormList size="sm">
       <FormItem  label={"物资编号"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
            placeholder="模糊查询"
                  {
                    ...getFieldProps('wzNumber', {
                        initialValue: ''
 ,
                    }
                    )}
                />
       </FormItem>
       <FormItem  label={"物资名称"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
            placeholder="模糊查询"
                  {
                    ...getFieldProps('wzName', {
                        initialValue: ''
 ,
                    }
                    )}
                />
       </FormItem>
       <FormItem  label={"供应商"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
            placeholder="模糊查询"
                  {
                    ...getFieldProps('supplier', {
                        initialValue: ''
 ,
                    }
                    )}
                />
       </FormItem>
                </FormList>
            </SearchPanel>
        )
    }
}

export default FormList.createForm()(SearchAreaForm)
