import React, {Component} from "react";
import {actions} from "mirrorx";
import {Loading, Icon, Modal} from "tinper-bee";
import queryString from 'query-string';
import AcExcelReader from 'ac-excel-reader';

import FormList from 'components/FormList';
import Grid from 'components/Grid';
import Header from "components/Header";
import Button from 'components/Button';
import Alert from 'components/Alert';
import MainChild from '../MainChild';


import {isMoment, handleEntity} from 'utils/tools';
import AcHandTable from 'ac-hand-table';

import {uuid, deepClone, getCookie, Info, getPageParam} from "utils";
import 'ac-hand-table/dist/index.css';

import './index.less'

let titleArr = ["新增", "修改", "详情"];

class IndexView extends Component {

    constructor(props) {
        super(props);
        const searchObj = queryString.parse(props.location.search);
        let {btnFlag: flag, search_id: searchId, ...oterSearch} = searchObj;
        const btnFlag = Number(flag);

        this.state = {
            showPopAlert: false,
            showPopBackVisible: false,
            searchId: searchId || "",
            btnFlag: btnFlag,
            selectData: [],
            softRequireArray: [], // 子表
            licenseList: [], //孙表
            ...oterSearch,
        }
    }


    componentWillReceiveProps(nextProps) {
        const {softRequireArray} = nextProps;// 表体数据
        // 处理下拉值 将[{key:'',value:''}] 转换成 [""], dealSelectData
        if (softRequireArray !== this.props.softRequireArray) {

            const {qty} = softRequireArray[0];
            let licenseList = [];
            for (let i = 0; i < qty; i++) {
                licenseList.push({
                    "serialId": "",
                    "wzNumber": "",
                    "startDate": "",
                    "endDate": "",
                });
            }
            this.setState({licenseList, softRequireArray});
        }
    }


    componentDidMount() {
        const searchObj = queryString.parse(this.props.location.search);
        let {btnFlag: flag, search_id: searchId, from} = searchObj;
        const {queryParent} = this.props;
        //非新增状态 当 没有提前设置主数据时 根据 search_id 向后台请求主表数据
        if (!queryParent.id && flag > 0) {
            const btnFlag = Number(flag);
            this.setState({btnFlag, searchId});
            if (btnFlag && btnFlag > 0) {
                const param = {sortMap: [], whereParams: [{key: "id", value: searchId, condition: "EQ"}]};
                actions.masterDetailMainsoftstockin.getQueryParent(param); // 获取主表
            }
        }
    }

    componentWillUnmount() {
        const {history} = this.props;
        if (history.action === "POP") {
            actions.masterDetailMainsoftstockin.initState();
        }
    }


    /**
     * 清空
     */
    clearQuery() {
        this.props.form.resetFields();
        actions.masterDetailMainsoftstockin.updateState({status: "view"});
        actions.masterDetailMainsoftstockin.initState({
            queryParent: {},
            querysoftstockinentityObj: {list: [], total: 0, pageIndex: 0},
        });
    }


    softstockinentityColumn = [
        {data: 'wzNumber'},
        {data: 'wzName'},
        {
            data: 'type',
            type: 'select', // 表格类型
            source: [
                {
                    value: '请选择',
                    key: '',
                },
                {
                    value: '办公软件',
                    key: '0',
                },
                {
                    value: '生产设计软件',
                    key: '1',
                }
            ],
        },
        {
            data: 'model',
        },
        {
            data: 'description',
        },
        {
            data: 'brand',
        },
        {
            data: 'address',
            type: 'select', // 表格类型
            source: [

                {
                    value: '请选择',
                    key: '',
                },
                {
                    value: '科珠',
                    key: '1',
                },
                {
                    value: '云埔',
                    key: '2',
                },
                {
                    value: '连云',
                    key: '3',
                }
            ],
        },
        {
            data: 'qty',
            type: 'numeric', // 申请
        },
        {
            data: 'price',
            type: 'numeric', // 单价
        },
    ];


    columns = [
        {
            data: 'serialId',
            textTooltip: true,
            readOnlyCellClassName: 'is-readOnly',
            readOnly: true,
        }, // 对象文本类型
        {
            data: 'license',
        },
        {
            data: 'wzNumber',
        },
        {
            data: 'startDate',
            type: 'date', // 日期类型
            dateFormat: 'YYYY-MM-DD', // 日期格式
            correctFormat: true, //  当前值是否格式化
            // defaultDate: '1900-01-01', // 默认值
            allowInvalid: true, // 不容许日期为空
        },
        {
            data: 'endDate',
            type: 'date', // 日期类型
            dateFormat: 'YYYY-MM-DD', // 日期格式
            correctFormat: true, //  当前值是否格式化
            // defaultDate: '1900-01-01', // 默认值
            allowInvalid: true, // 不容许日期为空
        },
    ];


    /**
     *
     * 返回上一级弹框提示
     * @param {Number} type 1、取消 2、确定
     * @memberof Order
     */
    async confirmGoBack(type) {
        this.setState({showPopBackVisible: false});
        if (type === 1) { // 确定
            this.clearQuery();
            actions.routing.replace({pathname: '/'});
        }
    }

    /**
     * 返回
     * @returns {Promise<void>}
     */

    onBack = async () => {
        const {btnFlag} = this.state;
        if (btnFlag === 2) { //判断是否为详情态
            const searchObj = queryString.parse(this.props.location.search);
            let {from} = searchObj;
            switch (from) {
                case undefined:
                    this.clearQuery();
                    actions.routing.replace({pathname: '/'});
                    break;
                default:
                    window.parent.bpmCloseOrder ? window.parent.bpmCloseOrder() : window.history.go(-1);
            }

        } else {
            this.setState({showPopBackVisible: true});
        }
    }


    /**
     *
     *
     * @param {*} entity 获取主表数据
     * @returns
     */
    filterOrder = (entity) => {
        const btnFlag = Number(this.state.btnFlag);
        if (btnFlag === 1) {  //为主表添加编辑信息
            const {queryParent: rowData} = this.props;
            if (rowData && rowData.id) {
                entity.id = rowData.id;
                entity.ts = rowData.ts;
            }
        }

        return entity;
    }
    /**
     * 保存
     */
    onClickSave = async () => {

        let {form} = this.props;
        const {softRequireArray} = this.state;
        let entity = {};

        //对主表数据进行处理
        form.validateFields((error, value) => {
            if (!error) {
                entity = this.filterOrder(value);
                const {bu} = entity;
                const {refpk} = JSON.parse(bu);
                entity.bu = refpk;
                //entity.orderUser = decodeURIComponent(getCookie("_A_P_userId"));
            }
        });

        const formatData = this.child.getFormatData();
        let sublist = {
            softstockinentityList: [
                {
                    ...softRequireArray[0],
                    sublist: formatData,

                }
            ]
        };

        await actions.masterDetailMainsoftstockin.adds({entity,sublist});

    }


    closeModal() {
        actions.masterDetailMainsoftstockin.updateState({
            showModalCover: false
        });
        window.history.go(-1);
    }


    // 导出csv
    onExportHeader = () => {
        this.child.onExportHeader();
    };

    // 删除多选选中的行
    onDelRowCheck = () => {
        this.child.onDelRowCheck();
    };


    // 将excel 转换成json
    getExcel2Json = (data) => {
        console.log('data', data);
        this.setState({ licenseList: data });
    };


    // 导出csv
    onDownCsv = () => {
        this.child.onExportCSV();
    };

    onInsertRowData = () => {
        this.child.onInsertRowData() // 默认从第一行添加
    };


    render() {
        const _this = this;
        const {
            softRequireArray,
            showLoading,
            queryParent: rowData,
            form,
            showModalCover,
        } = _this.props;


        const {showPopBackVisible, btnFlag: flag, licenseList} = _this.state;
        const btnFlag = Number(flag);

        const rowEditStatus = btnFlag === 2 ? true : false;

        // excel 列名hash 对照
        const colKeyHash = {
            serialId: '流水号',
            license: 'SN',
            wzNumber: '物资编号',
            startDate: '生效日期',
            endDate: '过期日期',
        };


        return (
            <div className='mainContainer'>
                <Loading showBackDrop={true} loadingType="line" show={showLoading} fullScreen={true}/>
                <Alert
                    show={showPopBackVisible}
                    context="数据未保存，确定离开 ?"
                    confirmFn={() => {
                        _this.confirmGoBack(1)
                    }}
                    cancelFn={() => {
                        _this.confirmGoBack(2)
                    }}/>
                <Header backFn={this.onBack} back title={titleArr[btnFlag]}>
                    <div className='head-btn'>
                        <Button shape="border" className="ml8" onClick={_this.onBack}>取消</Button>
                        {(btnFlag !== 2) &&
                        <Button colors="primary" className="ml8" onClick={_this.onClickSave}>保存</Button>
                        }
                    </div>

                </Header>
                <MainChild rowData={rowData} btnFlag={btnFlag} form={form}/>


                {/*软件申请*/}
                <div className='son'>

                    <AcHandTable
                        id="son" // 组件id
                        onRef={ref => this.child = ref} // 设置ref属性 调用子组件方法
                        colHeaders={['物资编码', '物资名称', '物资类别', '型号', '规格描述', '品牌', '使用地点', '申请数量', '预计单价']} // 表格表头
                        data={softRequireArray} // 表体数据
                        columns={this.softstockinentityColumn} // 列属性设置
                        colWidths={[50, 100, 100, 100, 100, 100, 100, 100, 100, 100, null]}
                        manualRowMove // 行移动
                        fillHandle={{
                            autoInsertRow: false,
                            direction: 'vertical',
                        }}
                        rowHeaders={false}
                        dropdownMenu={false}
                        readOnly={true}

                        // headerTooltips={true}
                    />

                </div>

                <div className='grandson'>

                    <div className='table-header'>
                        <Button
                            role="add"
                            onClick={this.onInsertRowData}
                            colors="primary"
                        >
                            增行
                        </Button>

                        <Button
                            role="delete"
                            className="ml8"
                            shape="border"
                            onClick={this.onDelRowCheck}
                        >
                            删除
                        </Button>



                        <AcExcelReader
                            getJson={this.getExcel2Json}
                            // getArray={this.getExcel2Array}
                            colKeyHash={colKeyHash}
                        >
                            <Button
                                role="update"
                                className="ml8"
                                shape="border"
                            >
                                上传Excel
                            </Button>
                        </AcExcelReader>
                        <Button
                            className="ml8"
                            shape="border"
                            onClick={this.onDownCsv}
                        >
                            导出Excel
                        </Button>
                        <Button
                            shape="border"
                            className="ml8"
                            onClick={this.onExportHeader}
                        >
                            下载模板
                        </Button>


                    </div>
                    <div className='grid-parent'>
                        <AcHandTable
                            id="grandson" // 组件id
                            onRef={ref => this.child = ref} // 设置ref属性 调用子组件方法
                            colHeaders={['流水号', 'SN', '物资编号', '生效日期', '过期日期']} // 表格表头
                            data={licenseList} // 表体数据
                            columns={this.columns} // 列属性设置
                            colWidths={[50, 100, 100, 100, 100, null]}
                            manualRowMove // 行移动
                            fillHandle={{
                                autoInsertRow: false,
                                direction: 'vertical',
                            }}
                            rowHeaders={false}
                            dropdownMenu={false}
                            csvConfig={{
                                filename: '导出',
                                columnHeaders: true,
                            }}
                            // headerTooltips={true}
                        />
                    </div>
                    <Loading fullScreen={true} show={showLoading}/>
                </div>

                <Modal
                    show={showModalCover}
                    onHide={this.close}>
                    <Modal.Header>
                        <Modal.Title>警告</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        未获取到单据信息
                    </Modal.Body>

                    <Modal.Footer>
                        <Button onClick={this.closeModal}>是</Button>
                    </Modal.Footer>
                </Modal>

            </div>
        )
    }
}

export default FormList.createForm()(IndexView);
