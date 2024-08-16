<template>
    <div ref='productListEl' class='productListWrap'>
        <productStockItem v-for='item in productListShow' :key='item' :product='productMap[item.symbolKey]' @open='openProduct(item)' />
        <div v-show='productList.length>50 && !showAll' class='emptyHeight'>
            当列表产品数量超过50个的时候，默认只展示50个，放一个空的div撑开滚动条的高度
        </div>
    </div>
</template>

<script>
import { computed, nextTick, reactive, ref, toRefs, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import productStockItem from './productStockItem'
import { useRouter } from 'vue-router'
import { debounce } from '@/utils/util'
import { QuoteSocket } from '@/plugins/socket/socket'

export default {
    components: {
        productStockItem,
    },
    props: ['productList'],
    setup (props) {
        const store = useStore()
        const router = useRouter()
        const productListEl = ref(null)
        const state = reactive({
            list: [...new Array(10)],
            showAll: false,
            show: false,
        })
        // 产品列表
        const productMap = computed(() => store.state._quote.productMap)
        const productListShow = computed(() => {
            return state.showAll ? props.productList : props.productList.slice(0, 50)
        })

        // 行情列表容器滚动事件
        const scrollFn = (e) => {
            const target = e.target
            const scrollTop = target.scrollTop
            const scrollHeight = target.scrollHeight
            if (state.showAll === false && (scrollTop / scrollHeight) > 0.45) {
                state.showAll = true
            }
            calcProductsDebounce()
        }

        // 订阅当前屏和上半屏、下半屏的产品报价，给上层组件使用
        const calcSubscribeProducts = () => {
            const el = productListEl.value
            if (!el || el.children.length === 0) return []
            const elHeight = el.clientHeight
            const scrollTop = el.scrollTop
            const itemHeight = el.firstElementChild.offsetHeight
            const productsScreen = Math.ceil(elHeight / itemHeight) // 一屏显示的产品数
            let start = Math.floor(scrollTop / itemHeight) // 显示的第一个产品
            start -= productsScreen / 2
            start = Math.max(start, 0)
            const end = Math.round(start + productsScreen * 2)
            const subscribeArr = props.productList.slice(start, end).map(({ symbolKey }) => symbolKey)
            // console.log('订阅产品', subscribeArr.length, start, end)
            return subscribeArr
        }
        const calcProductsDebounce = debounce(() => {
            const subscribList = calcSubscribeProducts()
            if (subscribList.length > 0) QuoteSocket.send_subscribe(subscribList)
        })

        const stop = watch(
            () => props.productList.length,
            async () => {
                await nextTick()
                // const subscribList = calcSubscribeProducts()
                // if (subscribList.length > 0) QuoteSocket.send_subscribe(subscribList)

                if (props.productList.length) {
                    stop()
                }
            },
            { immediate: true }
        )

        const openProduct = (data) => {
            router.push(`/product?symbolId=${data.symbolId}&tradeType=${data.tradeType}`)
        }

        // 全量获取产品快照
        const subscribeAll = async () => {
            await nextTick()
            const list = props.productList.map(({ symbolKey }) => symbolKey)
            if (list.length > 0) QuoteSocket.send_subscribe_stock(list)
            calcProductsDebounce()
        }

        onMounted(() => {
            productListEl.value.addEventListener('scroll', scrollFn, false)
        })

        onBeforeUnmount(() => {
            productListEl.value.removeEventListener('scroll', scrollFn, false)
        })

        return {
            ...toRefs(state),
            productListEl,
            productListShow,
            subscribeAll,
            calcProductsDebounce,
            calcSubscribeProducts,
            productMap,
            openProduct,

        }
    },
}
</script>

<style lang="scss" scoped>
@import '~@/sass/mixin.scss';
.productListWrap {
    width: 100%;
    .emptyHeight {
        height: 400px;
        width: 100px;
        font-size: 0;
    }
}
</style>
