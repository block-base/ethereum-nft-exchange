var app = new Vue({
    el: '#app',
    data () {
      return {
        markets: [],
        currentPage : 'home',
      }
    },
    methods : {
      transPage : function(page, index){
        this.currentPage = page;
        this.index = index - 1;
      }
    },
    mounted () {
      axios
        .get('https://ethereum-nft-exchange.glitch.me/dac')
        .then(response => (this.markets = response.data))
    }  
  
  })

  