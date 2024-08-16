
import { useStore } from 'vuex'
import { getListByParentCode } from '@/api/base'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const symbolLabelList = ref([]) // 标签字典列表

// 产品标签分类
function productByLabel (symbolKey, productMap, symbolLabelMap) {
    const product = productMap[symbolKey]
    const labels = product.labels
    if (!labels) return
    labels.split(',').forEach(el => {
        if (symbolLabelMap.value[el]) {
            symbolLabelMap.value[el].push(product)
        } else {
            symbolLabelMap.value[el] = [product]
        }
    })
}

export default (params) => {
    const store = useStore()
    const {t} = useI18n({useScope:'global'});
    const symbolLabelMap = ref({})
    const sortPlans = ['5','3','2','1','6'];    // 取产品玩法的排序；现货 → 杠杆 → 合约全仓 → 合约逐仓 → 股票
    const symbolKeyByPlans = ref([]);  // 按顺序取到的某个玩法的产品symbolKey列表
    const productListByLabel = ref([]);  // 产品根据标签分类

    // 获取产品标签的字典
    if(symbolLabelList.value.length===0){
        getListByParentCode({ parentCode: 'SymbolLabel' }).then(res => {
            if (res.check()) symbolLabelList.value = res.data
        })
    }

    store.dispatch('_quote/querySymbolBaseInfoList', null).then(res => {
        if (res.check()) {
            const planMap = store.state._quote.planMap; // 每个玩法下配置的产品
            const plans = store.state._base.plans;  // 玩法列表
            const isWallet = store.state._base.wpCompanyInfo?.isWallet;  // 现货是否当钱包使用
            const productMap = store.state._quote.productMap;
            if(isWallet) sortPlans.shift();
            let curPlan = sortPlans[0]
            sortPlans.filter(plan=> planMap[plan]).forEach(plan=>{
                const planItem = plans.find(el=>el.tradeType===plan);
                const symbolList = planMap[plan].symbolList.filter(el=> productMap[`${el}_${plan}`]?.symbolName);   // 过滤出有权限的产品列表
                if(planItem && symbolList.length && symbolKeyByPlans.value.length===0){
                    curPlan = plan
                    symbolList.forEach(el=> {
                        symbolKeyByPlans.value.push(`${el}_${plan}`)
                    })
                }
            })

            symbolKeyByPlans.value.forEach(el => {
                // 标签分类
                productByLabel(el, productMap, symbolLabelMap)
            })

            // 将产品列表根据标签、盈利货币进行分类
            Object.keys(symbolLabelMap.value).forEach(el=>{
                const proList = symbolLabelMap.value[el];   // 当前标签下的产品列表
                const proByCurrency = {}    // 当前标签的产品列表根据盈利货币进行分类
                proList.forEach(pro => {
                    const profitCurrency = pro.profitCurrency
                    if (proByCurrency[profitCurrency]) {
                        proByCurrency[profitCurrency].push(pro)
                    } else {
                        proByCurrency[profitCurrency] = [pro]
                    }
                })

                const proListByCurrency = Object.entries(proByCurrency).sort((a,b)=>{
                            if(a[0]<b[0]){
                                return -1;
                            }else if(a[0]>b[0]){
                                return 1
                            }else{
                                return 0
                            }
                        })
                        .map(([key,val])=>{
                            return {
                                currency: stockSelectOptName(key),
                                list: val,
                            }
                        })

                productListByLabel.value.push({
                    labelCode: el,
                    productList: proList,
                    list: proListByCurrency
                })
            })
        }
    })

    // 股票玩法获取盈利货币对应的市场名称
    function stockSelectOptName(currency){
        if(currency==='HKD'){
            return t('trade.hkdStock');
        }else if(currency==='USD'){
            return t('trade.usdStock');
        }else {
            return currency
        }
    }

    return {
        symbolLabelList,
        symbolKeyByPlans,
        productListByLabel,
    }
}
