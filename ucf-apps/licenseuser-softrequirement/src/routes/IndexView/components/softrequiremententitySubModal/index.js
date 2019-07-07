
import React, { Component } from "react";
import { Col, Row, FormControl, Label, Switch } from "tinper-bee";
import InputNumber from "bee-input-number";
import DatePicker from 'bee-datepicker';
import moment from "moment";
import { actions } from "mirrorx";
import FormList from 'components/FormList';
import FormError from 'components/FormError';
import Select from 'bee-select';
import PopDialog from 'components/Pop';
import RefCommon from 'components/RefCommon';
import PreCode from 'components/PreCode';
import Radio from 'bee-radio';
import SelectMonth from 'components/SelectMonth';
import { handleEntity } from 'utils/tools';
//Grid组件
import Grid from 'components/Grid';
import Button from 'components/Button';
import 'bee-datepicker/build/DatePicker.css';
import './index.less'

const FormItem = FormList.Item;

const layoutOpt = null
let titleArr = ["新增", "修改", "详情"];

class AddEditsoftrequiremententity extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rowData: {},
            btnFlag: 0,
            rowEditStatus:false
        }
    }

    async componentWillReceiveProps(nextProps) {
        const { btnFlag, currentIndex } = this.props;
        const { btnFlag: nextBtnFlag, currentIndex: nextCurrentIndex, modalObj, checkTable, modalVisible } = nextProps;
        if (btnFlag !== nextBtnFlag || currentIndex !== nextCurrentIndex) {
            // 防止网络阻塞造成btnFlag显示不正常
            this.setState({ btnFlag: nextBtnFlag });
            let rowData = {};
            try {
                if (nextBtnFlag !== 0 && checkTable === "softrequiremententity" && modalVisible) {
                    this.props.form.resetFields();
                    const { list } = modalObj;
                    rowData = list[nextCurrentIndex] || {};
                }
            } catch (error) {
                console.log(error);
            } finally {
                this.setState({ rowData });
            }
        }
    }

    /**
     * button关闭Modal 同时清空state
     * @param {Boolean} isSave 判断是否添加或者更新
     */
    onCloseEdit = (isSave) => {
        this.setState({ rowData: {}, btnFlag: 0 });
        this.props.form.resetFields();
        this.props.onCloseModal(isSave);
    }



    column = () => {
        const column = [
        {
            title: "流水号",
            dataIndex: "serialId",
            key: "serialId",
            width: 150,
            sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
        },
        {
            title: "申请单号",
            dataIndex: "billno",
            key: "billno",
            width: 150,
            sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
        },
        {
            title: "资产编号",
            dataIndex: "zcNumber",
            key: "zcNumber",
            width: 150,
            sorter: true,
                filterType: "text",
                filterDropdownType: "string",
                filterDropdown: "show",
        },
        {
            title: "证书ID",
            dataIndex: "licenseId",
            key: "licenseId",
            width: 150,
                exportKey: "licenseSn",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: this.state.    reflicenseIdDropData,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.    reflicenseIdDropData) {
                        let param = {
                            distinctParams: ['licenseId']
                        }
                        actions['popupEditlicenseUser'].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return {key:item['licenseSn'],value:item['licenseId']}
                            });

                            this.setState({
                                    reflicenseIdDropData : vals
                            })
                        })
                    }
                },
                render: (text, record, index) => {
                    return (<span>{record['licenseSn']}</span>)
                },
        },
        {
            title: "领用人",
            dataIndex: "user",
            key: "user",
            width: 150,
                exportKey: "username",
                filterType: "dropdown",
                filterDropdown: "hide",
                filterDropdownAuto: "manual",
                filterDropdownData: this.state.    refuserDropData,
                filterDropdownFocus: () => { //组件焦点的回调函数
                    if (!this.state.    refuserDropData) {
                        let param = {
                            distinctParams: ['user']
                        }
                        actions['popupEditlicenseUser'].getRefListByCol(param).then(data => {
                            let vals = data.map(item => {
                                return {key:item['username'],value:item['user']}
                            });

                            this.setState({
                                    refuserDropData : vals
                            })
                        })
                    }
                },
                render: (text, record, index) => {
                    return (<span>{record['username']}</span>)
                },
        },
        {
            title: "领用日期",
            dataIndex: "pickdate",
            key: "pickdate",
            width: 150,
            sorter: true,
                filterDropdown: "hide",
                filterType: "daterange",
                filterDropdownType: "daterange",
                render: (text, record, index) => {
                    return <div>
                        {text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ""}
                    </div>
                },
        },
        ];

        return column;
    }
    

    /**
     * 提交表单信息
     */
    onSubmitEdit = () => {
        const _this = this;
        const { btnFlag } = _this.state;
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                const { softrequirementIndex, softrequirementObj } = this.props;
                const { list } = softrequirementObj;
                const { id: billId } = list[softrequirementIndex]; //获取父亲节点的id
                let { rowData } = _this.state;
                if (rowData && rowData.id) { // 如果是编辑，带上节点 id
                    values.id = rowData.id;
                    values.ts = rowData.ts;
                }
                values.billId = billId;
                values.btnFlag = btnFlag;
                _this.onCloseEdit(true); // 关闭弹框 无论成功失败
                this.props.resetIndex('softrequiremententityIndex'); //重置state， 默认选中第一条

                values = handleEntity(values);
                actions.masterDetailManysoftrequirement.savesoftrequiremententity(values); //保存主表数据
            }
        });
    }


    /**
     *
     * @description 底部按钮是否显示处理函数
     * @param {*} btnFlag 为页面标识
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
        let _this = this;
        const { form, modalVisible } = _this.props;
        const { getFieldProps, getFieldError } = form;
        const { rowData, btnFlag } = _this.state;
        let btns = _this.onHandleBtns(btnFlag);

        return (
            <PopDialog
                show={modalVisible}
                size='lg'
                close={this.onCloseEdit}
                title={titleArr[btnFlag]}
                btns={btns}
                className='softrequiremententity-modal'
            >


                <FormList>

                    <FormItem label={"物资编号"} >

                        <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                        }
                            {
                            ...getFieldProps('wz_number', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.wz_number === 'undefined') ? "" : String(rowData.wz_number)
                                ,
                                validateTrigger: 'onBlur',
                                rules: [{
                                    type: 'string', required: false
                                    , pattern: /\S+/ig, message: '请输入物资编号',
                                }],
                                onChange(value) {
                                    if (typeof rowData !== 'undefined') {
                                        let tempRow = Object.assign({}, rowData, { wz_number: value });
                                        _this.setState({
                                            rowData: tempRow
                                        })
                                    }
                                }
                            }
                            )}
                        />
                        <FormError errorMsg={getFieldError('wz_number')} />
                    </FormItem>


                    <FormItem label={"物资名称"} >

                        <RefCommon
                            rowData={typeof rowData !== 'undefined' && rowData}
                            btnFlag={typeof btnFlag !== 'undefined' && btnFlag}
                            type={6}
                            title={'物资名称'}
                            refPath={`${GROBAL_HTTP_CTX}/common-ref`
                            }
                            param={{
                                refCode: 'wzBasicInfo'
                            }}
                            {...getFieldProps('name', {
                                initialValue: JSON.stringify({
                                    refname: (typeof rowData !== 'undefined' && rowData['wzName']) || '',
                                    refpk: (typeof rowData !== 'undefined' && rowData['name']) || ''
                                }),
                            })}
                        />
                        <FormError errorMsg={getFieldError('name')} />
                    </FormItem>


                    <FormItem label={"型号"} >

                        <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                        }
                            {
                            ...getFieldProps('model', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.model === 'undefined') ? "" : String(rowData.model)
                                ,
                                validateTrigger: 'onBlur',
                                rules: [{
                                    type: 'string', required: false
                                    , pattern: /\S+/ig, message: '请输入型号',
                                }],
                                onChange(value) {
                                    if (typeof rowData !== 'undefined') {
                                        let tempRow = Object.assign({}, rowData, { model: value });
                                        _this.setState({
                                            rowData: tempRow
                                        })
                                    }
                                }
                            }
                            )}
                        />
                        <FormError errorMsg={getFieldError('model')} />
                    </FormItem>


                    <FormItem label={"规格描述"} >

                        <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                        }
                            {
                            ...getFieldProps('description', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.description === 'undefined') ? "" : String(rowData.description)
                                ,
                                validateTrigger: 'onBlur',
                                rules: [{
                                    type: 'string', required: false
                                    , pattern: /\S+/ig, message: '请输入规格描述',
                                }],
                                onChange(value) {
                                    if (typeof rowData !== 'undefined') {
                                        let tempRow = Object.assign({}, rowData, { description: value });
                                        _this.setState({
                                            rowData: tempRow
                                        })
                                    }
                                }
                            }
                            )}
                        />
                        <FormError errorMsg={getFieldError('description')} />
                    </FormItem>


                    <FormItem label={"品牌"} >

                        <FormControl disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                        }
                            {
                            ...getFieldProps('brand', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.brand === 'undefined') ? "" : String(rowData.brand)
                                ,
                                validateTrigger: 'onBlur',
                                rules: [{
                                    type: 'string', required: false
                                    , pattern: /\S+/ig, message: '请输入品牌',
                                }],
                                onChange(value) {
                                    if (typeof rowData !== 'undefined') {
                                        let tempRow = Object.assign({}, rowData, { brand: value });
                                        _this.setState({
                                            rowData: tempRow
                                        })
                                    }
                                }
                            }
                            )}
                        />
                        <FormError errorMsg={getFieldError('brand')} />
                    </FormItem>


                    <FormItem label={"使用地点"} >

                        <Select disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                        }
                            {
                            ...getFieldProps('address', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.address === 'undefined') ? "" : String(rowData.address)
                                ,
                                rules: [{
                                    required: false
                                    , message: '请选择使用地点',
                                }],
                                onChange(value) {
                                    if (typeof rowData !== 'undefined') {
                                        let tempRow = Object.assign({}, rowData, { address: value });
                                        _this.setState({
                                            rowData: tempRow
                                        })
                                    }
                                }
                            }
                            )}>
                            <Option value="">请选择</Option>
                            <Option value={'1'}>科珠</Option>
                            <Option value={'2'}>云埔</Option>
                            <Option value={'3'}>连云</Option>
                        </Select>
                        <FormError errorMsg={getFieldError('address')} />
                    </FormItem>


                    <FormItem label={"申请数量"} >

                        <InputNumber
                            iconStyle="one"
                            min={0}
                            max={Math.pow(10, 64) - 1}
                            step={1}
                            className={"input-number-int"}
                            disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                            }
                            {
                            ...getFieldProps('qty', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.qty === 'undefined')
                                    ? '' : rowData.qty,
                                rules: [
                                    { pattern: /^[0-9]+$/ },
                                    {
                                        required: false
                                        , message: '请输入申请数量'
                                    },
                                ],
                                onChange(value) {
                                    if (typeof rowData !== 'undefined') {
                                        let tempRow = Object.assign({}, rowData, { qty: value });
                                        _this.setState({
                                            rowData: tempRow
                                        })
                                    }
                                }
                            })
                            }
                        />
                        <FormError errorMsg={getFieldError('qty')} />
                    </FormItem>


                    <FormItem label={"预计单价"} >

                        <InputNumber
                            precision={2}
                            min={0}
                            max={Math.pow(10, 10) - 1}
                            className={"input-number"}
                            disabled={typeof btnFlag != 'undefined' && btnFlag == 2
                            }
                            {
                            ...getFieldProps('price', {
                                initialValue: (typeof rowData === 'undefined' || typeof rowData.price === 'undefined')
                                    ? '' : Number(rowData.price).toFixed(2),
                                rules: [
                                    {
                                        required: false
                                        , message: '请输入预计单价'
                                    }
                                ],
                                onChange(value) {
                                    if (typeof rowData !== 'undefined') {
                                        let tempRow = Object.assign({}, rowData, { price: value });
                                        _this.setState({
                                            rowData: tempRow
                                        })
                                    }
                                }
                            })
                            }
                        />
                        <FormError errorMsg={getFieldError('price')} />
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

                </FormList>
                <div className='table-header'>
                    <Button role="add"
                        // disabled={getButtonStatus('add', status)}
                        className="ml8"
                        colors="primary"
                        onClick={this.handlerNew}
                    >
                        新增
                    </Button>
                 
                </div>
                <Grid
                        ref={(el) => this.grid = el}//ref用于调用内部方法
                        data={[]}//数据
                        rowKey={r => r.id ? r.id : r.key}
                        columns={this.column()}//定义列
                        paginationObj={[]}//分页数据
                        columnFilterAble={this.rowEditStatus}//是否显示右侧隐藏行
                        showHeaderMenu={this.rowEditStatus}//是否显示菜单
                        showFilterMenu={true} //是否显示行过滤菜单
                        filterable={_this.state.filterable}//是否开启过滤数据功能
                        onFilterChange={_this.onFilterChange}  // 触发过滤输入操作以及下拉条件的回调
                        onFilterClear={_this.onFilterClear} //清除过滤条件的回调函数，回调参数为清空的字段
                        afterRowFilter={_this.afterRowFilter} //控制栏位的显示/隐藏
                        dragborder={this.rowEditStatus}//是否调整列宽
                        draggable={this.rowEditStatus}//是否拖拽
                        syncHover={this.rowEditStatus}//是否同步状态
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
            </PopDialog>
        )
    }
}

export default FormList.createForm()(AddEditsoftrequiremententity);

