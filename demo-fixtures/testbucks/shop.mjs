// Pure, dependency-free rules shared by the app and optional tests.
export const catalog = [
  {id:'vanilla-latte',name:'Vanilla latte',price:450,category:'coffee',description:'Espresso, vanilla, and your choice of milk.',plant:true},
  {id:'latte',name:'Latte',price:450,category:'coffee',description:'Your everyday espresso favorite.',plant:true},
  {id:'cappuccino',name:'Cappuccino',price:425,category:'coffee',description:'A bold espresso base with silky foam.',plant:true},
  {id:'coldbrew',name:'Cold brew',price:400,category:'coffee',description:'Slow steeped and served cold.',plant:true},
  {id:'mocha',name:'Mocha',price:500,category:'coffee',description:'Chocolate meets espresso. Sauce contains dairy.',plant:false},
  {id:'matcha',name:'Matcha latte',price:475,category:'tea',description:'Earthy green tea, your way.',plant:true},
  {id:'chai',name:'Chai latte',price:450,category:'tea',description:'Warming spices and black tea.',plant:true},
  {id:'herbal',name:'Herbal tea',price:350,category:'tea',description:'A naturally caffeine-free infusion.',plant:true,caffeineFree:true},
  {id:'seasonal',name:'Pumpkin latte',price:550,category:'coffee',description:'Seasonal favorite. Back tomorrow.',plant:false,soldOut:true},
];
export const emptyState = () => ({version:2,cart:[],orders:[],favorites:[],promo:false,redeem:false});
export function validItem(i) {
  return i && catalog.some(d=>d.id===i.id) && ['small','medium','large'].includes(i.size) &&
    ['regular','oat','almond'].includes(i.milk) && typeof i.shot==='boolean' && Number.isInteger(i.qty) && i.qty>=1 && i.qty<=10;
}
export function unit(i) {
  if(!validItem({...i,qty:i.qty??1})) throw Error('Invalid drink options or quantity.');
  return catalog.find(d=>d.id===i.id).price+({small:-50,medium:0,large:75}[i.size])+(i.milk==='regular'?0:75)+(i.shot?80:0);
}
export const stages=['confirmed','preparing','ready','collected'];
export function balance(state) {
  return Math.max(0,state.orders.reduce((sum,o)=>sum+(o.status==='collected'?o.earned:0)-(o.status!=='cancelled'?o.spent:0),0));
}
export function totals(state) {
  const subtotal=state.cart.reduce((n,i)=>n+unit(i)*i.qty,0);
  const discount=state.promo?Math.round(subtotal*.1):0;
  const reward=state.redeem&&balance(state)>=100?Math.min(200,subtotal-discount):0;
  const tax=Math.round((subtotal-discount-reward)*.1);
  return {subtotal,discount,reward,tax,total:subtotal-discount-reward+tax};
}
export function addItem(state,item) {
  if(!validItem(item)) throw Error('Quantity must be a whole number from 1 to 10.');
  if(catalog.find(d=>d.id===item.id).soldOut) throw Error('This drink is sold out.');
  if(state.cart.length>=30) throw Error('A practice cart can hold up to 30 lines.');
  state.cart.push({...item});
}
export function placeOrder(state,{name,store,pickup,scenario,consent},id,date=new Date().toISOString()) {
  if(!state.cart.length||!state.cart.every(validItem)) throw Error('Add a valid drink first.');
  if(state.cart.some(i=>catalog.find(d=>d.id===i.id).soldOut)) throw Error('A drink is sold out. Please edit your cart.');
  if(!name?.trim()||name.trim().length>60) throw Error('Enter a fictional name, 1–60 characters.');
  if(!['Kirkland','Seattle','Bellevue'].includes(store)||!['In 10 minutes','In 20 minutes','In 30 minutes'].includes(pickup)) throw Error('Choose a valid pickup store and time.');
  if(consent!==true) throw Error('Confirm that this is a training order.');
  if(state.orders.some(o=>o.id===id)) throw Error('This order was already submitted.');
  if(scenario!=='success') throw Error(scenario==='decline'?'Simulated payment declined. Nothing was charged. Your cart is preserved.':'Simulated timeout. No charge or order was created. Try again.');
  const prices=totals(state);
  const order={id,name:name.trim(),store,pickup,date,items:state.cart.map(i=>({...i})),...prices,status:'confirmed',earned:Math.floor(prices.total/10),spent:prices.reward?100:0};
  state.orders.push(order);state.cart=[];state.promo=false;state.redeem=false;return order;
}
export function advance(state,id) {
  const o=state.orders.find(o=>o.id===id),index=stages.indexOf(o?.status);
  if(index<0||index>=stages.length-1) throw Error('This order cannot advance.');
  o.status=stages[index+1];
}
export function cancelOrder(state,id) {
  const o=state.orders.find(o=>o.id===id);
  if(!o||!['confirmed','preparing','ready'].includes(o.status)) throw Error('Only uncollected orders can be cancelled.');
  o.status='cancelled';
}
export function reorder(state,id) {
  const o=state.orders.find(o=>o.id===id);
  if(!o) throw Error('Order not found.');
  const available=o.items.filter(i=>!catalog.find(d=>d.id===i.id)?.soldOut);
  if(state.cart.length+available.length>30) throw Error('Reorder would exceed the 30-line cart limit.');
  available.forEach(i=>addItem(state,i));return o.items.length-available.length;
}
export function restore(raw) {
  const state=emptyState();
  if(!raw||raw.version!==2) return state;
  state.cart=(Array.isArray(raw.cart)?raw.cart:[]).filter(validItem).slice(0,30);
  const ids=new Set();
  state.orders=(Array.isArray(raw.orders)?raw.orders:[]).filter(o=>{
    if(!o||typeof o.id!=='string'||ids.has(o.id)||!Array.isArray(o.items)||!o.items.length||!o.items.every(validItem)||
       ![...stages,'cancelled'].includes(o.status)||!['name','store','pickup','date'].every(k=>typeof o[k]==='string')||
       !['subtotal','discount','reward','tax','total','earned','spent'].every(k=>Number.isSafeInteger(o[k])&&o[k]>=0)) return false;
    ids.add(o.id);return true;
  });
  state.favorites=[...new Set((Array.isArray(raw.favorites)?raw.favorites:[]).filter(id=>catalog.some(d=>d.id===id)))];
  state.promo=raw.promo===true;state.redeem=raw.redeem===true;return state;
}
