<template>
    <div class='rankingModule'>
        <div v-if='showLabelTab && labelList.length>1' class='plansList'>
            <el-tabs
                v-model='activeTab'
                class='labelTabs'
            >
                <el-tab-pane v-for='(item, index) in labelList' :key='index' :label='item.name' />
            </el-tabs>
        </div>
        <RankContentStock
            v-if="activeLabelCode==='stock'"
            ref='rankContentStockRef'
            :active-label-code='activeLabelCode'
            :active-tab='activeTab'
            :index-column='indexColumn'
            :max='max'
            :profit-currency-list='profitCurrencyList'
            :type='type'
        />
        <RankContent
            v-else
            :active-label-code='activeLabelCode'
            :active-tab='activeTab'
            :index-column='indexColumn'
            :max='max'
            :profit-currency-list='profitCurrencyList'
            :type='type'
        />
    </div>
</template>

<script>
import RankContent from './components/rankContent'
import RankContentStock from './components/rankContentStock'
import productranking from '@planspc/hooks/productranking'
import { computed, onUnmounted, ref, unref, watch } from 'vue'
import { QuoteSocket } from '@/plugins/socket/socket'

export default {
    components: {
        RankContent,
        RankContentStock,
    },
    props: {
        indexColumn: {
            type: Boolean,
            default: false
        },
        max: {
            type: Number,
            default: 3
        },
        showLabelTab: {
            type: Boolean,
            default: true
        },
        type: {
            type: String,
            default: 'module'
        },
    },
    setup (props) {
        const { symbolLabelList, productListByLabel, symbolKeyByPlans } = productranking()
        const activeTab = ref('0')
        const rankContentStockRef = ref(null)

        // 产品标签的显示排序：加密货币、外汇、商品、股票
        const labelList = computed(() => {
            const sortIndex = ['cryptocurrency', 'FX', 'commodites', 'stock']
            const sortResult = []
            sortIndex.forEach(el => {
                const labelItem = productListByLabel.value.find(item => item.labelCode === el)
                const labelData = symbolLabelList.value.find(item => item.code === el)
                if (labelItem && labelData && labelItem.list.length) {
                    labelItem.name = labelData.name
                    sortResult.push(labelItem)
                }
            })
            return sortResult
        })
        // 当前选择的标签
        const activeLabelCode = computed(() => {
            return labelList.value[activeTab.value]?.labelCode
        })

        // 当前标签下的盈利货币下拉框列表
        const profitCurrencyList = computed(() => {
            const item = labelList.value[activeTab.value]?.list || []
            return item
        })

        // 订阅产品报价
        let unSubscribe = () => {}
        watch(
            symbolKeyByPlans,
            () => {
                if (unref(symbolKeyByPlans).length === 0) return false
                const [_, tradeType] = symbolKeyByPlans.value[0].split('_')
                if (tradeType === '6') {
                    QuoteSocket.send_subscribe_stock(symbolKeyByPlans.value).then(() => {
                        rankContentStockRef.value.refreshSort()
                    })
                } else {
                    unSubscribe = QuoteSocket.add_subscribe24H({ moduleId: 'rankingModule', symbolKeys: symbolKeyByPlans.value })
                }
            },
            {
                immediate: true,
                deep: true
            }
        )

        onUnmounted(() => {
            unSubscribe()
        })

        return {
            labelList,
            rankContentStockRef,
            activeLabelCode,
            symbolKeyByPlans,
            activeTab,
            profitCurrencyList,
            productListByLabel,
        }
    }
}
</script>

<style lang="scss" scoped>
.rankingModule {
    position: relative;
    background: var(--contentColor);
    border-radius: 5px;
    font-size: 12px;
    .labelTabs {
        margin-top: 10px;
    }
}
.plansList {
    position: relative;
    margin-bottom: 30px;
    &::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -1px;
        width: 100%;
        height: 3px;
        background-color: var(--assistColor);
        z-index: var(--el-index-normal);
    }
    :deep {
        .el-tabs__header {
            margin: 0;
        }
        .el-tabs__nav-wrap::after {
            display: none;
        }
        .el-tabs__active-bar {
            height: 3px;
        }
        .el-tabs__item {
            font-size: 20px;
            color: var(--normalColor);
            line-height: 22px;
            font-weight: 400;
            &.is-active {
                color: var(--primary);
                font-weight: bold;
            }
        }
        .el-tabs__active-bar {
            background-color: var(--primary);
        }
    }
}
</style>
