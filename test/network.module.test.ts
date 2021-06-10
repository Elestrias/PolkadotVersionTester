import {suite, test} from '@testdeck/mocha';
import {assert} from 'chai';
import {ApiPromise, WsProvider}  from '@polkadot/api'
import * as fs from  'fs'



@suite class runTimeVersionCheck{
    private api: ApiPromise;
    private wsProvider = new WsProvider('wss://rpc.polkadot.io');


    async after(){
       console.log("Waiting for an api disconnection");
       process.exit();
    }
    @test async "Test1"(){
        this.api =  new ApiPromise({provider: this.wsProvider});
        var local  = fs.readFileSync("./test/local.property.json", "utf-8");
        var localVersion = JSON.parse(local);
        console.log("Waiting for an api connection");
        await this.api.isReady.then(()=>console.log("-Done"));
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



}
