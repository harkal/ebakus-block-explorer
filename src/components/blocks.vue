<template>
<div id="blocks_wrapper" v-bind:class="{ active: isBlocks.active }">

    <ul class="tabResults labels">
      <li v-if="showTitle" id="list_title">  <span class="blockID">Block #</span> <span class="transaction"> Transactions </span>  <span class="gas_title">Gas used</span> <span class="producer">Produced by</span> <span class="time">Time</span>  </li>
    </ul>
    <div class="scroll">
      <ul class="tabResults main">
      <li v-for="block in blocks"> <router-link :to="{  path: '/search/' + block.number}">  <span class=" mobileLabel">Block #</span> <span class="blockID">{{block.number}}</span> <span class=" mobileLabel">Tx count</span> <span class="transaction"><strong> {{block.transactionCount}} </strong>  transactions</span>  <span class="mobileLabel">Gas used</span><progress :value="block.gasUsed" max="100">70 %</progress> <span class="mobileLabel">Produced</span><span class="producer"> by Producer 1</span> <span class="mobileLabel">Timestamp</span> <span class="time">{{timeConverter(block.timestamp)}}</span> </router-link> </li>
    </ul>
    </div>
     
  </div>


    
</template>

<script>
import { timeConverter } from '../utils';
export default {
   props:{
    isBlocks: {
      type: Object
    },
    blocks:{
      type: Array
    }
   
  },
  data () {
    return {
      showTitle: false

    }
  },
  methods:{
    timeConverter: timeConverter,
  },
  created: function(){
  
  },
  watch:{
    blocks: function(){
      if(this.blocks.length>0){
        this.showTitle=true
        var i = 0
        console.log(this.timeConverter(this.blocks[0].timestamp) )
        for(i=0;i++;i<this.blocks.length){
          //this.blocks[i].timestamp = this.timeConverter(this.blocks[i].timestamp) 
          console.log(this.timeConverter(this.blocks[i].timestamp) )
        }
      }
    
    }
  },
  computed:{

  }
}
</script>






<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


#blocks_wrapper{
  display: none;
  height:50px;
  height: 100%;
 
}
#blocks_wrapper.active{
  opacity:1;
  display: block;
}
.container{
  margin: 0 auto;
}

ul{

}
li{
  /* block_list_item: */
  
}
li a{
  display: block;
  padding: 22px 1%;
  border-radius: 10px;
  transition: 0.1s all ease-in-out;
  text-decoration:none;
  color: #112F42;
  opacity: 0.85;
}
li a:visited{
  color: #112F42;
}
li a:hover{
    box-shadow: 0 2px 33px 0 rgba(17,47,66,0.10);
    opacity: 1;
}
li span{

  display: inline-block;
  width: 16%;
  margin:0 1%;
  text-align: center;
}
.blockID{
  text-align: left;
  margin:0;
}
li span:last-child{
  text-align: right;
    margin:0;
    width:10%;
}
progress{
  width:26%;
  margin:0 3%;
  vertical-align: 2px;
    background:#95A0A7;
    height: 4px;
    border-radius: 2px;
}
progress {
  /* style rules */
}
progress::-webkit-progress-bar {
  /* style rules */
  background:#F0F0F0;
  height: 4px;
      border-radius: 2px;
      
}
progress::-webkit-progress-value {
  /* style rules */
  background:#95A0A7;
  height: 4px;
      border-radius: 2px;
}
progress::-moz-progress-bar {
  /* style rules */
   background:#fff;
}
span.blockID{
  font-weight: 600;
}
span.producer, span.time{
  font-size: 13px;
}
span.transaction{
  font-weight: 300;
}
#list_title{
padding: 0px 1%;
}
#list_title span{
  font-size: 14px;
  color:#828383 !important;
  font-weight: 400;
  opacity: 0.8;
}
.gas_title{
  width: 26%;
  margin:0 3%;
}
.scroll{
  overflow: auto;
  height:100%;
  -webkit-overflow-scrolling: touch;
}
.mobileLabel{
  display: none; 
}
@media (max-width: 560px) {
  li{
    width:100vw;
    overflow: hidden;
  }
  li span{
    display:block;
    width: 100vw;
       margin:0px;
  }
  li span:first-child{
    margin:0px;
  }
  .blockID{
    padding-left: 80px;
    width: 100px;
  }
  
  li span.time{
    width: 200px;
    text-align: left;
  }
  a{
    position: relative;
    width: 100%;
    overflow: hidden;

    border-bottom: 2px solid #f0f0f0;
  }
  li span{
    font-size: 14px;
    text-align: left;
    padding-left: 80px;
    font-weight: 600;
  }
    .mobileLabel{
    display: inline-block;
    width: 70px ;
    font-size: 13px;
    margin-bottom: 10px !important;
    position: absolute;
    left: 0px;
    padding-left: 10px !important;
    background: #fff;
    font-weight: 400;
  }
  progress{
    margin: 7px 90px 3px 80px;
    width: 60%;
  }
  li span.transaction{
    color: #fff;
  }
}
</style>
