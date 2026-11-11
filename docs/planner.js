// SceneWeaver: small, auditable scene compiler. No generated code is executed.
export const THEMES = [
 {id:'space',name:'Orbital outpost',text:'A science fiction moon base, space station, alien planet, astronaut laboratory, stars, rockets and planets.',sky:0x071328,ground:0x344565,accent:0x8cecff,decor:'planet'},
 {id:'forest',name:'Enchanted grove',text:'An enchanted forest, woodland garden, trees, flowers, green nature, magical grove and mushrooms.',sky:0x102e2b,ground:0x28624d,accent:0xffd781,decor:'tree'},
 {id:'ocean',name:'Coral sanctuary',text:'An underwater ocean, coral reef, marine aquarium, sea, fish, bubbles and submerged ruins.',sky:0x062e45,ground:0x267281,accent:0xffa4b8,decor:'coral'},
 {id:'desert',name:'Sunken temple',text:'An ancient desert temple, Egyptian pyramid, sand dunes, archaeology, tomb and sandstone ruins.',sky:0x57372f,ground:0xa77b50,accent:0xffd28e,decor:'pyramid'},
 {id:'city',name:'Neon district',text:'A futuristic neon city, skyscrapers, cyberpunk streets, urban buildings and illuminated architecture.',sky:0x1c1939,ground:0x37324f,accent:0xff7caf,decor:'building'},
 {id:'castle',name:'Castle courtyard',text:'A medieval castle courtyard, fortress, stone towers, knights, fantasy kingdom and dungeon.',sky:0x20283c,ground:0x5d6573,accent:0xe7bd68,decor:'tower'},
 {id:'lab',name:'Discovery lab',text:'A scientific laboratory, engineering workshop, robotics classroom, science experiment and technology research facility.',sky:0x1a2932,ground:0x4d656a,accent:0xa8f2d1,decor:'machine'}
];
export const MECHANICS = [
 {id:'collect',text:'Collect all gems, crystals, coins, orbs or treasures to unlock the exit gate and win a collection challenge.'},
 {id:'switches',text:'Activate all switches, buttons, levers or pressure plates to power the door and solve a switch puzzle.'},
 {id:'explore',text:'Explore a peaceful interactive diorama, inspect objects, wander through a scene, no puzzle or challenge.'}
];
export const NUMBER_WORDS={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,twelve:12};
export function cosine(a,b){let s=0;for(let i=0;i<a.length;i++)s+=a[i]*b[i];return s;}
export function rank(vector,entries,embeddings){return entries.map((entry,i)=>({id:entry.id,score:cosine(vector,embeddings[i])})).sort((a,b)=>b.score-a.score);}
export function compile(prompt,themeScores,mechanicScores){
 if(typeof prompt!=='string'||!prompt.trim())throw new Error('Describe a world first.');
 if(prompt.length>1200)throw new Error('Please keep the world description under 1,200 characters.');
 let text=prompt.toLowerCase();
 const theme=THEMES.find(x=>x.id===themeScores[0]?.id)||THEMES[0];
 let mechanic=mechanicScores[0]?.id||'collect';
 // Explicit instructions override similarity when unambiguous.
 if(/\b(switch|switches|button|buttons|lever|levers|pressure plate)\b/.test(text))mechanic='switches';
 if(/\b(no puzzle|no challenge|just explore|peaceful diorama)\b/.test(text))mechanic='explore';
 const countMatch=text.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s+(?:glowing\s+|spinning\s+|golden\s+|blue\s+|red\s+|green\s+)?(?:(?:gem|crystal|coin|orb|treasure|button|lever|plate|sphere|object)s?|switch(?:es)?)\b/);
 let requestedCount=countMatch?(NUMBER_WORDS[countMatch[1]]??Number(countMatch[1])):5;
 const count=Math.max(1,Math.min(12,requestedCount));
 const timerMatch=text.match(/\b(\d+)\s*(?:-\s*)?(?:second|sec)s?\b/);
 const timer=timerMatch&&!/\b(no timer|without a timer)\b/.test(text)?Math.max(10,Math.min(300,Number(timerMatch[1]))):null;
 const colorNames={red:0xff776f,blue:0x7cc8ff,green:0xa8f2a3,purple:0xc4a1ff,pink:0xffa4cf,gold:0xffd166,golden:0xffd166,yellow:0xffe78c,orange:0xffb26c};
 let color=theme.accent;const colorMatch=text.match(/\b(red|blue|green|purple|pink|gold|golden|yellow|orange)\s+(?:glowing\s+)?(?:gems?|crystals?|coins?|orbs?|switches|buttons?|spheres?)\b/);if(colorMatch)color=colorNames[colorMatch[1]];
 const entities=Array.from({length:count},(_,i)=>({id:`item-${i+1}`,type:mechanic==='switches'?'switch':'crystal',position:[Math.cos(i/count*Math.PI*2)*4.5,0.8,Math.sin(i/count*Math.PI*2)*4.5],color,active:false}));
 const rules=mechanic==='explore'?[{event:'click object',condition:'always',action:'inspect and pulse object'}]:[
 {event:'click '+(mechanic==='switches'?'switch':'crystal'),condition:'not already active',action:mechanic==='switches'?'activate switch; increment powered count':'collect crystal; increment score'},
 {event:'count changes',condition:`count = ${count}`,action:'open exit gate'},
 {event:'click exit gate',condition:'gate open',action:'complete level; stop timer'}
 ];
 if(timer&&mechanic!=='explore')rules.push({event:'timer reaches zero',condition:'level not complete',action:'end challenge; offer restart'});
 const notes=['The model selects a scene theme and mechanic using semantic similarity. Counts, colors and timers use explicit parsing. Geometry is procedural, not a generated mesh.'];
 if(requestedCount!==count)notes.push(`Object count limited to ${count} for this prototype.`);
 return {schemaVersion:1,prompt:prompt.trim(),title:theme.name,theme:theme.id,mechanic,count,timer:mechanic==='explore'?null:timer,color,entities,rules,themeRanking:themeScores.slice(0,3),mechanicRanking:mechanicScores.slice(0,3),notes};
}
export function initialState(plan){return {activeIds:[],gateOpen:plan.mechanic==='explore',won:false,expired:false,remaining:plan.timer};}
export function transition(plan,state,event){
 if(event.type==='reset')return initialState(plan);
 if(state.won||state.expired)return state;
 if(event.type==='tick'&&state.remaining!==null){const remaining=Math.max(0,state.remaining-1);return {...state,remaining,expired:remaining===0};}
 if(event.type==='item'&&plan.entities.some(e=>e.id===event.id)&&plan.mechanic!=='explore'&&!state.activeIds.includes(event.id)){const activeIds=[...state.activeIds,event.id];return {...state,activeIds,gateOpen:activeIds.length===plan.count};}
 if(event.type==='gate'&&state.gateOpen&&plan.mechanic!=='explore')return {...state,won:true};
 return state;
}
