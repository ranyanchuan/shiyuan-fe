//React所需导入
import React, { Component } from 'react';
//文本输入组件
import TextField from 'components/RowField/TextField';
//下拉选择组件
import SelectField from 'components/RowField/SelectField';
//数值选择组件
import NumberField from 'components/RowField/NumberField';
//年份选择组件
import YearField from 'components/RowField/YearField';

//开关组件
import SwitchField from 'components/RowField/SwitchField';
//参照部门
import RefDept from 'components/RowField/RefDept';
//参照职级
import RefLevel from 'components/RowField/RefLevel';
//日期组件
import DateField from 'components/RowField/DateField';
import RefBusiness from 'components/RefBusiness';
import PreCode from 'components/PreCode';


const months =  [
    {key: "请选择",value: "",disabled: true}, 
    {key: "一月",value: "一月"},
    {key: "二月",value: "二月"},
    {key: "三月",value: "三月"},
    {key: "四月",value: "四月"},
    {key: "五月",value: "五月"},
    {key: "六月",value: "六月"},
    {key: "七月",value: "七月"},
    {key: "八月",value: "八月"},
    {key: "九月",value: "九月"},
    {key: "十月",value: "十月"},
    {key: "十一月",value: "十一月"},
    {key: "十二月",value: "十二月"}
];

class FactoryComp extends Component {
    constructor(props) {
        super(props);
    }
    /**
     * 渲染组件函数
     *
     * @returns JSX
     */
    renderComp = () => {
        let { type, codeType, codeRule, value, field, record, dataIndex, enums, conlumname } = this.props;
        let addEdit = record._isNew || record._eidt;

        switch (type) {
            case 'FormControl'://输入框组件
                switch(parseInt(codeType)){
                    //前编码
                    case 0:
                        return (<div>
                            {addEdit ? 
                                <PreCode {...this.props}
                                    billObjCode = {codeRule}
                                /> : <div>{value}</div>}
                            </div>);
                    //后编码
                    case 1:
                        return (<div>
                            {addEdit ? 
                                <PreCode {...this.props}
                                    billObjCode = {codeRule}
                                /> : <div>{value}</div>}
                            </div>);
                    default:
                        return (<div>
                            {record._edit ?//编辑态
                                <TextField {...this.props}
                                    status={record['_status']}//是否修改过标记
                                    validate={record['_validate']}//启用验证
                                /> : <div>{value}</div>}
                        </div>);
                }
            case 'Select'://枚举组件
                return (<div>
                    {record._edit ?
                        <SelectField {...this.props}
                            status={record['_status']}//是否修改过标记
                            validate={record['_validate']}//启用验证
                            data={enums}
                        /> : <div>{record[dataIndex + 'EnumValue']}</div>}
                </div>);
            case 'DateTime'://日期时间组件
                return (<div>
                    {record._edit ?
                        <DateField
                                   showTime={true}
                                   format={'YYYY-MM-DD HH:mm:ss'}
                                   placeholder={'选择日期时间'}
                                   {...this.props}
                                   status={record['_status']}//是否修改过标记
                                   validate={record['_validate']}//启用验证
                        /> : <div>{value}</div>}
                </div>);
            case 'DatePicker'://日期组件
                return (<div>
                    {record._edit ?
                        <DateField
                                   format={'YYYY-MM-DD'}
                                   placeholder={'选择日期'}
                                   {...this.props}
                                   status={record['_status']}//是否修改过标记
                                   validate={record['_validate']}//启用验证
                        /> : <div>{value}</div>}
                </div>);
            case 'Year': //年
                return (<div>
                    {record._edit ?
                        <YearField {...this.props}
                                   status={record['_status']}//是否修改过标记
                                   validate={record['_validate']}//启用验证
                        /> : <div>{value}</div>}
                </div>);
            case 'Month': //月
                return (<div>
                    {record._edit ?
                        <SelectField {...this.props}
                                   status={record['_status']}//是否修改过标记
                                   validate={record['_validate']}//启用验证
                                   data={months}
                        /> : <div>{value}</div>}
                </div>);
            case 'InputNumber'://数值组件
                return (<div>
                    {record._edit ?
                        <NumberField
                                    max={999999}
                                    min={0}
                                    step={1}
                                    precision={2}
                                    {...this.props}
                                     status={record['_status']}//是否修改过标记
                                     validate={record['_validate']}//启用验证
                                     iconStyle="one"

                        /> : <div>{(typeof value) === 'number' ? value.toFixed(2) : ""}</div>}
                </div>);
            case 'Integer'://整数组件
                return (<div>
                    {record._edit ?
                        <NumberField
                                    max={999999}
                                    min={0}
                                    step={1}
                                    {...this.props}
                                     status={record['_status']}//是否修改过标记
                                     validate={record['_validate']}//启用验证
                                     iconStyle="one"

                        /> : <div>{value}</div>}
                </div>);
            case 'RefWithInput'://参照组件
                dataIndex = dataIndex + 'Name';
                return (<div>
                    {record._edit ?
                        <RefBusiness {...this.props}
                                    valueKey={this.props.refName}
                                    key={this.props.refPk}
                                    refType={this.props.refType}
                                    refCode={this.props.refCode}
                                    refName={this.props.refName}
                                    refPath={this.props.refPath}
                                    status={record['_status']}//是否修改过标记
                                    validate={record['_validate']}//启用验证
                        /> : <div>{record[this.props.refName]}</div>}
                </div>);
            case 'Switch'://开关组件
                return (<div>
                    {record._edit  ?
                        <SwitchField
                            checked={this.props.checked}
                            {...this.props}
                        /> : <div>{value==true?"是":"否"}</div>}
                </div>);
            default:
                return (<div>组件类型错误</div>)
        }
    }
    render() {
        return (<div>
            {this.renderComp()}
        </div>);
    }
}

export default FactoryComp;