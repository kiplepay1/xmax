// Historical records migrated from the legacy MotoVault seed (xmax250.zip). Values are unchanged.
const P=(id,date,km,type,parts,workshop,cost,notes='')=>({id:'L-svc-'+id,legacyId:id,date,km,type,parts,workshop,cost,notes});
const R=['Engine Oil','Oil Filter','Gear Oil'];
export const SEED={
  vehicle:{brand:'Yamaha',model:'XMAX 250 (V2)',year:'2025',serviceIntervalKm:3000,warnKm:500},
  odo:{km:17183,date:'2026-07-28',confirmed:false},
  rules:{'Engine Oil':3000,'Oil Filter':3000,'Gear Oil':3000,'Air Filter':12000,'Spark Plug':12000,'CVT Belt':25000,'Roller':25000,'Clutch Shoes':null,
    'Front Brake Pad':12000,'Rear Brake Pad':12000,'Brake Fluid':12000,'Coolant':12000,'Battery':24000,'Front Tyre':15000,'Rear Tyre':15000},
  services:[
    P(1,'2025-04-30',211,'First Service',R,'Yamaha Dealer',0,'First break-in service'),
    P(2,'2025-08-15',4200,'Tyre Replacement',['Front Tyre'],'FZR Motor',530,'Front Tyre Eurogrip'),
    P(3,'2025-09-10',3000,'Regular Service',R,'FZR Motor',120),
    P(4,'2025-11-20',6000,'Regular Service',R,'FZR Motor',120),
    P(5,'2026-01-15',9100,'Regular Service',R,'FZR Motor',120),
    P(6,'2026-04-22',13100,'Regular Service & Maintenance',[...R,'Front Brake Pad'],'FZR Motor',210),
    P(7,'2026-06-05',15000,'Tyre Replacement',['Rear Tyre'],'FZR Motor',330,'Pirelli Angel Scooter 140/70-14'),
    P(8,'2026-07-22',17183,'Regular Service',R,'FZR Motor',119)],
  fuel:[[1,'2026-07-01',16500,11.5,23.58],[2,'2026-07-15',16850,12,24.6],[3,'2026-07-28',17183,11.8,24.19]]
    .map(([i,date,km,litres,cost])=>({id:'L-fuel-'+i,legacyId:i,date,km,litres,cost})),
  expenses:[[1,'2026-01-05','Insurance',450,'Annual Comprehensive Insurance'],[2,'2026-01-05','Roadtax',50,'1 Year Roadtax'],[3,'2026-03-10','Accessories',280,'XMAX Phone Mount & Crash Bar']]
    .map(([i,date,category,amount,notes])=>({id:'L-exp-'+i,legacyId:i,date,category,amount,notes}))
};
