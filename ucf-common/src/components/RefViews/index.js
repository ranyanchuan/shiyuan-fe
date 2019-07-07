
import React from 'react';
import RefMultipleTableWithInput, { RefMultipleTable } from 'pap-refer/lib/pap-common-table/src/index';
import RefTreeWithInput, { RefTree } from 'pap-refer/lib/pap-common-tree/src/index';
// import RefComboBox, {ComboStore} from 'ref-combobox';
import {formatRefPath} from 'utils/tools';
import './index.less'


export function RefIuapDept(props){
    let {refPath} = props;
    refPath = formatRefPath(refPath);

    return (
        <RefTreeWithInput
            emptyBut={true}
            style={{
            }}
            title={'部门'}
            searchable= {true}
            strictMode={true}
            param= {
                {"refCode":"newdept"}
            }
            multiple={false}
            checkStrictly={true}
            disabled={false}
            displayField='{refname}'
            valueField='refpk'
            refModelUrl= {{
                treeUrl: `/${refPath}/blobRefTree`, //树请求
            }}
            matchUrl={`/${refPath}/matchPKRefJSON`}
            filterUrl={`/${refPath}/filterRefJSON`}
            {...props}
            modalProps={{'animation':false}}
        >
            <RefTree />
        </RefTreeWithInput>
    )
}

export function RefWalsinLevel(props){
    let {refPath} = props;
    refPath = formatRefPath(refPath);

    return (
        <RefMultipleTableWithInput
            title= '职级'
            emptyBut={true}
            strictMode={true}
            backdrop = {false}
            param = {{//url请求参数
                refCode:'post_level',//test_common||test_grid||test_tree||test_treeTable
            }}
            refModelUrl = {{
                tableBodyUrl:`/${refPath}/blobRefTreeGrid`,//表体请求
                refInfo:`/${refPath}/refInfo`,//表头请求
            }}
            matchUrl={`/${refPath}/matchPKRefJSON`}
            filterUrl={`/${refPath}/filterRefJSON`}
            valueField="refpk"
            displayField="{refcode}"
            {...props}
        >
            <RefMultipleTable />
        </RefMultipleTableWithInput>
    )
}

// function RefWalsinComboLevel(props){
//     return (
//         <RefComboBox
//             displayField={'{refname}-{refcode}'}
//             valueField={'refpk'}
//             onClickItem={(record) =>{
//                 console.log(record)
//             }}
//             matchUrl = '/iuap_walsin_demo/common-ref/matchPKRefJSON'
//             filterUrl = '/iuap_walsin_demo/common-ref/filterRefJSON'
//             { ...props }
//         >
//             <ComboStore
//                 ajax = {{
//                     url: '/iuap_walsin_demo/common-ref/blobRefTreeGrid',
//                     params: {
//                         refCode: 'post_level'
//                     },
//
//                 }}
//                 strictMode = {true}
//                 displayField={(record)=>{
//                     return <div > <Icon type="uf-personin-o" style={{color: 'red'}}/> {record.refname}-{record.refcode}-{record.type}</div>
//                 }}
//             />
//         </RefComboBox>
//     )
// }


