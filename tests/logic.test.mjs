import test from 'node:test';import assert from 'node:assert/strict';
import {SEED} from '../seed.js';import * as L from '../logic.js';
test('seed counts and totals',()=>{assert.equal(SEED.services.length,8);assert.equal(SEED.fuel.length,3);assert.equal(SEED.expenses.length,3);
  assert.equal(L.total(SEED.services),1549);assert.equal(+L.total(SEED.fuel).toFixed(2),72.37);assert.equal(L.total(SEED.expenses),780)});
test('inconsistent odometer flagged, not changed',()=>{assert.deepEqual([...L.flagged(SEED.services)].sort(),['L-svc-2','L-svc-3']);assert.equal(SEED.services[1].km,4200)});
test('next service = last oil change + interval',()=>{const n=L.nextService(SEED);assert.equal(n.dueKm,20183);assert.equal(n.remaining,3000)});
test('re-import creates no duplicates; changed record is a conflict',()=>{
  const legacy={data:{services:[{id:1,date:'2025-04-30',mileage:211,type:'First Service',changedParts:['Engine Oil','Oil Filter','Gear Oil'],workshop:'Yamaha Dealer',cost:0,notes:'First break-in service'},{id:99,date:'2026-09-01',mileage:18000,type:'Regular Service',changedParts:['Engine Oil'],workshop:'X',cost:100,notes:''}],fuel:[],expenses:[]}};
  const a=L.importMerge(SEED,legacy);assert.equal(a.report.added.services,1);assert.equal(a.report.duplicates,1);
  const b=L.importMerge(a.state,legacy);assert.equal(b.report.added.services,0);assert.equal(b.state.services.length,9);
  legacy.data.services[0].cost=5;assert.equal(L.importMerge(SEED,legacy).report.conflicts.length,1)});
