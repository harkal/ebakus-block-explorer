<template>
  <div class="page-wrapper">
    <section>
      <Statistics />
    </section>

    <section>
      <RegisterEns />
    </section>
  </div>
</template>

<script>
import { timeConverter } from '@/utils'

import RegisterEns from './RegisterEns'
import Statistics from './Statistics'

export default {
  components: {
    RegisterEns,
    Statistics,
  },
}
</script>
