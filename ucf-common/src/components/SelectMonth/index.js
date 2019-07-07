import React, {Component} from 'react';
import { Select } from 'tinper-bee'

const {Option} = Select;

class SelectMonth extends Component {
    render() {
        return (
            <Select {...this.props}>
                <Option value="">请选择</Option>
                <Option value={'一月'}>一月</Option>
                <Option value={'二月'}>二月</Option>
                <Option value={'三月'}>三月</Option>
                <Option value={'四月'}>四月</Option>
                <Option value={'五月'}>五月</Option>
                <Option value={'六月'}>六月</Option>
                <Option value={'七月'}>七月</Option>
                <Option value={'八月'}>八月</Option>
                <Option value={'九月'}>九月</Option>
                <Option value={'十月'}>十月</Option>
                <Option value={'十一月'}>十一月</Option>
                <Option value={'十二月'}>十二月</Option>
            </Select>
        )
    }
}

export default SelectMonth;
