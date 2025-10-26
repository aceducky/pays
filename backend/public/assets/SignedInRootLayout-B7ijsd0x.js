import{c as o,a as f,u as y,j as t,e as b,N as _,t as j,O as p}from"./index-Uxsts50F.js";/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const N=[["rect",{width:"20",height:"14",x:"2",y:"5",rx:"2",key:"ynyp8z"}],["line",{x1:"2",x2:"22",y1:"10",y2:"10",key:"1b3vmo"}]],g=o("credit-card",N);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=[["path",{d:"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8",key:"5wwlr5"}],["path",{d:"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z",key:"r6nss1"}]],k=o("house",w);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const v=[["path",{d:"m16 17 5-5-5-5",key:"1bji2h"}],["path",{d:"M21 12H9",key:"dn1m92"}],["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}]],S=o("log-out",v);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=[["path",{d:"M4 5h16",key:"1tepv9"}],["path",{d:"M4 12h16",key:"1lakjw"}],["path",{d:"M4 19h16",key:"1djgab"}]],$=o("menu",M);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]],H=o("user",L);/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=[["path",{d:"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",key:"1yyitq"}],["path",{d:"M16 3.128a4 4 0 0 1 0 7.744",key:"16gr8j"}],["path",{d:"M22 21v-2a4 4 0 0 0-3-3.87",key:"kshegd"}],["circle",{cx:"9",cy:"7",r:"4",key:"nufk8"}]],C=o("users",A);function E(){const e=f.c(2);y();let s;e[0]===Symbol.for("react.memo_cache_sentinel")?(s=t.jsx("label",{htmlFor:"main-drawer",className:"btn btn-ghost lg:hidden",children:t.jsx($,{className:"w-5 h-5"})}),e[0]=s):s=e[0];let a;return e[1]===Symbol.for("react.memo_cache_sentinel")?(a=t.jsx("header",{className:"bg-base-100 rounded-2xl shadow p-4 mb-6",children:t.jsxs("div",{className:"flex items-center justify-between",children:[s,t.jsx("div",{className:"flex items-center gap-12 flex-1 justify-center lg:justify-start",children:t.jsx(b,{to:"/dashboard",className:"text-3xl font-semibold",children:"Pays"})})]})}),e[1]=a):a=e[1],a}function I(e){const s=f.c(3),{to:a,label:l}=e;let c;return s[0]!==l||s[1]!==a?(c=t.jsx(_,{to:a,className:O,children:l}),s[0]=l,s[1]=a,s[2]=c):c=s[2],c}function O(e){const{isActive:s}=e;return`px-3 py-2 rounded hover:bg-base-200 ${s?"underline font-semibold text-primary":""}`}function P(){const e=f.c(11),{logoutAsync:s,logoutError:a}=y();let l;e[0]!==s||e[1]!==a?(l=async()=>{try{await s()}catch{j.error(a)}},e[0]=s,e[1]=a,e[2]=l):l=e[2];const c=l;let n;e[3]===Symbol.for("react.memo_cache_sentinel")?(n={to:"/dashboard",label:"Dashboard",icon:t.jsx(k,{className:"w-4 h-4"})},e[3]=n):n=e[3];let r;e[4]===Symbol.for("react.memo_cache_sentinel")?(r={to:"/users",label:"Users",icon:t.jsx(C,{className:"w-4 h-4"})},e[4]=r):r=e[4];let i;e[5]===Symbol.for("react.memo_cache_sentinel")?(i={to:"/payments",label:"Payments",icon:t.jsx(g,{className:"w-4 h-4"})},e[5]=i):i=e[5];let m;e[6]===Symbol.for("react.memo_cache_sentinel")?(m=[n,r,i,{to:"/profile",label:"Profile",icon:t.jsx(H,{className:"w-4 h-4"})}],e[6]=m):m=e[6];const u=m;let d;e[7]===Symbol.for("react.memo_cache_sentinel")?(d=u.map(R),e[7]=d):d=e[7];let h;e[8]===Symbol.for("react.memo_cache_sentinel")?(h=t.jsx(S,{className:"w-4 h-4"}),e[8]=h):h=e[8];let x;return e[9]!==c?(x=t.jsxs("ul",{className:"menu bg-base-200 min-h-full w-60 p-4 flex flex-col text-lg",children:[d,t.jsx("li",{className:"mt-auto",children:t.jsxs("button",{onClick:c,className:"text-error text-lg flex items-center gap-2",children:[h,"Logout"]})})]}),e[9]=c,e[10]=x):x=e[10],x}function R(e){return t.jsx("li",{children:t.jsx(I,{to:e.to,label:e.label,icon:e.icon})},e.to)}function z(){const e=f.c(4);let s;e[0]===Symbol.for("react.memo_cache_sentinel")?(s=t.jsx("input",{id:"main-drawer",type:"checkbox",className:"drawer-toggle"}),e[0]=s):s=e[0];let a;e[1]===Symbol.for("react.memo_cache_sentinel")?(a=t.jsx(E,{}),e[1]=a):a=e[1];let l;e[2]===Symbol.for("react.memo_cache_sentinel")?(l=t.jsxs("div",{className:"drawer-content flex flex-col",children:[a,t.jsx("main",{className:"container mx-auto px-2 flex-1",children:t.jsx(p,{})})]}),e[2]=l):l=e[2];let c;return e[3]===Symbol.for("react.memo_cache_sentinel")?(c=t.jsxs("div",{className:"drawer lg:drawer-open min-h-screen",children:[s,l,t.jsxs("div",{className:"drawer-side",children:[t.jsx("label",{htmlFor:"main-drawer","aria-label":"close sidebar",className:"drawer-overlay"}),t.jsx(P,{})]})]}),e[3]=c):c=e[3],c}export{z as default};
