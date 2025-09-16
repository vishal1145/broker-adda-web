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
`,Y=({reverseOrder:a,position:b="top-center",toastOptions:d,gutter:e,children:f,toasterId:g,containerStyle:h,containerClassName:i})=>{let{toasts:j,handlers:k}=((a,b="default")=>{let{toasts:d,pausedAt:e}=((a={},b=t)=>{let[d,e]=(0,c.useState)(x[b]||w),f=(0,c.useRef)(x[b]);(0,c.useEffect)(()=>(f.current!==x[b]&&e(x[b]),v.push([b,e]),()=>{let a=v.findIndex(([a])=>a===b);a>-1&&v.splice(a,1)}),[b]);let g=d.toasts.map(b=>{var c,d,e;return{...a,...a[b.type],...b,removeDelay:b.removeDelay||(null==(c=a[b.type])?void 0:c.removeDelay)||(null==a?void 0:a.removeDelay),duration:b.duration||(null==(d=a[b.type])?void 0:d.duration)||(null==a?void 0:a.duration)||B[b.type],style:{...a.style,...null==(e=a[b.type])?void 0:e.style,...b.style}}});return{...d,toasts:g}})(a,b),f=(0,c.useRef)(new Map).current,g=(0,c.useCallback)((a,b=E)=>{if(f.has(a))return;let c=setTimeout(()=>{f.delete(a),h({type:4,toastId:a})},b);f.set(a,c)},[]);(0,c.useEffect)(()=>{if(e)return;let a=Date.now(),c=d.map(c=>{if(c.duration===1/0)return;let d=(c.duration||0)+c.pauseDuration-(a-c.createdAt);if(d<0){c.visible&&D.dismiss(c.id);return}return setTimeout(()=>D.dismiss(c.id,b),d)});return()=>{c.forEach(a=>a&&clearTimeout(a))}},[d,e,b]);let h=(0,c.useCallback)(A(b),[b]),i=(0,c.useCallback)(()=>{h({type:5,time:Date.now()})},[h]),j=(0,c.useCallback)((a,b)=>{h({type:1,toast:{id:a,height:b}})},[h]),k=(0,c.useCallback)(()=>{e&&h({type:6,time:Date.now()})},[e,h]),l=(0,c.useCallback)((a,b)=>{let{reverseOrder:c=!1,gutter:e=8,defaultPosition:f}=b||{},g=d.filter(b=>(b.position||f)===(a.position||f)&&b.height),h=g.findIndex(b=>b.id===a.id),i=g.filter((a,b)=>b<h&&a.visible).length;return g.filter(a=>a.visible).slice(...c?[i+1]:[0,i]).reduce((a,b)=>a+(b.height||0)+e,0)},[d]);return(0,c.useEffect)(()=>{d.forEach(a=>{if(a.dismissed)g(a.id,a.removeDelay);else{let b=f.get(a.id);b&&(clearTimeout(b),f.delete(a.id))}})},[d,g]),{toasts:d,handlers:{updateHeight:j,startPause:i,endPause:k,calculateOffset:l}}})(d,g);return c.createElement("div",{"data-rht-toaster":g||"",style:{position:"fixed",zIndex:9999,top:16,left:16,right:16,bottom:16,pointerEvents:"none",...h},className:i,onMouseEnter:k.startPause,onMouseLeave:k.endPause},j.map(d=>{let g=d.position||b,h=((a,b)=>{let c=a.includes("top"),d=a.includes("center")?{justifyContent:"center"}:a.includes("right")?{justifyContent:"flex-end"}:{};return{left:0,right:0,display:"flex",position:"absolute",transition:s()?void 0:"all 230ms cubic-bezier(.21,1.02,.73,1)",transform:`translateY(${b*(c?1:-1)}px)`,...c?{top:0}:{bottom:0},...d}})(g,k.calculateOffset(d,{reverseOrder:a,gutter:e,defaultPosition:b}));return c.createElement(W,{id:d.id,key:d.id,onHeightUpdate:k.updateHeight,className:d.visible?X:"",style:h},"custom"===d.type?q(d.message,d):f?f(d):c.createElement(V,{toast:d,position:g}))}))},Z=D},90975,a=>{"use strict";a.s(["default",()=>h]);var b=a.i(87924),c=a.i(72131),d=a.i(38246),e=a.i(50944),f=a.i(6704),g=a.i(29130);let h=()=>{let a=(0,e.useRouter)(),h=(0,e.useSearchParams)(),{login:i}=(0,g.useAuth)(),[j,k]=(0,c.useState)(["","","","","",""]),[l,m]=(0,c.useState)(!1),[n,o]=(0,c.useState)(0),p=(0,c.useRef)([]),q=h.get("phone");(0,c.useEffect)(()=>{p.current[0]&&p.current[0].focus()},[]),(0,c.useEffect)(()=>{let a;return n>0&&(a=setTimeout(()=>o(n-1),1e3)),()=>clearTimeout(a)},[n]);let r=a=>{a.preventDefault();let b=a.clipboardData.getData("text").replace(/\D/g,"").slice(0,6),c=[...j];for(let a=0;a<b.length&&a<6;a++)c[a]=b[a];k(c);let d=c.findIndex((a,b)=>!a&&b<6);p.current[-1!==d?d:5]?.focus()},s=async b=>{if(b.preventDefault(),(()=>{let a=j.join("");return 6!==a.length?(f.default.error("Please enter the complete 6-digit code"),!1):!!/^\d{6}$/.test(a)||(f.default.error("Code must contain only numbers"),!1)})()){m(!0);try{let b=j.join(""),c="https://broker-adda-be.algofolks.com/api/auth/verify-otp",d=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:h.get("phone"),otp:b})}),e=await d.json().catch(()=>({}));if(d.ok&&(void 0===e.success||!0===e.success)){let b=e?.role||e?.user?.role||e?.data?.role||"",c=e?.token||e?.data?.token,d=e?.phone||e?.data?.phone||h.get("phone");i({token:c,phone:d,role:b,userId:e?.userId||e?.data?.userId}),f.default.success("Verification successful! Redirecting..."),"broker"===b?a.push("/myaccount"):a.push("/myaccount-customer")}else console.error("Verify OTP failed:",{url:c,status:d.status,data:e}),f.default.error(e.message||`Verification failed (${d.status})`)}catch(a){console.error("Verify OTP network error:",a),f.default.error("Verification failed. Please try again.")}finally{m(!1)}}},t=async()=>{o(60);try{let a=await fetch("https://broker-adda-be.algofolks.com/api/auth/resend-otp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:h.get("phone")})});if(a.ok){let b=await a.json();f.default.success("Verification code sent successfully!"),console.log("Resend OTP successful:",b)}else{let b=await a.json().catch(()=>({message:"Unknown error"}));f.default.error(b.message||`Failed to resend code (${a.status})`),console.error("Resend OTP failed:",b)}}catch(a){console.error("Resend OTP network error:",a),f.default.error("Network error. Please try again.")}};return(0,b.jsxs)(b.Fragment,{children:[(0,b.jsx)(f.Toaster,{position:"top-right",toastOptions:{duration:4e3,style:{background:"#363636",color:"#fff"},success:{duration:3e3,iconTheme:{primary:"#4ade80",secondary:"#fff"}},error:{duration:4e3,iconTheme:{primary:"#ef4444",secondary:"#fff"}}}}),(0,b.jsxs)("div",{className:"min-h-screen py-12 flex",children:[(0,b.jsx)("div",{className:"flex-1 flex items-center justify-center px-6 py-12 bg-white",children:(0,b.jsxs)("div",{className:"w-full max-w-md",children:[(0,b.jsxs)("div",{className:"mb-8 ",children:[(0,b.jsx)("div",{className:"text-left mb-4 ",children:(0,b.jsxs)(d.default,{href:"/login",className:"flex items-center gap-2 text-gray-600 hover:text-green-900 font-medium",children:[(0,b.jsx)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:(0,b.jsx)("path",{d:"M15 18L9 12l6-6"})}),"Back to Login"]})}),(0,b.jsx)("h1",{className:"text-3xl font-bold text-gray-900 mb-2",children:"Verify Code"}),(0,b.jsx)("p",{className:"text-gray-600",children:"Please enter the code we just sent to your phone number"}),(0,b.jsx)("p",{className:"text-green-900 font-medium mt-2",children:q})]}),(0,b.jsxs)("form",{onSubmit:s,className:"space-y-6",children:[(0,b.jsxs)("div",{children:[(0,b.jsx)("label",{className:"block text-sm font-medium text-gray-900 mb-4",children:"Code *"}),(0,b.jsx)("div",{className:"flex  space-x-3",children:j.map((a,c)=>(0,b.jsx)("input",{ref:a=>p.current[c]=a,type:"text",inputMode:"numeric",maxLength:"1",value:a,onChange:a=>((a,b)=>{if(b.length>1)return;let c=[...j];c[a]=b,k(c),b&&a<5&&p.current[a+1]?.focus()})(c,a.target.value),onKeyDown:a=>((a,b)=>{"Backspace"===b.key&&!j[a]&&a>0&&p.current[a-1]?.focus()})(c,a),onPaste:r,className:"w-12 h-12 text-center text-xl font-bold border-2 border-gray-300  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"},c))})]}),(0,b.jsx)("button",{type:"submit",disabled:l,className:"w-full bg-green-900 text-white py-3 px-4 rounded-full font-medium hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",children:l?"Verifying...":"Verify"}),(0,b.jsx)("div",{className:"text-center",children:(0,b.jsxs)("p",{className:"text-gray-600",children:["Didn't receive code?"," ",n>0?(0,b.jsxs)("span",{className:"text-gray-400",children:["Resend in ",n,"s"]}):(0,b.jsx)("button",{type:"button",onClick:t,className:"text-green-900 hover:text-green-800 font-medium underline",children:"Resend OTP"})]})})]})]})}),(0,b.jsx)("div",{className:"hidden lg:flex lg:flex-1 relative",children:(0,b.jsxs)("div",{className:"w-[650px] h-[800px] rounded-2xl overflow-hidden relative",children:[(0,b.jsx)("img",{src:"/images/realestate.png",alt:"Modern Interior",className:"w-full h-full object-cover",onError:a=>{a.target.style.display="none",a.target.nextElementSibling.style.display="block"}}),(0,b.jsx)("div",{className:"absolute bottom-20 left-6 right-4",children:(0,b.jsxs)("div",{className:" bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6 w-[600px] shadow-2xl",children:[(0,b.jsx)("p",{className:"text-white text-base leading-relaxed mb-4",children:'"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore."'}),(0,b.jsxs)("div",{className:"space-y-1",children:[(0,b.jsx)("h4",{className:"text-white font-semibold text-base",children:"Annette Black"}),(0,b.jsx)("p",{className:"text-white text-sm",children:"Architecture"})]})]})}),(0,b.jsxs)("div",{className:"absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2",children:[(0,b.jsx)("div",{className:"w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"}),(0,b.jsx)("div",{className:"w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"}),(0,b.jsx)("div",{className:"w-32 h-2 bg-orange-400 rounded-full"}),(0,b.jsx)("div",{className:"w-32 h-2 bg-white bg-opacity-20 backdrop-blur-md rounded-full"})]})]})})]})]})}}];

//# sourceMappingURL=_2547cf4c._.js.map