
import React, {Component} from 'react'
import {actions} from "mirrorx";
import {Col, Row, FormControl, Label, Checkbox,Switch} from "tinper-bee";
import DatePicker from 'bee-datepicker';
import moment from "moment";
import Select from 'bee-select';
import FormList from 'components/FormList';
import FormError from 'components/FormError';
import SelectMonth from 'components/SelectMonth';
import SearchPanel from 'components/SearchPanel';
import FormControlPhone from 'components/FormControlPhone';
import RefCommon from 'components/RefCommon';
import InputNumber from 'bee-input-number';
import {addSearchKey,deepClone} from 'utils';
import {handleEntity} from 'utils/tools';
import Radio from 'bee-radio';

import './index.less'

const FormItem = FormList.Item;

const layoutOpt = null

class SearchArea extends Component {

    constructor(props) {
        super(props);
        this.state = {}

    }

    componentDidMount(){
        this.props.onRef(this)
    }

    /** 查询数据
     * @param {*} error 校验是否成功
     * @param {object} values 表单数据
     */
    search = () => {
        this.props.form.validateFields(async (err, values) => {
            const {softrequirementObj} = this.props;
            const {pageSize} = softrequirementObj;

            let queryParam = deepClone(this.props.queryParam);
            let {pageParams} = queryParam;
            pageParams.pageIndex = 0;
            pageParams.pageSize = pageSize;

            const arrayNew = this.getSearchPanel(values); //对搜索条件拼接
            queryParam.whereParams=arrayNew;

            actions.masterDetailManysoftrequirement.updateState({cacheFilter:arrayNew}); // 保存查询条件
            await actions.masterDetailManysoftrequirement.loadList(queryParam);
            this.props.clearRowFilter();
        });
    }
/**
*
* @param values search 表单值
* @returns {Array}
*/
getSearchPanel = (values) => {
    const list = [];

       let queryconfition = {
            billno: "EQ",
            status: "EQ",
            bu: "EQ",
       }

    values = handleEntity(values);

    for (let key in values) {

        if (values[key]) {
            let condition = queryconfition[key]
            list.push({key, value: values[key], condition});
        }
    }
    return list;
}
    /**
     * 清空 action里的搜索条件
     */
    reset = () => {
        this.props.form.resetFields();
        actions.masterDetailManysoftrequirement.updateState({cacheFilter: {}});
    }
    render() {
        const {form} = this.props;
        const {getFieldProps} = form;
        return (
            <SearchPanel
                className="small"
                form={form}
                reset={this.reset}
                search={this.search}>

                <FormList size="sm">
       <FormItem  label={"单据编号"} >

                <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
            placeholder="精确查询"
                  {
                    ...getFieldProps('billno', {
                        initialValue: ''
 ,
                    }
                    )}
                />
       </FormItem>
       <FormItem  label={"状态"} >

            <Select disabled={typeof btnFlag != 'undefined' && btnFlag == 2
}
                {
                ...getFieldProps('status', {
                    initialValue: ''
 ,
                }
                )}>
                <Option value="">请选择</Option>
                    <Option value={ '0' }>草稿</Option>
                    <Option value={ '1' }>已提交</Option>
                    <Option value={ '2' }>已采购</Option>
                    <Option value={ '3' }>自动更新</Option>
            </Select>
       </FormItem>
       <FormItem  label={"入账单位"} >

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
                })}
            />
       </FormItem>
                </FormList>
            </SearchPanel>
        )
    }
}

export default FormList.createForm()(SearchArea)
