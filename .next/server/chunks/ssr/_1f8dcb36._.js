module.exports=[6704,a=>{"use strict";a.s(["Toaster",()=>Y,"default",()=>Z],6704);var b,c=a.i(72131);let d={data:""},e=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,f=/\/\*[^]*?\*\/|  +/g,g=/\n+/g,h=(a,b)=>{let c="",d="",e="";for(let f in a){let g=a[f];"@"==f[0]?"i"==f[1]?c=f+" "+g+";":d+="f"==f[1]?h(g,f):f+"{"+h(g,"k"==f[1]?"":b)+"}":"object"==typeof g?d+=h(g,b?b.replace(/([^,])+/g,a=>f.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,b=>/&/.test(b)?b.replace(/&/g,a):a?a+" "+b:b)):f):null!=g&&(f=/^--/.test(f)?f:f.replace(/[A-Z]/g,"-$&").toLowerCase(),e+=h.p?h.p(f,g):f+":"+g+";")}return c+(b&&e?b+"{"+e+"}":e)+d},i={},j=a=>{if("object"==typeof a){let b="";for(let c in a)b+=c+j(a[c]);return b}return a};function k(a){let b,c,k=this||{},l=a.call?a(k.p):a;return((a,b,c,d,k)=>{var l,m,n,o;let p=j(a),q=i[p]||(i[p]=(a=>{let b=0,c=11;for(;b<a.length;)c=101*c+a.charCodeAt(b++)>>>0;return"go"+c})(p));if(!i[q]){let b=p!==a?a:(a=>{let b,c,d=[{}];for(;b=e.exec(a.replace(f,""));)b[4]?d.shift():b[3]?(c=b[3].replace(g," ").trim(),d.unshift(d[0][c]=d[0][c]||{})):d[0][b[1]]=b[2].replace(g," ").trim();return d[0]})(a);i[q]=h(k?{["@keyframes "+q]:b}:b,c?"":"."+q)}let r=c&&i.g?i.g:null;return c&&(i.g=i[q]),l=i[q],m=b,n=d,(o=r)?m.data=m.data.replace(o,l):-1===m.data.indexOf(l)&&(m.data=n?l+m.data:m.data+l),q})(l.unshift?l.raw?(b=[].slice.call(arguments,1),c=k.p,l.reduce((a,d,e)=>{let f=b[e];if(f&&f.call){let a=f(c),b=a&&a.props&&a.props.className||/^go/.test(a)&&a;f=b?"."+b:a&&"object"==typeof a?a.props?"":h(a,""):!1===a?"":a}return a+d+(null==f?"":f)},"")):l.reduce((a,b)=>Object.assign(a,b&&b.call?b(k.p):b),{}):l,k.target||d,k.g,k.o,k.k)}k.bind({g:1});let l,m,n,o=k.bind({k:1});function p(a,b){let c=this||{};return function(){let d=arguments;function e(f,g){let h=Object.assign({},f),i=h.className||e.className;c.p=Object.assign({theme:m&&m()},h),c.o=/ *go\d+/.test(i),h.className=k.apply(c,d)+(i?" "+i:""),b&&(h.ref=g);let j=a;return a[0]&&(j=h.as||a,delete h.as),n&&j[0]&&n(h),l(j,h)}return b?b(e):e}}var q=(a,b)=>"function"==typeof a?a(b):a,r=(()=>{let a=0;return()=>(++a).toString()})(),s=(()=>{let a;return()=>a})(),t="default",u=(a,b)=>{let{toastLimit:c}=a.settings;switch(b.type){case 0:return{...a,toasts:[b.toast,...a.toasts].slice(0,c)};case 1:return{...a,toasts:a.toasts.map(a=>a.id===b.toast.id?{...a,...b.toast}:a)};case 2:let{toast:d}=b;return u(a,{type:+!!a.toasts.find(a=>a.id===d.id),toast:d});case 3:let{toastId:e}=b;return{...a,toasts:a.toasts.map(a=>a.id===e||void 0===e?{...a,dismissed:!0,visible:!1}:a)};case 4:return void 0===b.toastId?{...a,toasts:[]}:{...a,toasts:a.toasts.filter(a=>a.id!==b.toastId)};case 5:return{...a,pausedAt:b.time};case 6:let f=b.time-(a.pausedAt||0);return{...a,pausedAt:void 0,toasts:a.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+f}))}}},v=[],w={toasts:[],pausedAt:void 0,settings:{toastLimit:20}},x={},y=(a,b=t)=>{x[b]=u(x[b]||w,a),v.forEach(([a,c])=>{a===b&&c(x[b])})},z=a=>Object.keys(x).forEach(b=>y(a,b)),A=(a=t)=>b=>{y(b,a)},B={blank:4e3,error:4e3,success:2e3,loading:1/0,custom:4e3},C=a=>(b,c)=>{let d,e=((a,b="blank",c)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:b,ariaProps:{role:"status","aria-live":"polite"},message:a,pauseDuration:0,...c,id:(null==c?void 0:c.id)||r()}))(b,a,c);return A(e.toasterId||(d=e.id,Object.keys(x).find(a=>x[a].toasts.some(a=>a.id===d))))({type:2,toast:e}),e.id},D=(a,b)=>C("blank")(a,b);D.error=C("error"),D.success=C("success"),D.loading=C("loading"),D.custom=C("custom"),D.dismiss=(a,b)=>{let c={type:3,toastId:a};b?A(b)(c):z(c)},D.dismissAll=a=>D.dismiss(void 0,a),D.remove=(a,b)=>{let c={type:4,toastId:a};b?A(b)(c):z(c)},D.removeAll=a=>D.remove(void 0,a),D.promise=(a,b,c)=>{let d=D.loading(b.loading,{...c,...null==c?void 0:c.loading});return"function"==typeof a&&(a=a()),a.then(a=>{let e=b.success?q(b.success,a):void 0;return e?D.success(e,{id:d,...c,...null==c?void 0:c.success}):D.dismiss(d),a}).catch(a=>{let e=b.error?q(b.error,a):void 0;e?D.error(e,{id:d,...c,...null==c?void 0:c.error}):D.dismiss(d)}),a};var E=1e3,F=o`
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
`,Y=({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:e,children:f,toasterId:g,containerStyle:h,containerClassName:i})=>{let{toasts:j,handlers:k}=((a,b="default")=>{let{toasts:d,pausedAt:e}=((a={},b=t)=>{let[d,e]=(0,c.useState)(x[b]||w),f=(0,c.useRef)(x[b]);(0,c.useEffect)(()=>(f.current!==x[b]&&e(x[b]),v.push([b,e]),()=>{let a=v.findIndex(([a])=>a===b);a>-1&&v.splice(a,1)}),[b]);let g=d.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||B[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...d,toasts:g}})(a,b),f=(0,c.useRef)(new Map).current,g=(0,c.useCallback)((a,b=E)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,c.useEffect)(()=>{if(e)return;let a=Date.now(),c=d.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&D.dismiss(c.id);return}return setTimeout(()=>D.dismiss(c.id,b),d)});return()=>{c.forEach(a=>a&&clearTimeout(a))}},[d,e,b]);let h=(0,c.useCallback)(A(b),[b]),i=(0,c.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,c.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,c.useCallback)(()=>{e&&h({type:6,time:Date.now()})},[e,h]),l=(0,c.useCallback)((a,b)=>{let{reverseOrder:c=!1,gutter:e=8,defaultPosition:f}=b||{},g=d.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...c?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[d]);return(0,c.useEffect)(()=>{d.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[d,g]),{toasts:d,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,g);return c.createElement("div",{"data-rht-toaster":g||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...h},className:i,onMouseEnter:k.startPause,onMouseLeave:k.endPause},j.map(d=>{let g=d.position||b,h=((a,b)=>{let c=a.includes("top"),d=a.includes("center")?{justifyContent:"center"}:a.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:s()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${b*(c?1:-1)}px)`,...c?{top:0}:{bottom:0},...d}})(g,k.calculateOffset(d,{reverseOrder:a,gutter:e,defaultPosition:b}));return c.createElement(W,{id:d.id,key:d.id,onHeightUpdate:k.updateHeight,className:d.visible?X:"",style:h},"custom"===d.type?q(d.message,d):f?f(d):c.createElement(V,{toast:d,position:g}))}))},Z=D},47837,a=>{"use strict";a.s(["default",()=>e]);var b=a.i(87924),c=a.i(72131),d=a.i(38246);let e=({isOpen:a,onClose:e,onVerify:f,phoneNumber:g,onResend:h,isLoading:i=!1})=>{let[j,k]=(0,c.useState)(["","","","","",""]),[l,m]=(0,c.useState)(""),[n,o]=(0,c.useState)(60),[p,q]=(0,c.useState)(!1),[r,s]=(0,c.useState)(!1),t=(0,c.useRef)([]);(0,c.useEffect)(()=>{a&&(k(["","","","","",""]),m(""),o(60),q(!1),s(!1),t.current[0]&&t.current[0].focus())},[a]),(0,c.useEffect)(()=>{let b;return n>0&&a&&(b=setTimeout(()=>o(n-1),1e3)),()=>clearTimeout(b)},[n,a]);let u=async(a=null)=>{let b=a||j.join("");if(6!==b.length)return void m("Please enter a valid code");q(!0),m("");try{await f(b),s(!0),console.log("OTP verification successful, token should be saved locally")}catch(a){console.error("OTP verification failed:",a),m(a.message||"Invalid verification code. Please try again.")}finally{q(!1)}},v=a=>{let b=Math.floor(a/60);return`${b}:${(a%60).toString().padStart(2,"0")}`};return a?(0,b.jsx)("div",{className:"fixed inset-0 z-50 bg-black/50  flex items-center justify-center p-4",children:(0,b.jsxs)("div",{className:"bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 relative border border-gray-100",children:[(0,b.jsx)("button",{onClick:e,className:"absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors",children:(0,b.jsx)("svg",{className:"w-6 h-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})}),(0,b.jsxs)("div",{className:"p-8",children:[(0,b.jsx)("h2",{className:"text-2xl font-bold text-center text-gray-900 mb-2",style:{fontFamily:"Inria Serif, serif"},children:"Almost done"}),(0,b.jsx)("p",{className:"text-gray-600 text-center mb-8",style:{fontFamily:"Open Sans, sans-serif"},children:"Please type the code we sent you in your email"}),(0,b.jsx)("div",{className:"flex justify-center gap-3 mb-6",children:j.map((a,c)=>(0,b.jsx)("input",{ref:a=>t.current[c]=a,type:"text",inputMode:"numeric",maxLength:"1",value:a,onChange:a=>((a,b)=>{if(!/^\d*$/.test(b))return;let c=[...j];c[a]=b,k(c),m(""),b&&a<5&&t.current[a+1]?.focus(),c.every(a=>""!==a)&&6===c.join("").length&&u(c.join(""))})(c,a.target.value),onKeyDown:a=>((a,b)=>{"Backspace"===b.key&&!j[a]&&a>0&&t.current[a-1]?.focus()})(c,a),className:`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${l?"border-red-500":"border-gray-300 focus:border-green-500"}`,style:{fontFamily:"Open Sans, sans-serif"}},c))}),r&&(0,b.jsxs)("div",{className:"text-center mb-4",children:[(0,b.jsx)("div",{className:"inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2",children:(0,b.jsx)("svg",{className:"w-6 h-6 text-green-600",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M5 13l4 4L19 7"})})}),(0,b.jsx)("p",{className:"text-green-600 text-sm font-medium",style:{fontFamily:"Open Sans, sans-serif"},children:"Verification successful! Redirecting..."})]}),l&&(0,b.jsx)("p",{className:"text-red-500 text-sm text-center mb-4",style:{fontFamily:"Open Sans, sans-serif"},children:l}),(0,b.jsx)("button",{onClick:()=>u(),disabled:p||i||j.some(a=>!a)||r,className:`w-full py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${r?"bg-green-600 text-white cursor-default":"bg-green-900 text-white hover:bg-green-800 focus:ring-green-500"}`,style:{fontFamily:"Open Sans, sans-serif"},children:r?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"}),"Success! Redirecting..."]}):p||i?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)("div",{className:"w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"}),"Verifying..."]}):"Verify"}),(0,b.jsx)("div",{className:"text-center mt-4",children:(0,b.jsx)("p",{className:"text-gray-500 text-sm",style:{fontFamily:"Open Sans, sans-serif"},children:v(n)})}),(0,b.jsx)("div",{className:"text-center mt-4",children:0===n?(0,b.jsx)("button",{onClick:()=>{o(60),m(""),h()},className:"text-green-600 hover:text-green-700 font-medium text-sm underline transition-colors",style:{fontFamily:"Open Sans, sans-serif"},children:"Resend OTP"}):(0,b.jsxs)("p",{className:"text-gray-400 text-sm",style:{fontFamily:"Open Sans, sans-serif"},children:["Resend OTP in ",v(n)]})}),(0,b.jsx)("div",{className:"text-center mt-6",children:(0,b.jsxs)("p",{className:"text-gray-500 text-sm",style:{fontFamily:"Open Sans, sans-serif"},children:["Can't access to your email?"," ",(0,b.jsx)(d.default,{href:"/contact",target:"_blank",className:"text-green-600 hover:text-green-700 font-medium",style:{fontFamily:"Open Sans, sans-serif"},children:"Contact support"})]})})]})]})}):null}},3987,a=>{"use strict";a.s(["default",()=>i]);var b=a.i(87924),c=a.i(72131),d=a.i(38246),e=a.i(50944),f=a.i(47837),g=a.i(29130),h=a.i(6704);let i=()=>{let a=(0,e.useRouter)(),i=(0,g.useAuth)(),[j,k]=(0,c.useState)({phoneNumber:"",rememberMe:!1}),[l,m]=(0,c.useState)(!1),[n,o]=(0,c.useState)(!1),[p,q]=(0,c.useState)(!1),[r,s]=(0,c.useState)(""),t=async a=>{if(a.preventDefault(),j.phoneNumber?!!/^\d{10}$/.test(j.phoneNumber.replace(/\D/g,""))||(h.default.error("Please enter a valid 10-digit phone number"),!1):(h.default.error("Phone number is required"),!1)){m(!0);try{let a=await fetch("https://broker-adda-be.algofolks.com/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:j.phoneNumber})}),b=await a.json();if(a.ok&&(void 0===b.success||!0===b.success))h.default.success("OTP sent successfully! Please verify your phone number."),s(j.phoneNumber),q(!0);else{let b="Login failed";try{let c=await a.json();console.error("Login API Error:",c),console.log("API Error Data:",c),c.message?(b=c.message,console.log("Using API message:",b)):c.error&&"string"==typeof c.error?(b=c.error,console.log("Using API error:",b)):b=c.error&&c.error.includes("E11000")?"This phone number is already registered. Please use a different number.":c.error&&c.error.includes("validation")?"Please check your phone number and try again.":400===a.status?"Invalid phone number. Please check and try again.":401===a.status?"Authentication failed. Please try again.":404===a.status?"Phone number not found. Please sign up first or check your number.":a.status>=500?"Server error. Please try again later.":`Login failed (${a.status})`}catch(c){console.error("Error parsing login response:",c),b=400===a.status?"Invalid phone number. Please check and try again.":401===a.status?"Authentication failed. Please try again.":404===a.status?"Phone number not found. Please sign up first or check your number.":a.status>=500?"Server error. Please try again later.":`Login failed (${a.status})`}h.default.error(b)}}catch(a){console.error("Login network error:",a),"TypeError"===a.name&&a.message.includes("fetch")?h.default.error("Network error. Please check your connection and try again."):h.default.error("Login failed. Please try again.")}finally{m(!1)}}},u=a=>{"Number"===a&&o(!0)},v=async b=>{try{console.log("Starting OTP verification for phone:",r);let c=await fetch("https://broker-adda-be.algofolks.com/api/auth/verify-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:r,otp:b})});if(c.ok){let b=await c.json();if(console.log("OTP verification response:",b),b.success){let c=b?.role||b?.user?.role||b?.data?.role||"",d=b?.token||b?.data?.token,e=b?.phone||b?.data?.phone||r,f=b?.userId||b?.data?.userId;if(!d)throw Error("No authentication token received from server");try{let a=d.split(".");if(3!==a.length)throw Error("Invalid token format");let b=JSON.parse(atob(a[1]));console.log("Token payload:",b);let c=Math.floor(Date.now()/1e3);if(b.exp&&b.exp<c)throw Error("Token has expired")}catch(a){throw console.error("Token validation failed:",a),Error("Invalid authentication token received")}if(console.log("Saving user data to localStorage:",{token:!!d,phone:e,role:c,userId:f}),i.login({token:d,phone:e,role:c,userId:f}),!localStorage.getItem("token"))throw Error("Failed to save authentication token");console.log("Token saved successfully, redirecting to dashboard"),h.default.success(b.message||"Phone number verified successfully!"),q(!1),a.push("/dashboard")}else throw Error(b.message||"Invalid OTP")}else{let a=await c.json();throw console.error("OTP verification failed:",a),Error(a.message||"Invalid OTP")}}catch(a){throw console.error("OTP verification error:",a),a}},w=async()=>{try{(await fetch("https://broker-adda-be.algofolks.com/api/auth/resend-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:r})})).ok?h.default.success("OTP resent successfully!"):h.default.error("Failed to resend OTP")}catch(a){h.default.error("Network error. Please try again.")}};return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(h.Toaster,{position:"top-right",toastOptions:{duration:4e3,style:{background:"#363636",color:"#fff"},success:{duration:3e3,iconTheme:{primary:"#4ade80",secondary:"#fff"}},error:{duration:4e3,iconTheme:{primary:"#ef4444",secondary:"#fff"}}}}),(0,b.jsxs)("div",{className:"min-h-screen flex",children:[(0,b.jsx)("div",{className:"hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-8",children:(0,b.jsxs)("div",{className:"relative w-full max-w-2xl",children:[(0,b.jsx)("img",{src:"/images/signup.png",alt:"Login Illustration",className:"w-full h-auto object-contain",onError:a=>{a.target.style.display="none",a.target.nextElementSibling.style.display="block"}}),(0,b.jsx)("div",{className:"hidden w-full h-96 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center",children:(0,b.jsxs)("div",{className:"text-center",children:[(0,b.jsx)("div",{className:"w-32 h-32 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4",children:(0,b.jsx)("svg",{className:"w-16 h-16 text-white",fill:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{d:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"})})}),(0,b.jsx)("p",{className:"text-gray-500",style:{fontFamily:"Open Sans, sans-serif"},children:"Login Illustration"})]})})]})}),(0,b.jsx)("div",{className:"flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-white",children:(0,b.jsx)("div",{className:"w-full max-w-xl",children:(0,b.jsx)("div",{className:"bg-white rounded-2xl shadow-lg border border-gray-200 p-12",children:n?(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("div",{className:"text-left mb-14",children:[(0,b.jsx)("button",{onClick:()=>{o(!1)},className:"mb-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer",children:"← Back"}),(0,b.jsxs)("h1",{className:"text-3xl font-bold text-gray-900 mb-2 flex items-left justify-left gap-2",style:{fontFamily:"Inria Serif, serif"},children:["Welcome back",(0,b.jsx)("span",{className:"text-2xl",children:"👋"})]}),(0,b.jsx)("p",{className:"text-gray-600",style:{fontFamily:"Inria Serif, serif"},children:"Log in your account"})]}),(0,b.jsxs)("form",{onSubmit:t,className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{htmlFor:"phoneNumber",className:"block text-sm font-medium text-gray-700 mb-2",children:"What is your phone number?"}),(0,b.jsxs)("div",{className:"relative",children:[(0,b.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,b.jsx)("svg",{className:"h-5 w-5 text-gray-400",fill:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{d:"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"})})}),(0,b.jsx)("input",{type:"tel",id:"phoneNumber",name:"phoneNumber",value:j.phoneNumber,onChange:a=>{let{name:b,value:c,type:d,checked:e}=a.target;if("phoneNumber"===b){let a=c.replace(/\D/g,"").slice(0,10);k(c=>({...c,[b]:a}))}else k(a=>({...a,[b]:"checkbox"===d?e:c}))},maxLength:10,autoComplete:"off",autoCorrect:"off",autoCapitalize:"none",spellCheck:!1,className:"w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-gray-50",placeholder:"Enter your 10-digit phone number"})]})]}),(0,b.jsx)("button",{type:"submit",disabled:l,className:"w-full bg-green-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",children:l?"Signing in...":"Sign In"})]}),(0,b.jsx)("div",{className:"mt-6 text-center",children:(0,b.jsxs)("p",{className:"text-gray-600",children:["Don't have an account?"," ",(0,b.jsx)(d.default,{href:"/signup",className:"text-green-900 hover:text-green-800 font-medium",children:"Sign up"})]})})]}):(0,b.jsxs)(b.Fragment,{children:[(0,b.jsxs)("div",{className:"text-left mb-14",children:[(0,b.jsxs)("h1",{className:"text-4xl font-bold text-gray-900 mb-3 flex items-left justify-left gap-3",style:{fontFamily:"Inria Serif, serif"},children:["Welcome back",(0,b.jsx)("span",{className:"text-3xl",children:"👋"})]}),(0,b.jsx)("p",{className:"text-lg text-gray-600",style:{fontFamily:"Inria Serif, serif"},children:"Log in your account"})]}),(0,b.jsxs)("div",{className:"space-y-4 mb-6",children:[(0,b.jsxs)("button",{onClick:()=>u("Number"),className:"w-full flex items-center justify-center px-4 py-3 bg-green-900 text-white rounded-lg font-medium text-base hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-md cursor-pointer",style:{fontFamily:"Open Sans, sans-serif"},children:[(0,b.jsx)("svg",{className:"w-5 h-5 mr-3",fill:"currentColor",viewBox:"0 0 24 24",children:(0,b.jsx)("path",{d:"M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"})}),"Log in with Number"]}),(0,b.jsxs)("button",{onClick:()=>u("Google"),className:"w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium text-base hover:bg-gray-50 focus:outline-none transition-all duration-200 cursor-pointer",style:{fontFamily:"Open Sans, sans-serif",borderColor:"#ea4335",color:"#ea4335"},children:[(0,b.jsx)("div",{className:"w-5 h-5 mr-3 flex items-center justify-center text-xl font-bold",style:{color:"#ea4335"},children:"G"}),"Log in with Google"]}),(0,b.jsxs)("button",{onClick:()=>u("Facebook"),className:"w-full flex items-center justify-center px-4 py-3 border rounded-lg font-medium text-base hover:bg-gray-50 focus:outline-none transition-all duration-200 cursor-pointer",style:{fontFamily:"Open Sans, sans-serif",borderColor:"#1877f2",color:"#1877f2"},children:[(0,b.jsx)("div",{className:"w-5 h-5 mr-3 flex items-center justify-center text-xl font-bold",style:{color:"#1877f2"},children:"f"}),"Log in with Facebook"]})]}),(0,b.jsx)("div",{className:"mt-12 text-center",children:(0,b.jsxs)("p",{className:"text-base text-gray-600",style:{fontFamily:"Open Sans, sans-serif"},children:["Don't have an account?"," ",(0,b.jsx)(d.default,{href:"/signup",className:"text-green-700 hover:text-green-900 font-bold",style:{fontFamily:"Open Sans, sans-serif"},children:"Sign up"})]})})]})})})})]}),(0,b.jsx)(f.default,{isOpen:p,onClose:()=>q(!1),onVerify:v,onResend:w,phoneNumber:r,isLoading:l})]})}}];

//# sourceMappingURL=_1f8dcb36._.js.map