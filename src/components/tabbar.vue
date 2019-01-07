<template>
  <div id="tabbar" v-bind:class="{ active: selected }" >
    <div class="scroll">
      <ul id="tabbarOptions">
        <li id= "blocksTab" :class="{active:selected == 'blocksTab' }" v-on:click="activateTab($event,txt)" > <img src="../assets/ic_blocks.png" alt=""> Blocks</li>
        <li id= "transactionsTab" :class="{active:selected=='transactionsTab' }" v-on:click="activateTab($event,txt)" > <img src="../assets/ic_transactions.png" alt=""> Transactions</li>
        <li id= "statisticsTab"  :class="{active:selected=='statisticsTab'}" v-on:click="activateTab($event,txt)"><img src="../assets/ic_stats.png" alt=""> Statistics</li>
      </ul>

    </div>
      
    
        <div class="container"  >
          <blocks v-bind:isBlocks="{active:selected == 'blocksTab' }" :blocks="blocks"/>
          <transactions v-bind:isTransactions="{active:selected == 'transactionsTab' }" :txs="txs"/>
        </div>
        
      </div>


</template>

<script>


export default {
   props: {
      tabbarActive: {
       type: Boolean,
       default: false
     },
      selectedByRoute: {
       type: String,
       default: ""
     },
   },
  data () {
    return {
      txt:"",
      isActive: false,
      tHeight: "",
      selected:"",
      isBlocksActive: false,
      isTransactionsActive: false,
      txs:[],
      blocks:[]
    }
  },
  components:{
    
  },
  methods:{
   activateTab: function(e,selectedByRoute){
     if(selectedByRoute!=""){
       this.$root.$data.sharedState.contentActive = true
       this.selected =selectedByRoute
       this.isActive = true
      // this.tHeight = "height: calc(100% - 215px);";
       selectedByRoute=""
       this.tabbarRouter()
     }
     else if(e && this.selected!=e.target.id) {

       this.selected =e.currentTarget.id

       this.$root.$data.sharedState.contentActive = true
       this.isActive = true
      // this.tHeight = "height:calc(100% - 215px);";
       this.tabbarRouter()
       
       
    
     }
     else {
       this.selected =""
       this.$root.$data.sharedState.contentActive = false
       this.isActive = false
      // this.tHeight = "height: 76px;";
       var lastQuery = this.$root.$data.sharedState.query
       if(lastQuery!=""){
        this.$router.push({
          path: '/search/' + this.$root.$data.sharedState.query
        })
        }
        else {
          this.$router.push({
          path: '/' 
        })
     }

     }
   },
   tabbarRouter: function(){
      console.log(this.selected)
       switch(this.selected){
          case "blocksTab": 
            this.getLatestBlocks()
            this.$router.push({
            path: '/blocks/'
            })
            break
          case "transactionsTab":
          this.getLatestTransactions()
            this.$router.push({
            path: '/transactions/'
            })
            
            break
          default: 
          this.$router.push({
            path: '/'
            })
       
        }
   },
   getLatestTransactions: function(){

      this.$http.get(process.env.API_ENDPOINT + '/transaction/-1?range=10')
        .then(function(response){
          this.txs = response.data;
          this.hasLoaded=true;
        },
        (err) => {
          console.log(err);
          this.hasLoaded=true;
        });
      console.log(this.txs)
   },
   getLatestBlocks: function(){
      this.$http.get(process.env.API_ENDPOINT + '/block/-1?range=10')
        .then(function(response){
          this.blocks = response.data;
          this.hasLoaded=true;
        },
        (err) => {
          console.log(err);
          this.hasLoaded=true;
        });
      console.log(this.blocks)
   }
    
  },
   created: function() {
     if(this.selectedByRoute!=""){
       this.activateTab(null,this.selectedByRoute)
       this.selected =this.selectedByRoute
     }
  },
  watch:{
   tabbarActive: function(){
    if(!this.tabbarActive){
      this.tHeight = "height: 76px;";
      this.selected=""
    }
   },
  selectedByRoute: function(){
    if(typeof this.selectedByRoute!= null)
    this.activateTab(null,this.selectedByRoute)
  }
    
  },
  computed:{

  },

  
}
</script>






<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#tabbar{
  position: fixed;
  background: #fff;
  left:0px;
  right:0px;
  bottom:0px;
  height: 76px;
  /* Rectangle 3: */
  
  transition: 0.35s height ease-in-out;
  /* Rectangle 3: */

box-shadow: 0 2px 43px 0 rgba(172,180,201,0.40);

}

#tabbarOptions{
  width:460px;
  margin:15px auto;
}
li{
  display: inline-block;
    /* Rectangle 2: */

  border-radius: 4px;

  border: 2px solid #ACB4C9;
  color: #34393D;
  padding: 8px 18px;
  margin: 0px 10px;
  background: #F8F9FB;
  font-weight: 600;
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}
li.active{
    background: #34393D;
    color: white;
    border: 2px solid #34393D;
}
li:hover{
    box-shadow: 0 2px 43px 0 rgba(0,0,0,0.10);

}
li img{
  width:14px;
  vertical-align: -1px;
}
li.active img{
   filter: invert(100%)  grayscale(100%);
  
}
#tabbar.active{
  height: calc(100% - 215px);
}
#tabContentWrapper{
  height: 100%;

  overflow: auto;
}
.container{
  margin: 0 auto;
}
ul.tabbarOptions li.img{
    -webkit-user-select: none;  /* Chrome all / Safari all */
  -moz-user-select: none;     /* Firefox all */
  -ms-user-select: none;      /* IE 10+ */
  user-select: none;  
  cursor: pointer;
}

@media (max-width: 560px) {
  .scroll{
    overflow-x:auto;
  }
  ul#tabbarOptions{
    width: 330px;
    
    margin: 12px auto;
    padding: 0px;

  }
  #tabbarOptions li{
    padding: 5px 8px;
    margin: 0px 4px;
    font-size: 14px;
  }
  #tabbarOptions img{
    width: 12px;
  }
  #tabbar{
    height: 60px;
  }
  #tabbar.active{
  height: calc(100% - 100px);
}
}
</style>
