import { suite, test,  } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect, assert} from 'chai';
import {ApiPromise, WsProvider}  from '@polkadot/api'
import * as fs from  'fs'


_chai.should();
_chai.expect;

@suite class runTimeVersionCheck{
    private api: ApiPromise;

   async after(){
       console.log("Wainting for a disconection");
       await this.api.disconnect().then(()=> console.log("-Done"));
    }
    @test async "Test1"(){
        const wsProvider = new WsProvider('wss://rpc.polkadot.io')
        this.api =  new ApiPromise({provider: wsProvider});
        var local  = fs.readFileSync("./test/local.property.json", "utf-8");
        var localVersion = JSON.parse(local);
        console.log("Waiting for a connection");
        await this.api.isReady.then(()=>console.log("-Done"));
        let x = this.api.query.system.lastRuntimeUpgrade().then(function(response) {
            var property = JSON.parse(JSON.stringify(response));
            assert(localVersion["specVersion"] != undefined, "local.property should contain specVersion field");
            assert(property["specVersion"] != undefined, "server response should contain specVersion field");
            assert(property["specVersion"] === localVersion["specVersion"], "Runtime version: " + property["specVersion"]+ " should be equal to local version: " + localVersion["specVersion"]);
        });
        console.log("Waiting for a server response");
        await x.then(()=>console.log("-Done"));
   }



}
