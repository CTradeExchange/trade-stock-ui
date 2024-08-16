<template>
    <div class='quoteWrap' :class='{ hasNav: $hasNav }'>
        <plansType v-if='plansLen>1' :list='plansList' :value='tradeType' @change='handleTradeType' />
        <div class='tradeNav'>
            <TopTab
                ref='tabList'
                v-model='categoryType'
                :background='$style.contentColor'
                class='tradeSortNav'
                :dot='true'
                line-height='0'
                line-width='0'
                :list='categoryList'
                @change='tabChange'
                @tabClick='tabClick'
            />
            <!-- <van-icon class='iconSearch' name='search' @click='openSearch' /> -->
            <i class='icon_sousuo iconSearch' @click='openSearch'></i>
        </div>

        <!-- etf banner -->
        <a v-if='String(categoryType)===fundBannerPosition[1] && tradeType===fundBannerPosition[0]' class='etfBanner' href='javascript:;' @click='toETF'>
            <img alt='' :src='"/images/ETF_banner_"+locale+".png"' />
        </a>

        <div class='titleBar van-hairline--bottom'>
            <span class='item' @click='sortHandler("symbolName")'>
                {{ $t('trade.nameCode') }}
                <SortIcon name='symbolName' :sort-field='sortField' :sort-type='sortType' />
            </span>

            <span v-if='isStock' class='item' @click='sortHandler("cur_price")'>
                {{ $t("trade.priceLabel") }}
                <SortIcon name='cur_price' :sort-field='sortField' :sort-type='sortType' />
            </span>
            <span v-else class='item' @click='sortHandler("rolling_last_price")'>
                {{ $t('trade.newPrice') }}
                <SortIcon name='rolling_last_price' :sort-field='sortField' :sort-type='sortType' />
            </span>
            <span class='item' @click='sortHandler("upDownAmount")'>
                {{ $t('chart.diffPrice') }}
                <SortIcon name='upDownAmount' :sort-field='sortField' :sort-type='sortType' />
            </span>
            <span v-if='isStock' class='item' @click='sortHandler("upDownWidth")'>
                {{ $t('chart.upAndDown') }}
                <SortIcon name='upDownWidth' :sort-field='sortField' :sort-type='sortType' />
            </span>
            <span v-else class='item' @click='sortHandler("rolling_upDownWidth")'>
                {{ $t('trade.changePercent') }}
                <SortIcon name='rolling_upDownWidth' :sort-field='sortField' :sort-type='sortType' />
            </span>
        </div>
        <productStockList v-if='isStock' ref='productStockListEl' :product-list='productStockList' />
        <productListComp v-else ref='productListEl' :product-list='productList' />
        <div v-if='categoryType === 0 && productList.length === 0' class='AddToOptional'>
            <van-button size='small' type='primary' @click='goSearchPage'>
                <van-icon name='add' /> {{ $t('trade.addToOptional') }}
            </van-button>
        </div>
    </div>
</template>

<script>
import TopTab from '@plans/components/topTab'
import productListComp from '@plans/modules/productList/productList.vue'
import productStockList from '@plans/modules/productList/productStockList.vue'
import SortIcon from '@plans/components/sortIcon.vue'
import { ref, watch, computed, onActivated, unref, nextTick, onMounted, onBeforeUnmount } from 'vue'
import plansType from '@/themes/plans/components/plansType.vue'
import useProduct from '@plans/hooks/useProduct'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { localSet, localGet } from '@/utils/util'
import { QuoteSocket } from '@/plugins/socket/socket'
export default {
    name: 'Quote',
    components: {
        productListComp,
        productStockList,
        TopTab,
        SortIcon,
        plansType
    },
    setup () {
        const store = useStore()
        const router = useRouter()
        const { t, locale } = useI18n({ useScope: 'global' })

        const productListEl = ref(null)
        const productStockListEl = ref(null)
        // 玩法列表
        const isWallet = store.state._base.wpCompanyInfo.isWallet
        const plansList = computed(() =>
            store.state._base.plans.filter(e => !(e.tradeType === '5' && isWallet))
                .map(el => {
                    el.name = t('tradeType.' + el.tradeType)
                    return el
                })
        )
        const symbolKey = computed(() => store.state._quote.productActivedID || '')
        const productTradeType = computed(() => unref(symbolKey).split('_')[1] || 0)
        const customerInfo = computed(() => store.state._user.customerInfo)
        // 1.玩法类型
        const tradeType = ref(unref(productTradeType))

        const tradeTypeOld = ref(0)
        const categoryTypeOld = ref(0)
        // 2.板块类型
        const categoryType = ref(1)
        // 获取板块列表和所选板块的产品列表
        const { categoryList, productList, productStockList, sortField, sortType, sortFunc, productStockListSet, resetStockSortTimer } = useProduct({
            tradeType, categoryType
        })

        // 是否为股票玩法
        const isStock = computed(() => parseInt(tradeType.value) === 6)

        const localSelfSymbolListCur = ref(localGet('localSelfSymbolList'))

        const localSymbolUpdate = computed(() => store.state._user.localSelfSymbolList)

        const plansLen = computed(() => {
            const userProductCategory = store.getters.userProductCategory
            let arr = Object.keys(userProductCategory)
            arr = arr.filter(el => {
                return userProductCategory[el]?.find(o => o.listByUser?.length)
            })
            return arr.length
        })

        // 点击排序
        const sortHandler = (field) => {
            sortFunc(field)
        }

        // 监听玩法类型
        const handleTradeType = async (val) => {
            tradeType.value = val
            tradeTypeOld.value = val
            categoryType.value = 0
            await nextTick()
            const list = isStock.value ? productStockList : productList
            unref(list).length && store.commit('_quote/Update_productActivedID', unref(list)[0].symbolId + '_' + val)
        }

        // 订阅当前方法的产品报价
        const subscribeHandler = () => {
            if (!isStock.value && productListEl.value) productListEl.value.subscribeAll()
            // 如果是股票玩法，取消24H订阅，如果是其他玩法取消实时报价订阅
            QuoteSocket.cancel_subscribe(isStock.value ? 3 : 1)
            if (isStock.value) {
                productStockListEl.value.showAll = false
                // 执行一遍股票玩法的产品列表排序
                productStockListSet()
                // 重置自动排序的定时器
                resetStockSortTimer()
                productStockListEl.value.subscribeAll()
            }
        }

        // 监听玩法类型/板块类型的变化，触发产品订阅
        // 获取productList.vue组件的ref对象和产品列表均是异步，所以第一次产品订阅在productList.vue组件内
        watch(
            [tradeType, categoryType, productList],
            async () => {
                await nextTick()
                subscribeHandler()
            }
        )

        // 股票玩法拿到快照后及时排序
        const snapshotPriceEvent = () => {
            if (isStock.value) {
                // 执行一遍股票玩法的产品列表排序
                productStockListSet()
                // 重置自动排序的定时器
                resetStockSortTimer()
            }
        }

        onActivated(async () => {
            await nextTick()
            subscribeHandler()

            // 未登录游客自选操作后返回过滤更新列表
            if (!customerInfo.value) {
                if (categoryType.value === 0) {
                    // if (JSON.parse(localGet('localSelfSymbolList')).length !== JSON.parse(localSelfSymbolListCur.value).length) {
                    // tradeType.value = tradeTypeOld.value
                    categoryType.value = null
                    // await nextTick()
                    // 定时切换一下玩法，触发刷新列表
                    var st = setTimeout(() => {
                        categoryType.value = 0
                        localSelfSymbolListCur.value = localGet('localSelfSymbolList')
                        clearTimeout(st)
                    }, 150)
                    // }
                }
            }
        })

        onMounted(() => {
            document.body.addEventListener('cmd_id_14023', snapshotPriceEvent, false)
        })
        onBeforeUnmount(() => {
            document.body.removeEventListener('cmd_id_14023', snapshotPriceEvent, false)
        })

        const tabChange = (i) => {}
        const tabClick = (i) => {}

        const showSidebar = ref(false)
        const openSearch = () => {
            router.push(`/productSearch?tradeType=${tradeType.value}`)
        }

        // 进入基金产品列表页面
        const toETF = () => {
            store.commit('del_cacheViews', 'FundProductList')
            router.push('/fundProductList')
        }

        const goSearchPage = () => {
            router.push(`/productSearch?tradeType=${tradeType.value}`)
        }

        return {
            locale,
            fundBannerPosition: window['fundBannerPosition'].split('-'),
            openSearch,
            isStock,
            categoryType,
            productStockListEl,
            productListEl,
            plansLen,
            plansList,
            categoryList,
            productList,
            productStockList,
            sortField,
            sortType,
            sortHandler,
            tabChange,
            tabClick,
            handleTradeType,
            tradeType,
            toETF,
            localSelfSymbolListCur,
            tradeTypeOld,
            categoryTypeOld,
            showSidebar,
            goSearchPage,
            customerInfo,
            localSymbolUpdate
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.quoteWrap {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    // margin-top: rem(90px);
    overflow: auto;
    background: var(--bgColor);
    &.hasNav {
        padding-bottom: rem(100px);
    }
    .productListWrap {
        flex: 1;
        overflow-y: scroll;
        -webkit-overflow-scrolling: touch;
    }
}
.tradeNav {
    position: relative;
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
    .iconSearch {
        position: absolute;
        top: rem(30px);
        right: rem(28px);
        font-size: rem(32px);
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
    &::after {
        border-color: var(--bgColor);
    }
    .item {
        flex: 1;
        text-align: right;
        &:first-child {
            flex: none;
            width: rem(200px);
            text-align: left;
        }
    }
}
.etfBanner {
    display: block;
    padding: 4px 0;
    background: var(--contentColor);
    img {
        display: block;
        width: 100%;
    }
}
.AddToOptional {
    position: absolute;
    top: 45%;
    right: 20%;
    left: 20%;
    display: inline-block;
    margin: 0 0 rem(20px) 0;
    text-align: center;
    .van-button {
        width: 80%;
        height: rem(160px);
        color: var(--primary);
        background: var(--contentColor);
        font-weight: bold;
        line-height: rem(160px);
        border: none;
    }
}
</style>
