import { suite, test } from '@testdeck/mocha';
import * as _chai from 'chai';
import { expect } from 'chai';
import {ApiPromise, WsProvider}  from '@polkadot/api'
import * as fs from  'fs'

_chai.should()
_chai.expect

@suite class testModule{
    private WsProvider = new WsProvider('wss://rpc.polkadot.io');
    private api: ApiPromise;

    async before(){
      this.api  = await ApiPromise.create({provider: this.WsProvider});
    }
    @test async "versionChecks"(){
        const localVersion = JSON.parse(fs.readFileSync("./test/local.property.json", "utf-8"));
        let checkEvent = this.api.query.system.lastRuntimeUpgrade().then(function (response){
            var nodeProperty = JSON.parse(JSON.stringify(response));

            expect(nodeProperty["specName"]).to.be.equal(localVersion["specName"]);
            expect(nodeProperty["specVersion"]).to.be.equal(localVersion["specVersion"]);

        }).catch((error)=>console.log(error));
        await this.api.disconnect();
    }
}