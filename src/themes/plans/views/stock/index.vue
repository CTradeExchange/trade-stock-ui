<template>
    <div class='page-wrap'>
        <LayoutTop :back='true' :menu='false' />
        gupiao....
    </div>
</template>

<script setup>
import { QuoteSocket } from '@/plugins/socket/socket'
const subscribList = ['21_5', '4_5', '2_5', '1_5', '20_3', '2_3', '3_3', '1_3', '54_1', '1_1', '20_1', '2_1', '74_1', '56_1', '82_1', '83_1', '81_1', '80_1', '79_1', '78_1', '77_1', '76_1', '75_1', '73_1', '72_1', '71_1', '70_1', '69_1', '68_1', '67_1', '66_1', '65_1', '64_1', '63_1', '62_1', '61_1', '60_1', '59_1', '58_1', '57_1', '55_1', '53_1', '149_1', '148_1', '147_1', '146_1', '150_1', '151_1', '152_1', '153_1', '154_1', '155_1', '156_1', '157_1', '158_1', '159_1', '160_1', '161_1', '162_1', '163_1', '164_1', '165_1', '2_2', '20_2', '1_2', '30_5', '28_5', '5_5', '6_5', '7_5', '15_5', '16_5', '17_5', '18_5', '19_5', '20_5', '31_5', '52_5', '45_5', '44_5', '43_5', '38_5', '29_5', '27_5', '26_5', '25_5', '24_5', '23_5', '22_5', '21_5', '4_5', '2_5', '1_5']
console.log('subscribList', subscribList)
QuoteSocket.send_subscribe_stock(subscribList)
</script>

<style scoped lang="scss">

    .page-wrap {
        width: 100%;
        height: 100%;
         padding-top: rem(110px);
        overflow: auto;
    }

</style>
