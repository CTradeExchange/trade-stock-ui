<template>
    <div class='filter-wrap'>
        <van-dropdown-menu :active-color='primaryColor' :overlay='true'>
            <van-dropdown-item
                v-model='directionVal'
                :options='direction'
                @change='dirdctionChange'
            />
            <van-dropdown-item
                v-model='status'
                :options='statusList'
                @change='dirdctionChange'
            />
            <van-dropdown-item
                ref='productDropdown'
                v-model='productVal'
                :options='product'
                @change='productChange'
                @click='openProductDropdown'
            />

            <van-dropdown-item
                ref='timeDropdown'
                v-model='timeVal'
                :options='timeList'
                @change='timeChange'
            >
                <template #title v-if='timeVal === 5'>
                    {{ customDate }}
                </template>
                <template #default>
                    <dateRange :is-selected='timeVal === 5' @change='onRangeChange' />
                </template>
            </van-dropdown-item>
        </van-dropdown-menu>
    </div>
    <div class='list-wrap'>
        <div v-if='recordList.length === 0'>
            <van-empty :description='$t("trade.noDealData")' image='/images/empty.png' />
        </div>
        <van-list
            v-else
            :finished='finished'
            :finished-text='finishedText'
            :immediate-check='false'
            :loading-text="$t('compLang.loading')"
            @load='onLoad'
        >
            <div class='detail-list'>
                <!-- <ul class='header'>
                    <li>{{ $t('trade.orderStatus') }}</li>
                    <li>{{ $t('trade.nameAndCode') }}</li>
                    <li>{{ $t('trade.countAndPrice') }}</li>
                    <li>{{ $t('trade.orderTime') }} </li>
                </ul> -->

                <trustItemStock
                    v-for='(item,index) in recordList'
                    :key='index'
                    :product='item'
                    show-mode='2'
                />

                <!-- <ul
                    v-for='(item,index) in recordList'
                    :key='index'
                    class='data'
                >
                    <li>
                        <p>{{ Number(item.direction) === 1 ? $t('trade.buy') : $t('trade.sell') }}</p>
                        <p class='gary'>
                            {{ $tm('stockPendingStatus')[item.status] }}
                        </p>
                    </li>
                    <li>
                        <p>{{ item.symbolName }}</p>
                        <p class='gary'>
                            {{ item.symbolCode }}
                        </p>
                    </li>
                    <li>
                        <p>{{ item.requestNum }}</p>
                        <p class='gary'>
                            {{ item.requestPrice }}
                        </p>
                    </li>
                    <li>
                        <p class='date'>
                            {{ formatDate(item.requestTime) }}
                        </p>
                        <p class='time'>
                            {{ formatTime(item.requestTime) }}
                        </p>
                    </li>
                </ul> -->
            </div>
        </van-list>
    </div>

    <Loading :show='loading' />

    <!-- 侧边栏-切换产品 -->
    <sidebarProduct
        v-model='switchProductVisible'
        :default-trade-type='tradeType'
        :hide-trade-type='true'
        @select='onSelectProduct'
    />
</template>

<script>
import sidebarProduct from '@plans/components/sidebarProduct.vue'
import { useI18n } from 'vue-i18n'
import { isEmpty } from '@/utils/util'
import { useRoute, } from 'vue-router'
import { computed, ref, reactive, toRefs } from 'vue'
import { useStore } from 'vuex'
import dateRange from '@plans/components/dateRange'
import Base from '@/store/modules/base'
import { queryOrderPage } from '@/api/trade'
import trustItemStock from '@plans/modules/trust/trustItemStock.vue'

export default {
    components: {
        sidebarProduct,
        dateRange,
        trustItemStock
    },
    setup (props) {
        const route = useRoute()
        const store = useStore()
        const productDropdown = ref(null)
        const timeDropdown = ref(null)
        const { t } = useI18n({ useScope: 'global' })
        const state = reactive({
            switchProductVisible: false,
            directionVal: -1,
            status: -1,
            positionTypeVal: -1,
            timeVal: 2,
            productVal: 0,
            curProduct: {},
            customDate: '',
            direction: [
                { text: t('trade.direction'), value: -1 },
                { text: t('trade.buy'), value: 1 },
                { text: t('trade.sell'), value: 2 },
            ],
            statusList: [
                { text: t('common.all'), value: -1 },
                { text: t('stockPendingStatus.0'), value: 0 },
                { text: t('stockPendingStatus.1'), value: 1 },
                { text: t('stockPendingStatus.2'), value: 2 },
                { text: t('stockPendingStatus.3'), value: 3 },
            ],

            timeList: [
                // { text: t('common.allDate'), value: 0 },
                { text: t('common.curToday'), value: 1 },
                { text: t('common.curWeek'), value: 2 },
                { text: t('common.curMonth'), value: 3 },
                { text: t('common.curThreeMonth'), value: 4 }

            ],

            product: [
                { text: t('common.allProduct'), value: 0 },
                { text: t('common.chooseProduct'), value: 1, },
            ],
            bizTypeText: {},
            params: {
                current: 1,
                size: 20,
                executeStartTime: window.dayjs(window.dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf(),
                executeEndTime: window.dayjs(window.dayjs(new Date()).format('YYYY/MM/DD 23:59:59')).valueOf()
            },
            tradeType: route.query.tradeType,
            loading: false,
            finished: false,
            finishedText: t('common.noMore'),
            loadingMore: false,
            recordList: [],

        })

        const customInfo = computed(() => store.state._user.customerInfo)
        // 获取挂单列表
        const pendingList = computed(() => store.state._trade.pendingList[state.tradeType] || [])
        const account = computed(() => store.state._user.customerInfo.accountList.filter(el => Number(el.tradeType) === Number(state.tradeType)))
        const primaryColor = computed(() => Base.state.wpCompanyInfo.themeColor)

        // 产品选择品选择产品回调
        const onSelectProduct = (p) => {
            state.curProduct = p
            state.product[1].text = p.symbolName
            state.switchProductVisible = false
            resetParams()
            state.params.symbolId = p.symbolId
            queryRecordList()
        }

        const getStatusText = status => {
            return state.statusList.find(el => Number(el.value) === Number(status)).text
        }

        // 重置参数
        const resetParams = () => {
            state.params.current = 1
            state.finished = false
            state.loadingMore = true
            state.recordList = []
        }

        const queryRecordList = () => {
            // 获取委托列表
            const accountIds = []
            if (account.value.length > 0) {
                account.value.forEach(element => {
                    accountIds.push(element.accountId)
                })
            }

            state.loading = true

            queryOrderPage({
                customerNo: customInfo.value.customerNo,
                sortFieldName: 'orderTime',
                sortType: 'desc',
                tradeType: state.tradeType,
                accountIds: accountIds + '',
                current: state.params.current,
                direction: state.directionVal,
                status: state.status,
                symbolId: state.params.symbolId,
                executeStartTime: state.params.executeStartTime,
                executeEndTime: state.params.executeEndTime
            }).then(res => {
                state.loading = false
                state.loadingMore = false
                if (res.check()) {
                    state.recordList = state.recordList.concat(res.data.records)
                    // 数据全部加载完成
                    const totalPage = Math.ceil(res.data.total / res.data.size)
                    if (state.params.current >= totalPage) {
                        state.finished = true
                        state.loadingMore = true
                        state.finishedText = t('common.noMore')
                    }
                    if (state.recordList.length === 0) {
                        state.finishedText = ''
                    }
                }
            })
            // store.dispatch('_trade/queryPBOOrderPage', {

            // }).then(res => {
            //     state.loading = false
            // })
        }

        // 底部加载更多
        const onLoad = () => {
            if (!state.loadingMore) {
                state.params.current++
                queryRecordList()
                state.loadingMore = true
            }
        }

        const openProductSwitch = () => {
            productDropdown.value.toggle(false)
            state.switchProductVisible = true
        }

        // 方向筛选
        const dirdctionChange = (val) => {
            state.params.direction = val
            resetParams()
            queryRecordList()
        }
        // 开平仓筛选
        const positionTypeChange = (val) => {
            state.params.orderType = val
            resetParams()
            queryRecordList()
        }
        // 时间筛选
        const timeChange = (timeType) => {
            if (timeType === 0) {
                state.params.executeStartTime = -1
                state.params.executeEndTime = -1
            } else if (timeType === 1) {
                state.params.executeStartTime = window.dayjs(window.dayjs(new Date()).format('YYYY/MM/DD 00:00:00')).valueOf()
            } else if (timeType === 2) {
                state.params.executeStartTime = window.dayjs(window.dayjs().subtract(7, 'day').format('YYYY/MM/DD')).valueOf()
            } else if (timeType === 3) {
                state.params.executeStartTime = window.dayjs(window.dayjs().subtract(1, 'month').format('YYYY/MM/DD')).valueOf()
            } else if (timeType === 4) {
                state.params.executeStartTime = window.dayjs(window.dayjs().subtract(3, 'month').format('YYYY/MM/DD')).valueOf()
            }
            resetParams()
            queryRecordList()
        }

        const productChange = (val) => {
            if (val === 0) {
                resetParams()
                delete state.params.symbolId
                state.product[1].text = t('common.chooseProduct')
                queryRecordList()
            } else {
                state.switchProductVisible = true
            }
        }
        const openProductDropdown = (val) => {
            if (state.productVal === 1) { state.switchProductVisible = true }
        }

        const formatDate = (val) => {
            return window.dayjs(val).format('YYYY-MM-DD')
        }

        const formatTime = (val) => {
            return window.dayjs(val).format('HH:mm:ss')
        }

        const onRangeChange = (timeList) => {
            state.timeVal = 5
            resetParams()
            if (timeList.length > 1) {
                state.params.executeStartTime = timeList[0]
                state.params.executeEndTime = timeList[1]
                state.customDate = window.dayjs(timeList[0]).format('YYYY/MM/DD HH:mm:ss') + '-' + window.dayjs(timeList[1]).format('YYYY/MM/DD HH:mm:ss')
            }
            queryRecordList()
        }
        queryRecordList()

        return {
            ...toRefs(state),
            openProductSwitch,
            productDropdown,
            onSelectProduct,
            dirdctionChange,
            positionTypeChange,
            timeChange,
            productChange,
            isEmpty,
            onLoad,
            openProductDropdown,
            timeDropdown,
            onRangeChange,
            resetParams,
            queryRecordList,
            primaryColor,
            pendingList,
            formatDate,
            getStatusText,
            formatTime
        }
    }
}
</script>

<style lang="scss" scoped>
@import '@/sass/mixin.scss';
.filter-wrap {
    position: fixed;
    width: 100%;
    z-index: 1;
    :deep(.van-dropdown-menu) {
        //background-color: var(--bgColor);
        .van-dropdown-menu__bar {
            align-items: center;
            padding: 0 rem(10px);
            background: var(--bgColor);
            box-shadow: none;
            .van-dropdown-menu__item {
                position: relative;
                justify-content: space-between;
                height: rem(48px);
                margin: 0 rem(10px);
                padding: 0 rem(5px);
                background: var(--contentColor);
                border-radius: rem(6px);
                .van-dropdown-menu__title {
                    position: static;
                    color: var(--color);
                    font-size: rem(20px);
                    &::after {
                        right: rem(10px);
                        border-color: transparent transparent  var(--normalColor) var(--normalColor);
                    }
                }
                .van-cell__title {
                    span {
                        color: var(--color);
                        font-size: rem(20px);
                    }
                }
            }
        }
        .van-dropdown-item__option {
            font-size: rem(20px);
        }
    }
}
.list-wrap {
    padding-top: rem(60px);
    .detail-list{
        //background: var(--contentColor);
        //padding: 0 rem(30px);
        .header{
            display: flex;
            justify-content: space-between;
            line-height: rem(80px);
        }
        .data{
            padding: rem(20px) rem(10px);
            border-top: solid 1px var(--lineColor);
            display: flex;
            align-items: center;
            justify-content: space-between;

        }
        li{
            flex: 25%;
            .direct{
                margin-bottom: rem(10px);
            }
            .time{
                text-align: right;
                font-size: rem(24px);
                margin-top: rem(10px);
                color: var(--minorColor);
            }
            .gary{
                color: var(--minorColor);
                margin-top: rem(10px);
            }
            &:last-child{
                text-align: right;
            }
        }
    }
}
</style>
