import { computed, unref, ref, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { gte } from '@/utils/calculation'
import { localGet, localSet } from '@/utils/util'

export default function ({ tradeType, categoryType, isSort = true }) {
    // tradeType 玩法 categoryType 板块id isSort 是否需要排序

    const { t } = useI18n({ useScope: 'global' })
    const store = useStore()
    const productMap = computed(() => store.state._quote.productMap)
    const userProductCategory = computed(() => store.getters.userProductCategory)
    const userSelfSymbolList = computed(() => store.getters.userSelfSymbolList)
    const customerInfo = computed(() => store.state._user.customerInfo)
    // 是否为股票玩法
    const isStock = computed(() => parseInt(tradeType.value) === 6)

    // 所选玩法的板块列表
    const categoryList = computed(() => {
        const listByUser = unref(userSelfSymbolList)[unref(tradeType)] || []
        const selfSymbol = {
            title: t('trade.favorites'),
            id: 'selfSymbol',
            listByUser: Array.isArray(listByUser) ? listByUser : [listByUser]
        }
        const tradeTypeQuote = (unref(userProductCategory)[unref(tradeType)] || []).filter(e => e.listByUser.length)

        return [
            selfSymbol,
            ...tradeTypeQuote
        ]
    })

    // 排序
    const sortField = ref(localGet('productListSortField') || '') // 排序字段
    const sortType = ref(localGet('productListSortType') || '') // 排序方式， asc-升序； desc-降序；

    // 所选板块的产品列表
    const productList = computed(() => {
        const productMapVal = unref(productMap)
        const arr = []
        let listByUserData = [] // 用户自主添加的自选列表
        const systemOptional = unref(categoryList.value)[unref(categoryType.value)]?.listByUser || [] // 系统默认推送的自选列表

        if (!customerInfo.value) { // 未登录
            if (unref(categoryType.value) === 0) {
                // 取本地缓存的自选列表
                const localSelfSymbolList = localGet('localSelfSymbolList') ? JSON.parse(localGet('localSelfSymbolList')) : []
                const newArr = {}
                if (localSelfSymbolList.length > 0) {
                    // 重组存储自选的格式 id_玩法 加在数列中输出arr
                    localSelfSymbolList.map(el => {
                        const tradeType = el.split('_')[1]
                        if (newArr[tradeType] !== undefined) {
                            newArr[tradeType].push(el.split('_')[0])
                        } else {
                            newArr[tradeType] = [el.split('_')[0]]
                        }
                    })
                    listByUserData = newArr[unref(tradeType)] || []
                }
            } else { // 其它玩法的正常输出列表
                listByUserData = systemOptional
            }
        } else { // 已登录 正常输出列表
            listByUserData = systemOptional
        }

        if (listByUserData?.length > 0) {
            listByUserData.forEach(id => {
                const newId = `${id}_${unref(tradeType)}`
                if (productMapVal[newId]?.symbolName) {
                    arr.push(productMapVal[newId])
                }
            })
        }

        // 按字段排序
        arr.sort((a, b) => {
            // 根据享元模式封装，默认是asc排序
            let firstEl = a
            let secondEl = b
            const defaultInfinity = sortType.value === 'asc' ? Infinity : -Infinity
            if (isSort) {
                if (sortType.value === 'desc') {
                    firstEl = b
                    secondEl = a
                }
                if (sortField.value === 'symbolName') {
                // 将有报价的产品排序到前面
                    if (parseFloat(firstEl['rolling_last_price']) && parseFloat(secondEl['rolling_last_price'])) {
                        return firstEl[sortField.value].localeCompare(secondEl[sortField.value])
                    } else if (parseFloat(firstEl['rolling_last_price']) || parseFloat(secondEl['rolling_last_price'])) {
                        const firtstValue = firstEl['rolling_last_price'] || defaultInfinity
                        const secondValue = secondEl['rolling_last_price'] || defaultInfinity
                        return gte(firtstValue, secondValue) ? 1 : -1
                    } else {
                        return 0
                    }
                } else if (sortField.value === 'rolling_upDownWidth' || sortField.value === 'upDownAmount') {
                    const firtstValue = parseFloat(firstEl[sortField.value]) || defaultInfinity
                    const secondValue = parseFloat(secondEl[sortField.value]) || defaultInfinity
                    return firtstValue - secondValue
                } else if (sortField.value === 'rolling_last_price') {
                    const firtstValue = firstEl[sortField.value] || defaultInfinity
                    const secondValue = secondEl[sortField.value] || defaultInfinity
                    return gte(firtstValue, secondValue) ? 1 : -1
                } else {
                // 默认按后台的排序
                    return firstEl.sortNum - secondEl.sortNum
                }
            } else {
                return firstEl.sortNum - secondEl.sortNum
            }
        })

        return arr
    })

    // 排序方法
    const sortFunc = (field) => {
        if (sortField.value === field) {
            switch (sortType.value) {
            case 'asc':
                sortType.value = 'desc'
                break
            case 'desc':
                sortType.value = ''
                break
            default:
                sortType.value = 'asc'
            }
        } else {
            sortType.value = 'asc'
        }
        sortField.value = sortType.value ? field : ''
        localSet('productListSortField', sortType.value ? field : '')
        localSet('productListSortType', sortType.value)
    }

    // 股票玩法的产品列表
    const productStockList = ref([])
    const productStockListSet = () => {
        const list = productList.value.slice(0)
        const defaultInfinity = sortType.value === 'asc' ? Infinity : -Infinity
        list.sort((a, b) => {
            // 根据享元模式封装，默认是asc排序
            let firstEl = a
            let secondEl = b
            if (sortType.value === 'desc') {
                firstEl = b
                secondEl = a
            }
            if (sortField.value === 'symbolName') {
                // 将有报价的产品排序到前面
                if (parseFloat(firstEl['cur_price']) && parseFloat(secondEl['cur_price'])) {
                    return firstEl[sortField.value].localeCompare(secondEl[sortField.value])
                } else if (parseFloat(firstEl['cur_price']) || parseFloat(secondEl['cur_price'])) {
                    const firtstValue = firstEl['cur_price'] || defaultInfinity
                    const secondValue = secondEl['cur_price'] || defaultInfinity
                    return gte(firtstValue, secondValue) ? 1 : -1
                } else {
                    return 0
                }
            } else if (sortField.value === 'cur_price') {
                const firtstValue = firstEl[sortField.value] || defaultInfinity
                const secondValue = secondEl[sortField.value] || defaultInfinity
                return gte(firtstValue, secondValue) ? 1 : -1
            } else if (sortField.value === 'upDownWidth') {
                const firtstValue = parseFloat(firstEl[sortField.value]) || defaultInfinity
                const secondValue = parseFloat(secondEl[sortField.value]) || defaultInfinity
                return firtstValue - secondValue
            }
        })
        productStockList.value = list
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
            productStockListSet()
        }, 30000)
    }

    onBeforeUnmount(() => {
        clearStockSortTimer()
    })

    return {
        categoryList,
        productList,
        productStockList,
        productStockListSet,
        resetStockSortTimer,
        sortField,
        sortType,
        sortFunc,
    }
}
