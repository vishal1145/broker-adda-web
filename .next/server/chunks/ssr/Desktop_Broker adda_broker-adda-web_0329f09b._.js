module.exports=[40268,a=>{"use strict";a.s(["default",()=>e]);var b=a.i(64144),c=a.i(75055);let d=({className:a,style:c})=>(0,b.jsxs)("svg",{width:"120",height:"60",viewBox:"0 0 120 60",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:a,style:c,children:[(0,b.jsx)("circle",{cx:"10",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"25",cy:"10",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"40",cy:"25",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"60",cy:"15",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"80",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"100",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"20",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"35",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"55",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"75",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"15",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"30",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"50",cy:"10",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"65",cy:"35",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"90",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"110",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"5",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"45",cy:"55",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"70",cy:"45",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"100",cy:"55",r:"5",fill:"#E5E7EB",opacity:"0.5"})]}),e=({data:a})=>(0,b.jsx)("div",{className:"bg-gray-50 py-10 w-screen relative left-1/2 -translate-x-1/2 overflow-x-hidden -mt-5 md:-mt-2",children:(0,b.jsxs)("div",{className:"relative  mx-auto flex flex-col items-center text-center",children:[(0,b.jsx)("div",{className:"absolute left-30 top-12",children:(0,b.jsx)(d,{})}),(0,b.jsx)("div",{className:"absolute right-30 bottom-12",children:(0,b.jsx)(d,{})}),(0,b.jsx)("h1",{className:"text-3xl font-medium text-gray-900 mb-2",children:a.title}),a.description&&(0,b.jsx)("p",{className:"text-base text-gray-600 mb-2 max-w-2xl px-4",children:a.description}),a.breadcrumb?.length>0&&(0,b.jsx)("div",{className:"flex justify-center items-center gap-2 text-gray-500 text-base",children:a.breadcrumb.map((d,e)=>(0,b.jsxs)(c.default.Fragment,{children:[(0,b.jsx)("a",{href:d.href,className:"hover:underline",children:d.label}),e<a.breadcrumb.length-1&&(0,b.jsx)("span",{className:"mx-1",children:"/"})]},d.label))})]})})},62768,a=>{"use strict";a.s(["Toaster",()=>Y,"default",()=>Z,"toast",()=>D],62768);var b,c=a.i(75055);let d={data:""},e=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,f=/\/\*[^]*?\*\/|  +/g,g=/\n+/g,h=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?h(g,f):f+"{"+h(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=h(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=h.p?h.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},i={},j=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+j(a[c]);return b}return a};function k(a){let b,c,k=this||{},l=a.call?a(k.p):a;return((a,b,c,d,k)=>{var l,m,n,o;let p=j(a),q=i[p]||(i[p]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(p));if(!i[q]){let b=p!==a?a:(a=>{let b,c,d=[{}];for(;b=e.exec(a.replace(f,""));)b[4]?d.shift():b[3]?(c=b[3].replace(g," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(g," ").trim();return d[0]})(a);i[q]=h(k?{["@keyframes "+q]:b}:b,c?"":"."+q)}let r=c&&i.g?i.g:null;return c&&(i.g=i[q]),l=i[q],m=b,n=d,(o=r)?m.data=m.data.replace(o,l):-1===m.data.indexOf(l)&&(m.data=n?l+m.data:m.data+l),q})(l.unshift?l.raw?(b=[].slice.call(arguments,1),c=k.p,l.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":h(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):l.reduce((a,b)=>Object.assign(a,b&&b.call?b(k.p):b),{}):l,k.target||d,k.g,k.o,k.k)}k.bind({g:1});let l,m,n,o=k.bind({k:1});function p(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:m&&m()},h),c.o=/ *go\d+/.test(i),h.className=k.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),n&&j[0]&&n(h),l(j,h)}return b?b(e):e}}var q=(a,b)=>"function"==typeof a?a(b):a,r=(()=>{let a=0;return()=>(++a).toString()})(),s=(()=>{let a;return()=>a})(),t="default",u=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return u(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},v=[],w={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},x={},y=(a,b=t)=>{x[b]=u(x[b]||w,a),v.forEach(([a,c])=>{a===b&&c(x[b])})},z=a=>Object.keys(x).forEach(b=>y(a,b)),A=(a=t)=>b=>{y(b,a)},B={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},C=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||r()}))(b,a,c);return A(e.toasterId||(d=e.id,Object.keys(x).find(a=>x[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},D=(a,b)=>C("blank")(a,b);D.error=C("error"),D.success=C("success"),D.loading=C("loading"),D.custom=C("custom"),D.dismiss=(a,b)=>{let c={type:3,toastId:a};b?A(b)(c):z(c)},D.dismissAll=a=>D.dismiss(void 0,a),D.remove=(a,b)=>{let c={type:4,toastId:a};b?A(b)(c):z(c)},D.removeAll=a=>D.remove(void 0,a),D.promise=(a,b,c)=>{let d=D.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?q(b.success,a):void 0;return e?D.success(e,{id:d,...c,...null==c?void 0:c.success}):D.dismiss(d),a}).catch(a=>{let e=b.error?q(b.error,a):void 0;e?D.error(e,{id:d,...c,...null==c?void 0:c.error}):D.dismiss(d)}),a};var E=1e3,F=o`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,G=o`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,H=o`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,I=p("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${F} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${G} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${a=>a.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${H} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,J=o`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,K=p("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${a=>a.secondary||"#e0e0e0"};
  border-right-color: ${a=>a.primary||"#616161"};
  animation: ${J} 1s linear infinite;
`,L=o`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,M=o`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,N=p("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${a=>a.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${L} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${M} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${a=>a.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,O=p("div")`
  position: absolute;
`,P=p("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,Q=o`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,R=p("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${Q} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,S=({toast:a})=>{let{icon:b,type:d,iconTheme:e}=a;return void 0!==b?"string"==typeof b?c.createElement(R,null,b):b:"blank"===d?null:c.createElement(P,null,c.createElement(K,{...e}),"loading"!==d&&c.createElement(O,null,"error"===d?c.createElement(I,{...e}):c.createElement(N,{...e})))},T=p("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,U=p("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,V=c.memo(({toast:a,position:b,style:d,children:e})=>{let f=a.height?((a,b)=>{let c=a.includes("top")?1:-1,[d,e]=s()?["0%{opacity:0;} 100%{opacity:1;}","0%{opacity:1;} 100%{opacity:0;}"]:[`
0% {transform: translate3d(0,${-200*c}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${-150*c}%,-1px) scale(.6); opacity:0;}
`];return{animation:b?`${o(d)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${o(e)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}})(a.position||b||"top-center",a.visible):{opacity:0},g=c.createElement(S,{toast:a}),h=c.createElement(U,{...a.ariaProps},q(a.message,a));return c.createElement(T,{className:a.className,style:{...f,...d,...a.style}},"function"==typeof e?e({icon:g,message:h}):c.createElement(c.Fragment,null,g,h))});b=c.createElement,h.p=void 0,l=b,m=void 0,n=void 0;var W=({id:a,className:b,style:d,onHeightUpdate:e,children:f})=>{let g=c.useCallback(b=>{if(b){let c=()=>{e(a,b.getBoundingClientRect().height)};c(),new MutationObserver(c).observe(b,{subtree:!0,childList:!0,characterData:!0})}},[a,e]);return c.createElement("div",{ref:g,className:b,style:d},f)},X=k`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,Y=({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:e,children:f,toasterId:g,containerStyle:h,containerClassName:i})=>{let{toasts:j,handlers:k}=((a,b="default")=>{let{toasts:d,pausedAt:e}=((a={},b=t)=>{let[d,e]=(0,c.useState)(x[b]||w),f=(0,c.useRef)(x[b]);(0,c.useEffect)(()=>(f.current!==x[b]&&e(x[b]),v.push([b,e]),()=>{let a=v.findIndex(([a])=>a===b);a>-1&&v.splice(a,1)}),[b]);let g=d.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||B[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...d,toasts:g}})(a,b),f=(0,c.useRef)(new Map).current,g=(0,c.useCallback)((a,b=E)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,c.useEffect)(()=>{if(e)return;let a=Date.now(),c=d.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&D.dismiss(c.id);return}return setTimeout(()=>D.dismiss(c.id,b),d)});return()=>{c.forEach(a=>a&&clearTimeout(a))}},[d,e,b]);let h=(0,c.useCallback)(A(b),[b]),i=(0,c.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,c.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,c.useCallback)(()=>{e&&h({type:6,time:Date.now()})},[e,h]),l=(0,c.useCallback)((a,b)=>{let{reverseOrder:c=!1,gutter:e=8,defaultPosition:f}=b||{},g=d.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...c?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[d]);return(0,c.useEffect)(()=>{d.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[d,g]),{toasts:d,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,g);return c.createElement("div",{"data-rht-toaster":g||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...h},className:i,onMouseEnter:k.startPause,onMouseLeave:k.endPause},j.map(d=>{let g=d.position||b,h=((a,b)=>{let c=a.includes("top"),d=a.includes("center")?{justifyContent:"center"}:a.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:s()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${b*(c?1:-1)}px)`,...c?{top:0}:{bottom:0},...d}})(g,k.calculateOffset(d,{reverseOrder:a,gutter:e,defaultPosition:b}));return c.createElement(W,{id:d.id,key:d.id,onHeightUpdate:k.updateHeight,className:d.visible?X:"",style:h},"custom"===d.type?q(d.message,d):f?f(d):c.createElement(V,{toast:d,position:g}))}))},Z=D},30092,a=>{"use strict";a.s(["default",()=>e]);var b=a.i(75055),c=a.i(39603),d=a.i(36042);let e=({children:a,requiredRole:e=null})=>{let{user:f,loading:g,isAuthenticated:h,isBroker:i,isCustomer:j}=(0,d.useAuth)(),k=(0,c.useRouter)();return((0,b.useEffect)(()=>{if(g)return;let a=setTimeout(()=>{if(h()&&("broker"!==e||i())&&"customer"===e&&!j())return},100);return()=>clearTimeout(a)},[f,g,h,i,j,e,k]),!g&&h()&&("broker"!==e||i())&&("customer"!==e||j()))?a:null}},280,a=>{"use strict";a.s(["default",()=>j]);var b=a.i(64144),c=a.i(75055),d=a.i(39603),e=a.i(51722),f=a.i(30092),g=a.i(40268),h=a.i(62768),i=a.i(36042);let j=()=>{(0,d.useRouter)();let{user:a}=(0,i.useAuth)(),[j,k]=(a?.role,(0,c.useState)(!0)),[l,m]=(0,c.useState)(!0),[n,o]=(0,c.useState)(!0),[p,q]=(0,c.useState)(!1),[r,s]=(0,c.useState)(!1),[t,u]=(0,c.useState)(!1),[v,w]=(0,c.useState)(!1),[x,y]=(0,c.useState)(!0),[z,A]=(0,c.useState)(!1),[B,C]=(0,c.useState)(!1);(0,c.useEffect)(()=>{(async()=>{try{return void y(!1)}catch(a){}finally{y(!1)}})()},[]);let D=async()=>{try{u(!0),h.toast.error("Authentication required. Please login again."),u(!1);return}catch(a){h.toast.error("An error occurred while updating email notification preferences. Please try again.",{duration:3e3})}finally{u(!1)}},E=async()=>{try{w(!0),h.toast.error("Authentication required. Please login again."),w(!1);return}catch(a){h.toast.error("An error occurred while updating SMS notification preferences. Please try again.",{duration:3e3})}finally{w(!1)}},F=async()=>{try{A(!0),h.toast.error("Authentication required. Please login again."),A(!1);return}catch(a){h.toast.error("An error occurred while sending verification email. Please try again.",{duration:3e3})}finally{A(!1)}},G=async()=>{try{s(!0),h.toast.error("Authentication required. Please login again."),s(!1);return}catch(a){h.toast.error("An error occurred while deleting your account. Please try again.",{duration:3e3}),s(!1)}};return(0,b.jsxs)(f.default,{children:[(0,b.jsx)(g.default,{data:{title:"Account Settings",description:"Manage your profile preferences, notifications, security, and subscription."}}),(0,b.jsxs)("div",{className:"min-h-screen bg-white py-16",children:[(0,b.jsx)(h.Toaster,{position:"top-right",toastOptions:{duration:3e3}}),(0,b.jsx)("div",{className:"w-full mx-auto  px-4 ",children:(0,b.jsx)("div",{className:"flex flex-col lg:flex-row gap-8",children:(0,b.jsx)("div",{className:"flex-1",children:(0,b.jsxs)("div",{className:"bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-8",children:[(0,b.jsx)("h2",{className:"text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8",children:"Account Settings"}),(0,b.jsxs)("div",{className:"mb-8 pb-8 border-b border-gray-200",children:[(0,b.jsx)("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Notifications"}),(0,b.jsx)("p",{className:"text-sm text-gray-600 mb-6",children:"Choose how you want to receive alerts and updates"}),(0,b.jsxs)("div",{className:"space-y-4",children:[(0,b.jsxs)("div",{className:"flex items-center justify-between py-3 border-b border-gray-200",children:[(0,b.jsxs)("div",{className:"flex-1",children:[(0,b.jsx)("p",{className:"text-sm font-medium text-gray-900",children:"Email Notifications"}),(0,b.jsx)("p",{className:"text-xs text-gray-600 mt-1",children:"Receive updates, lead alerts, and verification messages"})]}),(0,b.jsx)("button",{type:"button",onClick:D,disabled:t,className:`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${j?"bg-green-600":"bg-gray-300"}`,role:"switch","aria-checked":j,"aria-label":"Toggle email notifications",children:t?(0,b.jsx)("span",{className:"inline-block h-3 w-3 transform rounded-full bg-white translate-x-1",children:(0,b.jsxs)("svg",{className:"animate-spin h-3 w-3 text-gray-600",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,b.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,b.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]})}):(0,b.jsx)("span",{className:`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${j?"translate-x-6":"translate-x-1"}`})})]}),(0,b.jsxs)("div",{className:"flex items-center justify-between py-3 border-b border-gray-200",children:[(0,b.jsxs)("div",{className:"flex-1",children:[(0,b.jsx)("p",{className:"text-sm font-medium text-gray-900",children:"SMS Notifications"}),(0,b.jsx)("p",{className:"text-xs text-gray-600 mt-1",children:"Receive important alerts and reminders."})]}),(0,b.jsx)("button",{type:"button",onClick:E,disabled:v,className:`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${l?"bg-green-600":"bg-gray-300"}`,role:"switch","aria-checked":l,"aria-label":"Toggle SMS notifications",children:v?(0,b.jsx)("span",{className:"inline-block h-3 w-3 transform rounded-full bg-white translate-x-1",children:(0,b.jsxs)("svg",{className:"animate-spin h-3 w-3 text-gray-600",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,b.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,b.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]})}):(0,b.jsx)("span",{className:`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${l?"translate-x-6":"translate-x-1"}`})})]})]})]}),(0,b.jsxs)("div",{className:"mb-8 pb-8 border-b border-gray-200",children:[(0,b.jsx)("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Subscription & Plans"}),(0,b.jsx)("p",{className:"text-sm text-gray-600 mb-6",children:"View current plan, manage renewal settings, and compare available plans"}),(0,b.jsx)(e.default,{href:"/plans",className:"inline-flex items-center justify-center px-6 py-3 bg-[#0D542B] text-white rounded-lg text-sm font-medium hover:bg-[#0B4624] transition-colors",children:"View Plans / Upgrade"})]}),(0,b.jsx)("div",{className:"mb-8 pb-8 border-b border-gray-200",children:(0,b.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3",children:[(0,b.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,b.jsx)("p",{className:"text-sm font-medium text-gray-900",children:"Email Verification"}),(0,b.jsx)("p",{className:"text-xs text-gray-600 mt-1",children:B?"Your email address has been verified":"Verify your email address to secure your account"})]}),(0,b.jsxs)("div",{className:"flex-shrink-0",children:[!B&&(0,b.jsxs)("button",{type:"button",onClick:F,disabled:z,className:"w-full sm:w-auto px-3 md:px-4 py-2 bg-[#0D542B] text-white rounded-lg text-xs md:text-sm font-medium hover:bg-[#0B4624] transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap",children:[z&&(0,b.jsxs)("svg",{className:"animate-spin h-3 w-3 md:h-4 md:w-4 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,b.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,b.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),(0,b.jsx)("span",{className:"hidden sm:inline",children:z?"Sending...":"Send Verification Email"}),(0,b.jsx)("span",{className:"sm:hidden",children:z?"Sending...":"Send Email"})]}),B&&(0,b.jsxs)("span",{className:"w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2 bg-green-100 text-green-800 rounded-lg text-xs md:text-sm font-medium",children:[(0,b.jsx)("svg",{className:"h-3 w-3 md:h-4 md:w-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M5 13l4 4L19 7"})}),"Verified"]})]})]})}),(0,b.jsx)("div",{className:"mb-8",children:(0,b.jsxs)("div",{className:"flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",children:[(0,b.jsxs)("div",{className:"flex-1 min-w-0",children:[(0,b.jsx)("h3",{className:"text-base md:text-lg font-semibold text-red-600 mb-2",children:"Delete Account"}),(0,b.jsx)("p",{className:"text-xs md:text-sm text-gray-600",children:"This action is permanent and cannot be undone. All your data will be removed.."})]}),(0,b.jsx)("div",{className:"flex-shrink-0 sm:ml-6",children:(0,b.jsx)("button",{type:"button",onClick:()=>q(!0),className:"w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-red-600 text-white rounded-lg text-xs md:text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 whitespace-nowrap",children:"Delete Account"})})]})})]})})})})]}),p&&(0,b.jsxs)("div",{className:"fixed inset-0 z-[100] flex items-center justify-center",role:"dialog","aria-modal":"true",children:[(0,b.jsx)("div",{className:"absolute inset-0 bg-black/60",onClick:()=>{r||(q(!1),s(!1))}}),(0,b.jsxs)("div",{className:"relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6",children:[(0,b.jsx)("h3",{className:"text-xl font-bold text-gray-900 mb-4",children:"Confirm Account Deletion"}),(0,b.jsx)("p",{className:"text-sm text-gray-600 mb-6",children:"Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, properties, leads, and connections will be permanently deleted."}),(0,b.jsxs)("div",{className:"flex gap-4 justify-end",children:[(0,b.jsx)("button",{type:"button",onClick:()=>{q(!1),s(!1)},disabled:r,className:"px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",children:"Cancel"}),(0,b.jsxs)("button",{type:"button",onClick:G,disabled:r,className:"px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",children:[r&&(0,b.jsxs)("svg",{className:"animate-spin h-4 w-4 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",children:[(0,b.jsx)("circle",{className:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor",strokeWidth:"4"}),(0,b.jsx)("path",{className:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})]}),r?"Deleting...":"Delete Account"]})]})]})]})]})}}];

//# sourceMappingURL=Desktop_Broker%20adda_broker-adda-web_0329f09b._.js.map