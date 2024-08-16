<template>
    <div class='assetsInfoWrapper fullPageWrapper'>
        <LayoutTop
            :custom-style='{
                "background": $style.bgColor
            }'
            :title='$t("route.assetsInfo")'
        />
        <div v-if="currency === 'HKD' || currency === 'USD'" class='asssetsInfoHead'>
            <van-cell-group>
                <van-cell
                    :value='currency === "HKD" ? $t("tradeAccount.HKD") : $t("tradeAccount.USD")'
                />
            </van-cell-group>
        </div>
        <div class='asssetsBalance'>
            <van-cell-group>
                <van-cell>
                    <template #title>
                        <div class='balance-top'>
                            <span class='balance-title'>
                                {{ $t('assets.assetsEquity') }}（{{ currency }})
                            </span>
                            <span
                                class='icon-eye'
                                :class='[assetVisible ? "icon_icon_pressed" : "icon_icon_default"]'
                                @click='assetVisible=!assetVisible'
                            ></span>
                        </div>
                    </template>
                    <template #label>
                        <span class='balance-label'>
                            {{ formatVal(userAccount[currency]?.netAsset) }}
                        </span>
                    </template>
                </van-cell>
            </van-cell-group>
        </div>
        <div class='assetsInfo'>
            <van-cell-group :title='$t("assets.asset")'>
                <van-cell :title='$t("assets.positionMarketValue")' :value='formatVal(info.positionMarketValue)' />
                <div class='sub-cell'>
                    <van-cell :title='$t("assets.positionSellMarketValue")' :value='formatVal(info.positionSellMarketValue)' />
                    <van-cell :title='$t("assets.positionBuyMarketValue")' :value='formatVal(info.positionBuyMarketValue)' />
                </div>
                <van-cell :title='$t("assets.cash")' :value='formatVal(info.balance)' />
                <van-cell :title='$t("assets.liabilitiesPrincipal")' :value='formatVal(info.liabilitiesPrincipal)' />
                <van-cell :title='$t("assets.lockAmount")' :value='formatVal(info.lockAmount)' />
                <van-cell :title='$t("assets.withdrawAmount")' :value='formatVal(info.withdrawAmount)' />
            </van-cell-group>

            <van-cell-group :title='$t("assets.buypow")'>
                <van-cell :title='$t("assets.maxDayPurchasePower")' :value='formatVal(info.maxDayPurchasePower)' />
                <van-cell :title='$t("assets.initMargin")' :value='formatVal(info.margin)' />
                <van-cell :title='$t("assets.warningMargin")' :value='formatVal(info.warningMargin)' />
                <van-cell :title='$t("assets.maintainMargin")' :value='formatVal(info.maintainMargin)' />
            </van-cell-group>

            <van-cell-group :title='$t("assets.riskLevelLine")'>
                <van-cell :title='$t("assets.riskLevelStatus")' :value='formatVal(riskLevelMap[info.riskLevel] || "--")' />
                <van-cell :title='$t("assets.crossLevel")' :value='formatVal(info.crossLevel)' />
                <van-cell :title='$t("assets.residualLiquidity")' :value='formatVal(info.residualLiquidity)' />
            </van-cell-group>
        </div>
    </div>
</template>

<script>
import { onMounted, reactive, toRefs, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { queryAccountAssetsInfoStock } from '@/api/user'
import { useI18n } from 'vue-i18n'
import { MsgSocket } from '@/plugins/socket/socket'
import { useStore } from 'vuex'

export default {

    setup () {
        const route = useRoute()
        const { t } = useI18n({ useScope: 'global' })

        const state = reactive({
            assetVisible: true,
            tradeType: route.query.tradeType,
            currency: route.query.currency.toUpperCase(),
            accountId: route.query.accountId,
            info: {
                accountId: 0,
                assetsId: 0,
                balance: '--',
                companyId: 0,
                crossLevel: 0,
                currency: '--',
                customerId: 0,
                customerNo: '--',
                digits: 0,
                equity: '--',
                liabilitiesPrincipal: '--',
                lockAmount: '--',
                maintainMargin: '--',
                margin: '--',
                maxDayPurchasePower: '--',
                maxNightPurchasePower: '--',
                pnl: '--',
                positionBuyMarketValue: '--',
                positionMarketValue: '--',
                positionSellMarketValue: '--',
                residualLiquidity: '--',
                riskLevel: 0,
                tradeType: 0,
                warningMargin: '--',
                withdrawAmount: ''
            },
            riskLevelMap: {
                1: t('riskLevel.safety'),
                2: t('riskLevel.warn'),
                3: t('riskLevel.danger')
            }
        })

        // 格式化金额 隐藏就全为--
        const formatVal = (val) => {
            return (state.assetVisible) ? val : '*****'
        }

        const store = useStore()
        const userAccount = computed(() => store.state._user.accountAssets[6] || {})

        onMounted(() => {
            const query = {
                currencyCode: state.currency.toUpperCase(),
                tradeType: state.tradeType
            }
            // 获取当前币种资产信息
            queryAccountAssetsInfoStock(query).then((res) => {
                if (res.check() && res.data) {
                    state.info = {
                        ...res.data
                    }
                }
            })
            MsgSocket.subscribeAsset({
                tradeTypes: '6',
                subscribeType: '1,2'
            })
        })

        onUnmounted(() => {
            MsgSocket.cancelSubscribeAsset()
        })

        return {
            ...toRefs(state),
            userAccount,
            formatVal
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.assetsInfoWrapper{
    margin-top: rem(110px);
    :deep(.van-cell-group){
        margin-bottom: rem(10px);
    }
    :deep(.van-cell-group__title){
        background: var(--contentColor);
        color: var(--color);
        padding: rem(28px) rem(30px);
        font-weight: bold;
    }
    .asssetsInfoHead{
        background: var(--contentColor);
    }
    .asssetsBalance{
        .balance-top{
            display: flex;
            align-items: center;
        }
        .balance-title{
            color: var(--color);
            font-size: rem(30px);
            margin-bottom: rem(10px);
        }
        .balance-label{
            font-size: rem(40px);
        }
        .icon-eye{
            margin-left: rem(10px);
            margin-bottom: rem(10px);
            font-size: rem(35px);
        }
        :deep(.van-cell__title){
            padding: rem(12px) 0;
        }
        :deep(.van-cell__label){
            color: var(--color);
        }
    }
    .assetsInfo {
        .sub-cell{
            padding-left: rem(30px);
        }
    }
}

</style>
