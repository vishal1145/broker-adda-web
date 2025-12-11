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
`,Y=({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:e,children:f,toasterId:g,containerStyle:h,containerClassName:i})=>{let{toasts:j,handlers:k}=((a,b="default")=>{let{toasts:d,pausedAt:e}=((a={},b=t)=>{let[d,e]=(0,c.useState)(x[b]||w),f=(0,c.useRef)(x[b]);(0,c.useEffect)(()=>(f.current!==x[b]&&e(x[b]),v.push([b,e]),()=>{let a=v.findIndex(([a])=>a===b);a>-1&&v.splice(a,1)}),[b]);let g=d.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||B[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...d,toasts:g}})(a,b),f=(0,c.useRef)(new Map).current,g=(0,c.useCallback)((a,b=E)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,c.useEffect)(()=>{if(e)return;let a=Date.now(),c=d.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&D.dismiss(c.id);return}return setTimeout(()=>D.dismiss(c.id,b),d)});return()=>{c.forEach(a=>a&&clearTimeout(a))}},[d,e,b]);let h=(0,c.useCallback)(A(b),[b]),i=(0,c.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,c.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,c.useCallback)(()=>{e&&h({type:6,time:Date.now()})},[e,h]),l=(0,c.useCallback)((a,b)=>{let{reverseOrder:c=!1,gutter:e=8,defaultPosition:f}=b||{},g=d.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...c?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[d]);return(0,c.useEffect)(()=>{d.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[d,g]),{toasts:d,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,g);return c.createElement("div",{"data-rht-toaster":g||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...h},className:i,onMouseEnter:k.startPause,onMouseLeave:k.endPause},j.map(d=>{let g=d.position||b,h=((a,b)=>{let c=a.includes("top"),d=a.includes("center")?{justifyContent:"center"}:a.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:s()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${b*(c?1:-1)}px)`,...c?{top:0}:{bottom:0},...d}})(g,k.calculateOffset(d,{reverseOrder:a,gutter:e,defaultPosition:b}));return c.createElement(W,{id:d.id,key:d.id,onHeightUpdate:k.updateHeight,className:d.visible?X:"",style:h},"custom"===d.type?q(d.message,d):f?f(d):c.createElement(V,{toast:d,position:g}))}))},Z=D},11478,a=>{"use strict";a.s(["default",()=>g]);var b=a.i(72131),c=function(){return(c=Object.assign||function(a){for(var b,c=1,d=arguments.length;c<d;c++)for(var e in b=arguments[c])Object.prototype.hasOwnProperty.call(b,e)&&(a[e]=b[e]);return a}).apply(this,arguments)},d=function(a){var d=a.animate,e=a.backgroundColor,f=void 0===e?"#f5f6f7":e,g=a.backgroundOpacity,h=void 0===g?1:g,i=a.baseUrl,j=void 0===i?"":i,k=a.children,l=a.foregroundColor,m=a.foregroundOpacity,n=a.gradientRatio,o=void 0===n?2:n,p=a.uniqueKey,q=a.rtl,r=a.speed,s=a.style,t=a.title,u=void 0===t?"Loading...":t,v=a.beforeMask,w=void 0===v?null:v,x=function(a,b){var c={};for(var d in a)Object.prototype.hasOwnProperty.call(a,d)&&0>b.indexOf(d)&&(c[d]=a[d]);if(null!=a&&"function"==typeof Object.getOwnPropertySymbols)for(var e=0,d=Object.getOwnPropertySymbols(a);e<d.length;e++)0>b.indexOf(d[e])&&Object.prototype.propertyIsEnumerable.call(a,d[e])&&(c[d[e]]=a[d[e]]);return c}(a,["animate","backgroundColor","backgroundOpacity","baseUrl","children","foregroundColor","foregroundOpacity","gradientRatio","uniqueKey","rtl","speed","style","title","beforeMask"]),y=p||Math.random().toString(36).substring(6),z="".concat(y,"-diff"),A="".concat(y,"-animated-diff"),B="".concat(y,"-aria"),C="".concat(-1*o," 0");return(0,b.createElement)("svg",c({"aria-labelledby":B,role:"img",style:c(c({},void 0===s?{}:s),void 0!==q&&q?{transform:"scaleX(-1)"}:null)},x),u?(0,b.createElement)("title",{id:B},u):null,w&&(0,b.isValidElement)(w)?w:null,(0,b.createElement)("rect",{role:"presentation",x:"0",y:"0",width:"100%",height:"100%",clipPath:"url(".concat(j,"#").concat(z,")"),style:{fill:"url(".concat(j,"#").concat(A,")")}}),(0,b.createElement)("defs",null,(0,b.createElement)("clipPath",{id:z},k),(0,b.createElement)("linearGradient",{id:A,gradientTransform:"translate(".concat(C,")")},(0,b.createElement)("stop",{offset:"0%",stopColor:f,stopOpacity:h}),(0,b.createElement)("stop",{offset:"50%",stopColor:void 0===l?"#eee":l,stopOpacity:void 0===m?1:m}),(0,b.createElement)("stop",{offset:"100%",stopColor:f,stopOpacity:h}),(void 0===d||d)&&(0,b.createElement)("animateTransform",{attributeName:"gradientTransform",type:"translate",values:"".concat(C,"; 0 0; ").concat("".concat(o," 0")),dur:"".concat(void 0===r?1.2:r,"s"),repeatCount:"indefinite"}))))},e=function(a){return a.children?(0,b.createElement)(d,c({},a)):(0,b.createElement)(f,c({},a))},f=function(a){return(0,b.createElement)(e,c({viewBox:"0 0 476 124"},a),(0,b.createElement)("rect",{x:"48",y:"8",width:"88",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"48",y:"26",width:"52",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"0",y:"56",width:"410",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"0",y:"72",width:"380",height:"6",rx:"3"}),(0,b.createElement)("rect",{x:"0",y:"88",width:"178",height:"6",rx:"3"}),(0,b.createElement)("circle",{cx:"20",cy:"20",r:"20"}))};let g=e},12108,a=>{"use strict";a.s(["default",()=>f]);var b=a.i(87924),c=a.i(72131),d=a.i(6704),e=a.i(73125);let f=({isOpen:a,onClose:f,propertyId:g,propertyBrokerId:h})=>{let[i,j]=(0,c.useState)({customerName:"",email:"",phoneNumber:"",requirement:null,propertyType:null,primaryRegion:null,secondaryRegion:null,budget:"",propertyId:g||""}),[k,l]=(0,c.useState)(!1),[m,n]=(0,c.useState)([]),[o,p]=(0,c.useState)(!1);(0,c.useEffect)(()=>{let b=async()=>{try{p(!0);let a=await fetch("https://broker-adda-be.algofolks.com/api/regions",{headers:{"Content-Type":"application/json"}});if(!a.ok)throw Error("Failed to load regions");let b=await a.json(),c=[];b?.success&&Array.isArray(b?.data?.regions)?c=b.data.regions:Array.isArray(b)?c=b:Array.isArray(b?.data)?c=b.data:Array.isArray(b?.regions)?c=b.regions:b?._id&&b?.name&&(c=[b]),n(c)}catch(a){n([])}finally{p(!1)}};a&&b()},[a]);let q=(0,c.useMemo)(()=>Array.isArray(m)?m.map(a=>({value:a._id||a.id||a,label:a.name||a.region||a})):[],[m]),r={control:(a,b)=>({...a,minHeight:"40px",borderRadius:10,border:"1px solid #e5e7eb",fontSize:12,boxShadow:b.isFocused?"0 0 0 4px rgba(13,84,43,0.12)":"0 0 1px #171a1f12, 0 0 2px #171a1f1F",borderColor:b.isFocused?"#0D542B":"#e5e7eb",background:"white",":hover":{borderColor:(b.isFocused,"#0D542B")}}),valueContainer:a=>({...a,padding:"2px 10px",fontSize:12}),indicatorSeparator:()=>({display:"none"}),menuPortal:a=>({...a,zIndex:999999}),option:(a,b)=>({...a,backgroundColor:b.isSelected?"#0D542B":b.isFocused?"#E8F8F0":"transparent",color:b.isSelected?"#ffffff":b.isFocused?"#0D542B":"#4b5563",fontSize:12,borderRadius:6,margin:"2px 6px",padding:"8px 12px",":active":{backgroundColor:b.isSelected?"#0D542B":"#C8F1DC",color:b.isSelected?"#ffffff":"#0D542B"}}),singleValue:a=>({...a,color:"#6b7280",fontWeight:400,fontSize:12}),input:a=>({...a,color:"#6b7280",fontWeight:400})},s=a=>{let{name:b,value:c}=a.target;if("budget"===b){let a=c.replace(/[^0-9]/g,"");j(c=>({...c,[b]:a}))}else j(a=>({...a,[b]:c}))},t=async a=>{if(a.preventDefault(),!h)return void d.default.error("Property broker information not available");try{if(l(!0),!i.requirement)return void d.default.error("Please select a requirement");if(!i.propertyType)return void d.default.error("Please select a property type");if(!i.primaryRegion)return void d.default.error("Please select a primary region");let a=i.budget?parseFloat(String(i.budget).replace(/[^0-9.]/g,"")):0,b="object"==typeof i.requirement?i.requirement.value||i.requirement.label:i.requirement,c="object"==typeof i.propertyType?i.propertyType.value||i.propertyType.label:i.propertyType,e=i.primaryRegion&&"object"==typeof i.primaryRegion?i.primaryRegion.value||i.primaryRegion._id:i.primaryRegion,g=i.secondaryRegion&&"object"==typeof i.secondaryRegion?i.secondaryRegion.value||i.secondaryRegion._id:i.secondaryRegion,j={customerName:i.customerName||"",customerPhone:i.phoneNumber||"",customerEmail:i.email||"",requirement:b||"",propertyType:c||"",budget:a||0,primaryRegionId:e||"",createdBy:h};g&&(j.secondaryRegionId=g);let k=await fetch("https://broker-adda-be.algofolks.com/api/leads",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(j)});if(!k.ok){let a=await k.json().catch(()=>({})),b=a?.message||a?.error||"Failed to create lead";d.default.error(b);return}d.default.success("Lead created successfully!"),f(),u()}catch(a){d.default.error("Error creating lead. Please try again.")}finally{l(!1)}},u=()=>{j({customerName:"",email:"",phoneNumber:"",requirement:null,propertyType:null,primaryRegion:null,secondaryRegion:null,budget:"",propertyId:g||""})};return a?(0,b.jsx)("div",{className:"fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 mt-8","aria-labelledby":"modal-title",role:"dialog","aria-modal":"true",onClick:f,children:(0,b.jsx)("div",{className:"bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-100",onClick:a=>a.stopPropagation(),children:(0,b.jsx)("div",{className:"max-h-[80vh] overflow-y-auto scrollbar-hide px-6 pt-6 pb-6",children:(0,b.jsxs)("div",{className:"w-full text-[12px]",children:[(0,b.jsx)("h3",{className:"text-[16px] font-bold text-gray-900 mb-1",children:"Property Enquiry"}),(0,b.jsx)("p",{className:"text-[11px] text-gray-500 mb-6",children:"Please fill out the form below with your property requirements."}),(0,b.jsxs)("form",{onSubmit:t,className:"space-y-4",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700",children:"Customer Name"}),(0,b.jsx)("input",{type:"text",name:"customerName",value:i.customerName,onChange:s,placeholder:"John Doe",className:"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500",required:!0})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700",children:"Email"}),(0,b.jsx)("input",{type:"email",name:"email",value:i.email,onChange:s,placeholder:"john.doe@example.com",className:"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500",required:!0})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700",children:"Phone Number"}),(0,b.jsx)("input",{type:"tel",name:"phoneNumber",value:i.phoneNumber,onChange:s,placeholder:"+1 (555) 123-4567",className:"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500",required:!0})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700 mb-2",children:"Requirement"}),(0,b.jsx)("div",{className:"flex flex-wrap gap-2",children:[{value:"Buy",label:"Buy"},{value:"Rent",label:"Rent"},{value:"Sell",label:"Sell"}].map(a=>{let c=i.requirement&&(i.requirement.value||i.requirement)===a.value;return(0,b.jsx)("button",{type:"button",onClick:()=>j({...i,requirement:a}),className:`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${c?"bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm":"bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50"}`,children:a.label},a.value)})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700 mb-2",children:"Property Type"}),(0,b.jsx)("div",{className:"flex flex-wrap gap-2",children:[{value:"Residential",label:"Residential"},{value:"Commercial",label:"Commercial"},{value:"Plot",label:"Plot"},{value:"Other",label:"Other"}].map(a=>{let c=i.propertyType&&(i.propertyType.value||i.propertyType)===a.value;return(0,b.jsx)("button",{type:"button",onClick:()=>j({...i,propertyType:a}),className:`px-3.5 py-1.5 rounded-full text-[12px] font-semibold border transition-colors transition-shadow duration-150 ${c?"bg-green-50 text-green-900 border-green-200 ring-1 ring-green-100 shadow-sm":"bg-white text-slate-700 border-gray-200 hover:border-gray-300 hover:bg-slate-50"}`,children:a.label},a.value)})})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700 mb-1",children:"Budget"}),(0,b.jsx)("input",{type:"text",name:"budget",value:i.budget,onChange:s,placeholder:"Enter budget amount",inputMode:"numeric",className:"mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-[12px] focus:outline-none focus:ring-green-500 focus:border-green-500"})]}),(0,b.jsxs)("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700 mb-1",children:"Primary Region *"}),(0,b.jsx)(e.default,{value:i.primaryRegion,onChange:a=>j({...i,primaryRegion:a}),options:q,styles:r,isSearchable:!0,isLoading:o,menuPortalTarget:null,menuPosition:"fixed",menuPlacement:"auto",placeholder:"Select region"})]}),(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-[11px] font-medium text-gray-700 mb-1",children:"Optional Region"}),(0,b.jsx)(e.default,{value:i.secondaryRegion,onChange:a=>j({...i,secondaryRegion:a}),options:q,styles:r,isSearchable:!0,isLoading:o,menuPortalTarget:null,menuPosition:"fixed",menuPlacement:"auto",placeholder:"Select region (optional)"})]})]}),(0,b.jsx)("div",{className:"mt-6",children:(0,b.jsx)("button",{type:"submit",disabled:k,className:"w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-3 bg-green-900 text-[13px] font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed",children:k?"Creating Lead...":"Submit Enquiry"})})]})]})})})}):null}}];

//# sourceMappingURL=_314d3294._.js.map