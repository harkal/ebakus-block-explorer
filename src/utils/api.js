import Vue from 'vue'
import debounce from 'lodash/debounce'

import { mutations } from '@/store'

const fetchUSDConversionRate = debounce(async () => {
  try {
    const res = await Vue.http.get(
      process.env.API_ENDPOINT + '/conversion-rate'
    )
    const { data: { usd_rate = 0 } = {} } = res

    mutations.setUsdRate(usd_rate)

    return usd_rate
  } catch (err) {}
}, 2000)

export { fetchUSDConversionRate }
