module.exports=[38099,a=>{"use strict";a.s(["default",()=>e]);var b=a.i(87924),c=a.i(72131);let d=({className:a,style:c})=>(0,b.jsxs)("svg",{width:"120",height:"60",viewBox:"0 0 120 60",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:a,style:c,children:[(0,b.jsx)("circle",{cx:"10",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"25",cy:"10",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"40",cy:"25",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"60",cy:"15",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"80",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"100",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"20",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"35",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"55",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"75",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"15",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"30",cy:"20",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"50",cy:"10",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"65",cy:"35",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"90",cy:"40",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"110",cy:"30",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"5",cy:"50",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"45",cy:"55",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"70",cy:"45",r:"5",fill:"#E5E7EB",opacity:"0.5"}),(0,b.jsx)("circle",{cx:"100",cy:"55",r:"5",fill:"#E5E7EB",opacity:"0.5"})]}),e=({data:a})=>(0,b.jsx)("div",{className:"bg-gray-50 py-10 w-screen relative left-1/2 -translate-x-1/2 overflow-x-hidden -mt-5 md:-mt-2",children:(0,b.jsxs)("div",{className:"relative  mx-auto flex flex-col items-center text-center",children:[(0,b.jsx)("div",{className:"absolute left-30 top-12",children:(0,b.jsx)(d,{})}),(0,b.jsx)("div",{className:"absolute right-30 bottom-12",children:(0,b.jsx)(d,{})}),(0,b.jsx)("h1",{className:"text-3xl font-medium text-gray-900 mb-2",children:a.title}),a.description&&(0,b.jsx)("p",{className:"text-base text-gray-600 mb-2 max-w-2xl px-4",children:a.description}),a.breadcrumb?.length>0&&(0,b.jsx)("div",{className:"flex justify-center items-center gap-2 text-gray-500 text-base",children:a.breadcrumb.map((d,e)=>(0,b.jsxs)(c.default.Fragment,{children:[(0,b.jsx)("a",{href:d.href,className:"hover:underline",children:d.label}),e<a.breadcrumb.length-1&&(0,b.jsx)("span",{className:"mx-1",children:"/"})]},d.label))})]})})},6704,a=>{"use strict";a.s(["Toaster",()=>Y,"default",()=>Z,"toast",()=>D],6704);var b,c=a.i(72131);let d={data:""},e=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,f=/\/\*[^]*?\*\/|  +/g,g=/\n+/g,h=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?h(g,f):f+"{"+h(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=h(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=h.p?h.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},i={},j=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+j(a[c]);return b}return a};function k(a){let b,c,k=this||{},l=a.call?a(k.p):a;return((a,b,c,d,k)=>{var l,m,n,o;let p=j(a),q=i[p]||(i[p]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(p));if(!i[q]){let b=p!==a?a:(a=>{let b,c,d=[{}];for(;b=e.exec(a.replace(f,""));)b[4]?d.shift():b[3]?(c=b[3].replace(g," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(g," ").trim();return d[0]})(a);i[q]=h(k?{["@keyframes "+q]:b}:b,c?"":"."+q)}let r=c&&i.g?i.g:null;return c&&(i.g=i[q]),l=i[q],m=b,n=d,(o=r)?m.data=m.data.replace(o,l):-1===m.data.indexOf(l)&&(m.data=n?l+m.data:m.data+l),q})(l.unshift?l.raw?(b=[].slice.call(arguments,1),c=k.p,l.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":h(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):l.reduce((a,b)=>Object.assign(a,b&&b.call?b(k.p):b),{}):l,k.target||d,k.g,k.o,k.k)}k.bind({g:1});let l,m,n,o=k.bind({k:1});function p(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:m&&m()},h),c.o=/ *go\d+/.test(i),h.className=k.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),n&&j[0]&&n(h),l(j,h)}return b?b(e):e}}var q=(a,b)=>"function"==typeof a?a(b):a,r=(()=>{let a=0;return()=>(++a).toString()})(),s=(()=>{let a;return()=>a})(),t="default",u=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return u(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},v=[],w={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},x={},y=(a,b=t)=>{x[b]=u(x[b]||w,a),v.forEach(([a,c])=>{a===b&&c(x[b])})},z=a=>Object.keys(x).forEach(b=>y(a,b)),A=(a=t)=>b=>{y(b,a)},B={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},C=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||r()}))(b,a,c);return A(e.toasterId||(d=e.id,Object.keys(x).find(a=>x[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},D=(a,b)=>C("blank")(a,b);D.error=C("error"),D.success=C("success"),D.loading=C("loading"),D.custom=C("custom"),D.dismiss=(a,b)=>{let c={type:3,toastId:a};b?A(b)(c):z(c)},D.dismissAll=a=>D.dismiss(void 0,a),D.remove=(a,b)=>{let c={type:4,toastId:a};b?A(b)(c):z(c)},D.removeAll=a=>D.remove(void 0,a),D.promise=(a,b,c)=>{let d=D.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?q(b.success,a):void 0;return e?D.success(e,{id:d,...c,...null==c?void 0:c.success}):D.dismiss(d),a}).catch(a=>{let e=b.error?q(b.error,a):void 0;e?D.error(e,{id:d,...c,...null==c?void 0:c.error}):D.dismiss(d)}),a};var E=1e3,F=o`
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
`,Y=({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:e,children:f,toasterId:g,containerStyle:h,containerClassName:i})=>{let{toasts:j,handlers:k}=((a,b="default")=>{let{toasts:d,pausedAt:e}=((a={},b=t)=>{let[d,e]=(0,c.useState)(x[b]||w),f=(0,c.useRef)(x[b]);(0,c.useEffect)(()=>(f.current!==x[b]&&e(x[b]),v.push([b,e]),()=>{let a=v.findIndex(([a])=>a===b);a>-1&&v.splice(a,1)}),[b]);let g=d.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||B[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...d,toasts:g}})(a,b),f=(0,c.useRef)(new Map).current,g=(0,c.useCallback)((a,b=E)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,c.useEffect)(()=>{if(e)return;let a=Date.now(),c=d.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&D.dismiss(c.id);return}return setTimeout(()=>D.dismiss(c.id,b),d)});return()=>{c.forEach(a=>a&&clearTimeout(a))}},[d,e,b]);let h=(0,c.useCallback)(A(b),[b]),i=(0,c.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,c.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,c.useCallback)(()=>{e&&h({type:6,time:Date.now()})},[e,h]),l=(0,c.useCallback)((a,b)=>{let{reverseOrder:c=!1,gutter:e=8,defaultPosition:f}=b||{},g=d.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...c?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[d]);return(0,c.useEffect)(()=>{d.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[d,g]),{toasts:d,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,g);return c.createElement("div",{"data-rht-toaster":g||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...h},className:i,onMouseEnter:k.startPause,onMouseLeave:k.endPause},j.map(d=>{let g=d.position||b,h=((a,b)=>{let c=a.includes("top"),d=a.includes("center")?{justifyContent:"center"}:a.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:s()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${b*(c?1:-1)}px)`,...c?{top:0}:{bottom:0},...d}})(g,k.calculateOffset(d,{reverseOrder:a,gutter:e,defaultPosition:b}));return c.createElement(W,{id:d.id,key:d.id,onHeightUpdate:k.updateHeight,className:d.visible?X:"",style:h},"custom"===d.type?q(d.message,d):f?f(d):c.createElement(V,{toast:d,position:g}))}))},Z=D},83468,a=>{"use strict";a.s(["default",()=>e]);var b=a.i(72131),c=a.i(50944),d=a.i(29130);let e=({children:a,requiredRole:e=null})=>{let{user:f,loading:g,isAuthenticated:h,isBroker:i,isCustomer:j}=(0,d.useAuth)(),k=(0,c.useRouter)();return((0,b.useEffect)(()=>{if(g)return;let a=setTimeout(()=>{if(h()&&("broker"!==e||i())&&"customer"===e&&!j())return},100);return()=>clearTimeout(a)},[f,g,h,i,j,e,k]),!g&&h()&&("broker"!==e||i())&&("customer"!==e||j()))?a:null}},11478,a=>{"use strict";a.s(["default",()=>g]);var b=a.i(72131),c=function(){return(c=Object.assign||function(a){for(var b,c=1,d=arguments.length;c<d;c++)for(var e in b=arguments[c])Object.prototype.hasOwnProperty.call(b,e)&&(a[e]=b[e]);return a}).apply(this,arguments)},d=function(a){var d=a.animate,e=a.backgroundColor,f=void 0===e?"#f5f6f7":e,g=a.backgroundOpacity,h=void 0===g?1:g,i=a.baseUrl,j=void 0===i?"":i,k=a.children,l=a.foregroundColor,m=a.foregroundOpacity,n=a.gradientRatio,o=void 0===n?2:n,p=a.uniqueKey,q=a.rtl,r=a.speed,s=a.style,t=a.title,u=void 0===t?"Loading...":t,v=a.beforeMask,w=void 0===v?null:v,x=function(a,b){var c={};for(var d in a)Object.prototype.hasOwnProperty.call(a,d)&&0>b.indexOf(d)&&(c[d]=a[d]);if(null!=a&&"function"==typeof Object.getOwnPropertySymbols)for(var e=0,d=Object.getOwnPropertySymbols(a);e<d.length;e++)0>b.indexOf(d[e])&&Object.prototype.propertyIsEnumerable.call(a,d[e])&&(c[d[e]]=a[d[e]]);return c}(a,["animate","backgroundColor","backgroundOpacity","baseUrl","children","foregroundColor","foregroundOpacity","gradientRatio","uniqueKey","rtl","speed","style","title","beforeMask"]),y=p||Math.random().toString(36).substring(6),z="".concat(y,"-diff"),A="".concat(y,"-animated-diff"),B="".concat(y,"-aria"),C="".concat(-1*o," 0");return(0,b.createElement)("svg",c({"aria-labelledby":B,role:"img",style:c(c({},void 0===s?{}:s),void 0!==q&&q?{transform:"scaleX(-1)"}:null)},x),u?(0,b.createElement)("title",{id:B},u):null,w&&(0,b.isValidElement)(w)?w:null,(0,b.createElement)("rect",{role:"presentation",x:"0",y:"0",width:"100%",height:"100%",clipPath:"url(".concat(j,"#").concat(z,")"),style:{fill:"url(".concat(j,"#").concat(A,")")}}),(0,b.createElement)("defs",null,(0,b.createElement)("clipPath",{id:z},k),(0,b.createElement)("linearGradient",{id:A,gradientTransform:"translate(".concat(C,")")},(0,b.createElement)("stop",{offset:"0%",stopColor:f,stopOpacity:h}),(0,b.createElement)("stop",{offset:"50%",stopColor:void 0===l?"#eee":l,stopOpacity:void 0===m?1:m}),(0,b.createElement)("stop",{offset:"100%",stopColor:f,stopOpacity:h}),(void 0===d||d)&&(0,b.createElement)("animateTransform",{attributeName:"gradientTransform",type:"translate",values:"".concat(C,"; 0 0; ").concat("".concat(o," 0")),dur:"".concat(void 0===r?1.2:r,"s"),repeatCount:"indefinite"}))))},e=function(a){return a.children?(0,b.createElement)(d,c({},a)):(0,b.createElement)(f,c({},a))},f=function(a){return(0,b.createElement)(e,c({viewBox:"0 0 476 124"},a),(0,b.createElement)("rect",{x:"48",y:"8",width:"88",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"48",y:"26",width:"52",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"0",y:"56",width:"410",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"0",y:"72",width:"380",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"0",y:"88",width:"178",height:"6",rx:"3"}),(0,b.createElement)("circle",{cx:"20",cy:"20",r:"20"}))};let g=e},56798,a=>{"use strict";a.s(["default",()=>j]);var b=a.i(87924),c=a.i(72131),d=a.i(38246),e=a.i(83468),f=a.i(38099),g=a.i(11478),h=a.i(29130),i=a.i(6704);let j=()=>{let{user:a,isAuthenticated:j}=(0,h.useAuth)(),[k,l]=(0,c.useState)([]),[m,n]=(0,c.useState)(!0),[o,p]=(0,c.useState)(""),[q,r]=(0,c.useState)(1),[s]=(0,c.useState)(6),[t,u]=(0,c.useState)({total:0,page:1,limit:6,totalPages:0,hasNextPage:!1,hasPrevPage:!1}),v="https://broker-adda-be.algofolks.com/api";(0,c.useEffect)(()=>{let b=async()=>{if(!j()||!a?.token){n(!1),p("Please login to view saved properties");return}try{n(!0),p("");let b=a.token,c=(a=>{try{return""}catch{return""}})(0),d=c?`${v}/saved-properties?userId=${encodeURIComponent(c)}`:`${v}/saved-properties`,e=await fetch(d,{method:"GET",headers:{Authorization:`Bearer ${b}`,"Content-Type":"application/json"}});if(!e.ok)throw Error("Failed to fetch saved properties");let f=await e.json(),g=(f?.data?.savedProperties||f?.savedProperties||f?.data||[]).map(a=>{let b=a.propertyId||a.property||a;return b?{id:b._id||b.id,name:b.title||b.name||"Property",type:b.propertyType||b.type||b.category||"Property",price:b.price||0,currentPrice:b.price?`₹${Number(b.price).toLocaleString("en-IN")}`:"Price on request",rating:b.rating||4.7,description:b.propertyDescription||b.description||"A spacious and well-lit property in a prime location, perfect for families.",bedrooms:b.bedrooms||0,bathrooms:b.bathrooms||0,city:b.city||"",region:b.region||"",amenities:b.amenities||[],images:b.images||[b.image],image:b.images?.[0]||b.image||"/images/pexels-binyaminmellish-106399.jpg"}:null}).filter(Boolean);l(g),u({total:g.length,page:1,limit:s,totalPages:Math.ceil(g.length/s),hasNextPage:g.length>s,hasPrevPage:!1})}catch(a){p(a.message||"Failed to load saved properties"),l([])}finally{n(!1)}};j()&&a?.token&&b()},[j,a?.token,v,s]);let w=async(b,c)=>{if(c.preventDefault(),c.stopPropagation(),!j()||!a?.token)return void i.default.error("Please login to remove saved properties");try{let c=a.token,d=await fetch(`${v}/saved-properties/${b}`,{method:"DELETE",headers:{Authorization:`Bearer ${c}`,"Content-Type":"application/json"}});if(d.ok)l(a=>a.filter(a=>a.id!==b)),i.default.success("Property removed from saved list");else{let a=await d.json().catch(()=>({}));i.default.error(a.message||"Failed to remove property")}}catch(a){i.default.error("Network error. Please try again.")}},x=(0,c.useMemo)(()=>{let a=(q-1)*s,b=a+s;return k.slice(a,b)},[k,q,s]);return(0,c.useEffect)(()=>{u({total:k.length,page:q,limit:s,totalPages:Math.ceil(k.length/s),hasNextPage:q<Math.ceil(k.length/s),hasPrevPage:q>1})},[k,q,s]),(0,b.jsxs)(e.default,{children:[(0,b.jsx)(f.default,{data:{title:"Saved Properties",breadcrumb:[{label:"Home",href:"/"},{label:"Saved Properties",href:"/saved-properties"}]}}),(0,b.jsxs)("div",{className:"min-h-screen ",children:[(0,b.jsx)(i.Toaster,{position:"top-right"}),(0,b.jsxs)("div",{className:"w-full mx-auto  py-8",children:[!m&&k.length>0&&(0,b.jsx)("div",{className:"mb-6",children:(0,b.jsxs)("p",{className:"text-gray-600",children:["You have ",k.length," saved propert",1===k.length?"y":"ies"]})}),m?(0,b.jsx)("div",{className:"space-y-6",children:Array.from({length:3}).map((a,c)=>(0,b.jsx)("div",{className:"bg-white border border-gray-200 rounded-xl shadow-sm",children:(0,b.jsxs)(g.default,{speed:2,width:"100%",height:300,viewBox:"0 0 1000 300",backgroundColor:"#f3f4f6",foregroundColor:"#e5e7eb",children:[(0,b.jsx)("rect",{x:"0",y:"0",rx:"12",ry:"12",width:"400",height:"300"}),(0,b.jsx)("rect",{x:"430",y:"20",rx:"4",ry:"4",width:"300",height:"24"}),(0,b.jsx)("rect",{x:"430",y:"60",rx:"4",ry:"4",width:"500",height:"16"}),(0,b.jsx)("rect",{x:"430",y:"90",rx:"4",ry:"4",width:"400",height:"16"}),(0,b.jsx)("rect",{x:"430",y:"120",rx:"4",ry:"4",width:"350",height:"16"}),(0,b.jsx)("rect",{x:"430",y:"160",rx:"4",ry:"4",width:"200",height:"20"}),(0,b.jsx)("rect",{x:"430",y:"200",rx:"4",ry:"4",width:"300",height:"20"})]})},`loading-${c}`))}):o?(0,b.jsxs)("div",{className:"bg-white border border-red-200 rounded-xl p-8 text-center",children:[(0,b.jsx)("svg",{className:"w-16 h-16 text-red-400 mx-auto mb-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})}),(0,b.jsx)("h3",{className:"text-lg font-semibold text-gray-900 mb-2",children:"Error Loading Saved Properties"}),(0,b.jsx)("p",{className:"text-gray-600 mb-4",children:o}),(0,b.jsx)("button",{onClick:()=>window.location.reload(),className:"px-4 py-2 bg-[#0A421E] text-white rounded-lg hover:bg-[#0d5a2a] transition-colors",children:"Try Again"})]}):0===k.length?(0,b.jsxs)("div",{className:"bg-white border border-gray-200 rounded-xl p-12 text-center",children:[(0,b.jsx)("svg",{className:"w-24 h-24 text-gray-400 mx-auto mb-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"})}),(0,b.jsx)("h3",{className:"text-xl font-semibold text-gray-900 mb-2",children:"No Saved Properties Yet"}),(0,b.jsx)("p",{className:"text-gray-600 mb-6",children:"Start saving properties you like to view them here later."}),(0,b.jsx)(d.default,{href:"/search",className:"inline-block px-6 py-3 bg-[#0A421E] text-white rounded-lg hover:bg-[#0d5a2a] transition-colors",children:"Browse Properties"})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"space-y-6",children:x.map(a=>{let c=Array.isArray(a.images)&&a.images.length>0?a.images[0]:a.image||"/images/pexels-binyaminmellish-106399.jpg";return(0,b.jsx)(d.default,{href:`/property-details/${a.id}`,className:"block",children:(0,b.jsx)("div",{className:"bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden",children:(0,b.jsxs)("div",{className:"flex h-[200px]",children:[(0,b.jsxs)("div",{className:"relative w-[400px] h-full flex-shrink-0",children:[(0,b.jsx)("div",{className:"relative w-full h-full overflow-hidden rounded-l-xl",children:(0,b.jsx)("img",{src:c,alt:a.name,className:"block w-full h-full object-cover",onError:a=>{a.target.src="/images/pexels-binyaminmellish-106399.jpg"}})}),(0,b.jsx)("div",{className:"absolute top-4 left-4",children:(0,b.jsx)("span",{className:"bg-[#0A421E] text-white px-2 py-0.5 rounded-full text-xs font-medium",children:a.type})}),(0,b.jsxs)("div",{className:"absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur rounded-full px-2 py-1 shadow-sm",children:[(0,b.jsx)("svg",{className:"w-4 h-4 text-yellow-400 mr-1",fill:"currentColor",viewBox:"0 0 20 20",children:(0,b.jsx)("path",{d:"M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"})}),(0,b.jsx)("span",{className:"text-xs font-medium text-gray-700",children:a.rating})]}),(0,b.jsx)("div",{className:"absolute bottom-4 left-4 z-10",children:(0,b.jsx)("span",{className:"px-2 py-0.5 rounded-full text-sm font-semibold",style:{backgroundColor:"#FDC700"},children:a.currentPrice})}),(0,b.jsx)("button",{onClick:b=>w(a.id,b),"aria-label":"Remove from saved",className:"absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-red-500 hover:text-red-700 hover:bg-red-50 z-10 transition-colors",children:(0,b.jsx)("svg",{className:"w-5 h-5",fill:"currentColor",viewBox:"0 0 20 20",children:(0,b.jsx)("path",{fillRule:"evenodd",d:"M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z",clipRule:"evenodd"})})})]}),(0,b.jsxs)("div",{className:"flex-1 p-4 flex flex-col",children:[(0,b.jsxs)("h3",{className:"mb-1 flex items-center gap-2 line-clamp-1",style:{fontSize:"16px",lineHeight:"22px",fontWeight:"600",color:"#171A1FFF"},children:[(0,b.jsx)("span",{className:"truncate",children:a.name}),(0,b.jsx)("svg",{className:"w-3.5 h-3.5 text-[#0A421E] flex-shrink-0",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",strokeWidth:"2.5",strokeLinecap:"round",children:(0,b.jsx)("path",{d:"M7 17l10-10M7 7h10v10"})})]}),(0,b.jsx)("p",{className:"mb-3 line-clamp-1",style:{fontFamily:"Inter",fontSize:"12px",lineHeight:"16px",fontWeight:"400",color:"#565D6DFF"},children:a.description?.length>80?`${a.description.substring(0,80)}...`:a.description}),(a.bedrooms||a.bathrooms)&&(0,b.jsxs)("div",{className:"mb-2",children:[(0,b.jsx)("div",{className:"text-[12px] font-semibold text-gray-900 mb-1",children:"Features"}),(0,b.jsxs)("div",{className:"flex flex-wrap gap-2",children:[a.bedrooms>0&&(0,b.jsxs)("span",{className:"inline-flex items-center gap-1 px-2.5 py-1",style:{background:"#EDFDF4FF",borderRadius:"9999px",borderWidth:"1px",borderColor:"#00000000",borderStyle:"solid"},children:[(0,b.jsx)("svg",{className:"w-4 h-4",style:{color:"#19191FFF"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",strokeWidth:"2",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3 12h18M3 12l-1 8a2 2 0 002 2h16a2 2 0 002-2l-1-8M3 12V9a2 2 0 012-2h5m0 0h6a2 2 0 012 2v3m0 0v3a2 2 0 01-2 2h-6v0M9 21h6"})}),(0,b.jsxs)("span",{style:{fontFamily:"Inter",fontSize:"12px",lineHeight:"16px",fontWeight:"600",color:"#19191FFF"},children:[a.bedrooms," bd"]})]}),a.bathrooms>0&&(0,b.jsxs)("span",{className:"inline-flex items-center gap-1 px-2.5 py-1",style:{background:"#EDFDF4FF",borderRadius:"9999px",borderWidth:"1px",borderColor:"#00000000",borderStyle:"solid"},children:[(0,b.jsx)("svg",{className:"w-4 h-4",style:{color:"#19191FFF"},fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",strokeWidth:"2",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0h4a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h8zm0 0v4"})}),(0,b.jsxs)("span",{style:{fontFamily:"Inter",fontSize:"12px",lineHeight:"16px",fontWeight:"600",color:"#19191FFF"},children:[a.bathrooms," bt"]})]})]})]}),a.amenities&&a.amenities.length>0&&(0,b.jsxs)("div",{className:"mt-auto",children:[(0,b.jsx)("div",{className:"text-[12px] font-semibold text-gray-900 mb-1",children:"Amenities"}),(0,b.jsxs)("div",{className:"flex flex-wrap gap-2 text-[11px]",children:[a.amenities.slice(0,2).map((a,c)=>(0,b.jsx)("span",{className:"inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200",children:"string"==typeof a?a:a?.name||a},c)),a.amenities.length>2&&(0,b.jsxs)("span",{className:"inline-flex items-center px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200",children:["+",a.amenities.length-2," more"]})]})]})]})]})})},a.id)})}),t.total>0&&t.totalPages>1&&(0,b.jsxs)("div",{className:"flex items-center justify-between mt-6",children:[(0,b.jsxs)("p",{className:"text-sm text-gray-600",children:["Showing"," ",(t.page-1)*t.limit+1,"-",Math.min(t.page*t.limit,t.total)," ","of ",t.total," results"]}),(0,b.jsxs)("div",{className:"flex items-center gap-2",children:[(0,b.jsx)("button",{onClick:()=>r(a=>Math.max(1,a-1)),disabled:!t.hasPrevPage,className:`w-8 h-8 rounded-md border flex items-center justify-center ${!t.hasPrevPage?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-white text-gray-700 hover:bg-gray-50"}`,children:(0,b.jsx)("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M15 19l-7-7 7-7"})})}),Array.from({length:t.totalPages}).map((a,c)=>{let d=c+1;return 1===d||d===t.totalPages||d>=t.page-1&&d<=t.page+1?(0,b.jsx)("button",{onClick:()=>r(d),className:`w-8 h-8 rounded-md border flex items-center justify-center ${t.page===d?"bg-[#0A421E] text-white border-[#0A421E]":"bg-white text-gray-700 hover:bg-gray-50"}`,children:d},d):d===t.page-2||d===t.page+2?(0,b.jsx)("span",{className:"w-8 h-8 flex items-center justify-center text-gray-400",children:"..."},d):null}),(0,b.jsx)("button",{onClick:()=>r(a=>Math.min(t.totalPages,a+1)),disabled:!t.hasNextPage,className:`w-8 h-8 rounded-md border flex items-center justify-center ${!t.hasNextPage?"bg-gray-100 text-gray-400 cursor-not-allowed":"bg-white text-gray-700 hover:bg-gray-50"}`,children:(0,b.jsx)("svg",{className:"w-4 h-4",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:"2",d:"M9 5l7 7-7 7"})})})]})]})]})]})]})]})}}];

//# sourceMappingURL=_60988fb1._.js.map