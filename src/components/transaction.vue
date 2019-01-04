<template>
<div id="block_wrapper" v-bind:class="{ active: isTransactionActive }">
  <h1> <img src="../assets/ic_transactions.png" class="title_img" alt=""> Transaction  </h1> 
  <div class="panel">
    <div class="widget_wrapper">
    <div class="tablewrapper">
      <table>
        <tr>
          <td class="absolute"><h3>FROM</h3></td>
          <td class=""><router-link class="address lon" :to="{ name: 'searchTerm', params: {query: transactionData.from}}">{{transactionData.from}}</router-link></td>
        </tr>
          <tr>
          <td class=""></td>
          <td ><img class="ic_to absolute" src="../assets/ic_from_to.png" alt=""></td>
        </tr>
          <tr>
          <td class="absolute"><h3>TO</h3></td>
          <td class=""><router-link class="address lon" :to="{ name: 'searchTerm', params: {query: transactionData.to}}">{{transactionData.to}}</router-link></td>
        </tr>
      </table>
    </div>
      <ul class="status" v-bind:class="{ active: txstatus }">
        <li>
          <h3>
            AMOUNT
            </h3>
        </li>
        <li>
          <h1>{{weiToEbk(transactionData.value)}}</h1>
        </li>
        <li>
          <span>ebakus</span>
        </li>
        <li>
          <img v-if="txstatus" class="ic_check" src="../assets/ic_check.png" alt="">
          <img v-else class="ic_check" src="" alt="">
        </li>
        
      </ul>
    </div>
  </div>

  <div class="panel">
    <h2>Details</h2>
    <div class="tablewrapper">
      <table>
      <tr>
        <td class="headcol">TxHash</td>
        <td class="long"><router-link class="transaction" :to="{ name: 'searchTerm', params: {query: transactionData.hash}}">{{transactionData.hash}}</router-link></td>
      </tr><tr>
        <td class="headcol">Timestamp</td>
        <td class="long"><strong> -</strong></td>
      </tr><tr>
        <td class="headcol">Blockheight</td>
        <td class="long"><strong><router-link class="block" :to="{ name: 'searchTerm', params: {query: blockHeight}}">{{transactionData.blockNumber}}</router-link></strong></td>
      </tr>
      <tr>
        <td class="headcol">Produced by</td>
        <td class="long">-</td>
      </tr>
      <tr>
        <td class="headcol">Gas limit</td>
        <td class="long">{{transactionData.gasLimit}}</td>
      </tr>
      <tr>
        <td class="headcol">Gas used</td>
        <td class="long">{{transactionData.gasUsed}}</td>
      </tr>
    </table>
    </div>
    
  </div>
</div>
    
</template>

<script>
import { timeConverter, weiToEbk } from '../utils';
export default {
   props:{
    isTransactionActive: {
      type: Boolean,
      default: false
    },
    transactionData:{
      type: Object
    }
   
  },
  data () {
    return {
      txstatus: false,
      confirmationsCount: 0,
    }
  },
  methods:{
    timeConverter: timeConverter,
    weiToEbk: weiToEbk,
  },
  created: function(){
    

  
  },
  watch:{
    transactionData: function(){
      if(this.$root.$data.sharedState.blockHeight>this.transactionData.blockNumber){
        this.txstatus = true;
        this.confirmationsCount = this.$root.$data.sharedState.blockHeight - this.transactionData.blockNumber
      }
    }

  },
  computed:{
    blockHeight: function(){
      if(typeof this.transactionData.blockNumber === "number")
      return this.transactionData.blockNumber.toString()
    }
  }
}
</script>






<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

table{
  text-align: left;
}
tr:nth-child(odd){
  background: #fff;
}

#block_wrapper{
  opacity:0;
}
#block_wrapper.active{
  opacity:1;
  display: block;
}
.block{
  color: #000000 ;
 
}
th,td{
  padding: 4px 6p x;
  text-overflow: ellipsis;
  overflow: hidden;
}
 td{
  color: #5b5b5b
}
 td:last-child{
  font-weight: 500;  
}
strong{
  color: #000;
}

span.txstatus_badge{
  font-size: 16px;
  font-weight: 500;
  background:  #fff;
  border-radius: 6px;
  padding: 4px 30px 4px 12px;
  box-shadow: 0 2px 33px 0 rgba(17,47,66,0.10);
  vertical-align: 4px;
  margin-left: 4px;
}
span.txstatus_badge.success{
   background: url("../assets/ic_check.png") no-repeat #fff;
  background-size: 16px;
  background-position:  right 6px center;
}
span.txstatus_badge.pending{
  color:#6f6f6f;
}

.panel{
  position: relative;}

.widget_wrapper h3{
  font-size: 12px;
}
.widget_wrapper img.ic_to{
  width: 18px;
  transform: rotate(90deg);
}
.widget_wrapper tr{
  position: relative;
  line-height: 42px;
  padding: 2px 10px;
}
.widget_wrapper table{
  margin-bottom: 55px;
}
.widget_wrapper ul{
  position: absolute;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  align-content: space-between; 
  height: 50px;
  bottom:0px;
  left: 0px;
  padding: 0px;
  padding-top: 14px;
  padding-bottom: 10px;
  align-items:center;
  background: #FAFAFA;
  width:100%;
  margin:0px;
  border-radius: 0px 0px 4px 4px;
  transition: all .5s ease-out;

}
.widget_wrapper li:first-child {
  margin-left: 40px;
}
.widget_wrapper li {
  margin-right: 10px;
}
.widget_wrapper li:last-child {
margin-left: auto;
margin-right: 30px;
}

.widget_wrapper img.ic_check{
  width: 34px;
}
li h3{
  margin-top: 20px;
}
li span{
  display: block; 
  margin-top: 5px;
}
ul.status.active{
  background: #E6FAF4;
}

.absolute{
  position: absolute;
  background: #fff;
  top:auto;
  width: 40px;
}
img.ic_to.absolute{
  display: none;
}
.lon{
  padding-left: 40px;
}
@media (max-width: 560px) {
  .absolute{
    position: absolute;
    background: #fff;
    top:auto;
    width: 40px;
    left:15px;
  }
  img.ic_to.absolute{
    display: none;
  }
  .lon{
    padding-left: 40px;
  }

  .widget_wrapper li:first-child{
    margin-left: 20px;
  }
  .widget_wrapper a{
    font-size: 13.5px ;
    line-height:20px;
  }
  .widget_wrapper table{
  margin-bottom: 70px;
}
}

</style>
