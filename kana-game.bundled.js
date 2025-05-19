/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$2=globalThis,e$4=t$2.ShadowRoot&&(void 0===t$2.ShadyCSS||t$2.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s$2=Symbol(),o$4=new WeakMap;let n$3 = class n{constructor(t,e,o){if(this._$cssResult$=true,o!==s$2)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e;}get styleSheet(){let t=this.o;const s=this.t;if(e$4&&void 0===t){const e=void 0!==s&&1===s.length;e&&(t=o$4.get(s)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),e&&o$4.set(s,t));}return t}toString(){return this.cssText}};const r$3=t=>new n$3("string"==typeof t?t:t+"",void 0,s$2),i$3=(t,...e)=>{const o=1===t.length?t[0]:e.reduce(((e,s,o)=>e+(t=>{if(true===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+t[o+1]),t[0]);return new n$3(o,t,s$2)},S$1=(s,o)=>{if(e$4)s.adoptedStyleSheets=o.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const e of o){const o=document.createElement("style"),n=t$2.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=e.cssText,s.appendChild(o);}},c$2=e$4?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const s of t.cssRules)e+=s.cssText;return r$3(e)})(t):t;

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:i$2,defineProperty:e$3,getOwnPropertyDescriptor:h$1,getOwnPropertyNames:r$2,getOwnPropertySymbols:o$3,getPrototypeOf:n$2}=Object,a$1=globalThis,c$1=a$1.trustedTypes,l$1=c$1?c$1.emptyScript:"",p$1=a$1.reactiveElementPolyfillSupport,d$1=(t,s)=>t,u$1={toAttribute(t,s){switch(s){case Boolean:t=t?l$1:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t);}return t},fromAttribute(t,s){let i=t;switch(s){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t);}catch(t){i=null;}}return i}},f$1=(t,s)=>!i$2(t,s),b={attribute:true,type:String,converter:u$1,reflect:false,useDefault:false,hasChanged:f$1};Symbol.metadata??=Symbol("metadata"),a$1.litPropertyMetadata??=new WeakMap;let y$1 = class y extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t);}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,s=b){if(s.state&&(s.attribute=false),this._$Ei(),this.prototype.hasOwnProperty(t)&&((s=Object.create(s)).wrapped=true),this.elementProperties.set(t,s),!s.noAccessor){const i=Symbol(),h=this.getPropertyDescriptor(t,i,s);void 0!==h&&e$3(this.prototype,t,h);}}static getPropertyDescriptor(t,s,i){const{get:e,set:r}=h$1(this.prototype,t)??{get(){return this[s]},set(t){this[s]=t;}};return {get:e,set(s){const h=e?.call(this);r?.call(this,s),this.requestUpdate(t,h,i);},configurable:true,enumerable:true}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(d$1("elementProperties")))return;const t=n$2(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties);}static finalize(){if(this.hasOwnProperty(d$1("finalized")))return;if(this.finalized=true,this._$Ei(),this.hasOwnProperty(d$1("properties"))){const t=this.properties,s=[...r$2(t),...o$3(t)];for(const i of s)this.createProperty(i,t[i]);}const t=this[Symbol.metadata];if(null!==t){const s=litPropertyMetadata.get(t);if(void 0!==s)for(const[t,i]of s)this.elementProperties.set(t,i);}this._$Eh=new Map;for(const[t,s]of this.elementProperties){const i=this._$Eu(t,s);void 0!==i&&this._$Eh.set(i,t);}this.elementStyles=this.finalizeStyles(this.styles);}static finalizeStyles(s){const i=[];if(Array.isArray(s)){const e=new Set(s.flat(1/0).reverse());for(const s of e)i.unshift(c$2(s));}else void 0!==s&&i.push(c$2(s));return i}static _$Eu(t,s){const i=s.attribute;return  false===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=false,this.hasUpdated=false,this._$Em=null,this._$Ev();}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)));}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.();}removeController(t){this._$EO?.delete(t);}_$E_(){const t=new Map,s=this.constructor.elementProperties;for(const i of s.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t);}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return S$1(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(true),this._$EO?.forEach((t=>t.hostConnected?.()));}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()));}attributeChangedCallback(t,s,i){this._$AK(t,i);}_$ET(t,s){const i=this.constructor.elementProperties.get(t),e=this.constructor._$Eu(t,i);if(void 0!==e&&true===i.reflect){const h=(void 0!==i.converter?.toAttribute?i.converter:u$1).toAttribute(s,i.type);this._$Em=t,null==h?this.removeAttribute(e):this.setAttribute(e,h),this._$Em=null;}}_$AK(t,s){const i=this.constructor,e=i._$Eh.get(t);if(void 0!==e&&this._$Em!==e){const t=i.getPropertyOptions(e),h="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:u$1;this._$Em=e,this[e]=h.fromAttribute(s,t.type)??this._$Ej?.get(e)??null,this._$Em=null;}}requestUpdate(t,s,i){if(void 0!==t){const e=this.constructor,h=this[t];if(i??=e.getPropertyOptions(t),!((i.hasChanged??f$1)(h,s)||i.useDefault&&i.reflect&&h===this._$Ej?.get(t)&&!this.hasAttribute(e._$Eu(t,i))))return;this.C(t,s,i);} false===this.isUpdatePending&&(this._$ES=this._$EP());}C(t,s,{useDefault:i,reflect:e,wrapped:h},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??s??this[t]),true!==h||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(s=void 0),this._$AL.set(t,s)),true===e&&this._$Em!==t&&(this._$Eq??=new Set).add(t));}async _$EP(){this.isUpdatePending=true;try{await this._$ES;}catch(t){Promise.reject(t);}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,s]of this._$Ep)this[t]=s;this._$Ep=void 0;}const t=this.constructor.elementProperties;if(t.size>0)for(const[s,i]of t){const{wrapped:t}=i,e=this[s];true!==t||this._$AL.has(s)||void 0===e||this.C(s,void 0,i,e);}}let t=false;const s=this._$AL;try{t=this.shouldUpdate(s),t?(this.willUpdate(s),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(s)):this._$EM();}catch(s){throw t=false,this._$EM(),s}t&&this._$AE(s);}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=true,this.firstUpdated(t)),this.updated(t);}_$EM(){this._$AL=new Map,this.isUpdatePending=false;}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return  true}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM();}updated(t){}firstUpdated(t){}};y$1.elementStyles=[],y$1.shadowRootOptions={mode:"open"},y$1[d$1("elementProperties")]=new Map,y$1[d$1("finalized")]=new Map,p$1?.({ReactiveElement:y$1}),(a$1.reactiveElementVersions??=[]).push("2.1.0");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t$1=globalThis,i$1=t$1.trustedTypes,s$1=i$1?i$1.createPolicy("lit-html",{createHTML:t=>t}):void 0,e$2="$lit$",h=`lit$${Math.random().toFixed(9).slice(2)}$`,o$2="?"+h,n$1=`<${o$2}>`,r$1=document,l=()=>r$1.createComment(""),c=t=>null===t||"object"!=typeof t&&"function"!=typeof t,a=Array.isArray,u=t=>a(t)||"function"==typeof t?.[Symbol.iterator],d="[ \t\n\f\r]",f=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,v=/-->/g,_=/>/g,m=RegExp(`>|${d}(?:([^\\s"'>=/]+)(${d}*=${d}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),p=/'/g,g=/"/g,$=/^(?:script|style|textarea|title)$/i,y=t=>(i,...s)=>({_$litType$:t,strings:i,values:s}),x=y(1),T=Symbol.for("lit-noChange"),E=Symbol.for("lit-nothing"),A=new WeakMap,C=r$1.createTreeWalker(r$1,129);function P(t,i){if(!a(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==s$1?s$1.createHTML(i):i}const V=(t,i)=>{const s=t.length-1,o=[];let r,l=2===i?"<svg>":3===i?"<math>":"",c=f;for(let i=0;i<s;i++){const s=t[i];let a,u,d=-1,y=0;for(;y<s.length&&(c.lastIndex=y,u=c.exec(s),null!==u);)y=c.lastIndex,c===f?"!--"===u[1]?c=v:void 0!==u[1]?c=_:void 0!==u[2]?($.test(u[2])&&(r=RegExp("</"+u[2],"g")),c=m):void 0!==u[3]&&(c=m):c===m?">"===u[0]?(c=r??f,d=-1):void 0===u[1]?d=-2:(d=c.lastIndex-u[2].length,a=u[1],c=void 0===u[3]?m:'"'===u[3]?g:p):c===g||c===p?c=m:c===v||c===_?c=f:(c=m,r=void 0);const x=c===m&&t[i+1].startsWith("/>")?" ":"";l+=c===f?s+n$1:d>=0?(o.push(a),s.slice(0,d)+e$2+s.slice(d)+h+x):s+h+(-2===d?i:x);}return [P(t,l+(t[s]||"<?>")+(2===i?"</svg>":3===i?"</math>":"")),o]};class N{constructor({strings:t,_$litType$:s},n){let r;this.parts=[];let c=0,a=0;const u=t.length-1,d=this.parts,[f,v]=V(t,s);if(this.el=N.createElement(f,n),C.currentNode=this.el.content,2===s||3===s){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes);}for(;null!==(r=C.nextNode())&&d.length<u;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(e$2)){const i=v[a++],s=r.getAttribute(t).split(h),e=/([.?@])?(.*)/.exec(i);d.push({type:1,index:c,name:e[2],strings:s,ctor:"."===e[1]?H:"?"===e[1]?I:"@"===e[1]?L:k}),r.removeAttribute(t);}else t.startsWith(h)&&(d.push({type:6,index:c}),r.removeAttribute(t));if($.test(r.tagName)){const t=r.textContent.split(h),s=t.length-1;if(s>0){r.textContent=i$1?i$1.emptyScript:"";for(let i=0;i<s;i++)r.append(t[i],l()),C.nextNode(),d.push({type:2,index:++c});r.append(t[s],l());}}}else if(8===r.nodeType)if(r.data===o$2)d.push({type:2,index:c});else {let t=-1;for(;-1!==(t=r.data.indexOf(h,t+1));)d.push({type:7,index:c}),t+=h.length-1;}c++;}}static createElement(t,i){const s=r$1.createElement("template");return s.innerHTML=t,s}}function S(t,i,s=t,e){if(i===T)return i;let h=void 0!==e?s._$Co?.[e]:s._$Cl;const o=c(i)?void 0:i._$litDirective$;return h?.constructor!==o&&(h?._$AO?.(false),void 0===o?h=void 0:(h=new o(t),h._$AT(t,s,e)),void 0!==e?(s._$Co??=[])[e]=h:s._$Cl=h),void 0!==h&&(i=S(t,h._$AS(t,i.values),h,e)),i}class M{constructor(t,i){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=i;}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:i},parts:s}=this._$AD,e=(t?.creationScope??r$1).importNode(i,true);C.currentNode=e;let h=C.nextNode(),o=0,n=0,l=s[0];for(;void 0!==l;){if(o===l.index){let i;2===l.type?i=new R(h,h.nextSibling,this,t):1===l.type?i=new l.ctor(h,l.name,l.strings,this,t):6===l.type&&(i=new z(h,this,t)),this._$AV.push(i),l=s[++n];}o!==l?.index&&(h=C.nextNode(),o++);}return C.currentNode=r$1,e}p(t){let i=0;for(const s of this._$AV) void 0!==s&&(void 0!==s.strings?(s._$AI(t,s,i),i+=s.strings.length-2):s._$AI(t[i])),i++;}}class R{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,i,s,e){this.type=2,this._$AH=E,this._$AN=void 0,this._$AA=t,this._$AB=i,this._$AM=s,this.options=e,this._$Cv=e?.isConnected??true;}get parentNode(){let t=this._$AA.parentNode;const i=this._$AM;return void 0!==i&&11===t?.nodeType&&(t=i.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,i=this){t=S(this,t,i),c(t)?t===E||null==t||""===t?(this._$AH!==E&&this._$AR(),this._$AH=E):t!==this._$AH&&t!==T&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):u(t)?this.k(t):this._(t);}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t));}_(t){this._$AH!==E&&c(this._$AH)?this._$AA.nextSibling.data=t:this.T(r$1.createTextNode(t)),this._$AH=t;}$(t){const{values:i,_$litType$:s}=t,e="number"==typeof s?this._$AC(t):(void 0===s.el&&(s.el=N.createElement(P(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===e)this._$AH.p(i);else {const t=new M(e,this),s=t.u(this.options);t.p(i),this.T(s),this._$AH=t;}}_$AC(t){let i=A.get(t.strings);return void 0===i&&A.set(t.strings,i=new N(t)),i}k(t){a(this._$AH)||(this._$AH=[],this._$AR());const i=this._$AH;let s,e=0;for(const h of t)e===i.length?i.push(s=new R(this.O(l()),this.O(l()),this,this.options)):s=i[e],s._$AI(h),e++;e<i.length&&(this._$AR(s&&s._$AB.nextSibling,e),i.length=e);}_$AR(t=this._$AA.nextSibling,i){for(this._$AP?.(false,true,i);t&&t!==this._$AB;){const i=t.nextSibling;t.remove(),t=i;}}setConnected(t){ void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t));}}class k{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,i,s,e,h){this.type=1,this._$AH=E,this._$AN=void 0,this.element=t,this.name=i,this._$AM=e,this.options=h,s.length>2||""!==s[0]||""!==s[1]?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=E;}_$AI(t,i=this,s,e){const h=this.strings;let o=false;if(void 0===h)t=S(this,t,i,0),o=!c(t)||t!==this._$AH&&t!==T,o&&(this._$AH=t);else {const e=t;let n,r;for(t=h[0],n=0;n<h.length-1;n++)r=S(this,e[s+n],i,n),r===T&&(r=this._$AH[n]),o||=!c(r)||r!==this._$AH[n],r===E?t=E:t!==E&&(t+=(r??"")+h[n+1]),this._$AH[n]=r;}o&&!e&&this.j(t);}j(t){t===E?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"");}}class H extends k{constructor(){super(...arguments),this.type=3;}j(t){this.element[this.name]=t===E?void 0:t;}}class I extends k{constructor(){super(...arguments),this.type=4;}j(t){this.element.toggleAttribute(this.name,!!t&&t!==E);}}class L extends k{constructor(t,i,s,e,h){super(t,i,s,e,h),this.type=5;}_$AI(t,i=this){if((t=S(this,t,i,0)??E)===T)return;const s=this._$AH,e=t===E&&s!==E||t.capture!==s.capture||t.once!==s.once||t.passive!==s.passive,h=t!==E&&(s===E||e);e&&this.element.removeEventListener(this.name,this,s),h&&this.element.addEventListener(this.name,this,t),this._$AH=t;}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t);}}class z{constructor(t,i,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=i,this.options=s;}get _$AU(){return this._$AM._$AU}_$AI(t){S(this,t);}}const j=t$1.litHtmlPolyfillSupport;j?.(N,R),(t$1.litHtmlVersions??=[]).push("3.3.0");const B=(t,i,s)=>{const e=s?.renderBefore??i;let h=e._$litPart$;if(void 0===h){const t=s?.renderBefore??null;e._$litPart$=h=new R(i.insertBefore(l(),t),t,void 0,s??{});}return h._$AI(t),h};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const s=globalThis;class i extends y$1{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0;}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=B(r,this.renderRoot,this.renderOptions);}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(true);}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(false);}render(){return T}}i._$litElement$=true,i["finalized"]=true,s.litElementHydrateSupport?.({LitElement:i});const o$1=s.litElementPolyfillSupport;o$1?.({LitElement:i});(s.litElementVersions??=[]).push("4.2.0");

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=t=>(e,o)=>{ void 0!==o?o.addInitializer((()=>{customElements.define(t,e);})):customElements.define(t,e);};

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const o={attribute:true,type:String,converter:u$1,reflect:false,hasChanged:f$1},r=(t=o,e,r)=>{const{kind:n,metadata:i}=r;let s=globalThis.litPropertyMetadata.get(i);if(void 0===s&&globalThis.litPropertyMetadata.set(i,s=new Map),"setter"===n&&((t=Object.create(t)).wrapped=true),s.set(r.name,t),"accessor"===n){const{name:o}=r;return {set(r){const n=e.get.call(this);e.set.call(this,r),this.requestUpdate(o,n,t);},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===n){const{name:o}=r;return function(r){const n=this[o];e.call(this,r),this.requestUpdate(o,n,t);}}throw Error("Unsupported decorator location: "+n)};function n(t){return (e,o)=>"object"==typeof o?r(t,e,o):((t,e,o)=>{const r=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),r?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const e$1=(e,t,c)=>(c.configurable=true,c.enumerable=true,c);

/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function e(e,r){return (n,s,i)=>{const o=t=>t.renderRoot?.querySelector(e)??null;return e$1(n,s,{get(){return o(this)}})}}

/**
 * Returns detailed type as string (instead of just 'object' for arrays etc)
 * @private
 * @param {any} value js value
 * @returns {String} type of value
 * @example
 * typeOf({}); // 'object'
 * typeOf([]); // 'array'
 * typeOf(function() {}); // 'function'
 * typeOf(/a/); // 'regexp'
 * typeOf(new Date()); // 'date'
 * typeOf(null); // 'null'
 * typeOf(undefined); // 'undefined'
 * typeOf('a'); // 'string'
 * typeOf(1); // 'number'
 * typeOf(true); // 'boolean'
 * typeOf(new Map()); // 'map'
 * typeOf(new Set()); // 'map'
 */
function typeOf(value) {
    if (value === null) {
        return 'null';
    }
    if (value !== Object(value)) {
        return typeof value;
    }
    return {}.toString
        .call(value)
        .slice(8, -1)
        .toLowerCase();
}

/**
 * Checks if input string is empty
 * @param  {String} input text input
 * @return {Boolean} true if no input
 */
function isEmpty(input) {
    if (typeOf(input) !== 'string') {
        return true;
    }
    return !input.length;
}

/**
 * Takes a character and a unicode range. Returns true if the char is in the range.
 * @param  {String}  char  unicode character
 * @param  {Number}  start unicode start range
 * @param  {Number}  end   unicode end range
 * @return {Boolean}
 */
function isCharInRange(char = '', start, end) {
    if (isEmpty(char))
        return false;
    const code = char.charCodeAt(0);
    return start <= code && code <= end;
}
const TO_KANA_METHODS = {
    HIRAGANA: 'toHiragana',
    KATAKANA: 'toKatakana',
};
const ROMANIZATIONS = {
    HEPBURN: 'hepburn',
};
/**
 * Default config for WanaKana, user passed options will be merged with these
 * @type {DefaultOptions}
 * @name DefaultOptions
 * @property {Boolean} [useObsoleteKana=false] - Set to true to use obsolete characters, such as ゐ and ゑ.
 * @example
 * toHiragana('we', { useObsoleteKana: true })
 * // => 'ゑ'
 * @property {Boolean} [passRomaji=false] - Set to true to pass romaji when using mixed syllabaries with toKatakana() or toHiragana()
 * @example
 * toHiragana('only convert the katakana: ヒラガナ', { passRomaji: true })
 * // => "only convert the katakana: ひらがな"
 * @property {Boolean} [convertLongVowelMark=true] - Set to false to prevent conversions of 'ー' to extended vowels with toHiragana()
 * @example
 * toHiragana('ラーメン', { convertLongVowelMark: false });
 * // => 'らーめん
 * @property {Boolean} [upcaseKatakana=false] - Set to true to convert katakana to uppercase using toRomaji()
 * @example
 * toRomaji('ひらがな カタカナ', { upcaseKatakana: true })
 * // => "hiragana KATAKANA"
 * @property {Boolean | 'toHiragana' | 'toKatakana'} [IMEMode=false] - Set to true, 'toHiragana', or 'toKatakana' to handle conversion while it is being typed.
 * @property {'hepburn'} [romanization='hepburn'] - choose toRomaji() romanization map (currently only 'hepburn')
 * @property {Object.<String, String>} [customKanaMapping] - custom map will be merged with default conversion
 * @example
 * toKana('wanakana', { customKanaMapping: { na: 'に', ka: 'Bana' }) };
 * // => 'わにBanaに'
 * @property {Object.<String, String>} [customRomajiMapping] - custom map will be merged with default conversion
 * @example
 * toRomaji('つじぎり', { customRomajiMapping: { じ: 'zi', つ: 'tu', り: 'li' }) };
 * // => 'tuzigili'
 */
const DEFAULT_OPTIONS = {
    useObsoleteKana: false,
    passRomaji: false,
    convertLongVowelMark: true,
    upcaseKatakana: false,
    IMEMode: false,
    romanization: ROMANIZATIONS.HEPBURN,
};
const LATIN_UPPERCASE_START = 0x41;
const LATIN_UPPERCASE_END = 0x5a;
const LOWERCASE_ZENKAKU_START = 0xff41;
const LOWERCASE_ZENKAKU_END = 0xff5a;
const UPPERCASE_ZENKAKU_START = 0xff21;
const UPPERCASE_ZENKAKU_END = 0xff3a;
const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;
const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30fc;
const KANJI_START = 0x4e00;
const KANJI_END = 0x9faf;
const KANJI_ITERATION_MARK = 0x3005; // 々
const PROLONGED_SOUND_MARK = 0x30fc; // ー
const KANA_SLASH_DOT = 0x30fb; // ・
const ZENKAKU_NUMBERS = [0xff10, 0xff19];
const ZENKAKU_UPPERCASE = [UPPERCASE_ZENKAKU_START, UPPERCASE_ZENKAKU_END];
const ZENKAKU_LOWERCASE = [LOWERCASE_ZENKAKU_START, LOWERCASE_ZENKAKU_END];
const ZENKAKU_PUNCTUATION_1 = [0xff01, 0xff0f];
const ZENKAKU_PUNCTUATION_2 = [0xff1a, 0xff1f];
const ZENKAKU_PUNCTUATION_3 = [0xff3b, 0xff3f];
const ZENKAKU_PUNCTUATION_4 = [0xff5b, 0xff60];
const ZENKAKU_SYMBOLS_CURRENCY = [0xffe0, 0xffee];
const HIRAGANA_CHARS = [0x3040, 0x309f];
const KATAKANA_CHARS = [0x30a0, 0x30ff];
const HANKAKU_KATAKANA = [0xff66, 0xff9f];
const KATAKANA_PUNCTUATION = [0x30fb, 0x30fc];
const KANA_PUNCTUATION = [0xff61, 0xff65];
const CJK_SYMBOLS_PUNCTUATION = [0x3000, 0x303f];
const COMMON_CJK = [0x4e00, 0x9fff];
const RARE_CJK = [0x3400, 0x4dbf];
const KANA_RANGES = [
    HIRAGANA_CHARS,
    KATAKANA_CHARS,
    KANA_PUNCTUATION,
    HANKAKU_KATAKANA,
];
const JA_PUNCTUATION_RANGES = [
    CJK_SYMBOLS_PUNCTUATION,
    KANA_PUNCTUATION,
    KATAKANA_PUNCTUATION,
    ZENKAKU_PUNCTUATION_1,
    ZENKAKU_PUNCTUATION_2,
    ZENKAKU_PUNCTUATION_3,
    ZENKAKU_PUNCTUATION_4,
    ZENKAKU_SYMBOLS_CURRENCY,
];
// All Japanese unicode start and end ranges
// Includes kanji, kana, zenkaku latin chars, punctuation, and number ranges.
const JAPANESE_RANGES = [
    ...KANA_RANGES,
    ...JA_PUNCTUATION_RANGES,
    ZENKAKU_UPPERCASE,
    ZENKAKU_LOWERCASE,
    ZENKAKU_NUMBERS,
    COMMON_CJK,
    RARE_CJK,
];
const MODERN_ENGLISH = [0x0000, 0x007f];
const HEPBURN_MACRON_RANGES = [
    [0x0100, 0x0101],
    [0x0112, 0x0113],
    [0x012a, 0x012b],
    [0x014c, 0x014d],
    [0x016a, 0x016b], // Ū ū
];
const SMART_QUOTE_RANGES = [
    [0x2018, 0x2019],
    [0x201c, 0x201d], // “ ”
];
const ROMAJI_RANGES = [MODERN_ENGLISH, ...HEPBURN_MACRON_RANGES];
const EN_PUNCTUATION_RANGES = [
    [0x20, 0x2f],
    [0x3a, 0x3f],
    [0x5b, 0x60],
    [0x7b, 0x7e],
    ...SMART_QUOTE_RANGES,
];

/**
 * Tests a character. Returns true if the character is [Katakana](https://en.wikipedia.org/wiki/Katakana).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharJapanese(char = '') {
    return JAPANESE_RANGES.some(([start, end]) => isCharInRange(char, start, end));
}

/**
 * Test if `input` only includes [Kanji](https://en.wikipedia.org/wiki/Kanji), [Kana](https://en.wikipedia.org/wiki/Kana), zenkaku numbers, and JA punctuation/symbols.”
 * @param  {String} [input=''] text
 * @param  {RegExp} [allowed] additional test allowed to pass for each char
 * @return {Boolean} true if passes checks
 * @example
 * isJapanese('泣き虫')
 * // => true
 * isJapanese('あア')
 * // => true
 * isJapanese('２月') // Zenkaku numbers allowed
 * // => true
 * isJapanese('泣き虫。！〜＄') // Zenkaku/JA punctuation
 * // => true
 * isJapanese('泣き虫.!~$') // Latin punctuation fails
 * // => false
 * isJapanese('A泣き虫')
 * // => false
 * isJapanese('≪偽括弧≫', /[≪≫]/);
 * // => true
 */
function isJapanese(input = '', allowed) {
    const augmented = typeOf(allowed) === 'regexp';
    return isEmpty(input)
        ? false
        : [...input].every((char) => {
            const isJa = isCharJapanese(char);
            return !augmented ? isJa : isJa || allowed.test(char);
        });
}

var safeIsNaN = Number.isNaN ||
    function ponyfill(value) {
        return typeof value === 'number' && value !== value;
    };
function isEqual(first, second) {
    if (first === second) {
        return true;
    }
    if (safeIsNaN(first) && safeIsNaN(second)) {
        return true;
    }
    return false;
}
function areInputsEqual(newInputs, lastInputs) {
    if (newInputs.length !== lastInputs.length) {
        return false;
    }
    for (var i = 0; i < newInputs.length; i++) {
        if (!isEqual(newInputs[i], lastInputs[i])) {
            return false;
        }
    }
    return true;
}
function memoizeOne(resultFn, isEqual) {
    if (isEqual === void 0) {
        isEqual = areInputsEqual;
    }
    var cache = null;
    function memoized() {
        var newArgs = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            newArgs[_i] = arguments[_i];
        }
        if (cache && cache.lastThis === this && isEqual(newArgs, cache.lastArgs)) {
            return cache.lastResult;
        }
        var lastResult = resultFn.apply(this, newArgs);
        cache = {
            lastResult: lastResult,
            lastArgs: newArgs,
            lastThis: this,
        };
        return lastResult;
    }
    memoized.clear = function clear() {
        cache = null;
    };
    return memoized;
}

var has = Object.prototype.hasOwnProperty;
function find(iter, tar, key) {
    for (key of iter.keys()) {
        if (dequal(key, tar))
            return key;
    }
}
function dequal(foo, bar) {
    var ctor, len, tmp;
    if (foo === bar)
        return true;
    if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
        if (ctor === Date)
            return foo.getTime() === bar.getTime();
        if (ctor === RegExp)
            return foo.toString() === bar.toString();
        if (ctor === Array) {
            if ((len = foo.length) === bar.length) {
                while (len-- && dequal(foo[len], bar[len]))
                    ;
            }
            return len === -1;
        }
        if (ctor === Set) {
            if (foo.size !== bar.size) {
                return false;
            }
            for (len of foo) {
                tmp = len;
                if (tmp && typeof tmp === 'object') {
                    tmp = find(bar, tmp);
                    if (!tmp)
                        return false;
                }
                if (!bar.has(tmp))
                    return false;
            }
            return true;
        }
        if (ctor === Map) {
            if (foo.size !== bar.size) {
                return false;
            }
            for (len of foo) {
                tmp = len[0];
                if (tmp && typeof tmp === 'object') {
                    tmp = find(bar, tmp);
                    if (!tmp)
                        return false;
                }
                if (!dequal(len[1], bar.get(tmp))) {
                    return false;
                }
            }
            return true;
        }
        if (ctor === ArrayBuffer) {
            foo = new Uint8Array(foo);
            bar = new Uint8Array(bar);
        }
        else if (ctor === DataView) {
            if ((len = foo.byteLength) === bar.byteLength) {
                while (len-- && foo.getInt8(len) === bar.getInt8(len))
                    ;
            }
            return len === -1;
        }
        if (ArrayBuffer.isView(foo)) {
            if ((len = foo.byteLength) === bar.byteLength) {
                while (len-- && foo[len] === bar[len])
                    ;
            }
            return len === -1;
        }
        if (!ctor || typeof foo === 'object') {
            len = 0;
            for (ctor in foo) {
                if (has.call(foo, ctor) && ++len && !has.call(bar, ctor))
                    return false;
                if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor]))
                    return false;
            }
            return Object.keys(bar).length === len;
        }
    }
    return foo !== foo && bar !== bar;
}

/**
 * Easy re-use of merging with default options
 * @param {Object} opts user options
 * @returns user options merged over default options
 */
const mergeWithDefaultOptions = (opts = {}) => Object.assign({}, DEFAULT_OPTIONS, opts);

function applyMapping(string, mapping, convertEnding) {
    const root = mapping;
    function nextSubtree(tree, nextChar) {
        const subtree = tree[nextChar];
        if (subtree === undefined) {
            return undefined;
        }
        // if the next child node does not have a node value, set its node value to the input
        return Object.assign({ '': tree[''] + nextChar }, tree[nextChar]);
    }
    function newChunk(remaining, currentCursor) {
        // start parsing a new chunk
        const firstChar = remaining.charAt(0);
        return parse(Object.assign({ '': firstChar }, root[firstChar]), remaining.slice(1), currentCursor, currentCursor + 1);
    }
    function parse(tree, remaining, lastCursor, currentCursor) {
        if (!remaining) {
            if (convertEnding || Object.keys(tree).length === 1) {
                // nothing more to consume, just commit the last chunk and return it
                // so as to not have an empty element at the end of the result
                return tree[''] ? [[lastCursor, currentCursor, tree['']]] : [];
            }
            // if we don't want to convert the ending, because there are still possible continuations
            // return null as the final node value
            return [[lastCursor, currentCursor, null]];
        }
        if (Object.keys(tree).length === 1) {
            return [[lastCursor, currentCursor, tree['']]].concat(newChunk(remaining, currentCursor));
        }
        const subtree = nextSubtree(tree, remaining.charAt(0));
        if (subtree === undefined) {
            return [[lastCursor, currentCursor, tree['']]].concat(newChunk(remaining, currentCursor));
        }
        // continue current branch
        return parse(subtree, remaining.slice(1), lastCursor, currentCursor + 1);
    }
    return newChunk(string, 0);
}
// transform the tree, so that for example hepburnTree['ゔ']['ぁ'][''] === 'va'
// or kanaTree['k']['y']['a'][''] === 'きゃ'
function transform(tree) {
    return Object.entries(tree).reduce((map, [char, subtree]) => {
        const endOfBranch = typeOf(subtree) === 'string';
        // eslint-disable-next-line no-param-reassign
        map[char] = endOfBranch ? { '': subtree } : transform(subtree);
        return map;
    }, {});
}
function getSubTreeOf(tree, string) {
    return string.split('').reduce((correctSubTree, char) => {
        if (correctSubTree[char] === undefined) {
            // eslint-disable-next-line no-param-reassign
            correctSubTree[char] = {};
        }
        return correctSubTree[char];
    }, tree);
}
/**
 * Creates a custom mapping tree, returns a function that accepts a defaultMap which the newly created customMapping will be merged with and returned
 * (customMap) => (defaultMap) => mergedMap
 * @param  {Object} customMap { 'ka' : 'な' }
 * @return {Function} (defaultMap) => defaultMergedWithCustomMap
 * @example
 * const sillyMap = createCustomMapping({ 'ちゃ': 'time', '茎': 'cookie'　});
 * // sillyMap is passed defaultMapping to merge with when called in toRomaji()
 * toRomaji("It's 茎 ちゃ よ", { customRomajiMapping: sillyMap });
 * // => 'It's cookie time yo';
 */
function createCustomMapping(customMap = {}) {
    const customTree = {};
    if (typeOf(customMap) === 'object') {
        Object.entries(customMap).forEach(([roma, kana]) => {
            let subTree = customTree;
            roma.split('').forEach((char) => {
                if (subTree[char] === undefined) {
                    subTree[char] = {};
                }
                subTree = subTree[char];
            });
            subTree[''] = kana;
        });
    }
    return function makeMap(map) {
        const mapCopy = JSON.parse(JSON.stringify(map));
        function transformMap(mapSubtree, customSubtree) {
            if (mapSubtree === undefined || typeOf(mapSubtree) === 'string') {
                return customSubtree;
            }
            return Object.entries(customSubtree).reduce((newSubtree, [char, subtree]) => {
                // eslint-disable-next-line no-param-reassign
                newSubtree[char] = transformMap(mapSubtree[char], subtree);
                return newSubtree;
            }, mapSubtree);
        }
        return transformMap(mapCopy, customTree);
    };
}
// allow consumer to pass either function or object as customMapping
function mergeCustomMapping(map, customMapping) {
    if (!customMapping) {
        return map;
    }
    return typeOf(customMapping) === 'function'
        ? customMapping(map)
        : createCustomMapping(customMapping)(map);
}

// NOTE: not exactly kunrei shiki, for example ぢゃ -> dya instead of zya, to avoid name clashing
/* eslint-disable */
// prettier-ignore
const BASIC_KUNREI = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    k: { a: 'か', i: 'き', u: 'く', e: 'け', o: 'こ', },
    s: { a: 'さ', i: 'し', u: 'す', e: 'せ', o: 'そ', },
    t: { a: 'た', i: 'ち', u: 'つ', e: 'て', o: 'と', },
    n: { a: 'な', i: 'に', u: 'ぬ', e: 'ね', o: 'の', },
    h: { a: 'は', i: 'ひ', u: 'ふ', e: 'へ', o: 'ほ', },
    m: { a: 'ま', i: 'み', u: 'む', e: 'め', o: 'も', },
    y: { a: 'や', u: 'ゆ', o: 'よ' },
    r: { a: 'ら', i: 'り', u: 'る', e: 'れ', o: 'ろ', },
    w: { a: 'わ', i: 'ゐ', e: 'ゑ', o: 'を', },
    g: { a: 'が', i: 'ぎ', u: 'ぐ', e: 'げ', o: 'ご', },
    z: { a: 'ざ', i: 'じ', u: 'ず', e: 'ぜ', o: 'ぞ', },
    d: { a: 'だ', i: 'ぢ', u: 'づ', e: 'で', o: 'ど', },
    b: { a: 'ば', i: 'び', u: 'ぶ', e: 'べ', o: 'ぼ', },
    p: { a: 'ぱ', i: 'ぴ', u: 'ぷ', e: 'ぺ', o: 'ぽ', },
    v: { a: 'ゔぁ', i: 'ゔぃ', u: 'ゔ', e: 'ゔぇ', o: 'ゔぉ', },
};
const SPECIAL_SYMBOLS$1 = {
    '.': '。',
    ',': '、',
    ':': '：',
    '/': '・',
    '!': '！',
    '?': '？',
    '~': '〜',
    '-': 'ー',
    '‘': '「',
    '’': '」',
    '“': '『',
    '”': '』',
    '[': '［',
    ']': '］',
    '(': '（',
    ')': '）',
    '{': '｛',
    '}': '｝',
};
const CONSONANTS = {
    k: 'き',
    s: 'し',
    t: 'ち',
    n: 'に',
    h: 'ひ',
    m: 'み',
    r: 'り',
    g: 'ぎ',
    z: 'じ',
    d: 'ぢ',
    b: 'び',
    p: 'ぴ',
    v: 'ゔ',
    q: 'く',
    f: 'ふ',
};
const SMALL_Y$1 = { ya: 'ゃ', yi: 'ぃ', yu: 'ゅ', ye: 'ぇ', yo: 'ょ' };
const SMALL_VOWELS = { a: 'ぁ', i: 'ぃ', u: 'ぅ', e: 'ぇ', o: 'ぉ' };
// typing one should be the same as having typed the other instead
const ALIASES = {
    sh: 'sy',
    ch: 'ty',
    cy: 'ty',
    chy: 'ty',
    shy: 'sy',
    j: 'zy',
    jy: 'zy',
    // exceptions to above rules
    shi: 'si',
    chi: 'ti',
    tsu: 'tu',
    ji: 'zi',
    fu: 'hu',
};
// xtu -> っ
const SMALL_LETTERS = Object.assign({
    tu: 'っ',
    wa: 'ゎ',
    ka: 'ヵ',
    ke: 'ヶ',
}, SMALL_VOWELS, SMALL_Y$1);
// don't follow any notable patterns
const SPECIAL_CASES = {
    yi: 'い',
    wu: 'う',
    ye: 'いぇ',
    wi: 'うぃ',
    we: 'うぇ',
    kwa: 'くぁ',
    whu: 'う',
    // because it's not thya for てゃ but tha
    // and tha is not てぁ, but てゃ
    tha: 'てゃ',
    thu: 'てゅ',
    tho: 'てょ',
    dha: 'でゃ',
    dhu: 'でゅ',
    dho: 'でょ',
};
const AIUEO_CONSTRUCTIONS = {
    wh: 'う',
    kw: 'く',
    qw: 'く',
    q: 'く',
    gw: 'ぐ',
    sw: 'す',
    ts: 'つ',
    th: 'て',
    tw: 'と',
    dh: 'で',
    dw: 'ど',
    fw: 'ふ',
    f: 'ふ',
};
/* eslint-enable */
function createRomajiToKanaMap$1() {
    const kanaTree = transform(BASIC_KUNREI);
    // pseudo partial application
    const subtreeOf = (string) => getSubTreeOf(kanaTree, string);
    // add tya, sya, etc.
    Object.entries(CONSONANTS).forEach(([consonant, yKana]) => {
        Object.entries(SMALL_Y$1).forEach(([roma, kana]) => {
            // for example kyo -> き + ょ
            subtreeOf(consonant + roma)[''] = yKana + kana;
        });
    });
    Object.entries(SPECIAL_SYMBOLS$1).forEach(([symbol, jsymbol]) => {
        subtreeOf(symbol)[''] = jsymbol;
    });
    // things like うぃ, くぃ, etc.
    Object.entries(AIUEO_CONSTRUCTIONS).forEach(([consonant, aiueoKana]) => {
        Object.entries(SMALL_VOWELS).forEach(([vowel, kana]) => {
            const subtree = subtreeOf(consonant + vowel);
            subtree[''] = aiueoKana + kana;
        });
    });
    // different ways to write ん
    ['n', "n'", 'xn'].forEach((nChar) => {
        subtreeOf(nChar)[''] = 'ん';
    });
    // c is equivalent to k, but not for chi, cha, etc. that's why we have to make a copy of k
    kanaTree.c = JSON.parse(JSON.stringify(kanaTree.k));
    Object.entries(ALIASES).forEach(([string, alternative]) => {
        const allExceptLast = string.slice(0, string.length - 1);
        const last = string.charAt(string.length - 1);
        const parentTree = subtreeOf(allExceptLast);
        // copy to avoid recursive containment
        parentTree[last] = JSON.parse(JSON.stringify(subtreeOf(alternative)));
    });
    function getAlternatives(string) {
        return [...Object.entries(ALIASES), ...[['c', 'k']]].reduce((list, [alt, roma]) => (string.startsWith(roma) ? list.concat(string.replace(roma, alt)) : list), []);
    }
    Object.entries(SMALL_LETTERS).forEach(([kunreiRoma, kana]) => {
        const last = (char) => char.charAt(char.length - 1);
        const allExceptLast = (chars) => chars.slice(0, chars.length - 1);
        const xRoma = `x${kunreiRoma}`;
        const xSubtree = subtreeOf(xRoma);
        xSubtree[''] = kana;
        // ltu -> xtu -> っ
        const parentTree = subtreeOf(`l${allExceptLast(kunreiRoma)}`);
        parentTree[last(kunreiRoma)] = xSubtree;
        // ltsu -> ltu -> っ
        getAlternatives(kunreiRoma).forEach((altRoma) => {
            ['l', 'x'].forEach((prefix) => {
                const altParentTree = subtreeOf(prefix + allExceptLast(altRoma));
                altParentTree[last(altRoma)] = subtreeOf(prefix + kunreiRoma);
            });
        });
    });
    Object.entries(SPECIAL_CASES).forEach(([string, kana]) => {
        subtreeOf(string)[''] = kana;
    });
    // add kka, tta, etc.
    function addTsu(tree) {
        return Object.entries(tree).reduce((tsuTree, [key, value]) => {
            if (!key) {
                // we have reached the bottom of this branch
                // eslint-disable-next-line no-param-reassign
                tsuTree[key] = `っ${value}`;
            }
            else {
                // more subtrees
                // eslint-disable-next-line no-param-reassign
                tsuTree[key] = addTsu(value);
            }
            return tsuTree;
        }, {});
    }
    // have to explicitly name c here, because we made it a copy of k, not a reference
    [...Object.keys(CONSONANTS), 'c', 'y', 'w', 'j'].forEach((consonant) => {
        const subtree = kanaTree[consonant];
        subtree[consonant] = addTsu(subtree);
    });
    // nn should not be っん
    delete kanaTree.n.n;
    // solidify the results, so that there there is referential transparency within the tree
    return Object.freeze(JSON.parse(JSON.stringify(kanaTree)));
}
let romajiToKanaMap = null;
function getRomajiToKanaTree() {
    if (romajiToKanaMap == null) {
        romajiToKanaMap = createRomajiToKanaMap$1();
    }
    return romajiToKanaMap;
}
const USE_OBSOLETE_KANA_MAP = createCustomMapping({
    wi: 'ゐ',
    we: 'ゑ',
});
function IME_MODE_MAP(map) {
    // in IME mode, we do not want to convert single ns
    const mapCopy = JSON.parse(JSON.stringify(map));
    mapCopy.n.n = { '': 'ん' };
    mapCopy.n[' '] = { '': 'ん' };
    return mapCopy;
}

/**
 * Tests if char is in English unicode uppercase range
 * @param  {String} char
 * @return {Boolean}
 */
function isCharUpperCase(char = '') {
    if (isEmpty(char))
        return false;
    return isCharInRange(char, LATIN_UPPERCASE_START, LATIN_UPPERCASE_END);
}

/**
 * Returns true if char is 'ー'
 * @param  {String} char to test
 * @return {Boolean}
 */
function isCharLongDash(char = '') {
    if (isEmpty(char))
        return false;
    return char.charCodeAt(0) === PROLONGED_SOUND_MARK;
}

/**
 * Tests if char is '・'
 * @param  {String} char
 * @return {Boolean} true if '・'
 */
function isCharSlashDot(char = '') {
    if (isEmpty(char))
        return false;
    return char.charCodeAt(0) === KANA_SLASH_DOT;
}

/**
 * Tests a character. Returns true if the character is [Hiragana](https://en.wikipedia.org/wiki/Hiragana).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharHiragana(char = '') {
    if (isEmpty(char))
        return false;
    if (isCharLongDash(char))
        return true;
    return isCharInRange(char, HIRAGANA_START, HIRAGANA_END);
}

/**
 * Convert [Hiragana](https://en.wikipedia.org/wiki/Hiragana) to [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * Passes through any non-hiragana chars
 * @private
 * @param  {String} [input=''] text input
 * @return {String} converted text
 * @example
 * hiraganaToKatakana('ひらがな')
 * // => "ヒラガナ"
 * hiraganaToKatakana('ひらがな is a type of kana')
 * // => "ヒラガナ is a type of kana"
 */
function hiraganaToKatakana(input = '') {
    const kata = [];
    input.split('').forEach((char) => {
        // Short circuit to avoid incorrect codeshift for 'ー' and '・'
        if (isCharLongDash(char) || isCharSlashDot(char)) {
            kata.push(char);
        }
        else if (isCharHiragana(char)) {
            // Shift charcode.
            const code = char.charCodeAt(0) + (KATAKANA_START - HIRAGANA_START);
            const kataChar = String.fromCharCode(code);
            kata.push(kataChar);
        }
        else {
            // Pass non-hiragana chars through
            kata.push(char);
        }
    });
    return kata.join('');
}

// memoize and deeply compare args so we only recreate when necessary
const createRomajiToKanaMap = memoizeOne((IMEMode, useObsoleteKana, customKanaMapping) => {
    let map = getRomajiToKanaTree();
    map = IMEMode ? IME_MODE_MAP(map) : map;
    map = useObsoleteKana ? USE_OBSOLETE_KANA_MAP(map) : map;
    if (customKanaMapping) {
        map = mergeCustomMapping(map, customKanaMapping);
    }
    return map;
}, dequal);
/**
 * Convert [Romaji](https://en.wikipedia.org/wiki/Romaji) to [Kana](https://en.wikipedia.org/wiki/Kana), lowercase text will result in [Hiragana](https://en.wikipedia.org/wiki/Hiragana) and uppercase text will result in [Katakana](https://en.wikipedia.org/wiki/Katakana).
 * @param  {String} [input=''] text
 * @param  {DefaultOptions} [options=defaultOptions]
 * @param  {Object.<string, string>} [map] custom mapping
 * @return {String} converted text
 * @example
 * toKana('onaji BUTTSUUJI')
 * // => 'おなじ ブッツウジ'
 * toKana('ONAJI buttsuuji')
 * // => 'オナジ ぶっつうじ'
 * toKana('座禅‘zazen’スタイル')
 * // => '座禅「ざぜん」スタイル'
 * toKana('batsuge-mu')
 * // => 'ばつげーむ'
 * toKana('!?.:/,~-‘’“”[](){}') // Punctuation conversion
 * // => '！？。：・、〜ー「」『』［］（）｛｝'
 * toKana('we', { useObsoleteKana: true })
 * // => 'ゑ'
 * toKana('wanakana', { customKanaMapping: { na: 'に', ka: 'bana' } });
 * // => 'わにbanaに'
 */
function toKana(input = '', options = {}, map) {
    let config;
    if (!map) {
        config = mergeWithDefaultOptions(options);
        map = createRomajiToKanaMap(config.IMEMode, config.useObsoleteKana, config.customKanaMapping);
    }
    else {
        config = options;
    }
    // throw away the substring index information and just concatenate all the kana
    return splitIntoConvertedKana(input, config, map)
        .map((kanaToken) => {
        const [start, end, kana] = kanaToken;
        if (kana === null) {
            // haven't converted the end of the string, since we are in IME mode
            return input.slice(start);
        }
        const enforceHiragana = config.IMEMode === TO_KANA_METHODS.HIRAGANA;
        const enforceKatakana = config.IMEMode === TO_KANA_METHODS.KATAKANA
            || [...input.slice(start, end)].every(isCharUpperCase);
        return enforceHiragana || !enforceKatakana
            ? kana
            : hiraganaToKatakana(kana);
    })
        .join('');
}
/**
 *
 * @private
 * @param {String} [input=''] input text
 * @param {DefaultOptions} [options=defaultOptions] toKana options
 * @param {Object} [map] custom mapping
 * @returns {Array[]} [[start, end, token]]
 * @example
 * splitIntoConvertedKana('buttsuuji')
 * // => [[0, 2, 'ぶ'], [2, 6, 'っつ'], [6, 7, 'う'], [7, 9, 'じ']]
 */
function splitIntoConvertedKana(input = '', options = {}, map) {
    const { IMEMode, useObsoleteKana, customKanaMapping } = options;
    if (!map) {
        map = createRomajiToKanaMap(IMEMode, useObsoleteKana, customKanaMapping);
    }
    return applyMapping(input.toLowerCase(), map, !IMEMode);
}

let LISTENERS = [];
/**
 * Automagically replaces input values with converted text to kana
 * @param  {defaultOptions} [options] user config overrides, default conversion is toKana()
 * @return {Function} event handler with bound options
 * @private
 */
function makeOnInput(options) {
    let prevInput;
    // Enforce IMEMode if not already specified
    const mergedConfig = Object.assign({}, mergeWithDefaultOptions(options), {
        IMEMode: options.IMEMode || true,
    });
    const preConfiguredMap = createRomajiToKanaMap(mergedConfig.IMEMode, mergedConfig.useObsoleteKana, mergedConfig.customKanaMapping);
    const triggers = [
        ...Object.keys(preConfiguredMap),
        ...Object.keys(preConfiguredMap).map((char) => char.toUpperCase()),
    ];
    return function onInput({ target }) {
        if (target.value !== prevInput
            && target.dataset.ignoreComposition !== 'true') {
            convertInput(target, mergedConfig, preConfiguredMap, triggers);
        }
    };
}
function convertInput(target, options, map, triggers, prevInput) {
    const [head, textToConvert, tail] = splitInput(target.value, target.selectionEnd, triggers);
    const convertedText = toKana(textToConvert, options, map);
    const changed = textToConvert !== convertedText;
    if (changed) {
        const newCursor = head.length + convertedText.length;
        const newValue = head + convertedText + tail;
        // eslint-disable-next-line no-param-reassign
        target.value = newValue;
        if (tail.length) {
            // push later on event loop (otherwise mid-text insertion can be 1 char too far to the right)
            setTimeout(() => target.setSelectionRange(newCursor, newCursor), 1);
        }
        else {
            target.setSelectionRange(newCursor, newCursor);
        }
    }
    else {
        // eslint-disable-next-line no-param-reassign
        target.value;
    }
}
function onComposition({ type, target, data }) {
    // navigator.platform is not 100% reliable for singling out all OS,
    // but for determining desktop "Mac OS" it is effective enough.
    const isMacOS = /Mac/.test(window.navigator && window.navigator.platform);
    // We don't want to ignore on Android:
    // https://github.com/WaniKani/WanaKana/issues/82
    // But MacOS IME auto-closes if we don't ignore:
    // https://github.com/WaniKani/WanaKana/issues/71
    // Other platform Japanese IMEs pass through happily
    if (isMacOS) {
        if (type === 'compositionupdate' && isJapanese(data)) {
            // eslint-disable-next-line no-param-reassign
            target.dataset.ignoreComposition = 'true';
        }
        if (type === 'compositionend') {
            // eslint-disable-next-line no-param-reassign
            target.dataset.ignoreComposition = 'false';
        }
    }
}
function trackListeners(id, inputHandler, compositionHandler) {
    LISTENERS = LISTENERS.concat({
        id,
        inputHandler,
        compositionHandler,
    });
}
// Handle non-terminal inserted input conversion:
// | -> わ| -> わび| -> わ|び -> わs|び -> わsh|び -> わshi|び -> わし|び
// or multiple ambiguous positioning (to select which "s" to work from)
// こsこs|こsこ -> こsこso|こsこ -> こsこそ|こsこ
function splitInput(text = '', cursor = 0, triggers = []) {
    let head;
    let toConvert;
    let tail;
    if (cursor === 0 && triggers.includes(text[0])) {
        [head, toConvert, tail] = workFromStart(text, triggers);
    }
    else if (cursor > 0) {
        [head, toConvert, tail] = workBackwards(text, cursor);
    }
    else {
        [head, toConvert] = takeWhileAndSlice(text, (char) => !triggers.includes(char));
        [toConvert, tail] = takeWhileAndSlice(toConvert, (char) => !isJapanese(char));
    }
    return [head, toConvert, tail];
}
function workFromStart(text, catalystChars) {
    return [
        '',
        ...takeWhileAndSlice(text, (char) => catalystChars.includes(char) || !isJapanese(char, /[0-9]/)),
    ];
}
function workBackwards(text = '', startIndex = 0) {
    const [toConvert, head] = takeWhileAndSlice([...text.slice(0, startIndex)].reverse(), (char) => !isJapanese(char));
    return [
        head.reverse().join(''),
        toConvert
            .split('')
            .reverse()
            .join(''),
        text.slice(startIndex),
    ];
}
function takeWhileAndSlice(source = {}, predicate = (x) => !!x) {
    const result = [];
    const { length } = source;
    let i = 0;
    while (i < length && predicate(source[i], i)) {
        result.push(source[i]);
        i += 1;
    }
    return [result.join(''), source.slice(i)];
}

/* eslint-disable no-console */
const onInput = ({ target: { value, selectionStart, selectionEnd } }) => console.log('input:', { value, selectionStart, selectionEnd });
const onCompositionStart = () => console.log('compositionstart');
const onCompositionUpdate = ({ target: { value, selectionStart, selectionEnd }, data, }) => console.log('compositionupdate', {
    data,
    value,
    selectionStart,
    selectionEnd,
});
const onCompositionEnd = () => console.log('compositionend');
const events = {
    input: onInput,
    compositionstart: onCompositionStart,
    compositionupdate: onCompositionUpdate,
    compositionend: onCompositionEnd,
};
const addDebugListeners = (input) => {
    Object.entries(events).forEach(([event, handler]) => input.addEventListener(event, handler));
};

const ELEMENTS = ['TEXTAREA', 'INPUT'];
let idCounter = 0;
const newId = () => {
    idCounter += 1;
    return `${Date.now()}${idCounter}`;
};
/**
 * Binds eventListener for 'input' events to an input field to automagically replace values with kana
 * Can pass `{ IMEMode: 'toHiragana' || 'toKatakana' }` to enforce kana conversion type
 * @param  {HTMLInputElement | HTMLTextAreaElement} element textarea, input[type="text"] etc
 * @param  {DefaultOptions} [options=defaultOptions] defaults to { IMEMode: true } using `toKana`
 * @example
 * bind(document.querySelector('#myInput'));
 */
function bind(element = {}, options = {}, debug = false) {
    if (!ELEMENTS.includes(element.nodeName)) {
        throw new Error(`Element provided to Wanakana bind() was not a valid input or textarea element.\n Received: (${JSON.stringify(element)})`);
    }
    if (element.hasAttribute('data-wanakana-id')) {
        return;
    }
    const onInput = makeOnInput(options);
    const id = newId();
    const attributes = [
        { name: 'data-wanakana-id', value: id },
        { name: 'lang', value: 'ja' },
        { name: 'autoCapitalize', value: 'none' },
        { name: 'autoCorrect', value: 'off' },
        { name: 'autoComplete', value: 'off' },
        { name: 'spellCheck', value: 'false' },
    ];
    const previousAttributes = {};
    attributes.forEach((attribute) => {
        previousAttributes[attribute.name] = element.getAttribute(attribute.name);
        element.setAttribute(attribute.name, attribute.value);
    });
    element.dataset.previousAttributes = JSON.stringify(previousAttributes);
    element.addEventListener('input', onInput);
    element.addEventListener('compositionupdate', onComposition);
    element.addEventListener('compositionend', onComposition);
    trackListeners(id, onInput, onComposition);
    if (debug === true) {
        addDebugListeners(element);
    }
}

/**
 * Tests a character. Returns true if the character is [Romaji](https://en.wikipedia.org/wiki/Romaji) (allowing [Hepburn romanisation](https://en.wikipedia.org/wiki/Hepburn_romanization))
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharRomaji(char = '') {
    if (isEmpty(char))
        return false;
    return ROMAJI_RANGES.some(([start, end]) => isCharInRange(char, start, end));
}

/**
 * Test if `input` is [Romaji](https://en.wikipedia.org/wiki/Romaji) (allowing [Hepburn romanisation](https://en.wikipedia.org/wiki/Hepburn_romanization))
 * @param  {String} [input=''] text
 * @param  {RegExp} [allowed] additional test allowed to pass for each char
 * @return {Boolean} true if [Romaji](https://en.wikipedia.org/wiki/Romaji)
 * @example
 * isRomaji('Tōkyō and Ōsaka')
 * // => true
 * isRomaji('12a*b&c-d')
 * // => true
 * isRomaji('あアA')
 * // => false
 * isRomaji('お願い')
 * // => false
 * isRomaji('a！b&cーd') // Zenkaku punctuation fails
 * // => false
 * isRomaji('a！b&cーd', /[！ー]/)
 * // => true
 */
function isRomaji(input = '', allowed) {
    const augmented = typeOf(allowed) === 'regexp';
    return isEmpty(input)
        ? false
        : [...input].every((char) => {
            const isRoma = isCharRomaji(char);
            return !augmented ? isRoma : isRoma || allowed.test(char);
        });
}

/**
 * Tests a character. Returns true if the character is [Katakana](https://en.wikipedia.org/wiki/Katakana).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharKatakana(char = '') {
    return isCharInRange(char, KATAKANA_START, KATAKANA_END);
}

/**
 * Test if `input` is [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * @example
 * isHiragana('げーむ')
 * // => true
 * isHiragana('A')
 * // => false
 * isHiragana('あア')
 * // => false
 */
function isHiragana(input = '') {
    if (isEmpty(input))
        return false;
    return [...input].every(isCharHiragana);
}

/**
 * Test if `input` is [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * @example
 * isKatakana('ゲーム')
 * // => true
 * isKatakana('あ')
 * // => false
 * isKatakana('A')
 * // => false
 * isKatakana('あア')
 * // => false
 */
function isKatakana(input = '') {
    if (isEmpty(input))
        return false;
    return [...input].every(isCharKatakana);
}

/**
 * Returns true if char is '々'
 * @param  {String} char to test
 * @return {Boolean}
 */
function isCharIterationMark(char = '') {
    if (isEmpty(char))
        return false;
    return char.charCodeAt(0) === KANJI_ITERATION_MARK;
}

/**
 * Tests a character. Returns true if the character is a CJK ideograph (kanji).
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharKanji(char = '') {
    return isCharInRange(char, KANJI_START, KANJI_END) || isCharIterationMark(char);
}

/**
 * Tests if `input` is [Kanji](https://en.wikipedia.org/wiki/Kanji) ([Japanese CJK ideographs](https://en.wikipedia.org/wiki/CJK_Unified_Ideographs))
 * @param  {String} [input=''] text
 * @return {Boolean} true if all [Kanji](https://en.wikipedia.org/wiki/Kanji)
 * @example
 * isKanji('刀')
 * // => true
 * isKanji('切腹')
 * // => true
 * isKanji('勢い')
 * // => false
 * isKanji('あAア')
 * // => false
 * isKanji('🐸')
 * // => false
 */
function isKanji(input = '') {
    if (isEmpty(input))
        return false;
    return [...input].every(isCharKanji);
}

/**
 * Test if `input` contains a mix of [Romaji](https://en.wikipedia.org/wiki/Romaji) *and* [Kana](https://en.wikipedia.org/wiki/Kana), defaults to pass through [Kanji](https://en.wikipedia.org/wiki/Kanji)
 * @param  {String} input text
 * @param  {{ passKanji: Boolean}} [options={ passKanji: true }] optional config to pass through kanji
 * @return {Boolean} true if mixed
 * @example
 * isMixed('Abあア'))
 * // => true
 * isMixed('お腹A')) // ignores kanji by default
 * // => true
 * isMixed('お腹A', { passKanji: false }))
 * // => false
 * isMixed('ab'))
 * // => false
 * isMixed('あア'))
 * // => false
 */
function isMixed(input = '', options = { passKanji: true }) {
    const chars = [...input];
    let hasKanji = false;
    if (!options.passKanji) {
        hasKanji = chars.some(isKanji);
    }
    return (chars.some(isHiragana) || chars.some(isKatakana)) && chars.some(isRomaji) && !hasKanji;
}

const isCharInitialLongDash = (char, index) => isCharLongDash(char) && index < 1;
const isCharInnerLongDash = (char, index) => isCharLongDash(char) && index > 0;
const isKanaAsSymbol = (char) => ['ヶ', 'ヵ'].includes(char);
const LONG_VOWELS = {
    a: 'あ',
    i: 'い',
    u: 'う',
    e: 'え',
    o: 'う',
};
// inject toRomaji to avoid circular dependency between toRomaji <-> katakanaToHiragana
function katakanaToHiragana(input = '', toRomaji, { isDestinationRomaji, convertLongVowelMark } = {}) {
    let previousKana = '';
    return input
        .split('')
        .reduce((hira, char, index) => {
        // Short circuit to avoid incorrect codeshift for 'ー' and '・'
        if (isCharSlashDot(char)
            || isCharInitialLongDash(char, index)
            || isKanaAsSymbol(char)) {
            return hira.concat(char);
        }
        // Transform long vowels: 'オー' to 'おう'
        if (convertLongVowelMark
            && previousKana
            && isCharInnerLongDash(char, index)) {
            // Transform previousKana back to romaji, and slice off the vowel
            const romaji = toRomaji(previousKana).slice(-1);
            // However, ensure 'オー' => 'おお' => 'oo' if this is a transform on the way to romaji
            if (isCharKatakana(input[index - 1])
                && romaji === 'o'
                && isDestinationRomaji) {
                return hira.concat('お');
            }
            return hira.concat(LONG_VOWELS[romaji]);
            // Transform all other chars
        }
        if (!isCharLongDash(char) && isCharKatakana(char)) {
            const code = char.charCodeAt(0) + (HIRAGANA_START - KATAKANA_START);
            const hiraChar = String.fromCharCode(code);
            previousKana = hiraChar;
            return hira.concat(hiraChar);
        }
        // Pass non katakana chars through
        previousKana = '';
        return hira.concat(char);
    }, [])
        .join('');
}

let kanaToHepburnMap = null;
/* eslint-disable */
// prettier-ignore
const BASIC_ROMAJI = {
    あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
    か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
    さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
    た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
    な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
    は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
    ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
    ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
    や: 'ya', ゆ: 'yu', よ: 'yo',
    わ: 'wa', ゐ: 'wi', ゑ: 'we', を: 'wo',
    ん: 'n',
    が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
    ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
    だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
    ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
    ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
    ゔぁ: 'va', ゔぃ: 'vi', ゔ: 'vu', ゔぇ: 've', ゔぉ: 'vo',
};
/* eslint-enable  */
const SPECIAL_SYMBOLS = {
    '。': '.',
    '、': ',',
    '：': ':',
    '・': '/',
    '！': '!',
    '？': '?',
    '〜': '~',
    'ー': '-',
    '「': '‘',
    '」': '’',
    '『': '“',
    '』': '”',
    '［': '[',
    '］': ']',
    '（': '(',
    '）': ')',
    '｛': '{',
    '｝': '}',
    '　': ' ',
};
// んい -> n'i
const AMBIGUOUS_VOWELS = ['あ', 'い', 'う', 'え', 'お', 'や', 'ゆ', 'よ'];
const SMALL_Y = { ゃ: 'ya', ゅ: 'yu', ょ: 'yo' };
const SMALL_Y_EXTRA = { ぃ: 'yi', ぇ: 'ye' };
const SMALL_AIUEO = {
    ぁ: 'a',
    ぃ: 'i',
    ぅ: 'u',
    ぇ: 'e',
    ぉ: 'o',
};
const YOON_KANA = [
    'き',
    'に',
    'ひ',
    'み',
    'り',
    'ぎ',
    'び',
    'ぴ',
    'ゔ',
    'く',
    'ふ',
];
const YOON_EXCEPTIONS = {
    し: 'sh',
    ち: 'ch',
    じ: 'j',
    ぢ: 'j',
};
const SMALL_KANA = {
    っ: '',
    ゃ: 'ya',
    ゅ: 'yu',
    ょ: 'yo',
    ぁ: 'a',
    ぃ: 'i',
    ぅ: 'u',
    ぇ: 'e',
    ぉ: 'o',
};
// going with the intuitive (yet incorrect) solution where っや -> yya and っぃ -> ii
// in other words, just assume the sokuon could have been applied to anything
const SOKUON_WHITELIST = {
    b: 'b',
    c: 't',
    d: 'd',
    f: 'f',
    g: 'g',
    h: 'h',
    j: 'j',
    k: 'k',
    m: 'm',
    p: 'p',
    q: 'q',
    r: 'r',
    s: 's',
    t: 't',
    v: 'v',
    w: 'w',
    x: 'x',
    z: 'z',
};
function getKanaToHepburnTree() {
    if (kanaToHepburnMap == null) {
        kanaToHepburnMap = createKanaToHepburnMap();
    }
    return kanaToHepburnMap;
}
function getKanaToRomajiTree(romanization) {
    switch (romanization) {
        case ROMANIZATIONS.HEPBURN:
            return getKanaToHepburnTree();
        default:
            return {};
    }
}
function createKanaToHepburnMap() {
    const romajiTree = transform(BASIC_ROMAJI);
    const subtreeOf = (string) => getSubTreeOf(romajiTree, string);
    const setTrans = (string, transliteration) => {
        subtreeOf(string)[''] = transliteration;
    };
    Object.entries(SPECIAL_SYMBOLS).forEach(([jsymbol, symbol]) => {
        subtreeOf(jsymbol)[''] = symbol;
    });
    [...Object.entries(SMALL_Y), ...Object.entries(SMALL_AIUEO)].forEach(([roma, kana]) => {
        setTrans(roma, kana);
    });
    // きゃ -> kya
    YOON_KANA.forEach((kana) => {
        const firstRomajiChar = subtreeOf(kana)[''][0];
        Object.entries(SMALL_Y).forEach(([yKana, yRoma]) => {
            setTrans(kana + yKana, firstRomajiChar + yRoma);
        });
        // きぃ -> kyi
        Object.entries(SMALL_Y_EXTRA).forEach(([yKana, yRoma]) => {
            setTrans(kana + yKana, firstRomajiChar + yRoma);
        });
    });
    Object.entries(YOON_EXCEPTIONS).forEach(([kana, roma]) => {
        // じゃ -> ja
        Object.entries(SMALL_Y).forEach(([yKana, yRoma]) => {
            setTrans(kana + yKana, roma + yRoma[1]);
        });
        // じぃ -> jyi, じぇ -> je
        setTrans(`${kana}ぃ`, `${roma}yi`);
        setTrans(`${kana}ぇ`, `${roma}e`);
    });
    romajiTree['っ'] = resolveTsu(romajiTree);
    Object.entries(SMALL_KANA).forEach(([kana, roma]) => {
        setTrans(kana, roma);
    });
    AMBIGUOUS_VOWELS.forEach((kana) => {
        setTrans(`ん${kana}`, `n'${subtreeOf(kana)['']}`);
    });
    // NOTE: could be re-enabled with an option?
    // // んば -> mbo
    // const LABIAL = [
    //   'ば', 'び', 'ぶ', 'べ', 'ぼ',
    //   'ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ',
    //   'ま', 'み', 'む', 'め', 'も',
    // ];
    // LABIAL.forEach((kana) => {
    //   setTrans(`ん${kana}`, `m${subtreeOf(kana)['']}`);
    // });
    return Object.freeze(JSON.parse(JSON.stringify(romajiTree)));
}
function resolveTsu(tree) {
    return Object.entries(tree).reduce((tsuTree, [key, value]) => {
        if (!key) {
            // we have reached the bottom of this branch
            const consonant = value.charAt(0);
            // eslint-disable-next-line no-param-reassign
            tsuTree[key] = Object.keys(SOKUON_WHITELIST).includes(consonant)
                ? SOKUON_WHITELIST[consonant] + value
                : value;
        }
        else {
            // more subtrees
            // eslint-disable-next-line no-param-reassign
            tsuTree[key] = resolveTsu(value);
        }
        return tsuTree;
    }, {});
}

// memoize and deeply compare args so we only recreate when necessary
const createKanaToRomajiMap = memoizeOne((romanization, customRomajiMapping) => {
    let map = getKanaToRomajiTree(romanization);
    if (customRomajiMapping) {
        map = mergeCustomMapping(map, customRomajiMapping);
    }
    return map;
}, dequal);
/**
 * Convert kana to romaji
 * @param  {String} kana text input
 * @param  {DefaultOptions} [options=defaultOptions]
 * @param  {Object.<string, string>} [map] custom mapping
 * @return {String} converted text
 * @example
 * toRomaji('ひらがな　カタカナ')
 * // => 'hiragana katakana'
 * toRomaji('げーむ　ゲーム')
 * // => 'ge-mu geemu'
 * toRomaji('ひらがな　カタカナ', { upcaseKatakana: true })
 * // => 'hiragana KATAKANA'
 * toRomaji('つじぎり', { customRomajiMapping: { じ: 'zi', つ: 'tu', り: 'li' } });
 * // => 'tuzigili'
 */
function toRomaji(input = '', options = {}, map) {
    const config = mergeWithDefaultOptions(options);
    if (!map) {
        map = createKanaToRomajiMap(config.romanization, config.customRomajiMapping);
    }
    // just throw away the substring index information and simply concatenate all the kana
    return splitIntoRomaji(input, config, map)
        .map((romajiToken) => {
        const [start, end, romaji] = romajiToken;
        const makeUpperCase = config.upcaseKatakana && isKatakana(input.slice(start, end));
        return makeUpperCase ? romaji.toUpperCase() : romaji;
    })
        .join('');
}
function splitIntoRomaji(input, options, map) {
    if (!map) {
        map = createKanaToRomajiMap(options.romanization, options.customRomajiMapping);
    }
    const config = Object.assign({}, { isDestinationRomaji: true }, options);
    return applyMapping(katakanaToHiragana(input, toRomaji, config), map, !options.IMEMode);
}

/**
 * Tests a character. Returns true if the character is considered English punctuation.
 * @param  {String} char character string to test
 * @return {Boolean}
 */
function isCharEnglishPunctuation(char = '') {
    if (isEmpty(char))
        return false;
    return EN_PUNCTUATION_RANGES.some(([start, end]) => isCharInRange(char, start, end));
}

/**
 * Convert input to [Hiragana](https://en.wikipedia.org/wiki/Hiragana)
 * @param  {String} [input=''] text
 * @param  {DefaultOptions} [options=defaultOptions]
 * @return {String} converted text
 * @example
 * toHiragana('toukyou, オオサカ')
 * // => 'とうきょう、　おおさか'
 * toHiragana('only カナ', { passRomaji: true })
 * // => 'only かな'
 * toHiragana('wi')
 * // => 'うぃ'
 * toHiragana('wi', { useObsoleteKana: true })
 * // => 'ゐ'
 */
function toHiragana(input = '', options = {}) {
    const config = mergeWithDefaultOptions(options);
    if (config.passRomaji) {
        return katakanaToHiragana(input, toRomaji, config);
    }
    if (isMixed(input, { passKanji: true })) {
        const convertedKatakana = katakanaToHiragana(input, toRomaji, config);
        return toKana(convertedKatakana.toLowerCase(), config);
    }
    if (isRomaji(input) || isCharEnglishPunctuation(input)) {
        return toKana(input.toLowerCase(), config);
    }
    return katakanaToHiragana(input, toRomaji, config);
}

/**
 * Convert input to [Katakana](https://en.wikipedia.org/wiki/Katakana)
 * @param  {String} [input=''] text
 * @param  {DefaultOptions} [options=defaultOptions]
 * @return {String} converted text
 * @example
 * toKatakana('toukyou, おおさか')
 * // => 'トウキョウ、　オオサカ'
 * toKatakana('only かな', { passRomaji: true })
 * // => 'only カナ'
 * toKatakana('wi')
 * // => 'ウィ'
 * toKatakana('wi', { useObsoleteKana: true })
 * // => 'ヰ'
 */
function toKatakana(input = '', options = {}) {
    const mergedOptions = mergeWithDefaultOptions(options);
    if (mergedOptions.passRomaji) {
        return hiraganaToKatakana(input);
    }
    if (isMixed(input) || isRomaji(input) || isCharEnglishPunctuation(input)) {
        const hiragana = toKana(input.toLowerCase(), mergedOptions);
        return hiraganaToKatakana(hiragana);
    }
    return hiraganaToKatakana(input);
}

// src/viterbi/ViterbiNode.ts
var ViterbiNode = class {
  start_pos;
  length;
  name;
  cost;
  left_id;
  right_id;
  prev;
  surface_form;
  shortest_cost;
  type;
  constructor(node_name, node_cost, start_pos, length, type, left_id, right_id, surface_form) {
    this.name = node_name;
    this.cost = node_cost;
    this.start_pos = start_pos;
    this.length = length;
    this.left_id = left_id;
    this.right_id = right_id;
    this.prev = null;
    this.surface_form = surface_form;
    if (type === "BOS") {
      this.shortest_cost = 0;
    } else {
      this.shortest_cost = Number.MAX_VALUE;
    }
    this.type = type;
  }
};
var ViterbiNode_default = ViterbiNode;

// src/viterbi/ViterbiLattice.ts
var ViterbiLattice = class {
  nodes_end_at;
  eos_pos;
  constructor() {
    this.nodes_end_at = [];
    this.nodes_end_at[0] = [new ViterbiNode_default(-1, 0, 0, 0, "BOS", 0, 0, "")];
    this.eos_pos = 1;
  }
  append(node) {
    const last_pos = node.start_pos + node.length - 1;
    if (this.eos_pos < last_pos) {
      this.eos_pos = last_pos;
    }
    let prev_nodes = this.nodes_end_at[last_pos];
    if (prev_nodes == null) {
      prev_nodes = [];
    }
    prev_nodes.push(node);
    this.nodes_end_at[last_pos] = prev_nodes;
  }
  appendEos() {
    const last_index = this.nodes_end_at.length;
    this.eos_pos++;
    this.nodes_end_at[last_index] = [
      new ViterbiNode_default(-1, 0, this.eos_pos, 0, "EOS", 0, 0, "")
    ];
  }
};
var ViterbiLattice_default = ViterbiLattice;

// src/util/SurrogateAwareString.ts
var SurrogateAwareString = class _SurrogateAwareString {
  length;
  str;
  index_mapping;
  constructor(str) {
    this.str = str;
    this.index_mapping = [];
    for (let pos = 0; pos < str.length; pos++) {
      const ch = str.charAt(pos);
      this.index_mapping.push(pos);
      if (_SurrogateAwareString.isSurrogatePair(ch)) {
        pos++;
      }
    }
    this.length = this.index_mapping.length;
  }
  slice(index) {
    if (this.index_mapping.length <= index) {
      return "";
    }
    const surrogate_aware_index = this.index_mapping[index];
    return this.str.slice(surrogate_aware_index);
  }
  charAt(index) {
    if (this.str.length <= index) {
      return "";
    }
    const surrogate_aware_start_index = this.index_mapping[index];
    const surrogate_aware_end_index = this.index_mapping[index + 1];
    if (surrogate_aware_end_index == null) {
      return this.str.slice(surrogate_aware_start_index);
    }
    return this.str.slice(
      surrogate_aware_start_index,
      surrogate_aware_end_index
    );
  }
  charCodeAt(index) {
    if (this.index_mapping.length <= index) {
      return NaN;
    }
    const surrogate_aware_index = this.index_mapping[index];
    const upper = this.str.charCodeAt(surrogate_aware_index);
    let lower;
    if (upper >= 55296 && upper <= 56319 && surrogate_aware_index < this.str.length) {
      lower = this.str.charCodeAt(surrogate_aware_index + 1);
      if (lower >= 56320 && lower <= 57343) {
        return (upper - 55296) * 1024 + lower - 56320 + 65536;
      }
    }
    return upper;
  }
  toString() {
    return this.str;
  }
  static isSurrogatePair(ch) {
    const utf16_code = ch.charCodeAt(0);
    if (utf16_code >= 55296 && utf16_code <= 56319) {
      return true;
    } else {
      return false;
    }
  }
};
var SurrogateAwareString_default = SurrogateAwareString;

// src/viterbi/ViterbiBuilder.ts
var ViterbiBuilder = class {
  trie;
  token_info_dictionary;
  unknown_dictionary;
  constructor(dic) {
    this.trie = dic.trie;
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
  }
  build(sentence_str) {
    const lattice = new ViterbiLattice_default();
    const sentence = new SurrogateAwareString_default(sentence_str);
    let key, trie_id, left_id, right_id, word_cost;
    for (let pos = 0; pos < sentence.length; pos++) {
      const tail = sentence.slice(pos);
      const vocabulary = this.trie.commonPrefixSearch(tail);
      for (let n = 0; n < vocabulary.length; n++) {
        trie_id = vocabulary[n].v;
        key = vocabulary[n].k;
        const token_info_ids = this.token_info_dictionary.target_map[trie_id];
        for (let i = 0; i < token_info_ids.length; i++) {
          const token_info_id = parseInt(
            // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string'.ts(2345)
            token_info_ids[i]
          );
          left_id = this.token_info_dictionary.dictionary.getShort(token_info_id);
          right_id = this.token_info_dictionary.dictionary.getShort(
            token_info_id + 2
          );
          word_cost = this.token_info_dictionary.dictionary.getShort(
            token_info_id + 4
          );
          lattice.append(
            new ViterbiNode_default(
              token_info_id,
              word_cost,
              pos + 1,
              key.length,
              "KNOWN",
              left_id,
              right_id,
              key
            )
          );
        }
      }
      const surrogate_aware_tail = new SurrogateAwareString_default(tail);
      const head_char = new SurrogateAwareString_default(surrogate_aware_tail.charAt(0));
      const head_char_class = this.unknown_dictionary.lookup(
        head_char.toString()
      );
      if (!head_char_class) {
        throw new Error("Unknown character: " + head_char);
      }
      if (vocabulary == null || vocabulary.length === 0 || head_char_class.is_always_invoke === 1) {
        key = head_char;
        if (head_char_class.is_grouping === 1 && 1 < surrogate_aware_tail.length) {
          for (let k = 1; k < surrogate_aware_tail.length; k++) {
            const next_char = surrogate_aware_tail.charAt(k);
            const next_char_class = this.unknown_dictionary.lookup(next_char);
            if (head_char_class.class_name !== next_char_class.class_name) {
              break;
            }
            key += next_char;
          }
        }
        const unk_ids = this.unknown_dictionary.target_map[head_char_class.class_id];
        for (let j = 0; j < unk_ids.length; j++) {
          const unk_id = parseInt(
            // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string'.ts(2345)
            unk_ids[j]
          );
          left_id = this.unknown_dictionary.dictionary.getShort(unk_id);
          right_id = this.unknown_dictionary.dictionary.getShort(unk_id + 2);
          word_cost = this.unknown_dictionary.dictionary.getShort(unk_id + 4);
          lattice.append(
            new ViterbiNode_default(
              unk_id,
              word_cost,
              pos + 1,
              key.length,
              "UNKNOWN",
              left_id,
              right_id,
              key.toString()
            )
          );
        }
      }
    }
    lattice.appendEos();
    return lattice;
  }
};
var ViterbiBuilder_default = ViterbiBuilder;

// src/viterbi/ViterbiSearcher.ts
var ViterbiSearcher = class {
  connection_costs;
  constructor(connection_costs) {
    this.connection_costs = connection_costs;
  }
  search(lattice) {
    lattice = this.forward(lattice);
    return this.backward(lattice);
  }
  forward(lattice) {
    let i, j, k;
    for (i = 1; i <= lattice.eos_pos; i++) {
      const nodes = lattice.nodes_end_at[i];
      if (nodes == null) {
        continue;
      }
      for (j = 0; j < nodes.length; j++) {
        const node = nodes[j];
        let cost = Number.MAX_VALUE;
        let shortest_prev_node = null;
        const prev_nodes = lattice.nodes_end_at[node.start_pos - 1];
        if (prev_nodes == null) {
          continue;
        }
        for (k = 0; k < prev_nodes.length; k++) {
          const prev_node = prev_nodes[k];
          let edge_cost;
          if (node.left_id == null || prev_node.right_id == null) {
            console.log("Left or right is null");
            edge_cost = 0;
          } else {
            edge_cost = this.connection_costs.get(
              prev_node.right_id,
              node.left_id
            );
          }
          const _cost = prev_node.shortest_cost + edge_cost + node.cost;
          if (_cost < cost) {
            shortest_prev_node = prev_node;
            cost = _cost;
          }
        }
        node.prev = shortest_prev_node;
        node.shortest_cost = cost;
      }
    }
    return lattice;
  }
  backward(lattice) {
    const shortest_path = [];
    const eos = lattice.nodes_end_at[lattice.nodes_end_at.length - 1][0];
    let node_back = eos.prev;
    if (node_back == null) {
      return [];
    }
    while (node_back.type !== "BOS") {
      shortest_path.push(node_back);
      if (node_back.prev == null) {
        return [];
      }
      node_back = node_back.prev;
    }
    return shortest_path.reverse();
  }
};
var ViterbiSearcher_default = ViterbiSearcher;

// src/util/IpadicFormatter.ts
var IpadicFormatter = class {
  formatEntry(word_id, position, type, features) {
    const token = {};
    token.word_id = word_id;
    token.word_type = type;
    token.word_position = position;
    token.surface_form = features[0];
    token.pos = features[1];
    token.pos_detail_1 = features[2];
    token.pos_detail_2 = features[3];
    token.pos_detail_3 = features[4];
    token.conjugated_type = features[5];
    token.conjugated_form = features[6];
    token.basic_form = features[7];
    token.reading = features[8];
    token.pronunciation = features[9];
    return token;
  }
  formatUnknownEntry(word_id, position, type, features, surface_form) {
    const token = {};
    token.word_id = word_id;
    token.word_type = type;
    token.word_position = position;
    token.surface_form = surface_form;
    token.pos = features[1];
    token.pos_detail_1 = features[2];
    token.pos_detail_2 = features[3];
    token.pos_detail_3 = features[4];
    token.conjugated_type = features[5];
    token.conjugated_form = features[6];
    token.basic_form = features[7];
    return token;
  }
};
var IpadicFormatter_default = IpadicFormatter;

// src/Tokenizer.ts
var PUNCTUATION = /、|。/;
var Tokenizer = class _Tokenizer {
  token_info_dictionary;
  unknown_dictionary;
  viterbi_builder;
  viterbi_searcher;
  formatter;
  constructor(dic) {
    this.token_info_dictionary = dic.token_info_dictionary;
    this.unknown_dictionary = dic.unknown_dictionary;
    this.viterbi_builder = new ViterbiBuilder_default(dic);
    this.viterbi_searcher = new ViterbiSearcher_default(dic.connection_costs);
    this.formatter = new IpadicFormatter_default();
  }
  tokenize(text) {
    const sentences = _Tokenizer.splitByPunctuation(text);
    const tokens = [];
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      this.tokenizeForSentence(sentence, tokens);
    }
    return tokens;
  }
  tokenizeForSentence(sentence, tokens) {
    if (tokens == null) {
      tokens = [];
    }
    const lattice = this.getLattice(sentence);
    const best_path = this.viterbi_searcher.search(lattice);
    let last_pos = 0;
    if (tokens.length > 0) {
      last_pos = tokens[tokens.length - 1].word_position;
    }
    for (let j = 0; j < best_path.length; j++) {
      const node = best_path[j];
      let token;
      let features;
      let features_line;
      if (node.type === "KNOWN") {
        features_line = this.token_info_dictionary.getFeatures(
          // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string'.ts(2345)
          node.name
        );
        if (features_line == null) {
          features = [];
        } else {
          features = features_line.split(",");
        }
        token = this.formatter.formatEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          features
        );
      } else if (node.type === "UNKNOWN") {
        features_line = this.unknown_dictionary.getFeatures(
          // @ts-expect-error Argument of type 'number' is not assignable to parameter of type 'string'.ts(2345)
          node.name
        );
        if (features_line == null) {
          features = [];
        } else {
          features = features_line.split(",");
        }
        token = this.formatter.formatUnknownEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          features,
          node.surface_form
        );
      } else {
        token = this.formatter.formatEntry(
          node.name,
          last_pos + node.start_pos,
          node.type,
          []
        );
      }
      tokens.push(token);
    }
    return tokens;
  }
  getLattice(text) {
    return this.viterbi_builder.build(text);
  }
  static splitByPunctuation(input) {
    const sentences = [];
    let tail = input;
    while (true) {
      if (tail === "") {
        break;
      }
      const index = tail.search(PUNCTUATION);
      if (index < 0) {
        sentences.push(tail);
        break;
      }
      sentences.push(tail.substring(0, index + 1));
      tail = tail.substring(index + 1);
    }
    return sentences;
  }
};
var Tokenizer_default = Tokenizer;

// src/vendor/doublearray/doublearray.js
var TERM_CHAR = "\0";
var TERM_CODE = 0;
var ROOT_ID = 0;
var NOT_FOUND = -1;
var BASE_SIGNED = true;
var CHECK_SIGNED = true;
var BASE_BYTES = 4;
var CHECK_BYTES = 4;
var MEMORY_EXPAND_RATIO = 2;
var newBC = function(initial_size) {
  if (initial_size == null) {
    initial_size = 1024;
  }
  let initBase = function(_base, start, end) {
    for (let i = start; i < end; i++) {
      _base[i] = -i + 1;
    }
    if (0 < check.array[check.array.length - 1]) {
      let last_used_id = check.array.length - 2;
      while (0 < check.array[last_used_id]) {
        last_used_id--;
      }
      _base[start] = -last_used_id;
    }
  };
  let initCheck = function(_check, start, end) {
    for (let i = start; i < end; i++) {
      _check[i] = -i - 1;
    }
  };
  let realloc = function(min_size) {
    let new_size = min_size * MEMORY_EXPAND_RATIO;
    let base_new_array = newArrayBuffer(base.signed, base.bytes, new_size);
    initBase(base_new_array, base.array.length, new_size);
    base_new_array.set(base.array);
    base.array = null;
    base.array = base_new_array;
    let check_new_array = newArrayBuffer(check.signed, check.bytes, new_size);
    initCheck(check_new_array, check.array.length, new_size);
    check_new_array.set(check.array);
    check.array = null;
    check.array = check_new_array;
  };
  let first_unused_node = ROOT_ID + 1;
  var base = {
    signed: BASE_SIGNED,
    bytes: BASE_BYTES,
    array: newArrayBuffer(BASE_SIGNED, BASE_BYTES, initial_size)
  };
  var check = {
    signed: CHECK_SIGNED,
    bytes: CHECK_BYTES,
    array: newArrayBuffer(CHECK_SIGNED, CHECK_BYTES, initial_size)
  };
  base.array[ROOT_ID] = 1;
  check.array[ROOT_ID] = ROOT_ID;
  initBase(base.array, ROOT_ID + 1, base.array.length);
  initCheck(check.array, ROOT_ID + 1, check.array.length);
  return {
    getBaseBuffer: function() {
      return base.array;
    },
    getCheckBuffer: function() {
      return check.array;
    },
    loadBaseBuffer: function(base_buffer) {
      base.array = base_buffer;
      return this;
    },
    loadCheckBuffer: function(check_buffer) {
      check.array = check_buffer;
      return this;
    },
    size: function() {
      return Math.max(base.array.length, check.array.length);
    },
    getBase: function(index) {
      if (base.array.length - 1 < index) {
        return -index + 1;
      }
      return base.array[index];
    },
    getCheck: function(index) {
      if (check.array.length - 1 < index) {
        return -index - 1;
      }
      return check.array[index];
    },
    setBase: function(index, base_value) {
      if (base.array.length - 1 < index) {
        realloc(index);
      }
      base.array[index] = base_value;
    },
    setCheck: function(index, check_value) {
      if (check.array.length - 1 < index) {
        realloc(index);
      }
      check.array[index] = check_value;
    },
    setFirstUnusedNode: function(index) {
      first_unused_node = index;
    },
    getFirstUnusedNode: function() {
      return first_unused_node;
    },
    shrink: function() {
      let last_index = this.size() - 1;
      while (true) {
        if (0 <= check.array[last_index]) {
          break;
        }
        last_index--;
      }
      base.array = base.array.subarray(0, last_index + 2);
      check.array = check.array.subarray(0, last_index + 2);
    },
    calc: function() {
      let unused_count = 0;
      let size = check.array.length;
      for (let i = 0; i < size; i++) {
        if (check.array[i] < 0) {
          unused_count++;
        }
      }
      return {
        all: size,
        unused: unused_count,
        efficiency: (size - unused_count) / size
      };
    },
    dump: function() {
      let dump_base = "";
      let dump_check = "";
      let i;
      for (i = 0; i < base.array.length; i++) {
        dump_base = dump_base + " " + this.getBase(i);
      }
      for (i = 0; i < check.array.length; i++) {
        dump_check = dump_check + " " + this.getCheck(i);
      }
      console.log("base:" + dump_base);
      console.log("chck:" + dump_check);
      return "base:" + dump_base + " chck:" + dump_check;
    }
  };
};
function DoubleArrayBuilder(initial_size) {
  this.bc = newBC(initial_size);
  this.keys = [];
}
DoubleArrayBuilder.prototype.append = function(key, record) {
  this.keys.push({ k: key, v: record });
  return this;
};
DoubleArrayBuilder.prototype.build = function(keys, sorted) {
  if (keys == null) {
    keys = this.keys;
  }
  if (keys == null) {
    return new DoubleArray(this.bc);
  }
  if (sorted == null) {
    sorted = false;
  }
  let buff_keys = keys.map(function(k) {
    return {
      k: stringToUtf8Bytes(k.k + TERM_CHAR),
      v: k.v
    };
  });
  if (sorted) {
    this.keys = buff_keys;
  } else {
    this.keys = buff_keys.sort(function(k1, k2) {
      const b1 = k1.k;
      const b2 = k2.k;
      const min_length = Math.min(b1.length, b2.length);
      for (let pos = 0; pos < min_length; pos++) {
        if (b1[pos] === b2[pos]) {
          continue;
        }
        return b1[pos] - b2[pos];
      }
      return b1.length - b2.length;
    });
  }
  buff_keys = null;
  this._build(ROOT_ID, 0, 0, this.keys.length);
  return new DoubleArray(this.bc);
};
DoubleArrayBuilder.prototype._build = function(parent_index, position, start, length) {
  const children_info = this.getChildrenInfo(position, start, length);
  const _base = this.findAllocatableBase(children_info);
  this.setBC(parent_index, children_info, _base);
  for (let i = 0; i < children_info.length; i = i + 3) {
    const child_code = children_info[i];
    if (child_code === TERM_CODE) {
      continue;
    }
    const child_start = children_info[i + 1];
    const child_len = children_info[i + 2];
    const child_index = _base + child_code;
    this._build(child_index, position + 1, child_start, child_len);
  }
};
DoubleArrayBuilder.prototype.getChildrenInfo = function(position, start, length) {
  let current_char = this.keys[start].k[position];
  let i = 0;
  let children_info = new Int32Array(length * 3);
  children_info[i++] = current_char;
  children_info[i++] = start;
  let next_pos = start;
  let start_pos = start;
  for (; next_pos < start + length; next_pos++) {
    const next_char = this.keys[next_pos].k[position];
    if (current_char !== next_char) {
      children_info[i++] = next_pos - start_pos;
      children_info[i++] = next_char;
      children_info[i++] = next_pos;
      current_char = next_char;
      start_pos = next_pos;
    }
  }
  children_info[i++] = next_pos - start_pos;
  children_info = children_info.subarray(0, i);
  return children_info;
};
DoubleArrayBuilder.prototype.setBC = function(parent_id, children_info, _base) {
  const bc = this.bc;
  bc.setBase(parent_id, _base);
  let i;
  for (i = 0; i < children_info.length; i = i + 3) {
    const code = children_info[i];
    const child_id = _base + code;
    const prev_unused_id = -bc.getBase(child_id);
    const next_unused_id = -bc.getCheck(child_id);
    if (child_id !== bc.getFirstUnusedNode()) {
      bc.setCheck(prev_unused_id, -next_unused_id);
    } else {
      bc.setFirstUnusedNode(next_unused_id);
    }
    bc.setBase(next_unused_id, -prev_unused_id);
    const check = parent_id;
    bc.setCheck(child_id, check);
    if (code === TERM_CODE) {
      const start_pos = children_info[i + 1];
      let value = this.keys[start_pos].v;
      if (value == null) {
        value = 0;
      }
      const base = -value - 1;
      bc.setBase(child_id, base);
    }
  }
};
DoubleArrayBuilder.prototype.findAllocatableBase = function(children_info) {
  const bc = this.bc;
  let _base;
  let curr = bc.getFirstUnusedNode();
  while (true) {
    _base = curr - children_info[0];
    if (_base < 0) {
      curr = -bc.getCheck(curr);
      continue;
    }
    let empty_area_found = true;
    for (let i = 0; i < children_info.length; i = i + 3) {
      const code = children_info[i];
      const candidate_id = _base + code;
      if (!this.isUnusedNode(candidate_id)) {
        curr = -bc.getCheck(curr);
        empty_area_found = false;
        break;
      }
    }
    if (empty_area_found) {
      return _base;
    }
  }
};
DoubleArrayBuilder.prototype.isUnusedNode = function(index) {
  const bc = this.bc;
  const check = bc.getCheck(index);
  if (index === ROOT_ID) {
    return false;
  }
  if (check < 0) {
    return true;
  }
  return false;
};
function DoubleArray(bc) {
  this.bc = bc;
  this.bc.shrink();
}
DoubleArray.prototype.contain = function(key) {
  const bc = this.bc;
  key += TERM_CHAR;
  const buffer = stringToUtf8Bytes(key);
  let parent = ROOT_ID;
  let child = NOT_FOUND;
  for (let i = 0; i < buffer.length; i++) {
    const code = buffer[i];
    child = this.traverse(parent, code);
    if (child === NOT_FOUND) {
      return false;
    }
    if (bc.getBase(child) <= 0) {
      return true;
    } else {
      parent = child;
      continue;
    }
  }
  return false;
};
DoubleArray.prototype.lookup = function(key) {
  key += TERM_CHAR;
  const buffer = stringToUtf8Bytes(key);
  let parent = ROOT_ID;
  let child = NOT_FOUND;
  for (let i = 0; i < buffer.length; i++) {
    const code = buffer[i];
    child = this.traverse(parent, code);
    if (child === NOT_FOUND) {
      return NOT_FOUND;
    }
    parent = child;
  }
  const base = this.bc.getBase(child);
  if (base <= 0) {
    return -base - 1;
  } else {
    return NOT_FOUND;
  }
};
DoubleArray.prototype.commonPrefixSearch = function(key) {
  const buffer = stringToUtf8Bytes(key);
  let parent = ROOT_ID;
  let child = NOT_FOUND;
  const result = [];
  for (let i = 0; i < buffer.length; i++) {
    const code = buffer[i];
    child = this.traverse(parent, code);
    if (child !== NOT_FOUND) {
      parent = child;
      const grand_child = this.traverse(child, TERM_CODE);
      if (grand_child !== NOT_FOUND) {
        const base = this.bc.getBase(grand_child);
        const r = {};
        if (base <= 0) {
          r.v = -base - 1;
        }
        r.k = utf8BytesToString(arrayCopy(buffer, 0, i + 1));
        result.push(r);
      }
      continue;
    } else {
      break;
    }
  }
  return result;
};
DoubleArray.prototype.traverse = function(parent, code) {
  const child = this.bc.getBase(parent) + code;
  if (this.bc.getCheck(child) === parent) {
    return child;
  } else {
    return NOT_FOUND;
  }
};
DoubleArray.prototype.size = function() {
  return this.bc.size();
};
DoubleArray.prototype.calc = function() {
  return this.bc.calc();
};
DoubleArray.prototype.dump = function() {
  return this.bc.dump();
};
var newArrayBuffer = function(signed, bytes, size) {
  {
    switch (bytes) {
      case 1:
        return new Int8Array(size);
      case 2:
        return new Int16Array(size);
      case 4:
        return new Int32Array(size);
      default:
        throw new RangeError(
          "Invalid newArray parameter element_bytes:" + bytes
        );
    }
  }
};
var arrayCopy = function(src, src_offset, length) {
  const buffer = new ArrayBuffer(length);
  const dstU8 = new Uint8Array(buffer, 0, length);
  const srcU8 = src.subarray(src_offset, length);
  dstU8.set(srcU8);
  return dstU8;
};
var stringToUtf8Bytes = function(str) {
  const bytes = new Uint8Array(new ArrayBuffer(str.length * 4));
  let i = 0, j = 0;
  while (i < str.length) {
    var unicode_code;
    const utf16_code = str.charCodeAt(i++);
    if (utf16_code >= 55296 && utf16_code <= 56319) {
      const upper = utf16_code;
      const lower = str.charCodeAt(i++);
      if (lower >= 56320 && lower <= 57343) {
        unicode_code = (upper - 55296) * (1 << 10) + (1 << 16) + (lower - 56320);
      } else {
        return null;
      }
    } else {
      unicode_code = utf16_code;
    }
    if (unicode_code < 128) {
      bytes[j++] = unicode_code;
    } else if (unicode_code < 1 << 11) {
      bytes[j++] = unicode_code >>> 6 | 192;
      bytes[j++] = unicode_code & 63 | 128;
    } else if (unicode_code < 1 << 16) {
      bytes[j++] = unicode_code >>> 12 | 224;
      bytes[j++] = unicode_code >> 6 & 63 | 128;
      bytes[j++] = unicode_code & 63 | 128;
    } else if (unicode_code < 1 << 21) {
      bytes[j++] = unicode_code >>> 18 | 240;
      bytes[j++] = unicode_code >> 12 & 63 | 128;
      bytes[j++] = unicode_code >> 6 & 63 | 128;
      bytes[j++] = unicode_code & 63 | 128;
    } else ;
  }
  return bytes.subarray(0, j);
};
var utf8BytesToString = function(bytes) {
  let str = "";
  let code, b1, b2, b3, b4, upper, lower;
  let i = 0;
  while (i < bytes.length) {
    b1 = bytes[i++];
    if (b1 < 128) {
      code = b1;
    } else if (b1 >> 5 === 6) {
      b2 = bytes[i++];
      code = (b1 & 31) << 6 | b2 & 63;
    } else if (b1 >> 4 === 14) {
      b2 = bytes[i++];
      b3 = bytes[i++];
      code = (b1 & 15) << 12 | (b2 & 63) << 6 | b3 & 63;
    } else {
      b2 = bytes[i++];
      b3 = bytes[i++];
      b4 = bytes[i++];
      code = (b1 & 7) << 18 | (b2 & 63) << 12 | (b3 & 63) << 6 | b4 & 63;
    }
    if (code < 65536) {
      str += String.fromCharCode(code);
    } else {
      code -= 65536;
      upper = 55296 | code >> 10;
      lower = 56320 | code & 1023;
      str += String.fromCharCode(upper, lower);
    }
  }
  return str;
};
function builder(initial_size) {
  return new DoubleArrayBuilder(initial_size);
}
function load(base_buffer, check_buffer) {
  let bc = newBC(0);
  bc.loadBaseBuffer(base_buffer);
  bc.loadCheckBuffer(check_buffer);
  return new DoubleArray(bc);
}

// src/util/ByteBuffer.ts
var stringToUtf8Bytes2 = function(str) {
  const bytes = new Uint8Array(str.length * 4);
  let i = 0, j = 0;
  while (i < str.length) {
    let unicode_code;
    const utf16_code = str.charCodeAt(i++);
    if (utf16_code >= 55296 && utf16_code <= 56319) {
      const upper = utf16_code;
      const lower = str.charCodeAt(i++);
      if (lower >= 56320 && lower <= 57343) {
        unicode_code = (upper - 55296) * (1 << 10) + (1 << 16) + (lower - 56320);
      } else {
        return null;
      }
    } else {
      unicode_code = utf16_code;
    }
    if (unicode_code < 128) {
      bytes[j++] = unicode_code;
    } else if (unicode_code < 1 << 11) {
      bytes[j++] = unicode_code >>> 6 | 192;
      bytes[j++] = unicode_code & 63 | 128;
    } else if (unicode_code < 1 << 16) {
      bytes[j++] = unicode_code >>> 12 | 224;
      bytes[j++] = unicode_code >> 6 & 63 | 128;
      bytes[j++] = unicode_code & 63 | 128;
    } else if (unicode_code < 1 << 21) {
      bytes[j++] = unicode_code >>> 18 | 240;
      bytes[j++] = unicode_code >> 12 & 63 | 128;
      bytes[j++] = unicode_code >> 6 & 63 | 128;
      bytes[j++] = unicode_code & 63 | 128;
    } else ;
  }
  return bytes.subarray(0, j);
};
var utf8BytesToString2 = function(bytes) {
  let str = "";
  let code, b1, b2, b3, b4, upper, lower;
  let i = 0;
  while (i < bytes.length) {
    b1 = bytes[i++];
    if (b1 < 128) {
      code = b1;
    } else if (b1 >> 5 === 6) {
      b2 = bytes[i++];
      code = (b1 & 31) << 6 | b2 & 63;
    } else if (b1 >> 4 === 14) {
      b2 = bytes[i++];
      b3 = bytes[i++];
      code = (b1 & 15) << 12 | (b2 & 63) << 6 | b3 & 63;
    } else {
      b2 = bytes[i++];
      b3 = bytes[i++];
      b4 = bytes[i++];
      code = (b1 & 7) << 18 | (b2 & 63) << 12 | (b3 & 63) << 6 | b4 & 63;
    }
    if (code < 65536) {
      str += String.fromCharCode(code);
    } else {
      code -= 65536;
      upper = 55296 | code >> 10;
      lower = 56320 | code & 1023;
      str += String.fromCharCode(upper, lower);
    }
  }
  return str;
};
var ByteBuffer = class {
  buffer;
  position;
  constructor(arg) {
    let initial_size;
    if (arg == null) {
      initial_size = 1024 * 1024;
    } else if (typeof arg === "number") {
      initial_size = arg;
    } else if (arg instanceof Uint8Array) {
      this.buffer = arg;
      this.position = 0;
      return;
    } else {
      throw typeof arg + " is invalid parameter type for ByteBuffer constructor";
    }
    this.buffer = new Uint8Array(initial_size);
    this.position = 0;
  }
  size() {
    return this.buffer.length;
  }
  reallocate() {
    const new_array = new Uint8Array(this.buffer.length * 2);
    new_array.set(this.buffer);
    this.buffer = new_array;
  }
  shrink() {
    this.buffer = this.buffer.subarray(0, this.position);
    return this.buffer;
  }
  put(b) {
    if (this.buffer.length < this.position + 1) {
      this.reallocate();
    }
    this.buffer[this.position++] = b;
  }
  get(index) {
    if (index == null) {
      index = this.position;
      this.position += 1;
    }
    if (this.buffer.length < index + 1) {
      return 0;
    }
    return this.buffer[index];
  }
  putShort(num) {
    if (65535 < num) {
      throw num + " is over short value";
    }
    const lower = 255 & num;
    const upper = (65280 & num) >> 8;
    this.put(lower);
    this.put(upper);
  }
  getShort(index) {
    if (index == null) {
      index = this.position;
      this.position += 2;
    }
    if (this.buffer.length < index + 2) {
      return 0;
    }
    const lower = this.buffer[index];
    const upper = this.buffer[index + 1];
    let value = (upper << 8) + lower;
    if (value & 32768) {
      value = -(value - 1 ^ 65535);
    }
    return value;
  }
  putInt(num) {
    if (4294967295 < num) {
      throw num + " is over integer value";
    }
    const b0 = 255 & num;
    const b1 = (65280 & num) >> 8;
    const b2 = (16711680 & num) >> 16;
    const b3 = (4278190080 & num) >> 24;
    this.put(b0);
    this.put(b1);
    this.put(b2);
    this.put(b3);
  }
  getInt(index) {
    if (index == null) {
      index = this.position;
      this.position += 4;
    }
    if (this.buffer.length < index + 4) {
      return 0;
    }
    const b0 = this.buffer[index];
    const b1 = this.buffer[index + 1];
    const b2 = this.buffer[index + 2];
    const b3 = this.buffer[index + 3];
    return (b3 << 24) + (b2 << 16) + (b1 << 8) + b0;
  }
  readInt() {
    const pos = this.position;
    this.position += 4;
    return this.getInt(pos);
  }
  putString(str) {
    const bytes = stringToUtf8Bytes2(str);
    for (let i = 0; i < bytes.length; i++) {
      this.put(bytes[i]);
    }
    this.put(0);
  }
  getString(index) {
    const buf = [];
    let ch;
    if (index == null) {
      index = this.position;
    }
    while (true) {
      if (this.buffer.length < index + 1) {
        break;
      }
      ch = this.get(index++);
      if (ch === 0) {
        break;
      } else {
        buf.push(ch);
      }
    }
    this.position = index;
    return utf8BytesToString2(buf);
  }
};
var ByteBuffer_default = ByteBuffer;

// src/dict/TokenInfoDictionary.ts
var TokenInfoDictionary = class {
  dictionary;
  target_map;
  pos_buffer;
  constructor() {
    this.dictionary = new ByteBuffer_default(10 * 1024 * 1024);
    this.target_map = {};
    this.pos_buffer = new ByteBuffer_default(10 * 1024 * 1024);
  }
  buildDictionary(entries) {
    const dictionary_entries = {};
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.length < 4) {
        continue;
      }
      const surface_form = entry[0];
      const left_id = entry[1];
      const right_id = entry[2];
      const word_cost = entry[3];
      const feature = entry.slice(4).join(",");
      if (!isFinite(left_id) || !isFinite(right_id) || !isFinite(word_cost)) {
        console.log(entry);
      }
      const token_info_id = this.put(
        left_id,
        right_id,
        word_cost,
        surface_form,
        feature
      );
      dictionary_entries[token_info_id] = surface_form;
    }
    this.dictionary.shrink();
    this.pos_buffer.shrink();
    return dictionary_entries;
  }
  put(left_id, right_id, word_cost, surface_form, feature) {
    const token_info_id = this.dictionary.position;
    const pos_id = this.pos_buffer.position;
    this.dictionary.putShort(left_id);
    this.dictionary.putShort(right_id);
    this.dictionary.putShort(word_cost);
    this.dictionary.putInt(pos_id);
    this.pos_buffer.putString(surface_form + "," + feature);
    return token_info_id;
  }
  addMapping(source, target) {
    let mapping = this.target_map[source];
    if (mapping == null) {
      mapping = [];
    }
    mapping.push(target);
    this.target_map[source] = mapping;
  }
  targetMapToBuffer() {
    const buffer = new ByteBuffer_default();
    const map_keys_size = Object.keys(this.target_map).length;
    buffer.putInt(map_keys_size);
    for (const key in this.target_map) {
      const values = this.target_map[key];
      const map_values_size = values.length;
      buffer.putInt(parseInt(key));
      buffer.putInt(map_values_size);
      for (let i = 0; i < values.length; i++) {
        buffer.putInt(values[i]);
      }
    }
    return buffer.shrink();
  }
  loadDictionary(array_buffer) {
    this.dictionary = new ByteBuffer_default(array_buffer);
    return this;
  }
  loadPosVector(array_buffer) {
    this.pos_buffer = new ByteBuffer_default(array_buffer);
    return this;
  }
  loadTargetMap(array_buffer) {
    const buffer = new ByteBuffer_default(array_buffer);
    buffer.position = 0;
    this.target_map = {};
    buffer.readInt();
    while (true) {
      if (buffer.buffer.length < buffer.position + 1) {
        break;
      }
      const key = buffer.readInt();
      const map_values_size = buffer.readInt();
      for (let i = 0; i < map_values_size; i++) {
        const value = buffer.readInt();
        this.addMapping(key, value);
      }
    }
    return this;
  }
  getFeatures(token_info_id_str) {
    const token_info_id = parseInt(token_info_id_str);
    if (isNaN(token_info_id)) {
      return "";
    }
    const pos_id = this.dictionary.getInt(token_info_id + 6);
    return this.pos_buffer.getString(pos_id);
  }
};
var TokenInfoDictionary_default = TokenInfoDictionary;

// src/dict/ConnectionCosts.ts
var ConnectionCosts = class {
  forward_dimension;
  backward_dimension;
  buffer;
  constructor(forward_dimension, backward_dimension) {
    this.forward_dimension = forward_dimension;
    this.backward_dimension = backward_dimension;
    this.buffer = new Int16Array(forward_dimension * backward_dimension + 2);
    this.buffer[0] = forward_dimension;
    this.buffer[1] = backward_dimension;
  }
  put(forward_id, backward_id, cost) {
    const index = forward_id * this.backward_dimension + backward_id + 2;
    if (this.buffer.length < index + 1) {
      throw "ConnectionCosts buffer overflow";
    }
    this.buffer[index] = cost;
  }
  get(forward_id, backward_id) {
    const index = forward_id * this.backward_dimension + backward_id + 2;
    if (this.buffer.length < index + 1) {
      throw "ConnectionCosts buffer overflow";
    }
    return this.buffer[index];
  }
  loadConnectionCosts(connection_costs_buffer) {
    this.forward_dimension = connection_costs_buffer[0];
    this.backward_dimension = connection_costs_buffer[1];
    this.buffer = connection_costs_buffer;
  }
};
var ConnectionCosts_default = ConnectionCosts;

// src/dict/CharacterClass.ts
var CharacterClass = class {
  class_id;
  class_name;
  is_always_invoke;
  is_grouping;
  max_length;
  constructor(class_id, class_name, is_always_invoke, is_grouping, max_length) {
    this.class_id = class_id;
    this.class_name = class_name;
    this.is_always_invoke = is_always_invoke;
    this.is_grouping = is_grouping;
    this.max_length = max_length;
  }
};
var CharacterClass_default = CharacterClass;

// src/dict/InvokeDefinitionMap.ts
var InvokeDefinitionMap = class _InvokeDefinitionMap {
  map;
  lookup_table;
  constructor() {
    this.map = [];
    this.lookup_table = {};
  }
  init(character_category_definition) {
    if (character_category_definition == null) {
      return;
    }
    for (let i = 0; i < character_category_definition.length; i++) {
      const character_class = character_category_definition[i];
      this.map[i] = character_class;
      this.lookup_table[character_class.class_name] = i;
    }
  }
  getCharacterClass(class_id) {
    return this.map[class_id];
  }
  lookup(class_name) {
    const class_id = this.lookup_table[class_name];
    if (class_id == null) {
      return null;
    }
    return class_id;
  }
  toBuffer() {
    const buffer = new ByteBuffer_default();
    for (let i = 0; i < this.map.length; i++) {
      const char_class = this.map[i];
      buffer.put(char_class.is_always_invoke);
      buffer.put(char_class.is_grouping);
      buffer.putInt(char_class.max_length);
      buffer.putString(char_class.class_name);
    }
    buffer.shrink();
    return buffer.buffer;
  }
  static load(invoke_def_buffer) {
    const invoke_def = new _InvokeDefinitionMap();
    const character_category_definition = [];
    const buffer = new ByteBuffer_default(invoke_def_buffer);
    while (buffer.position + 1 < buffer.size()) {
      const class_id = character_category_definition.length;
      const is_always_invoke = buffer.get();
      const is_grouping = buffer.get();
      const max_length = buffer.getInt();
      const class_name = buffer.getString();
      character_category_definition.push(
        new CharacterClass_default(
          class_id,
          class_name,
          is_always_invoke,
          is_grouping,
          max_length
        )
      );
    }
    invoke_def.init(character_category_definition);
    return invoke_def;
  }
};
var InvokeDefinitionMap_default = InvokeDefinitionMap;

// src/dict/CharacterDefinition.ts
var DEFAULT_CATEGORY = "DEFAULT";
var CharacterDefinition = class _CharacterDefinition {
  character_category_map;
  compatible_category_map;
  invoke_definition_map;
  constructor() {
    this.character_category_map = new Uint8Array(65536);
    this.compatible_category_map = new Uint32Array(65536);
    this.invoke_definition_map = null;
  }
  initCategoryMappings(category_mapping) {
    let code_point;
    if (category_mapping != null) {
      for (let i = 0; i < category_mapping.length; i++) {
        const mapping = category_mapping[i];
        const end = mapping.end || mapping.start;
        for (code_point = mapping.start; code_point <= end; code_point++) {
          this.character_category_map[code_point] = this.invoke_definition_map.lookup(mapping.default);
          for (let j = 0; j < mapping.compatible.length; j++) {
            let bitset = this.compatible_category_map[code_point];
            const compatible_category = mapping.compatible[j];
            if (compatible_category == null) {
              continue;
            }
            const class_id = this.invoke_definition_map.lookup(compatible_category);
            if (class_id == null) {
              continue;
            }
            const class_id_bit = 1 << class_id;
            bitset = bitset | class_id_bit;
            this.compatible_category_map[code_point] = bitset;
          }
        }
      }
    }
    const default_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    if (default_id == null) {
      return;
    }
    for (code_point = 0; code_point < this.character_category_map.length; code_point++) {
      if (this.character_category_map[code_point] === 0) {
        this.character_category_map[code_point] = 1 << default_id;
      }
    }
  }
  lookupCompatibleCategory(ch) {
    const classes = [];
    const code = ch.charCodeAt(0);
    let integer;
    if (code < this.compatible_category_map.length) {
      integer = this.compatible_category_map[code];
    }
    if (integer == null || integer === 0) {
      return classes;
    }
    for (let bit = 0; bit < 32; bit++) {
      if (integer << 31 - bit >>> 31 === 1) {
        const character_class = this.invoke_definition_map.getCharacterClass(bit);
        if (character_class == null) {
          continue;
        }
        classes.push(character_class);
      }
    }
    return classes;
  }
  lookup(ch) {
    let class_id;
    const code = ch.charCodeAt(0);
    if (SurrogateAwareString_default.isSurrogatePair(ch)) {
      class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    } else if (code < this.character_category_map.length) {
      class_id = this.character_category_map[code];
    }
    if (class_id == null) {
      class_id = this.invoke_definition_map.lookup(DEFAULT_CATEGORY);
    }
    return this.invoke_definition_map.getCharacterClass(class_id);
  }
  static load(cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    const char_def = new _CharacterDefinition();
    char_def.character_category_map = cat_map_buffer;
    char_def.compatible_category_map = compat_cat_map_buffer;
    char_def.invoke_definition_map = InvokeDefinitionMap_default.load(invoke_def_buffer);
    return char_def;
  }
  static parseCharCategory(class_id, parsed_category_def) {
    const category = parsed_category_def[1];
    const invoke = parseInt(parsed_category_def[2]);
    const grouping = parseInt(parsed_category_def[3]);
    const max_length = parseInt(parsed_category_def[4]);
    if (!isFinite(invoke) || invoke !== 0 && invoke !== 1) {
      console.log("char.def parse error. INVOKE is 0 or 1 in:" + invoke);
      return null;
    }
    if (!isFinite(grouping) || grouping !== 0 && grouping !== 1) {
      console.log("char.def parse error. GROUP is 0 or 1 in:" + grouping);
      return null;
    }
    if (!isFinite(max_length) || max_length < 0) {
      console.log("char.def parse error. LENGTH is 1 to n:" + max_length);
      return null;
    }
    const is_invoke = invoke === 1;
    const is_grouping = grouping === 1;
    return new CharacterClass_default(
      class_id,
      category,
      is_invoke,
      is_grouping,
      max_length
    );
  }
  static parseCategoryMapping(parsed_category_mapping) {
    const start = parseInt(parsed_category_mapping[1]);
    const default_category = parsed_category_mapping[2];
    const compatible_category = 3 < parsed_category_mapping.length ? parsed_category_mapping.slice(3) : [];
    if (!isFinite(start) || start < 0 || start > 65535) {
      console.log("char.def parse error. CODE is invalid:" + start);
    }
    return {
      start,
      default: default_category,
      compatible: compatible_category
    };
  }
  static parseRangeCategoryMapping(parsed_category_mapping) {
    const start = parseInt(parsed_category_mapping[1]);
    const end = parseInt(parsed_category_mapping[2]);
    const default_category = parsed_category_mapping[3];
    const compatible_category = 4 < parsed_category_mapping.length ? parsed_category_mapping.slice(4) : [];
    if (!isFinite(start) || start < 0 || start > 65535) {
      console.log("char.def parse error. CODE is invalid:" + start);
    }
    if (!isFinite(end) || end < 0 || end > 65535) {
      console.log("char.def parse error. CODE is invalid:" + end);
    }
    return {
      start,
      end,
      default: default_category,
      compatible: compatible_category
    };
  }
};
var CharacterDefinition_default = CharacterDefinition;

// src/dict/UnknownDictionary.ts
var UnknownDictionary = class extends TokenInfoDictionary_default {
  character_definition;
  constructor() {
    super();
    this.dictionary = new ByteBuffer_default(10 * 1024 * 1024);
    this.target_map = {};
    this.pos_buffer = new ByteBuffer_default(10 * 1024 * 1024);
    this.character_definition = null;
  }
  characterDefinition(character_definition) {
    this.character_definition = character_definition;
    return this;
  }
  lookup(ch) {
    return this.character_definition?.lookup(ch);
  }
  lookupCompatibleCategory(ch) {
    return this.character_definition?.lookupCompatibleCategory(ch);
  }
  loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    this.loadDictionary(unk_buffer);
    this.loadPosVector(unk_pos_buffer);
    this.loadTargetMap(unk_map_buffer);
    this.character_definition = CharacterDefinition_default.load(
      cat_map_buffer,
      compat_cat_map_buffer,
      invoke_def_buffer
    );
  }
};
var UnknownDictionary_default = UnknownDictionary;

// src/dict/DynamicDictionaries.ts
var DynamicDictionaries = class {
  trie;
  token_info_dictionary;
  connection_costs;
  unknown_dictionary;
  constructor(trie, token_info_dictionary, connection_costs, unknown_dictionary) {
    if (trie != null) {
      this.trie = trie;
    } else {
      this.trie = builder(0).build([{ k: "", v: 1 }]);
    }
    if (token_info_dictionary != null) {
      this.token_info_dictionary = token_info_dictionary;
    } else {
      this.token_info_dictionary = new TokenInfoDictionary_default();
    }
    if (connection_costs != null) {
      this.connection_costs = connection_costs;
    } else {
      this.connection_costs = new ConnectionCosts_default(0, 0);
    }
    if (unknown_dictionary != null) {
      this.unknown_dictionary = unknown_dictionary;
    } else {
      this.unknown_dictionary = new UnknownDictionary_default();
    }
  }
  loadTrie(base_buffer, check_buffer) {
    this.trie = load(base_buffer, check_buffer);
    return this;
  }
  loadTokenInfoDictionaries(token_info_buffer, pos_buffer, target_map_buffer) {
    this.token_info_dictionary.loadDictionary(token_info_buffer);
    this.token_info_dictionary.loadPosVector(pos_buffer);
    this.token_info_dictionary.loadTargetMap(target_map_buffer);
    return this;
  }
  loadConnectionCosts(cc_buffer) {
    this.connection_costs.loadConnectionCosts(cc_buffer);
    return this;
  }
  loadUnknownDictionaries(unk_buffer, unk_pos_buffer, unk_map_buffer, cat_map_buffer, compat_cat_map_buffer, invoke_def_buffer) {
    this.unknown_dictionary.loadUnknownDictionaries(
      unk_buffer,
      unk_pos_buffer,
      unk_map_buffer,
      cat_map_buffer,
      compat_cat_map_buffer,
      invoke_def_buffer
    );
    return this;
  }
};
var DynamicDictionaries_default = DynamicDictionaries;

// src/loader/DictionaryLoader.ts
async function loadDictionary(config) {
  const dic = new DynamicDictionaries_default();
  async function loadTrie() {
    const filenames = ["base.dat.gz", "check.dat.gz"];
    const buffers = await Promise.all(
      filenames.map((filename) => config.loadArrayBuffer(filename))
    );
    const base_buffer = new Int32Array(buffers[0]);
    const check_buffer = new Int32Array(buffers[1]);
    dic.loadTrie(base_buffer, check_buffer);
  }
  async function loadInfo() {
    const filenames = ["tid.dat.gz", "tid_pos.dat.gz", "tid_map.dat.gz"];
    const buffers = await Promise.all(
      filenames.map((filename) => config.loadArrayBuffer(filename))
    );
    const token_info_buffer = new Uint8Array(buffers[0]);
    const pos_buffer = new Uint8Array(buffers[1]);
    const target_map_buffer = new Uint8Array(buffers[2]);
    dic.loadTokenInfoDictionaries(
      token_info_buffer,
      pos_buffer,
      target_map_buffer
    );
  }
  async function loadCost() {
    const buffer = await config.loadArrayBuffer("cc.dat.gz");
    const cc_buffer = new Int16Array(buffer);
    dic.loadConnectionCosts(cc_buffer);
  }
  async function loadUnknown() {
    const filenames = [
      "unk.dat.gz",
      "unk_pos.dat.gz",
      "unk_map.dat.gz",
      "unk_char.dat.gz",
      "unk_compat.dat.gz",
      "unk_invoke.dat.gz"
    ];
    const buffers = await Promise.all(
      filenames.map((filename) => config.loadArrayBuffer(filename))
    );
    const unk_buffer = new Uint8Array(buffers[0]);
    const unk_pos_buffer = new Uint8Array(buffers[1]);
    const unk_map_buffer = new Uint8Array(buffers[2]);
    const cat_map_buffer = new Uint8Array(buffers[3]);
    const compat_cat_map_buffer = new Uint32Array(buffers[4]);
    const invoke_def_buffer = new Uint8Array(buffers[5]);
    dic.loadUnknownDictionaries(
      unk_buffer,
      unk_pos_buffer,
      unk_map_buffer,
      cat_map_buffer,
      compat_cat_map_buffer,
      invoke_def_buffer
    );
  }
  await Promise.all([loadTrie(), loadInfo(), loadCost(), loadUnknown()]);
  return dic;
}

// src/TokenizerBuilder.ts
var TokenizerBuilder = class {
  constructor(options) {
    this.options = options;
  }
  async build() {
    const dic = await loadDictionary(this.options.loader);
    return new Tokenizer_default(dic);
  }
};
var TokenizerBuilder_default = TokenizerBuilder;

/**
 * @license
 * Copyright 2019 Jomo Fisher
 * SPDX-License-Identifier: BSD-3-Clause
 */
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
const loader = {
    async loadArrayBuffer(url) {
        url = url.replace(/\.gz$/, '');
        const res = await fetch('https://cdn.jsdelivr.net/npm/@aiktb/kuromoji@1.0.2/dict/' + url);
        if (!res.ok) {
            throw new Error(`Failed to fetch ${url}: ${res.status}`);
        }
        return res.arrayBuffer();
    },
};
const tokenizerPromise = new TokenizerBuilder_default({ loader }).build();
function tokenize(text) {
    return tokenizerPromise.then((tokenizer) => tokenizer.tokenize(text));
}
/**
 * Recursive helper (unchanged).
 * @returns an array of token‐indices if `str` can be covered by a subsequence
 *          of `tokens[i].reading`, or `null` otherwise.
 */
function findMatch(tokens, str, startIdx, pos) {
    if (pos === str.length)
        return [];
    for (let i = startIdx; i < tokens.length; i++) {
        const r = tokens[i].reading;
        if (str.startsWith(r, pos)) {
            const rest = findMatch(tokens, str, i + 1, pos + r.length);
            if (rest)
                return [i, ...rest];
        }
    }
    return null;
}
/**
 * If given a flat Token[], tries to match & flip exactly as before.
 * If given Token[][], first picks only those sub‐arrays with the
 * **highest current count** of `marked===true`, and runs the flat logic
 * on them; all others return `{ matched: null }`.
 */
function markTokens(tokens, str) {
    // ——— Nested case ———
    if (tokens.length > 0 && Array.isArray(tokens[0])) {
        const groups = tokens;
        // 1) count how many are already marked in each subgroup
        const markedCounts = groups.map((g) => g.reduce((n, t) => n + (t.marked ? 1 : 0), 0));
        const maxCount = Math.max(...markedCounts);
        // 2) only process those at maxCount
        return groups.map((g, i) => {
            if (markedCounts[i] === maxCount) {
                // recurse into flat logic
                return markTokens(g, str);
            }
            else {
                // skip marking entirely
                return { matched: null };
            }
        });
    }
    // ——— Flat case ———
    const flat = tokens;
    const matchIndices = findMatch(flat, str, 0, 0);
    if (!matchIndices) {
        return { matched: null };
    }
    const newlyMarked = [];
    for (const idx of matchIndices) {
        if (!flat[idx].marked) {
            flat[idx].marked = true;
            newlyMarked.push(idx);
        }
    }
    return { matched: newlyMarked };
}
/**
 * Returns true if any token was newly marked.
 */
function anyMarked(result) {
    return result.some((r) => r.matched !== null && r.matched.length > 0);
}
/**
 * Selects the “best” token sequence from an array of candidate groups.
 * Criteria:
 *  1. Highest number of tokens with `marked === true`
 *  2. (Tiebreaker) Lowest number of tokens with `marked === false`
 *
 * @param groups  An array of Token[] candidate sequences.
 * @returns       The best Token[] (or `null` if `groups` is empty).
 */
function selectBestGroup(groups) {
    if (groups.length === 0)
        return null;
    let bestGroup = groups[0];
    let bestMarked = bestGroup.filter((t) => t.marked).length;
    let bestUnmarked = bestGroup.length - bestMarked;
    for (let i = 1; i < groups.length; i++) {
        const grp = groups[i];
        const markedCount = grp.filter((t) => t.marked).length;
        const unmarkedCount = grp.length - markedCount;
        if (markedCount > bestMarked ||
            (markedCount === bestMarked && unmarkedCount < bestUnmarked)) {
            bestGroup = grp;
            bestMarked = markedCount;
            bestUnmarked = unmarkedCount;
        }
    }
    return bestGroup;
}
/**
 * Formats a single Token[] into a masked string:
 *  – If `t.marked === true`, emits `t.surface`.
 *  – If unmarked and `t.pos_detail1 === "記号"`, emits `""` (omits punctuation).
 *  – Otherwise emits `"_"` repeated to match `t.surface.length`.
 *
 * @param group  A Token[] to format.
 * @returns      The masked string.
 */
function formatTokenGroup(group, includePunctuation) {
    return group
        .map((t) => {
        if (t.marked || includePunctuation) {
            return t.surface_form;
        }
        else if (t.pos !== '記号') {
            return '_'.repeat(t.surface_form.length);
        }
        else {
            // unmarked punctuation → omit entirely
            return '';
        }
    })
        .join('');
}
/**
 * Returns true if every non-punctuation token in the array is marked.
 * Punctuation tokens (where pos_detail1 === "記号") are ignored.
 *
 * @param tokens  Array of Token objects to check.
 */
function isCompleted(tokens) {
    return tokens.every((t) => t.pos === '記号' || t.marked);
}
let KanaGame = class KanaGame extends i {
    constructor() {
        super(...arguments);
        this.english = 'I live in Seattle.';
        this.skeleton = '';
        this.state = 'normal';
        this.question = null;
        this.answerHiragana = [];
    }
    /**
     * Called to supply a new question to the game.
     * @param question
     */
    async supplyQuestion(question) {
        this.question = structuredClone(question);
        this.question.parsed = [];
        this.english = this.question.english;
        const tokenizer = await tokenizerPromise;
        this.question.parsed = this.question.japanese.map((it) => tokenizer.tokenize(it).filter((t) => t.surface_form !== ' '));
        const group = this.question.parsed;
        const best = selectBestGroup(group);
        this.skeleton = formatTokenGroup(best, false);
        this.state = 'normal';
        this.kana.focus();
        this._updateDebugFields();
    }
    firstUpdated() {
        if (this.kana) {
            bind(this.kana, { IMEMode: true });
            this.kana.focus();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        // fire & forget: warm up the tokenizer
        tokenizerPromise.catch((e) => console.error('tokenizer failed to load', e));
    }
    updated(changed) {
        super.updated(changed);
        this.dispatchEvent(new CustomEvent('properties-changed', {
            detail: [...changed.keys()],
        }));
    }
    render() {
        return x `
      <span id="english" part="english">${this.english}</span><br />
      <span id="skeleton" part="skeleton">${this.renderSkeleton()}</span><br />
      <div class="answer-box">
        <input
          id="kana-input"
          part="kana-input"
          type="text"
          .readOnly=${this.state === 'completed'}
          @keydown=${this.handleKeydown}
          @input=${this.handleInput}
          placeholder="答え"
        />
        <button
          class="next-button"
          @click=${this._onNextClick}
          aria-label="Next question"
        >
          Next ➔
        </button>
      </div>
    `;
    }
    renderSkeleton() {
        if (!this.question)
            return x ``;
        const groups = this.question.parsed;
        const best = selectBestGroup(groups) || [];
        return x `${best.map((t) => {
            // skip unmarked punctuation unless we're in completed state
            if (t.pos === '記号' && this.state !== 'completed') {
                return '';
            }
            // unrevealed → underscores
            if (!t.marked && this.state !== 'completed') {
                return x `<span class="mask"
          >${'_'.repeat(t.surface_form.length)}</span
        >`;
            }
            // revealed → ruby with furigana
            const kana = toHiragana(t.reading);
            if (kana === t.surface_form)
                return x `${kana}`;
            return x `<ruby><rb>${t.surface_form}</rb><rt>${kana}</rt></ruby>`;
        })}`;
    }
    _onNextClick() {
        this.dispatchEvent(new CustomEvent('next-question'));
    }
    handleInput(_) {
        // as soon as the user types or pastes anything, clear the error
        if (this.state === 'error') {
            this.state = 'normal';
        }
    }
    handleKeydown(e) {
        if (this.question === null)
            return;
        if (e.key !== 'Enter')
            return;
        if (this.state === 'completed') {
            e.preventDefault();
            this._onNextClick();
            return;
        }
        const value = e.target.value;
        const group = this.question.parsed;
        const katakana = toKatakana(value);
        const marked = markTokens(group, katakana);
        this._updateDebugFields();
        const best = selectBestGroup(group);
        if (anyMarked(marked)) {
            this.kana.value = '';
        }
        let showPuncuation = false;
        if (isCompleted(best)) {
            showPuncuation = true;
            this.state = 'completed';
        }
        else if (!anyMarked(marked)) {
            this.state = 'error';
        }
        else {
            this.state = 'normal';
        }
        this.skeleton = formatTokenGroup(best, showPuncuation);
    }
    _updateDebugFields() {
        if (!this.question)
            return;
        // Take each token‐group (one per possible answer),
        // turn every token’s katakana reading into hiragana,
        // join them with spaces, and store in answerHiragana.
        const groups = this.question.parsed;
        this.answerHiragana = groups.map((group) => group.map((token) => toHiragana(token.reading)).join(' '));
    }
};
KanaGame.styles = i$3 `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      height: 100%;
      min-height: 300px;

      /* allow both light & dark; UA picks based on prefers-color-scheme */
      color-scheme: light dark;

      /* default (light) look */
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
      background-color: #fff;
      color: #000;
    }

    :host([state='completed']) span#skeleton {
      color: green;
    }

    :host([state='normal']) input#kana-input {
      border: solid 1px #ccc;
    }

    :host([state='completed']) input#kana-input {
      outline: none;
      box-shadow: 0 0 0 1px green;
    }

    :host([state='error']) input#kana-input {
      animation: shake 0.3s ease-in-out;
      outline: none;
      box-shadow: 0 0 0 1px tomato;
    }

    :host([state='completed']) .next-button {
      display: block; /* show when completed */
    }

    :host([state='completed']) .next-button:hover {
      color: #000;
    }

    .answer-box {
      margin-top: auto;
      position: relative;
      width: 100%;
    }

    .next-button {
      position: absolute;
      top: 50%;
      right: 0.5em;
      transform: translateY(-50%);
      border: none;
      background: none;
      font-size: 1.5em;
      line-height: 1;
      cursor: pointer;
      color: #444;
      display: none; /* hidden by default */
    }

    span#english {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 30px;
      text-align: center;
      width: 100%;
    }

    span#skeleton {
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 22px;
      text-align: center;
      width: 100%;
    }

    input#kana-input {
      box-sizing: border-box;
      width: 100%;
      padding-left: 2.5em;
      padding-right: 2.5em; /* make room for the arrow */
      border-radius: 8px;

      font-family: 'Noto Sans JP', sans-serif;
      font-size: 22px;
      line-height: 33px;
      text-align: center;
      width: 100%;

      /* light-mode input styling */
      background-color: #fff;
      color: #000;
      border-radius: 8px;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        /* dark-mode host overrides */
        background-color: #121212;
        color: #eee;
        border: solid 1px #444;
      }

      :host([state='completed']) .next-button:hover {
        color: #eee;
      }

      .next-button {
        color: #ccc;
      }

      span#english {
        color: #eee;
      }

      input#kana-input {
        /* dark-mode input overrides */
        background-color: #222;
        color: #eee;
        border: solid 1px #555;
      }

      @keyframes shake {
        0% {
          transform: translateX(0);
        }
        20% {
          transform: translateX(-4px);
        }
        40% {
          transform: translateX(4px);
        }
        60% {
          transform: translateX(-4px);
        }
        80% {
          transform: translateX(4px);
        }
        100% {
          transform: translateX(0);
        }
      }
    }
  `;
__decorate([
    n({ type: String })
], KanaGame.prototype, "english", void 0);
__decorate([
    n({ type: String })
], KanaGame.prototype, "skeleton", void 0);
__decorate([
    e('#kana-input')
], KanaGame.prototype, "kana", void 0);
__decorate([
    n({ type: String, reflect: true })
], KanaGame.prototype, "state", void 0);
KanaGame = __decorate([
    t('kana-game')
], KanaGame);

export { KanaGame, markTokens, tokenize };
