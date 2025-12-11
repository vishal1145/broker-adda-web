module.exports=[6704,a=>{"use strict";a.s(["Toaster",()=>Y,"default",()=>Z,"toast",()=>D],6704);var b,c=a.i(72131);let d={data:""},e=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,f=/\/\*[^]*?\*\/|  +/g,g=/\n+/g,h=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?h(g,f):f+"{"+h(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=h(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=h.p?h.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},i={},j=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+j(a[c]);return b}return a};function k(a){let b,c,k=this||{},l=a.call?a(k.p):a;return((a,b,c,d,k)=>{var l,m,n,o;let p=j(a),q=i[p]||(i[p]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(p));if(!i[q]){let b=p!==a?a:(a=>{let b,c,d=[{}];for(;b=e.exec(a.replace(f,""));)b[4]?d.shift():b[3]?(c=b[3].replace(g," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(g," ").trim();return d[0]})(a);i[q]=h(k?{["@keyframes "+q]:b}:b,c?"":"."+q)}let r=c&&i.g?i.g:null;return c&&(i.g=i[q]),l=i[q],m=b,n=d,(o=r)?m.data=m.data.replace(o,l):-1===m.data.indexOf(l)&&(m.data=n?l+m.data:m.data+l),q})(l.unshift?l.raw?(b=[].slice.call(arguments,1),c=k.p,l.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":h(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):l.reduce((a,b)=>Object.assign(a,b&&b.call?b(k.p):b),{}):l,k.target||d,k.g,k.o,k.k)}k.bind({g:1});let l,m,n,o=k.bind({k:1});function p(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:m&&m()},h),c.o=/ *go\d+/.test(i),h.className=k.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),n&&j[0]&&n(h),l(j,h)}return b?b(e):e}}var q=(a,b)=>"function"==typeof a?a(b):a,r=(()=>{let a=0;return()=>(++a).toString()})(),s=(()=>{let a;return()=>a})(),t="default",u=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return u(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},v=[],w={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},x={},y=(a,b=t)=>{x[b]=u(x[b]||w,a),v.forEach(([a,c])=>{a===b&&c(x[b])})},z=a=>Object.keys(x).forEach(b=>y(a,b)),A=(a=t)=>b=>{y(b,a)},B={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},C=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||r()}))(b,a,c);return A(e.toasterId||(d=e.id,Object.keys(x).find(a=>x[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},D=(a,b)=>C("blank")(a,b);D.error=C("error"),D.success=C("success"),D.loading=C("loading"),D.custom=C("custom"),D.dismiss=(a,b)=>{let c={type:3,toastId:a};b?A(b)(c):z(c)},D.dismissAll=a=>D.dismiss(void 0,a),D.remove=(a,b)=>{let c={type:4,toastId:a};b?A(b)(c):z(c)},D.removeAll=a=>D.remove(void 0,a),D.promise=(a,b,c)=>{let d=D.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?q(b.success,a):void 0;return e?D.success(e,{id:d,...c,...null==c?void 0:c.success}):D.dismiss(d),a}).catch(a=>{let e=b.error?q(b.error,a):void 0;e?D.error(e,{id:d,...c,...null==c?void 0:c.error}):D.dismiss(d)}),a};var E=1e3,F=o`
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
`,Y=({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:e,children:f,toasterId:g,containerStyle:h,containerClassName:i})=>{let{toasts:j,handlers:k}=((a,b="default")=>{let{toasts:d,pausedAt:e}=((a={},b=t)=>{let[d,e]=(0,c.useState)(x[b]||w),f=(0,c.useRef)(x[b]);(0,c.useEffect)(()=>(f.current!==x[b]&&e(x[b]),v.push([b,e]),()=>{let a=v.findIndex(([a])=>a===b);a>-1&&v.splice(a,1)}),[b]);let g=d.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||B[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...d,toasts:g}})(a,b),f=(0,c.useRef)(new Map).current,g=(0,c.useCallback)((a,b=E)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,c.useEffect)(()=>{if(e)return;let a=Date.now(),c=d.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&D.dismiss(c.id);return}return setTimeout(()=>D.dismiss(c.id,b),d)});return()=>{c.forEach(a=>a&&clearTimeout(a))}},[d,e,b]);let h=(0,c.useCallback)(A(b),[b]),i=(0,c.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,c.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,c.useCallback)(()=>{e&&h({type:6,time:Date.now()})},[e,h]),l=(0,c.useCallback)((a,b)=>{let{reverseOrder:c=!1,gutter:e=8,defaultPosition:f}=b||{},g=d.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...c?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[d]);return(0,c.useEffect)(()=>{d.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[d,g]),{toasts:d,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,g);return c.createElement("div",{"data-rht-toaster":g||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...h},className:i,onMouseEnter:k.startPause,onMouseLeave:k.endPause},j.map(d=>{let g=d.position||b,h=((a,b)=>{let c=a.includes("top"),d=a.includes("center")?{justifyContent:"center"}:a.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:s()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${b*(c?1:-1)}px)`,...c?{top:0}:{bottom:0},...d}})(g,k.calculateOffset(d,{reverseOrder:a,gutter:e,defaultPosition:b}));return c.createElement(W,{id:d.id,key:d.id,onHeightUpdate:k.updateHeight,className:d.visible?X:"",style:h},"custom"===d.type?q(d.message,d):f?f(d):c.createElement(V,{toast:d,position:g}))}))},Z=D},38099,a=>{"use strict";a.s(["default",()=>e]);var b=a.i(87924),c=a.i(72131);let d=({className:a,style:c})=>(0,b.jsxs)("svg",{width:"120",height:"60",viewBox:"0 0 120 60",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:a,style:c,children:[(0,b.jsx)("circle",{cx:"10",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"25",cy:"10",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"40",cy:"25",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"60",cy:"15",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"80",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"100",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"20",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"35",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"55",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"75",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"15",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"30",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"50",cy:"10",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"65",cy:"35",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"90",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"110",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"5",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"45",cy:"55",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"70",cy:"45",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"100",cy:"55",r:"5",fill:"#E5E7EB",opacity:"0.5"})]}),e=({data:a})=>(0,b.jsx)("div",{className:"bg-gray-50 py-10 w-screen relative left-1/2 -translate-x-1/2 overflow-x-hidden -mt-5 md:-mt-2",children:(0,b.jsxs)("div",{className:"relative  mx-auto flex flex-col items-center text-center",children:[(0,b.jsx)("div",{className:"absolute left-30 top-12",children:(0,b.jsx)(d,{})}),(0,b.jsx)("div",{className:"absolute right-30 bottom-12",children:(0,b.jsx)(d,{})}),(0,b.jsx)("h1",{className:"text-3xl font-medium text-gray-900 mb-2",children:a.title}),a.description&&(0,b.jsx)("p",{className:"text-base text-gray-600 mb-2 max-w-2xl px-4",children:a.description}),a.breadcrumb?.length>0&&(0,b.jsx)("div",{className:"flex justify-center items-center gap-2 text-gray-500 text-base",children:a.breadcrumb.map((d,e)=>(0,b.jsxs)(c.default.Fragment,{children:[(0,b.jsx)("a",{href:d.href,className:"hover:underline",children:d.label}),e<a.breadcrumb.length-1&&(0,b.jsx)("span",{className:"mx-1",children:"/"})]},d.label))})]})})},83076,a=>{"use strict";a.s(["default",()=>c]);var b=a.i(87924);let c=({data:a})=>(0,b.jsx)("section",{className:"bg-white py-4 md:py-12",children:(0,b.jsx)("div",{className:" mx-auto",children:(0,b.jsx)("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-8 px-4 md:px-6 lg:px-0",children:(a.items||[]).map((a,c)=>(0,b.jsxs)("div",{className:"flex items-start gap-4",children:[(a=>{switch(a){case"calendar":return(0,b.jsxs)("svg",{className:"w-14 h-14",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,b.jsx)("circle",{cx:"18",cy:"18",r:"6",fill:"#FACC15",opacity:"0.8"}),(0,b.jsx)("rect",{x:"3",y:"7",width:"18",height:"13",rx:"2",stroke:"#14532d",strokeWidth:"2"}),(0,b.jsx)("path",{d:"M16 3v4M8 3v4",stroke:"#14532d",strokeWidth:"2"})]});case"credit-card":return(0,b.jsxs)("svg",{className:"w-14 h-14",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,b.jsx)("circle",{cx:"16",cy:"16",r:"6",fill:"#FACC15",opacity:"0.8"}),(0,b.jsx)("path",{d:"M4 7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10a1 1 0 0 1-1 1H7a3 3 0 0 1-3-3V7Z",stroke:"#14532d",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,b.jsx)("path",{d:"M17 11h1a1 1 0 1 1 0 2h-1v-2Z",stroke:"#14532d",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]});case"sun":return(0,b.jsxs)("svg",{className:"w-14 h-14",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,b.jsx)("circle",{cx:"16",cy:"16",r:"6",fill:"#FACC15",opacity:"0.8"}),(0,b.jsx)("path",{d:"M5 16V12a7 7 0 0 1 14 0v4",stroke:"#14532d",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,b.jsx)("path",{d:"M5 16a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2Z",stroke:"#14532d",strokeWidth:"2"}),(0,b.jsx)("path",{d:"M17 16a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h0a2 2 0 0 0-2 2v2Z",stroke:"#14532d",strokeWidth:"2"})]});default:return null}})(a.icon),(0,b.jsxs)("div",{children:[(0,b.jsx)("h4",{className:"font-semibold text-gray-800 text-sm",children:a.title}),(0,b.jsx)("p",{className:"text-xs text-gray-500",children:a.description})]})]},c))})})})},28671,a=>{a.v(JSON.parse('{"title":"Contact","breadcrumb":[{"label":"Home","href":"/"},{"label":"ContactUs","href":"/contact"}],"address":"A-17, Tajganj, Agra","contact":{"phone":"+91 98765 43210","email":"support@brokeradda.com"},"opening_hours":{"weekdays":"10:00 - 20:00","weekends":"11:00 - 18:00"},"social_icons":[{"platform":"facebook","url":"https://facebook.com","icon":"fab fa-facebook-f"},{"platform":"twitter","url":"https://twitter.com","icon":"fab fa-twitter"},{"platform":"instagram","url":"https://instagram.com","icon":"fab fa-instagram"}]}'))},60494,a=>{"use strict";a.s(["default",()=>i]);var b=a.i(87924),c=a.i(72131),d=a.i(6704),e=a.i(28671),f=a.i(12124),g=a.i(38099),h=a.i(83076);let i=()=>{let[a,i]=(0,c.useState)({name:"",email:"",subject:"",message:""}),[j,k]=(0,c.useState)(!1),l=a=>{let{name:b,value:c}=a.target;i(a=>({...a,[b]:c}))},m=async b=>{b.preventDefault(),k(!0);let c=a.name?.trim()||"",e=a.email?.trim()||"",f=a.message?.trim()||"";if(!c||!e||!f){d.default.error("Full name, email, and message are required"),k(!1);return}if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)){d.default.error("Please enter a valid email address"),k(!1);return}try{let b=await fetch("https://broker-adda-be.algofolks.com/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:c,fullName:c,email:e,subject:a.subject?.trim()||"Get Quotes Inquiry",message:f})});if(!b.ok){let a=await b.json().catch(()=>({})),c=a.message||a.error||a.data?.message||"Failed to send message";throw Error(c)}let g=await b.json();d.default.success(g.message||g.data?.message||"Contact form submitted successfully"),i({name:"",email:"",subject:"",message:""})}catch(b){let a=b.message||"Failed to send message. Please try again.";d.default.error(a)}finally{k(!1)}};return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(g.default,{data:e.default}),(0,b.jsx)("div",{className:"py-14",children:(0,b.jsx)("div",{className:" mx-auto px-4 md:px-0",children:(0,b.jsxs)("div",{className:"mb-16 relative",children:[(0,b.jsxs)("div",{className:"relative bg-white rounded-2xl overflow-hidden",style:{minHeight:"500px"},children:[(0,b.jsx)("img",{src:"/images/Layer_1.png",alt:"World Map",className:"w-full h-full object-contain opacity-90",style:{minHeight:"500px"}}),(0,b.jsx)("div",{className:"absolute top-[45%] right-[15%] w-4 h-4 bg-[#0D542B] rounded-full shadow-lg z-20 border-2 border-white"}),(0,b.jsx)("div",{className:"absolute top-[45%] right-[10%] bg-[#0D542B] text-white p-4 rounded-lg shadow-xl z-10 max-w-xs ml-8 mt-6",children:(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"font-semibold text-sm mb-1",children:"Broker Gully"}),(0,b.jsx)("p",{className:"text-xs mb-1",children:e.default.address}),(0,b.jsxs)("p",{className:"text-xs",children:["Ph: ",e.default.contact.phone]})]})})]}),(0,b.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ",children:[(0,b.jsxs)("div",{className:"bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group",children:[(0,b.jsx)("div",{className:"mb-4",children:(0,b.jsx)("svg",{className:"w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"})})}),(0,b.jsx)("h3",{className:"text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300",children:"Chat For Sales"}),(0,b.jsx)("p",{className:"text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300",children:"Get expert guidance on our real estate solutions and services."}),(0,b.jsxs)("a",{href:`mailto:${e.default.contact.email}`,className:"inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300",children:[(0,b.jsx)("span",{className:"text-[12px]",children:e.default.contact.email}),(0,b.jsx)("svg",{className:"w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})})]})]}),(0,b.jsxs)("div",{className:"bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group",children:[(0,b.jsx)("div",{className:"mb-4",children:(0,b.jsx)("svg",{className:"w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"})})}),(0,b.jsx)("h3",{className:"text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300",children:"Chat For Support"}),(0,b.jsx)("p",{className:"text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300",children:"Need help? Our support team is ready to assist you."}),(0,b.jsxs)("a",{href:"#contact-form",className:"inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300",children:[(0,b.jsx)("span",{className:"text-[12px]",children:"Get In Touch"}),(0,b.jsx)("svg",{className:"w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})})]})]}),(0,b.jsxs)("div",{className:"bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group",children:[(0,b.jsx)("div",{className:"mb-4",children:(0,b.jsx)("svg",{className:"w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"})})}),(0,b.jsx)("h3",{className:"text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300",children:"Visit Our Site"}),(0,b.jsx)("p",{className:"text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300",children:"Explore our latest real estate solutions and innovations."}),(0,b.jsxs)("a",{href:"https://www.brokeradda.com",target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300",children:[(0,b.jsx)("span",{className:"text-[12px]",children:"www.brokeradda.com"}),(0,b.jsx)("svg",{className:"w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})})]})]}),(0,b.jsxs)("div",{className:"bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:bg-[#0D542B] hover:border-[#0D542B] transition-all duration-300 cursor-pointer group",children:[(0,b.jsx)("div",{className:"mb-4",children:(0,b.jsx)("svg",{className:"w-8 h-8 text-[#0D542B] group-hover:text-white transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})})}),(0,b.jsx)("h3",{className:"text-[16px] font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300",children:"Contact Us"}),(0,b.jsx)("p",{className:"text-[14px] text-gray-600 group-hover:text-white/90 mb-4 transition-colors duration-300",children:"Reach out to us for business inquiries or collaborations."}),(0,b.jsxs)("a",{href:`tel:${e.default.contact.phone.replace(/\s/g,"")}`,className:"inline-flex items-center gap-2 bg-[#0D542B] group-hover:bg-white group-hover:text-[#0D542B] text-white px-4 py-2 rounded-lg text-[12px] font-medium transition-all duration-300",children:[(0,b.jsx)("span",{className:"text-[12px]",children:e.default.contact.phone}),(0,b.jsx)("svg",{className:"w-4 h-4 group-hover:text-[#0D542B] transition-colors duration-300",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9 5l7 7-7 7"})})]})]})]})]})})}),(0,b.jsx)("section",{className:"bg-green-50 py-12",style:{width:"100vw",marginLeft:"calc(-50vw + 50%)",marginRight:"calc(-50vw + 50%)"},children:(0,b.jsxs)("div",{className:" mx-auto px-4 md:px-8 lg:px-28 grid grid-cols-1 lg:grid-cols-2 gap-8",children:[(0,b.jsxs)("div",{className:" rounded-2xl ",id:"contact-form",children:[(0,b.jsx)("div",{className:"inline-block px-4 py-2 bg-gray-200 border border-gray-300 rounded-full mb-6",children:(0,b.jsx)("span",{className:"text-xs font-medium text-gray-700",children:"Contact Address"})}),(0,b.jsxs)("h2",{className:"text-3xl  font-bold text-gray-900 mb-4 leading-tight",children:["Let's Build the Future of"," ",(0,b.jsx)("span",{className:"text-[#0D542B]",children:"Real Estate"})," Together, Let's"," ",(0,b.jsx)("span",{className:"text-[#0D542B]",children:"Connect"})]}),(0,b.jsx)("p",{className:"text-sm text-gray-700 mb-8 leading-relaxed",children:"Have questions or need a custom solution? Reach out to us, and our team of experts will guide you every step of the way. Let's collaborate to create exceptional real estate solutions that drive your success."}),(0,b.jsxs)("div",{className:"grid grid-cols-2 gap-0 border-t border-gray-300 pt-6",children:[(0,b.jsxs)("div",{className:"flex items-start gap-4 p-4 border-b border-r border-gray-200",children:[(0,b.jsx)("div",{className:"flex-shrink-0 mt-1",children:(0,b.jsxs)("svg",{className:"w-5 h-5 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:[(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"}),(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M15 11a3 3 0 11-6 0 3 3 0 016 0z"})]})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"font-semibold text-gray-900 mb-1",children:"Address"}),(0,b.jsx)("p",{className:"text-sm text-gray-700 leading-relaxed",children:e.default.address})]})]}),(0,b.jsxs)("div",{className:"flex items-start gap-4 p-4 border-b border-gray-200",children:[(0,b.jsx)("div",{className:"flex-shrink-0 mt-1",children:(0,b.jsx)("svg",{className:"w-5 h-5 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"})})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"font-semibold text-gray-900 mb-1",children:"Phone Number"}),(0,b.jsx)("a",{href:`tel:${e.default.contact.phone.replace(/\s/g,"")}`,className:"text-sm text-gray-700 hover:text-[#0D542B] cursor-pointer transition-colors",children:e.default.contact.phone})]})]}),(0,b.jsxs)("div",{className:"flex items-start gap-4 p-4 border-r border-gray-200",children:[(0,b.jsx)("div",{className:"flex-shrink-0 mt-1",children:(0,b.jsx)("svg",{className:"w-5 h-5 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"})})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"font-semibold text-gray-900 mb-1",children:"Email Id"}),(0,b.jsx)("a",{href:`mailto:${e.default.contact.email}`,className:"text-sm text-gray-700 hover:text-[#0D542B] cursor-pointer transition-colors",children:e.default.contact.email})]})]}),(0,b.jsxs)("div",{className:"flex items-start gap-4 p-4",children:[(0,b.jsx)("div",{className:"flex-shrink-0 mt-1",children:(0,b.jsx)("svg",{className:"w-5 h-5 text-gray-400",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})})}),(0,b.jsxs)("div",{children:[(0,b.jsx)("p",{className:"font-semibold text-gray-900 mb-1",children:"Opening Hours"}),(0,b.jsxs)("p",{className:"text-sm text-gray-700 leading-relaxed",children:["Mon - Sat",(0,b.jsx)("br",{}),"9 AM to 6 PM"]})]})]})]})]}),(0,b.jsxs)("div",{className:"bg-[#0D542B] rounded-2xl p-8 text-white",children:[(0,b.jsx)("h2",{className:"text-3xl font-bold mb-3",children:"Get Quotes"}),(0,b.jsx)("p",{className:"text-sm text-white/90 mb-8",children:"The Point Of Using Lorem Ipsum Is That It Has More-Or-Less Normal"}),(0,b.jsxs)("form",{onSubmit:m,className:"space-y-6",children:[(0,b.jsx)("div",{children:(0,b.jsx)("input",{type:"text",name:"name",placeholder:"Full Name",required:!0,className:"w-full bg-transparent border-b text-sm border-white/30 text-white placeholder-white/70 pb-2 focus:outline-none focus:border-white transition-colors",value:a.name,onChange:l})}),(0,b.jsx)("div",{children:(0,b.jsx)("input",{type:"email",name:"email",placeholder:"Email",required:!0,className:"w-full bg-transparent border-b border-white/30 text-sm text-white placeholder-white/70 pb-2 focus:outline-none focus:border-white transition-colors",value:a.email,onChange:l})}),(0,b.jsx)("div",{children:(0,b.jsx)("textarea",{name:"message",placeholder:"Message",rows:"4",required:!0,className:"w-full bg-transparent border-b border-white/30 text-white text-sm placeholder-white/70 pb-2 focus:outline-none focus:border-white transition-colors resize-none",value:a.message,onChange:l})}),(0,b.jsxs)("button",{type:"submit",disabled:j,className:"bg-white text-[#0D542B] px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",children:[j?"Submitting...":"Submit Now",(0,b.jsx)("svg",{className:"w-5 h-5",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M14 5l7 7m0 0l-7 7m7-7H3"})})]})]})]})]})}),(0,b.jsx)(h.default,{data:f.default.features}),(0,b.jsx)(d.Toaster,{position:"top-right",toastOptions:{duration:3e3}})]})}}];

//# sourceMappingURL=_4640231b._.js.map