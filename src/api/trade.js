import request from '@/utils/request'

/* 产品基础信息列表 */
export function querySymbolBaseInfoList (data) {
    return request({
        // url: '/global/rtc.app.RtcSymbolQueryService.querySymbolBaseInfoList',
        url: '/global/customer.app.CustomerOptionalWebApiService.querySymbolBaseInfoList',
        method: 'post',
        headers: {
            version: '0.0.1',
        },
        data
    })
}
/* 产品基础信息列表-多玩法 */
export function findSymbolBaseInfoList (data) {
    return request({
        url: '/global/config.app.AppSymbolDubboService.getSymbolBaseList',
        // url: '/global/customer.app.CustomerOptionalWebApiService.findSymbolBaseInfoList',
        method: 'post',
        // headers: {
        //     version: '0.0.1',
        // },
        data
    })
}
/* 产品信息 */
export function querySymbolInfo (data) {
    return request({
        url: '/global/config.app.AppSymbolDubboService.getSymbolDetail',
        // url: '/global/rtc.app.RtcSymbolQueryService.querySymbolInfo',
        method: 'post',
        // headers: {
        //     version: '0.0.1',
        // },
        data
    })
}

/* 下单 */
export function addMarketOrder (data) {
    if ([3, 5, 9].includes(parseInt(data.tradeType))) return addOrder(data)
    else if ([6].includes(parseInt(data.tradeType))) return placeOrder(data)
    return request({
        url: '/global/tradeapi.app.OrderApiService.addMarketOrder',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 全仓杠杆下单 */
export function addOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.addOrder',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 股票试算买卖股数 */
export function stockCalculateOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.calculateOrder',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
/* 股票下单验证 */
export function stockCheckOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.checkOrder',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
/* 股票玩法下单 */
export function placeOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.placeOrder',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 设置杠杆倍数 */
export function setCrossLevelNum (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.setCrossLevelNum',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 查看持仓列表 */
export function queryPositionPage (data) {
    return request({
        url: '/global/tradeapi.app.PositionApiService.queryPositionPage',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
/* 查看订单列表 */
export function queryOrderPage (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryOrderPage',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
/* 平仓历史记录列表 */
export function queryHistoryCloseOrderList (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryHistoryCloseOrderList',
        method: 'post',
        headers: {
            group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}
/* 查看预埋单列表 */
export function queryPBOOrderPage (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryPBOOrderPage',
        method: 'post',
        headers: {
            group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}

/* 修改订单 */
export function updateOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.updateOrder',
        method: 'post',
        headers: {
            group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}

/* 取消预埋单 */
export function closePboOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.closePboOrder',
        method: 'post',
        headers: {
            group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}

/* 添加自选 */
export function addCustomerOptional (data) {
    return request({
        url: '/global/customer.app.CustomerOptionalWebApiService.add',
        method: 'post',
        headers: {
            // group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}
/* 删除自选 */
export function removeCustomerOptional (data) {
    return request({
        url: '/global/customer.app.CustomerOptionalWebApiService.delete',
        method: 'post',
        headers: {
            // group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}

/* 根据客户组搜索产品 */
export function getSymbolList (data) {
    return request({
        url: '/global/config.app.AppSymbolDubboService.getSymbolList',
        method: 'post',
        headers: {
            // version: '0.0.1',
        },
        data
    })
}
/* 修改预埋单 */
export function updatePboOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.updatePboOrder',
        method: 'post',
        headers: {
            group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}

/* 查看 ABCC预埋单 */
export function queryAbccPboPage (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryPboPage',
        method: 'post',
        headers: {
            group: 'tradeApi',
            version: '0.0.1',
        },
        data
    })
}

/* ABCC取消限价单 */
export function closeTradePboOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.closeTradePboOrder',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
/* 修改仓位杠杆倍数 */
export function updateCrossLevelNum (data) {
    return request({
        url: '/global/tradeapi.app.PositionApiService.updateCrossLevelNum',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
/* 基金产品实时净值和溢价率 */
export function getEquityPremiumRate (data) {
    return request({
        url: '/global/config.app.AppSymbolDubboService.getEquityPremiumRate',
        method: 'post',
        toastErr: false,
        data
    })
}
/* 市场表现走势图 */
export function marketPerformance (data) {
    return request({
        url: '/global/report.app.ReportDatadDubboService.marketPerformance',
        method: 'post',
        headers: {
            version: '0.0.1',
            // group: 'tradeApi'
        },
        data
    })
}
/* 市场表现涨跌幅走势图 */
export function marketPerformanceQuoteChange (data) {
    return request({
        url: '/global/report.app.ReportDatadDubboService.marketPerformanceQuoteChange',
        method: 'post',
        headers: {
            version: '0.0.1',
            // group: 'tradeApi'
        },
        data
    })
}
/* 实时投资组合排名 */
export function investCombination (data) {
    return request({
        url: '/global/report.app.ReportDatadDubboService.investCombination',
        method: 'post',
        headers: {
            version: '0.0.1',
            // group: 'tradeApi'
        },
        data
    })
}
/* 单资产表现柱状图 */
export function assetPerformance (data) {
    return request({
        url: '/global/report.app.ReportDatadDubboService.assetPerformance',
        method: 'post',
        headers: {
            version: '0.0.1',
            // group: 'tradeApi'
        },
        data
    })
}
/* 指数产品指数样本 */
export function queryIndexSample (data) {
    return request({
        url: '/global/report.app.ReportDatadDubboService.indexSample',
        method: 'post',
        headers: {
            version: '0.0.1'
        },
        data
    })
}
/* 指数产品单资产表现柱状图 */
export function indexSimplePerformance (data) {
    return request({
        url: '/global/report.app.ReportDatadDubboService.indexSimplePerformance',
        method: 'post',
        headers: {
            version: '0.0.1'
        },
        data
    })
}
/* 批量获取市场表现走势图 */
export function batchMarketPerformance (data) {
    return request({
        url: '/global/report.app.ReportDatadDubboService.batchMarketPerformance',
        method: 'post',
        headers: {
            version: '0.0.1'
        },
        data
    })
}

/* 成交记录 */
export function tradeRecordList (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryTradeRecordPage',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 股票持仓列表 */
export function queryStockPosition (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.getPositionDealDetailList',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 股票撤单 */
export function stockCancelOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.cancelOrder',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 股票分页查询股票委托单列表 */
export function queryStockPendingOrder (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryOrderPage',
        method: 'post',
        headers: {
            version: '0.0.1'
        },
        data
    })
}

/* 按Id查询股票委托单信息 */
export function queryStockOrderDetail (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryOrderDetail',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
/* 分页查询股票成交单列表 */
export function queryStockDealPage (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryDealPage',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}

/* 公司行动列表 */
export function queryMorePageListBySymbolId (data) {
    return request({
        url: '/global/dividend.app.DividendInfoQueryService.queryMorePageListBySymbolId',
        method: 'post',
        headers: {
            version: '0.0.1'
        },
        data
    })
}

/* 查询客户当前委托列表 */
export function queryStockPendingOrderList (data) {
    return request({
        url: '/global/tradeapi.app.OrderApiService.queryPendingOrderList',
        method: 'post',
        headers: {
            version: '0.0.1',
            group: 'tradeApi'
        },
        data
    })
}
