<template>
    <div class='quoteWrap'>
        <plansType v-if='plansLen>1' :list='plansList' :value='tradeType' @change='handleTradeType' />
        <div class='search_box' :class='{ top: plansLen>1 }'>
            <div class='search_input'>
                <van-search
                    v-model='state.searchKey'
                    :action-text='$t("common.cancel")'
                    clearable
                    :placeholder='$t("search.keywords")'
                    show-action
                    @cancel='onCancel'
                    @search='onSearch'
                    @update:model-value='updateVal'
                />
            </div>
            <div class='search_products'>
                <div v-for='(item) in searchList' :key='item.symbolId' class='product_item of-1px-bottom' @click='openProduct(item.id)'>
                    <div>
                        <span class='symbolName'>
                            {{ item.name }}
                        </span>
                        <span v-if='item.code' class='symbolCode'>
                            {{ item.code }}
                        </span>
                    </div>
                    <div>
                        <button v-if='isLogin' v-preventReClick class='collectIcon' @click.stop='addOptional(item)'>
                            <i
                                :class="item.isSelfSymbol ? 'icon_zixuan2' : 'icon_zixuan11'"
                            ></i>
                        </button>
                        <span v-if='item.etf' class='product_etf'>
                            <ETF />
                        </span>
                    </div>
                </div>
                <div v-show='state.searchKey && state.search_loading === false && searchList.length === 0'>
                    <van-empty :description="$t('search.norecord')" image='/images/empty.png' />
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import plansType from '@/themes/plans/components/plansType.vue'
import { debounce, isEmpty } from '@/utils/util'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import { addCustomerOptional, removeCustomerOptional, getSymbolList } from '@/api/trade'
import { Toast } from 'vant'
import { useI18n } from 'vue-i18n'
import ETF from '@plans/components/etfIcon'

export default {
    name: 'ProductSearch',
    components: {
        plansType,
        ETF,
    },
    setup () {
        const state = reactive({
            searchKey: '',
            search_loading: false, // 是否搜索中
            searchList: [],
        })
        const { t } = useI18n({ useScope: 'global' })
        const route = useRoute()
        const router = useRouter()
        const store = useStore()

        // 是否登录
        const isLogin = computed(() => !isEmpty(store.state._user.customerInfo))

        // 玩法列表
        const isWallet = store.state._base.wpCompanyInfo.isWallet
        const plansList = computed(() =>
            store.state._base.plans.filter(e => !(e.tradeType === '5' && isWallet))
                .map(el => {
                    el.name = t('tradeType.' + el.tradeType)
                    return el
                })
        )

        const plansLen = computed(() => {
            const userProductCategory = store.getters.userProductCategory
            let arr = Object.keys(userProductCategory)
            arr = arr.filter(el => {
                return userProductCategory[el]?.find(o => o.listByUser?.length)
            })
            return arr.length
        })

        const productMap = computed(() => store.state._quote.productMap)

        // 1.玩法类型
        const tradeType = ref(route.query.tradeType || plansList.value[0].id)

        // 自选股
        const selfSymbolList = computed(() => store.state._user.selfSymbolList)

        // 最终展示的list
        const searchList = computed(() => {
            const currentSelfSymbolList = selfSymbolList.value[tradeType.value] || []
            const searchList = []
            state.searchList.forEach(item => {
                if (productMap.value[String(item.id) + '_' + tradeType.value]) {
                    searchList.push({
                        ...item,
                        isSelfSymbol: currentSelfSymbolList.some(el => (item.id === el.symbolId || item.id === el.id)), // 是否添加了自选
                    })
                }
            })
            return searchList
        })

        // 监听玩法类型
        const handleTradeType = (val) => {
            tradeType.value = val
            state.searchList = []
            state.searchKey = ''
        }

        const onSearch = (val) => {
            state.search_loading = true
            if (!val) {
                state.searchList = []
                state.search_loading = false
                return false
            }
            getSymbolList({ name: val, tradeType: tradeType.value }).then(res => {
                // 校验当前请求是否最新关键词的请求
                if (res.check() && val === state.searchKey) {
                    state.searchList = res.data || []
                    state.search_loading = false
                }
            }).catch(() => {
                state.search_loading = false
            })
        }

        // 搜索请求节流
        const updateVal = debounce((val) => {
            return onSearch(val)
        }, 300)

        const onCancel = () => {
            router.push('/quote')
        }

        // 跳转产品详情
        const openProduct = (symbolId) => {
            router.push(`/product?symbolId=${symbolId}&tradeType=${tradeType.value}`)
        }

        // 添加自选
        const addOptional = (item) => {
            const option = { symbolList: [item.id], tradeType: tradeType.value }
            if (!isLogin) return // 未登录不调接口
            if (item.isSelfSymbol) {
                removeCustomerOptional(option).then(res => {
                    if (res.check()) {
                        store.dispatch('_user/queryCustomerOptionalList')
                        Toast(t('trade.removeOptionalOk'))
                    }
                }).catch(err => {})
            } else {
                addCustomerOptional(option).then(res => {
                    if (res.check()) {
                        store.dispatch('_user/queryCustomerOptionalList')
                        Toast(t('trade.addOptionalOk'))
                    }
                }).catch(err => {})
            }
        }

        return {
            updateVal,
            addOptional,
            openProduct,
            onSearch,
            onCancel,
            state,
            plansLen,
            plansList,
            handleTradeType,
            tradeType,
            searchList,
            isLogin
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
:deep(.van-cell) {
    background-color: var(--bgColor) !important;
}
.quoteWrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    // margin-top: rem(90px);
    padding-bottom: rem(100px);
    overflow: auto;
    background: var(--bgColor);
    .productListWrap {
        flex: 1;
        overflow-y: auto;
    }
    .search_box {
        position: absolute;
        top: 0;
        right: 0;
        bottom: rem(100px);
        left: 0;
        z-index: 2;
        background: var(--contentColor);
        overflow: auto;
        &.top {
            top: rem(100px);
        }
        .search_input {
            .van-field {
                border-radius: 3px;
            }
            :deep(.van-cell){
                padding-left: 0;
                align-items: center;
                justify-content: center;
            }
            :deep(.van-search__action){
                padding: 0 rem(30px)
            }
            :deep(.van-search__content){
                padding-left: var(--van-padding-xs);
            }
            :deep(.van-field__left-icon){
                margin-right: var(--van-padding-xs);
            }
            :deep(.van-cell  .van-icon){
                margin-top: rem(-3px);
            }
        }
        .search_label {
            display: inline-block;
            color: #333;
        }
        .search_products {
            background: var(--contentColor);
            .product_item {
                height: rem(100px);
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-left: rem(30px);
                &:active{
                    background: var(--bgColor);
                }
                button {
                    align-self: stretch;
                    width: rem(80px);
                    background: none;
                }
                .icon_zixuan2 {
                    animation: heartBeat 1.3s ease-in-out forwards;
                    color: var(--focusColor);
                }
                .activeText{
                    color: var(--primary);
                }
                .symbolName{
                    font-size: rem(30px);
                }
                .symbolCode{
                    margin-left: rem(20px);
                    font-size: rem(26px);
                    color: var(--minorColor);
                }
                .product_etf{
                    margin-right: rem(30px);
                }
            }
        }
    }
}
.tradeNav {
    // position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    //padding-bottom: rem(10px);
    background-color: var(--contentColor);
    //border-bottom: solid 4px var(--lineColor);
    .van-tab {
        background: yellow !important;
    }
    .tradeSortNav {
        padding-right: rem(64px) !important;
    }
    i {
        position: relative;
        right: rem(40px);
        bottom: rem(60px);
        float: right;
    }
}
.titleBar {
    display: flex;
    height: rem(60px);
    padding: 0 rem(30px);
    color: var(--minorColor);
    font-size: rem(20px);
    line-height: rem(60px);
    background-color: var(--contentColor);
    .item {
        width: rem(210px);
        text-align: right;
        &:first-child {
            flex: 1;
            text-align: left;
        }
        &:nth-child(2) {
            width: rem(210px);
            text-align: left;
        }
    }
}
</style>
