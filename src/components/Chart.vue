<script>
import VueCharts, { Line, mixins } from 'vue-chartjs'

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: {
    chartData: {
      type: Object,
      default: () => ({}),
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    height: {
      default: 400,
      type: Number,
    },
  },
  watch: {
    chartData() {
      this.$data._chart.update()
    },
  },
  mounted() {
    const self = this

    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        mode: 'index',
        intersect: true,
        callbacks: {
          label: function(tooltipItem, data) {
            let labels = []

            let label = data.datasets[tooltipItem.datasetIndex].label || ''
            let value = tooltipItem.yLabel

            if (label) {
              label += ': '
            }
            label += self.$options.filters.numberFormatterFixed(value) + ' EBK'

            labels.push(label)

            if (tooltipItem.datasetIndex == 1) {
              label = 'Total balance: '
              let parentDatasetValue =
                data.datasets[tooltipItem.datasetIndex - 1].data[
                  tooltipItem.index
                ]
              value += parseFloat(parentDatasetValue)
              label +=
                self.$options.filters.numberFormatterFixed(value) + ' EBK'

              labels.push(label)
            }

            return labels
          },
        },
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              tooltipFormat: 'll h:mm:ss a',
              unit: 'day',
              displayFormats: {
                day: 'MMM D - h:mm a',
              },
            },
            distribution: 'series',
          },
        ],
        yAxes: [
          {
            stacked: true,
            ticks: {
              beginAtZero: true,
              callback: function(value, index, values) {
                return self.$options.filters.numberFormatter(value)
              },
            },
          },
        ],
      },
    })
  },
}
</script>
