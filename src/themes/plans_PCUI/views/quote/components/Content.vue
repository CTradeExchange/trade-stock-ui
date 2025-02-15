<template>
    <div class='content'>
        <div class='header'>
            <PlansType v-model='tradeType' />
            <Autocomplete :trade-type='tradeType' />
        </div>
        <CategoryList v-model='categoryType' :list='computedCategoryList' />

        <div class='productWrapper'>
            <ProductList v-if='tradeType' :list='products' :trade-type='tradeType' />
            <div v-if='categoryType === "0" && products.length === 0' class='AddToOptional'>
                <van-button plain size='small' type='primary' @click='goAddOptional'>
                    <van-icon name='add' /> {{ $t('trade.addToOptional') }}
                </van-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, unref, computed, onUnmounted, onMounted, onBeforeMount, provide, nextTick } from 'vue'
import PlansType from './PlansType'
import useProduct, { productStockListSet } from '@planspc/hooks/useProduct'
import { QuoteSocket } from '@/plugins/socket/socket'
import ProductList from './ProductList'
import CategoryList from './CategoryList'
import Autocomplete from './Autocomplete'
import { useStore } from 'vuex'

const store = useStore()
const tradeType = ref('')
const productListData = ref([])

// 获取板块列表和所选板块的产品列表
const categoryType = ref('1')
const { categoryList, productList } = useProduct({
    tradeType, categoryType
})

const productStockList = ref([])
const productListReset = () => {
    productStockList.value = productStockListSet(unref(productList))
}
// 股票玩法30s定时排序
let stockSortTimer = null
const clearStockSortTimer = () => {
    if (stockSortTimer) {
        clearInterval(stockSortTimer)
        stockSortTimer = null
    }
}
const resetStockSortTimer = () => {
    clearStockSortTimer()
    stockSortTimer = setInterval(() => {
        const subscribeSymbolKey = unref(productList).map(el => el.symbolKey)
        QuoteSocket.send_subscribe_stock(subscribeSymbolKey).then(res => {
            productListReset()
        })
    }, 30000)
}

const planMap = computed(() => store.state._quote.planMap) // 每个玩法下配置的产品

provide('isReLoadProductList', (value, productId) => {
    if (value === true) {
        const ArrPro = unref(productListData).value
        const tempCur = categoryType.value
        categoryType.value = categoryType.value === '1' ? '0' : '1'
        categoryType.value = tempCur
    }
})
provide('refreshSort', (value) => {
    productListReset()
})

const computedCategoryList = computed((el) => {
    const list = [...unref(categoryList)]
    list.forEach(el => {
        if (el.id === 'selfSymbol') {
            el.slot = {
                label: <div>
                            <span class="icon iconfont icon_lansezixuan"></span>
                            <span>
                                {el.title}
                            </span>
                        </div>
            }
        }
    })
    return list
})

// 产品列表
const products = computed(() => {
    return parseInt(unref(tradeType)) === 6 ? productStockList.value : productList.value
})

watch(
    [() => categoryType.value, () => productList.value.length],
    (val) => {
        resetStockSortTimer()
        const subscribeSymbolKey = unref(productList).map(el => el.symbolKey)
        if (subscribeSymbolKey.length) {
            QuoteSocket.send_subscribe_stock(subscribeSymbolKey).then(res => {
                productListReset()
            })
        } else {
            productListReset()
        }
    }, {
        immediate: true,
    })

// 需要订阅的产品列表
const subscribeSymbolsList = computed(() => {
    const symbolList = planMap.value[tradeType.value].symbolList
    const symbolKeys = symbolList.map(symbolId => `${symbolId}_${tradeType.value}`).sort((a, b) => a.localeCompare(b))
    return symbolKeys
})

const moduleId = 'quote_' + Date.now()
let unSubscribe = () => {}

watch(
    () => unref(tradeType),
    () => {
        categoryType.value = '1'
        const subscribeSymbolsListVal = unref(subscribeSymbolsList)
        if (subscribeSymbolsListVal.length === 0) return false
        const [firstItem] = subscribeSymbolsListVal
        const [_, curTradeType] = firstItem.split('_') || []
        if (curTradeType === '6') {
            unSubscribe = QuoteSocket.send_subscribe_stock(subscribeSymbolsListVal)
            unSubscribe = QuoteSocket.add_subscribe({ moduleId, symbolKeys: subscribeSymbolsListVal })
        } else {
            unSubscribe = QuoteSocket.add_subscribe24H({ moduleId, symbolKeys: subscribeSymbolsListVal })
        }
    }
)

const initList = () => {
    productListData.value = ref(productList)
}

const goAddOptional = () => {
    categoryType.value = '1'
}

onBeforeMount(() => {
    // console.log(productList)
    initList()
})

onUnmounted(() => {
    unSubscribe()
})

</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.content {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    width: 100%;
    margin-bottom: 80px;
    padding-bottom: 20px;
    background: var(--contentColor);
    border-radius: 10px;
    .header {
        position: relative;
        display: flex;
        flex: 0 0 56px;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0 20px;
        line-height: 56px;
        &::after {
            position: absolute;
            bottom: -1px;
            left: 0;
            z-index: var(--el-index-normal);
            width: 100%;
            height: 3px;
            background-color: var(--assistColor);
            content: '';
        }
    }
    .icon_lansezixuan {
        margin-right: 5px;
        font-size: 14px;
    }
}
.productWrapper {
    position: relative;
}
.AddToOptional {
    position: absolute;
    top: 45%;
    right: 20%;
    left: 20%;
    z-index: 9;
    display: inline-block;
    margin: 0 0 20px;
    text-align: center;
    .van-button {
        width: 200px;
        height: 80px;
        color: var(--primary);
        font-weight: bold;
        font-size: 18px;
        line-height: 80px;
        background: var(--contentColor);
        border: none;
        transition: ease-in 0.2s;
        &:hover {
            background: var(--assistColor);
        }
    }
}
</style>
