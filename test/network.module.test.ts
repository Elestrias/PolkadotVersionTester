import {suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import {ApiPromise, WsProvider}  from '@polkadot/api'
import * as fs from  'fs'



@suite class runTimeVersionCheck{
    private api: ApiPromise;
    private wsProvider = new WsProvider('wss://rpc.polkadot.io', 0);
    private local: object
    async before(){
        await this.wsProvider.connect();
        this.api =  new ApiPromise({provider: this.wsProvider});
        this.local = JSON.parse(fs.readFileSync("./test/local.property.json", "utf-8"));
        console.log("Waiting for an api connection");
        await this.api.isReady.then(()=>console.log("-Done"));
    }
    async after() {
        if(this.wsProvider.isConnected) {
            if (this.api) {
                console.log("Waiting for an api disconnection");
                await this.api.disconnect().then(()=>console.log("-Done"));
            }
            delete this.api;
        }else{
            assert.fail("Connection Error");
        }
        delete this.wsProvider;
    }
    @test async "Test: Network version"(){
        var localVersion = this.local
        let responseCheck = this.api.query.system.lastRuntimeUpgrade().then(function(response) {
            var property = JSON.parse(JSON.stringify(response));
            assert(localVersion["specVersion"] != undefined, "local.property should contain specVersion field");
            assert(property["specVersion"] != undefined, "server response should contain specVersion field");
            assert(property["specVersion"] === localVersion["specVersion"],
                "Runtime version: " + property["specVersion"]+ " should be equal to local version: " + localVersion["specVersion"]);
        });
        console.log("Waiting for a server response");
        await responseCheck.then(()=>console.log("-Done"));
   }

   @test async "Test: NetworkName"(){
       var localNetwork = this.local;
       let responseCheck = this.api.query.system.lastRuntimeUpgrade().then(function(response) {
           var property = JSON.parse(JSON.stringify(response));
           assert(localNetwork["specName"] != undefined, "local.property should contain specName field");
           assert(property["specName"] != undefined, "server response should contain specName field");
           assert(property["specName"] === localNetwork["specName"],
               "Runtime network: " + property["specName"]+ " should be the same as local network: " + localNetwork["specName"]);
       });
       if(!this.wsProvider.isConnected){
           assert.fail("Connected not")
       }
       await responseCheck;
    }

}
