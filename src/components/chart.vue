<script>
import VueCharts from "vue-chartjs";
import { Line, mixins } from "vue-chartjs";

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ["chartData", "options", "height"],
  mounted() {
    this.renderChart(this.chartData, {
      responsive: true,
      maintainAspectRatio: false,
      legend: { display: false }
    });
  }
};
</script>
