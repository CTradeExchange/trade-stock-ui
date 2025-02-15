<template>
    <van-empty
        v-if='positionList?.length === 0'
        :description="$t('trade.positionEmpty')"
        image='/images/empty.png'
    />
    <div v-else class='position-wrap'>
        <p v-if='showHeader' class='header'>
            <span>{{ $t('trade.position') }}({{ positionList?.length }})</span>
            <span class='fr' :class="profitLoss > 0 ? 'riseColor': 'fallColor'">
                {{ profitLoss || '--' }}
            </span>
        </p>
        <van-loading v-if='loading && showHeader' class='loading' />
        <div v-if='Number(tradeType) === 6'>
            <positionItemStock
                v-for='item in positionList'
                :key='item.positionId'
                :data='item'
                :product='product'
            />
        </div>
        <div v-else>
            <positionItem
                v-for='item in positionList'
                :key='item.positionId'
                :data='item'
                :product='product'
                @showAdjustPopup='showAdjustPopup'
                @showClose='showClose'
                @showMultiplePopup='showMultiplePopup'
                @showSLTP='showSLTP'
            />
        </div>
    </div>

    <!-- 平仓 -->
    <DialogClosePosition
        v-if='product'
        v-model:show='closeVisible'
        :data='positionData'
        :product='product'
    />
    <!-- 调整保证金 -->
    <DialogAdjustMargin
        v-model:show='adjustVisible'
        :data='positionData'
    />
    <!-- 设置止损止盈 -->
    <DialogSLTP
        v-if='product && showSetProfit'
        :data='positionData'
        :product='product'
        :show='showSetProfit'
        @update:show='updateSLTPVisible'
    />
    <!-- 设置止损止盈 -->
    <MultipleSet
        v-if="product && product.tradeType===2 && product.marginInfo && product.marginInfo.type!=='1'"
        v-model='multipleSetVisible'
        v-model:multipleVal='mVal'
        :position='positionData'
        :product='product'
        @save='saveMultiple'
    />
    <MultipleSetCross
        v-if="product && product.tradeType===1 && product.marginInfo && product.marginInfo.type!=='1'"
        v-model='multipleSetVisible'
        v-model:multipleVal='mVal'
        :position='positionData'
        :product='product'
        @save='saveMultiple'
    />
</template>

<script>
import { computed, reactive, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import positionItem from './positionItem'
import positionItemStock from './positionItemStock'
import DialogClosePosition from '@plans/components/dialogClosePosition'
import DialogAdjustMargin from '@plans/components/dialogAdjustMargin'
import DialogSLTP from '@plans/components/dialogSLTP'
import MultipleSet from '@plans/components/multipleSet'
import MultipleSetCross from '@plans/components/multipleSetCross'
export default {
    components: {
        positionItem,
        MultipleSet,
        MultipleSetCross,
        DialogClosePosition,
        DialogAdjustMargin,
        DialogSLTP,
        positionItemStock
    },
    props: {
        // 是否显示头部标题
        showHeader: {
            type: Boolean,
            default: true
        },
        // 股票玩法的当前币种
        currency: {
            type: String
        }
    },
    setup (props, { emit }) {
        const store = useStore()
        const router = useRouter()
        const state = reactive({
            closeVisible: false,
            adjustVisible: false,
            multipleSetVisible: false,
            mVal: '',
            positionData: null,
            showSetProfit: false
        })

        // 获取玩法列表
        const plans = computed(() => store.state._base.plans)
        const tradeType = computed(() => store.state._quote.curTradeType || plans.value[0].id)

        const positionList = computed(() => store.state._trade.positionList[Number(tradeType.value)] ?? [])

        const userAccount = computed(() => store.state._user.accountAssets[tradeType.value])

        const loading = computed(() => store.state._trade.positionLoading)
        const product = computed(() => store.state._quote.productMap[state.positionData?.symbolId + '_' + tradeType.value])

        // 盈亏
        const profitLoss = computed(() => {
            if (Number(tradeType.value) === 6) {
                return userAccount.value?.[props.currency]?.profitLoss
            } else {
                return userAccount.value?.profitLoss
            }
        })

        // 平仓
        const showClose = (data) => {
            store.commit('_quote/Update_productActivedID', data.symbolId + '_' + tradeType.value)
            state.positionData = data
            state.closeVisible = true
            if (!product.value.minVolume) {
                store.dispatch('_quote/querySymbolInfo', {
                    symbolId: data.symbolId,
                    tradeType: tradeType.value
                })
            }
        }

        // 调整保证金
        const showAdjustPopup = (data) => {
            state.positionData = data
            state.adjustVisible = true
        }

        // 设置止盈止损
        const showSLTP = (data) => {
            state.positionData = data
            state.showSetProfit = true
            store.commit('_quote/Update_productActivedID', data.symbolId + '_' + tradeType.value)
        }

        // 设置杠杆倍数
        const showMultiplePopup = (data) => {
            state.positionData = data
            state.multipleSetVisible = true
            state.mVal = data.crossLevelNum
            // store.commit('_quote/Update_productActivedID', data.symbolId + '_' + tradeType.value)
            if (!product.value.minVolume) {
                store.dispatch('_quote/querySymbolInfo', {
                    symbolId: data.symbolId,
                    tradeType: tradeType.value
                })
            }
        }
        // 保存杠杆倍数
        const saveMultiple = (val) => {
            console.log(val)
        }

        const updateSLTPVisible = (val) => {
            state.showSetProfit = val
        }

        return {
            ...toRefs(state),
            positionList,
            product,
            showAdjustPopup,
            showClose,
            showSLTP,
            showMultiplePopup,
            updateSLTPVisible,
            saveMultiple,
            tradeType,
            loading,
            userAccount,
            profitLoss
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.position-wrap {
    background-color: var(--contentColor);
    margin-top: rem(30px);
    border-radius: rem(8px);
    //margin:  rem(20px);
    .header {
        display: flex;
        justify-content: space-between;
        padding: 0 rem(30px);
        color: var(--color);
        font-size: rem(28px);
        line-height: rem(100px);
        border-bottom: solid rem(1px) var(--lineColor);
        .fr {
            font-weight: bold;
            font-size: rem(34px);
        }
    }
}
.loading {
    line-height: rem(100px);
    background: var(--contentColor);
}
.van-empty {
    border-radius: rem(6px);
}
</style>
