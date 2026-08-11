customElements.get("scheduler-card")||function(e){"use strict";function t(e,t,i,s){var a,o=arguments.length,n=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(a=e[r])&&(n=(o<3?a(n):o>3?a(t,i,n):a(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;
/**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const i=window,s=i.ShadowRoot&&(void 0===i.ShadyCSS||i.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,a=Symbol(),o=new WeakMap;class n{constructor(e,t,i){if(this._$cssResult$=!0,i!==a)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(s&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}}const r=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new n(i,e,a)},d=(e,t)=>{s?e.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet):t.forEach(t=>{const s=document.createElement("style"),a=i.litNonce;void 0!==a&&s.setAttribute("nonce",a),s.textContent=t.cssText,e.appendChild(s)})},l=s?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new n("string"==typeof e?e:e+"",void 0,a))(t)})(e):e
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */;var c;const h=window,u=h.trustedTypes,p=u?u.emptyScript:"",m=h.reactiveElementPolyfillSupport,_={toAttribute(e,t){switch(t){case Boolean:e=e?p:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},g=(e,t)=>t!==e&&(t==t||e==e),v={attribute:!0,type:String,converter:_,reflect:!1,hasChanged:g},f="finalized";class b extends HTMLElement{constructor(){super(),this._$Ei=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$El=null,this._$Eu()}static addInitializer(e){var t;this.finalize(),(null!==(t=this.h)&&void 0!==t?t:this.h=[]).push(e)}static get observedAttributes(){this.finalize();const e=[];return this.elementProperties.forEach((t,i)=>{const s=this._$Ep(i,t);void 0!==s&&(this._$Ev.set(s,i),e.push(s))}),e}static createProperty(e,t=v){if(t.state&&(t.attribute=!1),this.finalize(),this.elementProperties.set(e,t),!t.noAccessor&&!this.prototype.hasOwnProperty(e)){const i="symbol"==typeof e?Symbol():"__"+e,s=this.getPropertyDescriptor(e,i,t);void 0!==s&&Object.defineProperty(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){return{get(){return this[t]},set(s){const a=this[e];this[t]=s,this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)||v}static finalize(){if(this.hasOwnProperty(f))return!1;this[f]=!0;const e=Object.getPrototypeOf(this);if(e.finalize(),void 0!==e.h&&(this.h=[...e.h]),this.elementProperties=new Map(e.elementProperties),this._$Ev=new Map,this.hasOwnProperty("properties")){const e=this.properties,t=[...Object.getOwnPropertyNames(e),...Object.getOwnPropertySymbols(e)];for(const i of t)this.createProperty(i,e[i])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(l(e))}else void 0!==e&&t.push(l(e));return t}static _$Ep(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}_$Eu(){var e;this._$E_=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$Eg(),this.requestUpdate(),null===(e=this.constructor.h)||void 0===e||e.forEach(e=>e(this))}addController(e){var t,i;(null!==(t=this._$ES)&&void 0!==t?t:this._$ES=[]).push(e),void 0!==this.renderRoot&&this.isConnected&&(null===(i=e.hostConnected)||void 0===i||i.call(e))}removeController(e){var t;null===(t=this._$ES)||void 0===t||t.splice(this._$ES.indexOf(e)>>>0,1)}_$Eg(){this.constructor.elementProperties.forEach((e,t)=>{this.hasOwnProperty(t)&&(this._$Ei.set(t,this[t]),delete this[t])})}createRenderRoot(){var e;const t=null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow(this.constructor.shadowRootOptions);return d(t,this.constructor.elementStyles),t}connectedCallback(){var e;void 0===this.renderRoot&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),null===(e=this._$ES)||void 0===e||e.forEach(e=>{var t;return null===(t=e.hostConnected)||void 0===t?void 0:t.call(e)})}enableUpdating(e){}disconnectedCallback(){var e;null===(e=this._$ES)||void 0===e||e.forEach(e=>{var t;return null===(t=e.hostDisconnected)||void 0===t?void 0:t.call(e)})}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$EO(e,t,i=v){var s;const a=this.constructor._$Ep(e,i);if(void 0!==a&&!0===i.reflect){const o=(void 0!==(null===(s=i.converter)||void 0===s?void 0:s.toAttribute)?i.converter:_).toAttribute(t,i.type);this._$El=e,null==o?this.removeAttribute(a):this.setAttribute(a,o),this._$El=null}}_$AK(e,t){var i;const s=this.constructor,a=s._$Ev.get(e);if(void 0!==a&&this._$El!==a){const e=s.getPropertyOptions(a),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==(null===(i=e.converter)||void 0===i?void 0:i.fromAttribute)?e.converter:_;this._$El=a,this[a]=o.fromAttribute(t,e.type),this._$El=null}}requestUpdate(e,t,i){let s=!0;void 0!==e&&(((i=i||this.constructor.getPropertyOptions(e)).hasChanged||g)(this[e],t)?(this._$AL.has(e)||this._$AL.set(e,t),!0===i.reflect&&this._$El!==e&&(void 0===this._$EC&&(this._$EC=new Map),this._$EC.set(e,i))):s=!1),!this.isUpdatePending&&s&&(this._$E_=this._$Ej())}async _$Ej(){this.isUpdatePending=!0;try{await this._$E_}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;this.hasUpdated,this._$Ei&&(this._$Ei.forEach((e,t)=>this[t]=e),this._$Ei=void 0);let t=!1;const i=this._$AL;try{t=this.shouldUpdate(i),t?(this.willUpdate(i),null===(e=this._$ES)||void 0===e||e.forEach(e=>{var t;return null===(t=e.hostUpdate)||void 0===t?void 0:t.call(e)}),this.update(i)):this._$Ek()}catch(e){throw t=!1,this._$Ek(),e}t&&this._$AE(i)}willUpdate(e){}_$AE(e){var t;null===(t=this._$ES)||void 0===t||t.forEach(e=>{var t;return null===(t=e.hostUpdated)||void 0===t?void 0:t.call(e)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$Ek(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$E_}shouldUpdate(e){return!0}update(e){void 0!==this._$EC&&(this._$EC.forEach((e,t)=>this._$EO(t,this[t],e)),this._$EC=void 0),this._$Ek()}updated(e){}firstUpdated(e){}}
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var y;b[f]=!0,b.elementProperties=new Map,b.elementStyles=[],b.shadowRootOptions={mode:"open"},null==m||m({ReactiveElement:b}),(null!==(c=h.reactiveElementVersions)&&void 0!==c?c:h.reactiveElementVersions=[]).push("1.6.3");const w=window,k=w.trustedTypes,x=k?k.createPolicy("lit-html",{createHTML:e=>e}):void 0,$=`lit$${(Math.random()+"").slice(9)}$`,S="?"+$,j=`<${S}>`,O=document,z=()=>O.createComment(""),C=e=>null===e||"object"!=typeof e&&"function"!=typeof e,E=Array.isArray,A="[ \t\n\f\r]",D=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,T=/-->/g,M=/>/g,P=RegExp(`>|${A}(?:([^\\s"'>=/]+)(${A}*=${A}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,N=/"/g,I=/^(?:script|style|textarea|title)$/i,R=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),H=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),V=new WeakMap,F=O.createTreeWalker(O,129,null,!1);function B(e,t){if(!Array.isArray(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==x?x.createHTML(t):t}const W=(e,t)=>{const i=e.length-1,s=[];let a,o=2===t?"<svg>":"",n=D;for(let t=0;t<i;t++){const i=e[t];let r,d,l=-1,c=0;for(;c<i.length&&(n.lastIndex=c,d=n.exec(i),null!==d);)c=n.lastIndex,n===D?"!--"===d[1]?n=T:void 0!==d[1]?n=M:void 0!==d[2]?(I.test(d[2])&&(a=RegExp("</"+d[2],"g")),n=P):void 0!==d[3]&&(n=P):n===P?">"===d[0]?(n=null!=a?a:D,l=-1):void 0===d[1]?l=-2:(l=n.lastIndex-d[2].length,r=d[1],n=void 0===d[3]?P:'"'===d[3]?N:L):n===N||n===L?n=P:n===T||n===M?n=D:(n=P,a=void 0);const h=n===P&&e[t+1].startsWith("/>")?" ":"";o+=n===D?i+j:l>=0?(s.push(r),i.slice(0,l)+"$lit$"+i.slice(l)+$+h):i+$+(-2===l?(s.push(void 0),t):h)}return[B(e,o+(e[i]||"<?>")+(2===t?"</svg>":"")),s]};class U{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let a=0,o=0;const n=e.length-1,r=this.parts,[d,l]=W(e,t);if(this.el=U.createElement(d,i),F.currentNode=this.el.content,2===t){const e=this.el.content,t=e.firstChild;t.remove(),e.append(...t.childNodes)}for(;null!==(s=F.nextNode())&&r.length<n;){if(1===s.nodeType){if(s.hasAttributes()){const e=[];for(const t of s.getAttributeNames())if(t.endsWith("$lit$")||t.startsWith($)){const i=l[o++];if(e.push(t),void 0!==i){const e=s.getAttribute(i.toLowerCase()+"$lit$").split($),t=/([.?@])?(.*)/.exec(i);r.push({type:1,index:a,name:t[2],strings:e,ctor:"."===t[1]?Y:"?"===t[1]?Q:"@"===t[1]?ee:G})}else r.push({type:6,index:a})}for(const t of e)s.removeAttribute(t)}if(I.test(s.tagName)){const e=s.textContent.split($),t=e.length-1;if(t>0){s.textContent=k?k.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],z()),F.nextNode(),r.push({type:2,index:++a});s.append(e[t],z())}}}else if(8===s.nodeType)if(s.data===S)r.push({type:2,index:a});else{let e=-1;for(;-1!==(e=s.data.indexOf($,e+1));)r.push({type:7,index:a}),e+=$.length-1}a++}}static createElement(e,t){const i=O.createElement("template");return i.innerHTML=e,i}}function Z(e,t,i=e,s){var a,o,n,r;if(t===H)return t;let d=void 0!==s?null===(a=i._$Co)||void 0===a?void 0:a[s]:i._$Cl;const l=C(t)?void 0:t._$litDirective$;return(null==d?void 0:d.constructor)!==l&&(null===(o=null==d?void 0:d._$AO)||void 0===o||o.call(d,!1),void 0===l?d=void 0:(d=new l(e),d._$AT(e,i,s)),void 0!==s?(null!==(n=(r=i)._$Co)&&void 0!==n?n:r._$Co=[])[s]=d:i._$Cl=d),void 0!==d&&(t=Z(e,d._$AS(e,t.values),d,s)),t}class K{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){var t;const{el:{content:i},parts:s}=this._$AD,a=(null!==(t=null==e?void 0:e.creationScope)&&void 0!==t?t:O).importNode(i,!0);F.currentNode=a;let o=F.nextNode(),n=0,r=0,d=s[0];for(;void 0!==d;){if(n===d.index){let t;2===d.type?t=new X(o,o.nextSibling,this,e):1===d.type?t=new d.ctor(o,d.name,d.strings,this,e):6===d.type&&(t=new te(o,this,e)),this._$AV.push(t),d=s[++r]}n!==(null==d?void 0:d.index)&&(o=F.nextNode(),n++)}return F.currentNode=O,a}v(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class X{constructor(e,t,i,s){var a;this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cp=null===(a=null==s?void 0:s.isConnected)||void 0===a||a}get _$AU(){var e,t;return null!==(t=null===(e=this._$AM)||void 0===e?void 0:e._$AU)&&void 0!==t?t:this._$Cp}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===(null==e?void 0:e.nodeType)&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Z(this,e,t),C(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==H&&this._(e):void 0!==e._$litType$?this.g(e):void 0!==e.nodeType?this.$(e):(e=>E(e)||"function"==typeof(null==e?void 0:e[Symbol.iterator]))(e)?this.T(e):this._(e)}k(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}$(e){this._$AH!==e&&(this._$AR(),this._$AH=this.k(e))}_(e){this._$AH!==q&&C(this._$AH)?this._$AA.nextSibling.data=e:this.$(O.createTextNode(e)),this._$AH=e}g(e){var t;const{values:i,_$litType$:s}=e,a="number"==typeof s?this._$AC(e):(void 0===s.el&&(s.el=U.createElement(B(s.h,s.h[0]),this.options)),s);if((null===(t=this._$AH)||void 0===t?void 0:t._$AD)===a)this._$AH.v(i);else{const e=new K(a,this),t=e.u(this.options);e.v(i),this.$(t),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new U(e)),t}T(e){E(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const a of e)s===t.length?t.push(i=new X(this.k(z()),this.k(z()),this,this.options)):i=t[s],i._$AI(a),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){var i;for(null===(i=this._$AP)||void 0===i||i.call(this,!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){var t;void 0===this._$AM&&(this._$Cp=e,null===(t=this._$AP)||void 0===t||t.call(this,e))}}class G{constructor(e,t,i,s,a){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=a,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(e,t=this,i,s){const a=this.strings;let o=!1;if(void 0===a)e=Z(this,e,t,0),o=!C(e)||e!==this._$AH&&e!==H,o&&(this._$AH=e);else{const s=e;let n,r;for(e=a[0],n=0;n<a.length-1;n++)r=Z(this,s[i+n],t,n),r===H&&(r=this._$AH[n]),o||(o=!C(r)||r!==this._$AH[n]),r===q?e=q:e!==q&&(e+=(null!=r?r:"")+a[n+1]),this._$AH[n]=r}o&&!s&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,null!=e?e:"")}}class Y extends G{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}const J=k?k.emptyScript:"";class Q extends G{constructor(){super(...arguments),this.type=4}j(e){e&&e!==q?this.element.setAttribute(this.name,J):this.element.removeAttribute(this.name)}}class ee extends G{constructor(e,t,i,s,a){super(e,t,i,s,a),this.type=5}_$AI(e,t=this){var i;if((e=null!==(i=Z(this,e,t,0))&&void 0!==i?i:q)===H)return;const s=this._$AH,a=e===q&&s!==q||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,o=e!==q&&(s===q||a);a&&this.element.removeEventListener(this.name,this,s),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var t,i;"function"==typeof this._$AH?this._$AH.call(null!==(i=null===(t=this.options)||void 0===t?void 0:t.host)&&void 0!==i?i:this.element,e):this._$AH.handleEvent(e)}}class te{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Z(this,e)}}const ie=w.litHtmlPolyfillSupport;null==ie||ie(U,X),(null!==(y=w.litHtmlVersions)&&void 0!==y?y:w.litHtmlVersions=[]).push("2.8.0");
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */
var se,ae;class oe extends b{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e,t;const i=super.createRenderRoot();return null!==(e=(t=this.renderOptions).renderBefore)&&void 0!==e||(t.renderBefore=i.firstChild),i}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{var s,a;const o=null!==(s=null==i?void 0:i.renderBefore)&&void 0!==s?s:t;let n=o._$litPart$;if(void 0===n){const e=null!==(a=null==i?void 0:i.renderBefore)&&void 0!==a?a:null;o._$litPart$=n=new X(t.insertBefore(z(),e),e,void 0,null!=i?i:{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){var e;super.connectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!0)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._$Do)||void 0===e||e.setConnected(!1)}render(){return H}}oe.finalized=!0,oe._$litElement$=!0,null===(se=globalThis.litElementHydrateSupport)||void 0===se||se.call(globalThis,{LitElement:oe});const ne=globalThis.litElementPolyfillSupport;null==ne||ne({LitElement:oe}),(null!==(ae=globalThis.litElementVersions)&&void 0!==ae?ae:globalThis.litElementVersions=[]).push("3.3.3");const re=e=>t=>"function"==typeof t?((e,t)=>(customElements.define(e,t),t))(e,t):((e,t)=>{const{kind:i,elements:s}=t;return{kind:i,elements:s,finisher(t){customElements.define(e,t)}}})(e,t)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */,de=(e,t)=>"method"===t.kind&&t.descriptor&&!("value"in t.descriptor)?{...t,finisher(i){i.createProperty(t.key,e)}}:{kind:"field",key:Symbol(),placement:"own",descriptor:{},originalKey:t.key,initializer(){"function"==typeof t.initializer&&(this[t.key]=t.initializer.call(this))},finisher(i){i.createProperty(t.key,e)}};
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */function le(e){return(t,i)=>void 0!==i?((e,t,i)=>{t.constructor.createProperty(i,e)})(e,t,i):de(e,t)
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */}function ce(e){return le({...e,state:!0})}
/**
     * @license
     * Copyright 2021 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */var he;null===(he=window.HTMLSlotElement)||void 0===he||he.prototype.assignedElements;const ue=(e,t)=>{if(typeof e!=typeof t)return!1;if("object"==typeof e&&"object"==typeof t&&null!==e&&null!==t){const i=[...new Set([...Object.keys(e),...Object.keys(t)])];return!!i.every(i=>Object.keys(e).includes(i)&&Object.keys(t).includes(i))&&i.every(i=>ue(e[i],t[i]))}return e===t};var pe,me,_e,ge,ve,fe,be,ye,we;!function(e){e.Overview="overview",e.List="list"}(pe||(pe={})),function(e){e.Single="single",e.Scheme="scheme"}(me||(me={})),function(e){e.Daily="daily",e.Workday="workday",e.Weekend="weekend",e.Monday="monday",e.Tuesday="tuesday",e.Wednesday="wednesday",e.Thursday="thursday",e.Friday="friday",e.Saturday="saturday",e.Sunday="sunday"}(_e||(_e={})),function(e){e.Or="or",e.And="and"}(ge||(ge={})),function(e){e.Equal="is",e.Unequal="not",e.Below="below",e.Above="above"}(ve||(ve={})),function(e){e.Name="name",e.RelativeTime="relative-time",e.AdditionalTasks="additional-tasks",e.Time="time",e.Days="days",e.Entity="entity",e.Action="action",e.Tags="tags",e.Default="default"}(fe||(fe={})),function(e){e.ItemCreated="scheduler_item_created",e.ItemUpdated="scheduler_item_updated",e.ItemRemoved="scheduler_item_removed",e.TimerFinished="scheduler_timer_finished",e.TimerUpdated="scheduler_timer_updated"}(be||(be={})),function(e){e.Repeat="repeat",e.Pause="pause",e.Single="single"}(ye||(ye={})),function(e){e.Fixed="fixed",e.Sunrise="sunrise",e.Sunset="sunset",e.Entity="entity",e.EntityDay="entity_day"}(we||(we={}));const ke=e=>({service:e.service,service_data:e.service_data,target:{entity_id:e.entity_id?e.entity_id:void 0}}),xe=e=>({start:e.start,stop:e.stop,actions:je(e.actions.map(ke)),conditions:{type:"and"==e.condition_type?ge.And:ge.Or,items:e.conditions||[],track_changes:Boolean(e.track_conditions)},name:e.name||void 0,color:e.color||void 0,enforce:e.enforce||void 0,track:e.track||void 0,priority:e.priority||void 0,start_date:e.start_date||void 0,end_date:e.end_date||void 0}),$e=e=>{switch(e){case"mon":return _e.Monday;case"tue":return _e.Tuesday;case"wed":return _e.Wednesday;case"thu":return _e.Thursday;case"fri":return _e.Friday;case"sat":return _e.Saturday;case"sun":return _e.Sunday;case"workday":return _e.Workday;case"weekend":return _e.Weekend;default:return _e.Daily}},Se=e=>Object.assign(Object.assign({},Object.fromEntries(Object.entries(e).filter(([e])=>!["slots","weekdays",""].includes(e)))),{entries:[{slots:e.timeslots.map(xe),weekdays:e.weekdays.map($e)}]}),je=e=>{if(1==e.length)return e;if(e.every(t=>ue(Object.assign(Object.assign({},t),{target:void 0}),Object.assign(Object.assign({},e[0]),{target:void 0})))){const t=[...new Set(e.map(e=>{var t;return null===(t=e.target)||void 0===t?void 0:t.entity_id}).filter(e=>void 0!==e))];return[Object.assign(Object.assign({},e[0]),{target:{entity_id:t.length?t:void 0}})]}return e},Oe=e=>e.callWS({type:"scheduler"}).then(e=>e.map(Se)),ze=e=>e==we.Fixed||e==we.EntityDay,Ce=(e,t)=>{let i=t.hours||0,s=t.minutes||0;(i<0||s<0)&&(i=-Math.abs(i),s=-Math.abs(s));let a=e.hours,o=e.minutes;return a<0&&o>0&&(o=-o),a+=i,o+=s,o>=60||o>0&&a<0&&!ze(e.mode)?(a+=1,o-=60):(o<=-60||o<0&&ze(e.mode)||o<0&&a>0&&!ze(e.mode))&&(a-=1,o+=60),a<0&&ze(e.mode)?a+=24:a>=24&&ze(e.mode)&&(a-=24),{mode:e.mode,hours:a,minutes:o,entity_id:e.entity_id}},Ee=(e,t=1)=>{let i=3600*Math.abs(e.hours)+60*Math.abs(e.minutes)+(e.seconds||0);const s=e.hours<0||e.minutes<0?-1:1;let a=Math.floor(i/3600),o=Math.round((i-3600*a)/60);return o%t!=0&&(o=Math.round(o/t)*t),o>=60&&(a++,o-=60),s<0&&(a>0?a=-a:o=-o),Object.assign(Object.assign({},e),{hours:a,minutes:o})},Ae=/^([a-z_]+\.[a-z0-9_]+)([-+@]{1})([0-9:]+)$/,De=e=>{if(e.match(/^([0-9:]+)$/)){const t=e.split(":").map(Number),i=Ee({hours:t[0],minutes:t[1],seconds:t[2]});return{mode:we.Fixed,hours:i.hours,minutes:i.minutes}}const t=e.match(/^([a-z]+)([\+|-]{1})([0-9:]+)$/);if(t){let e=t[3].split(":").map(Number);const i=Ee({hours:e[0],minutes:e[1],seconds:e[2]});let s=i.hours,a=i.minutes;return"-"==t[2]&&(s>0&&(s=-s),a=-a),{mode:"sunrise"==t[1]?we.Sunrise:we.Sunset,hours:s,minutes:a}}const i=e.match(Ae);if(i){const e=i[3].split(":").map(Number),t=Ee({hours:e[0],minutes:e[1],seconds:e[2]});if("@"==i[2])return{mode:we.EntityDay,hours:t.hours,minutes:t.minutes,entity_id:i[1]};let s=t.hours,a=t.minutes;return"-"==i[2]&&(s>0&&(s=-s),a=-a),{mode:we.Entity,hours:s,minutes:a,entity_id:i[1]}}const s=new Date(e),a=Ee({hours:s.getHours(),minutes:s.getMinutes(),seconds:s.getSeconds()});return{mode:we.Fixed,hours:a.hours,minutes:a.minutes}},Te=(e,t)=>{var i;if("string"==typeof e&&(e=De(e)),e.mode==we.Fixed||e.mode==we.EntityDay)return 3600*e.hours+60*e.minutes;if(e.mode==we.Sunrise){const i=De(t.states["sun.sun"].attributes.next_rising),s=Ce(i,e);return 3600*s.hours+60*s.minutes}if(e.mode==we.Entity){const s=e.entity_id?null===(i=t.states[e.entity_id])||void 0===i?void 0:i.state:void 0;if(!s||"unavailable"==s||"unknown"==s)return Math.max(0,3600*e.hours+60*e.minutes);const a=Ce(De(s),e);return 3600*a.hours+60*a.minutes}{const i=De(t.states["sun.sun"].attributes.next_setting),s=Ce(i,e);return 3600*s.hours+60*s.minutes}};var Me,Pe;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(Me||(Me={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(Pe||(Pe={}));const Le=e=>{if(e.time_format===Pe.language||e.time_format===Pe.system){const t=e.time_format===Pe.language?e.language:void 0;return new Date("January 1, 2023 22:00:00").toLocaleString(t).includes("10")}return e.time_format===Pe.am_pm};var Ne;!function(e){e.AM="AM",e.PM="PM"}(Ne||(Ne={}));const Ie=e=>({am_pm:e>=12?Ne.PM:Ne.AM,hours:e%12||12}),Re=(e,t)=>t==Ne.AM?12==e?0:e:12==e?12:e+12,He=(e,t={seconds:!0})=>{let i="";if(e.hours>=24&&(e.hours-=24),e.mode==we.Fixed&&t.am_pm){const s=Ie(e.hours).am_pm,a=Ie(e.hours).hours;i=String(a).padStart(2,"0")+":"+String(e.minutes).padStart(2,"0"),t.seconds&&(i+=":00"),i+=" "+(s===Ne.AM?"am":"pm")}else e.mode==we.Fixed?(i=String(e.hours).padStart(2,"0")+":"+String(e.minutes).padStart(2,"0"),t.seconds&&(i+=":00")):e.mode==we.EntityDay?(i=e.entity_id+"@"+String(e.hours).padStart(2,"0")+":"+String(e.minutes).padStart(2,"0"),t.seconds&&(i+=":00")):(s=e.mode,a=e.entity_id,i=(s==we.Sunrise?"sunrise":s==we.Sunset?"sunset":a)+(e.hours<0||e.minutes<0?"-":"+")+String(Math.abs(e.hours)).padStart(2,"0")+":"+String(Math.abs(e.minutes)).padStart(2,"0"),t.seconds&&(i+=":00"));var s,a;return i},qe=(e,t)=>{const i=e=>{(e=(e=e.map(e=>Object.assign(Object.assign({},e),{start:Te(e.start,t)<0?"00:00:00":e.start,stop:e.stop?Te(e.stop,t)>86400?"00:00:00":e.stop:void 0}))).map(e=>{if(e.stop&&Te(e.start,t)>Te(e.stop,t)){if(0==Te(e.stop,t))return Object.assign(Object.assign({},e),{stop:He(Ce(De(e.stop),{hours:24}))});e=Object.assign(Object.assign({},e),{start:e.stop,stop:e.start})}return e.stop&&Te(e.stop,t)-Te(e.start,t)<60&&(e=Object.assign(Object.assign({},e),{stop:He(Ce(De(e.start),{minutes:1}))})),e})).sort((e,i)=>Te(e.start,t)>Te(i.start,t)?1:Te(e.start,t)<Te(i.start,t)?-1:Te(e.stop||e.start,t)>Te(i.stop||i.start,t)?1:-1);let i="00:00:00",s=e.length;for(let a=0;a<s;a++){const o=e[a];Te(o.start,t)>Te(i,t)?(e.splice(a,0,Object.assign(Object.assign({},o),{start:i,stop:o.start,actions:[],conditions:o.conditions})),s++,a++):Te(o.start,t)<Te(i,t)&&(e=Object.assign(e,{[a]:Object.assign(Object.assign({},o),{start:i})})),i=void 0!==o.stop?o.stop:He(Ce(De(o.start),{minutes:1}))}return Te(i,t)<86400&&Te(i,t)>0&&e.push({start:i,stop:He({mode:we.Fixed,hours:24,minutes:0}),actions:[],conditions:e[0].conditions}),e};return e=Object.assign(Object.assign({},e),{entries:e.entries.map(e=>Object.assign(Object.assign({},e),{slots:i(e.slots)}))})},Ve=["relative-time","state"],Fe=["relative-time","additional-tasks"],Be=["*"],We={actions:[],conditions:{type:ge.Or,items:[],track_changes:!1}},Ue={entries:[{weekdays:[_e.Daily],slots:[Object.assign(Object.assign({},We),{start:"00:00:00",stop:"08:00:00"}),Object.assign(Object.assign({},We),{start:"08:00:00",stop:"16:00:00"}),Object.assign(Object.assign({},We),{start:"16:00:00",stop:"00:00:00"})]}],repeat_type:ye.Repeat,next_entries:[],timestamps:[],enabled:!0},Ze=Object.assign(Object.assign({},Ue),{entries:[{weekdays:[_e.Daily],slots:[Object.assign(Object.assign({},We),{start:"00:00:00",stop:"12:00:00"}),Object.assign(Object.assign({},We),{start:"12:00:00"}),Object.assign(Object.assign({},We),{start:"12:01:00",stop:"00:00:00"})]}]});function Ke(e){return null!=e}const Xe=(e,t)=>Object.keys(e).includes(t),Ge=e=>"boolean"==typeof e,Ye=e=>"number"==typeof e,Je=e=>"string"==typeof e,Qe=e=>"object"==typeof e&&!Array.isArray(e),et=e=>Array.isArray(e)&&e.every(e=>"string"==typeof e),tt=(e,t)=>Qe(t)?Xe(t,"states")&&!(et(t.states)||Qe(t.states)&&Xe(t.states,"min")&&Ye(t.states.min)&&Xe(t.states,"max")&&Ye(t.states.max))?`In 'customize' [${e}].states' must be a list of strings or a range of numbers`:void 0:`'In customize, ${e}' must be a struct`;var it={generic:{turn_on:"Включи",turn_off:"изключи",parameter_to_value:"{parameter} на {value}",action_with_parameter:"{action} с {parameter}"},climate:{set_temperature:"задай температура[ на {temperature}]",set_temperature_hvac_mode_heat:"отопление[ на {temperature}]",set_temperature_hvac_mode_cool:"охлаждане[ на {temperature}]",set_temperature_hvac_mode_heat_cool:"отопление/охлаждане[ на {temperature}]",set_temperature_hvac_mode_heat_cool_range:"отопление/охлаждане[ на {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"автоматично[ на {temperature}]",set_hvac_mode:"задай режим[ на {hvac_mode}]",set_preset_mode:"задай предварителна настройка[ на {preset_mode}]",set_fan_mode:"задай режим на вентилатор[ на {fan_mode}]",set_swing_mode:"задай режим на въртене[ на {swing_mode}]"},cover:{close_cover:"затвори",open_cover:"отвори",set_cover_position:"задай позиция[ на {position}]",set_cover_tilt_position:"задай позиция на наклон[ на {tilt_position}]"},fan:{set_percentage:"задай скорост[ на {percentage}]",set_direction:"задай посока[ на {direction}]",oscillate:"задай осцилация[ на {oscillate}]"},humidifier:{set_humidity:"задай влажност[ на {humidity}]",set_mode:"задай режим[ на {mode}]"},input_number:{set_value:"задай стойност[ на {value}]"},input_select:{select_option:"избери опция[ {option}]"},select:{select_option:"избери опция[ {option}]"},light:{turn_on:"включи[ с {brightness} яркост]"},media_player:{select_source:"избери източник[ {source}]"},notify:{send_message:"изпрати известие"},script:{execute:"изпълни"},vacuum:{start_pause:"старт / пауза"},water_heater:{set_operation_mode:"задай режим[ на {operation_mode}]",set_away_mode:"задай режим 'не съм вкъщи'"}},st={components:{date:{day_types_short:{daily:"дневно",workdays:"работни дни",weekend:"уикенд"},day_types_long:{daily:"всеки ден",workdays:"в работни дни",weekend:"през уикенда"},days:"дни",tomorrow:"утре",repeated_days:"всеки {days}",repeated_days_except:"всеки ден освен {excludedDays}",days_range:"от {startDay} до {endDay}",next_week_day:"следващ {weekday}"},time:{absolute:"в {time}",interval:"от {startTime} до {endTime}",at_midnight:"в полунощ",at_noon:"на обяд",at_sun_event:"при {sunEvent}"}},dialog:{enable_schedule:{title:"Завърши промените",description:"Графикът, който сте променили, е деактивиран. Искате ли да го активирате?"},confirm_delete:{title:"Премахни обект?",description:"Сигурни ли сте, че искате да премахнете този обект?"},confirm_migrate:{title:"Актуализирай графика",description:"Някои настройки ще бъдат загубени при тази промяна. Искате ли да продължите?"},weekday_picker:{title:"Повтарящи се дни за графика",choose:"Избери..."},entity_picker:{title:"Изберете обекти",choose:"Избери...",no_results:"Няма намерени съвпадения"},action_picker:{title:"Изберете действие",show_all:"Показване на всички поддържани обекти"}},panel:{common:{title:"Планировчик",new_schedule:"Нов график",default_name:"График #{id}"},overview:{no_entries:"Няма елементи за показване",backend_error:"Не може да се свърже с компонента за планиране. Той трябва да бъде инсталиран като интеграция, преди тази карта да може да се използва.",excluded_items:"{number} изключен {if number is 1} елемент {else} елемента",hide_excluded:"скрий изключените елементи",additional_tasks:"{number} още {if number is 1} задача {else} задачи",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Повтарящи се дни",start_time:"Начален час",stop_time:"Краен час",action:"Действие",add_action:"Добави действие",select_timeslot:"Изберете времеви слот",toggle_single_mode:"В единичен режим",toggle_scheme_mode:"В режим на схема",validation_errors:{overlapping_time:"Графикът има припокриващи се времеви слотове",missing_target_entity:"Едно или повече действия нямат целеви обект",missing_service_parameter:"Едно или повече действия нямат задължителна настройка",missing_action:"Графикът няма действия"}},options:{conditions:{header:"Условия",add_condition:"Добави условие",new_condition:"Нов условие",types:{equal_to:"{entity} е равно на {value}",unequal_to:"{entity} не е равно на {value}",above:"{entity} е над {value}",below:"{entity} е под {value}"},options:{logic_and:"Всички условия трябва да са изпълнени",logic_or:"Поне едно условие трябва да е изпълнено",track_changes:"Преоценка при промяна на условията"}},period:{header:"Период",start_date:"От",end_date:"До"},repeat_type:"поведение след завършване",tags:"Етикети"},card_editor:{tabs:{entities:"Обекти",other:"Други"},fields:{title:{heading:"Заглавие на картата",options:{standard:"стандартно",hidden:"скрито",custom:"персонализирано"},custom_title:"Персонализирано заглавие"},discover_existing:{heading:"Покажи всички графици",description:"Това задава параметъра 'discover existing'. Предварително създадени графици ще бъдат автоматично добавени към картата. "},time_step:{heading:"Времева стъпка",description:"Резолюция (в минути) за създаване на графици",unit_minutes:"мин"},default_editor:{heading:"Редактор по подразбиране",options:{single:"Режим на единичен график",scheme:"Режим на времева схема"}},sort_by:{heading:"Опции за сортиране",description:"Ред, в който се показват графиците в картата",options:{relative_time:"Оставащо време до следващото действие",title:"Показано заглавие на графика",state:"Покажи активните графици отгоре"}},display_format_primary:{heading:"Показана основна информация",description:"Конфигурирайте кой етикет се използва за графиците в прегледа",options:{default:"Име на графика",entity_action:"Резюме на задачата"}},display_format_secondary:{heading:"Показана допълнителна информация",description:"Конфигурирайте какви допълнителни свойства са видими в прегледа",options:{relative_time:"Оставащо време до следващото действие",time:"Конфигуриран час за следващо действие",days:"Повтарящи се дни от седмицата",additional_tasks:"Брой допълнителни задачи"}},show_header_toggle:{heading:"Покажи превключвател в заглавието",description:"Покажи превключвател в горната част на картата за активиране/деактивиране на всички обекти"},show_toggle_switches:{heading:"Покажи превключватели",description:"Покажи превключвател за всяко отделно задание в картата"},tags:{heading:"Етикети",description:"Използвайте етикети за разделяне на графиците между множество карти"},entities:{button_label:"Конфигурирай включени обекти",heading:"Включени обекти",description:"Изберете обектите, които искате да контролирате чрез планировчика. Можете да кликнете на група, за да я отворите. Имайте предвид, че някои обекти (като сензори) могат да се използват само за условия, не и за действия.",included_number:"{number}/{total} избрани"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},at={services:it,ui:st},ot=Object.freeze({__proto__:null,services:it,ui:st,default:at}),nt={generic:{turn_on:"Encén",turn_off:"Apaga",parameter_to_value:"{parameter} a {value}",action_with_parameter:"{action} amb {parameter}"},climate:{set_temperature:"estableix la temperatura[ a {temperature}]",set_temperature_hvac_mode_heat:"escalfa[ a {temperature}]",set_temperature_hvac_mode_cool:"refreda[ a {temperature}]",set_temperature_hvac_mode_heat_cool:"calor/fred[ a {temperature}]",set_temperature_hvac_mode_heat_cool_range:"calor/fred[ de {target_temp_low} a {target_temp_high}]",set_temperature_hvac_mode_auto:"automàtic[ a {temperature}]",set_hvac_mode:"estableix el mode[ a {hvac_mode}]",set_preset_mode:"estableix el preajust[ a {preset_mode}]",set_fan_mode:"estableix el mode del ventilador[ a {fan_mode}]",set_swing_mode:"estableix l'oscil·lació[ a {swing_mode}]"},cover:{close_cover:"tanca",open_cover:"obre",set_cover_position:"estableix la posició[ a {position}]",set_cover_tilt_position:"estableix la inclinació[ a {tilt_position}]"},fan:{set_percentage:"estableix la velocitat[ a {percentage}]",set_direction:"estableix la direcció[ a {direction}]",oscillate:"estableix l'oscil·lació[ a {oscillate}]"},humidifier:{set_humidity:"estableix la humitat[ a {humidity}]",set_mode:"estableix el mode[ a {mode}]"},input_number:{set_value:"estableix el valor[ a {value}]"},input_select:{select_option:"selecciona l'opció[ {option}]"},select:{select_option:"selecciona l'opció[ {option}]"},light:{turn_on:"encén[ amb brillantor {brightness}]"},media_player:{select_source:"selecciona la font[ {source}]"},notify:{send_message:"envia una notificació"},script:{execute:"executa"},vacuum:{start_pause:"inicia / pausa"},water_heater:{set_operation_mode:"estableix el mode[ a {operation_mode}]",set_away_mode:"estableix el mode absència"}},rt={components:{date:{day_types_short:{daily:"diari",workdays:"feiners",weekend:"cap de setmana"},day_types_long:{daily:"cada dia",workdays:"els dies feiners",weekend:"el cap de setmana"},days:"dies",tomorrow:"demà",repeated_days:"cada {days}",repeated_days_except:"cada dia excepte {excludedDays}",days_range:"de {startDay} a {endDay}",next_week_day:"el proper {weekday}"},time:{absolute:"a les {time}",interval:"de {startTime} a {endTime}",at_midnight:"a mitjanit",at_noon:"al migdia",at_sun_event:"a {sunEvent}"}},dialog:{enable_schedule:{title:"Completa les modificacions",description:"L'horari que has modificat està actualment desactivat. El vols activar?"},confirm_delete:{title:"Eliminar entitat?",description:"Segur que vols eliminar aquesta entitat?"},confirm_migrate:{title:"Actualitza l'horari",description:"Amb aquest canvi es perdran alguns paràmetres. Vols continuar?"},weekday_picker:{title:"Dies repetits per a l'horari",choose:"Escull..."},entity_picker:{title:"Escull entitats",choose:"Escull...",no_results:"No s'han trobat elements coincidents"},action_picker:{title:"Escull una acció",show_all:"Mostra totes les entitats compatibles"}},panel:{common:{title:"Programador",new_schedule:"Nou horari",default_name:"Horari #{id}"},overview:{no_entries:"No hi ha cap element per mostrar",backend_error:"No s'ha pogut connectar amb el component scheduler. Cal instal·lar-lo com a integració abans de fer servir aquesta targeta.",excluded_items:"{number} {if number is 1} element exclòs {else} elements exclosos",hide_excluded:"amaga els elements exclosos",additional_tasks:"{number} {if number is 1} tasca més {else} tasques més",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Dies repetits",start_time:"Hora d'inici",stop_time:"Hora de fi",action:"Acció",add_action:"Afegeix acció",select_timeslot:"Selecciona una franja horària",toggle_single_mode:"Canvia a mode simple",toggle_scheme_mode:"Canvia a mode esquema",validation_errors:{overlapping_time:"L'horari té franges superposades",missing_target_entity:"A una o més accions els falta una entitat de destinació",missing_service_parameter:"A una o més accions els falta un paràmetre obligatori",missing_action:"L'horari no té cap acció"}},options:{conditions:{header:"Condicions",add_condition:"Afegeix condició",new_condition:"Nova condició",types:{equal_to:"{entity} és igual a {value}",unequal_to:"{entity} és diferent de {value}",above:"{entity} és superior a {value}",below:"{entity} és inferior a {value}"},options:{logic_and:"Totes les condicions han de ser certes",logic_or:"Qualsevol condició ha de ser certa",track_changes:"Torna a avaluar quan canviïn les condicions"}},period:{header:"Període",start_date:"Des de",end_date:"Fins a"},repeat_type:"comportament en finalitzar",tags:"Etiquetes"},card_editor:{tabs:{entities:"Entitats",other:"Altres"},fields:{title:{heading:"Títol de la targeta",options:{standard:"estàndard",hidden:"ocult",custom:"personalitzat"},custom_title:"Títol personalitzat"},discover_existing:{heading:"Mostra tots els horaris",description:"Això defineix el paràmetre 'discover existing'. Els horaris creats prèviament s'afegiran automàticament a la targeta."},time_step:{heading:"Pas de temps",description:"Resolució (en minuts) per crear horaris",unit_minutes:"min"},default_editor:{heading:"Editor horari per defecte",options:{single:"Mode horari simple",scheme:"Mode esquema horari"}},sort_by:{heading:"Opcions d'ordenació",description:"Ordre en què apareixen els horaris a la targeta",options:{relative_time:"Temps restant fins a la següent acció",title:"Títol visible de l'horari",state:"Mostra primer els horaris actius"}},display_format_primary:{heading:"Informació principal mostrada",description:"Configura quina etiqueta es fa servir per als horaris a la vista general",options:{default:"Nom de l'horari",entity_action:"Resum de la tasca"}},display_format_secondary:{heading:"Informació secundària mostrada",description:"Configura quines propietats addicionals són visibles a la vista general",options:{relative_time:"Temps restant fins a la següent acció",time:"Hora configurada per a la següent acció",days:"Dies repetits de la setmana",additional_tasks:"Nombre de tasques addicionals"}},show_header_toggle:{heading:"Mostra l'interruptor de capçalera",description:"Mostra l'interruptor a la part superior de la targeta per activar/desactivar totes les entitats"},show_toggle_switches:{heading:"Mostra interruptors",description:"Mostra un interruptor per a cada horari individual de la targeta"},tags:{heading:"Etiquetes",description:"Fes servir etiquetes per dividir els horaris entre múltiples targetes"},entities:{button_label:"Configura les entitats incloses",heading:"Entitats incloses",description:"Selecciona les entitats que vols controlar amb el programador. Pots fer clic a un grup per obrir-lo. Tingues en compte que algunes entitats, com ara els sensors, només es poden fer servir per a condicions, no per a accions.",included_number:"{number}/{total} seleccionades"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},dt={services:nt,ui:rt},lt=Object.freeze({__proto__:null,services:nt,ui:rt,default:dt}),ct={generic:{turn_on:"Zapnout",turn_off:"Vypnout",parameter_to_value:"{parameter} na {value}",action_with_parameter:"{action} s {parameter}"},climate:{set_temperature:"nastavit teplotu[ na {temperature}]",set_temperature_hvac_mode_heat:"topení[ na {temperature}]",set_temperature_hvac_mode_cool:"chlazení[ na {temperature}]",set_temperature_hvac_mode_heat_cool:"topení/chlazení[ na {temperature}]",set_temperature_hvac_mode_heat_cool_range:"topení/chlazení[ na {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"automatika[ na {temperature}]",set_hvac_mode:"nastavit režim[ na {hvac_mode}]",set_preset_mode:"nastavit předvolbu[ {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"zavřít",open_cover:"otevřít",set_cover_position:"nastavit polohu[ na {position}]",set_cover_tilt_position:"set tilt position[ to {tilt_position}]"},fan:{set_percentage:"nastavit rychlost[ na {speed}]",set_direction:"nastavit směr[ na {direction}]",oscillate:"nastavit oscilaci[ na {oscillate}]"},humidifier:{set_humidity:"nastavit vlhkost[ na {humidity}]",set_mode:"nastavit režim[ na {mode}]"},input_number:{set_value:"nastavit hodnotu[ na {value}]"},input_select:{select_option:"vybrat možnost[ {option}]"},select:{select_option:"vybrat možnost[ {option}]"},light:{turn_on:"zapnout[ na {brightness} jas]"},media_player:{select_source:"vybrat zdroj[ {source}]"},notify:{send_message:"send notification"},script:{execute:"spustit"},vacuum:{start_pause:"start / pauza"},water_heater:{set_operation_mode:"nastavit režim[ na {operation_mode}]",set_away_mode:"vypnout režim"}},ht={components:{date:{day_types_short:{daily:"denně",workdays:"pracovní dny",weekend:"víkendy"},day_types_long:{daily:"každý den",workdays:"v pracovní dny",weekend:"o víkendu"},days:"dnů",tomorrow:"zítra",repeated_days:"každý {days}",repeated_days_except:"každý den kromě {excludedDays}",days_range:"od {startDay} do {endDay}",next_week_day:"příští {weekday}"},time:{absolute:"od {time}",interval:"od {startTime} do {endTime}",at_midnight:"od půlnoc",at_noon:"od poledne",at_sun_event:"na {sunEvent}"}},dialog:{enable_schedule:{title:"Dokončete úpravy",description:"Plán, který byl změněn, je aktuálně zakázán, měl by být povolen?"},confirm_delete:{title:"Odebrat entitu?",description:"Opravdu chcete tuto entitu odebrat?"},confirm_migrate:{title:"Aktualizovat plán",description:"Některá nastavení budou touto změnou ztracena. Chceš pokračovat?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Plánovač",new_schedule:"Nový plán",default_name:"Plán #{id}"},overview:{no_entries:"Nejsou žádné položky k zobrazení",backend_error:"Could not connect with the scheduler component. It needs to be installed as integration before this card can be used.",excluded_items:"{number} vyloučeno {if number is 1} položka {else} položek",hide_excluded:"skrýt vyloučené položky",additional_tasks:"{number} a více {if number is 1} úkol {else} úkolů",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Nejprve vyberte časový úsek",toggle_single_mode:"Do režimu jednoho",toggle_scheme_mode:"Do režimu schématu",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"Období",start_date:"From",end_date:"To"},repeat_type:"behaviour after completion",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},ut={services:ct,ui:ht},pt=Object.freeze({__proto__:null,services:ct,ui:ht,default:ut}),mt={generic:{turn_on:"Einschalten",turn_off:"Ausschalten",parameter_to_value:"{parameter} auf {value}",action_with_parameter:"{action} mit {parameter}"},climate:{set_temperature:"Temperatur einstellen[ auf {temperature}]",set_temperature_hvac_mode_heat:"Heizen[ auf {temperature}]",set_temperature_hvac_mode_cool:"Kühlen[ auf {temperature}]",set_temperature_hvac_mode_heat_cool:"Heizen/Kühlen[ auf {temperature}]",set_temperature_hvac_mode_heat_cool_range:"Heizen/Kühlen[ auf {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"Automatisch[ auf {temperature}]",set_hvac_mode:"Modus setzen[ auf {hvac_mode}]",set_preset_mode:"Voreinstellung setzen[ auf {preset_mode}]",set_fan_mode:"Lüftermodus einstellen[ auf {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"Schließen",open_cover:"Öffnen",set_cover_position:"Position setzen[ auf {position}]",set_cover_tilt_position:"Neigungsposition setzen[ auf {tilt_position}]"},fan:{set_percentage:"Geschwindigkeit setzen[ auf {speed}]",set_direction:"Richtung setzen[ auf {direction}]",oscillate:"Oszillation setzen[ auf {oscillate}]"},humidifier:{set_humidity:"Luftfeuchtigkeit setzen[ auf {humidity}]",set_mode:"Modus setzen[ auf {mode}]"},input_number:{set_value:"Wert setzen[ auf {value}]"},input_select:{select_option:"Option[ {option}] auswählen"},select:{select_option:"Option[ {option}] auswählen"},light:{turn_on:"Anschalten[ mit {brightness} Helligkeit]"},media_player:{select_source:"Quelle[ {source}] auswählen"},notify:{send_message:"Nachricht senden"},script:{execute:"Ausführen"},vacuum:{start_pause:"Start/Pause"},water_heater:{set_operation_mode:"Modus setzen[ auf {operation_mode}]",set_away_mode:"Abwesenheitsmodus setzen"}},_t={components:{date:{day_types_short:{daily:"Täglich",workdays:"Werktags",weekend:"Wochenende"},day_types_long:{daily:"Jeden Tag",workdays:"An Werktagen",weekend:"Am Wochenende"},days:"Tage",tomorrow:"Morgen",repeated_days:"Jeden {days}",repeated_days_except:"Täglich außer {excludedDays}",days_range:"von {startDay} bis {endDay}",next_week_day:"nächsten {weekday}"},time:{absolute:"um {time}",interval:"von {startTime} bis {endTime}",at_midnight:"um Mitternacht",at_noon:"zum Mittag",at_sun_event:"beim {sunEvent}"}},dialog:{enable_schedule:{title:"Modifikationen beenden",description:"Der geänderte Zeitplan ist derzeit deaktiviert, soll er aktiviert werden?"},confirm_delete:{title:"Entität entfernen?",description:"Bist du dir sicher, dass du diese Entität löschen möchtest?"},confirm_migrate:{title:"Zeitplan ändern",description:"Einige Einstellungen gehen durch diese Änderung verloren. Möchtest du fortfahren?"},weekday_picker:{title:"Wiederholungen für den Zeitplan",choose:"Auswahl..."},entity_picker:{title:"Entitäten auswählen",choose:"Auswahl...",no_results:"Keine passenden Elemente gefunden"},action_picker:{title:"Aktion auswählen",show_all:"Alle unterstützten Entitäten anzeigen"}},panel:{common:{title:"Zeitplaner",new_schedule:"Neuer Zeitplan",default_name:"Zeitplan #{id}"},overview:{no_entries:"Es gibt keine Einträge, die angezeigt werden können",backend_error:"Es konnte keine Verbindung mit der Scheduler-Komponente hergestellt werden. Es muss als Integration installiert werden, bevor diese Karte verwendet werden kann.",excluded_items:"{number} {if number is 1} ausgeschlossener Eintrag {else} ausgeschlossene Einträge",hide_excluded:"Verstecke ausgeschlossene Einträge",additional_tasks:"{number} weitere {if number is 1} Aufgabe {else} Aufgaben",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Wiederholen",start_time:"Startzeit",stop_time:"Endzeit",action:"Aktion",add_action:"Aktion hinzufügen",select_timeslot:"Wähle ein Zeitfenster aus",toggle_single_mode:"Zum Einzelmodus",toggle_scheme_mode:"Zum Schemamodus",validation_errors:{overlapping_time:"Der Zeitplan weist Überschneidungen auf.",missing_target_entity:"Bei einer oder mehreren Aktionen fehlt eine Zielentität.",missing_service_parameter:"Bei einer oder mehreren Aktionen fehlt eine erforderliche Einstellung.",missing_action:"Zeitplan enthält keine Aktionen"}},options:{conditions:{header:"Bedingungen",add_condition:"Bedingung hinzufügen",new_condition:"Neuer Zustand",types:{equal_to:"{entity} ist {value}",unequal_to:"{entity} ist nicht {value}",above:"{entity} ist über {value}",below:"{entity} ist unter {value}"},options:{logic_and:"Alle Bedingungen müssen zutreffen.",logic_or:"Eine Bedingung muss zutreffen.",track_changes:"Erneut prüfen wenn sich die Zustände ändern"}},period:{header:"Zeitraum",start_date:"Von",end_date:"Bis"},repeat_type:"Verhalten nach Abschluss",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},gt={services:mt,ui:_t},vt=Object.freeze({__proto__:null,services:mt,ui:_t,default:gt}),ft={generic:{turn_on:"Ενεργοποίηση",turn_off:"Απενεργοποίηση",parameter_to_value:"{parameter} σε {value}",action_with_parameter:"{action} με {parameter}"},climate:{set_temperature:"ορισμός θερμοκρασίας[ σε {temperature}]",set_temperature_hvac_mode_heat:"θέρμανση[ σε {temperature}]",set_temperature_hvac_mode_cool:"ψύξη[ σε {temperature}]",set_temperature_hvac_mode_heat_cool:"θέρμανση/ψύξη[ σε {temperature}]",set_temperature_hvac_mode_heat_cool_range:"θέρμανση/ψύξη[ σε {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ σε {temperature}]",set_hvac_mode:"ορισμός λειτουργίας[ σε {hvac_mode}]",set_preset_mode:"ορισμός προκαθορισμένης ρύθμισης[ σε {preset_mode}]",set_fan_mode:"όρισμός ανεμιστήρα[ σε {fan_mode}]",set_swing_mode:"ορισμός κατεύθυνσης[ σε {swing_mode}]"},cover:{close_cover:"κλείσιμο",open_cover:"άνοιγμα",set_cover_position:"ορισμός θέσησ[ σε {position}]",set_cover_tilt_position:"ορισμός κλίσης[ σε {tilt_position}]"},fan:{set_percentage:"ορισμός ταχύτητας[ σε {percentage}]",set_direction:"ορισμός κατεύθυνσης[ σε {direction}]",oscillate:"ορισμός ταλάντωσης[ σε {oscillate}]"},humidifier:{set_humidity:"ορισμός υγρασίας[ σε {humidity}]",set_mode:"ορισμός λειτουργίας[ σε {mode}]"},input_number:{set_value:"ορισμός τιμής[ σε {value}]"},input_select:{select_option:"επιλογή παραμέτρου[ {option}]"},select:{select_option:"επιλογή παραμέτρου[ {option}]"},light:{turn_on:"άναμα[ με φωτεινότητα {brightness} ]"},media_player:{select_source:"επιλογή πηγής[ {source}]"},notify:{send_message:"αποστολή ειδοποίησης"},script:{execute:"εκτέλεση"},vacuum:{start_pause:"έναρξη / παύση"},water_heater:{set_operation_mode:"ορισμός λειτουργίας[ σε {operation_mode}]",set_away_mode:"ορισμός λειτουργίας απουσίας"}},bt={components:{date:{day_types_short:{daily:"ημερήσια",workdays:"εργάσιμες",weekend:"σαββατοκύριακο"},day_types_long:{daily:"κάθε μέρα",workdays:"τις καθημερινές",weekend:"το σαββατοκύριακο"},days:"ημέρες",tomorrow:"αύριο",repeated_days:"κάθε {days}",repeated_days_except:"κάθε μέρα εκτός {excludedDays}",days_range:"από {startDay} έως {endDay}",next_week_day:"επόμενη/-ο {weekday}"},time:{absolute:"στις {time}",interval:"από {startTime} ως {endTime}",at_midnight:"τα μεσάνυχτα",at_noon:"το μεσημέρι",at_sun_event:"το {sunEvent}"}},dialog:{enable_schedule:{title:"Ολοκλήρωση τροποποιήσεων",description:"Το πρόγραμμα που τροποποιήθηκε είναι απενεργοποιημένο, επιθυμείτε να το ενεργοποιήσετε;"},confirm_delete:{title:"Αφαίρεση οντότητας",description:"Είστε σίγουροι ότι θέλετε να αφαιρεθεί αυτή η οντότητα;"},confirm_migrate:{title:"Ενημέρωση προγράμματος",description:"Κάποιες ρυθμίσεις θα χαθούν από αυτή την αλλαγή. Θέλετε να συνεχίσετε;"},weekday_picker:{title:"Επαναλαμβανόμενες ημέρες για το πρόγραμμα",choose:"Επιλογή ημερών..."},entity_picker:{title:"Επιλογή οντοτήτων",choose:"Επιλογή...",no_results:"Δεν βρέθηκε οντότητα"},action_picker:{title:"Επιλογή ενέργειας",show_all:"Εμφάνιση όλων των υποστηριζόμενων οντοτήτων"}},panel:{common:{title:"Χρονοπρογραμματισμός",new_schedule:"Νέο Πρόγραμμα",default_name:"Πρόγραμμα #{id}"},overview:{no_entries:"Δεν βρέθηκαν καταχωρήσεις προς προβολή",backend_error:"Δεν είναι δυνατή η σύνδεη με το scheduler component. Πρέπει να εγκατασταθεί σαν integration πριν την χρήση αυτής της κάρτας.",excluded_items:"{number} {if number is 1} εξαιρούμενο αντικείμενο {else} εξαιρούμενα αντικείμενα",hide_excluded:"απόκρυψη εξαιρούμενων αντικειμένων",additional_tasks:"{number} επιπλέον {if number is 1} εργασία {else} εργασίες",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Επαναλαμβανόμενες ημέρες",start_time:"Ώρα έναρξης",stop_time:"Ώρα ολοκλήρωσης",action:"Ενέργεια",add_action:"Προσθήκη ενέργειας",select_timeslot:"Επιλογή μιας ώρας",toggle_single_mode:"Μεμονωμένη λειτουργία",toggle_scheme_mode:"Λειτουργία προγραμματισμού",validation_errors:{overlapping_time:"Το πρόγραμμα παρουσιάζει αλληλοεπικαλύψεις ώρας",missing_target_entity:"Μια ή περισσότερες ενέργειες δεν διαθέτουν οντότητα - στόχο",missing_service_parameter:"Μια ή περισσότερες ενέργειες δεν διαθέτουν μια απαιτούμενη ρύθμιση",missing_action:"Το πρόγραμμα δεν διαθέτει ενέργειες"}},options:{conditions:{header:"Συνθήκες",add_condition:"Προσθήκη συνθήκης",new_condition:"Νέα συνθήκη",types:{equal_to:"{entity} ισούται με {value}",unequal_to:"{entity} δεν ισούται με {value}",above:"{entity} είναι περισσότερο από {value}",below:"{entity} είναι λιγότερο από {value}"},options:{logic_and:"Όλες οι συνθήκες πρέπει να αληθεύουν",logic_or:"Οποιαδήποτε συνθήκη πρέπει να αληθεύει",track_changes:"Επαναξιολόγηση όταν οι συνθήκες αλλάξουν"}},period:{header:"Περίοδος",start_date:"Από",end_date:"Έως"},repeat_type:"συμπεριφορά μετά την ολοκλήρωση",tags:"Tags"},card_editor:{tabs:{entities:"Οντότητες",other:"Λοιπά"},fields:{title:{heading:"Τίτλος της κάρτας",options:{standard:"τυπικό",hidden:"κρυφό",custom:"προσαρμοσμένο"},custom_title:"Προσαρμοσμενος τίτλος"},discover_existing:{heading:"Προβολή όλων των προγραμμάτων",description:"Αυτό ρυθμίζει την παράμμετρο 'ανακάλυψη υπαρχόντων'. Τα ήδη δημιουργημένα προγράμματα θα προστεθούν αυτόματα στην κάρτα. "},time_step:{heading:"Βήμα χρόνου",description:"Ανάλυση (σε λεπτά) για τη δημιουργία προγραμμάτων",unit_minutes:"λεπτά"},default_editor:{heading:"Προεπιλεγμένος επεξεργαστής χρόνου",options:{single:"Λειτουργία μονής χρονικής περιόδου",scheme:"Λειτουργία χρονικού σχήματος"}},sort_by:{heading:"Επιλογές ταξινόμησης",description:"Σειρά με την οποία εμφανίζονται τα προγράμματα στην κάρτα",options:{relative_time:"Υπολειπόμενος χρόνος έως την επόμενη ενέργεια",title:"Εμφανιζόμενος τίτλος του προγράμματος",state:"Εμφάνιση των ενεργών προγραμμάτων στην κορυφή"}},display_format_primary:{heading:"Προβαλλόμενη κύρια πληροφορία",description:"Ρυθμίστε ποια ετικέτα χρησιμοποιείται για τα προγράμματα στην επισκόπηση",options:{default:"Όνομα προγράμματος",entity_action:"Σύνοψη ενέργειας"}},display_format_secondary:{heading:"Προβαλλόμενη δευτερεύουσα πληροφορία",description:"Ρυθμίστε ποιες πρόσθετες ιδιότητες εμφανίζονται στην επισκόπηση",options:{relative_time:"Υπολειπόμενος χρόνος μέχρι την επόμενη ενέργεια",time:"Προγραμματισμένη ώρα για την επόμενη ενέργεια",days:"Επαναλαμβανόμενες ημέρες της εβδομάδας",additional_tasks:"Αριθμός πρόσθετων εργασιών"}},show_header_toggle:{heading:"Εμφάνιση διακόπτη κεφαλίδας",description:"Εμφάνιση διακόπτη στο επάνω μέρος της κάρτας για ενεργοποίηση/απενεργοποίηση όλων των οντοτήτων"},show_toggle_switches:{heading:"Εμφάνιση διακοπτών εναλλαγής",description:"Εμφάνιση διακόπτη εναλλαγής για κάθε μεμονωμένο πρόγραμμα στην κάρτα"},tags:{heading:"Ετικέτες",description:"Χρησιμοποιήστε ετικέτες για να χωρίσετε τα προγράμματα μεταξύ πολλών καρτών"},entities:{button_label:"Ρύθμιση συμπεριλαμβανόμενων οντοτήτων",heading:"Συμπεριλαμβανόμενες οντότητες",description:"Επιλέξτε τις οντότητες που θέλετε να ελέγχετε μέσω του χρονοπρογραμματιστή. Μπορείτε να κάνετε κλικ σε μια ομάδα για να την ανοίξετε. Λάβετε υπόψη ότι ορισμένες οντότητες (όπως αισθητήρες) μπορούν να χρησιμοποιηθούν μόνο για συνθήκες και όχι για ενέργειες.",included_number:"{number}/{total} επιλεγμένες"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},yt={services:ft,ui:bt},wt=Object.freeze({__proto__:null,services:ft,ui:bt,default:yt}),kt={generic:{turn_on:"Turn on",turn_off:"Turn off",parameter_to_value:"{parameter} to {value}",action_with_parameter:"{action} with {parameter}"},climate:{set_temperature:"set temperature[ to {temperature}]",set_temperature_hvac_mode_heat:"heat[ to {temperature}]",set_temperature_hvac_mode_cool:"cool[ to {temperature}]",set_temperature_hvac_mode_heat_cool:"heat/cool[ to {temperature}]",set_temperature_hvac_mode_heat_cool_range:"heat/cool[ to {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ to {temperature}]",set_hvac_mode:"set mode[ to {hvac_mode}]",set_preset_mode:"set preset[ to {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"close",open_cover:"open",set_cover_position:"set position[ to {position}]",set_cover_tilt_position:"set tilt position[ to {tilt_position}]"},fan:{set_percentage:"set speed[ to {percentage}]",set_direction:"set direction[ to {direction}]",oscillate:"set oscillation[ to {oscillate}]"},humidifier:{set_humidity:"set humidity[ to {humidity}]",set_mode:"set mode[ to {mode}]"},input_number:{set_value:"set value[ to {value}]"},input_select:{select_option:"select option[ {option}]"},select:{select_option:"select option[ {option}]"},light:{turn_on:"turn on[ with {brightness} brightness]"},media_player:{select_source:"select source[ {source}]"},notify:{send_message:"send notification"},script:{execute:"execute"},vacuum:{start_pause:"start / pause"},water_heater:{set_operation_mode:"set mode[ to {operation_mode}]",set_away_mode:"set away mode"}},xt={components:{date:{day_types_short:{daily:"daily",workdays:"workdays",weekend:"weekend"},day_types_long:{daily:"every day",workdays:"on workdays",weekend:"in the weekend"},days:"days",tomorrow:"tomorrow",repeated_days:"every {days}",repeated_days_except:"every day except {excludedDays}",days_range:"from {startDay} to {endDay}",next_week_day:"next {weekday}"},time:{absolute:"at {time}",interval:"from {startTime} to {endTime}",at_midnight:"at midnight",at_noon:"at noon",at_sun_event:"at {sunEvent}",on_day_of:"at {time} on the day of {anchor}"}},dialog:{enable_schedule:{title:"Complete modifications",description:"The schedule you have changed is currently disabled, do you want to enable it?"},confirm_delete:{title:"Remove entity?",description:"Are you sure you want to remove this entity?"},confirm_migrate:{title:"Update schedule",description:"Some settings will be lost by this change. Do you want to continue?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Scheduler",new_schedule:"New schedule",default_name:"Schedule #{id}"},overview:{no_entries:"There are no items to show",backend_error:"Could not connect with the scheduler component. It needs to be installed as integration before this card can be used.",excluded_items:"{number} excluded {if number is 1} item {else} items",hide_excluded:"hide excluded items",additional_tasks:"{number} more {if number is 1} task {else} tasks",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Select a timeslot",toggle_single_mode:"To single mode",toggle_scheme_mode:"To scheme mode",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"Period",start_date:"From",end_date:"To"},repeat_type:"behaviour after completion",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}},plan:{title:"Shabbat plan",open:"Shabbat plan",anchor:{opens:"Candle lighting",closes:"Havdalah",fixed:"the same hour every day (not tied to Shabbat)"},boundary:{exact:"at the anchor",offset:"before / after",clock:"at a clock time that day",before:"before",after:"after",from:"From",to:"Until",starts_after:'Starts where "{name}" ends.',starts_open:"Starts when Shabbat comes in.",pushes:'Moving this moves where "{name}" begins: stretches meet, they never overlap and never leave a gap.'},cube:{welcome:"Kabbalat Shabbat",night:"Night",morning:"Morning",afternoon:"Afternoon",close:"Motzei Shabbat",unnamed:"Unnamed",split:"Split"},group:{default:"Shabbat group",new:"Group {n}",add:"Add a group",remove:"Remove this group",members:"{n} devices",devices:"Devices in this group"},detach:{name:"Exception",action:"detach",row:"detached from its group",rejoin:"Back to the group",note:"{device} keeps its own hours here. The group leaves it alone until this ends, then takes it back.",once:"One-off, on",hint:"Click a device to give it its own hours here.",once_hint:"Leave empty to repeat every week."},state:{label:"State",on:"On",off:"Off"},error:{no_entities:'"{group}" has no devices yet.',no_anchor:"The plan needs its times from an entity.",no_anchor_hint:"Enable the Jewish Calendar integration so that {start} and {end} publish a time. Halachic times are not a fixed offset from sunset, so they have to be read at trigger time rather than guessed."},color:{label:"Colour",auto:"Automatic — follows the action"},help:{open:"What is this?",band:"The bar is one Shabbat, from candle lighting to havdalah. It is not a clock: it starts on Friday evening and ends the next night, so the same bar covers a festival that runs for two or three days.",rows:"Each row is a group of devices that move together. Cutting a stretch in one row changes only that row — nobody else's times move.",detach:"A device that needs different hours for a while is detached: it gets a row of its own, and while that row is running the group leaves it alone. When it ends the group takes it back, with no further action from you.",keys:"Click a stretch to edit it. Drag the line between two stretches to move the boundary. + splits a stretch in two; Delete removes the selected one.",cube:"A stretch is a piece of the bar: a start, an end, and a list of devices. What it says here happens the moment it begins and stays that way until the next stretch takes over. Split it to make two out of one, or drag the line between two stretches to move where they meet.",devices:"Every device of the group gets its own row, so one stretch can run the salon air conditioner and leave the bedrooms off. Three choices per device: on, off, or not in this stretch at all. The third is a real choice, not a shade of off — the stretch never touches that device, so it keeps whatever it had, is not held to anything, is not retried if a call fails, and any other schedule is free to drive it.",group:'A group is a set of devices that move together: they share one row of stretches. A device added here appears in every stretch of the row, and can still be taken out of any single one, or given hours of its own with "detach".',book:"The device book is where you name things once and group them once. Names are saved as Home Assistant aliases and groups as labels, so both work everywhere in Home Assistant rather than only here. The kind is the scheduler’s own: correct it when a device is registered under the wrong domain — an air conditioner wired behind a plain switch — so this editor offers it degrees instead of brightness.",book_groups:"One click adds every device of that group. Groups come from the device book, so this is the quick way in: name your rooms once, and pick them by name forever after.",book_devices:"The devices your book knows, under the names you gave them. Click to add or remove. If something is missing it simply has not been named yet — open the device book from Settings, or pick the entity by hand.",report:"The plan read back as what will actually happen, in order, with every device named. The times are worked out from this week’s candle lighting and havdalah, so it is the real thing rather than a sketch. Worth reading before saving; it opens again straight afterwards.",colours:"Plain paints a stretch by what it does: green for on, grey for off, and striped when the devices inside it disagree. Following the action tints it with the colour the bulb will really show, which is prettier and much harder to read at a glance.",times:"The times this household keeps. A new plan starts from these, so they are set once here instead of typed into every wizard. Changing them never touches a plan already built.",opening:"The plan takes over at candle lighting. What you choose here is what the house does at that moment, and it holds until the first moment you add.",hold:"With holding on, a device moved during the plan is put back — a wall switch pressed out of habit, or an automation that does not know it is Shabbat. It waits 30 seconds between attempts, so it can never end up fighting whatever moved it. With holding off, the plan sets each device at the boundary and then leaves it alone.",step_intro:"Nothing is saved while you are in here. At the end you get an ordinary plan in the editor, and you still have to press Save.",step_devices:"Pick from the book first — those are your own names for your own things. Reach for the entity picker only when the book has never heard of something.",step_opening:"One choice for everything, to keep this simple. Devices start differing from each other two steps from here.",step_moments:"Each moment says only when it ends; the next begins exactly there, so a gap or an overlap is impossible. Three ways to say when: a clock reading, a distance from sunset, or a distance from havdalah. The last two move with the year, a clock reading does not, and that is what the notes below are about.",step_settings:'This is where a plan stops being "everything on". Set the moment as a whole above, then change only the devices that should differ — including any that this moment should not touch at all.',step_hold:"One choice for the whole plan. Any single stretch can still be changed on its own in the editor afterwards.",step_review:"Read it top to bottom. Everything here can be edited afterwards, and nothing is saved until you press Save in the editor."},wizard:{open:"Guided setup",offer:"New here? A few questions will build a working plan, and you can keep editing it afterwards.",offer_yes:"Take me through it",offer_no:"I'll do it myself",back:"Back",next:"Next",finish:"Build the plan",yes:"Yes",no:"No",intro:{title:"Let's set up your Shabbat",body:"You'll answer a few questions and get a working plan. Nothing is saved until you press Save at the end, and everything can be changed afterwards in the editor."},devices:{title:"Which devices?",body:"Pick the lights and switches that should follow this plan, straight from your device book. You can add more later, and any one of them can be given hours of its own afterwards.",groups:"Groups from your book",book:"Devices from your book",no_book:"Your book is empty. Open Settings → Device book to name what you have, or pick an entity by hand below.",advanced:"Pick an entity by hand",simple:"Back to the book",advanced_hint:"Every entity Home Assistant knows, by its raw id. Anything picked here is worth naming in the device book afterwards.",chosen:"{n} chosen.",none:"Nothing chosen yet — pick at least one to go on."},moments:{title:"Build your Shabbat",body:"Add the moments your day is made of — dinner, bedtime, morning, lunch, a nap. You only say when each one ends; the next one begins exactly there, so there is no way to leave a gap or an overlap. What the devices do is the step after this.",add:"Add a moment",name:"Name it",empty:"No moments yet - the devices will simply hold their opening state until Shabbat goes out."},when:{clock:"at a clock time",sunset:"from sunset",end:"from havdalah",hint:"How this moment says when it ends. A clock time is fixed all year; the other two move with the sun."},preset:{meal_eve:"Friday night dinner",sleep:"Bedtime",morning:"Morning",meal_day:"Shabbat lunch",nap:"Afternoon nap",close:"Going out"},review:{title:"This is your Shabbat",body:"Read it through. Anything here can still be changed in the editor afterwards.",outside:"{names} falls outside the band and was left out. Shabbat evening times must be after candle lighting, and Shabbat day times before havdalah."},settings:{title:"What each device does",body:"Moment by moment. Set the moment as a whole with the on/off above it, then change any device that should differ — the salon air conditioner during the meal while the bedrooms stay off, one light bright and another dim."},step_of:"Step {n} of {total}",blocked:"Something above has to change before you can go on.",opening:{title:"What happens at candle lighting?",body:"The plan takes over the moment Shabbat comes in, and holds until the first moment you add in the next step. Choose what the house does then; individual devices can be set differently two steps from here.",label:"At candle lighting",at:"That is {time} this week."},hold:{title:"Should the plan hold its state?",body:"A Shabbat plan usually should. If a wall switch is pressed out of habit, or another automation moves a device without knowing it is Shabbat, holding puts it back rather than leaving it wrong until the morning."},caution:{outside:"This lands at {time}, outside Shabbat — the stretch would never run.",tight:"{time} is close to the edge of the band. On another Shabbat it can fall outside it.",hard:"{time} is a fixed clock time: it does not move with the sun, so it can land differently another week.",unknown:"This time cannot be worked out yet.",estimate:"This works out to about {time}. The exact sunset is read on the day, so it can land a few minutes either side of that."},problem:{no_time:'"{name}" has no time yet.',outside:'"{name}" lands at {time}, outside this Shabbat. Move it inside the band, or measure it from sunset or from havdalah instead of the clock.',collide:"{names} land on the same minute. Two moments at the same time would leave nothing in between them — move one.",hard:"{names} use a fixed clock time. It works this Shabbat, but candle lighting and havdalah move by more than an hour across the year, so on another Shabbat the same reading can fall outside the band. Nothing breaks when that happens: the stretch simply does not run, and the one before it carries on, with the same devices in the same state, until the next boundary that does land. Measuring from sunset or from havdalah avoids it entirely.",tight:'"{name}" is only {hours} hours from the edge of the band. It works tonight, but it is the first one that will fall outside on a Shabbat that comes in later.',unknown:'"{name}" cannot be placed yet - whatever publishes its time has not said anything. The boundary itself is fine; it will be worked out when the plan runs.'}},override:{label:"Devices in this stretch",hint:"Each device can do its own thing here, with its own settings — the salon air conditioner on at 16° while the bedrooms are off. A device with nothing set of its own simply follows the stretch.",flip:"make this one differ here",back:"follow the stretch",follows:"follows the stretch"},light:{brightness:"Brightness",warmth:"Colour",set:"set",clear:"leave as is",warm:"warm",neutral:"neutral",cool:"daylight"},enforce:{label:"Hold this state",beta:"experimental",on:"Hold",off:"Don't hold",hint:"If a wall switch or another integration changes a device during this stretch, put it back. Waits 30 seconds between attempts so it cannot end up fighting whatever moved it."},history:{undo:"Undo",redo:"Redo"},keys:{open:"Keyboard shortcuts",select:"previous / next stretch",row:"previous / next row",move_start:"move its start by 5 minutes",move_stop:"move its end by 5 minutes",state:"on / off",colour:"colour, 0 for automatic",rename:"rename it"},report:{open:"What will happen",title:"What will happen",own:"its own",taken:'until "{name}"',saved:"Saved. This is what it will do."},climate:{degrees:"Temperature"},book:{open:"Device book",title:"Device book",hint:"Your own names and groupings — kept in Home Assistant, so they work outside the scheduler too.",new_group:"Name a new group…",from_selection:"from this group's devices",use:"add to this group",name_it:"call it…",kind:{light:"light",switch:"switch",climate:"air conditioner / heater",cover:"cover",fan:"fan",media_player:"media player",other:"something else"}},device:{all:"All devices",all_hint:"A shortcut: sets every device of this group in this stretch. Each can still be changed on its own below.",untouched:"Not in this stretch",untouched_hint:"This stretch does not act on it: it keeps whatever it had, is not held to anything, is not retried, and any other schedule may drive it."},settings:{open:"Settings",title:"Settings",hint:"Preferences, and the device book.",colours:"Colours",colours_plain:"Plain on / off",colours_action:"Follow the action",colours_hint:"Plain makes on and off unmistakable at a glance. Following the action tints a stretch with the colour the bulb will actually show.",times:"Default times",times_hint:"What the wizard offers when you add one of these moments. Plans you have already built keep the times they were built with.",times_reset:"Back to the suggested times"}}}},$t={services:kt,ui:xt},St=Object.freeze({__proto__:null,services:kt,ui:xt,default:$t}),jt={generic:{turn_on:"Encender",turn_off:"Apagar",parameter_to_value:"{parameter} a {value}",action_with_parameter:"{action} con {parameter}"},climate:{set_temperature:"establecer temperatura[ a {temperature}]",set_temperature_hvac_mode_heat:"calefacción[ a {temperature}]",set_temperature_hvac_mode_cool:"frío[ a {temperature}]",set_temperature_hvac_mode_heat_cool:"calefacción/frío[ a {temperature}]",set_temperature_hvac_mode_heat_cool_range:"calefacción/frío[ a {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"automático[ a {temperature}]",set_hvac_mode:"establecer modo[ a {hvac_mode}]",set_preset_mode:"establecer preajuste[ {preset_mode}]",set_fan_mode:"establecer ventilador[ a {fan_mode}]",set_swing_mode:"establecer oscilación[ a {swing_mode}]"},cover:{close_cover:"cerrado",open_cover:"abierto",set_cover_position:"establecer posición[ a {position}]",set_cover_tilt_position:"establecer inclinación[ a {tilt_position}]"},fan:{set_percentage:"establecer velocidad[ a {speed}]",set_direction:"establecer dirección[ a {direction}]",oscillate:"establecer oscilación[ a {oscillate}]"},humidifier:{set_humidity:"establecer humedad[ a {humidity}]",set_mode:"establecer modo[ a {mode}]"},input_number:{set_value:"establecer valor[ a {value}]"},input_select:{select_option:"seleccionar opción[ a {option}]"},select:{select_option:"seleccionar opción[ {option}]"},light:{turn_on:"encender[ con brillo en {brightness}]"},media_player:{select_source:"seleccionar fuente[ {source}]"},notify:{send_message:"enviar notificación"},script:{execute:"ejecutar"},vacuum:{start_pause:"iniciar / pausar"},water_heater:{set_operation_mode:"establecer modo[ a {operation_mode}]",set_away_mode:"establecer modo fuera de casa"}},Ot={components:{date:{day_types_short:{daily:"todos los días",workdays:"días hábiles",weekend:"fin de semana"},day_types_long:{daily:"todos los días",workdays:"días hábiles",weekend:"fin de semana"},days:"días",tomorrow:"mañana",repeated_days:"cada {days}",repeated_days_except:"cada dia excepto {excludedDays}",days_range:"de {startDay} a {endDay}",next_week_day:"próximo {weekday}"},time:{absolute:"a la(s) {time}",interval:"desde la(s) {startTime} hasta la(s) {endTime}",at_midnight:"a la medianoche",at_noon:"al mediodía",at_sun_event:"al {sunEvent}"}},dialog:{enable_schedule:{title:"Completar modificaciones",description:"El horario que ha modificado está actualmente deshabilitado, ¿Desea habilitarlo?"},confirm_delete:{title:"¿Eliminar entidad?",description:"¿Está seguro de que deseas eliminar esta entidad?"},confirm_migrate:{title:"Modificar horario",description:"Algunas configuraciones se perderán con este cambio. ¿Desea proceder?"},weekday_picker:{title:"Días repetidos para el horario",choose:"Elegir..."},entity_picker:{title:"Elegir entidades",choose:"Elegir...",no_results:"No se encontraron artículos coincidentes"},action_picker:{title:"Elija Acción",show_all:"Mostrar todas las entidades admitidas"}},panel:{common:{title:"Planificador",new_schedule:"Nuevo horario",default_name:"Horario #{id}"},overview:{no_entries:"No hay ningún elemento que mostrar",backend_error:"Fallo de conexión con el componente planificador (Scheduler component). Debe ser instalado como integración antes de poder usar este panel.",excluded_items:"{number} {if number is 1} elemento excluido {else} elementos excluidos",hide_excluded:"ocultar elementos excluidos",additional_tasks:"{number} {if number is 1} tarea adicional {else} tareas adicionales",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Días repetidos",start_time:"Inicio",stop_time:"Finalización",action:"Acción",add_action:"Agregar acción",select_timeslot:"Seleccione un bloque de tiempo",toggle_single_mode:"Al modo simple",toggle_scheme_mode:"Al modo esquema",validation_errors:{overlapping_time:"El esquema tiene bloques de tiempo sobrepuestos",missing_target_entity:"Una o más acciones carecen de una entidad asociada",missing_service_parameter:"Una o más acciones carecen de una configuración requerida",missing_action:"El horario no tiene acciones"}},options:{conditions:{header:"Condiciones",add_condition:"Agregar condición",new_condition:"Nueva condición",types:{equal_to:"{entity} es igual a {value}",unequal_to:"{entity} es diferente a {value}",above:"{entity} es mayor que {value}",below:"{entity} es menor que {value}"},options:{logic_and:"Todas las condiciones deben ser válidas",logic_or:"Cualquier condición debe ser válida",track_changes:"Reevaluar si una condición cambia"}},period:{header:"Período",start_date:"De",end_date:"A"},repeat_type:"comportamiento despues de finalizar ",tags:"Etiquetas"},card_editor:{tabs:{entities:"Entidades",other:"Otros"},fields:{title:{heading:"Títujo de la tarjeta",options:{standard:"estándar",hidden:"oculta",custom:"personalizada"},custom_title:"Título personalizado"},discover_existing:{heading:"Mostrar todos los horarios",description:"Esto ajustará el parámetro 'descubrir existentes (discover existing)'. Los horarios creados anteriormente deberán de ser agregados automáticamente a la tarjeta."},time_step:{heading:"Paso de tiempo",description:"Resolución (en minutos) para la creación de horarios.",unit_minutes:"min"},default_editor:{heading:"Editor de tiempo por defecto",options:{single:"Modo de horario sencillo",scheme:"Modo de esquema de tiempo"}},sort_by:{heading:"Opciones de clasificación",description:"Orden en que los horarios aparecen en la tarjeta",options:{relative_time:"Tiempo restante hasta la siguiente acción",title:"Título mostrado del horario",state:"Mostrar los horarios activos primero"}},display_format_primary:{heading:"Mostrar información primaria",description:"Configura que etiqueta se utiliza para los horarios en la vista principal",options:{default:"Nombre del horario",entity_action:"Resumen de la tarea"}},display_format_secondary:{heading:"Mostrar información secundaria",description:"Configura que propiedades adicionales son visibles en la vista principal",options:{relative_time:"Tiempo restante hasta la siguiente acción",time:"Tiempo configurado para la siguiente acción",days:"Días repetidos de la semana",additional_tasks:"Número de tareas adicionales"}},show_header_toggle:{heading:"Mostrar el interruptor del encabezado",description:"Muestra el interruptor en la parte alta de la tarjeta para habilitar/desabilitar todas las entidades Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Mostrar interruptores",description:"Mostrar el interruptor para cada programación individual en la tarjeta"},tags:{heading:"Etiquetas",description:"Use etiquetas para dividir los horarios entre múltiples tarjetas"},entities:{button_label:"Configurar entidades incluidas",heading:"Entidades incluidas",description:"Seleccione las entidades que desea controlar usando el planificador. Puede hacer click en un grupo para abrirlo. Note que algunas entidades (como los sensores) solo pueden ser usados para condiciones, no para acciones.",included_number:"{number}/{total} seleccionados"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},zt={services:jt,ui:Ot},Ct=Object.freeze({__proto__:null,services:jt,ui:Ot,default:zt}),Et={generic:{turn_on:"Lülita sisse",turn_off:"Lülita välja",parameter_to_value:"{parameter} {value} jaoks",action_with_parameter:"{action} väärtusega {parameter}"},climate:{set_temperature:"vali temperatuur [{temperature}]",set_temperature_hvac_mode_heat:"küte[ @ {temperature}]",set_temperature_hvac_mode_cool:"jahutus [ @ {temperature}]",set_temperature_hvac_mode_heat_cool:"küte/jahutus[ @ {temperature}]",set_temperature_hvac_mode_heat_cool_range:"küte/jahutus[ @ {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"automaatne[ @ {temperature}]",set_hvac_mode:"vali režiim [{hvac_mode}]",set_preset_mode:"eelseade[ {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"sulge",open_cover:"ava",set_cover_position:"sea asendisse[{position}]",set_cover_tilt_position:"sea ribide kalle [ asendisse {tilt_position}]"},fan:{set_percentage:"vali kiirus[ @ {speed}]",set_direction:"vali suund[ @ {direction}]",oscillate:"vali hajutus[ @ {oscillate}]"},humidifier:{set_humidity:"sea niiskus[ {humidity}]",set_mode:"vali režiim [{mode}]"},input_number:{set_value:"vali väärtus[ {value}]"},input_select:{select_option:"valik[ {option}]"},select:{select_option:"valik[ {option}]"},light:{turn_on:"lülita sisse[ heledusega {brightness}]"},media_player:{select_source:"vali sisend[ {source}]"},notify:{send_message:"send notification"},script:{execute:"käivita"},vacuum:{start_pause:"alusta/ootele"},water_heater:{set_operation_mode:"vali režiim [{operation_mode}]",set_away_mode:"kodust ära"}},At={components:{date:{day_types_short:{daily:"iga päev",workdays:"tööpäevadel",weekend:"nädalavahetusel"},day_types_long:{daily:"iga päev",workdays:"tööpäevadel",weekend:"nädalavahetusel"},days:"päeva",tomorrow:"homme",repeated_days:"iga {days} järel",repeated_days_except:"iga päev aga mitte {excludedDays}",days_range:"{startDay} kuni {endDay}",next_week_day:"järgmisel {weekday}"},time:{absolute:"{time}",interval:"{startTime} kuni {endTime}",at_midnight:"keskööl",at_noon:"keskpäeval",at_sun_event:"{sunEvent}"}},dialog:{enable_schedule:{title:"Viige muudatused lõpule",description:"Muudetud ajakava on praegu keelatud, kas see peaks olema lubatud?"},confirm_delete:{title:"Kas eemaldan olemi?",description:"Oled kindel, et soovid selle olemi eemaldada?"},confirm_migrate:{title:"Muutke ajakava",description:"Selle muudatusega lähevad mõned seaded kaotsi. Kas soovite jätkata?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Ajastaja",new_schedule:"Uus ajakava",default_name:"Ajakava #{id}"},overview:{no_entries:"Ajastused puuduvad",backend_error:"Ajastaja sidumine puudub. Sidumine tuleb luua enne selle kaardi kasutamist.",excluded_items:"välja on jäetud {number}  {if number is 1} ajastus {else} ajastust",hide_excluded:"peida välja jäetud ajastused",additional_tasks:"veel {number} {if number is 1} ajastus {else} ajastust",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Alustuseks vali ajavahemik",toggle_single_mode:"Üksikrežiimile",toggle_scheme_mode:"Skeemirežiimile",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"Periood",start_date:"From",end_date:"To"},repeat_type:"toiming peale käivitumist",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Dt={services:Et,ui:At},Tt=Object.freeze({__proto__:null,services:Et,ui:At,default:Dt}),Mt={generic:{turn_on:"Laita päälle",turn_off:"Sammuta",parameter_to_value:"{parameter} {value}",action_with_parameter:"{action} {parameter}"},climate:{set_temperature:"aseta lämpötilaksi[ {temperature}]",set_temperature_hvac_mode_heat:"lämmitä[ {temperature} asteeseen]",set_temperature_hvac_mode_cool:"jäähdytä[ {temperature} asteeseen]",set_temperature_hvac_mode_heat_cool:"lämmitä/jäähdytä[ {temperature} asteeseen]",set_temperature_hvac_mode_heat_cool_range:"lämmitä/jäähdytä[ välillä {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"automaatilla[ {temperature} asteeseen]",set_hvac_mode:"aseta tilaksi[ {hvac_mode}]",set_preset_mode:"aseta esivalinta[ {preset_mode}]",set_fan_mode:"aseta tuuletus[ {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"sulje",open_cover:"avaa",set_cover_position:"aseta sijainniksi[ {position}]",set_cover_tilt_position:"aseta kallistus[ {tilt_position}]"},fan:{set_percentage:"aseta nopeus[ {speed}]",set_direction:"asenta suunta[ {direction}]",oscillate:"aseta pyörimisnopeus[ {oscillate}]"},humidifier:{set_humidity:"aseta kosteus[ {humidity}]",set_mode:"aseta tilaksi {mode}"},input_number:{set_value:"aseta arvo {value}"},input_select:{select_option:"valitse[ {option}]"},select:{select_option:"valitse[ {option}]"},light:{turn_on:"kytke päälle[ {brightness} kirkkaudella]"},media_player:{select_source:"valitse lähteeksi[ {source}]"},notify:{send_message:"lähetä ilmoitus"},script:{execute:"suorita"},vacuum:{start_pause:"aloita / keskeytä"},water_heater:{set_operation_mode:"aseta tilaksi[ {operation_mode}]",set_away_mode:"aseta poissa-tila"}},Pt={components:{date:{day_types_short:{daily:"päivittäin",workdays:"työpäivisin",weekend:"viikonloppuisin"},day_types_long:{daily:"päivittäin",workdays:"työpäivisin",weekend:"viikonloppuisin"},days:"päivää",tomorrow:"huomenna",repeated_days:"joka {days}",repeated_days_except:"joka päivä paitsi {excludedDays}",days_range:"{startDay} {endDay}",next_week_day:"seuraava {weekday}"},time:{absolute:"{time}",interval:"{startTime} - {endTime}",at_midnight:"keskiyöllä",at_noon:"keskipäivällä",at_sun_event:"{sunEvent}"}},dialog:{enable_schedule:{title:"Suorita muutokset loppuun",description:"Muutettu aikataulu on tällä hetkellä poissa käytöstä, pitäisikö se ottaa käyttöön?"},confirm_delete:{title:"Poistetaanko kohde?",description:"Haluatko varmasti poistaa tämän kohteen?"},confirm_migrate:{title:"Muokkaa aikataulua",description:"Jotkut asetukset menetetään tämän muutoksen seurauksena. Haluatko edetä?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Ajastin",new_schedule:"Uusi aikataulu",default_name:"Aikataulu #{id}"},overview:{no_entries:"Ei näytettäviä kohteita",backend_error:"Ei voitu yhdistää scheduler komponenttiin. Kortin käyttäminen vaatii scheduler integraation asentamisen.",excluded_items:"{number} {if number is 1} poissuljettu kohde {else} poissuljettua kohdetta",hide_excluded:"piilota poissuljetut kohteet",additional_tasks:"{number} {if number is 1} tehtävä {else} tehtävää",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Valitse aikaikkuna ensin",toggle_single_mode:"To single mode",toggle_scheme_mode:"To scheme mode",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"Ajanjakso",start_date:"From",end_date:"To"},repeat_type:"toiminta tapahtuman jälkeen",tags:"Tags"},card_editor:{tabs:{entities:"Kohteet",other:"Muu"},fields:{title:{heading:"Kortin otsikko",options:{standard:"normaali",hidden:"piilotettu",custom:"muokattu"},custom_title:"Muokattu otsikko"},discover_existing:{heading:"Näytä kaikki ajoitukset",description:"Tämä kytkee käyttöön 'näytä olemassa olevat -attribuutin'. Aiemmin luodut ajastukset lisätään automaattisesti korttiin. "},time_step:{heading:"Ajastusvälit",description:"Ajastusväli minuutteina ajastusten luontiin",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Yksittäistilaan",scheme:"Kaaviotilaan"}},sort_by:{heading:"Lajitteluasetukset",description:"Järjestys miten ajastukset näkyvät kortissa",options:{relative_time:"Aikaa jäljellä seuraavaan toimintoon",title:"Ajastuksen otsikko",state:"Aktiiviset ajastukset ylhäällä"}},display_format_primary:{heading:"Ensisijainen tieto",description:"Valitse mitä näytetään yhteenvedossa",options:{default:"Ajastuksen nimi",entity_action:"Ajastuksen yhteenveto"}},display_format_secondary:{heading:"Toissijainen tieto",description:"Valitse mitkä lisätiedot näkyvät yhteenvedossa",options:{relative_time:"Aikaa jäljellä seuraavaan toimintoon",time:"Seuraavalle toiminnolle määritetty aika",days:"Toistuvat viikonpäivät",additional_tasks:"Lisätoimintojen määrä"}},show_header_toggle:{heading:"Näytä otsikkokytkin",description:"Näytä kytkin kortin yläreunassa usean ajastuksen päälle/pois kytkemiseen"},show_toggle_switches:{heading:"Näytä kytkimet",description:"Näytä kytkin jokaiselle yksittäiselle ajastukselle kortissa"},tags:{heading:"Tunniste",description:"Käytä tunnisteita ajastusten jakamiseen korttien välillä"},entities:{button_label:"Sisällytettyjen entiteettien määrittäminen",heading:"Ajastettavat kohteet",description:"Valitse kohteet, joille haluat luoda ajastuksia. Voit klikata ryhmään laajentaaksesi sen. Huom: joitain kohteita voi käyttää vain ehtoina (esim. sensorit), ei toimintoihin",included_number:"{number} / {total} valittu"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Lt={services:Mt,ui:Pt},Nt=Object.freeze({__proto__:null,services:Mt,ui:Pt,default:Lt}),It={generic:{turn_on:"Allumer",turn_off:"Éteindre",parameter_to_value:"{parameter} vers {value}",action_with_parameter:"{action} avec {parameter}"},climate:{set_temperature:"ajuster la température[ à {temperature}]",set_temperature_hvac_mode_heat:"chauffe[ à {temperature}]",set_temperature_hvac_mode_cool:"refroidit[ à {temperature}]",set_temperature_hvac_mode_heat_cool:"chauffe/refroidit[ à {temperature}]",set_temperature_hvac_mode_heat_cool_range:"chauffe/refroidit[ à {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ à {temperature}]",set_hvac_mode:"ajuster le mode[ à {hvac_mode}]",set_preset_mode:"choisir le pré-réglage[ {preset_mode}]",set_fan_mode:"ajuster le mode de ventilation[ à {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"fermer",open_cover:"ouvrir",set_cover_position:"ajuster la position[ à {position}]",set_cover_tilt_position:"régler les volets[ à {tilt_position}]"},fan:{set_percentage:"ajuster la vitesse[ à {speed}]",set_direction:"ajuster l'orientation[ vers {direction}]",oscillate:"ajuster l'oscillation[ à {oscillate}]"},humidifier:{set_humidity:"ajuster l'humidité[ à {humidity}]",set_mode:"ajuster le mode[ à {mode}]"},input_number:{set_value:"ajuster la valeur[ à {value}]"},input_select:{select_option:"choisir l'option[ {option}]"},select:{select_option:"choisir l'option[ {option}]"},light:{turn_on:"allumer[ avec une luminosité de {brightness}]"},media_player:{select_source:"choisir la source[ {source}]"},notify:{send_message:"envoyer une notification"},script:{execute:"exécuter"},vacuum:{start_pause:"démarrer / pause"},water_heater:{set_operation_mode:"ajuster le mode[ à {operation_mode}]",set_away_mode:"choisir le mode absent"}},Rt={components:{date:{day_types_short:{daily:"quotidien",workdays:"jours de travail",weekend:"weekend"},day_types_long:{daily:"chaque jour",workdays:"en semaine",weekend:"le weekend"},days:"jours",tomorrow:"demain",repeated_days:"chaque {days}",repeated_days_except:"chaque jour sauf {excludedDays}",days_range:"de {startDay} à {endDay}",next_week_day:"{weekday} prochain"},time:{absolute:"à {time}",interval:"de {startTime} à {endTime}",at_midnight:"à minuit",at_noon:"à midi",at_sun_event:"au {sunEvent}"}},dialog:{enable_schedule:{title:"Compléter les modifications",description:"Le planning qui a été modifié est actuellement désactivé, doit-il être activé ?"},confirm_delete:{title:"Supprimer l'entité ?",description:"Voulez-vous vraiment supprimer cette entité ?"},confirm_migrate:{title:"Modifier l'horaire",description:"Certains paramètres seront perdus par ce changement. Voulez-vous poursuivre?"},weekday_picker:{title:"Jours de répétition",choose:"Choisir les jours..."},entity_picker:{title:"Choisir les entités",choose:"Choisir...",no_results:"Aucune entité trouvée"},action_picker:{title:"Choisir une action",show_all:"Afficher toutes les entités prises en charge"}},panel:{common:{title:"Planificateur",new_schedule:"Nouvel horaire",default_name:"Horaire #{id}"},overview:{no_entries:"il n'y a pas d'entrée à montrer",backend_error:"Impossible de se connecter au composant du planificateur. Il doit être installé en tant qu'intégration avant que cette carte ne puisse être utilisée.",excluded_items:"{number} {if number is 1}entrée exclue{else}entrées exclues",hide_excluded:"cacher les entrées exclues",additional_tasks:"{number} {if number is 1}tâche à venir{else}tâches à venir",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Jours de répétition",start_time:"Heure de début",stop_time:"Heure de fin",action:"Action",add_action:"Ajouter une action",select_timeslot:"Choisir d'abord une plage horaire",toggle_single_mode:"Vers mode simple",toggle_scheme_mode:"Vers mode schéma",validation_errors:{overlapping_time:"Certaines plages horaires se chevauchent",missing_target_entity:"Certaines actions n'ont pas d'entité sélectionnée",missing_service_parameter:"Certaines actions ne sont pas totalement configurées",missing_action:"Le planning n'a aucune action définie"}},options:{conditions:{header:"Conditions",add_condition:"Ajouter une condition",new_condition:"Nouvelle condition",types:{equal_to:"{entity} est égal à {value}",unequal_to:"{entity} n'est pas égal à {value}",above:"{entity} est supérieur à {value}",below:"{entity} est inférieur à {value}"},options:{logic_and:"Toutes les conditions doivent être valides",logic_or:"Au moins une condition doit être valide",track_changes:"Ré-évaluer lorsque la condition change"}},period:{header:"Période",start_date:"Du",end_date:"Au"},repeat_type:"Comportement après l'achèvement",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Ht={services:It,ui:Rt},qt=Object.freeze({__proto__:null,services:It,ui:Rt,default:Ht}),Vt={generic:{turn_on:"הפעלה",turn_off:"כיבוי",parameter_to_value:"{parameter} ל {value}",action_with_parameter:"{action} עם {parameter}"},climate:{set_temperature:"קבע טמפרטורה[ ל {temperature}]",set_temperature_hvac_mode_heat:"חימום[ ל {temperature}]",set_temperature_hvac_mode_cool:"קירור[ ל {temperature}]",set_temperature_hvac_mode_heat_cool:"חימום/קירור[ ל {temperature}]",set_temperature_hvac_mode_heat_cool_range:"חימום/קירור[ ל {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"אוטומטי[ ל {temperature}]",set_hvac_mode:"קבע מצב עבודה[ ל {hvac_mode}]",set_preset_mode:"קבע הגדרה[ ל {preset_mode}]",set_fan_mode:"הגדר מצב מאוורר[ ל {fan_mode}]",set_swing_mode:"הגדר מצב תנודת תריס[ ל {swing_mode}]"},cover:{close_cover:"סגירה",open_cover:"פתיחה",set_cover_position:"קבע מיקום[ ל {position}]",set_cover_tilt_position:"קבע הטיה[ ל {tilt_position}]"},fan:{set_percentage:"קבע מהירות[ ל {speed}]",set_direction:"קבע כיוון[ ל {direction}]",oscillate:"קבע תנודת תריס[ ל {oscillate}]"},humidifier:{set_humidity:"קבע לחות[ ל {humidity}]",set_mode:"קבע מצב עבודה[ ל {mode}]"},input_number:{set_value:"קבע ערך[ ל {value}]"},input_select:{select_option:"בחר אפשרות[ {option}]"},select:{select_option:"בחר אפשרות[ {option}]"},light:{turn_on:"הדלקה[ בעוצמה של {brightness}]"},media_player:{select_source:"בחר מקור[ {source}]"},notify:{send_message:"שלח התראה"},script:{execute:"בצע"},vacuum:{start_pause:"התחל / הפסק"},water_heater:{set_operation_mode:"קבע מצב עבודה[ ל {operation_mode}]",set_away_mode:"קבע מצב מוץ לבית"}},Ft={components:{date:{day_types_short:{daily:"כל יום",workdays:"ימי חול",weekend:"סוף שבוע"},day_types_long:{daily:"כל יום",workdays:"בימי חול",weekend:"בסוף השבוע"},days:"ימים",tomorrow:"מחר",repeated_days:"בכל {days}",repeated_days_except:"בכל יום פרט ל  {excludedDays}",days_range:"מ- {startDay} ועד- {endDay}",next_week_day:"הבא {weekday}"},time:{absolute:"בשעה {time}",interval:"משעה {startTime} עד שעה {endTime}",at_midnight:"בחצות הלילה",at_noon:"בחצות היום",at_sun_event:"ב {sunEvent}",on_day_of:"בשעה {time} ביום של {anchor}"}},dialog:{enable_schedule:{title:"השלם את השינויים",description:"לוח הזמנים ששונה מושבת כעת, האם צריך להפעיל אותו?"},confirm_delete:{title:"להסיר את הישות?",description:"האם בוודאות ברצונך להסיר ישות זו?"},confirm_migrate:{title:"שנה את לוח הזמנים",description:"חלק מההגדרות יאבדו על ידי פעולה זו. האם אתה רוצה להמשיך?"},weekday_picker:{title:"ימים לחזרה עבור לוח זמנים",choose:"בחר..."},entity_picker:{title:"בחר ישויות",choose:"בחר...",no_results:"לא נמצאו פריטים תואמים"},action_picker:{title:"בחר פעולה",show_all:"הצג את כל הישויות הנתמכות"}},panel:{common:{title:"לוח זמנים",new_schedule:"לוח זמנים חדש",default_name:"לוח זמנים #{id}"},overview:{no_entries:"אין פריטים להצגה",backend_error:"אין אפשרות להתחבר לרכיב התזמונים. נדרש להתקין את הרכיב באינטגרציה לפני השימוש בכרטיס.",excluded_items:"{number} לא נכלל {if number is 1} פריט {else} פריטים",hide_excluded:"הסתר פריטים לא כלולים",additional_tasks:"{number} נוסף {if number is 1} משימה {else} משימות",overview_view:"הצג סקירת ציר זמן",list_view:"הצג תצוגת רשימה",tap_icon_to_toggle:"הקש להפעלה/כיבוי",saved:"נשמר",undo:"איפוס",add_schedule:"הוסף תזמון",turn_on:"הפעלה",turn_off:"כיבוי",brightness:"בהירות",color_temp:"טמפרטורת צבע",color:"צבע",reset_hint:"בטל את כל השינויים שבוצעו מאז פתיחת הכרטיס",today:"היום",two_days:"יומיים",duplicate:"שכפל תזמון"},editor:{repeated_days:"ימים לחזרה",start_time:"זמן התחלה",stop_time:"זמן סיום",action:"פעולה",add_action:"הוספת פעולה",select_timeslot:"בחר משבצת זמן קודם",toggle_single_mode:"למצב פשוט",toggle_scheme_mode:"למצב דיאגרמה",validation_errors:{overlapping_time:"לוח הזמנים כולל משבצות זמן חופפות",missing_target_entity:"אחת או יותר מהפעולות חסרות ישות יעד",missing_service_parameter:"אחת או יותר מהפעולות חסרות הגדרה נדרשת",missing_action:"לוח הזמנים אינו כולל פעולות"}},options:{conditions:{header:"תנאים",add_condition:"הוספת תנאי",new_condition:"תנאי חדש",types:{equal_to:"{entity} שווה ל-{value}",unequal_to:"{entity} לא שווה ל-{value}",above:"{entity} מעל {value}",below:"{entity} מתחת {value}"},options:{logic_and:"כל התנאים חייבים להיות נכונים",logic_or:"כל תנאי חייב להיות נכון",track_changes:"הערכה מחדש כאשר התנאים משתנים"}},period:{header:"פרק זמן",start_date:"מ",end_date:"ל"},repeat_type:"התנהגות לאחר הפעלה",tags:"תגים"},card_editor:{tabs:{entities:"ישויות",other:"אחר"},fields:{title:{heading:"כותרת הכרטיס",options:{standard:"רגילה",hidden:"מוסתרת",custom:"מותאמת אישית"},custom_title:"כותרת מותאמת אישית"},discover_existing:{heading:"הצג את כל לוחות הזמנים",description:"הגדרה זו קובעת את הפרמטר 'discover existing'. לוחות זמנים שנוצרו בעבר יתווספו אוטומטית לכרטיס"},time_step:{heading:"מרווח זמן",description:"רזולוציה (בדקות) ליצירת לוחות זמנים",unit_minutes:"דק'"},default_editor:{heading:"עורך זמן ברירת מחדל",options:{single:"מצב לוח זמנים בודד",scheme:"מצב תבנית זמנים"}},sort_by:{heading:"אפשרויות מיון",description:"סדר הופעת לוחות הזמנים בכרטיס",options:{relative_time:"זמן שנותר עד הפעולה הבאה",title:"כותרת לוח הזמנים המוצגת",state:"הצג לוחות זמנים פעילים בראש"}},display_format_primary:{heading:"מידע ראשי מוצג",description:"הגדר איזו תווית תשמש עבור לוחות הזמנים בסקירה הכללית",options:{default:"שם לוח הזמנים",entity_action:"סיכום המשימה"}},display_format_secondary:{heading:"מידע משני מוצג",description:"הגדר אילו מאפיינים נוספים יהיו גלויים בסקירה הכללית",options:{relative_time:"זמן שנותר עד הפעולה הבאה",time:"זמן מוגדר לפעולה הבאה",days:"ימים חוזרים בשבוע",additional_tasks:"מספר משימות נוספות"}},show_header_toggle:{heading:"הצג מתג בכותרת",description:"הצג מתג הפעלה/כיבוי בראש הכרטיס להפעלה/השבתה של כל הישויות"},show_toggle_switches:{heading:"הצג מתגים",description:"הצג מתג עבור כל לוח זמנים בודד בכרטיס"},tags:{heading:"תגיות",description:"השתמש בתגיות כדי לחלק לוחות זמנים בין כרטיסים שונים"},entities:{button_label:"הגדר ישויות כלולות",heading:"ישויות כלולות",description:"בחר את הישויות שברצונך לשלוט בהן באמצעות המתזמן. ניתן ללחוץ על קבוצה כדי לפתוח אותה. שים לב שחלק מהישויות (כמו חיישנים) יכולות לשמש רק לתנאים, ולא לפעולות.",included_number:"{number}/{total} נבחרו"},default_view:{heading:"תצוגת ברירת מחדל",options:{overview:"סקירת ציר זמן",list:"רשימה"}},show_view_toggle:{heading:"הצג מחליף תצוגה"},show_clock:{heading:"הצג שעון בכותרת"},overview_editing:{heading:"עריכה מתוך ציר הזמן"},show_quick_add:{heading:"שורת הוספה מהירה"}}},plan:{title:"תוכנית שבת",open:"תוכנית שבת",anchor:{opens:"הדלקת נרות",closes:"צאת שבת",fixed:"אותה שעה בכל יום (בלי קשר לשבת)"},boundary:{exact:"בזמן עצמו",offset:"לפני / אחרי",clock:"בשעה מסוימת באותו יום",before:"לפני",after:"אחרי",from:"מתחיל ב",to:"נגמר ב",starts_after:"מתחילה במקום שבו ״{name}״ נגמרת.",starts_open:"מתחילה עם כניסת השבת.",pushes:"הזזה כאן מזיזה גם את ההתחלה של ״{name}״: הקוביות נפגשות, בלי חפיפה ובלי חור ביניהן."},cube:{welcome:"קבלת שבת",night:"לילה",morning:"בוקר",afternoon:"צהריים",close:"מוצ״ש",unnamed:"ללא שם",split:"פיצול"},group:{default:"קבוצת שבת",new:"קבוצה {n}",add:"הוספת קבוצה",remove:"מחיקת הקבוצה",members:"{n} מכשירים",devices:"מכשירים בקבוצה"},detach:{name:"חריג",action:"ניתוק",row:"מנותק מהקבוצה",rejoin:"החזרה לקבוצה",note:"{device} פועל כאן לפי זמנים משלו. הקבוצה לא נוגעת בו עד שהניתוק נגמר, ואז מחזירה אותו אליה.",once:"חד-פעמי, בתאריך",hint:"לחיצה על מכשיר נותנת לו זמנים משלו כאן.",once_hint:"להשאיר ריק כדי שיחזור כל שבוע."},state:{label:"מצב",on:"דלוק",off:"כבוי"},error:{no_entities:"ל״{group}״ עדיין אין מכשירים.",no_anchor:"התוכנית צריכה לקבל את הזמנים שלה מישות.",no_anchor_hint:"יש להפעיל את אינטגרציית Jewish Calendar כך ש-{start} ו-{end} יפרסמו זמן. זמן הלכתי אינו היסט קבוע מהשקיעה, ולכן צריך לקרוא אותו בזמן ההפעלה ולא לנחש אותו."},color:{label:"צבע",auto:"אוטומטי — לפי הפעולה"},help:{open:"מה זה?",band:"הפס הוא שבת אחת, מהדלקת נרות ועד צאת שבת. הוא לא שעון: הוא מתחיל בערב שישי ונגמר בלילה שאחריו, ולכן אותו פס מכסה גם יום טוב שנמשך יומיים או שלושה.",rows:"כל שורה היא קבוצת מכשירים שזזים יחד. חיתוך קובייה בשורה אחת משנה רק אותה — הזמנים של האחרים לא זזים.",detach:"מכשיר שצריך זמנים אחרים לזמן מה מתנתק: הוא מקבל שורה משלו, וכל עוד היא פועלת הקבוצה לא נוגעת בו. כשהיא נגמרת הקבוצה מחזירה אותו אליה, בלי שתצטרך לעשות משהו.",keys:"לחיצה על קובייה פותחת אותה לעריכה. גרירת הקו שבין שתי קוביות מזיזה את הגבול. + מפצל קובייה לשתיים, ומקש Delete מוחק את הנבחרת.",cube:"קובייה היא קטע בפס: התחלה, סוף, ורשימת מכשירים. מה שכתוב בה קורה ברגע שהיא מתחילה ונשאר כך עד שהקובייה הבאה משתלטת. פיצול עושה מאחת שתיים, וגרירת הקו שבין שתי קוביות מזיזה את המפגש ביניהן.",devices:"לכל מכשיר בקבוצה יש שורה משלו, ולכן קובייה אחת יכולה להפעיל את המזגן בסלון ולהשאיר את החדרים כבויים. שלוש אפשרויות לכל מכשיר: דלוק, כבוי, או לא בקובייה בכלל. השלישית היא אפשרות אמיתית, לא גוון של כבוי — הקובייה לא נוגעת במכשיר בכלל: הוא נשאר במה שהיה, לא נשמר על מצב, לא מנסים שוב אם קריאה נכשלה, וכל תזמון אחר חופשי להפעיל אותו.",group:"קבוצה היא אוסף מכשירים שזזים יחד: הם חולקים שורה אחת של קוביות. מכשיר שמתווסף כאן מופיע בכל קוביות השורה, ועדיין אפשר להוציא אותו מכל אחת מהן, או לתת לו זמנים משלו עם ״ניתוק״.",book:"ספר המכשירים הוא המקום שבו נותנים שמות פעם אחת ומקבצים פעם אחת. השמות נשמרים ככינויים של Home Assistant והקבוצות כתויות, ולכן שניהם עובדים בכל מקום ב-Home Assistant ולא רק כאן. הסוג הוא הדבר היחיד ששייך לתזמון: תקן אותו כשמכשיר רשום תחת הסוג הלא נכון — מזגן שמחובר מאחורי מפסק רגיל — כדי שהעורך יציע לו מעלות ולא עוצמת תאורה.",book_groups:"לחיצה אחת מוסיפה את כל מכשירי הקבוצה. הקבוצות מגיעות מספר המכשירים, וזו הדרך המהירה: שם לחדרים פעם אחת, ומעכשיו בוחרים אותם לפי השם.",book_devices:"המכשירים שהספר מכיר, בשמות שנתת להם. לחיצה מוסיפה או מוציאה. אם משהו חסר, פשוט עדיין לא נתת לו שם — פתח את ספר המכשירים מההגדרות, או בחר את הישות ידנית.",report:"התוכנית נקראת בחזרה כמה שבאמת יקרה, לפי הסדר, עם כל מכשיר בשמו. הזמנים מחושבים מהדלקת הנרות ומצאת השבת של השבוע, ולכן זה הדבר האמיתי ולא סקיצה. כדאי לקרוא לפני שמירה; זה נפתח שוב מיד אחריה.",colours:"״ברור״ צובע קובייה לפי מה שהיא עושה: ירוק לדלוק, אפור לכבוי, ופסים כשהמכשירים שבתוכה לא מסכימים. ״לפי הפעולה״ צובע אותה בצבע שהנורה תראה בפועל, מה שיפה יותר וקשה הרבה יותר לקריאה במבט אחד.",times:"הזמנים שהבית הזה שומר. תוכנית חדשה מתחילה מהם, ולכן קובעים אותם פעם אחת כאן במקום להקליד אותם בכל אשף. שינוי כאן לא נוגע בתוכנית שכבר נבנתה.",opening:"התוכנית משתלטת בהדלקת הנרות. מה שתבחר כאן הוא מה שהבית עושה ברגע הזה, וזה מחזיק עד הזמן הראשון שתוסיף.",hold:"כששמירת המצב דלוקה, מכשיר שמישהו הזיז במהלך התוכנית מוחזר למקומו — מפסק שנלחץ מתוך הרגל, או אוטומציה שלא יודעת שעכשיו שבת. היא מחכה 30 שניות בין ניסיונות, כך שהיא לעולם לא תילחם במי שהזיז אותו. כשהיא כבויה, התוכנית קובעת את המצב בכל גבול ומשאירה אותו לנפשו.",step_intro:"שום דבר לא נשמר כל עוד אתה כאן. בסוף תקבל תוכנית רגילה בעורך, ועדיין תצטרך ללחוץ שמירה.",step_devices:"בחר קודם כל מהספר — אלו השמות שלך לדברים שלך. בחירת ישות ידנית שמורה למשהו שהספר עדיין לא מכיר.",step_opening:"בחירה אחת להכל, כדי לשמור על פשטות. המכשירים מתחילים להישתנות זה מזה עוד שני שלבים.",step_moments:"כל זמן אומר רק מתי הוא נגמר; הבא מתחיל בדיוק שם, ולכן חור או חפיפה אינם אפשריים. שלוש דרכים לומר מתי: שעה על השעון, מרחק מהשקיעה, או מרחק מצאת השבת. שתי האחרונות זזות עם השנה והשעה לא, ועל זה ההערות למטה.",step_settings:"כאן תוכנית מפסיקה להיות ״הכל דלוק״. קבע את הזמן כולו למעלה, ואז שנה רק את המכשירים שצריכים להיות שונים — כולל כאלו שהזמן הזה לא אמור לגעת בהם בכלל.",step_hold:"בחירה אחת לכל התוכנית. כל קובייה בנפרד ניתנת לשינוי בעורך אחר כך.",step_review:"עבור על זה מלמעלה למטה. כל דבר כאן ניתן לעריכה אחר כך, ושום דבר לא נשמר עד שתלחץ שמירה בעורך."},wizard:{open:"אשף",offer:"פעם ראשונה? כמה שאלות ותהיה לך תוכנית עובדת, ותמיד אפשר לערוך אותה אחר כך.",offer_yes:"בוא נעבור על זה",offer_no:"אני אסתדר לבד",back:"חזרה",next:"הבא",finish:"בניית התוכנית",yes:"כן",no:"לא",intro:{title:"בוא נגדיר את השבת שלך",body:"כמה שאלות ותהיה לך תוכנית עובדת. שום דבר לא נשמר עד שתלחץ שמירה בסוף, והכל ניתן לשינוי אחר כך בעורך."},devices:{title:"אילו מכשירים?",body:"בחר את התאורות והמפסקים שיפעלו לפי התוכנית, ישירות מתוך ספר המכשירים שלך. אפשר להוסיף עוד אחר כך, ואפשר לתת לכל אחד מהם זמנים משלו בהמשך.",groups:"קבוצות מהספר שלך",book:"מכשירים מהספר שלך",no_book:"הספר עדיין ריק. פתח הגדרות ← ספר מכשירים כדי לתת שמות למה שיש לך, או בחר ישות ידנית למטה.",advanced:"בחירת ישות ידנית",simple:"חזרה לספר",advanced_hint:"כל ישות ש-Home Assistant מכיר, לפי המזהה הגולמי שלה. כל מה שנבחר כאן כדאי לתת לו שם בספר אחר כך.",chosen:"נבחרו {n}.",none:"עדיין לא נבחר כלום — צריך לפחות אחד כדי להמשיך."},moments:{title:"בנה את השבת שלך",body:"הוסף את הזמנים שהיום שלך מורכב מהם — סעודה, שינה, בוקר, צהריים, מנוחה. אתה קובע רק מתי כל אחד נגמר; הבא אחריו מתחיל בדיוק שם, ולכן אי אפשר להשאיר חור או חפיפה. מה שהמכשירים עושים זה השלב שאחרי זה.",add:"הוספת זמן",name:"שם הזמן",empty:"עוד אין זמנים — המכשירים פשוט יישארו במצב הפתיחה עד צאת שבת."},when:{clock:"לפי שעה",sunset:"יחסית לשקיעה",end:"יחסית לצאת שבת",hint:"איך הזמן הזה אומר מתי הוא נגמר. שעה קבועה לא זזה כל השנה; שתי האחרות זזות עם השמש."},preset:{meal_eve:"סעודת ליל שבת",sleep:"שינה",morning:"בוקר",meal_day:"סעודת שבת",nap:"שנת צהריים",close:"מוצאי שבת"},review:{title:"זו השבת שלך",body:"כדאי לעבור על זה. כל דבר כאן ניתן לשינוי בעורך גם אחר כך.",outside:"{names} נופל מחוץ לפס ולכן הושמט. זמן של ליל שבת צריך להיות אחרי הדלקת נרות, וזמן של יום שבת לפני צאת שבת."},settings:{title:"מה כל מכשיר עושה",body:"זמן אחרי זמן. קובעים את הזמן כולו בדלוק/כבוי שמעליו, ואז משנים כל מכשיר שצריך להיות שונה — המזגן בסלון בזמן הסעודה בזמן שבחדרים כבוי, תאורה אחת חזקה ואחרת עמומה."},step_of:"שלב {n} מתוך {total}",blocked:"משהו למעלה צריך להשתנות לפני שממשיכים.",opening:{title:"מה קורה בהדלקת נרות?",body:"התוכנית משתלטת ברגע שנכנסת השבת, ומחזיקה עד הזמן הראשון שתוסיף בשלב הבא. בחר מה הבית עושה אז; מכשירים בודדים אפשר לקבוע אחרת עוד שני שלבים.",label:"בהדלקת נרות",at:"זה {time} השבוע."},hold:{title:"לשמור על המצב?",body:"בתוכנית שבת בדרך כלל כן. אם מישהו לוחץ על מפסק מתוך הרגל, או אוטומציה אחרת הזיזה מכשיר בלי לדעת שעכשיו שבת, שמירת המצב מחזירה אותו במקום להשאיר אותו שגוי עד הבוקר."},caution:{outside:"זה נופל ב-{time}, מחוץ לשבת — הקובייה לא תפעל בכלל.",tight:"{time} קרוב לקצה הפס. בשבת אחרת זה עלול לנפול מחוצה לו.",hard:"{time} היא שעה קשיחה: היא לא זזה עם השמש, ולכן היא עלולה ליפול אחרת בשבת אחרת.",unknown:"עדיין אי אפשר לחשב את הזמן הזה.",estimate:"זה יוצא בערך {time}. השקיעה המדויקת נקראת ביום עצמו, ולכן זה יכול לנחות כמה דקות לכאן או לכאן."},problem:{no_time:"לזמן ״{name}״ עדיין אין שעה.",outside:"״{name}״ נופל ב-{time}, מחוץ לשבת הזו. העבר אותו לתוך הפס, או מדוד אותו מהשקיעה או מצאת שבת במקום לפי שעה.",collide:"{names} נופלים באותה דקה. שני זמנים באותה שעה לא משאירים כלום ביניהם — הזז אחד מהם.",hard:"{names} משתמשים בשעה קשיחה. בשבת הזו זה עובד, אבל הדלקת הנרות וצאת השבת זזות ביותר משעה במהלך השנה, ולכן בשבת אחרת אותה שעה עלולה לנפול מחוץ לפס. שום דבר לא נשבר כשזה קורה: הקובייה פשוט לא תפעל, וזו שלפניה תמשיך — אותם מכשירים באותו מצב — עד הגבול הבא שכן נופל בפנים. מדידה מהשקיעה או מצאת שבת מונעת את זה לגמרי.",tight:"״{name}״ רחוק רק {hours} שעות מקצה הפס. השבת זה עובד, אבל זה הראשון שיצא מהפס בשבת שנכנסת מאוחר יותר.",unknown:"עדיין אי אפשר למקם את ״{name}״ — מה שאמור לפרסם את הזמן שלו עוד לא אמר כלום. הגבול עצמו תקין; הוא יחושב כשהתוכנית תרוץ."}},override:{label:"מכשירים בקובייה הזו",hint:"כל מכשיר יכול לעשות כאן משהו משלו, עם הפרמטרים שלו — המזגן בסלון על 16° בזמן שבחדרים כבוי. מכשיר בלי הגדרה משלו פשוט עוקב אחרי הקובייה.",flip:"שיהיה שונה כאן",back:"שיעקוב אחרי הקובייה",follows:"עוקב אחרי הקובייה"},light:{brightness:"בהירות",warmth:"גוון",set:"קבע",clear:"אל תיגע",warm:"חמים",neutral:"ניטרלי",cool:"אור יום"},enforce:{label:"שמירה על המצב",beta:"ניסיוני",on:"שמור",off:"אל תשמור",hint:"אם מפסק בקיר או אינטגרציה אחרת משנים מכשיר במהלך הקובייה — להחזיר אותו למצב שהוגדר. ממתין 30 שניות בין ניסיונות כדי לא להיכנס להתגוששות עם מי שהזיז אותו."},history:{undo:"ביטול",redo:"ביצוע מחדש"},keys:{open:"קיצורי מקלדת",select:"קובייה קודמת / הבאה",row:"שורה קודמת / הבאה",move_start:"הזזת ההתחלה ב-5 דקות",move_stop:"הזזת הסיום ב-5 דקות",state:"דלוק / כבוי",colour:"צבע, 0 לאוטומטי",rename:"שינוי שם"},report:{open:"מה יקרה",title:"מה יקרה",own:"משלו",taken:"עד ״{name}״",saved:"נשמר. זה מה שיקרה."},climate:{degrees:"טמפרטורה"},book:{open:"ספר מכשירים",title:"ספר מכשירים",hint:"השמות והקבוצות שלך — נשמרים ב-Home Assistant, כך שהם עובדים גם מחוץ לתזמונים.",new_group:"שם לקבוצה חדשה…",from_selection:"מהמכשירים שבקבוצה הזו",use:"הוספה לקבוצה",name_it:"לקרוא לזה…",kind:{light:"תאורה",switch:"מפסק",climate:"מזגן / מחמם",cover:"תריס",fan:"מאוורר",media_player:"נגן מדיה",other:"משהו אחר"}},device:{all:"כל המכשירים",all_hint:"קיצור דרך: קובע את כל מכשירי הקבוצה בקובייה הזו. אפשר עדיין לשנות כל אחד בנפרד למטה.",untouched:"לא בקובייה",untouched_hint:"הקובייה לא נוגעת במכשיר: הוא נשאר במה שהיה, לא נשמר על מצב, לא מנסים שוב, וכל תזמון אחר יכול להשפיע עליו."},settings:{open:"הגדרות",title:"הגדרות",hint:"העדפות, וספר המכשירים.",colours:"צבעים",colours_plain:"דלוק / כבוי ברור",colours_action:"לפי הפעולה",colours_hint:"״ברור״ הופך דלוק וכבוי לחד-משמעיים במבט. ״לפי הפעולה״ צובע את הקובייה בצבע שהנורה תראה בפועל.",times:"זמנים כברירת מחדל",times_hint:"מה שהאשף מציע כשמוסיפים אחד מהזמנים האלה. תוכניות שכבר נבנו שומרות על הזמנים שאיתם נבנו.",times_reset:"חזרה לזמנים המוצעים"}}}},Bt={services:Vt,ui:Ft},Wt=Object.freeze({__proto__:null,services:Vt,ui:Ft,default:Bt}),Ut={generic:{turn_on:"Bekapcsolás",turn_off:"Kikapcsolás",parameter_to_value:"{parameter} to {value}",action_with_parameter:"{action} with {parameter}"},climate:{set_temperature:"hőmérséklet[ to {temperature}]",set_temperature_hvac_mode_heat:"melegíteni[ to {temperature}]",set_temperature_hvac_mode_cool:"hűtés[ to {temperature}]",set_temperature_hvac_mode_heat_cool:"melegíteni/hűtés[ to {temperature}]",set_temperature_hvac_mode_heat_cool_range:"melegíteni/hűtés[ to {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"automatikus[ to {temperature}]",set_hvac_mode:"mód beállítása[ to {hvac_mode}]",set_preset_mode:"preset beállítása[ {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"zárás",open_cover:"nyitás",set_cover_position:"változtass pozíciót[ to {position}]",set_cover_tilt_position:"set tilt position[ to {tilt_position}]"},fan:{set_percentage:"set speed[ to {speed}]",set_direction:"set direction[ to {direction}]",oscillate:"set oscillation[ to {oscillate}]"},humidifier:{set_humidity:"set humidity[ to {humidity}]",set_mode:"mód beállítása[ to {mode}]"},input_number:{set_value:"érték beállítása[ to {value}]"},input_select:{select_option:"opció kiválasztása[ {option}]"},select:{select_option:"opció kiválasztása[ {option}]"},light:{turn_on:"bekapcsolás[ with {brightness} brightness]"},media_player:{select_source:"forrás kiválasztása[ {source}]"},notify:{send_message:"send notification"},script:{execute:"kezdés"},vacuum:{start_pause:"start / pause"},water_heater:{set_operation_mode:"mód beállítása[ to {operation_mode}]",set_away_mode:"set away mode"}},Zt={components:{date:{day_types_short:{daily:"minden nap",workdays:"munkanapokon",weekend:"hétvégén"},day_types_long:{daily:"minden nap",workdays:"munkanapokon",weekend:"hétvégén"},days:"Napokon",tomorrow:"tomorrow",repeated_days:"every {days}",repeated_days_except:"every day except {excludedDays}",days_range:"from {startDay} to {endDay}",next_week_day:"következő {weekday}"},time:{absolute:"{time}-kor",interval:"{startTime} - {endTime}",at_midnight:"éjfélkor",at_noon:"délben",at_sun_event:"{sunEvent}kor"}},dialog:{enable_schedule:{title:"Végezze el a módosításokat",description:"A módosított ütemezés jelenleg le van tiltva, engedélyezni kell?"},confirm_delete:{title:"Biztos benne, hogy eltávolítja az entitást?",description:"Biztos benne, hogy el szeretné távolítani ezt az entitást?"},confirm_migrate:{title:"Ütemezés módosítása",description:"Ezzel a művelettel bizonyos beállítások elvesznek. Akarod folytatni?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Időzítések",new_schedule:"Új ütemezés",default_name:"Ütemterv #{id}"},overview:{no_entries:"Nincs megjeleníthető elem",backend_error:"Could not connect with the scheduler component. It needs to be installed as integration before this card can be used.",excluded_items:"{number} excluded {if number is 1} item {else} items",hide_excluded:"hide excluded items",additional_tasks:"még {number} feladat",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Select a timeslot",toggle_single_mode:"Egyszerű módba",toggle_scheme_mode:"Diagram módba",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"Időszak",start_date:"From",end_date:"To"},repeat_type:"behaviour after completion",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Kt={services:Ut,ui:Zt},Xt=Object.freeze({__proto__:null,services:Ut,ui:Zt,default:Kt}),Gt={generic:{turn_on:"Accendi",turn_off:"Spegni",parameter_to_value:"{parameter} a {value}",action_with_parameter:"{action} con {parameter}"},climate:{set_temperature:"imposta temperatura[ a {temperature}]",set_temperature_hvac_mode_heat:"riscaldamento[ a {temperature}]",set_temperature_hvac_mode_cool:"raffrescamento[ a {temperature}]",set_temperature_hvac_mode_heat_cool:"riscaldamento/raffrescamento[ a {temperature}]",set_temperature_hvac_mode_heat_cool_range:"riscaldamento/raffrescamento[ a {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ a {temperature}]",set_hvac_mode:"imposta modalità[ a {hvac_mode}]",set_preset_mode:"imposta programmazione[ {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"chiuso",open_cover:"aperto",set_cover_position:"imposta posizione[ su {position}]",set_cover_tilt_position:"imposta inclinazione[ su {tilt_position}]"},fan:{set_percentage:"imposta velocità[ a {speed}]",set_direction:"imposta direzione[ a {direction}]",oscillate:"imposta oscillazione[ a {oscillate}]"},humidifier:{set_humidity:"imposta umidità[ a {humidity}]",set_mode:"imposta modalità[ a {mode}]"},input_number:{set_value:"imposta valore[ a {value}]"},input_select:{select_option:"seleziona opzione[ {option}]"},select:{select_option:"seleziona opzione[ {option}]"},light:{turn_on:"accendi[ con il {brightness} di luminosità]"},media_player:{select_source:"seleziona sorgente[ {source}]"},notify:{send_message:"invia notifica"},script:{execute:"esegui"},vacuum:{start_pause:"avvia / pausa"},water_heater:{set_operation_mode:"imposta modalità[ a {operation_mode}]",set_away_mode:"imposta fuori casa"}},Yt={components:{date:{day_types_short:{daily:"giornaliero",workdays:"giorni lavorativi",weekend:"weekend"},day_types_long:{daily:"ogni giorno",workdays:"nei giorni lavorativi",weekend:"nel weekend"},days:"giorni",tomorrow:"domani",repeated_days:"ogni {days}",repeated_days_except:"ogni giorno tranne {excludedDays}",days_range:"{if startDay is domenica} dalla domenica {else} dal {startDay} {if endDay is domenica} alla domenica {else} al {endDay}",next_week_day:"prossimo {weekday}"},time:{absolute:"alle {time}",interval:"dalle {startTime} alle {endTime}",at_midnight:"a mezzanotte",at_noon:"a mezzogiorno",at_sun_event:"al {sunEvent}"}},dialog:{enable_schedule:{title:"Completa le modifiche",description:"La pianificazione modificata è attualmente disabilitata, dovrebbe essere abilitata?"},confirm_delete:{title:"Vuoi rimuovere l'entità?",description:"Sei sicuro di voler rimuovere questa entità?"},confirm_migrate:{title:"Modifica orario",description:"Alcune impostazioni andranno perse con questa azione. Vuoi procedere?"},weekday_picker:{title:"Giorni ripetuti per la pianificazione",choose:"Scegli..."},entity_picker:{title:"Scegli entità",choose:"Scegli...",no_results:"Nessun elemento corrispondente trovato"},action_picker:{title:"Scegli azione",show_all:"Mostra tutte le entità supportate"}},panel:{common:{title:"Schedulatore",new_schedule:"Nuovo orario",default_name:"Orario #{id}"},overview:{no_entries:"Non ci sono oggetti da visualizzare",backend_error:"Impossibile connettersi con il componente scheduler. Deve essere installato come integrazione prima di poter utilizzare questa card.",excluded_items:"{number} {if number is 1} oggetto escluso {else} oggetti esclusi",hide_excluded:"Nascondi oggetti esclusi",additional_tasks:"{number} attività in più",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Giorni ripetuti",start_time:"Ora di inizio",stop_time:"Ora di fine",action:"Azione",add_action:"Aggiungi azione",select_timeslot:"Seleziona una fascia oraria",toggle_single_mode:"Alla modo semplice",toggle_scheme_mode:"Alla modo schema",validation_errors:{overlapping_time:"Il programma ha fasce orarie sovrapposte",missing_target_entity:"Una o più azioni mancano di un'entità target",missing_service_parameter:"Una o più azioni mancano di un'impostazione richiesta",missing_action:"Il programma non ha azioni"}},options:{conditions:{header:"Condizioni",add_condition:"Aggiungi condizione",new_condition:"Nuova condizione",types:{equal_to:"{entity} è uguale a {value}",unequal_to:"{entity} è diverso da {value}",above:"{entity} è superiore a {value}",below:"{entity} è inferiore a {value}"},options:{logic_and:"Tutte le condizioni devono essere vere",logic_or:"Qualsiasi condizione deve essere vera",track_changes:"Rivaluta quando cambiano le condizioni"}},period:{header:"Periodo",start_date:"From",end_date:"To"},repeat_type:"comportamento dopo il completamento",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Jt={services:Gt,ui:Yt},Qt=Object.freeze({__proto__:null,services:Gt,ui:Yt,default:Jt}),ei={generic:{turn_on:"Įjungti",turn_off:"Išjungti",parameter_to_value:"{parameter} uz {value}",action_with_parameter:"{action} ar {parameter}"},climate:{set_temperature:"uzstādīt temperatūru[ uz {temperature}]",set_temperature_hvac_mode_heat:"sildīt[ līdz {temperature}]",set_temperature_hvac_mode_cool:"atdzesēt[ līdz {temperature}]",set_temperature_hvac_mode_heat_cool:"sildīt/atdzesēt[ līdz {temperature}]",set_temperature_hvac_mode_heat_cool_range:"sildīt/atdzesēt[ uz {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ uz {temperature}]",set_hvac_mode:"iestatīt[ uz {hvac_mode}]",set_preset_mode:"iestatīt režīmu[ uz {preset_mode}]",set_fan_mode:"iestatīt ventilatora režīmu[ uz {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"aizvērt",open_cover:"atvērt",set_cover_position:"uzstādīt pozīciju[ uz {position}]",set_cover_tilt_position:"uzstādīt slīpuma stāvokli[ uz {tilt_position}]"},fan:{set_percentage:"iestatīt ātrumu[ uz {speed}]",set_direction:"iestatīt virzienu[ uz {direction}]",oscillate:"iestatīt oscilāciju[ uz {oscillate}]"},humidifier:{set_humidity:"iestatīt mitrumu[ uz {humidity}]",set_mode:"iestatīt režīmu[ uz {mode}]"},input_number:{set_value:"iestatīt vērtību[ uz {value}]"},input_select:{select_option:"izvēlēties opciju[ {option}]"},select:{select_option:"izvēlēties opciju[ {option}]"},light:{turn_on:"ieslēgt[ ar {brightness} spilgtumu]"},media_player:{select_source:"izvēlēties avotu[ {source}]"},notify:{send_message:"nosūtīt paziņojumu"},script:{execute:"izpildīt"},vacuum:{start_pause:"sākt / pauze"},water_heater:{set_operation_mode:"iestatīt režīmu[ uz {operation_mode}]",set_away_mode:"iestatīt prombūtnes režīmu"}},ti={components:{date:{day_types_short:{daily:"ikdienišķs",workdays:"darba dienas",weekend:"nedēļas nogale"},day_types_long:{daily:"katru dienu",workdays:"darba dienās",weekend:"nedēļas nogalē"},days:"dienas",tomorrow:"rītdiena",repeated_days:"katras {days}",repeated_days_except:"katru dienu, izņemot {excludedDays}",days_range:"no {startDay} līdz {endDay}",next_week_day:"nākošo {weekday}"},time:{absolute:"kad {time}",interval:"no {startTime} līdz {endTime}",at_midnight:"kad midnight",at_noon:"kad noon",at_sun_event:"kad {sunEvent}"}},dialog:{enable_schedule:{title:"Pabeigt modificēšanu",description:"Izmainītais grafiks pašlaik ir atspējots, vai vēlaties to iespējot?"},confirm_delete:{title:"Vai dzēst vienību?",description:"Vai tiešām vēlaties dzēst šo vienību?"},confirm_migrate:{title:"Atjaunināt grafiku",description:"Šīs izmaiņas rezultātā daži iestatījumi tiks zaudēti. Vai vēlaties turpināt?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Plānotājs",new_schedule:"Jauns grafiks",default_name:"Grafiks #{id}"},overview:{no_entries:"Nav parādāmu vienību",backend_error:"Nevar izveidot savienojumu ar plānotāja komponenti. Pirms šīs kartes izmantošanas tā ir jāinstalē kā integrācija.",excluded_items:"{number} izslēgtas {if number is 1} vienība {else} vienības",hide_excluded:"paslēpt izslēgtās vienības",additional_tasks:"{number} papildu {if number is 1} uzdevums {else} uzdevumi",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Vispirms izvēlieties laika slotu",toggle_single_mode:"Uz vienkāršo režīmu",toggle_scheme_mode:"Uz shēmas režīmu",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Pārvērtēt, kad mainās nosacījumi"}},period:{header:"Periods",start_date:"From",end_date:"To"},repeat_type:"uzvedība pēc beigām",tags:"Tags"},card_editor:{tabs:{entities:"Vienības",other:"Cits"},fields:{title:{heading:"Kartes nosaukums",options:{standard:"standarta",hidden:"paslēpts",custom:"pielāgots"},custom_title:"Pielāgots nosaukums"},discover_existing:{heading:"Rādīt visus grafikus",description:"Šis iestata 'atklāt esošo' parametru. Iepriekš izveidotie grafiki automātiski tiks pievienoti kartei."},time_step:{heading:"Laika solis",description:"Izšķirtspēja (minūtēs) grafiku izveidei",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Kārtošanas opcijas",description:"Kārtība, kādā grafiki parādās kartē",options:{relative_time:"Atlikušais laiks līdz nākamajai darbībai",title:"Grafika nosaukums",state:"Rādīt aktīvos grafikus augšā"}},display_format_primary:{heading:"Rādītā primārā informācija",description:"Konfigurējiet, kura informācija tiek izmantota grafiku pārskatā",options:{default:"Grafika nosaukums",entity_action:"Uzdevuma kopsavilkums"}},display_format_secondary:{heading:"Rādītā sekundārā informācija",description:"Konfigurējiet, kuras papildu īpašības ir redzamas pārskatā",options:{relative_time:"Atlikušais laiks līdz nākamajai darbībai",time:"Konfigurētais laiks nākamajai darbībai",days:"Atkārtotas nedēļas dienas",additional_tasks:"Papildu uzdevumu skaits"}},show_header_toggle:{heading:"Rādīt galvenes pārslēgšanu",description:"Rādīt pārslēgšanas slēdzi kartes augšdaļā, lai iespējotu/atspējotu visas vienības"},show_toggle_switches:{heading:"Rādīt pārslēgšanas slēdžus",description:"Rādīt pārslēgšanas slēdzi katram atsevišķam grafikam kartē"},tags:{heading:"Tagi",description:"Izmantojiet tagus, lai sadalītu grafikus starp vairākām kartēm"},entities:{button_label:"Iekļauto elementu konfigurēšana",heading:"Iekļautās vienības",description:"Izvēlieties vienības, kuras vēlaties kontrolēt, izmantojot plānotāju. Jūs varat noklikšķināt uz grupas, lai to atvērtu. Ņemiet vērā, ka dažas vienības (piemēram, sensori) var tikt izmantotas tikai nosacījumiem, nevis darbībām.",included_number:"{number}/{total} izvēlēts"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},ii={services:ei,ui:ti},si=Object.freeze({__proto__:null,services:ei,ui:ti,default:ii}),ai={generic:{turn_on:"Aanzetten",turn_off:"Uitzetten",parameter_to_value:"{parameter} naar {value}",action_with_parameter:"{action} met {parameter}"},climate:{set_temperature:"temperatuur instellen[ naar {temperature}]",set_temperature_hvac_mode_heat:"verwarmen[ naar {temperature}]",set_temperature_hvac_mode_cool:"koelen[ naar {temperature}]",set_temperature_hvac_mode_heat_cool:"verwarmen/koelen[ naar {temperature}]",set_temperature_hvac_mode_heat_cool_range:"verwarmen/koelen[ naar {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"automatisch[ naar {temperature}]",set_hvac_mode:"modus aanpassen[ naar {hvac_mode}]",set_preset_mode:"programma[ {preset_mode}] instellen",set_fan_mode:"ventilatiemodus aanpassen[ naar {fan_mode}]",set_swing_mode:"oscillatiemodus aanpassen[ naar {swing_mode}]"},cover:{close_cover:"sluiten",open_cover:"openen",set_cover_position:"positie instellen[ naar {position}]",set_cover_tilt_position:"hellingshoek instellen[ naar {tilt_position}]"},fan:{set_percentage:"snelheid instellen[ op {percentage}]",set_direction:"richting instellen[ naar {direction}]",oscillate:"zet oscillatie[ naar {oscillate}]"},humidifier:{set_humidity:"luchtvochtigheid instellen [ op {humidity}]",set_mode:"modus aanpassen[ naar {mode}]"},input_number:{set_value:"waarde aanpassen[ naar {value}]"},input_select:{select_option:"selecteer optie[ {option}]"},select:{select_option:"selecteer optie[ {option}]"},light:{turn_on:"inschakelen[ met {brightness} helderheid]"},media_player:{select_source:"kies ingang[ {source}]"},notify:{send_message:"notificatie sturen"},script:{execute:"uitvoeren"},vacuum:{start_pause:"start / pauzeer"},water_heater:{set_operation_mode:"modus aanpassen[ naar {operation_mode}]",set_away_mode:"stel afwezigheidsmode in"}},oi={components:{date:{day_types_short:{daily:"dagelijks",workdays:"werkdagen",weekend:"weekend"},day_types_long:{daily:"iedere dag",workdays:"doordeweeks",weekend:"in het weekend"},days:"dagen",tomorrow:"morgen",repeated_days:"elke {days}",repeated_days_except:"elke dag behalve {excludedDays}",days_range:"van {startDay} tot {endDay}",next_week_day:"volgende week {weekday}"},time:{absolute:"om {time}",interval:"van {startTime} tot {endTime}",at_midnight:"om middernacht",at_noon:"om 12:00",at_sun_event:"bij {sunEvent}"}},dialog:{enable_schedule:{title:"Wijzigingen voltooid",description:"Deze planning is momenteel gedeactiveerd. Dient deze te worden ingeschakeld?"},confirm_delete:{title:"Entiteit verwijderen?",description:"Weet je zeker dat je dit item wilt verwijderen?"},confirm_migrate:{title:"Schema bijwerken",description:"Door deze actie gaan vorige instellingen verloren. Wil je doorgaan?"},weekday_picker:{title:"Herhaalde dagen voor tijdschema",choose:"Kies..."},entity_picker:{title:"Kies entiteiten",choose:"Kies...",no_results:"Geen overeenkomstige items gevonden"},action_picker:{title:"Kies actie",show_all:"Toon alle ondersteunde entiteiten"}},panel:{common:{title:"Tijdplanner",new_schedule:"Nieuw schema",default_name:"Schema #{id}"},overview:{no_entries:"Er zijn geen items aangemaakt",backend_error:"Er kon geen verbinding worden gemaakt met het Scheduler component. Deze moet als integratie zijn geinstalleerd voordat deze kaart gebruikt kan worden.",excluded_items:"{number} uitgesloten {if number is 1} item {else} items",hide_excluded:"verberg uitgesloten items",additional_tasks:"{number} overige {if number is 1} taak {else} taken",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Herhaling",start_time:"Starttijd",stop_time:"Eindtijd",action:"Actie",add_action:"Actie toevoegen",select_timeslot:"Selecteer een tijdslot...",toggle_single_mode:"Naar enkele modus",toggle_scheme_mode:"Naar schema modus",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Condities",add_condition:"Conditie toevoegen",new_condition:"Nieuwe conditie",types:{equal_to:"{entity} is gelijk aan {value}",unequal_to:"{entity} is ongelijk aan {value}",above:"{entity} is hoger dan {value}",below:"{entity} is lager dan {value}"},options:{logic_and:"Alle condities moeten zijn voldaan",logic_or:"Een van de condities moet zijn voldaan",track_changes:"Herevalueer als de condities veranderen"}},period:{header:"Periode",start_date:"Vanaf",end_date:"Tot"},repeat_type:"Gedrag na voltooiing",tags:"Tags"},card_editor:{tabs:{entities:"Entiteiten",other:"Overig"},fields:{title:{heading:"Titel van de kaart",options:{standard:"standaard",hidden:"verborgen",custom:"anders"},custom_title:"Eigen titel"},discover_existing:{heading:"Alle schema's tonen",description:"Hiermee wordt de 'discover existing' instelling geactiveerd. Eerder aangemaakte schema's zullen automatisch worden weergegeven."},time_step:{heading:"Stapgrootte voor tijd",description:"Resolutie (in minuten)",unit_minutes:"min"},default_editor:{heading:"Standaardmodus voor tijdsinvoer",options:{single:"Enkele modus",scheme:"Tijdschema-modus"}},sort_by:{heading:"Sorteer-opties",description:"Volgorde waarin de schema's worden weergegeven in de kaart",options:{relative_time:"Resterende tijd tot volgende actie",title:"Weergegeven titel van de schema's",state:"Actieve schema's eerst"}},display_format_primary:{heading:"Weergegeven primaire info",description:"Kies welk label wordt gebruikt in de weergave",options:{default:"Schema naam",entity_action:"Samenvatting van de actie"}},display_format_secondary:{heading:"Weergegeven secondaire info",description:"Kies welke aanvullende informatie zichtbaar is in de weergave",options:{relative_time:"Resterende tijd tot volgende actie",time:"Ingestelde tijd voor de volgende actie",days:"Herhaalde dagen van de week",additional_tasks:"Aantal resterende acties"}},show_header_toggle:{heading:"Hoofdschakelaar weergeven",description:"Schakelaar weergeven bovenin de kaart om alle schema's te (de)activeren"},show_toggle_switches:{heading:"Schakelknoppen weergeven",description:"Schakelknop weergeven voor elk individueel schema in de kaart"},tags:{heading:"Tags",description:"Tags kunnen gebruikt worden om schema's te verdelen over meerdere kaarten"},entities:{button_label:"Configureer zichtbare entiteiten",heading:"Zichtbare entiteiten",description:"Kies de entiteiten die je wilt bedienen vanuit schema's. Klik op een categorie om deze te openen. Merk op dat sommige entiteiten gebruikt worden om condities toe te wijzen.",included_number:"{number}/{total} geselecteerd"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},ni={services:ai,ui:oi},ri=Object.freeze({__proto__:null,services:ai,ui:oi,default:ni}),di={generic:{turn_on:"Skru på",turn_off:"Slå av",parameter_to_value:"{parameter} til {value}",action_with_parameter:"{action} med {parameter}"},climate:{set_temperature:"sett temperatur[ til {temperature}]",set_temperature_hvac_mode_heat:"oppvarming[ til {temperature}]",set_temperature_hvac_mode_cool:"kjøling[ til {temperature}]",set_temperature_hvac_mode_heat_cool:"oppvarming/kjøling[ til {temperature}]",set_temperature_hvac_mode_heat_cool_range:"oppvarming/kjøling[ til {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ til {temperature}]",set_hvac_mode:"sett modus[ til {hvac_mode}]",set_preset_mode:"sett forhåndsvalg[ {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"lukk",open_cover:"åpne",set_cover_position:"sett posisjon[ til {position}]",set_cover_tilt_position:"sett vippestilling[ til {tilt_position}]"},fan:{set_percentage:"sett hastighet[ til {speed}]",set_direction:"sett retning[ til {direction}]",oscillate:"sett svingning[ til {oscillate}]"},humidifier:{set_humidity:"sett luftfuktighet[ til {humidity}]",set_mode:"sett modus[ til {mode}]"},input_number:{set_value:"sett verdi[ til {value}]"},input_select:{select_option:"velg[ {option}]"},select:{select_option:"velg[ {option}]"},light:{turn_on:"slå på[ med {brightness} lysstyrke]"},media_player:{select_source:"velg kilde[ {source}]"},notify:{send_message:"send notifikasjon"},script:{execute:"utfør"},vacuum:{start_pause:"start / pause"},water_heater:{set_operation_mode:"sett modus[ til {operation_mode}]",set_away_mode:"sett bortemodus"}},li={components:{date:{day_types_short:{daily:"hver dag",workdays:"ukedager",weekend:"helg"},day_types_long:{daily:"hver dag",workdays:"ukedager",weekend:"helg"},days:"Dager",tomorrow:"imorgen",repeated_days:"hver {days}",repeated_days_except:"hver dag unntatt {excludedDays}",days_range:"fra {startDay} til {endDay}",next_week_day:"neste {weekday}"},time:{absolute:"kl. {time}",interval:"fra {startTime} til {endTime}",at_midnight:"ved midnatt",at_noon:"kl. 12.00",at_sun_event:"ved {sunEvent}"}},dialog:{enable_schedule:{title:"Fullfør endringene",description:"Tidsplanen som er endret er for øyeblikket deaktivert, bør den være aktivert?"},confirm_delete:{title:"Vil du fjerne entiteten?",description:"Er du sikker på at du vil fjerne denne entiteten?"},confirm_migrate:{title:"Endre tidsplanen",description:"Noen innstillinger vil gå tapt ved denne handlingen. Vil du fortsette?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Tidsplan",new_schedule:"Ny tidsplan",default_name:"Tidsplan #{id}"},overview:{no_entries:"Det er ingen definerte tidsplaner å vise",backend_error:"Kunne ikke koble til tidsplankomponenten. Den må installeres som en integrasjon før dette kortet kan benyttes.",excluded_items:"{number} ekskludert {if number is 1} element {else} elementer",hide_excluded:"skjul ekskluderte elementer",additional_tasks:"{number} flere {if number is 1} oppgaver {else} oppgaver",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Velg tidsluke",toggle_single_mode:"Til enkel modus",toggle_scheme_mode:"Til skjemamodus",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"Periode",start_date:"From",end_date:"To"},repeat_type:"oppførsel etter fullføring",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},ci={services:di,ui:li},hi=Object.freeze({__proto__:null,services:di,ui:li,default:ci}),ui={generic:{turn_on:"Włącz",turn_off:"Wyłącz",parameter_to_value:"{parameter} na {value}",action_with_parameter:"{action} z parametrem {parameter}"},climate:{set_temperature:"ustaw temperaturę[ na {temperature}]",set_temperature_hvac_mode_heat:"ogrzewanie[ na {temperature}]",set_temperature_hvac_mode_cool:"chłodzenie[ na {temperature}]",set_temperature_hvac_mode_heat_cool:"ogrzewanie/chłodzenie[ na {temperature}]",set_temperature_hvac_mode_heat_cool_range:"ogrzewanie/chłodzenie[ {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ na {temperature}]",set_hvac_mode:"ustaw tryb[ na {hvac_mode}]",set_preset_mode:"ustaw tryb[ na {preset_mode}]",set_fan_mode:"ustaw tryb wentylatora[ na {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"zamknij",open_cover:"otwórz",set_cover_position:"ustaw pozycję[ na {position}]",set_cover_tilt_position:"ustaw kąt nachylenia[ na {tilt_position}]"},fan:{set_percentage:"ustaw prędkość[ na {percentage}]",set_direction:"ustaw kierunek[ na {direction}]",oscillate:"ustaw oscylację[ na {oscillate}]"},humidifier:{set_humidity:"ustaw wilgotność[ na {humidity}]",set_mode:"ustaw tryb[ na {mode}]"},input_number:{set_value:"ustaw wartość[ na {value}]"},input_select:{select_option:"wybierz opcję[ {option}]"},select:{select_option:"wybierz opcję[ {option}]"},light:{turn_on:"włącz[ z jasnością {brightness}]"},media_player:{select_source:"wybierz źródło[ {source}]"},notify:{send_message:"wyślij powiadomienie"},script:{execute:"wykonaj"},vacuum:{start_pause:"start / pauza"},water_heater:{set_operation_mode:"ustaw tryb[ na {operation_mode}]",set_away_mode:"ustaw tryb poza domem"}},pi={components:{date:{day_types_short:{daily:"codziennie",workdays:"dni robocze",weekend:"weekend"},day_types_long:{daily:"każdego dnia",workdays:"w dni robocze",weekend:"w weekend"},days:"dni",tomorrow:"jutro",repeated_days:"każde {days}",repeated_days_except:"każdego dnia oprócz {excludedDays}",days_range:"od {startDay} do {endDay}",next_week_day:"w {weekday}"},time:{absolute:"o {time}",interval:"od {startTime} do {endTime}",at_midnight:"o północy",at_noon:"w południe",at_sun_event:"o {sunEvent}"}},dialog:{enable_schedule:{title:"Zakończ modyfikacje",description:"Harmonogram, który zmieniłeś, jest obecnie wyłączony. Czy chcesz go włączyć?"},confirm_delete:{title:"Usunąć encję?",description:"Czy na pewno chcesz usunąć tę encję?"},confirm_migrate:{title:"Aktualizuj harmonogram",description:"Niektóre ustawienia zostaną utracone przy tej zmianie. Czy chcesz kontynuować?"},weekday_picker:{title:"Dni powtórzeń dla harmonogramu",choose:"Wybierz..."},entity_picker:{title:"Wybierz encje",choose:"Wybierz...",no_results:"Nie znaleziono pasujących elementów"},action_picker:{title:"Wybierz akcję",show_all:"Pokaż wszystkie obsługiwane jednostki"}},panel:{common:{title:"Harmonogram",new_schedule:"Nowy harmonogram",default_name:"Harmonogram #{id}"},overview:{no_entries:"Brak elementów do wyświetlenia",backend_error:"Nie można połączyć się z komponentem harmonogramu. Musi być zainstalowany jako integracja, zanim ta karta będzie mogła być używana.",excluded_items:"{number} wykluczonych {if number is 1} element {else} elementów",hide_excluded:"ukryj wykluczone elementy",additional_tasks:"{number} dodatkowych {if number is 1} zadanie {else} zadań",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Powtarzane dni",start_time:"Czas rozpoczęcia",stop_time:"Czas zakończenia",action:"Akcja",add_action:"Dodaj akcję",select_timeslot:"Wybierz przedział czasowy",toggle_single_mode:"Do trybu prostego",toggle_scheme_mode:"Do trybu schematu",validation_errors:{overlapping_time:"Harmonogram ma nachodzące na siebie przedziały czasowe",missing_target_entity:"Jednej lub więcej akcji brakuje docelowej encji",missing_service_parameter:"Jednej lub więcej akcji brakuje wymaganego parametru",missing_action:"Harmonogram nie ma żadnych akcji"}},options:{conditions:{header:"Warunki",add_condition:"Dodaj warunek",new_condition:"Nowy warunek",types:{equal_to:"{entity} równa się {value}",unequal_to:"{entity} różni się od {value}",above:"{entity} jest powyżej {value}",below:"{entity} jest poniżej {value}"},options:{logic_and:"Wszystkie warunki muszą być spełnione",logic_or:"Dowolny warunek musi być spełniony",track_changes:"Ponownie sprawdzaj przy zmianie warunków"}},period:{header:"Okres",start_date:"Od",end_date:"Do"},repeat_type:"zachowanie po zakończeniu",tags:"Tagi"},card_editor:{tabs:{entities:"Encje",other:"Inne"},fields:{title:{heading:"Tytuł karty",options:{standard:"standardowy",hidden:"ukryty",custom:"niestandardowy"},custom_title:"Niestandardowy tytuł"},discover_existing:{heading:"Pokaż wszystkie harmonogramy",description:"Ustawia parametr 'discover existing'. Wcześniej utworzone harmonogramy będą automatycznie dodane do karty."},time_step:{heading:"Krok czasu",description:"Rozdzielczość (w minutach) przy tworzeniu harmonogramów",unit_minutes:"min"},default_editor:{heading:"Domyślny edytor czasu",options:{single:"Tryb prostego harmonogramu",scheme:"Tryb schematu czasu"}},sort_by:{heading:"Opcje sortowania",description:"Kolejność, w jakiej harmonogramy pojawiają się na karcie",options:{relative_time:"Czas do następnej akcji",title:"Wyświetlana nazwa harmonogramu",state:"Pokaż aktywne harmonogramy na górze"}},display_format_primary:{heading:"Wyświetlana główna informacja",description:"Określ, która etykieta jest używana dla harmonogramów w podglądzie",options:{default:"Nazwa harmonogramu",entity_action:"Podsumowanie zadania"}},display_format_secondary:{heading:"Wyświetlana dodatkowa informacja",description:"Skonfiguruj, które dodatkowe właściwości są widoczne w podglądzie",options:{relative_time:"Czas do następnej akcji",time:"Skonfigurowany czas następnej akcji",days:"Powtarzane dni tygodnia",additional_tasks:"Liczba dodatkowych zadań"}},show_header_toggle:{heading:"Pokaż przełącznik w nagłówku",description:"Pokaż przełącznik w nagłówku karty do włączania/wyłączania wszystkich encji"},show_toggle_switches:{heading:"Pokaż przełączniki",description:"Pokaż przełącznik dla każdego harmonogramu w karcie"},tags:{heading:"Tagi",description:"Używaj tagów do podziału harmonogramów pomiędzy wieloma kartami"},entities:{button_label:"Konfiguruj zawarte encje",heading:"Zawarte encje",description:"Wybierz encje, którymi chcesz sterować za pomocą harmonogramu. Możesz kliknąć na grupę, aby ją otworzyć. Zauważ, że niektóre encje (np. sensory) mogą być używane tylko jako warunki, a nie akcje.",included_number:"{number}/{total} wybrano"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},mi={services:ui,ui:pi},_i=Object.freeze({__proto__:null,services:ui,ui:pi,default:mi}),gi={generic:{turn_on:"Ligar",turn_off:"Desligar",parameter_to_value:"{parameter} para {value}",action_with_parameter:"{action} com {parameter}"},climate:{set_temperature:"definir temperatura[ para {temperature}]",set_temperature_hvac_mode_heat:"aquecimento[ para {temperature}]",set_temperature_hvac_mode_cool:"arrefecimento[ para {temperature}]",set_temperature_hvac_mode_heat_cool:"aquecimento/arrefecimento[ para {temperature}]",set_temperature_hvac_mode_heat_cool_range:"aquecimento/arrefecimento[ para {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ para {temperature}]",set_hvac_mode:"definir modo[ para {hvac_mode}]",set_preset_mode:"definir predefinição[ {preset_mode}]",set_fan_mode:"definir modo ventoinha[ para {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"fechar",open_cover:"abrir",set_cover_position:"definir posição[ para {position}]",set_cover_tilt_position:"definir inclinação[ como {tilt_position}]"},fan:{set_percentage:"definir velocidade[ para {speed}]",set_direction:"definir direção[ para {direction}]",oscillate:"definir oscilação[ para {oscillate}]"},humidifier:{set_humidity:"definir humidade[ para {humidity}]",set_mode:"definir modo[ para {mode}]"},input_number:{set_value:"definir valor[ para {value}]"},input_select:{select_option:"selecionar opção[ {option}]"},select:{select_option:"selecionar opção[ {option}]"},light:{turn_on:"ligar[ com {brightness} brightness]"},media_player:{select_source:"selecionar origem[ {source}]"},notify:{send_message:"enviar notificação"},script:{execute:"executar"},vacuum:{start_pause:"iniciar / pausar"},water_heater:{set_operation_mode:"definir modo[ para {operation_mode}]",set_away_mode:"definir modo ausente"}},vi={components:{date:{day_types_short:{daily:"todos",workdays:"semana de trabalho",weekend:"fim-de-semana"},day_types_long:{daily:"todos os dias",workdays:"em dias de semana",weekend:"no fim-de-semana"},days:"dias",tomorrow:"amanhã",repeated_days:"a cada {days}",repeated_days_except:"a cada dia exceto {excludedDays}",days_range:"até {startDay} até {endDay}",next_week_day:"próximo {weekday}"},time:{absolute:"Às {time}",interval:"das {startTime} às {endTime}",at_midnight:"ao meia-noite",at_noon:"ao meio-dia",at_sun_event:"ao {sunEvent}"}},dialog:{enable_schedule:{title:"Conclua as modificações",description:"A programação que foi alterada está atualmente desabilitada, deveria ser habilitada?"},confirm_delete:{title:"Remover a entidade?",description:"Tem a certeza que deseja remover esta entidade?"},confirm_migrate:{title:"Modificar horário",description:"Algumas configurações serão perdidas por esta ação. Você quer prosseguir?"},weekday_picker:{title:"Repetições semanais",choose:"Escolha..."},entity_picker:{title:"Escolha entidades",choose:"Escolha...",no_results:"Sem resultados"},action_picker:{title:"Escolha a acção",show_all:"Mostrar todas as entidades suportadas"}},panel:{common:{title:"Agenda",new_schedule:"Novo horário",default_name:"Horário #{id}"},overview:{no_entries:"Não existem itens a mostrar",backend_error:"Não consegui ligar ao componente de agendamento. Essa integração tem que ser instalada antes da utilização deste cartão.",excluded_items:"{number}{if number is 1} item excluído {else} itens excluídos",hide_excluded:"ocultar itens excluídos",additional_tasks:"Mais {number} {if number is 1} tarefa {else} tarefas",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repetições semanais",start_time:"Hora início",stop_time:"Hora fim",action:"Acção",add_action:"Acrescentar acção",select_timeslot:"Selecionar um período horário",toggle_single_mode:"Para modo simples",toggle_scheme_mode:"Para modo esquema",validation_errors:{overlapping_time:"O Horário tem sobreposições",missing_target_entity:"Uma ou mais acções sem entidade definida",missing_service_parameter:"Unma ou mais acções sem uma definição obrigatória",missing_action:"O Horário não tem acções"}},options:{conditions:{header:"Condições",add_condition:"Acrescentar condição",new_condition:"Nova condição",types:{equal_to:"{entity} igual a {value}",unequal_to:"{entity} diferente de {value}",above:"{entity} acima de {value}",below:"{entity} abaixo de {value}"},options:{logic_and:"Todas as condições têm de ser verdadeiras",logic_or:"Uma das condições tem de ser verdadeira",track_changes:"Reavaliar em caso de alterações"}},period:{header:"Período",start_date:"Desde",end_date:"Até"},repeat_type:"Comportamento após a conclusão",tags:"Etiquetas"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},fi={services:gi,ui:vi},bi=Object.freeze({__proto__:null,services:gi,ui:vi,default:fi}),yi={generic:{turn_on:"Ligar",turn_off:"Desligar",parameter_to_value:"{parameter} para {value}",action_with_parameter:"{action} com {parameter}"},climate:{set_temperature:"definir temperatura[ para {temperature}]",set_temperature_hvac_mode_heat:"aquecimento[ para {temperature}]",set_temperature_hvac_mode_cool:"arrefecimento[ para {temperature}]",set_temperature_hvac_mode_heat_cool:"aquecimento/arrefecimento[ para {temperature}]",set_temperature_hvac_mode_heat_cool_range:"aquecimento/arrefecimento[ para {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ para {temperature}]",set_hvac_mode:"definir modo[ para {hvac_mode}]",set_preset_mode:"definir predefinição[ {preset_mode}]",set_fan_mode:"definir modo do ventilador[ para {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"fechar",open_cover:"abrir",set_cover_position:"definir posição[ para {position}]",set_cover_tilt_position:"definir a posição de inclinação[ para {tilt_position}]"},fan:{set_percentage:"definir velocidade[ para {speed}]",set_direction:"definir direção[ para {direction}]",oscillate:"definir oscilação[ para {oscillate}]"},humidifier:{set_humidity:"definir humidade[ para {humidity}]",set_mode:"definir modo[ para {mode}]"},input_number:{set_value:"definir valor[ para {value}]"},input_select:{select_option:"selecionar opção[ {option}]"},select:{select_option:"selecionar opção[ {option}]"},light:{turn_on:"ligar[ com {brightness} brightness]"},media_player:{select_source:"selecionar origem[ {source}]"},notify:{send_message:"enviar notificação"},script:{execute:"executar"},vacuum:{start_pause:"iniciar / pausar"},water_heater:{set_operation_mode:"definir modo[ para {operation_mode}]",set_away_mode:"definir modo ausente"}},wi={components:{date:{day_types_short:{daily:"diário",workdays:"semana de trabalho",weekend:"fim-de-semana"},day_types_long:{daily:"todos os dias",workdays:"em dias de semana",weekend:"no fim-de-semana"},days:"dias",tomorrow:"amanhã",repeated_days:"a cada {days}",repeated_days_except:"a cada dia exceto {excludedDays}",days_range:"de {startDay} até {endDay}",next_week_day:"próximo {weekday}"},time:{absolute:"à {time}",interval:"das {startTime} às {endTime}",at_midnight:"ao meia-noite",at_noon:"ao meio-dia",at_sun_event:"ao {sunEvent}"}},dialog:{enable_schedule:{title:"Conclua as modificações",description:"A programação que foi alterada está atualmente desabilitada, deveria ser habilitada?"},confirm_delete:{title:"Remover entidade?",description:"Tem certeza de que deseja remover esta entidade?"},confirm_migrate:{title:"Modificar horário",description:"Algumas configurações serão perdidas por esta ação. Você quer prosseguir?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Agenda",new_schedule:"Novo horário",default_name:"Horário #{id}"},overview:{no_entries:"Não existem itens para mostrar",backend_error:"Não foi possível conectar com o componente agendador. Ele precisa ser instalado como integração antes que este cartão possa ser usado.",excluded_items:"{number}{if number is 1} item excluído {else} itens excluídos",hide_excluded:"ocultar itens excluídos",additional_tasks:"Mais {number} {if number is 1} tarefa {else} tarefas",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Selecionar um período horário",toggle_single_mode:"Para modo simples",toggle_scheme_mode:"Para modo esquema",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Reavaliar quando as condições mudarem"}},period:{header:"Período",start_date:"From",end_date:"To"},repeat_type:"comportamento após a conclusão",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},ki={services:yi,ui:wi},xi=Object.freeze({__proto__:null,services:yi,ui:wi,default:ki}),$i={generic:{turn_on:"Pornește",turn_off:"Oprește",parameter_to_value:"{parameter} la {value}",action_with_parameter:"{action} cu {parameter}"},climate:{set_temperature:"setare temperatură[ la {temperature}]",set_temperature_hvac_mode_heat:"încălzire[ la {temperature}]",set_temperature_hvac_mode_cool:"răcire[ la {temperature}]",set_temperature_hvac_mode_heat_cool:"încălzire/răcire[ la {temperature}]",set_temperature_hvac_mode_heat_cool_range:"încălzire/răcire[ la {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ la {temperature}]",set_hvac_mode:"setare mod[ la {hvac_mode}]",set_preset_mode:"setare preset[ {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"închidere",open_cover:"deschidere",set_cover_position:"setare poziție[ la {position}]",set_cover_tilt_position:"set tilt position[ to {tilt_position}]"},fan:{set_percentage:"setare viteză[ la {speed}]",set_direction:"setare direcție[ la {direction}]",oscillate:"setare oscilare[ la {oscillate}]"},humidifier:{set_humidity:"setare umiditate[ la {humidity}]",set_mode:"setare mod[ la {mode}]"},input_number:{set_value:"setare valoare[ la {value}]"},input_select:{select_option:"selectare opțiune[ {option}]"},select:{select_option:"selectare opțiune[ {option}]"},light:{turn_on:"pornire[ cu luminozitate {brightness}]"},media_player:{select_source:"selectare sursă[ {source}]"},notify:{send_message:"send notification"},script:{execute:"executare"},vacuum:{start_pause:"start / pauză"},water_heater:{set_operation_mode:"setare mod[ la {operation_mode}]",set_away_mode:"setare mod plecat"}},Si={components:{date:{day_types_short:{daily:"zilnic",workdays:"zile lucrătoare",weekend:"sfârșit de săptămână"},day_types_long:{daily:"zilnic",workdays:"în timpul săptămânii",weekend:"la sfârșit de săptămână"},days:"zile",tomorrow:"mâine",repeated_days:"la fiecare {days} zile",repeated_days_except:"zilnic cu excepția {excludedDays}",days_range:"din {startDay} până în {endDay}",next_week_day:"{weekday} viitoare"},time:{absolute:"la {time}",interval:"de la {startTime} până la {endTime}",at_midnight:"la miezul nopții",at_noon:"la amiază",at_sun_event:"la {sunEvent}"}},dialog:{enable_schedule:{title:"Completați modificările",description:"Programul care a fost modificat este momentan dezactivat, ar trebui activat?"},confirm_delete:{title:"Ștergeți entitatea?",description:"Sigur doriți să eliminați această entitate?"},confirm_migrate:{title:"Modificați programul",description:"Unele setări se vor pierde prin această acțiune. Vrei sa continui?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Planificator",new_schedule:"Noul program",default_name:"Program #{id}"},overview:{no_entries:"Nu există elemente de afișat",backend_error:"Could not connect with the scheduler component. It needs to be installed as integration before this card can be used.",excluded_items:"{if number is 1}un element exclus {else}{number} elemente excluse",hide_excluded:"ascunde elementele excluse",additional_tasks:"{if number is 1}o sarcină suplimentară {else}{number} sarcini suplimentare",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Selectați un interval orar",toggle_single_mode:"Te lokho modo",toggle_scheme_mode:"Te sxeme modo",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"Perioadă",start_date:"From",end_date:"To"},repeat_type:"comportament după declanșare",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},ji={services:$i,ui:Si},Oi=Object.freeze({__proto__:null,services:$i,ui:Si,default:ji}),zi={generic:{turn_on:"Включить",turn_off:"Выключить",parameter_to_value:"{parameter} к {value}",action_with_parameter:"{action} с {parameter}"},climate:{set_temperature:"установить температуру[ {temperature}]",set_temperature_hvac_mode_heat:"обогрев[ {temperature}]",set_temperature_hvac_mode_cool:"охлаждение[ {temperature}]",set_temperature_hvac_mode_heat_cool:"обогрев/охлаждение[ {temperature}]",set_temperature_hvac_mode_heat_cool_range:"обогрев/охлаждение[ {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"aвто[ {temperature}]",set_hvac_mode:"установить режим[ {hvac_mode}]",set_preset_mode:"выбрать набор настроек[ {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"закрыть",open_cover:"открыть",set_cover_position:"установить позицию[ {position}]",set_cover_tilt_position:"установить наклон[ {tilt_position}]"},fan:{set_percentage:"установить скорость[ {speed}]",set_direction:"установить направление[ {direction}]",oscillate:"установить колебание[ {oscillate}]"},humidifier:{set_humidity:"установить влажность[ {humidity}]",set_mode:"установить режим[ {mode}]"},input_number:{set_value:"установить значение[ в {value}]"},input_select:{select_option:"установить опцию[ {option}]"},select:{select_option:"установить опцию[ {option}]"},light:{turn_on:"включить[ с {brightness} яркостью]"},media_player:{select_source:"выбрать источник[ {source}]"},notify:{send_message:"послать сообщение"},script:{execute:"запустить"},vacuum:{start_pause:"старт / пауза"},water_heater:{set_operation_mode:"установить режим[ {operation_mode}]",set_away_mode:"установить режим вне дома"}},Ci={components:{date:{day_types_short:{daily:"ежедневно",workdays:"рабочие дни",weekend:"выходные"},day_types_long:{daily:"каждый день",workdays:"по рабочим дням",weekend:"в выходные"},days:"дни",tomorrow:"завтра",repeated_days:"каждый {days}",repeated_days_except:"каждый день кроме {excludedDays}",days_range:"с {startDay} до {endDay}",next_week_day:"в следующую {weekday}"},time:{absolute:"в {time}",interval:"с {startTime} до {endTime}",at_midnight:"в полночь",at_noon:"в полдень",at_sun_event:"в {sunEvent}"}},dialog:{enable_schedule:{title:"Завершите модификации",description:"Расписание, которое было изменено, в настоящее время отключено, следует ли его включить?"},confirm_delete:{title:"Удалить объект?",description:"Вы уверены, что хотите удалить этот объект?"},confirm_migrate:{title:"Изменить расписание",description:"При этом некоторые настройки будут потеряны. Вы хотите продолжить?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Планировщик",new_schedule:"Новое расписание",default_name:"Расписание #{id}"},overview:{no_entries:"Отсутствуют элементы",backend_error:"Нет соединенияс scheduler component. Scheduler component должен быть установлен до применения этой карты.",excluded_items:"{number} исключено {if number is 1} элемент {else} элементов",hide_excluded:"скрыть исключенные элементы",additional_tasks:"{number} больше {if number is 1} задача {else} задач",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Выберите временной слот",toggle_single_mode:"В простой режим",toggle_scheme_mode:"В режим схемы",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"период",start_date:"From",end_date:"To"},repeat_type:"поведение после срабатывания",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Ei={services:zi,ui:Ci},Ai=Object.freeze({__proto__:null,services:zi,ui:Ci,default:Ei}),Di={generic:{turn_on:"Zapnúť",turn_off:"Vypnúť",parameter_to_value:"{parameter} na {value}",action_with_parameter:"{action} s {parameter}"},climate:{set_temperature:"nastaviť teplotu[ na {temperature}]",set_temperature_hvac_mode_heat:"vykurovanie[ na {temperature}]",set_temperature_hvac_mode_cool:"chladenie[ na {temperature}]",set_temperature_hvac_mode_heat_cool:"vykurovanie/chladenie[ na {temperature}]",set_temperature_hvac_mode_heat_cool_range:"vykurovanie/chladenie[ na {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"automatika[ na {temperature}]",set_hvac_mode:"nastaviť režim[ na {hvac_mode}]",set_preset_mode:"nastaviť predvoľbu[ {preset_mode}]",set_fan_mode:"nastaviť režim ventilátora[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"zatvoriť",open_cover:"otvoriť",set_cover_position:"nastaviť polohu[ na {position}]",set_cover_tilt_position:"nastaviť naklonenie[ na {tilt_position}]"},fan:{set_percentage:"nastaviť rýchlosť[ na {speed}]",set_direction:"nastaviť smer[ na {direction}]",oscillate:"nastaviť osciláciu[ na {oscillate}]"},humidifier:{set_humidity:"nastaviť vlhkosť[ na {humidity}]",set_mode:"nastaviť režim[ na {mode}]"},input_number:{set_value:"nastaviť hodnotu[ na {value}]"},input_select:{select_option:"vybrať možnosť[ {option}]"},select:{select_option:"vybrať možnosť[ {option}]"},light:{turn_on:"zapnúť[ na {brightness} jas]"},media_player:{select_source:"vybrať zdroj[ {source}]"},notify:{send_message:"poslať notifikáciu"},script:{execute:"spustiť"},vacuum:{start_pause:"štart / pauza"},water_heater:{set_operation_mode:"nastaviť režim[ na {operation_mode}]",set_away_mode:"nastaviť režim neprítomnosti"}},Ti={components:{date:{day_types_short:{daily:"denne",workdays:"pracovné dni",weekend:"víkendy"},day_types_long:{daily:"každý deň",workdays:"cez pracovné dni",weekend:"cez víkend"},days:"dni",tomorrow:"zajtra",repeated_days:"každý {days}",repeated_days_except:"každý deň okrem {excludedDays}",days_range:"od {startDay} do {endDay}",next_week_day:"budúcu {weekday}"},time:{absolute:"od {time}",interval:"od {startTime} do {endTime}",at_midnight:"od polnoci",at_noon:"od obeda",at_sun_event:"na {sunEvent}"}},dialog:{enable_schedule:{title:"Dokončite úpravy",description:"Plán, ktorý sa zmenil, je momentálne zakázaný, chcete ho povoliť?"},confirm_delete:{title:"Odstrániť entitu?",description:"Naozaj chcete odstrániť túto entitu?"},confirm_migrate:{title:"Aktualizovať plán",description:"Touto akciou sa stratia niektoré nastavenia. Chcete pokračovať?"},weekday_picker:{title:"Dni opakovania pre plán",choose:"Vyberte..."},entity_picker:{title:"Vyberte entity",choose:"Vyberte...",no_results:"Žiadne vyhovujúce položky neboli nájdené"},action_picker:{title:"Vyberte akciu",show_all:"Zobraziť všetky podporované entity"}},panel:{common:{title:"Plánovač",new_schedule:"Nový plán",default_name:"Plán #{id}"},overview:{no_entries:"Žiadne položky na zobrazenie",backend_error:"Nepodarilo sa pripojiť ku komponentu Scheduler. Pred tým, ako použijete túto kartu ho musíte nainštalovať ako integráciu.",excluded_items:"Vylúčené položky: {number}",hide_excluded:"skryť vylúčené položky",additional_tasks:"Ďalšie úlohy: {number}",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Dni opakovania",start_time:"Čas začiatku",stop_time:"Čas konca",action:"Akcia",add_action:"Pridať akciu",select_timeslot:"Najprv vyberte časový úsek",toggle_single_mode:"Do režimu jedného",toggle_scheme_mode:"Do režimu schémy",validation_errors:{overlapping_time:"Plán obsahuje prekrývajúce sa časové intervaly",missing_target_entity:"Pre aspoň jednu akciu nie je zadaná cieľová entita",missing_service_parameter:"Pre aspoň jednu akciu nie je zadané vyžadované nastavenie",missing_action:"Plán neobsahuje žiadne akcie"}},options:{conditions:{header:"Podmienky",add_condition:"Pridať podmienku",new_condition:"Nová podmienka",types:{equal_to:"{entity} sa rovná {value}",unequal_to:"{entity} sa nerovná {value}",above:"{entity} je nad {value}",below:"{entity} je pod {value}"},options:{logic_and:"Všetky podmienky musia platiť",logic_or:"Akákoľvek podmienka musí platiť",track_changes:"Prehodnoťte, keď sa zmenia podmienky"}},period:{header:"Obdobie",start_date:"Od",end_date:"Do"},repeat_type:"správanie sa po spustení",tags:"Štítky"},card_editor:{tabs:{entities:"Entity",other:"Iné"},fields:{title:{heading:"Názov karty",options:{standard:"štandardné",hidden:"skryté",custom:"vlastné"},custom_title:"Vlastný názov"},discover_existing:{heading:"Zobraziť všetky plány",description:"Tým sa nastaví parameter „objaviť existujúce“. Predtým vytvorené plány sa automaticky pridajú na kartu."},time_step:{heading:"Časový krok",description:"Rozlíšenie (v minútach) pre vytváranie plánov",unit_minutes:"min"},default_editor:{heading:"Predvolený editor času",options:{single:"Režim jedného plánu",scheme:"Režim schémy"}},sort_by:{heading:"Možnosti triedenia",description:"Poradie, v akom sa rozvrhy zobrazujú na karte",options:{relative_time:"Zostávajúci čas do ďalšej akcie",title:"Zobrazený názov rozvrhu",state:"Zobraziť aktívne plány navrchu"}},display_format_primary:{heading:"Zobrazené primárne informácie",description:"V prehľade nakonfigurujte, ktorý štítok sa použije pre plány",options:{default:"Názov rozvrhu",entity_action:"Zhrnutie úlohy"}},display_format_secondary:{heading:"Zobrazené sekundárne informácie",description:"Nakonfigurujte, ktoré ďalšie vlastnosti sú viditeľné v prehľade",options:{relative_time:"Zostávajúci čas do ďalšej akcie",time:"Nastavený čas pre ďalšiu akciu",days:"Opakované dni v týždni",additional_tasks:"Počet dodatočných úloh"}},show_header_toggle:{heading:"Zobraziť prepínač hlavičky",description:"Zobraziť prepínač v hornej časti karty na povolenie/zakázanie všetkých entít"},show_toggle_switches:{heading:"Zobraziť prepínače",description:"Zobraziť prepínač pre každý jednotlivý harmonogram na karte"},tags:{heading:"Štítky",description:"Použite štítky na rozdelenie plánov medzi viacero kariet"},entities:{button_label:"Konfigurácia zahrnutých entít",heading:"Zahrnuté entity",description:"Vyberte entity, ktoré chcete ovládať pomocou plánovača. Kliknutím na skupinu ju otvoríte. Upozorňujeme, že niektoré entity (napríklad senzory) možno použiť iba na podmienky, nie na akcie.",included_number:"{number}/{total} vybraný"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Mi={services:Di,ui:Ti},Pi={generic:{turn_on:"Vklopi",turn_off:"Izklopi",parameter_to_value:"{parameter} v {value}",action_with_parameter:"{action} z {parameter}"},climate:{set_temperature:"nastavi temperaturo[ na {temperature}]",set_temperature_hvac_mode_heat:"ogrej[ na {temperature}]",set_temperature_hvac_mode_cool:"ohladi[ na {temperature}]",set_temperature_hvac_mode_heat_cool:"ogrej/ohladi[ na {temperature}]",set_temperature_hvac_mode_heat_cool_range:"ogrej/ohladi[ na {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"samodejno[ na {temperature}]",set_hvac_mode:"nastavi način[ na {hvac_mode}]",set_preset_mode:"nastavi preset[ na {preset_mode}]",set_fan_mode:"nastavi ventilator[ na {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"zapri",open_cover:"odpri",set_cover_position:"nastavi pozicijo[ na {position}]",set_cover_tilt_position:"nastavi naklon[ na {tilt_position}]"},fan:{set_percentage:"nastavi hitrost[ na {speed}]",set_direction:"nastavi smer[ na {direction}]",oscillate:"nastavi obračanje[ na {oscillate}]"},humidifier:{set_humidity:"nastavi vlažnost[ na {humidity}]",set_mode:"nastavi način[ na {mode}]"},input_number:{set_value:"nastavi vrednost[ na {value}]"},input_select:{select_option:"izberi možnost[ {option}]"},select:{select_option:"izberi možnost[ {option}]"},light:{turn_on:"vključi[ z {brightness} brightness]"},media_player:{select_source:"Izberi vir[ {source}]"},notify:{send_message:"pošlji sporočilo"},script:{execute:"izvedi"},vacuum:{start_pause:"zaženi / ustavi"},water_heater:{set_operation_mode:"nastavi način[ na {operation_mode}]",set_away_mode:"nastavi način odsoten"}},Li={components:{date:{day_types_short:{daily:"dnevno",workdays:"delovniki",weekend:"vikend"},day_types_long:{daily:"vsak dan",workdays:"ob delovnikih",weekend:"ob vikendih"},days:"dni",tomorrow:"jutri",repeated_days:"vsakih {days}",repeated_days_except:"vsak dan razen {excludedDays}",days_range:"od {startDay} do {endDay}",next_week_day:"naslednji {weekday}"},time:{absolute:"ob {time}",interval:"od {startTime} do {endTime}",at_midnight:"opolnoči",at_noon:"opoldne",at_sun_event:"ob {sunEvent}"}},dialog:{enable_schedule:{title:"Zaključi spremembe",description:"Urnik, katerega ste spremenili je trenutno izključen, ali ga želite omogočiti?"},confirm_delete:{title:"Ali želite odstraniti entiteto?",description:"Ali ste prepričani, da želite odstraniti to entiteto?"},confirm_migrate:{title:"Spremenite urnik",description:"Nekatere nastavitve bodo s tem dejanjem izgubljene. Želite nadaljevati?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Urnik",new_schedule:"Nov urnik",default_name:"Urnik #{id}"},overview:{no_entries:"Ni vpisov za prikaz",backend_error:"Ni povezave s komponento urnika. Komponenta mora biti nameščena kot integracija, preden lahko uporabite to kartico.",excluded_items:"{number}{if number is 1} izločen predmet {else} izločenih predmetov",hide_excluded:"skrij izločene predmete",additional_tasks:"še {number}{if number is 1} opravilo {else} opravil",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Najprej izberi časovni okvir",toggle_single_mode:"To single mode",toggle_scheme_mode:"To scheme mode",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Ponovno preglej ko se pogoji spremenijo"}},period:{header:"Perioda",start_date:"From",end_date:"To"},repeat_type:"obnašanje, ko končaš",tags:"Tags"},card_editor:{tabs:{entities:"Entitete",other:"Ostalo"},fields:{title:{heading:"Ime kartice",options:{standard:"standardno",hidden:"skrito",custom:"po meri"},custom_title:"Ime po želji"},discover_existing:{heading:"Prikaži vse urnike",description:"Tole nastavi parameter 'discover existing'. Prej kreirani urniki bodo samodejno dodani v kartico. "},time_step:{heading:"Časovni korak",description:"Ločljivost (v minutah) za kreiranje urnikov",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"V enojni način",scheme:"V shematski način"}},sort_by:{heading:"Možnosti sortiranja",description:"Zaporedje, po katerem se prikažejo urniki na kartici",options:{relative_time:"Preostali čas do naslednje akcije",title:"Prikazano ime urnika",state:"Prikaži aktivne urnike na vrhu"}},display_format_primary:{heading:"Prikazane primarne informacije",description:"Nastavite, kaj se prikazuje v pregledu urnikov",options:{default:"Ime urnika",entity_action:"Povzetek operacije"}},display_format_secondary:{heading:"Prikazane sekundarne informacije",description:"Nastavite, katere dodatne informacije želite imeti prikazane v pregledu",options:{relative_time:"Preostali čas do naslednje akcije",time:"Nastavljen čas za naslednjo akcijo",days:"Katere dni/kdaj se sproži akcija",additional_tasks:"Število dodatnih opravil"}},show_header_toggle:{heading:"Prikaži glavo",description:"Na vrhu prikaže stikalo, s katerim lahko omogočite/izključite vse entitete naenkrat"},show_toggle_switches:{heading:"Prikaži stikala",description:"Prikaži stikalo za vsak posamezen urnik na kartici"},tags:{heading:"Tag-i",description:"Uporabite tag-e za ločevanje urnikov med več karticami"},entities:{button_label:"Konfiguriraj vključene entitete",heading:"Vključene entitete",description:"Izberite entitete, katere želike krmiliti s tem urnikom. Lahko kliknete na skupino, da jo odprete. Vedite, da lahko nekatere entitete (npr. senzorje) uporabite samo v pogojih, ne pa za akcije.",included_number:"{number}/{total} izbranih"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Ni={services:Pi,ui:Li},Ii={generic:{turn_on:"Slå på",turn_off:"Stäng av",parameter_to_value:"{parameter} till {value}",action_with_parameter:"{action} med {parameter}"},climate:{set_temperature:"ställ in temperaturen[ på {temperature}]",set_temperature_hvac_mode_heat:"värma[ till {temperature}]",set_temperature_hvac_mode_cool:"kyla[ till {temperature}]",set_temperature_hvac_mode_heat_cool:"värma/kyla[ till {temperature}]",set_temperature_hvac_mode_heat_cool_range:"värma/kyla[ till {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"auto[ till {temperature}]",set_hvac_mode:"ställ in läget[ till {hvac_mode}]",set_preset_mode:"ställ in förinställningen[ till {preset_mode}]",set_fan_mode:"ställ in fläktläge[ till {fan_mode}]",set_swing_mode:"ställ in svängningsläge[ till {swing_mode}]"},cover:{close_cover:"stäng",open_cover:"öppna",set_cover_position:"ställ in positionen[ till {position}]",set_cover_tilt_position:"ställ in lutningsposition[ till {tilt_position}]"},fan:{set_percentage:"ställ in hastighet[ till {percentage}]",set_direction:"ställ in riktning[ till {direction}]",oscillate:"ställ in oscillation[ till {oscillate}]"},humidifier:{set_humidity:"ställ in luftfuktighet[ till {humidity}]",set_mode:"ställ in läge[ till {mode}]"},input_number:{set_value:"ställ in den[ till {value}]"},input_select:{select_option:"välj alternativ[ {option}]"},select:{select_option:"välj alternativ[ {option}]"},light:{turn_on:"slå på[ med {brightness} brightness]"},media_player:{select_source:"välj källa[ {source}]"},notify:{send_message:"send notification"},script:{execute:"utföra"},vacuum:{start_pause:"starta / pausa"},water_heater:{set_operation_mode:"ställ in läget[ till {operation_mode}]",set_away_mode:"ställ in borta läget"}},Ri={components:{date:{day_types_short:{daily:"daglig",workdays:"arbetsdagar",weekend:"helgen"},day_types_long:{daily:"varje dag",workdays:"på arbetsdagar",weekend:"i helgen"},days:"dagar",tomorrow:"imorgon",repeated_days:"varje {days}",repeated_days_except:"varje dag utom {excludedDays}",days_range:"från {startDay} till {endDay}",next_week_day:"nästa {weekday}"},time:{absolute:"kl. {time}",interval:"från {startTime} till {endTime}",at_midnight:"vid midnatt",at_noon:"vid middagstid",at_sun_event:"vid {sunEvent}"}},dialog:{enable_schedule:{title:"Slutför modifieringar",description:"Schemat du har ändrat är för närvarande inaktiverat, vill du aktivera den?"},confirm_delete:{title:"Ta bort enheten?",description:"Är du säker på att du vill ta bort den här enheten?"},confirm_migrate:{title:"Uppdatera schema",description:"Vissa inställningar kommer att gå förlorade genom den här ändringen. Vill du fortsätta?"},weekday_picker:{title:"Upprepade dagar för schema",choose:"Välj..."},entity_picker:{title:"Välj enheter",choose:"Välj...",no_results:"Inga matchande objekt hittades"},action_picker:{title:"Välj åtgärd",show_all:"Visa alla enheter som stöds"}},panel:{common:{title:"Schemaläggare",new_schedule:"Ny schema",default_name:"Schema #{id}"},overview:{no_entries:"Det finns inga objekt att visa",backend_error:"Kunde inte ansluta till schemaläggarkomponenten. Den måste installeras som integration innan det här kortet kan användas.",excluded_items:"{number} utesluten {if number is 1} artikel {else} artiklar",hide_excluded:"dölj uteslutna objekt",additional_tasks:"{number} mer {if number is 1} uppgift {else} uppgifter",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Upprepade dagar",start_time:"Starttid",stop_time:"Sluttid",action:"Åtgärd",add_action:"Lägg till åtgärd",select_timeslot:"Välj en tidslucka",toggle_single_mode:"Till enkelläge",toggle_scheme_mode:"Till schemaläge",validation_errors:{overlapping_time:"Schemat har överlappande tidsluckor",missing_target_entity:"En eller flera åtgärder saknar en målentitet",missing_service_parameter:"En eller flera åtgärder saknar en obligatorisk inställning",missing_action:"Schemat har inga åtgärder"}},options:{conditions:{header:"Villkor",add_condition:"Lägg till villkor",new_condition:"Nytt villkor",types:{equal_to:"{entity} är lika med {value}",unequal_to:"{entity} är ojämlik med {value}",above:"{entity} är över {value}",below:"{entity} är under {value}"},options:{logic_and:"Alla villkor måste vara sanna",logic_or:"Något av villkoren måste vara sant",track_changes:"Omvärdera när förutsättningarna förändras"}},period:{header:"Period",start_date:"Från",end_date:"Till"},repeat_type:"beteende efter avslutad",tags:"Taggar"},card_editor:{tabs:{entities:"Enheter",other:"Andra"},fields:{title:{heading:"Kortets titel",options:{standard:"standard",hidden:"dold",custom:"anpassad"},custom_title:"Anpassad titel"},discover_existing:{heading:"Visa alla scheman",description:"Detta ställer in parametern ''upptäck befintliga''. Tidigare skapade scheman läggs automatiskt till på kortet."},time_step:{heading:"Tidssteg",description:"Upplösning (i minuter) för att skapa scheman",unit_minutes:"min"},default_editor:{heading:"Standard tidsredigerare",options:{single:"Enkelt schemalagt läge",scheme:"Tidschemaläge"}},sort_by:{heading:"Sorteringsalternativ",description:"Ordning i vilken scheman visas på kortet",options:{relative_time:"Tid kvar till nästa åtgärd",title:"Visad titel på schemat",state:"Visa aktiva scheman överst"}},display_format_primary:{heading:"Visad primär information",description:"Konfigurera vilken etikett som används för scheman i översikten",options:{default:"Schemanamn",entity_action:"Sammanfattning av uppgiften"}},display_format_secondary:{heading:"Visad sekundär information",description:"Konfigurera vilka ytterligare egenskaper som ska synas i översikten",options:{relative_time:"Tid kvar till nästa åtgärd",time:"Konfigurerad tid för nästa åtgärd",days:"Upprepade dagar i veckan",additional_tasks:"Antal ytterligare uppgifter"}},show_header_toggle:{heading:"Visa rubrikväxling",description:"Visa växlingsknappen högst upp på kortet för att aktivera/inaktivera alla enheter"},show_toggle_switches:{heading:"Visa växlingsknappar",description:"Visa växlingsknappen för varje enskilt schema i kortet"},tags:{heading:"Taggar",description:"Använd taggar för att dela upp scheman mellan flera kort"},entities:{button_label:"Konfigurera inkluderade entiteter",heading:"Inkluderade enheter",description:"Välj de enheter som du vill styra med hjälp av schemaläggaren. Du kan klicka på en grupp för att öppna den. Observera att vissa enheter (t.ex. sensorer) bara kan användas för villkor, inte för åtgärder.",included_number:"{number}/{total} vald"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Hi={services:Ii,ui:Ri},qi={generic:{turn_on:"Ввімкнути",turn_off:"Вимкнути",parameter_to_value:"{parameter} до {value}",action_with_parameter:"{action} з {parameter}"},climate:{set_temperature:"встановити температуру[ to {temperature}]",set_temperature_hvac_mode_heat:"нагрів[ to {temperature}]",set_temperature_hvac_mode_cool:"охолодження[ to {temperature}]",set_temperature_hvac_mode_heat_cool:"нагрів/охолодження[ to {temperature}]",set_temperature_hvac_mode_heat_cool_range:"нагрів/охолодження[ to {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"aвтоматичний[ to {temperature}]",set_hvac_mode:"встановити режим[ to {hvac_mode}]",set_preset_mode:"вибрати пресет[ to {preset_mode}]",set_fan_mode:"set fan mode[ to {fan_mode}]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"закрити",open_cover:"відкрити",set_cover_position:"встановити позицію[ to {position}]",set_cover_tilt_position:"set tilt position[ to {tilt_position}]"},fan:{set_percentage:"встановити швидкість[ to {speed}]",set_direction:"встановити напрямок[ to {direction}]",oscillate:"встановити коливання[ to {oscillate}]"},humidifier:{set_humidity:"встановити вологість[ to {humidity}]",set_mode:"встановити режим[ to {mode}]"},input_number:{set_value:"встановити значення[ to {value}]"},input_select:{select_option:"встановити опцію[ {option}]"},select:{select_option:"встановити опцію[ {option}]"},light:{turn_on:"увімкнути[ з {brightness} якскравістю]"},media_player:{select_source:"вибрати джерело[ {source}]"},notify:{send_message:"send notification"},script:{execute:"виконати"},vacuum:{start_pause:"старт / пауза"},water_heater:{set_operation_mode:"встановити режим[ to {operation_mode}]",set_away_mode:"встановити режим Не вдома"}},Vi={components:{date:{day_types_short:{daily:"щоденно",workdays:"робочі дні",weekend:"вихідні"},day_types_long:{daily:"кожного дня",workdays:"в робочі дні",weekend:"по вихідних"},days:"дні",tomorrow:"завтра",repeated_days:"кожні {days}",repeated_days_except:"кожного дня окрім {excludedDays}",days_range:"з {startDay} до {endDay}",next_week_day:"наступної {weekday}"},time:{absolute:"о {time}",interval:"з {startTime} до {endTime}",at_midnight:"опівночі",at_noon:"опівдні",at_sun_event:"о {sunEvent}"}},dialog:{enable_schedule:{title:"Завершіть зміни",description:"Розклад, який було змінено, наразі вимкнено, чи потрібно його ввімкнути?"},confirm_delete:{title:"Видалити сутність?",description:"Ви дійсно бажаєте видалити цю сутність?"},confirm_migrate:{title:"Змінити розклад",description:"У результаті цієї дії деякі налаштування буде втрачено. Ви бажаєте продовжити?"},weekday_picker:{title:"Repeated days for schedule",choose:"Choose..."},entity_picker:{title:"Choose entities",choose:"Choose...",no_results:"No matching items found"},action_picker:{title:"Choose action",show_all:"Show all supported entities"}},panel:{common:{title:"Планувальник",new_schedule:"Новий розклад",default_name:"Розклад #{id}"},overview:{no_entries:"Елементи відсутні",backend_error:"Не вдалося підключитися до компонента планувальника. Перш ніж використовувати цю карту, її потрібно встановити як інтеграцію.",excluded_items:"{number} виключено {if number is 1} елемент {else} елементів",hide_excluded:"сховати виключені елементи",additional_tasks:"{number} більше {if number is 1} завдання {else} завдань",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"Repeated days",start_time:"Start time",stop_time:"End time",action:"Action",add_action:"Add action",select_timeslot:"Спершу виберіть часовий проміжок",toggle_single_mode:"До одиночного режиму",toggle_scheme_mode:"До схемного режиму",validation_errors:{overlapping_time:"Schedule has overlapping timeslots",missing_target_entity:"One or more actions are missing a target entity",missing_service_parameter:"One or more actions are missing a required setting",missing_action:"Schedule has no actions"}},options:{conditions:{header:"Conditions",add_condition:"Add condition",new_condition:"New condition",types:{equal_to:"{entity} is equal to {value}",unequal_to:"{entity} is unequal to {value}",above:"{entity} is above {value}",below:"{entity} is below {value}"},options:{logic_and:"All conditions must be true",logic_or:"Any condition must be true",track_changes:"Re-evaluate when conditions change"}},period:{header:"період",start_date:"From",end_date:"To"},repeat_type:"поведінка після спрацювання",tags:"Tags"},card_editor:{tabs:{entities:"Entities",other:"Other"},fields:{title:{heading:"Title of the card",options:{standard:"standard",hidden:"hidden",custom:"custom"},custom_title:"Custom title"},discover_existing:{heading:"Show all schedules",description:"This sets the 'discover existing' parameter. Previously created schedules will be automatically added to the card. "},time_step:{heading:"Time step",description:"Resolution (in minutes) for creating schedules",unit_minutes:"min"},default_editor:{heading:"Default time editor",options:{single:"Single schedule mode",scheme:"Time scheme mode"}},sort_by:{heading:"Sorting options",description:"Order in which the schedules appear in the card",options:{relative_time:"Time remaining until next action",title:"Displayed title of the schedule",state:"Show active schedules on top"}},display_format_primary:{heading:"Displayed primary info",description:"Configure which label is used for schedules in the overview",options:{default:"Schedule name",entity_action:"Summary of task"}},display_format_secondary:{heading:"Displayed secondary info",description:"Configure what additional properties are visible in the overview",options:{relative_time:"Time remaining until next action",time:"Configured time for next action",days:"Repeated days of the week",additional_tasks:"Number of additional tasks"}},show_header_toggle:{heading:"Show header toggle",description:"Show toggle switch at the top of the card for enabling/disabling all entities"},show_toggle_switches:{heading:"Show toggle switches",description:"Show toggle switch for each individual schedule in the card"},tags:{heading:"Tags",description:"Use tags to divide schedules between multiple cards"},entities:{button_label:"Configure included entities",heading:"Included entities",description:"Select the entities that you want to control using the scheduler. You can click on a group to open it. Note that some entities (such as sensors) can only be used for conditions, not for actions.",included_number:"{number}/{total} selected"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Fi={services:qi,ui:Vi},Bi={generic:{turn_on:"پر سوئچ کریں",turn_off:"بند کر دیں",parameter_to_value:"{parameter} کو {value} پر سیٹ کریں",action_with_parameter:"{parameter} کے ساتھ {action}"},climate:{set_temperature:"درجہ حرارت سیٹ کریں[ {temperature} پر]",set_temperature_hvac_mode_heat:"ہیٹ[ {temperature} پر]",set_temperature_hvac_mode_cool:"کول[ {temperature} پر]",set_temperature_hvac_mode_heat_cool:"ہیٹ/کول[ {temperature} پر]",set_temperature_hvac_mode_heat_cool_range:"ہیٹ/کول[ {target_temp_low} سے {target_temp_high} تک]",set_temperature_hvac_mode_auto:"آٹو[ {temperature} پر]",set_hvac_mode:"موڈ سیٹ کریں[ {hvac_mode} پر]",set_preset_mode:"پری سیٹ موڈ سیٹ کریں[ {preset_mode} پر]",set_fan_mode:"فین موڈ سیٹ کریں[ {fan_mode} پر]",set_swing_mode:"set swing mode[ to {swing_mode}]"},cover:{close_cover:"بند کریں",open_cover:"کھولیں",set_cover_position:"پوزیشن سیٹ کریں[ {position} پر]",set_cover_tilt_position:"جھکاؤ پوزیشن سیٹ کریں[ {tilt_position} پر]"},fan:{set_percentage:"رفتار سیٹ کریں[ {percentage} پر]",set_direction:"سمت سیٹ کریں[ {direction} پر]",oscillate:"آسیلیشن سیٹ کریں[ {oscillate} پر]"},humidifier:{set_humidity:"نمی سیٹ کریں[ {humidity} پر]",set_mode:"موڈ سیٹ کریں[ {mode} پر]"},input_number:{set_value:"ویلیو سیٹ کریں[ {value} پر]"},input_select:{select_option:"آپشن منتخب کریں[ {option}]"},select:{select_option:"آپشن منتخب کریں[ {option}]"},light:{turn_on:"آن کریں[ {brightness} چمک کے ساتھ]"},media_player:{select_source:"سورس منتخب کریں[ {source}]"},notify:{send_message:"نوٹیفکیشن بھیجیں"},script:{execute:"چلائیں"},vacuum:{start_pause:"شروع / روکیں"},water_heater:{set_operation_mode:"موڈ سیٹ کریں[ {operation_mode} پر]",set_away_mode:"غیر موجودگی کا موڈ سیٹ کریں"}},Wi={components:{date:{day_types_short:{daily:"روزانہ",workdays:"کام کے دن",weekend:"ہفتہ اختتام"},day_types_long:{daily:"ہر دن",workdays:"کام کے دنوں میں",weekend:"ہفتے کے آخر میں"},days:"دن",tomorrow:"کل",repeated_days:"ہر {days}",repeated_days_except:"ہر دن سوائے {excludedDays}",days_range:"{startDay} سے {endDay} تک",next_week_day:"اگلا {weekday}"},time:{absolute:"{time} پر",interval:"{startTime} سے {endTime} تک",at_midnight:"آدھی رات کو",at_noon:"دوپہر کو",at_sun_event:"{sunEvent} کے وقت"}},dialog:{enable_schedule:{title:"ترمیم مکمل کریں",description:"جو شیڈول آپ نے بدلا ہے وہ اس وقت غیر فعال ہے، کیا آپ اسے فعال کرنا چاہتے ہیں؟"},confirm_delete:{title:"اینٹیٹی حذف کریں؟",description:"کیا آپ واقعی اس اینٹیٹی کو حذف کرنا چاہتے ہیں؟"},confirm_migrate:{title:"شیڈول اپ ڈیٹ کریں",description:"اس تبدیلی سے کچھ سیٹنگز ضائع ہو سکتی ہیں۔ کیا آپ جاری رکھنا چاہتے ہیں؟"},weekday_picker:{title:"شیڈول کے لیے دہرائے گئے دن",choose:"منتخب کریں..."},entity_picker:{title:"اینٹیٹیز منتخب کریں",choose:"منتخب کریں...",no_results:"کوئی مماثل آئٹمز نہیں ملے"},action_picker:{title:"عمل منتخب کریں",show_all:"تمام تعاون یافتہ اداروں کو دکھائیں۔"}},panel:{common:{title:"شیڈولر",new_schedule:"نیا شیڈول",default_name:"شیڈول #{id}"},overview:{no_entries:"دکھانے کے لیے کوئی آئٹمز نہیں ہیں",backend_error:"شیڈولر کمپوننٹ سے کنکشن نہیں ہو سکا۔ اسے کارڈ استعمال کرنے سے پہلے انٹیگریشن کے طور پر انسٹال کرنا ضروری ہے۔",excluded_items:"{number} خارج شدہ {if number is 1} آئٹم {else} آئٹمز",hide_excluded:"خارج شدہ آئٹمز چھپائیں",additional_tasks:"{number} مزید {if number is 1} کام {else} کام",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"دہرائے گئے دن",start_time:"آغاز کا وقت",stop_time:"اختتامی وقت",action:"عمل",add_action:"عمل شامل کریں",select_timeslot:"ٹائم سلاٹ منتخب کریں",toggle_single_mode:"سنگل موڈ پر جائیں",toggle_scheme_mode:"اسکیم موڈ پر جائیں",validation_errors:{overlapping_time:"شیڈول میں وقتوں کا اوورلیپ ہے",missing_target_entity:"ایک یا زیادہ اعمال میں ہدف اینٹیٹی غائب ہے",missing_service_parameter:"ایک یا زیادہ اعمال میں مطلوبہ سیٹنگ غائب ہے",missing_action:"شیڈول میں کوئی عمل موجود نہیں"}},options:{conditions:{header:"شرائط",add_condition:"شرط شامل کریں",new_condition:"نئی شرط",types:{equal_to:"{entity} {value} کے برابر ہے",unequal_to:"{entity} {value} کے برابر نہیں ہے",above:"{entity} {value} سے زیادہ ہے",below:"{entity} {value} سے کم ہے"},options:{logic_and:"تمام شرائط درست ہونی چاہئیں",logic_or:"کوئی ایک شرط درست ہونی چاہیے",track_changes:"جب شرائط بدلیں تو دوبارہ جانچ کریں"}},period:{header:"مدت",start_date:"سے",end_date:"تک"},repeat_type:"مکمل ہونے کے بعد کا برتاؤ",tags:"ٹیگز"},card_editor:{tabs:{entities:"اینٹیٹیز",other:"دیگر"},fields:{title:{heading:"کارڈ کا عنوان",options:{standard:"معیاری",hidden:"چھپا ہوا",custom:"حسبِ ضرورت"},custom_title:"اپنا عنوان"},discover_existing:{heading:"تمام شیڈولز دکھائیں",description:"یہ 'discover existing' پیرامیٹر سیٹ کرتا ہے۔ پہلے سے بنائے گئے شیڈولز خود بخود کارڈ میں شامل ہو جائیں گے۔"},time_step:{heading:"وقت کا وقفہ",description:"شیڈول بنانے کے لیے وقت کی ریزولوشن (منٹ میں)",unit_minutes:"منٹ"},default_editor:{heading:"ڈیفالٹ ٹائم ایڈیٹر",options:{single:"سنگل شیڈول موڈ",scheme:"ٹائم اسکیم موڈ"}},sort_by:{heading:"ترتیب کے اختیارات",description:"کارڈ میں شیڈولز کی ترتیب",options:{relative_time:"اگلے عمل تک باقی وقت",title:"شیڈول کا دکھایا گیا عنوان",state:"فعال شیڈولز اوپر دکھائیں"}},display_format_primary:{heading:"مرکزی معلومات کی نمائش",description:"اوورویو میں شیڈولز کے لیے لیبل کنفیگر کریں",options:{default:"شیڈول کا نام",entity_action:"کام کا خلاصہ"}},display_format_secondary:{heading:"ثانوی معلومات کی نمائش",description:"اوورویو میں اضافی خصوصیات دکھانے کا انتخاب کریں",options:{relative_time:"اگلے عمل تک باقی وقت",time:"اگلے عمل کا وقت",days:"ہفتے کے دہرائے گئے دن",additional_tasks:"اضافی کاموں کی تعداد"}},show_header_toggle:{heading:"ہیڈر ٹوگل دکھائیں",description:"کارڈ کے اوپر تمام اینٹیٹیز کو فعال/غیر فعال کرنے کے لیے سوئچ دکھائیں"},show_toggle_switches:{heading:"ٹوگل سوئچز دکھائیں",description:"کارڈ میں ہر انفرادی شیڈول کے لیے ٹوگل سوئچ دکھائیں"},tags:{heading:"ٹیگز",description:"شیڈولز کو مختلف کارڈز میں تقسیم کرنے کے لیے ٹیگز استعمال کریں"},entities:{button_label:"شامل اینٹیٹیز ترتیب دیں",heading:"شامل اینٹیٹیز",description:"وہ اینٹیٹیز منتخب کریں جنہیں آپ شیڈولر کے ذریعے کنٹرول کرنا چاہتے ہیں۔ آپ گروپ پر کلک کر کے اسے کھول سکتے ہیں۔ یاد رکھیں کہ کچھ اینٹیٹیز (جیسے سینسرز) صرف شرائط کے لیے استعمال ہو سکتی ہیں، اعمال کے لیے نہیں۔",included_number:"{number}/{total} منتخب شدہ"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Ui={services:Bi,ui:Wi},Zi={generic:{turn_on:"打开",turn_off:"关闭",parameter_to_value:"{parameter} 至 {value}",action_with_parameter:"{action} 使用 {parameter}"},climate:{set_temperature:"设定温度[ 至 {temperature}]",set_temperature_hvac_mode_heat:"制热模式[ 至 {temperature}]",set_temperature_hvac_mode_cool:"制冷模式[ 至 {temperature}]",set_temperature_hvac_mode_heat_cool:"制热模式/制冷模式[ 至 {temperature}]",set_temperature_hvac_mode_heat_cool_range:"制热模式/制冷模式[ 至 {target_temp_low} - {target_temp_high}]",set_temperature_hvac_mode_auto:"自动[ 至 {temperature}]",set_hvac_mode:"设定模式[ 为 {hvac_mode}]",set_preset_mode:"设定预设模式[ 为 {preset_mode}]",set_fan_mode:"设置风扇模式[ 为 {fan_mode}]",set_swing_mode:"设置摆动模式[ 为 {swing_mode}]"},cover:{close_cover:"关闭",open_cover:"打开",set_cover_position:"设置位置[ 为 {position}]",set_cover_tilt_position:"设置倾斜位置[ 为 {tilt_position}]"},fan:{set_percentage:"设定风速[ 为 {speed}]",set_direction:"设定方向[ 为 {direction}]",oscillate:"设置摇摆[ 为 {oscillate}]"},humidifier:{set_humidity:"设定湿度[ 至 {humidity}]",set_mode:"设定模式[ 为 {mode}]"},input_number:{set_value:"设定数值[ 至 {value}]"},input_select:{select_option:"选择选项[ {option}]"},select:{select_option:"选择选项[ {option}]"},light:{turn_on:"打开[ 并设定亮度为 {brightness}]"},media_player:{select_source:"选择播放源[ {source}]"},notify:{send_message:"发送通知"},script:{execute:"执行"},vacuum:{start_pause:"开始 / 暂停"},water_heater:{set_operation_mode:"设定模式[ 为 {operation_mode}]",set_away_mode:"设定离开模式"}},Ki={components:{date:{day_types_short:{daily:"每天",workdays:"工作日",weekend:"周末"},day_types_long:{daily:"每天",workdays:"工作日",weekend:"周末"},days:"天",tomorrow:"明天",repeated_days:"每 {days}",repeated_days_except:"每天，除了 {excludedDays}",days_range:"从 {startDay} 至 {endDay}",next_week_day:"下{weekday}"},time:{absolute:"{time}",interval:"从 {startTime} 至 {endTime}",at_midnight:"午夜",at_noon:"中午",at_sun_event:"{sunEvent}"}},dialog:{enable_schedule:{title:"完成修改",description:"您修改的计划任务当前已禁用，是否需要启用？"},confirm_delete:{title:"是否删除实体？",description:"您确定要删除此实体吗？"},confirm_migrate:{title:"修改任务",description:"此操作将丢失某些设置。 你想继续吗？"},weekday_picker:{title:"重复周期",choose:"选择..."},entity_picker:{title:"选择实体",choose:"选择...",no_results:"未找到匹配项"},action_picker:{title:"选择动作",show_all:"显示所有受支持的实体"}},panel:{common:{title:"计划任务",new_schedule:"新建任务",default_name:"任务 #{id}"},overview:{no_entries:"无事项",backend_error:"计划任务组件关联失败。使用本卡片前，需先安装计划任务组件（Scheduler component）集成.",excluded_items:"其他{number}项{if number is 1}任务{else}任务",hide_excluded:"隐藏其他任务",additional_tasks:"另有{number}项{if number is 1}任务{else}任务",overview_view:"Show timeline overview",list_view:"Show list view",tap_icon_to_toggle:"Tap to turn on/off",saved:"Saved",undo:"Undo",add_schedule:"Add schedule",turn_on:"On",turn_off:"Off",brightness:"Brightness",color_temp:"Color temp",color:"Color",reset_hint:"Undo all changes made since the card was opened",today:"Today",two_days:"2 days",duplicate:"Duplicate schedule"},editor:{repeated_days:"重复周期",start_time:"开始时间",stop_time:"结束时间",action:"动作",add_action:"添加动作",select_timeslot:"选择时间段",toggle_single_mode:"切换为单次模式",toggle_scheme_mode:"切换为方案模式",validation_errors:{overlapping_time:"计划任务存在重叠的时间段",missing_target_entity:"一个或多个动作缺少目标实体",missing_service_parameter:"一个或多个操作缺少必要设置",missing_action:"计划任务未设置任何动作"}},options:{conditions:{header:"条件",add_condition:"添加条件",new_condition:"新建条件",types:{equal_to:"{entity} 等于 {value}",unequal_to:"{entity} 不等于 {value}",above:"{entity} 大于 {value}",below:"{entity} 小于 {value}"},options:{logic_and:"所有条件必须同时满足（AND）",logic_or:"任意一个条件满足（OR）",track_changes:"当条件变化时重新判断"}},period:{header:"生效时段",start_date:"从",end_date:"到"},repeat_type:"任务完成后的行为",tags:"标签"},card_editor:{tabs:{entities:"实体",other:"其他"},fields:{title:{heading:"卡片标题",options:{standard:"标准",hidden:"隐藏",custom:"自定义"},custom_title:"自定义标题"},discover_existing:{heading:"显示所有计划任务",description:"这将设置‘发现已有任务(discover existing)’参数。已创建的任务会自动添加到卡片中。 "},time_step:{heading:"时间调整步长",description:"创建计划任务时，时间选择器每次点击增加或减少的分钟数",unit_minutes:"分钟"},default_editor:{heading:"新建任务默认模式",options:{single:"单次任务模式",scheme:"时间方案模式"}},sort_by:{heading:"排序方式",description:"计划任务在卡片中的显示顺序",options:{relative_time:"按距离下次执行时间排序",title:"按任务标题排序",state:"优先显示已启用的任务"}},display_format_primary:{heading:"显示的主要信息",description:"设置卡片中显示任务的主要信息",options:{default:"任务名称",entity_action:"任务概要"}},display_format_secondary:{heading:"显示的次要信息",description:"设置卡片中显示任务的次要信息",options:{relative_time:"下次执行的剩余时间",time:"下次执行的设定时间",days:"重复周期（星期）",additional_tasks:"额外任务数量"}},show_header_toggle:{heading:"显示标题开关",description:"在卡片顶部显示切换开关，用于启用/禁用所有实体"},show_toggle_switches:{heading:"显示切换开关",description:"为卡片中的每个单独计划显示切换开关"},tags:{heading:"标签",description:"使用标签可将不同的计划任务分配到多个卡片中"},entities:{button_label:"配置包含的实体（配置后未选择的实体相关任务将会隐藏）",heading:"包含的实体",description:"选择您希望通过计划任务控制的实体。您可以点击一个分组将其展开。请注意，部分实体（例如传感器）只能用作触发条件，而不能作为执行动作。",included_number:"已选择 {number}/{total}"},default_view:{heading:"Default view",options:{overview:"Timeline overview",list:"List"}},show_view_toggle:{heading:"Show view switcher"},show_clock:{heading:"Show clock in header"},overview_editing:{heading:"Edit from the timeline"},show_quick_add:{heading:"Quick add row"}}}}},Xi={services:Zi,ui:Ki};const Gi={bg:ot,ca:lt,cs:pt,de:vt,el:wt,en:St,es:Ct,et:Tt,es_419:Ct,fi:Nt,fr:qt,he:Wt,hu:Xt,it:Qt,lv:si,nb:hi,nl:ri,nn:hi,no:hi,pl:_i,pt:bi,"pt-BR":xi,ro:Oi,sk:Object.freeze({__proto__:null,services:Di,ui:Ti,default:Mi}),sl:Object.freeze({__proto__:null,services:Pi,ui:Li,default:Ni}),sv:Object.freeze({__proto__:null,services:Ii,ui:Ri,default:Hi}),ru:Ai,uk:Object.freeze({__proto__:null,services:qi,ui:Vi,default:Fi}),ur:Object.freeze({__proto__:null,services:Bi,ui:Wi,default:Ui}),"zh-Hans":Object.freeze({__proto__:null,services:Zi,ui:Ki,default:Xi})};function Yi(e,t,i=[],s=[]){let a;try{a=e.split(".").reduce((e,t)=>e[t],Gi[t.locale.language]),a||(a=e.split(".").reduce((e,t)=>e[t],Gi.en))}catch(t){try{a=e.split(".").reduce((e,t)=>e[t],Gi.en)}catch(e){a=""}}if(i=[i||[]].flat(),s=[s||[]].flat(),i.length&&s.length&&a)for(let e=0;e<i.length;e++){a=a.replace(String(i[e]),String(s[e]));const t=a.match(/\{if ([a-z]+) is ([^\}]+)\}\ ?([^\{]+)\ ?\{else\}\ ?([^\{]+)/i);if(t&&String(i[e]).replace(/[\{\}']+/g,"")==t[1]){a=String(s[e])==t[2]?a.replace(t[0],t[3]):a.replace(t[0],t[4])}}const o=/\[([^\]]+)\]/.exec(a);if(o){a=/\{([^\}]+)\}/.exec(o[1])?a.replace(o[0],""):a.replace(o[0],o[1])}return a||console.log("missing translation for "+e),a}const Ji=e=>e.split(".")[1]||"",Qi=e=>e.split(".")[0]||"",es=(e,t)=>{var i;return void 0===(null==t?void 0:t.friendly_name)?Ji(e).replace(/_/g," "):(null!==(i=null==t?void 0:t.friendly_name)&&void 0!==i?i:"").toString()};function ts(e,t){let i=!1;if(!t)return!1;if(e.match(/^[a-z0-9_\.]+$/))i=!e.includes(".")&&t.includes(".")?e==Qi(t):e==t;else try{if(e.startsWith("/")&&e.endsWith("/")||-1!==e.indexOf("*")){e.startsWith("/")||(e=`/^${e=e.replace(/\./g,".").replace(/\*/g,".*")}$/`);i=new RegExp(e.slice(1,-1)).test(t)}}catch(e){}return i}const is=(e,t)=>e.includes(".")?((t.include||Be).some(t=>ts(t,e))||Object.keys(t.customize||{}).some(t=>ts(t,e)))&&!(t.exclude||[]).some(t=>ts(t,e)):((t.include||Be).map(Qi).some(t=>ts(t,e))||Object.keys(t.customize||{}).map(Qi).some(t=>ts(t,e)))&&!(t.exclude||[]).some(t=>ts(t,e)),ss=(e,t)=>{var i,s;let a=[],o=!0;if(e.entries.forEach(e=>{e.slots.forEach(e=>{e.actions.forEach(e=>{var t;let i=(null===(t=e.target)||void 0===t?void 0:t.entity_id)?[e.target.entity_id].flat():[e.service];a=[...a,...i]})})}),![...new Set(a)].every(e=>is(e,t)))return!1;const n=[t.tags||[]].flat();n.length&&(o=!1,((e.tags||[]).some(e=>n.includes(e))||n.includes("none")&&!(null===(i=e.tags)||void 0===i?void 0:i.length)||n.includes("enabled")&&e.enabled||n.includes("disabled")&&!e.enabled)&&(o=!0));const r=[t.exclude_tags||[]].flat();return r.length&&o&&((e.tags||[]).some(e=>r.includes(e))||r.includes("none")&&!(null===(s=e.tags)||void 0===s?void 0:s.length)||r.includes("enabled")&&e.enabled||r.includes("disabled")&&!e.enabled)&&(o=!1),o},as=(e,t)=>((e,t)=>e<t?-1:e>t?1:0)(e.toLowerCase(),t.toLowerCase()),os=e=>{let t=e.trim();return t.charAt(0).toUpperCase()+t.slice(1)},ns=(e,t,i=!0)=>{let s=t.localize(e);return s||!i?s:`{${e.split(".").pop()}}`},rs=(e,t)=>{if((i=e.mode)==we.Entity||i==we.EntityDay){const i=e.entity_id?t.states[e.entity_id]:void 0;return(null==i?void 0:i.attributes.friendly_name)||e.entity_id||""}var i;let s=e.mode==we.Sunrise?ns("ui.panel.config.automation.editor.conditions.type.sun.sunrise",t):ns("ui.panel.config.automation.editor.conditions.type.sun.sunset",t);return"de"!=t.language&&(s=s.toLowerCase()),s},ds=(e,t,i)=>e.mode==we.Fixed?He(e,{am_pm:i}):e.mode==we.EntityDay?((e,t,i)=>Yi("ui.components.time.on_day_of",t,["{time}","{anchor}"],[He(Object.assign(Object.assign({},e),{mode:we.Fixed}),{seconds:!1,am_pm:i}),rs(e,t)]))(e,t,i):((e,t)=>{const i=rs(e,t),s=3600*e.hours+60*e.minutes;if(Math.abs(s)<=60)return Yi("ui.components.time.at_sun_event",t,"{sunEvent}",i);let a=ns(s<0?"ui.panel.config.automation.editor.conditions.type.sun.before":"ui.panel.config.automation.editor.conditions.type.sun.after",t);return a=a.replace(/[^a-z]/gi,"").toLowerCase(),`${He(e,{seconds:!1}).split(/\+|-/).pop()} ${a} ${i}`})(e,t),ls={alarm_control_panel:{alarm_disarm:{target:{}},alarm_arm_home:{supported_features:1,target:{}},alarm_arm_away:{supported_features:2,target:{}},alarm_arm_night:{supported_features:4,target:{}},alarm_arm_custom_bypass:{supported_features:16,target:{}},alarm_arm_vacation:{supported_features:32,target:{}}},automation:{turn_on:{translation_key:"services.generic.turn_on",target:{}},turn_off:{translation_key:"services.generic.turn_off",target:{}},trigger:{target:{}}},button:{press:{target:{}}},climate:{turn_off:{translation_key:"services.generic.turn_off",target:{},supported_features:128},turn_on:{translation_key:"services.generic.turn_on",target:{},supported_features:256},set_hvac_mode:{translation_key:"services.climate.set_hvac_mode",target:{},fields:{hvac_mode:{}}},set_temperature:{translation_key:["services.climate.set_temperature","services.climate.set_temperature_hvac_mode_heat","services.climate.set_temperature_hvac_mode_cool","services.climate.set_temperature_hvac_mode_heat_cool"],target:{},fields:{temperature:{supported_features:1},target_temp_high:{supported_features:2},target_temp_low:{supported_features:2},hvac_mode:{optional:!0}}},set_preset_mode:{translation_key:"services.climate.set_preset_mode",supported_features:16,target:{},fields:{preset_mode:{}}},set_fan_mode:{translation_key:"services.climate.set_fan_mode",supported_features:8,target:{},fields:{fan_mode:{}}},set_swing_mode:{translation_key:"services.climate.set_swing_mode",supported_features:32,target:{},fields:{swing_mode:{}}}},cover:{close_cover:{translation_key:"services.cover.close_cover",supported_features:2,target:{}},open_cover:{translation_key:"services.cover.open_cover",supported_features:1,target:{}},set_cover_position:{translation_key:"services.cover.set_cover_position",supported_features:4,target:{},fields:{position:{}}},close_cover_tilt:{supported_features:32,target:{}},open_cover_tilt:{supported_features:16,target:{}},set_cover_tilt_position:{translation_key:"services.cover.set_cover_tilt_position",supported_features:128,target:{},fields:{tilt_position:{}}}},fan:{turn_on:{translation_key:"services.generic.turn_on",target:{}},turn_off:{translation_key:"services.generic.turn_off",target:{}},set_percentage:{translation_key:"services.fan.set_percentage",supported_features:1,target:{},fields:{percentage:{}}},oscillate:{translation_key:"services.fan.oscillate",supported_features:2,target:{},fields:{oscillating:{}}},set_direction:{translation_key:"services.fan.set_direction",supported_features:4,target:{},fields:{direction:{}}},set_preset_mode:{translation_key:"services.climate.set_preset_mode",supported_features:8,target:{},fields:{preset_mode:{}}}},humidifier:{turn_on:{translation_key:"services.generic.turn_on",target:{}},turn_off:{translation_key:"services.generic.turn_off",target:{}},set_humidity:{translation_key:"services.humidifier.set_humidity",target:{},fields:{humidity:{}}},set_mode:{translation_key:"services.humidifier.set_mode",supported_features:1,target:{},fields:{mode:{}}}},input_boolean:{turn_on:{translation_key:"services.generic.turn_on",target:{}},turn_off:{translation_key:"services.generic.turn_off",target:{}}},input_button:{press:{target:{}}},input_number:{set_value:{translation_key:"services.input_number.set_value",target:{},fields:{value:{}}}},input_select:{select_option:{translation_key:"services.input_select.select_option",target:{},fields:{option:{}}}},lawn_mower:{start_mowing:{target:{},supported_features:1},pause:{target:{},supported_features:2},dock:{target:{},supported_features:4}},light:{turn_on:{translation_key:"services.light.turn_on",target:{},fields:{brightness:{optional:!0},color_temp_kelvin:{optional:!0}}},turn_off:{translation_key:"services.generic.turn_off",target:{}}},lock:{lock:{target:{}},unlock:{target:{}}},media_player:{turn_on:{translation_key:"services.generic.turn_on",target:{}},turn_off:{translation_key:"services.generic.turn_off",target:{}},select_source:{translation_key:"services.media_player.select_source",supported_features:2048,target:{},fields:{source:{}}}},notify:{"{entity_id}":{translation_key:"services.notify.send_message",fields:{title:{optional:!0},message:{}}}},number:{set_value:{translation_key:"services.input_number.set_value",target:{},fields:{value:{}}}},scene:{turn_on:{target:{}}},script:{"{entity_id}":{translation_key:"services.script.execute"}},select:{select_option:{translation_key:"services.input_select.select_option",target:{},fields:{option:{}}}},switch:{turn_on:{translation_key:"services.generic.turn_on",target:{}},turn_off:{translation_key:"services.generic.turn_off",target:{}}},vacuum:{turn_on:{translation_key:"services.generic.turn_on",supported_features:1,target:{}},start:{supported_features:8192,target:{}},play_pause:{target:{}}},valve:{open_valve:{supported_features:1,target:{}},close_valve:{supported_features:2,target:{}},set_valve_position:{translation_key:"services.cover.set_cover_position",supported_features:4,target:{},fields:{position:{}}}},water_heater:{set_temperature:{translation_key:"services.climate.set_temperature",supported_features:1,target:{},fields:{temperature:{}}},set_operation_mode:{translation_key:"services.water_heater.set_operation_mode",supported_features:2,target:{},fields:{operation_mode:{}}},set_away_mode:{translation_key:"services.water_heater.set_away_mode",supported_features:4,target:{},fields:{away_mode:{}}},turn_off:{translation_key:"services.generic.turn_off",target:{},supported_features:8},turn_on:{translation_key:"services.generic.turn_on",target:{},supported_features:8}}},cs=e=>{if("object"!=typeof e)return null;if(!Object.keys(e).length||!Object.keys(e).every(e=>"string"==typeof e))return null;let t={value:"",label:""};return Object.keys(e).includes("name")?t=Object.assign(Object.assign({},t),{label:String(e.name)}):Object.keys(e).includes("label")?t=Object.assign(Object.assign({},t),{label:String(e.label)}):Object.keys(e).includes("value")&&(t=Object.assign(Object.assign({},t),{label:String(e.value)})),Object.keys(e).includes("value")?t=Object.assign(Object.assign({},t),{value:String(e.value)}):Object.keys(e).includes("name")?t=Object.assign(Object.assign({},t),{value:String(e.name)}):Object.keys(e).includes("label")&&(t=Object.assign(Object.assign({},t),{value:String(e.label)})),Object.keys(e).includes("icon")&&Ke(e.icon)&&(t=Object.assign(Object.assign({},t),{icon:String(e.icon)})),t.value.length&&t.label.length?t:null},hs=e=>{let t={select:{options:Array.isArray(e.options)?e.options.every(e=>"string"==typeof e)?e.options:e.options.map(cs).filter(Ke):[]}};return e.translation_key&&(t=Object.assign(Object.assign({},t),{select:Object.assign(Object.assign({},t.select),{translation_key:e.translation_key})})),t},us=(e,t)=>{if(e.hasOwnProperty("service")&&e.service!==t.service)return!1;const i=e.service_data||{},s=t.service_data||{},a=e.hasOwnProperty("variables")?e.variables||{}:e.hasOwnProperty("fields")&&e.fields||{};let o=[...new Set([...Object.keys(i),...Object.keys(s),...Object.keys(a)])];return o=o.filter(e=>"entity_id"!=e),!!o.every(e=>{var t;if(Object.keys(i).includes(e)&&Object.keys(s).includes(e))return ue(i[e],s[e]);if(Object.keys(a).includes(e)){let i=a[e],o=s[e];if(Object.keys(i).includes("options")){let e=hs({options:i.options});return!Ke(o)||(null===(t=e.select)||void 0===t?void 0:t.options.find(e=>"string"==typeof e?e==o:e.value==o))}return!Object.keys(i).includes("min")||!Object.keys(i).includes("max")||(!(Ke(o)||!Object.keys(i).includes("optional")||!i.optional)||"number"==typeof o)}return!1})},ps=(e,t)=>{let i=[];return Object.keys(e).filter(t=>{var i;return null===(i=e[t].actions)||void 0===i?void 0:i.length}).filter(i=>!t||!t.includes(".")&&ts(Qi(i),t)||ts(i,t)||t.includes(".")&&e[i].actions.find(e=>e.service==t)).forEach(s=>{Object.values(e[s].actions).forEach(e=>{if(e.service.includes(".")||(e=Object.assign(Object.assign({},e),{service:`${Qi(s)}.${e.service}`})),s.includes(".")&&"script"!=Qi(s)&&(e=Object.assign(Object.assign({},e),{target:{entity_id:s}})),"script"!=Qi(s)&&(!s.includes(".")||"script"==Qi(t||""))){if((null==t?void 0:t.includes("."))&&e.service!=t)return;e=Object.assign(Object.assign({},e),{target:Object.assign(Object.assign({},e.target),{domain:s})})}i.push({service:e.service,service_data:e.service_data||{},target:e.target?e.target:void 0,name:e.name||"",icon:e.icon||"",variables:e.variables})})}),i},ms=(e,t)=>{var i;const s=Qi(e.service),a=Ji(e.service);let o,n={};if(Object.keys(ls).includes(s)&&(Object.keys(ls[s]).includes(a)?n=Object.assign(Object.assign({},n),ls[s][a]):Object.keys(ls[s]).includes("{entity_id}")&&(n=Object.assign(Object.assign({},n),ls[s]["{entity_id}"]))),!t)return n;o=["script","notify"].includes(s)?e.service:null===(i=e.target)||void 0===i?void 0:i.entity_id,o||(o=e.service);const r=ps(t,[o].flat().pop());if(r.length){let t=r.map(t=>{if(!us(t,e))return null;let i={};return Object.keys(t.variables||{}).forEach(e=>{i=Object.assign(Object.assign({},i),{fields:Object.assign(Object.assign({},i.fields||{}),{[e]:{}})})}),Object.assign(Object.assign({},i),{name:t.name||n.name,icon:t.icon||n.icon,target:t.target||n.target})}).filter(Ke);if(t.length&&!us(n,e))return t[0]}return n},_s=e=>{const t=Math.pow(10,5);return e=Math.round(e*t)/t},gs=(e,t,i)=>{if(!t)return e;if(Object.keys(t).includes("select")&&t.select){const s=t.select;let a=s.options.map(e=>"string"==typeof e?Object({value:e,label:e}):e),o=null==a?void 0:a.find(t=>t.value==e);s.translation_key?e=ns(s.translation_key.replace("${value}",e),i,!1)||o?null==o?void 0:o.label:e:o&&(e=o.label)}if(Object.keys(t).includes("number")&&t.number){const i=t.number;if(e=Number(e),"number"==typeof(null==i?void 0:i.scale_factor)&&(e/=i.scale_factor),"number"==typeof(null==i?void 0:i.step)&&(e=Math.round(e/i.step)*i.step),e=_s(e),null==i?void 0:i.unit)return`${e}${i.unit}`}return Object.keys(t).includes("boolean")&&t.boolean&&(e=Boolean(e)?"True":"False"),e},vs=e=>{let t={number:{}};return Object.keys(e).includes("min")&&!isNaN(Number(e.min))&&(t=Object.assign(Object.assign({},t),{number:Object.assign(Object.assign({},t.number),{min:Number(e.min)})})),Object.keys(e).includes("max")&&!isNaN(Number(e.max))&&(t=Object.assign(Object.assign({},t),{number:Object.assign(Object.assign({},t.number),{max:Number(e.max)})})),Object.keys(e).includes("step")&&!isNaN(Number(e.step))&&e.step>0&&(t=Object.assign(Object.assign({},t),{number:Object.assign(Object.assign({},t.number),{step:Number(e.step)})})),Object.keys(e).includes("mode")&&["box","slider"].includes(e.mode)&&(t=Object.assign(Object.assign({},t),{number:Object.assign(Object.assign({},t.number),{mode:e.mode})})),Object.keys(e).includes("unit")&&e.unit&&(t=Object.assign(Object.assign({},t),{number:Object.assign(Object.assign({},t.number),{unit:e.unit})})),Object.keys(e).includes("optional")&&(t=Object.assign(Object.assign({},t),{number:Object.assign(Object.assign({},t.number),{optional:Boolean(e.optional)})})),Object.keys(e).includes("scale_factor")&&!isNaN(Number(e.scale_factor))&&(t=Object.assign(Object.assign({},t),{number:Object.assign(Object.assign({},t.number),{scale_factor:Number(e.scale_factor)})})),t},fs={alarm_control_panel:{services:{alarm_arm_away:"mdi:shield-lock",alarm_arm_home:"mdi:shield-home",alarm_arm_night:"mdi:shield-moon",alarm_custom_bypass:"mdi:security",alarm_disarm:"mdi:shield-off",alarm_trigger:"mdi:bell-ring",alarm_arm_vacation:"mdi:shield-airplane"}},automation:{services:{turn_on:"mdi:robot",turn_off:"mdi:robot-off",trigger:"mdi:play"}},button:{services:{press:"mdi:gesture-tap-button"}},climate:{services:{set_temperature:"mdi:thermometer",set_hvac_mode:"mdi:cog-transfer-outline",set_preset_mode:"mdi:cloud-download-outline",set_fan_mode:"mdi:fan",set_humidity:"mdi:water-percent",set_swing_mode:"mdi:arrow-oscillating"},attributes:{hvac_mode:{auto:"mdi:autorenew",cool:"mdi:snowflake",dry:"mdi:water-percent",fan_only:"mdi:fan",heat:"mdi:fire",heat_cool:"mdi:thermometer",off:"mdi:power"},preset_mode:{activity:"mdi:motion-sensor",away:"mdi:account-arrow-right",boost:"mdi:rocket-launch",comfort:"mdi:sofa",eco:"mdi:leaf",home:"mdi:home",sleep:"mdi:bed"},fan_mode:{diffuse:"mdi:weather-windy",focus:"mdi:target",high:"mdi:speedometer",low:"mdi:speedometer-slow",medium:"mdi:speedometer-medium",middle:"mdi:speedometer-medium",off:"mdi:fan-off",on:"mdi:fan"},swing_mode:{both:"mdi:arrow-all",horizontal:"mdi:arrow-left-right",off:"mdi:arrow-oscillating-off",on:"mdi:arrow-oscillating",vertical:"mdi:arrow-up-down"}}},cover:{services:{close_cover:"mdi:arrow-down-box",close_cover_tilt:"mdi:arrow-bottom-left",open_cover:"mdi:arrow-up-box",open_cover_tilt:"mdi:arrow-top-right",set_cover_position:"mdi:arrow-down-box",set_cover_tilt_position:"mdi:arrow-top-right"}},fan:{services:{oscillate:"mdi:arrow-oscillating",set_percentage:"mdi:fan",set_preset_mode:"mdi:fan-auto",turn_off:"mdi:fan-off",turn_on:"mdi:fan"}},humidifier:{services:{set_humidity:"mdi:water-percent",set_mode:"mdi:air-humidifier",turn_off:"mdi:air-humidifier-off",turn_on:"mdi:air-humidifier"},attributes:{mode:{auto:"mdi:refresh-auto",away:"mdi:account-arrow-right",baby:"mdi:baby-carriage",boost:"mdi:rocket-launch",comfort:"mdi:sofa",eco:"mdi:leaf",home:"mdi:home",normal:"mdi:water-percent",sleep:"mdi:power-sleep"}}},input_boolean:{services:{turn_off:"mdi:toggle-switch-off",turn_on:"mdi:toggle-switch"}},input_button:{services:{press:"mdi:gesture-tap-button"}},input_number:{services:{set_value:"mdi:counter"}},input_select:{services:{select_option:"mdi:counter"}},lawn_mower:{services:{dock:"mdi:home-import-outline",start_mowing:"mdi:play",pause:"mdi:pause"}},light:{services:{turn_off:"mdi:lightbulb-off",turn_on:"mdi:lightbulb-on"}},lock:{services:{lock:"mdi:lock",unlock:"mdi:lock-open"}},media_player:{services:{media_play:"mdi:play",media_stop:"mdi:stop",play_media:"mdi:play",select_source:"mdi:import",turn_off:"mdi:power",turn_on:"mdi:power"}},notify:{services:{"{entity_id}":"mdi:message-alert"}},scene:{services:{turn_on:"mdi:play"}},script:{services:{turn_on:"mdi:flash",turn_off:"mdi:flash-off","{entity_id}":"mdi:play"}},select:{services:{select_option:"mdi:counter"}},switch:{services:{turn_off:"mdi:toggle-switch-variant-off",turn_on:"mdi:toggle-switch-variant"}},vacuum:{services:{send_command:"mdi:send",start:"mdi:play",turn_off:"mdi:stop",turn_on:"mdi:play"}},valve:{services:{open_valve:"mdi:valve-open",close_valve:"mdi:valve-closed",set_valve_position:"mdi:valve"}},water_heater:{services:{set_away_mode:"mdi:account-arrow-right",set_operation_mode:"mdi:water-boiler",set_temperature:"mdi:thermometer",turn_off:"mdi:water-boiler-off",turn_on:"mdi:water-boiler"},attributes:{operation_mode:{eco:"mdi:leaf",electric:"mdi:lightning-bolt",gas:"mdi:fire-circle",heat_pump:"mdi:heat-wave",high_demand:"mdi:finance",off:"mdi:power",performance:"mdi:rocket-launch"}}}},bs=(e,t,i,s,a)=>{const o=Qi(e),n=["script","notify"].includes(o)?[e]:[t||[]].flat();let r=n.map(e=>ys(e,i,s)),d=xs(r),l=n.map(t=>ws(e,t,i,a));return xs(l)||d},ys=(e,t,i)=>{const s=Object.keys(i.states).includes(e)?i.states[e]:null,a=(null==s?void 0:s.attributes)||{},o=Qi(e),n=`${o}.${t}`,r=e=>{var i,s;const a=null===(s=null===(i=fs[o])||void 0===i?void 0:i.attributes)||void 0===s?void 0:s[t],n=!!a&&(e||[]).every(e=>e in a);return(e||[]).map(e=>({value:e,label:e,icon:n?a[e]:void 0}))};switch(n){case"climate.temperature":case"climate.target_temp_low":case"climate.target_temp_high":{const e="climate.temperature"==n?(2&(a.supported_features||0))>0:(1&(a.supported_features||0))>0,t=i.config.unit_system.temperature.includes("F")?1:.5;return vs({min:a.min_temp,max:a.max_temp,step:a.target_temp_step||t,unit:""+i.config.unit_system.temperature,optional:e})}case"climate.hvac_mode":return hs({options:r(a.hvac_modes),translation_key:"component.climate.entity_component._.state.${value}"});case"climate.preset_mode":return hs({options:r(a.preset_modes),translation_key:"state_attributes.climate.preset_mode.${value}"});case"climate.fan_mode":return hs({options:r(a.fan_modes)});case"climate.swing_mode":return hs({options:r(a.swing_modes)});case"cover.position":case"cover.tilt_position":case"fan.percentage":case"valve.position":return vs({min:0,max:100,step:1,unit:"%"});case"fan.oscillating":return{boolean:{}};case"fan.direction":return hs({options:r(["forward","reverse"]),translation_key:"ui.card.fan.${value}"});case"fan.preset_mode":return hs({options:r(a.preset_modes)});case"humidifier.humidity":return vs({min:a.min_humidity,max:a.max_humidity,step:1,unit:"%"});case"humidifier.mode":return hs({options:r(a.available_modes),translation_key:"component.humidifier.entity_component._.state_attributes.mode.state.${value}"});case"input_number.value":case"number.value":return vs({min:a.min,max:a.max,step:a.step,mode:a.mode,unit:a.unit_of_measurement});case"input_select.option":case"select.option":return hs({options:r(a.options)});case"light.brightness":return vs({min:0,max:100,step:1,unit:"%",scale_factor:2.55});case"light.color_temp_kelvin":return vs({min:a.min_color_temp_kelvin||2e3,max:a.max_color_temp_kelvin||6500,step:100,unit:"K"});case"media_player.source":case"notify.title":case"notify.message":return{text:{}};case"water_heater.temperature":{const e=i.config.unit_system.temperature.includes("F")?1:.5;return vs({min:a.min_temp,max:a.max_temp,step:a.target_temp_step||e,unit:""+i.config.unit_system.temperature})}case"water_heater.operation_mode":return hs({options:r(a.operation_list)});case"water_heater.away_mode":return{boolean:{}}}return null},ws=(e,t,i,s)=>{const a=ps(s||{},t);if(a.length){let t=a.map(t=>{if(t.service!=e||!Object.keys(t.variables||{}).includes(i))return null;let s=(t.variables||{})[i];return ks(s)}).filter(e=>void 0!==e);return xs(t)}return null},ks=e=>Object.keys(e).includes("options")?hs({options:e.options}):Object.keys(e).includes("min")&&Object.keys(e).includes("max")?vs(e):{text:{}},xs=e=>{const t=e=>1==new Set(e).size;if(e.some(e=>null===e)||!e.length)return null;if(e.every(e=>e.hasOwnProperty("select"))){const i=e.map(e=>e.select.options).filter(e=>void 0!==e);let s=[];if(i.every(e=>e.every(e=>"string"==typeof e)))s=i.length?i.reduce((e,t)=>e.filter(e=>t.includes(e))):[];else{let e=i.map(e=>e.map(e=>cs("object"==typeof e?e:{value:e})).filter(Ke));s=e.length?e.reduce((e,t)=>e.filter(e=>t.find(t=>t.value===e.value))):[]}const a=e.map(e=>e.select.translation_key).filter(e=>void 0!==e);return{select:{options:s.length?s:[],translation_key:a.length&&t(a)?a[0]:void 0}}}if(e.every(e=>e.hasOwnProperty("number"))){const i=e.map(e=>e.number.min).filter(e=>void 0!==e),s=e.map(e=>e.number.max).filter(e=>void 0!==e),a=e.map(e=>e.number.step).filter(e=>void 0!==e),o=e.map(e=>e.number.mode).filter(e=>void 0!==e),n=e.map(e=>e.number.unit).filter(e=>void 0!==e),r=e.map(e=>e.number.optional),d=e.map(e=>e.number.scale_factor).filter(e=>void 0!==e);return{number:{min:i.length?Math.max(...i):void 0,max:s.length?Math.min(...s):void 0,step:a.length?Math.max(...a):void 0,mode:o.length&&t(o)?o[0]:void 0,unit:n.length&&t(n)?n[0]:void 0,optional:r.every(e=>e),scale_factor:d.length&&t(d)?d[0]:void 0}}}return e.every(e=>e.hasOwnProperty("boolean"))?{boolean:{}}:e.every(e=>e.hasOwnProperty("text"))?{text:{}}:null},$s=/\[([^\]]+)\]/,Ss=/\{([^\}]+)\}/,js=(e,t)=>{const i=Ji(t.service);return-1!=e.indexOf(i)&&(e=e.substring(e.indexOf(i)+i.length+1)),Object.keys(t.service_data).reduce((i,s)=>{if(-1==e.indexOf(s))return i;let a=e.substring(e.indexOf(s)+s.length+1);return a==t.service_data[s]?i+e.length+a.length+1:i},0)},Os=(e,t,i,s=!1,a=!1)=>{const o=ms(e,i);let n,r=o.name||"",d=Object.fromEntries(Object.entries(e.service_data).filter(([e,t])=>Ke(t)).map(([s,a])=>{var o;const n=bs(e.service,null===(o=e.target)||void 0===o?void 0:o.entity_id,s,t,i);return n?[s,gs(a,n,t)]:[s,null]}).filter(([e,t])=>Ke(t)));if(s){if(Object.keys(d).length>1){const e=(e,t)=>{const i=!!o.fields&&o.fields[e]||{},s=!!o.fields&&o.fields[t]||{};return(null==i?void 0:i.optional)&&!s.optional?1:(null==s?void 0:s.optional)&&!i.optional||e<t?-1:e>t?1:0};return d=Object.fromEntries(Object.entries(d).sort(([t],[i])=>e(t,i))),Object.values(d).join(", ")}if(Object.keys(d).length)return Object.values(d)[0]}if((null==o?void 0:o.translation_key)&&!r){let i="";if(Array.isArray(o.translation_key)){let t=o.translation_key;t.sort((t,i)=>{let s=js(t,e),a=js(i,e);return s!=a?a-s:t.length-i.length}),i=t[0]}else i=o.translation_key;r=Yi(i,t,Object.keys(d).map(e=>`{${e}}`),Object.values(d))}else{const i=Qi(e.service),s=Ji(e.service);r||(r=ns(`component.${i}.services.${s}.name`,t,!1)),!r&&Object.keys(t.services[i]||{}).includes(s)&&(r=t.services[i][s].name||""),r||(r=s.replace(/_/g," "))}let l,c=0;for(;(n=$s.exec(r))&&c<100;){c++;let t=n[1].match(Ss);r=t&&Object.keys(e.service_data||{}).includes(t[1])&&Object.keys(d).includes(t[1])?r.replace(n[0],n[1].replace(t[0],d[t[1]])):r.replace(n[0],"")}for(c=0;(l=Ss.exec(r))&&c<100;)c++,r=Object.keys(d).includes(l[1])?r.replace(l[0],d[l[1]]):r.replace(l[0],"");if(a&&null!==/<.+?>/g.exec(r)){r=(new DOMParser).parseFromString(r,"text/html").body.textContent||""}return r},zs=()=>{try{(new Date).toLocaleDateString("i")}catch(e){return"RangeError"===e.name}return!1},Cs=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"],Es=(e,t,i)=>{let s;if(e instanceof Date){e.getDay();if(s=_e.Friday,zs())return e.toLocaleDateString(i.locale.language,{weekday:t});e.getDay();s=_e.Friday}else s=e;switch(s){case _e.Daily:return Yi(`ui.components.date.day_types_${t}.daily`,i);case _e.Workday:return Yi(`ui.components.date.day_types_${t}.workdays`,i);case _e.Weekend:return Yi(`ui.components.date.day_types_${t}.weekend`,i);case _e.Monday:case _e.Tuesday:case _e.Wednesday:case _e.Thursday:case _e.Friday:case _e.Saturday:case _e.Sunday:let e=new Date(2017,1,26),a=Cs.findIndex(e=>e==s);return zs()?(e.setDate(e.getDate()+a),e.toLocaleDateString(i.locale.language,{weekday:t})):Cs[a];default:return""}},As=e=>{var t,i,s;let a=null===(t=e.locale)||void 0===t?void 0:t.first_weekday;if(!a||"language"==a){if("weekInfo"in Intl.Locale.prototype)try{const t=new Intl.Locale(e.locale.language).weekInfo||(null===(s=(i=new Intl.Locale(e.locale.language)).getWeekInfo)||void 0===s?void 0:s.call(i));if(null==t?void 0:t.firstDay)return t.firstDay%7}catch(e){}{const t="AEAFBHDJDZEGIQIRJOKWLYOMQASDSY".match(/../g),i="AGARASAUBDBRBSBTBWBZCACNCODMDOETGTGUHKHNIDILINJMJPKEKHKRLAMHMMMOMTMXMZNINPPAPEPHPKPRPTPYSASGSVTHTTTWUMUSVEVIWSYEZAZW".match(/../g),s=["ar","arq","arz","fa"],a="amasbndzengnguhehiidjajvkmknkolomhmlmrmtmyneomorpapssdsmsnsutatethtnurzhzu".match(/../g),o=e.locale.language.match(/^([a-z]{2,3})(?:-([a-z]{3})(?=$|-))?(?:-([a-z]{4})(?=$|-))?(?:-([a-z]{2}|\d{3})(?=$|-))?/i);return o[1]?i.includes(o[4])?0:t.includes(o[4])?6:1:a.includes(o[1])?0:s.includes(o[1])?6:1}}{const e=Ds.map(e=>e.toLowerCase()).findIndex(e=>e==a);if(e>=0)return e}return 1},Ds=[_e.Sunday,_e.Monday,_e.Tuesday,_e.Wednesday,_e.Thursday,_e.Friday,_e.Saturday],Ts=(e,t,i)=>{let s="";const a=As(i);let o=((e,t)=>e.concat(e).slice(t,t+e.length))(Ds,a);e.sort((e,t)=>o.findIndex(t=>t==e)-o.findIndex(e=>e==t));const n=e.filter(e=>o.includes(e)).map(e=>o.findIndex(t=>t==e)),r=(e=>{const t=[];for(let i=0;i<e.length-1;i++){let s=i+1;for(;e[s]-e[s-1]==1;)s++;t.push(s-i)}return t})(n),d=Math.max(...r);if(n.length){if(e.length>n.length&&(s+=e.filter(e=>!o.includes(e)).map(e=>Es(e,t,i)).join(", "),s+=", "),6==n.length){const e=[0,1,2,3,4,5,6].filter(e=>!n.includes(e)),a=Es(o[e.pop()],t,i);s+=Yi("ui.components.date.repeated_days_except",i,"{excludedDays}",a)}else{const e=n.map(e=>Es(o[e],t,i));if(n.length>=3&&d>=3){const t=r.reduce((e,t,i)=>t==d?i:e,0);e.splice(t,d,Yi("ui.components.date.days_range",i,["{startDay}","{endDay}"],[e[t],e[t+d-1]]))}const a=e.length>1?`${e.slice(0,-1).join(", ")} ${ns("ui.common.and",i)} ${e.pop()}`:""+e.pop();s+=n.length>=3&&d>=3?a:Yi("ui.components.date.repeated_days",i,"{days}",a)}return s}return e.map(e=>Es(e,t,i)).join(", ")},Ms=(e,t,i)=>{const s=Object.entries(i||{}).filter(([t,i])=>ts(t,e)&&i.name).map(([e,t])=>t.name);return s.filter(Ke).length?s.filter(Ke)[0]:Object.keys(t.states).includes(e)&&t.states[e].attributes.friendly_name?t.states[e].attributes.friendly_name:Ji(e).replace(/_/g," ")},Ps=(e,t,i,s)=>{const a=t=>{var o,n;switch(t){case fe.Action:const r=e.entries[0].slots[e.next_entries[0]||0].actions[0];return os(Os(r,i,s));case fe.Days:return os(Ts(e.entries[0].weekdays,"long",i));case fe.Name:return os(e.name||"");case fe.AdditionalTasks:return e.entries[0].slots.length>1?"+"+Yi("ui.panel.overview.additional_tasks",i,"{number}",String(e.entries[0].slots.length-1)):"";case fe.Entity:const d=e.entries[0].slots[e.next_entries[0]||0].actions[0];let l=[(null===(o=d.target)||void 0===o?void 0:o.entity_id)||[]].flat();!l.length&&["script","notify"].includes(Qi(d.service))&&(l=[d.service]);const c=l.map(e=>Ms(e,i,s)).join(", ");return os(c);case fe.RelativeTime:return"<relative-time></relative-time>";case fe.Tags:return null===(n=e.tags)||void 0===n?void 0:n.map(e=>`<tag>${e}</tag>`).join("");case fe.Time:const h=e.entries[0].slots[e.next_entries[0]||0],u=((e,t,i)=>{const s=Le(i.locale);if(t){const a=ds(De(e),i,s),o=ds(De(t),i,s);return os(Yi("ui.components.time.interval",i,["{startTime}","{endTime}"],[a,o]))}{const t=ds(De(e),i,s);return os(Yi("ui.components.time.absolute",i,"{time}",t))}})(h.start,h.stop,i);if(u&&u.trim())return os(u);const p=e=>{try{const t=e.split(":").map(Number);return`${String(t[0]).padStart(2,"0")}:${String(t[1]).padStart(2,"0")}`}catch(t){return String(e)}};return os(h.stop?`${p(h.start)} - ${p(h.stop)}`:""+p(h.start));case fe.Default:const m=a(fe.Name);return m||`${a(fe.Entity)}: ${a(fe.Action)}`;default:const _=/\{([^\}]+)\}/;let g;for(;g=_.exec(t);)t=t.replace(g[0],String(a(String(g[1]))));return t}};return[...[t].flat()].map(e=>{let t=a(e);return t||""})},Ls=(e,t)=>{const i=new Date(e.timestamps[e.next_entries[0]]).valueOf(),s=new Date(t.timestamps[t.next_entries[0]]).valueOf(),a=(new Date).valueOf(),o=i<a&&s<a;return null!==i&&null!==s?i<a&&s>=a?1:i>=a&&s<a?-1:i>s?o?-1:1:i<s?o?1:-1:e.entity_id<t.entity_id?1:-1:null!==s?1:null!==i?-1:e.entity_id<t.entity_id?1:-1},Ns=(e,t,i)=>{const s=[t.sort_by].flat();return s.includes("relative-time")&&(e=e.sort(Ls)),s.includes("title")&&(e=e.sort((e,s)=>{var a;return((e,t,i,s,a)=>{try{const o=Ps(e,i,s,a).join(),n=Ps(t,i,s,a).join();return as(o,n)}catch(e){return 0}})(e,s,(null===(a=t.display_options)||void 0===a?void 0:a.primary_info)||"default",i,t.customize)})),s.includes("state")&&(e=e.sort((e,t)=>((e,t,i,s)=>{var a,o;const n=null===(a=i.states[e.entity_id])||void 0===a?void 0:a.state,r=null===(o=i.states[t.entity_id])||void 0===o?void 0:o.state,d=["on","triggered"].includes(n),l=["on","triggered"].includes(r);if(d&&!l)return-1;if(!d&&l)return 1;if(s){if("off"!=n&&"off"==r)return 1;if("off"==n&&"off"!=r)return-1}return 0})(e,t,i,s.includes("relative-time")))),e},Is=(e,t)=>e.callWS({type:"scheduler/item",schedule_id:t}).then(e=>Se(e)),Rs=(e,t,i,s)=>{s=s||{},i=null==i?{}:i;const a=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return a.detail=i,e.dispatchEvent(a),a},Hs=async e=>{let t={};const i=Object.keys(e.states).filter(e=>"script"==Qi(e));return i.length&&await e.callWS({type:"config/entity_registry/get_entries",entity_ids:i}).then(e=>{t=Object.fromEntries(Object.entries(e).map(([,e])=>(e=>{let t={};const i=`${e.platform}.${e.unique_id}`;return e.name&&(t=Object.assign(Object.assign({},t),{name:e.name})),e.icon&&(t=Object.assign(Object.assign({},t),{icon:e.icon})),[i,t]})(e)).filter(([,e])=>Object.keys(e).length))}),t},qs=e=>e.callWS({type:"scheduler/tags"});var Vs="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",Fs="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z",Bs="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",Ws="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10M11.25,4L10.88,6.61C9.68,6.86 8.62,7.5 7.85,8.39L5.44,7.35L4.69,8.65L6.8,10.2C6.4,11.37 6.4,12.64 6.8,13.8L4.68,15.36L5.43,16.66L7.86,15.62C8.63,16.5 9.68,17.14 10.87,17.38L11.24,20H12.76L13.13,17.39C14.32,17.14 15.37,16.5 16.14,15.62L18.57,16.66L19.32,15.36L17.2,13.81C17.6,12.64 17.6,11.37 17.2,10.2L19.31,8.65L18.56,7.35L16.15,8.39C15.38,7.5 14.32,6.86 13.12,6.62L12.75,4H11.25Z",Us="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z",Zs="M11,18H13V16H11V18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,6A4,4 0 0,0 8,10H10A2,2 0 0,1 12,8A2,2 0 0,1 14,10C14,12 11,11.75 11,15H13C13,12.75 16,12.5 16,10A4,4 0 0,0 12,6Z",Ks="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z",Xs="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",Gs="M11,13.5V21.5H3V13.5H11M12,2L17.5,11H6.5L12,2M17.5,13C20,13 22,15 22,17.5C22,20 20,22 17.5,22C15,22 13,20 13,17.5C13,15 15,13 17.5,13Z",Ys="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z",Js="M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z";const Qs={alarm_control_panel:"mdi:alarm-light-outline",air_quality:"mdi:air-filter",alert:"mdi:alert",automation:"mdi:robot",binary_sensor:"mdi:radiobox-blank",button:"mdi:gesture-tap-button",camera:"mdi:camera",calendar:"mdi:calendar",cover:"mdi:window-shutter",climate:"mdi:thermostat",configurator:"mdi:cog",conversation:"mdi:microphone-message",counter:"mdi:counter",date:"mdi:calendar",datetime:"mdi:calendar-clock",demo:"mdi:home-assistant",device_tracker:"mdi:account",fan:"mdi:fan",google_assistant:"mdi:google-assistant",group:"mdi:google-circles-communities",homeassistant:"mdi:home-assistant",homekit:"mdi:home-automation",humidifier:"mdi:air-humidifier",image_processing:"mdi:image-filter-frames",image:"mdi:image",input_boolean:"mdi:toggle-switch",input_button:"mdi:button-pointer",input_datetime:"mdi:calendar-clock",input_number:"mdi:ray-vertex",input_select:"mdi:format-list-bulleted",input_text:"mdi:form-textbox",lawn_mower:"mdi:robot-mower",light:"mdi:lightbulb",lock:"mdi:lock-open-outline",media_player:"mdi:cast-connected",mailbox:"mdi:mailbox",notify:"mdi:comment-alert",number:"mdi:ray-vertex",persistent_notification:"mdi-bell",person:"mdi:account",plant:"mdi:flower",proximity:"mdi:apple-safari",remote:"mdi:remote",scene:"mdi:palette",schedule:"mdi:calendar-clock",script:"mdi:script-text",select:"mdi:format-list-bulleted",sensor:"mdi:eye",simple_alarm:"mdi:bell",siren:"mdi:bullhorn",stt:"mdi:microphone-message",sun:"mdi:white-balance-sunny",switch:"mdi:flash",text:"mdi:form-textbox",time:"mdi:clock",timer:"mdi:timer-outline",todo:"mdi:clipboard-list",tts:"mdi:speaker-message",vacuum:"mdi:robot-vacuum",valve:"mdi:valve-closed",wake_word:"mdi:chat-sleep",water_heater:"mdi:water-boiler",weather:"mdi:weather-partly-cloudy",zone:"mdi:map-marker-radius"},ea=e=>Object.keys(Qs).includes(e)?Qs[e]:"mdi:help",ta=(e,t)=>{let i=Object.keys(e.services).filter(e=>((e,t)=>{let i=Object.keys(ls).includes(e);return!i&&t?Object.keys(t).map(Qi).includes(e):i})(e,t.customize));return i=i.filter(e=>is(e,t)),i.map(t=>({key:t,name:ns(`component.${t}.title`,e,!1)||t.replace(/_/g," "),description:"",icon:ea(t)}))},ia=1,sa=2,aa=e=>(...t)=>({_$litDirective$:e,values:t});class oa{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}
/**
     * @license
     * Copyright 2018 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */const na=aa(class extends oa{constructor(e){var t;if(super(e),e.type!==ia||"style"!==e.name||(null===(t=e.strings)||void 0===t?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const s=e[i];return null==s?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ht){this.ht=new Set;for(const e in t)this.ht.add(e);return this.render(t)}this.ht.forEach(e=>{null==t[e]&&(this.ht.delete(e),e.includes("-")?i.removeProperty(e):i[e]="")});for(const e in t){const s=t[e];if(null!=s){this.ht.add(e);const t="string"==typeof s&&s.endsWith(" !important");e.includes("-")||t?i.setProperty(e,t?s.slice(0,-11):s,t?"important":""):i[e]=s}}return H}}),ra={alarm_control_panel:{disarmed:"mdi:lock-open-variant-outline",armed_away:"mdi:exit-run",armed_home:"mdi:home-outline",armed_night:"mdi:power-sleep",armed_custom_bypass:"mdi:security",armed_vacation:"mdi:shield-airplane",triggered:"mdi:alarm-light-outline"},binary_sensor:{battery:{on:"mdi:battery-outline",off:"mdi:battery"},battery_charging:{on:"mdi:battery-charging",off:"mdi:battery"},cold:{on:"mdi:snowflake",off:"mdi:thermometer"},connectivity:{on:"mdi:server-network",off:"mdi:server-network-off"},door:{on:"mdi:door-open",off:"mdi:door-closed"},garage_door:{on:"mdi:garage-open",off:"mdi:garage"},power:{on:"mdi:power-plug",off:"mdi:power-plug-off"},gas:{on:"mdi:alert-circle",off:"mdi:check-circle"},problem:{on:"mdi:alert-circle",off:"mdi:check-circle"},safety:{on:"mdi:alert-circle",off:"mdi:check-circle"},tamper:{on:"mdi:alert-circle",off:"mdi:check-circle"},smoke:{on:"mdi:smoke",off:"mdi:check-circle"},heat:{on:"mdi:fire",off:"mdi:thermometer"},light:{on:"mdi:brightness-7",off:"mdi:brightness-5"},lock:{on:"mdi:lock-open",off:"mdi:lock"},moisture:{on:"mdi:water",off:"mdi:water-off"},motion:{on:"mdi:run",off:"mdi:walk"},occupancy:{on:"mdi:home",off:"mdi:home-outline"},opening:{on:"mdi:square-outline",off:"mdi:square"},plug:{on:"mdi:power-plug",off:"mdi:power-plug-off"},presence:{on:"mdi:home",off:"mdi:home-outline"},running:{on:"mdi:play",off:"mdi:stop"},sound:{on:"mdi:music-note",off:"mdi:music-note-off"},update:{on:"mdi:package-up",off:"mdi:package"},vibration:{on:"mdi:vibrate",off:"mdi:crop-portrait"},window:{on:"mdi:window-open",off:"mdi:window-closed"},_:{on:"mdi:checkbox-marked-circle",off:"mdi:radiobox-blank"}},calendar:{on:"mdi:flash",off:"mdi:flash-off"},cover:{garage:{closed:"mdi:garage",open:"mdi:garage-open"},door:{closed:"mdi:door-closed",open:"mdi:door-open"},blind:{closed:"mdi:blinds",open:"mdi:blinds-open"},window:{closed:"mdi:window-closed",open:"mdi:window-open"},_:{closed:"mdi:window-shutter",open:"mdi:window-shutter-open"}},climate:{off:"mdi:power-off",heat:"mdi:fire",cool:"mdi:snowflake",heat_cool:"mdi:thermometer",auto:"mdi:autorenew",dry:"mdi:water-percent",fan_only:"mdi:fan"},device_tracker:{home:"mdi:home-outline",not_home:"mdi:exit-run"},fan:{on:"mdi:power",off:"mdi:power-off"},humidifier:{on:"mdi:power",off:"mdi:power-off"},input_boolean:{on:"mdi:flash",off:"mdi:flash-off"},light:{on:"mdi:lightbulb",off:"mdi:lightbulb-off"},lawn_mower:{mowing:"mdi:play",paused:"mdi:pause",docked:"mdi:home-import-outline"},lock:{unlocked:"mdi:lock-open-variant-outline",locked:"mdi:lock-outline"},person:{home:"mdi:home-outline",not_home:"mdi:exit-run"},sun:{below_horizon:"mdi:weather-sunny-off",above_horizon:"mdi:weather-sunny"},switch:{on:"mdi:flash",off:"mdi:flash-off"},timer:{active:"mdi:play",paused:"mdi:pause",idle:"mdi:sleep"},valve:{open:"mdi:valve-open",closed:"mdi:valve-closed"},weather:{"clear-night":"mdi:weather-night",cloudy:"mdi:weather-cloudy",exceptional:"mdi:alert-circle-outline",fog:"mdi:weather-fog",hail:"mdi:weather-hail",lightning:"mdi:weather-lightning","lightning-rainy":"mdi:weather-lightning-rainy",partlycloudy:"mdi:weather-partly-cloudy",pouring:"mdi:weather-pouring",rainy:"mdi:weather-rainy",snowy:"mdi:weather-snowy","snowy-rainy":"mdi:weather-snowy-rainy",sunny:"mdi:weather-sunny",windy:"mdi:weather-windy","windy-variant":"mdi:weather-windy-variant"},water_heater:{off:"mdi:power-off",eco:"mdi:leaf",electric:"mdi:lightning-bolt",gas:"mdi:fire",heat_pump:"mdi:hvac",high_demand:"mdi:water-plus-outline",performance:"mdi:rocket-launch-outline"}},da=(e,t,i)=>{const s=Qi(e);if(!Object.keys(ra).includes(s))return;let a=ra[s];if("object"==typeof Object.values(a)[0]){const t=i.states[e],s=null==t?void 0:t.attributes.device_class;a=s&&Object.keys(a).includes(s)?a[s]:a._}return Object.keys(a).includes(t)?a[t]:void 0},la=["alarm_control_panel","binary_sensor","climate","calendar","cover","device_tracker","fan","humidifier","input_boolean","input_number","input_select","lawn_mower","light","lock","number","person","proximity","select","sensor","sun","switch","timer","valve","weather","water_heater"],ca=["clear-night","cloudy","exceptional","fog","hail","lightning","lightning-rainy","partlycloudy","pouring","rainy","snowy","snowy-rainy","sunny","windy","windy-variant"],ha=(e,t,i)=>{let s=((e,t)=>{const i=Object.keys(t.states).includes(e)?t.states[e]:void 0,s=Qi(e),a=(null==i?void 0:i.attributes)||{},o=i=>null==i?void 0:i.map(i=>Object({value:i,icon:da(e,i,t)}));switch(s){case"alarm_control_panel":let e=["disarmed","triggered"];return 2&(a.supported_features||0)&&(e=[...e,"armed_away"]),1&(a.supported_features||0)&&(e=[...e,"armed_home"]),4&(a.supported_features||0)&&(e=[...e,"armed_night"]),16&(a.supported_features||0)&&(e=[...e,"armed_custom_bypass"]),32&(a.supported_features||0)&&(e=[...e,"armed_vacation"]),hs({options:o(e),translation_key:"component.alarm_control_panel.entity_component._.state.${value}"});case"binary_sensor":return hs({options:o(["on","off"]),translation_key:"component.binary_sensor.entity_component.${deviceClass}.state.${value}"});case"climate":return hs({options:o(a.hvac_modes),translation_key:"component.climate.entity_component._.state.${value}"});case"calendar":case"fan":case"humidifier":case"input_boolean":case"light":case"switch":return hs({options:o(["on","off"]),translation_key:"component.switch.entity_component._.state.${value}"});case"cover":return hs({options:o(["open","closed"]),translation_key:"component.cover.entity_component._.state.${value}"});case"device_tracker":return hs({options:o(["home","not_home"]),translation_key:"component.device_tracker.entity_component._.state.${value}"});case"input_number":case"number":return vs({min:a.min,max:a.max,step:a.step,mode:a.mode,unit:a.unit_of_measurement});case"input_select":case"select":return hs({options:a.options});case"lawn_mower":return hs({options:o(["mowing","paused","docked"]),translation_key:"component.lawn_mower.entity_component._.state.${value}"});case"lock":return hs({options:o(["locked","unlocked"]),translation_key:"component.lock.entity_component._.state.${value}"});case"person":const s=Object.keys(t.states).filter(e=>"zone"==Qi(e)).map(Ji);return hs({options:[...new Set(["home","not_home",...s])]});case"proximity":return vs({mode:"box",unit:a.unit_of_measurement});case"sensor":return!isNaN(Number(null==i?void 0:i.state))||Ke(a.unit_of_measurement)?vs({mode:"box",unit:a.unit_of_measurement,min:"%"==a.unit_of_measurement?0:void 0,max:"%"==a.unit_of_measurement?100:void 0}):{text:{}};case"sun":return hs({options:o(["above_horizon","below_horizon"]),translation_key:"component.sun.entity_component._.state.${value}"});case"timer":return hs({options:o(["active","paused","idle"]),translation_key:"component.timer.entity_component._.state.${value}"});case"valve":return hs({options:o(["open","closed"]),translation_key:"component.valve.entity_component._.state.${value}"});case"weather":return hs({options:o(ca),translation_key:"component.weather.entity_component._.state.${value}"});case"water_heater":case"climate":return hs({options:o(a.operation_list),translation_key:"component.climate.entity_component._.state.${value}"});default:return{text:{}}}})(e,t),a=Object.keys(i||{}).filter(t=>ts(t,Qi(e))||ts(t,e)).filter(e=>Object.keys(i[e]).includes("states")).sort((e,t)=>e.length-t.length).map(e=>i[e].states).shift();return a&&(Array.isArray(a)?s=hs({options:a}):"object"==typeof a&&"min"in a&&"max"in a&&(s=vs(a))),s},ua=(e,t)=>{let i=Object.keys(e.states).map(e=>Qi(e)).reduce((e,t)=>e.includes(t)?e:[...e,t],[]).filter(e=>((e,t)=>{let i=la.includes(e);return!i&&t?Object.keys(t).map(Qi).includes(e):i})(e,t.customize||{}));return i=i.filter(e=>is(e,t)),i.map(t=>({key:t,name:ns(`component.${t}.title`,e,!1)||t.replace(/_/g," "),description:"",icon:ea(t)}))},pa=(e,t,i)=>{let s=Object.entries(t||{}).filter(([t,i])=>ts(t,e)&&i.icon).map(([e,t])=>t);if(s.length)return s.map(e=>{return(t=e.icon).match(/^[a-z]+\:[a-zA-Z\-]+$/)?t:"mdi:"+t;var t}).shift();if(!Object.keys(i.states).includes(e))return"mdi:help";const a=i.states[e];if(a.attributes.icon)return a.attributes.icon;const o=Qi(e);return ea(o)},ma=(e,t,i)=>{if(["script","notify"].includes(e)){let s=Object.keys(i.services[e]);"script"==e&&(s=s.filter(e=>!["turn_on","turn_off","reload","toggle","test"].includes(e)));let a=s.map(s=>({key:`${e}.${s}`,name:Ms(`${e}.${s}`,i,t),description:"",icon:pa(`${e}.${s}`,t,i)}));return a.sort((e,t)=>as(e.name,t.name)),a}{let s=Object.keys(i.states).filter(t=>Qi(t)==e).map(e=>{var s;return{key:e,name:es(e,null===(s=i.states[e])||void 0===s?void 0:s.attributes),description:"",icon:pa(e,t,i)}});return s.sort((e,t)=>as(e.name,t.name)),s}},_a=(e,t)=>t.every(t=>e.name.toLowerCase().includes(t))||t.every(t=>e.key.toLowerCase().includes(t));let ga=class extends oe{constructor(){super(...arguments),this._search="",this._filter="",this.timer=0,this.expandedGroups=[],this.scheduleEntities=[]}async showDialog(e){this._params=e,this.loadOptions(),await this.updateComplete}async closeDialog(){this._params&&this._params.confirm({domains:this._params.domains,entities:this._params.entities}),this._params=void 0,this._clearSearch(),this._height=void 0,this._width=void 0}loadOptions(){if(!this._params)return;let e=(e=>{let t=ta(e,{include:["*"]}),i=ua(e,{include:["*"]});return i=i.filter(e=>!t.map(e=>e.key).includes(e.key)),t=[...t,...i],t.sort((e,t)=>as(e.name,t.name)),t})(this.hass);this.options=e.map(e=>Object.assign(Object.assign({},e),{entities:ma(e.key,this._params.cardConfig.customize,this.hass)})).filter(e=>e.entities.length)}shouldUpdate(e){return!!(e.has("_params")||e.has("expandedGroups")||e.has("_filter")||e.has("scheduleEntities"))}async firstUpdated(){this.scheduleEntities=Object.entries(await Oe(this.hass)).map(([,e])=>e.entity_id)}async willUpdate(){var e;if(!this._width||!this._height){const t=null===(e=this.shadowRoot.querySelector("ha-list"))||void 0===e?void 0:e.getBoundingClientRect();this._width=null==t?void 0:t.width,this._height=null==t?void 0:t.height}}render(){return this._params?R`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        @wa-after-show=${this._opened}
      >
        <div slot="header">
          <ha-dialog-header>
            <ha-icon-button
              slot="navigationIcon"
              data-dialog="close"
              .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
              .path=${Bs}
            ></ha-icon-button>
            <div slot="title">
              ${Yi("ui.dialog.entity_picker.title",this.hass)}
            </div>
          </ha-dialog-header>

          <ha-input
            dialogInitialFocus
            .placeholder=${ns("ui.common.search",this.hass)}
            aria-label=${ns("ui.common.search",this.hass)}
            @input=${this._handleSearchChange}
            .value=${this._search}
            icon
            .iconTrailing=${this._search}
          >
            <div class="trailing" slot="trailingIcon">
              ${this._search&&R`
                <ha-icon-button
                  @click=${this._clearSearch}
                  .label=${ns("ui.common.clear",this.hass)}
                  .path=${Bs}
                  class="clear-button"
                ></ha-icon-button>
              `}
              <slot name="suffix"></slot>
            </div>
          </ha-input>
        </div>
        
        <ha-list
          style=${na({minWidth:this._width+"px",height:this._height?Math.min(468,this._height)+"px":"auto"})}
        >
          ${this._renderOptions()}
        </ha-list>
      </ha-dialog>
    `:R``}_opened(){var e;const t=null===(e=this.shadowRoot.querySelector("ha-list"))||void 0===e?void 0:e.getBoundingClientRect();this._width=null==t?void 0:t.width,this._height=null==t?void 0:t.height}_handleSearchChange(e){const t=e.currentTarget.value;this._search=t,clearTimeout(this.timer),this.timer=window.setTimeout(()=>{this._filter=this._search},100)}_clearSearch(){this._search="",this._filter=""}_toggleSelectEntity(e){let t=e.target;for(;"HA-LIST-ITEM"!=t.tagName;)t=t.parentElement;t.querySelector("ha-checkbox");const i=t.getAttribute("key");this._params.entities.includes(i)?this._params=Object.assign(Object.assign({},this._params),{entities:this._params.entities.filter(e=>e!=i)}):this._params=Object.assign(Object.assign({},this._params),{entities:[...this._params.entities,i]})}_toggleSelectDomain(e,t){var i;let s=e.target;for(;"HA-LIST-ITEM"!=s.tagName;)s=s.parentElement;const a=s.getAttribute("key"),o=null===(i=this.options)||void 0===i?void 0:i.find(e=>e.key==a).entities.map(e=>e.key);this._params=t?Object.assign(Object.assign({},this._params),{domains:this._params.domains.filter(e=>e!=a),entities:this._params.entities.filter(e=>!(null==o?void 0:o.includes(e)))}):Object.assign(Object.assign({},this._params),{domains:[...this._params.domains,a]}),e.stopPropagation()}closeGroupByKey(e){this.shadowRoot.querySelector("ha-list").childNodes.forEach(t=>{if(t.nodeType==Node.ELEMENT_NODE&&"HA-LIST-ITEM"==t.tagName&&t.getAttribute("key")==e){const e=t,i=e.nextElementSibling,s=e.querySelector("ha-icon-button");i.style.height="0px",e.removeAttribute("expanded"),s.classList.remove("expanded")}})}async _toggleExpandGroup(e){let t=e.target;for(;"HA-LIST-ITEM"!=t.tagName;)t=t.parentElement;const i=t.querySelector("ha-icon-button"),s=t.getAttribute("key");this.expandedGroups.includes(s)||(this.expandedGroups.forEach(e=>this.closeGroupByKey(e)),this.expandedGroups=[s],await this.requestUpdate());const a=t.nextElementSibling,o=a.scrollHeight;t.hasAttribute("expanded")?(t.removeAttribute("expanded"),i.classList.remove("expanded"),a.style.height="0px",setTimeout(()=>{this.expandedGroups=this.expandedGroups.filter(e=>e!=s)},300)):(t.setAttribute("expanded","true"),i.classList.add("expanded"),a.style.height=o+"px")}_renderOptions(){if(!this.options)return;let e=[...this.options];const t=this._filter&&this._filter.trim().length;if(t){const t=this._filter.toLowerCase().trim().split(" ");e=e.map(e=>_a(e,t)||(e=Object.assign(Object.assign({},e),{entities:(e.entities||[]).filter(e=>_a(e,t))})).entities.length?e:void 0).filter(e=>void 0!==e)}return e.length?Object.keys(e).map(i=>{var s,a;const o=e[i].key,n=null===(s=this._params)||void 0===s?void 0:s.domains.includes(o);let r=[...e[i].entities];"switch"==o&&(r=r.filter(e=>!this.scheduleEntities.includes(e.key)));const d=n?r.length:r.filter(e=>{var t;return null===(t=this._params)||void 0===t?void 0:t.entities.includes(e.key)}).length,l=(null===(a=this._params)||void 0===a?void 0:a.domains.includes(o))||e[i].entities.every(e=>{var t;return null===(t=this._params)||void 0===t?void 0:t.entities.includes(e.key)});return R`
        <ha-list-item
          graphic="icon"
          twoline
          hasMeta
          @click=${this._toggleExpandGroup}
          key="${o}"
        >
          <ha-icon slot="graphic" icon="${e[i].icon}"></ha-icon>
          <div slot="meta" class="meta">
            <ha-button
              appearance="plain"
              @click=${e=>this._toggleSelectDomain(e,l)}
              size="small"
            >
              ${ns(l?"ui.components.media-browser.file_management.deselect_all":"ui.components.subpage-data-table.select_all",this.hass)}
            </ha-button>
            <ha-icon-button .path="${Vs}" @click=${e=>{e.target.blur()}} class="chevron"></ha-icon-button>
          </div>
          <span>${e[i].name}</span>
          <span slot="secondary">${Yi("ui.panel.card_editor.fields.entities.included_number",this.hass,["{number}","{total}"],[d,r.length])}</span>
        </ha-list-item>
        ${this.expandedGroups.includes(o)||t?R`
        <div class="group ${t?"open":""}">
          <li role="divider"></li>
        ${r.map(e=>{var t,i;return R`
          <ha-list-item
            graphic="icon"
            twoline
            hasMeta
            @click=${this._toggleSelectEntity}
            class="nested"
            key="${e.key}"
          >
            ${Object.keys(this.hass.states).includes(e.key)?R`<ha-state-icon .stateObj=${this.hass.states[e.key]} .hass=${this.hass} slot="graphic"></ha-state-icon>`:R`<ha-icon slot="graphic" icon="${e.icon}"></ha-icon>`}
            <ha-checkbox
              slot="meta"
              ?checked=${(null===(t=this._params)||void 0===t?void 0:t.entities.includes(e.key))||(null===(i=this._params)||void 0===i?void 0:i.domains.includes(o))}
            ></ha-checkbox>

            <span>${e.name}</span>
            <span slot="secondary">${e.key}</span>
          </ha-list-item>
        `})}
          <li role="divider"></li>
        </div>
      `:""}
      `}):R`
        <ha-list-item disabled>
          ${ns("ui.components.entity.entity-picker.no_match",this.hass)}
        </ha-list-item>
      `}static get styles(){return r`
      ha-dialog {
        --dialog-content-padding: 0;
        --ha-dialog-width-md: 480px;
      }
      ha-input {
        display: block;
        margin: 0 16px;
      }
      ha-list {
        min-height: 300px;
      }
      ha-list-item {
        --mdc-ripple-hover-opacity: 0.04;
        --mdc-ripple-focus-opacity: 0.04;
        --mdc-ripple-press-opacity: 0.12;
        --mdc-list-item-meta-size: 180px;
      }
      ha-list-item.nested {
        --mdc-list-item-meta-size: 48px;
        --mdc-list-side-padding: 32px;
      }
      ha-list-item.nested ha-icon {
        display: flex;
        justify-content: flex-end;
      }
      ha-list-item ha-checkbox, ha-list-item ha-icon-button, ha-list-item ha-button {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      div.group {
        height: 0px;
        overflow: hidden;
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
        box-sizing: border-box;
      }
      div.group.open {
        height: auto;
      }
      ha-list-item .chevron {
        transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      ha-list-item .chevron.expanded {
        transform: rotate(180deg);
      }
      div.group li {
        width: 100%;
        height: 1px;
        display: block;
        background: var(--divider-color);
        margin: 0px 10px;
      }
      div.meta {
        display: flex;
        justify-content: flex-end;
        align-items: center;
      }
    `}};t([le({attribute:!1})],ga.prototype,"hass",void 0),t([ce()],ga.prototype,"_params",void 0),t([ce()],ga.prototype,"_search",void 0),t([ce()],ga.prototype,"_filter",void 0),t([ce()],ga.prototype,"_width",void 0),t([ce()],ga.prototype,"_height",void 0),t([ce()],ga.prototype,"expandedGroups",void 0),t([ce()],ga.prototype,"options",void 0),t([ce()],ga.prototype,"scheduleEntities",void 0),ga=t([re("dialog-select-entities")],ga);var va=Object.freeze({__proto__:null,get DialogSelectEntities(){return ga}});let fa=class extends oe{constructor(){super(...arguments),this.active=!1}render(){return R`
      <div class="chip ${this.active?"active":""}" @click=${this._handleClick}>
        <div class="overlay"></div>
        ${this.renderIcon()}
        <span class="value"><slot></slot></span>
        ${this.renderTrailingIcon()}
      </div>
    `}renderIcon(){if(!this.icon&&!this.toggleable&&!this.useStateIcon)return q;if(this.toggleable)return R`
        <div class="icon">
          <ha-icon
            icon="mdi:check"
          ></ha-icon>
        </div>
      `;if(this.useStateIcon){let e=this.hass.states[this.value||""];return R`
          <div class="icon filled">
            ${e?R`<ha-state-icon .stateObj=${e} .hass=${this.hass}></ha-state-icon>`:R`<ha-icon icon="mdi:help-circle-outline"></ha-icon>
            `}
          </div>
        `}return R`
        <div class="icon filled">
          <ha-icon
            .icon=${this.icon}
          ></ha-icon>
        </div>
      `}renderTrailingIcon(){const e="icn_"+Math.random().toString(36).substring(2,9);return this.removable||this.badge?this.badge?R`
        <div class="badge">
          ${this.badge}
        </div>
      `:R`
        <div class="trailing-icon" @click=${this._iconClick}>
          <ha-icon icon="mdi:close" id="${e}"></ha-icon>
          ${this.disabled?q:R`<ha-tooltip for="${e}">${ns("ui.common.remove",this.hass)}</ha-tooltip>`}
        </div>
      `:q}_handleClick(e){if(!this.disabled){if(this.toggleable){this.active=!this.active;const e=new CustomEvent("click",{detail:{active:this.active,value:this.value}});this.dispatchEvent(e)}else if(this.selectable){const e=new CustomEvent("click",{detail:{value:this.value}});this.dispatchEvent(e)}e.stopPropagation()}}_iconClick(e){if(e.stopPropagation(),this.disabled)return;const t=new CustomEvent("icon-clicked",{detail:{value:this.value}});this.dispatchEvent(t)}static get styles(){return r`
      :host {
        margin: 4px;
      }
      .chip {
        display: inline-flex;
        position: relative;
        height: var(--chip-height, 32px);
        background: none;
        user-select: none;
        z-index: 0;
        align-items: center;
        justify-content: center;
      }
      .chip:before {
        position: absolute;
        pointer-events: none;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        content: '';
        border: 1px solid var(--chip-color, rgb(168, 225, 251));
        border-radius: var(--chip-border-radius, 32px);
        background: rgba(0, 0, 0, 0);
        opacity: var(--background-opacity, 1);
        z-index: -2;
      }
      .chip.active:before {
        background: var(--chip-color, rgb(168, 225, 251));
      }
      .icon {
        position: relative;
        width: 32px;
        height: 32px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 20px;
        margin-right: -8px;
        color: rgba(0, 0, 0, 0.54);
      }
      .icon.filled:before {
        position: absolute;
        pointer-events: none;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        content: '';
        background: var(--chip-color, rgb(168, 225, 251));
        border-radius: 32px;
        z-index: -2;
      }
      .value {
        color: var(--primary-text-color);
        font-size: var(--chip-font-size, 0.875rem);
        font-weight: 400;
        display: flex;
        align-items: center;
        padding: 0px 12px;
        opacity: 0.9;
      }
      .trailing-icon {
        position: relative;
        width: 26px;
        height: 26px;
        border-radius: 13px;
        display: flex;
        align-items: center;
        justify-content: center;
        --mdc-icon-size: 16px;
        margin: 0px 3px 0px -8px;
        color: var(--secondary-text-color);
        cursor: pointer;
      }
      .trailing-icon:before {
        position: absolute;
        pointer-events: none;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        content: '';
        background: var(--chip-color, var(--secondary-text-color));
        border-radius: 26px;
        z-index: -2;
        opacity: 0;
        transition: opacity 0.1s ease-in-out;
      }
      .trailing-icon:hover:before {
        opacity: 0.15;
      }
      .trailing-icon:active:before {
        opacity: 0.3;
      }
      :host([disabled]) .trailing-icon:hover:before, :host([disabled]) .trailing-icon:active:before {
        opacity: 0;
      }
      :host([disabled]) .trailing-icon {
        cursor: not-allowed;
      }
      :host([selectable]) .chip, :host([toggleable]) .chip {
        cursor: pointer;
      }
      .overlay {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: -1;
        background: rgba(0, 0, 0, 0);
        border-radius: var(--chip-border-radius, 32px);
        transition: background-color 0.1s ease-in-out, border 0.1s ease-in-out;
        border: 1px solid rgba(0, 0, 0, 0);
      }
      :host([selectable]) .chip:hover .overlay, :host([toggleable]) .chip:hover .overlay {
        border: 1px solid rgba(0, 0, 0, 0.05);
        background: rgba(0, 0, 0, 0.05);
      }
      :host([selectable]) .chip:active .overlay, :host([toggleable]) .chip:active .overlay {
        border: 1px solid rgba(0, 0, 0, 0.1);
        background: rgba(0, 0, 0, 0.1);
      }
      :host([selectable]) .chip:hover .value, :host([toggleable]) .chip:hover .value {
        opacity: 1;
      }
      :host([active]):host([selectable]) .chip:hover .overlay, :host([active]):host([toggleable]) .chip:hover .overlay {
        background: rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(0, 0, 0, 0);
      }
      :host([active]):host([selectable]) .chip:active .overlay, :host([active]):host([toggleable]) .chip:active .overlay {
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(0, 0, 0, 0);
      }
      
      :host([toggleable]) .icon {
        width: 0px;
        transition: width 0.1s ease-in-out;
        overflow: hidden;
        display: flex;
        align-items: center;
        margin-left: 12px;
      }
      :host([toggleable]) .active .icon {
        width: 20px;
      }
      .badge {
        position: relative;
        display: flex;
        height: 26px;
        min-width: 26px;
        border-radius: 13px;
        font-size: var(--chip-font-size, 0.875rem);
        align-items: center;
        justify-content: center;
        margin: 0px 3px 0px -8px;
      }
      .badge:before {
        position: absolute;
        pointer-events: none;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        content: '';
        background: var(--chip-color, var(--secondary-text-color));
        border-radius: 26px;
        z-index: -2;
        transition: opacity 0.1s ease-in-out;
        opacity: 0.1;
      }
    `}};t([le({attribute:!1})],fa.prototype,"hass",void 0),t([le({type:String})],fa.prototype,"icon",void 0),t([le({type:Boolean})],fa.prototype,"useStateIcon",void 0),t([le({type:Boolean})],fa.prototype,"selectable",void 0),t([le({type:Boolean})],fa.prototype,"removable",void 0),t([le({type:Boolean})],fa.prototype,"toggleable",void 0),t([le({type:Boolean})],fa.prototype,"active",void 0),t([le({type:String})],fa.prototype,"badge",void 0),t([le({type:String})],fa.prototype,"value",void 0),t([le({type:Boolean})],fa.prototype,"disabled",void 0),fa=t([re("scheduler-chip")],fa);let ba=class extends oe{constructor(){super(...arguments),this.value=[]}render(){return this.items?R`
      ${Object.values(this.items).map(e=>this.renderChipitem(e))}
    `:R``}renderChipitem(e){const t=e.useStateIcon&&!Object.keys(this.hass.states).includes(e.value||"");return R`
      <scheduler-chip
        .hass=${this.hass}
        .value=${e.value||e.name}
        .icon=${e.icon}
        ?useStateIcon=${e.useStateIcon}
        ?active=${this.value.includes(e.value||e.name)}
        .badge=${void 0!==e.badge?String(e.badge):void 0}
        ?selectable=${this.selectable}
        ?toggleable=${this.toggleable}
        ?removable=${this.removable}
        @click=${this._handleClick}
        @icon-clicked=${this._handleClick}
        ?disabled=${this.disabled}
        style="${t?"text-decoration: line-through":""}"
      >
        ${e.name}
      </scheduler-chip>
      `}_handleClick(e){if(!this.disabled)if(this.toggleable){const t=e.detail.value,i=e.detail.active;this.value.includes(t)&&!i?this.value=this.value.filter(e=>e!=t):!this.value.includes(t)&&t&&(this.value=[...this.value,t]);const s=new CustomEvent("value-changed",{detail:this.value});this.dispatchEvent(s)}else{const t=new CustomEvent("value-changed",{detail:e.detail.value});this.dispatchEvent(t)}}static get styles(){return r`
      :host {
        display: flex;
        flex-direction: row;
        flex: 1;
        margin: 0px -4px;
        flex-wrap: wrap;
      }
      scheduler-chip {
        display: inline-flex;
        margin-bottom: 4px;
      }
    `}};t([le({attribute:!1})],ba.prototype,"hass",void 0),t([le({attribute:!1})],ba.prototype,"items",void 0),t([le({attribute:!1})],ba.prototype,"value",void 0),t([le({type:Boolean})],ba.prototype,"selectable",void 0),t([le({type:Boolean})],ba.prototype,"toggleable",void 0),t([le({type:Boolean})],ba.prototype,"removable",void 0),t([le({type:Boolean})],ba.prototype,"disabled",void 0),ba=t([re("scheduler-chip-set")],ba);const ya=[{name:"primary",weight:10},{name:"secondary",weight:8}];let wa=class extends oe{constructor(){super(...arguments),this.value=[],this.multiple=!1,this.disabled=!1,this.multipleMode=!1,this.scheduleEntities=[],this._valueRenderer=e=>{Array.isArray(e)&&(e=e.length?[...e].pop():"");const t=e||"",i=this.hass.states[t];if(!i)return R`
        <ha-svg-icon
          slot="start"
          .path=${Gs}
          style="margin: 0 4px"
        ></ha-svg-icon>
        <span slot="headline">${t}</span>
      `;const s=this._parseEntityItem(t);return R`
      ${s.icon?R`
        <ha-icon
          slot="start"
          icon="${s.icon}"
        ></ha-icon>
       `:R`
      <state-badge
        .hass=${this.hass}
        .stateObj=${i}
        slot="start"
        color="var(--icon-primary-color)"
      ></state-badge>
      `}
      <span slot="headline">${s.primary}</span>
      <span slot="supporting-text">${s.secondary}</span>
    `},this._rowRenderer=e=>{const t=e.id||"",i=this.hass.states[t];return R`
      <ha-combo-box-item type="button" compact>
        ${e.icon?R`
          <ha-icon
            slot="start"
            icon="${e.icon}"
          ></ha-icon>
        `:i?R`
          <state-badge
            .hass=${this.hass}
            .stateObj=${i}
            slot="start"
            color="var(--icon-primary-color)"
          ></state-badge>
        `:R`
          <ha-svg-icon
            slot="start"
            .path=${Gs}
          ></ha-svg-icon>
        `}
        <span slot="headline">${e.primary}</span>
        ${e.secondary?R`<span slot="supporting-text">${e.secondary}</span>`:q}
      </ha-combo-box-item>
    `},this._filteredItems=()=>{let e=Object.keys(this.hass.states);return this.domain&&(e=e.filter(e=>Qi(e)==this.domain)),this.multiple&&(e=e.filter(e=>{var t;return!(null===(t=this.value)||void 0===t?void 0:t.includes(e))})),this.config&&(e=e.filter(e=>((this.config.include||Be).some(t=>ts(t,e))||Object.keys(this.config.customize||{}).some(t=>ts(t,e)))&&!(this.config.exclude||[]).some(t=>ts(t,e)))),e=e.filter(e=>!this.scheduleEntities.includes(e)),this.filterFunc&&(e=e.filter(e=>this.filterFunc(this.hass.states[e]))),e.map(e=>this._parseEntityItem(e))}}async firstUpdated(){this.scheduleEntities=Object.entries(await Oe(this.hass)).map(([,e])=>e.entity_id),this.domain&&this.config&&!is(this.domain,this.config)&&(this.config=Object.assign(Object.assign({},this.config),{include:[...this.config.include||[],this.domain],exclude:[...(this.config.exclude||[]).filter(e=>!e.startsWith(this.domain))]})),this._autoSelectIfSingleEntity()}updated(e){super.updated(e),e.has("domain")&&this._autoSelectIfSingleEntity()}_autoSelectIfSingleEntity(){if(this.value&&this.value.length>0)return;const e=this._filteredItems();1===e.length&&(this.value=[e[0].id],Rs(this,"value-changed",{value:this.value}))}render(){var e,t;return R`
      ${this.renderChips()}

      ${(null===(e=this.value)||void 0===e?void 0:e.length)&&!this.multipleMode&&this.multiple?q:R`

      <ha-generic-picker
        .label=${(null===(t=this.value)||void 0===t?void 0:t.length)?"":ns("ui.components.entity.entity-picker.choose_entity",this.hass)}
        .hass=${this.hass}
        .autofocus=${this.autofocus}
        .notFoundLabel=${ns("ui.components.combo-box.no_match",this.hass)}
        .value=${this.multiple?"":this.value}
        .valueRenderer=${this._valueRenderer}
        .rowRenderer=${this._rowRenderer}
        .disabled=${this.disabled}
        .getItems=${this._filteredItems}
        .searchKeys=${ya}
        .searchLabel=${ns("ui.dialogs.quick-bar.filter_placeholder",this.hass)}
        @value-changed=${this._valueChanged}
        hide-clear-icon
        allow-custom-value
      >
      </ha-generic-picker>
      `}
    `}renderChips(){if(!this.multiple)return q;let e=(this.value||[]).map(e=>{const t=this._parseEntityItem(e);return{name:t.primary,value:e,useStateIcon:!t.icon,icon:t.icon}});return R`
      <div class="wrapper">
      <scheduler-chip-set
        .hass=${this.hass}
        .items=${e}
        removable
        @value-changed=${this._removeClick}
        ?disabled=${this.disabled}
      >
      </scheduler-chip-set>
      <div class="column-right">
      ${e.length?R`
      <ha-icon-button
        @click=${e=>{this.multipleMode=!this.multipleMode,e.target.blur()}}
        .path=${this.multipleMode?"M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z":Vs}
        slot="end"
      ></ha-icon-button>
      `:q}
      </div>
      </div>
      `}_valueChanged(e){let t=e.detail.value;const i=e.currentTarget;t&&(this.value=[...this.value||[],t],this.multiple&&(i.value=""),Rs(this,"value-changed",{value:this.value}),e.stopPropagation())}_removeClick(e){const t=e.detail;this.value=(this.value||[]).filter(e=>e!==t),Rs(this,"value-changed",{value:this.value})}_parseEntityItem(e){var t,i,s,a;const o=Object.entries((null===(t=this.config)||void 0===t?void 0:t.customize)||{}).filter(([t,i])=>ts(t,e)).map(([e,t])=>t),n=null===(i=o.find(e=>"name"in e))||void 0===i?void 0:i.name,r=null===(s=o.find(e=>"icon"in e))||void 0===s?void 0:s.icon;return{id:e,primary:n||es(e,null===(a=this.hass.states[e])||void 0===a?void 0:a.attributes),secondary:e,icon:r}}};wa.styles=r`
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    :host > * {
      display: block;
      width: 100%;
    }
    div.wrapper {
      display: flex;
    }
    scheduler-chip-set {
      display: flex;
    }
    div.column-right {
      display: flex;
    }
    div.column-right ha-icon-button {
      display: flex;
      align-self: flex-end;
    }
  `,t([le({attribute:!1})],wa.prototype,"hass",void 0),t([le()],wa.prototype,"domain",void 0),t([le()],wa.prototype,"config",void 0),t([le({type:Array})],wa.prototype,"value",void 0),t([le({type:Boolean})],wa.prototype,"multiple",void 0),t([le({type:Boolean})],wa.prototype,"disabled",void 0),t([ce()],wa.prototype,"multipleMode",void 0),t([ce()],wa.prototype,"scheduleEntities",void 0),wa=t([re("scheduler-entity-picker")],wa);let ka=class extends oe{constructor(){super(...arguments),this.expanded=!1,this.disabled=!1,this.idx=-1,this.openClose=new CustomEvent("open-close",{detail:{},bubbles:!0,composed:!0})}render(){return R`
      <div
        class="header ${this.expanded?"expanded":""}"
        @click=${this._toggleContent}
        @focus=${this._focusChanged}
        @blur=${this._focusChanged}
        role="button"
        tabindex="0"
        aria-expanded=${this.expanded}
        aria-controls="sect1"
      >
        ${this.disabled?"":R`
        <ha-icon
          icon="mdi:chevron-down"
          class="chevron ${this.expanded?"expanded":""}"
        ></ha-icon>
        `}
        <slot name="header" class="title"></slot>
        <div id="contextMenu">
          <slot name="contextMenu">
          </slot>
        </div>
      </div>

      <div class="container">
        <slot name="content"></slot>
      </div>
    `}_toggleContent(){this.disabled||this.dispatchEvent(this.openClose)}attributeChangedCallback(e,t,i){let s=void 0;if(null!==this.shadowRoot)for(const e of this.shadowRoot.children)if("container"==e.className){s=e;break}if(s)if(this.hasAttribute("expanded")){const e=s.scrollHeight;s.style.height=e+"px"}else s.style.height="0px";super.attributeChangedCallback(e,t,i)}_focusChanged(e){this.disabled||this.shadowRoot.querySelector(".header").classList.toggle("focused","focus"===e.type)}static get styles(){return r`
      :host {
        display: block;
        border-radius: 12px;
        border: 1px solid var(--divider-color);
        box-sizing: border-box;
        margin: 8px 0px;
        position: relative;
      }
      .header {
        display: flex;
        width: 100%;
        border-radius: 12px;
        padding: 12px;
        box-sizing: border-box;
        cursor: pointer;
      }
      :host([disabled]) .header {
        cursor: default;
      }
      .header .title {
        font-weight: 600;
        padding: 0px 8px;
      }
      .header ::slotted(div) {
        flex: 1;
        margin-right: 32px;
      }
      .header.focused {
        background: var(--input-fill-color);
      }
      .header.expanded {
        border-radius: 12px 12px 0px 0px;
      }
      #contextMenu {
        position: absolute;
        right: 0px;
        top: 0px;
      }

      .chevron {
        transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
        direction: var(--direction);
        margin-left: 0px;
      }
      .chevron.expanded {
        transform: rotate(180deg);
      }
      .container {
        overflow: hidden;
        transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1);
        padding: 0px 12px;
        box-sizing: border-box;
        height: 0px;
      }
      :host([disabled]) .container {
        height: auto;
      }
      .container.expanded {
        height: auto;
      }
      @media all and (max-width: 450px) {
        .container {
          padding: 0px;
        }
      }
    `}};t([le({type:Boolean,reflect:!0})],ka.prototype,"expanded",void 0),t([le({type:Boolean,reflect:!0})],ka.prototype,"disabled",void 0),t([le({attribute:!0})],ka.prototype,"idx",void 0),t([le({type:CustomEvent})],ka.prototype,"openClose",void 0),ka=t([re("scheduler-collapsible-section")],ka);let xa=class extends oe{set openedItem(e){e!==this._openedItem&&void 0!==e&&setTimeout(()=>{this.updateOpenedItem(e)},50)}constructor(){super(),this.disabled=!1,this._openedItem=-1,this._numItems=0,this.addEventListener("open-close",this.toggleActiveSection)}firstUpdated(){const e=this.querySelectorAll("scheduler-collapsible-section");this._numItems=e.length}toggleActiveSection(e){if(this.disabled)return;const t=e.target,i=Number(t.getAttribute("idx"));"true"===t.getAttribute("expanded")?this.updateOpenedItem(-1):this.updateOpenedItem(i)}updateOpenedItem(e){this.querySelectorAll("scheduler-collapsible-section").forEach((function(t){const i=Number(t.getAttribute("idx"));i!==e&&t.getAttribute("expanded")?t.removeAttribute("expanded"):i!==e||t.getAttribute("expanded")||t.setAttribute("expanded","true")})),this._openedItem=e;const t=new CustomEvent("openclose-changed",{detail:{item:e}});this.dispatchEvent(t)}render(){return R`
      <slot></slot>
    `}};t([le()],xa.prototype,"disabled",void 0),t([ce()],xa.prototype,"_openedItem",void 0),t([ce()],xa.prototype,"_numItems",void 0),xa=t([re("scheduler-collapsible-group")],xa);const $a="__NONE_OPTION__";let Sa=class extends oe{constructor(){super(...arguments),this.disabled=!1}render(){var e;if(this.config.select){const e=this.config.select,t=[this.value||[]].flat().map(String),i=e=>{const i=e.detail;this.value=t.filter(e=>e!=i),Rs(this,"value-changed",{value:this.value})},s=()=>{let e=t.map(e=>Object({name:e,value:e}));return R`
        <scheduler-chip-set
          .hass=${this.hass}
          .items=${e}
          removable
          @value-changed=${i}
        >
        </scheduler-chip-set>`},a=e=>{var t;let i=null===(t=this.config.select)||void 0===t?void 0:t.translation_key,s="";return i&&(s=ns(i.replace("${value}",e),this.hass,!1)),s||(s=e),s},o=e=>"object"==typeof e?{id:e.value,primary:a(e.label),icon:e.icon}:{id:e,primary:a(e)};let n=[...null==e?void 0:e.options].map(o),r=[this.value||[]].flat().map(String);n=[...n,...r.filter(e=>!n.find(t=>t.id==e)).map(o)],Array.isArray(this.value)&&(n=n.filter(e=>"object"==typeof e?!t.includes(e.id):!t.includes(e)));const d=()=>{if(!n.length)return R`
          <ha-dropdown-item .value=${$a}>
            ${this.hass.localize("ui.components.combo-box.no_match")}
          </ha-dropdown-item>
        `;n.some(e=>e.icon);return n.map(e=>R`
          <ha-dropdown-item
            .value=${e.id}
          >
            ${e.icon?R`<ha-icon slot="icon" .icon=${e.icon}></ha-icon>`:q}
            <span>${e.primary}</span>
          </ha-dropdown-item>
        `)},l=e=>{let t=e.target,i=t.querySelector("ha-picker-field");this.style.setProperty("--select-menu-width",i.offsetWidth+"px"),t.classList.add("opened")},c=e=>{e.target.classList.remove("opened")},h=e=>{const t=e.detail.item.value;(t!=$a&&!Array.isArray(this.value)||(e.target.value=void 0,t!=$a))&&this._valueChanged(new CustomEvent("value-changed",{detail:{value:t}}))},u=()=>{this._valueChanged(new CustomEvent("value-changed",{detail:{value:void 0}}))},p=Ke(this.value)&&!Array.isArray(this.value)?n.find(e=>e.id===this.value):void 0,m=p?p.primary||p.id:Ke(this.value)&&!Array.isArray(this.value)?this.value:void 0;return R`
        <div class="select-wrapper">
          ${e.multiple?R`
          <div class="chips">
          ${s()}
          </div>
          `:""}
          <ha-dropdown
            placement="bottom"
            @wa-select=${h}
            @wa-show=${l}
            @wa-hide=${c}
          >
            <ha-picker-field
              slot="trigger"
              type="button"
              compact
              @clear=${u}
              .disabled=${this.disabled}
              .hideClearIcon=${this.disabled||!Ke(this.value)||Array.isArray(this.value)&&!this.value.length}
              .value=${m}
              .icon=${null==p?void 0:p.icon}
            >
            </ha-picker-field>
            ${d()}
          </ha-dropdown>
        </div>
      `}if(this.config.number){const t=this.config.number,i="box"==t.mode||!Ke(t.min)||!Ke(t.max);let s=this.value;i||"number"==typeof s||(s=t.min),"number"==typeof t.scale_factor&&(s=Number(s)/t.scale_factor),"number"==typeof(null==t?void 0:t.step)&&(s=Math.round(Number(s)/t.step)*t.step),Ke(s)&&(s=_s(Number(s)));const a=e=>{let i=Number(e.target.value);"number"==typeof t.scale_factor&&(i*=t.scale_factor),"number"==typeof(null==t?void 0:t.step)&&(i=Math.round(i/t.step)*t.step),i=_s(i),this._valueChanged(new CustomEvent("value-changed",{detail:{value:i}})),e.stopPropagation()},o=e=>{e.stopPropagation();let t=e.target.value;const i=""===t||isNaN(Number(t))?void 0:Number(t);this._valueChanged(new CustomEvent("value-changed",{detail:{value:i}}))},n=(e,i)=>{let s=t.step&&Number(t.step)%1==0?null!==e.match(/^-?\d+$/):null!==e.match(/^[+-]?\d+([.,]\d+)?$/);return s&&Ke(t.min)&&(s=Number(e)>=t.min),s&&Ke(t.max)&&(s=Number(e)<=t.max),{valid:s,customError:!s}};return R`
        <div class="slider-wrapper">
        ${i?R`
        <ha-input
          .inputMode=${t.step&&Number(t.step)%1==0?"numeric":"decimal"}
          .min=${t.min}
          .max=${t.max}
          .value=${s||""}
          .step=${null!==(e=t.step)&&void 0!==e?e:1}
          .disabled=${this.disabled}
          .required=${!0}
          .suffix=${t.unit}
          type="number"
          autoValidate
          .validityTransform=${n}
          @input=${o}
        >
        </ha-input>
        `:R`
        <ha-slider
          .min=${t.min}
          .max=${t.max}
          .step=${t.step||1}
          .value=${s}
          @change=${a}
          @input=${a}
          ?disabled=${this.disabled}
        ></ha-slider>
        <span class="value">${s} ${t.unit||""}</span>
        `}
        </div>
      `}if(this.config.text){this.config.text;return R`
        <div class="textfield-wrapper">
          <ha-input
            .value=${this.value||""}
            @input=${this._valueChanged}
            .placeholder=""
            ?disabled=${this.disabled}
          ></ha-input> 
        </div>     
      `}if(this.config.boolean){let e={select:{options:[{value:"true",label:"True",icon:"mdi:check"},{value:"false",label:"False",icon:"mdi:close"}]}};const t=e=>{let t=Ke(e.detail.value)?"true"===e.detail.value:void 0;e.stopPropagation(),this._valueChanged(new CustomEvent("value-changed",{detail:{value:t}}))};return R`
        <scheduler-combo-selector
          .hass=${this.hass}
          .config=${e}
          .value=${"boolean"==typeof this.value?this.value?"true":"false":void 0}
          @value-changed=${t}
          ?disabled=${this.disabled}
        >
        </scheduler-combo-selector>
      `}return R``}_valueChanged(e){if(e.stopPropagation(),Array.isArray(this.value)){let t=e.detail.value;if(!t)return;this.value=[...this.value,t]}else if(e.detail){let t=e.detail.value;void 0===t&&(t=null),this.value=t}else this.value=e.target.value;Rs(this,"value-changed",{value:this.value})}};Sa.styles=r`
      :host {
        display: flex;
        width: 100%;
      }
      div.slider-wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
        gap: 4px;
      }
      div.slider-wrapper > * {
        display: flex;
      }
      div.slider-wrapper ha-slider {
        flex: 1;
      }
      div.slider-wrapper span {
        justify-content: center;
        align-self: center;
        min-width: 45px;
        text-align: end;
      }
      div.slider-wrapper ha-input {
        --ha-input-input-width: 100px;
      }
      div.select-wrapper {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      div.textfield-wrapper {
        display: flex;
        width: 100%;
      }
      div.textfield-wrapper ha-input {
        display: flex;
        width: 100%;
      }
      ha-dropdown::part(menu) {
        min-width: var(--select-menu-width);
      }
  `,t([le({attribute:!1})],Sa.prototype,"hass",void 0),t([le({attribute:!1})],Sa.prototype,"config",void 0),t([le()],Sa.prototype,"value",void 0),t([le({type:Boolean})],Sa.prototype,"disabled",void 0),Sa=t([re("scheduler-combo-selector")],Sa);let ja=class extends oe{constructor(){super(...arguments),this._config={},this.title="",this.tagOptions=[],this.customTagValue=""}setConfig(e){this._config=Object.assign({},e)}async firstUpdated(){this.title="string"==typeof this._config.title?this._config.title:"";const e=(await qs(this.hass)).map(e=>e.name);e.sort(as),this.tagOptions=e}render(){var e,t,i,s,a,o,n,r;const d={number:{min:0,max:30,step:1,unit_of_measurement:Yi("ui.panel.card_editor.fields.time_step.unit_minutes",this.hass)}},l={select:{options:this.tagOptions,multiple:!0,custom_value:!0}};return R`
      <div class="card-config">

        <ha-button @click=${this._showIncludedEntitiesDialog} outlined>
          ${Yi("ui.panel.card_editor.fields.entities.button_label",this.hass)}
          <ha-svg-icon
            slot="trailingIcon"
            .path=${"M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"}
          ></ha-svg-icon>
        </ha-button>

        <scheduler-settings-row ?showPrefix=${!0}>
          <ha-checkbox
            slot="prefix"
            ?checked=${!1!==this._config.title}
            @change=${this._setEnableTitle}
          >
          </ha-checkbox>
          <span slot="heading">${Yi("ui.panel.card_editor.fields.title.heading",this.hass)}</span>

          <ha-input
            .value=${this.title}
            @input=${this._setTitle}
            .placeholder=${Yi("ui.panel.common.title",this.hass)}
            ?disabled=${!1===this._config.title}
          ></ha-input>

        </scheduler-settings-row>

        <div class="two-columns" style="margin: 10px 0px 15px 0px">
        <div class="column">
          <ha-formfield label="${Yi("ui.panel.card_editor.fields.discover_existing.heading",this.hass)}">
            <ha-switch
              ?checked=${!1!==this._config.discover_existing}
              @change=${e=>{this._updateConfig({discover_existing:e.target.checked})}}
            ></ha-switch>
          </ha-formfield>
        </div>
        <div class="column">
          <ha-formfield label="${Yi("ui.panel.card_editor.fields.show_header_toggle.heading",this.hass)}">
            <ha-switch
              ?checked=${this._config.show_header_toggle}
              @change=${e=>{this._updateConfig({show_header_toggle:e.target.checked})}}
            ></ha-switch>
          </ha-formfield>
        </div>
        <div class="column">
          <ha-formfield label="${Yi("ui.panel.card_editor.fields.show_toggle_switches.heading",this.hass)}">
            <ha-switch
              ?checked=${!1!==this._config.show_toggle_switches}
              @change=${e=>{this._updateConfig({show_toggle_switches:e.target.checked})}}
            ></ha-switch>
          </ha-formfield>
        </div>
        </div>

        <span>${Yi("ui.panel.card_editor.fields.default_view.heading",this.hass)}</span>
        <div class="two-columns">
          <div class="column radio"
            @click=${()=>{this._updateConfig({default_view:pe.Overview})}}
          >
            <ha-icon
              icon="${this._config.default_view!==pe.List?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${this._config.default_view!==pe.List?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.default_view.options.overview",this.hass)}</span>
          </div>
          <div class="column radio"
            @click=${()=>{this._updateConfig({default_view:pe.List})}}
          >
            <ha-icon
              icon="${this._config.default_view===pe.List?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${this._config.default_view===pe.List?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.default_view.options.list",this.hass)}</span>
          </div>
        </div>

        <div class="two-columns" style="margin: 10px 0px 15px 0px">
          <div class="column">
            <ha-formfield label="${Yi("ui.panel.card_editor.fields.show_view_toggle.heading",this.hass)}">
              <ha-switch
                ?checked=${!1!==this._config.show_view_toggle}
                @change=${e=>{this._updateConfig({show_view_toggle:e.target.checked})}}
              ></ha-switch>
            </ha-formfield>
          </div>
          <div class="column">
            <ha-formfield label="${Yi("ui.panel.card_editor.fields.show_clock.heading",this.hass)}">
              <ha-switch
                ?checked=${!1!==this._config.show_clock}
                @change=${e=>{this._updateConfig({show_clock:e.target.checked})}}
              ></ha-switch>
            </ha-formfield>
          </div>
          <div class="column">
            <ha-formfield label="${Yi("ui.panel.card_editor.fields.overview_editing.heading",this.hass)}">
              <ha-switch
                ?checked=${!1!==this._config.overview_editing}
                @change=${e=>{this._updateConfig({overview_editing:e.target.checked})}}
              ></ha-switch>
            </ha-formfield>
          </div>
          <div class="column">
            <ha-formfield label="${Yi("ui.panel.card_editor.fields.show_quick_add.heading",this.hass)}">
              <ha-switch
                ?checked=${!1!==this._config.show_quick_add}
                @change=${e=>{this._updateConfig({show_quick_add:e.target.checked})}}
              ></ha-switch>
            </ha-formfield>
          </div>
        </div>

        <scheduler-settings-row>
          <span slot="heading">${Yi("ui.panel.card_editor.fields.time_step.heading",this.hass)}</span>

          <scheduler-combo-selector
            .hass=${this.hass}
            .config=${d}
            .value=${this._config.time_step||15}
            @value-changed=${e=>{this._updateConfig({time_step:e.detail.value})}}
          >
          </scheduler-combo-selector>
        </scheduler-settings-row>

        <span>${Yi("ui.panel.card_editor.fields.default_editor.heading",this.hass)}</span>
        <div class="two-columns">
          <div class="column radio"
            @click=${()=>{this._updateConfig({default_editor:me.Single})}}
          >
            <ha-icon
              icon="${this._config.default_editor!=me.Scheme?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${this._config.default_editor!=me.Scheme?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.default_editor.options.single",this.hass)}</span>
          </div>
          <div class="column radio"
            @click=${()=>{this._updateConfig({default_editor:me.Scheme})}}
          >
            <ha-icon
              icon="${this._config.default_editor==me.Scheme?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${this._config.default_editor==me.Scheme?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.default_editor.options.scheme",this.hass)}</span>
          </div>
        </div>

          <span slot="heading">${Yi("ui.panel.card_editor.fields.sort_by.heading",this.hass)}</span>

        <div class="two-columns">
          <div class="column radio"
            @click=${()=>{this._setSortBy("relative-time")}}
          >
            <ha-icon
              icon="${[this._config.sort_by||Ve].flat().includes("relative-time")?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${[this._config.sort_by||Ve].flat().includes("relative-time")?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.sort_by.options.relative_time",this.hass)}</span>
          </div>
          <div class="column radio"
            @click=${()=>{this._setSortBy("title")}}
          >
            <ha-icon
              icon="${[this._config.sort_by||Ve].flat().includes("title")?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${[this._config.sort_by||Ve].flat().includes("title")?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.sort_by.options.title",this.hass)}</span>
          </div>
        </div>

        <span>${Yi("ui.panel.card_editor.fields.display_format_primary.heading",this.hass)}</span>

        <div class="two-columns">
          <div class="column radio"
            @click=${()=>{this._setDisplayOptionsPrimary("default")}}
          >
            <ha-icon
              icon="${[(null===(e=this._config.display_options)||void 0===e?void 0:e.primary_info)||"default"].flat().includes("default")?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${[(null===(t=this._config.display_options)||void 0===t?void 0:t.primary_info)||"default"].flat().includes("default")?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.display_format_primary.options.default",this.hass)}</span>
          </div>
          <div class="column radio"
            @click=${()=>{this._setDisplayOptionsPrimary("{entity}: {action}")}}
          >
            <ha-icon
              icon="${[(null===(i=this._config.display_options)||void 0===i?void 0:i.primary_info)||"default"].flat().includes("{entity}: {action}")?"mdi:radiobox-marked":"mdi:radiobox-blank"}"
              class="${[(null===(s=this._config.display_options)||void 0===s?void 0:s.primary_info)||"default"].flat().includes("{entity}: {action}")?"checked":""}"
            ></ha-icon>
            <span>${Yi("ui.panel.card_editor.fields.display_format_primary.options.entity_action",this.hass)}</span>
          </div>
        </div>
        <span>${Yi("ui.panel.card_editor.fields.display_format_secondary.heading",this.hass)}</span>

        <div class="two-columns">
        <div class="column">
          <ha-formfield label="${Yi("ui.panel.card_editor.fields.display_format_secondary.options.relative_time",this.hass)}">
            <ha-checkbox
              value="relative-time"
              @change=${this._setDisplayOptionsSecondary}
              ?checked=${[(null===(a=this._config.display_options)||void 0===a?void 0:a.secondary_info)||Fe].flat().includes("relative-time")}
            >
            </ha-checkbox>
          </ha-formfield>

          <ha-formfield label="${Yi("ui.panel.card_editor.fields.display_format_secondary.options.time",this.hass)}">
            <ha-checkbox
              value="time"
              @change=${this._setDisplayOptionsSecondary}
              ?checked=${[(null===(o=this._config.display_options)||void 0===o?void 0:o.secondary_info)||Fe].flat().includes("time")}
            >
            </ha-checkbox>
          </ha-formfield>

        </div>
        <div class="column">
          <ha-formfield label="${Yi("ui.panel.card_editor.fields.display_format_secondary.options.days",this.hass)}">
            <ha-checkbox
              value="days"
              @change=${this._setDisplayOptionsSecondary}
              ?checked=${[(null===(n=this._config.display_options)||void 0===n?void 0:n.secondary_info)||Fe].flat().includes("days")}
            >
            </ha-checkbox>
          </ha-formfield>

          <ha-formfield label="${Yi("ui.panel.card_editor.fields.display_format_secondary.options.additional_tasks",this.hass)}">
            <ha-checkbox
              value="additional-tasks"
              @change=${this._setDisplayOptionsSecondary}
              ?checked=${[(null===(r=this._config.display_options)||void 0===r?void 0:r.secondary_info)||Fe].flat().includes("additional-tasks")}
            >
            </ha-checkbox>
          </ha-formfield>
        </div>

        </div>

        <scheduler-settings-row>
          <span slot="heading">${Yi("ui.panel.card_editor.fields.tags.heading",this.hass)}</span>
          <div style="display: flex; flex: 1; flex-direction: column">
            <scheduler-combo-selector
              .hass=${this.hass}
              .config=${l}
              .value=${[this._config.tags||[]].flat()}
              @value-changed=${e=>{this._updateConfig({tags:e.detail.value})}}
            >
            </scheduler-combo-selector>
              
            <ha-dropdown
              @wa-after-hide=${e=>{e.stopPropagation(),e.target.querySelector("ha-button").blur()}}
              @click=${e=>{e.preventDefault(),e.stopImmediatePropagation()}}
              @wa-after-show=${e=>{e.target.querySelector("ha-input").focus()}}
              placement="bottom-start"
            >
              <ha-button appearance="plain" slot="trigger">
                <ha-icon slot="start" icon="mdi:plus"></ha-icon>
                ${ns("ui.panel.config.tag.add_tag",this.hass)}
              </ha-button>

              <div style="display: flex; align-items: center; padding: 0x 2px 0px 8px">
                <ha-input
                  .value=${this.customTagValue}
                  .label=${ns("ui.panel.config.tag.add_tag",this.hass)}
                  @input=${e=>{this.customTagValue=e.currentTarget.value}}
                  .placeholder=""
                ></ha-input> 
                <ha-button
                  appearance="plain"
                  @click=${this._customTagConfirmClick}
                >
                  ${ns("ui.common.ok",this.hass)}
                </ha-button>
              </div>
            </ha-dropdown>
          </div>
        </scheduler-settings-row>

      </div>
    `}_setEnableTitle(e){e.target.checked?this.title.length?this._updateConfig({title:this.title}):this._updateConfig({title:!0}):this._updateConfig({title:!1})}_setTitle(e){const t=e.target.value;this.title=t,t!==Yi("ui.panel.common.title",this.hass)&&t.length?this._updateConfig({title:t}):this._updateConfig({title:!0})}_setSortBy(e){var t;let i=[(null===(t=this._config)||void 0===t?void 0:t.sort_by)||Ve].flat();i=i.filter(e=>"state"==e),i.includes(e)||(i=[...i,e]),this._updateConfig({sort_by:i})}_setDisplayOptionsPrimary(e){var t;const i=Object.assign(Object.assign({},null===(t=this._config)||void 0===t?void 0:t.display_options),{primary_info:e});this._updateConfig({display_options:i})}_setDisplayOptionsSecondary(e){var t;const i=e.target.value,s=e.target.checked;let a=Object.assign({},null===(t=this._config)||void 0===t?void 0:t.display_options),o=[a.secondary_info||[]].flat();o=s?Array.from(new Set([...o,i])):o.filter(e=>e!==i),o.sort((e,t)=>{const i={"relative-time":1,time:o.includes("relative-time")?3:2,days:o.includes("relative-time")?2:3,"additional-tasks":4},s=Object.keys(i).includes(e)?i[e]:5,a=Object.keys(i).includes(t)?i[t]:5;return s>a?1:s<a?-1:0}),a=Object.assign(Object.assign({},a),{secondary_info:[...o]}),this._updateConfig({display_options:a})}async _showIncludedEntitiesDialog(e){let t=(this._config.include||[]).filter(e=>!e.includes(".")),i=(this._config.include||[]).filter(e=>e.includes("."));const s=await Hs(this.hass);let a=Object.assign(Object.assign({},this._config),{customize:Object.assign(Object.assign({},s),this._config.customize||{})});await new Promise(s=>{const o={cancel:()=>s(null),confirm:e=>s(e),domains:t,entities:i,cardConfig:a};Rs(e.target,"show-dialog",{dialogTag:"dialog-select-entities",dialogImport:()=>Promise.resolve().then((function(){return va})),dialogParams:o})}).then(e=>{e&&this._updateConfig({include:[...e.domains,...e.entities]})})}_customTagConfirmClick(e){let t=e.target;t=t.parentElement,t=t.parentElement;t.querySelector("ha-button").click();let i=String(this.customTagValue).trim();if(i.length){let e=[this._config.tags||[]].flat();e=[...new Set([...e,i])],this._updateConfig({tags:e})}this.customTagValue=""}_updateConfig(e){this._config&&(this._config=Object.assign(Object.assign({},this._config),e),Rs(this,"config-changed",{config:this._config}))}};ja.styles=r`
    div.entities-list {
      max-height: 500px;
      overflow: auto;
    }
    div.row {
      display: flex;
      align-items: center;
      flex-direction: row;
      cursor: pointer;
      margin: 10px 0px;
    }
    div.row ha-icon {
      padding: 8px;
      color: var(--state-icon-color);
    }
    div.row ha-switch {
      padding: 13px 5px;
    }
    .info {
      margin-left: 16px;
      flex: 1 0 60px;
    }
    .info,
    .info > * {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    ha-input {
      width: 100%;
    }
    div.two-columns {
      display: flex; 
      flex-direction: row; 
    }
    div.two-columns .column {
      flex: 50%;
    }
    div.two-columns .column > * {
      display: flex; 
      flex-direction: column; 
    }
    scheduler-combo-selector {
      min-width: 240px;
    }
    ha-dropdown {
      display: block;
    }
    ha-checkbox {
      padding: 8px 0px;
    }
    div.radio {
      display: flex;
      flex-direction: row;
      align-items: center;
      font-size: 0.875rem;
      padding-bottom: 8px;
      gap: 8px;
    }
    div.radio > * {
      display: flex;
      cursor: pointer;
      user-select: none; 
    }
    div.radio ha-icon {
      color: var(--ha-color-neutral-60);
      transition: color 0.1s ease-in-out;
      padding: 4px 0px;
    }
    div.radio ha-icon:hover {
      color: var(--ha-color-neutral-40);
    }
    div.radio ha-icon.checked {
      color: var(--ha-color-fill-primary-loud-resting);
    }
    div.radio ha-icon.checked:hover {
      color: var(--ha-color-fill-primary-loud-hover);
    }
  `,t([le({attribute:!1})],ja.prototype,"hass",void 0),t([le()],ja.prototype,"_config",void 0),t([le()],ja.prototype,"title",void 0),t([le()],ja.prototype,"tagOptions",void 0),t([ce()],ja.prototype,"customTagValue",void 0),ja=t([re("scheduler-card-editor")],ja);const Oa=r`
  ha-dialog {
    --justify-action-buttons: space-between;
    --dialog-container-padding: var(--safe-area-inset-top, 0)
      var(--safe-area-inset-right, 0) var(--safe-area-inset-bottom, 0)
      var(--safe-area-inset-left, 0);
    --dialog-surface-padding: 0px;
    --dialog-content-padding: 0px;
  }
  /* make dialog fullscreen on small screens */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --dialog-container-padding: 0px;
      --dialog-surface-padding: var(--safe-area-inset-top, 0)
        var(--safe-area-inset-right, 0) var(--safe-area-inset-bottom, 0)
        var(--safe-area-inset-left, 0);
      --vertical-align-dialog: flex-end;
      --ha-dialog-border-radius: var(--ha-border-radius-square);
    }
  }
  @media all and (min-width: 600px) and (min-height: 501px) {
    ha-dialog {
      --dialog-surface-margin-top: 40px;
      --vertical-align-dialog: flex-start;
    }
  }
  .buttons {
    box-sizing: border-box;
    display: flex;
    padding: 16px 24px;
    justify-content: space-between;
    background-color: var(--mdc-theme-surface, #fff);
    border-top: 1px solid var(--divider-color);
  }
  .content {
    padding: 0px 24px 16px 24px;
  }
`,za=(r`
  .error {
    color: red;
  }
  .dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .dt {
    display: flex;
    align-content: center;
    flex-wrap: wrap;
  }
  .dd {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, auto) minmax(0, 2fr));
    margin: 0;
  }
  .toggle {
    padding: 0.6em;
    border: grey;
    border-radius: 50%;
  }
  .toggle.on {
    background-color: green;
  }
  .toggle.off {
    background-color: red;
  }
  .button {
    display: block;
    border: outset 0.2em;
    border-radius: 50%;
    border-color: silver;
    background-color: silver;
    width: 1.4em;
    height: 1.4em;
  }
  .value {
    padding-left: 0.5em;
    display: flex;
    align-content: center;
    flex-wrap: wrap;
  }


`,(e,t,i,s)=>{var a;const o=e.service,n=null===(a=e.target)||void 0===a?void 0:a.entity_id,r=ms(e,s);if(!r||!r.fields||!Object.keys(r.fields).includes(t))return!1;const d=r.fields[t];if(null===bs(o,n,t,i,s))return!1;if(Object.keys(e.service_data||{}).includes(t))return!0;if(d.supported_features){if(![n||[]].flat().every(e=>{if(!Object.keys(i.states).includes(e))return!1;return((i.states[e].attributes.supported_features||0)&d.supported_features)>0}))return!1}return!("light"==Qi(o)&&![n||[]].flat().every(e=>{if(!Object.keys(i.states).includes(e))return!1;const s=i.states[e].attributes.supported_color_modes||[];return"brightness"==t?s.filter(e=>"onoff"!=e).length:"color_temp_kelvin"!=t||s.includes("color_temp")}))});var Ca;!function(e){e.OverlappingTime="overlapping_time",e.MissingTargetEntity="missing_target_entity",e.MissingServiceParameter="missing_service_parameter",e.MissingAction="missing_action"}(Ca||(Ca={}));const Ea=(e,t,i)=>{let s=[];s=[...s,...e.entries.map(e=>((e,t)=>e.every((i,s)=>{const a=Te(i.start,t),o=void 0===i.stop?a:Te(i.stop,t)||86400;return!(a>o)&&e.every((e,i)=>{if(i<=s)return!0;return Te(e.start,t)>=o})})?null:Ca.OverlappingTime)(e.slots,t)).filter(e=>null!==e)];let a=e.entries.map(e=>e.slots.map(e=>e.actions)).flat().flat();return a.length||(s=[...s,Ca.MissingAction]),s=[...s,...a.map(e=>((e,t,i)=>{var s;const a=ms(e,i);return(null==a?void 0:a.target)&&!(null===(s=e.target)||void 0===s?void 0:s.entity_id)?Ca.MissingTargetEntity:(null==a?void 0:a.fields)&&!Object.entries(a.fields).filter(([s])=>za(e,s,t,i)).every(([s,a])=>{var o,n;let r=bs(e.service,null===(o=e.target)||void 0===o?void 0:o.entity_id,s,t,i);const d=!(!r.number||!(null===(n=r.number)||void 0===n?void 0:n.optional))||a.optional;return!(!Object.keys(e.service_data).includes(s)&&!d)&&!(!Ke(e.service_data[s])&&!d)})?Ca.MissingServiceParameter:null})(e,t,i)).filter(e=>null!==e)],s.length?s.shift():null},Aa=(e,t)=>{const i=Da(t);return e.callApi("POST","scheduler/add",i)},Da=e=>{const t=e=>e.actions.length?(e.stop||(e=Object.fromEntries(Object.entries(e).filter(([e])=>"stop"!=e))),e):null;let i={weekdays:(e=Object.assign(Object.assign({},e),{entries:e.entries.map(e=>Object.assign(Object.assign({},e),{slots:e.slots.map(t).filter(e=>null!==e)}))})).entries[0].weekdays.map(Ta),timeslots:e.entries[0].slots.map(Ma),name:e.name,start_date:e.start_date,end_date:e.end_date,repeat_type:e.repeat_type,tags:e.tags||[]};return e.schedule_id&&(i=Object.assign(Object.assign({},i),{schedule_id:e.schedule_id})),i},Ta=e=>{switch(e){case _e.Monday:return"mon";case _e.Tuesday:return"tue";case _e.Wednesday:return"wed";case _e.Thursday:return"thu";case _e.Friday:return"fri";case _e.Saturday:return"sat";case _e.Sunday:return"sun";case _e.Workday:return"workday";case _e.Weekend:return"weekend";default:return"daily"}},Ma=e=>({start:e.start,stop:e.stop,name:e.name,color:e.color,enforce:e.enforce,track:e.track,priority:e.priority,start_date:e.start_date,end_date:e.end_date,actions:e.actions.map(e=>Pa(e)).flat(),condition_type:e.conditions.items.length?e.conditions.type==ge.And?"and":"or":void 0,conditions:e.conditions.items.length?e.conditions.items:void 0,track_conditions:e.conditions.track_changes}),Pa=e=>{var t,i;const s=e=>Object.keys(e).filter(t=>Ke(e[t])).reduce((t,i)=>(t[i]=e[i],t),{});if(e.target){if(Array.isArray(null===(t=e.target)||void 0===t?void 0:t.entity_id)){return null==e?void 0:e.target.entity_id.map(t=>({service:e.service,service_data:s(e.service_data),entity_id:t}))}return{service:e.service,service_data:s(e.service_data),entity_id:null===(i=e.target)||void 0===i?void 0:i.entity_id}}return{service:e.service,service_data:s(e.service_data)}},La=(e,t,i)=>{const s={title:ns("state_badge.default.error",i),description:R`
    <b>Something went wrong!</b><br />
    ${e.body.message}<br /><br />
    ${e.error}<br /><br />
    Please <a href="https://github.com/nielsfaber/scheduler-card/issues">report</a> the bug.
  `,primaryButtonLabel:ns("ui.common.ok",i),confirm:()=>{},cancel:()=>{}};Rs(t,"show-dialog",{dialogTag:"scheduler-generic-dialog",dialogImport:()=>Promise.resolve().then((function(){return zo})),dialogParams:s})},Na=(e,t)=>e.callApi("POST","scheduler/remove",{schedule_id:t}),Ia=(e,t)=>{const i=Da(t);return e.callApi("POST","scheduler/edit",i)},Ra=e=>{if(!Object.keys(e).includes("select")||!e.select){if(Object.keys(e).includes("number")&&e.number){const t=e.number.min;return void 0!==t?t:0}return Object.keys(e).includes("boolean")&&e.boolean?void 0:(Object.keys(e).includes("text")&&e.text,"")}e.select.options},Ha=e=>JSON.stringify(Object.fromEntries(Object.entries(e||{}).sort(([e],[t])=>e.localeCompare(t)))),qa=(e,t)=>e.length===t.length&&e.every((e,i)=>{const s=t[i];return e.service===s.service&&Ha(e.service_data)===Ha(s.service_data)&&Ha(e.target)===Ha(s.target)}),Va=e=>{const t=[];for(const i of e){const e=t[t.length-1];e&&void 0!==e.stop&&qa(e.actions,i.actions)&&JSON.stringify(e.conditions)===JSON.stringify(i.conditions)?t[t.length-1]=Object.assign(Object.assign({},e),{stop:i.stop}):t.push(i)}return t},Fa=(e,t)=>{const i=ms(e,t),s=Qi(e.service),a=Ji(e.service);if(i.icon)return(o=i.icon).match(/^[a-z]+\:[a-zA-Z\-]+$/)?o:"mdi:"+o;if(Object.keys(fs).includes(s)&&Object.keys(fs[s].services).includes(a)){if(void 0!==fs[s].attributes){let t=fs[s].attributes;const i=Object.keys(t).find(t=>Object.keys(e.service_data).includes(t));if(i&&Object.keys(t[i]).includes(e.service_data[i]))return t[i][e.service_data[i]]}return fs[s].services[a]}return Object.keys(fs).includes(s)&&Object.keys(fs[s].services).includes("{entity_id}")?fs[s].services["{entity_id}"]:"mdi:flash";var o},Ba=e=>{var t;return"turn_off"===Ji(e.service)||"off"===(null===(t=e.service_data)||void 0===t?void 0:t.state)},Wa=e=>{var t;return"turn_on"===Ji(e.service)||"on"===(null===(t=e.service_data)||void 0===t?void 0:t.state)},Ua=e=>{const t=Ji(e.service);if("turn_on"!==t&&"turn_off"!==t)return null;const i=e.service.split(".")[0];return Object.assign({service:`${i}.${"turn_on"===t?"turn_off":"turn_on"}`,service_data:{}},e.target?{target:e.target}:{})},Za=(e,t,i)=>{let s=Te("string"==typeof e?De(e):e,i),a=Te("string"==typeof t?De(t):t,i);return a>s?1:a<s?-1:0},Ka=e=>De(e.start),Xa=e=>{if(Ke(e.stop)){const t=De(e.stop);return 0==t.hours&&0==t.minutes&&t.mode==we.Fixed?Object.assign(Object.assign({},t),{hours:24}):t}return Ce(Ka(e),{minutes:1})},Ga=(e,t,i,s)=>{let a=t;if(Ke(i.stop))return[e,a]=Ga(e,t+1,{start:i.stop},s),[e,a-1];if(!Ke(i.start))return[e,a];let o=Ka(e[t]),n=i.start,r=Ka(e[t]);for(let i=t-1;i>=0;i--){if(e[i].actions.length){r=i==t-1?Ce(Ka(e[i]),{minutes:1}):Xa(e[i]);break}r=Ka(e[i])}let d=Ce(Xa(e[t]),{minutes:-1});if(!Ke(e[t].stop))for(let i=t+1;i<e.length;i++){if(e[i].actions.length){d=i==t+1?Ce(Xa(e[i]),{minutes:-1}):Ka(e[i]);break}d=Xa(e[i])}if(Za(r,n,s)<0&&(n=r),Za(d,n,s)>0&&Te(d,s)>0&&(n=d),e=Object.assign(e,{[t]:Object.assign(Object.assign({},e[t]),{start:He(n)})}),Za(o,n,s)<=0)for(let i=t-1;i>=0;i--){let t=Za(Ka(e[i]),n,s),o=Za(Xa(e[i]),n,s);if(t>0&&o<=0){e=Object.assign(e,{[i]:Object.assign(Object.assign({},e[i]),{stop:He(n)})});break}if(o>=0)break;t<=0&&(e=Object.assign(e,{[i]:null}),a-=1)}if(Za(o,n,s)<0&&!Ke(e[t].stop)&&(e=Ke(e[t+1].stop)&&!e[t+1].actions.length?Object.assign(e,{[t+1]:Object.assign(Object.assign({},e[t+1]),{start:He(Xa(e[t]))})}):[...e.slice(0,t+1),Object.assign(Object.assign({},e[t]),{start:He(Xa(e[t])),stop:He(Ka(e[t+1])),actions:[]}),...e.slice(t+1)]),Za(o,n,s)>=0)for(let t=a+1;t<e.length;t++){let i=Xa(e[a]),o=Za(Ka(e[t]),i,s),n=Za(Xa(e[t]),i,s);if(o>=0&&n<0)e=Object.assign(e,{[t]:Object.assign(Object.assign({},e[t]),{start:He(i)})});else{if(o<0)break;n>=0&&(e=Object.assign(e,{[t]:null}))}}return Za(o,n,s)>0&&(t>0&&Ke(e[t-1].stop)?e=Object.assign(e,{[t-1]:Object.assign(Object.assign({},e[t-1]),{stop:He(n)})}):(e=[...e.slice(0,t),Object.assign(Object.assign({},e[t]),{start:t>0?He(Xa(e[t-1])):"00:00:00",stop:He(n),actions:[]}),...e.slice(t)],a=t+1)),[e=e.filter(Ke),a]},Ya=e=>{const t=Math.floor(e/3600),i=Math.round((e-3600*t)/60),s={mode:we.Fixed,hours:t,minutes:i};return He(s)},Ja=(e,t,i,s)=>{const a=e.map((t,i)=>{const a=Te(t.start,s);let o;return void 0!==t.stop?(o=Te(t.stop,s),!o&&a&&(o=86400)):o=i+1<e.length&&Te(e[i+1].start,s)||86400,{start:a,stop:o}}),o=e.find((e,s)=>a[s].stop>t&&a[s].start<i)||e[0];let n=[],r=-1;return e.forEach((e,s)=>{const d=a[s];d.stop<=t?n.push(e):(-1===r&&(d.start<t&&n.push(Object.assign(Object.assign({},e),{stop:Ya(t)})),r=n.length,n.push({start:Ya(t),stop:Ya(i),actions:[],conditions:o.conditions})),d.start>=i?n.push(e):d.stop>i&&n.push(Object.assign(Object.assign({},e),{start:Ya(i)})))}),-1===r&&(r=n.length,n.push({start:Ya(t),stop:Ya(i),actions:[],conditions:o.conditions})),[n,r]},Qa=[67,160,71],eo=e=>{if(!Wa(e))return null;const t=e.service_data||{};let i,s;var a;let o;if(Array.isArray(t.rgb_color)&&t.rgb_color.length>=3&&t.rgb_color.slice(0,3).every(e=>"number"==typeof e)&&(i=t.rgb_color.slice(0,3)),"number"==typeof t.color_temp_kelvin?s=t.color_temp_kelvin:"number"==typeof t.color_temp&&(a=t.color_temp,s=Math.round(1e6/a)),"number"==typeof t.brightness?o=t.brightness/255*100:"number"==typeof t.brightness_pct&&(o=t.brightness_pct),void 0===i&&void 0===s&&void 0===o)return null;return{rgb:void 0!==i?i:void 0!==s?(e=>{const t=Math.min(Math.max(e,1e3),12e3)/100;let i,s,a;t<=66?(i=255,s=99.4708025861*Math.log(t)-161.1195681661,a=t<=19?0:138.5177312231*Math.log(t-10)-305.0447927307):(i=329.698727446*Math.pow(t-60,-.1332047592),s=288.1221695283*Math.pow(t-60,-.0755148492),a=255);const o=e=>Math.round(Math.min(Math.max(e,0),255));return[o(i),o(s),o(a)]})(s):Qa,alpha:void 0!==o?.25+.6*Math.min(Math.max(o,0),100)/100:.75}},to=(e,t)=>{if(!e)return[];const i=[1,2,3,4,6,8,12],s=t?88:56;let a=Math.ceil(24/(e/s));for(;!i.includes(a);)a++;const o=[0,...Array.from(Array(24/a-1).keys()).map(e=>(e+1)*a),24];return o.map((e,t)=>{let i=a/24*100;return i=Math.floor(100*i)/100,0!==t&&t!==o.length-1||(i/=2),{hour:e,widthPct:i,align:0===t?"left":t===o.length-1?"right":"center"}})},io=(e,t,i,s=3,a=5)=>{const o=i-(e.length-1)*s,n=e.map((i,s)=>{const a=Te(i.start,t);let o;if(void 0!==i.stop)o=Te(i.stop,t),!o&&a&&(o=86400);else{const i=e[s+1];o=i&&Te(i.start,t)||86400}return(o-a)/86400}),r=a/o,d=o-n.filter(e=>e<r).length*a;return n.map(e=>e<r?a:e*d)},so=(e,t,i,s=3,a=null)=>{const o=t=>null!==a&&e[a]===t?"pending":t.actions.length?Ba(t.actions[0])?"off":Wa(t.actions[0])?"on":"":"empty",n=e=>{const t=e.actions.length?eo(e.actions[0]):null;return t?`rgba(${t.rgb.join(", ")}, ${t.alpha})`:void 0},r=[];let d=0;e.forEach((a,l)=>{0===l&&r.push({position:d,label:He(De(a.start),{seconds:!1,am_pm:i}),align:"start",state:o(a),color:n(a)});const c=d+t[l],h=l===e.length-1;void 0!==a.stop&&r.push({position:c,label:He(De(a.stop),{seconds:!1,am_pm:i}),align:h?"end":"middle",state:o(h?a:e[l+1]),color:n(h?a:e[l+1])}),d=c+(h?0:s)});const l=[],c=r.map(e=>{const t=7*e.label.length+6;const i="end"===e.align?e.position-t:e.position-t/2,s="start"===e.align?e.position+t:e.position+t/2;let a=l.findIndex(e=>i>e);return-1===a&&(a=l.length),l[a]=s,a}),h=c.reduce((e,t)=>Math.max(e,t),0);return{boundaries:r.map((e,t)=>Object.assign(Object.assign({},e),{tier:c[t]})),maxTier:h}},ao=(e,t)=>{const i=new Date(t),s=3600*i.getHours()+60*i.getMinutes()+i.getSeconds();let a=3600*e.hours+60*e.minutes-s;const o=a<0?-1:1;a=Math.abs(a);let n=Math.floor(a/3600),r=Math.round((a-3600*n)/60);return o<0&&(n>0&&(n=-n),r=-r),Ee({hours:n,minutes:r})},oo=(e,t)=>{const i=Math.floor(e/3600),s=Math.round((e-3600*i)/60);return He({mode:we.Fixed,hours:i,minutes:s},{seconds:!1,am_pm:t})};let no=class extends oe{constructor(){super(...arguments),this.selectedSlot=null,this._width=0,this._zoom=1,this._panPx=0,this.pendingSlot=null,this._suppressNextClick=!1,this._undoStack=[],this.large=!1,this._handleKeyDown=e=>{const t=e.composedPath()[0],i=t instanceof HTMLElement&&(["input","textarea","select"].includes(t.tagName.toLowerCase())||t.isContentEditable);if("z"===e.key.toLowerCase()&&(e.ctrlKey||e.metaKey)&&!e.shiftKey&&!i)return e.preventDefault(),void this._undo();if("Delete"!==e.key&&"Backspace"!==e.key)return;if(null===this.selectedSlot||!this.schedule)return;if(i)return;if(null!==this.pendingSlot&&this.selectedSlot===this.pendingSlot)return e.preventDefault(),this._revertPendingSlot(null),this.selectedSlot=null,void this.dispatchEvent(new CustomEvent("update",{detail:{selectedSlot:null}}));const s=this.schedule.slots;if(s.length<=2)return;e.preventDefault(),this._pushUndo();const a=this.selectedSlot,o=a===s.length-1?a-1:a;let n=[...s.slice(0,o),Object.assign(Object.assign({},s[o+1]),{start:s[o].start,stop:s[o+1].stop}),...s.slice(o+2)];n=Va(n),this.schedule=Object.assign(Object.assign({},this.schedule),{slots:n}),this.selectedSlot=null,this.dispatchEvent(new CustomEvent("update",{detail:{slots:n}})),this.dispatchEvent(new CustomEvent("update",{detail:{selectedSlot:null}}))}}_pushUndo(){this.schedule&&this._undoStack.push(this.schedule.slots),this._undoStack.length>50&&this._undoStack.shift()}_undo(){const e=this._undoStack.pop();e&&this.schedule&&(this.schedule=Object.assign(Object.assign({},this.schedule),{slots:e}),this.pendingSlot=null,this._slotsBackup=void 0,this.dispatchEvent(new CustomEvent("update",{detail:{slots:e}})))}get _contentWidth(){return this._width*this._zoom}connectedCallback(){super.connectedCallback(),this._resizeObserver=new ResizeObserver(e=>{for(const t of e){const e=t.contentRect.width;e!==this._width&&(this._width=e,this._panPx=this._clampPan(this._panPx,this._zoom))}}),this._resizeObserver.observe(this),window.addEventListener("keydown",this._handleKeyDown)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._resizeObserver)||void 0===e||e.disconnect(),this._zoomAnimationFrame&&cancelAnimationFrame(this._zoomAnimationFrame),window.removeEventListener("keydown",this._handleKeyDown)}_clampPan(e,t){const i=Math.max(0,this._width*t-this._width);return Math.min(Math.max(e,0),i)}_setZoom(e,t){const i=Math.min(Math.max(e,1),48),s=this._width*this._zoom,a=this._panPx+t,o=(s>0?a/s:0)*(this._width*i)-t;this._zoom=i,this._panPx=this._clampPan(o,i)}_animateZoomBy(e,t){this._zoomAnimationFrame&&cancelAnimationFrame(this._zoomAnimationFrame);const i=this._zoom,s=Math.min(Math.max(i*e,1),48),a=performance.now(),o=e=>{const n=Math.min((e-a)/220,1),r=1-Math.pow(1-n,3),d=i+(s-i)*r;this._setZoom(d,t),this._zoomAnimationFrame=n<1?requestAnimationFrame(o):void 0};this._zoomAnimationFrame=requestAnimationFrame(o)}_handleZoomInClick(){this._animateZoomBy(3,this._width/2)}_handleZoomOutClick(){this._animateZoomBy(1/3,this._width/2)}_handleZoomResetClick(){this._zoomAnimationFrame&&cancelAnimationFrame(this._zoomAnimationFrame);const e=this._zoom,t=this._panPx,i=performance.now(),s=a=>{const o=Math.min((a-i)/220,1),n=1-Math.pow(1-o,3);this._zoom=e+(1-e)*n,this._panPx=t+(0-t)*n,this._zoomAnimationFrame=o<1?requestAnimationFrame(s):void 0};this._zoomAnimationFrame=requestAnimationFrame(s)}_handleWheel(e){if(!this._width)return;const t=e.ctrlKey||e.metaKey||Math.abs(e.deltaY)>=Math.abs(e.deltaX);e.preventDefault();const i=e.currentTarget.getBoundingClientRect(),s=e.clientX-i.left;if(t){this._zoomAnimationFrame&&(cancelAnimationFrame(this._zoomAnimationFrame),this._zoomAnimationFrame=void 0);const t=Math.pow(2,-e.deltaY/60);this._setZoom(this._zoom*t,s)}else this._panPx=this._clampPan(this._panPx+e.deltaX,this._zoom)}_handleRulerPanStart(e){this._zoom<=1||(e.currentTarget.setPointerCapture(e.pointerId),this._panDrag={pointerId:e.pointerId,startX:e.clientX,startPanPx:this._panPx})}_handleRulerPanMove(e){if(!this._panDrag||this._panDrag.pointerId!==e.pointerId)return;const t=e.clientX-this._panDrag.startX;this._panPx=this._clampPan(this._panDrag.startPanPx-t,this._zoom)}_handleRulerPanEnd(){this._panDrag=void 0}_touchDistance(e){const t=e[0].clientX-e[1].clientX,i=e[0].clientY-e[1].clientY;return Math.hypot(t,i)}_handlePinchStart(e){if(2!==e.touches.length)return;e.preventDefault();const t=this.getBoundingClientRect(),i=(e.touches[0].clientX+e.touches[1].clientX)/2-t.left;this._pinch={distance:this._touchDistance(e.touches),midpointX:i,panPx:this._panPx,zoom:this._zoom}}_handlePinchMove(e){if(!this._pinch||2!==e.touches.length)return;e.preventDefault();const t=this.getBoundingClientRect(),i=(e.touches[0].clientX+e.touches[1].clientX)/2-t.left,s=this._touchDistance(e.touches)/this._pinch.distance,a=Math.min(Math.max(this._pinch.zoom*s,1),48),o=this._width*this._pinch.zoom,n=this._pinch.panPx+this._pinch.midpointX,r=(o>0?n/o:0)*(this._width*a)-i,d=-(i-this._pinch.midpointX);this._zoom=a,this._panPx=this._clampPan(r+d,a)}_handlePinchEnd(e){e.touches.length<2&&(this._pinch=void 0)}get _dragStepSize(){return this._zoom>=4?1:this.config.time_step||15}_clientXToTs(e,t=!0){const i=this.shadowRoot.querySelector(".bar").getBoundingClientRect();let s="rtl"===getComputedStyle(this).direction?i.right-e:e-i.left;s<0&&(s=0),s>i.width&&(s=i.width);let a=Math.round(s/i.width*86400);if(t){const e=60*this._dragStepSize;a=Math.round(a/e)*e}return a}_handleCreateDragStart(e){if(0!==e.button)return;const t=e.target.closest(".slot");if(!t)return;if(this._pinch)return;if("touch"===e.pointerType){const t=performance.now(),i=void 0!==this._lastBarTap&&t-this._lastBarTap.time<400&&Math.abs(e.clientX-this._lastBarTap.x)<50;if(this._lastBarTap={time:t,x:e.clientX},!i)return void this._startBarPan(e)}else{const i=performance.now(),s=void 0!==this._lastBarClick&&i-this._lastBarClick.time<400&&Math.abs(e.clientX-this._lastBarClick.x)<10;if(this._lastBarClick={time:i,x:e.clientX},!s)return void this._startBodyResizeDrag(e,t)}this._createDrag={startClientX:e.clientX,ts0:this._clientXToTs(e.clientX),active:!1};const i=e=>{if(!this._createDrag)return;if(this._pinch)return this._createDrag=void 0,void(this._createRange=void 0);if(!this._createDrag.active&&Math.abs(e.clientX-this._createDrag.startClientX)<5)return;this._createDrag.active=!0;const t=this._clientXToTs(e.clientX),i=Math.min(this._createDrag.ts0,t),s=Math.max(this._createDrag.ts0,t);this._createRange={ts0:i,ts1:s}},s=()=>{window.removeEventListener("pointermove",i),window.removeEventListener("pointerup",s),window.removeEventListener("pointercancel",s);const e=this._createDrag;this._createDrag=void 0;const t=this._createRange;if(this._createRange=void 0,!(null==e?void 0:e.active)||!t)return;this._suppressNextClick=!0;const a=60*this._dragStepSize;t.ts1-t.ts0<a||this._commitCreate(t.ts0,t.ts1)};window.addEventListener("pointermove",i),window.addEventListener("pointerup",s),window.addEventListener("pointercancel",s)}_startBarPan(e){const t=e.clientX,i=this._panPx;let s=!1;const a=e=>{if(this._pinch)return;const a=e.clientX-t;!s&&Math.abs(a)<5||(s=!0,this._panPx=this._clampPan(i-a,this._zoom))},o=()=>{window.removeEventListener("pointermove",a),window.removeEventListener("pointerup",o),window.removeEventListener("pointercancel",o),s&&(this._suppressNextClick=!0)};window.addEventListener("pointermove",a),window.addEventListener("pointerup",o),window.addEventListener("pointercancel",o)}_commitCreate(e,t){const i=[...this.schedule.slots];this._pushUndo();let[s,a]=Ja(i,e,t,this.hass);const o=[s[a-1],s[a+1]].find(e=>{var t;return(null===(t=null==e?void 0:e.actions)||void 0===t?void 0:t.length)&&null!==Ua(e.actions[0])}),n=o?Ua(o.actions[0]):null;n?(s=Object.assign([...s],{[a]:Object.assign(Object.assign({},s[a]),{actions:[n]})}),this.pendingSlot=null,this._slotsBackup=void 0):(this._slotsBackup=null!==this.pendingSlot&&this._slotsBackup?this._slotsBackup:i,this.pendingSlot=a),this.selectedSlot=a,this.schedule=Object.assign(Object.assign({},this.schedule),{slots:s}),this.dispatchEvent(new CustomEvent("update",{detail:{slots:s}})),this.dispatchEvent(new CustomEvent("update",{detail:{selectedSlot:a}}))}_revertPendingSlot(e){const t=this._slotsBackup;let i=null;if(null!==e&&this.schedule.slots[e]){const s=Te(this.schedule.slots[e].start,this.hass);i=t.findIndex((e,i)=>{const a=Te(e.start,this.hass);let o=void 0!==e.stop?Te(e.stop,this.hass)||86400:i+1<t.length?Te(t[i+1].start,this.hass):86400;return s>=a&&s<o}),-1===i&&(i=null)}return this.pendingSlot=null,this._slotsBackup=void 0,this.schedule=Object.assign(Object.assign({},this.schedule),{slots:t}),this.dispatchEvent(new CustomEvent("update",{detail:{slots:t}})),i}willUpdate(){var e,t,i;null!==this.pendingSlot&&((null===(i=null===(t=null===(e=this.schedule)||void 0===e?void 0:e.slots[this.pendingSlot])||void 0===t?void 0:t.actions)||void 0===i?void 0:i.length)||0)>0&&(this.pendingSlot=null,this._slotsBackup=void 0)}render(){const e=Math.round(100*this._zoom),t=getComputedStyle(this).direction;return R`
      <div class="zoom-controls">
        <ha-icon-button @click=${this._handleZoomOutClick} .disabled=${this._zoom<=1}>
          <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
        </ha-icon-button>
        <span class="zoom-level" @click=${this._handleZoomResetClick}>${e}%</span>
        <ha-icon-button @click=${this._handleZoomInClick} .disabled=${this._zoom>=48}>
          <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
        </ha-icon-button>
      </div>
      <div
        class="viewport"
        @wheel=${this._handleWheel}
        @touchstart=${this._handlePinchStart}
        @touchmove=${this._handlePinchMove}
        @touchend=${this._handlePinchEnd}
        @touchcancel=${this._handlePinchEnd}
      >
        <div
          class="zoom-content"
          style=${na({width:this._contentWidth+"px",transform:`translateX(${-this._panPx}px)`})}
        >
          <div class="slots-wrapper" style=${na({direction:t})}>
            ${this.renderBoundaries()}
            <div class="bar" @pointerdown=${this._handleCreateDragStart}>
              ${this.renderTimeslots()}
              ${this.renderCreateOverlay()}
            </div>
          </div>
          <div
            class="time-bar"
            style=${na({direction:t,cursor:this._zoom>1?"grab":"default"})}
            @pointerdown=${this._handleRulerPanStart}
            @pointermove=${this._handleRulerPanMove}
            @pointerup=${this._handleRulerPanEnd}
            @pointercancel=${this._handleRulerPanEnd}
          >
            ${this.renderTimebar()}
          </div>
        </div>
      </div>
    `}renderTimebar(){const e=Le(this.hass.locale);return to(this._contentWidth,e).map(t=>{const i={mode:we.Fixed,hours:t.hour,minutes:0},s=He(i,{seconds:!1,am_pm:e}),a="left"===t.align?"left":"right"===t.align?"right":"";return R`
        <span class="${a}" style=${na({width:t.widthPct+"%"})}>${s}</span>
      `})}renderTimeslots(){const e=this.schedule.slots,t=this.computeSlotWidths();return e.map((i,s)=>{const a=i.actions.length?Os(i.actions[0],this.hass,this.config.customize,!0,!0):"",o=5*a.length+10,n=s>0?15:0,r=s<e.length-1?15:0,d=t[s]-n-r,l=e[s+1],c=i.actions.length?Ba(i.actions[0])?"off":Wa(i.actions[0])?"on":"":"",h=i.actions.length?eo(i.actions[0]):null,u=h?{background:`rgba(${h.rgb.join(", ")}, ${h.alpha})`,border:this.selectedSlot==s?"3px solid rgb(var(--rgb-state-active-color, 67, 160, 71))":"2px solid rgba(var(--rgb-state-active-color, 67, 160, 71), 0.9)"}:{};return R`
        <div
          class="slot ${this.selectedSlot==s?"selected":""} ${i.actions.length?c:"empty"} ${void 0===i.stop?"short":""} ${this.pendingSlot===s?"pending":""}"
          style="${na(Object.assign({width:t[s]+"px"},u))}"
          @click=${this._toggleSelectTimeslot}
          idx="${s}"
        >
          ${i.stop,""}
          ${i.actions.length?a&&(d>o/3||d>50)&&d>30?R`<span style="margin-inline-start: ${n}px; margin-inline-end: ${r}px">${a}</span>`:d>16?R`<ha-icon icon="${Fa(i.actions[0],this.config.customize)}"></ha-icon>`:"":""}
        </div>
        ${s<e.length-1&&i.stop?R`
        <div idx="${s}" class="handle ${this.selectedSlot==s+1||this.selectedSlot==s?"":"hidden"} ${l&&!l.stop?"center":""}">
          <span>
            <ha-icon-button
              .path=${Js}
              @mousedown=${this._handleDragStart}
              @touchstart=${this._handleDragStart}
            >
            </ha-icon-button>
          </span>
        </div>
        `:""}
      `})}renderCreateOverlay(){if(!this._createRange)return"";const{ts0:e,ts1:t}=this._createRange,i=e/86400*this._contentWidth,s=(t-e)/86400*this._contentWidth,a=Le(this.hass.locale),o=`${oo(e,a)} - ${oo(t,a)}`;return R`
      <div
        class="create-overlay"
        style=${na({insetInlineStart:i+"px",width:s+"px"})}
      >
        ${s>80?R`<span>${o}</span>`:""}
      </div>
    `}renderBoundaries(){if(!this._width)return R``;const e=this.schedule.slots,t=this.computeSlotWidths(),i=Le(this.hass.locale),{boundaries:s,maxTier:a}=so(e,t,i,3,this.pendingSlot),o="rtl"===getComputedStyle(this).direction?"50%":"-50%";return R`
      <div class="boundaries" style=${na({height:22+17*a+"px"})}>
        ${s.map(e=>R`
          <div
            class="boundary ${e.align}"
            style=${na(Object.assign(Object.assign({},"end"===e.align?{insetInlineEnd:this._contentWidth-e.position+"px"}:{insetInlineStart:e.position+"px"}),"middle"===e.align?{transform:`translateX(${o})`}:{}))}
          >
            <span class="boundary-label ${e.state}" style=${na(e.color?{color:e.color}:{})}>${e.label}</span>
            <span
              class="boundary-line"
              style=${na({height:7+17*e.tier+"px"})}
            ></span>
          </div>
        `)}
      </div>
    `}computeSlotWidths(){return io(this.schedule.slots,this.hass,this._contentWidth)}_toggleSelectTimeslot(e){if(e.stopPropagation(),this._suppressNextClick)return void(this._suppressNextClick=!1);let t=e.target;"div"!=t.tagName.toLowerCase()&&(t=t.parentElement);let i=Number(t.getAttribute("idx"));if(null!==this.pendingSlot&&i!==this.pendingSlot&&!this.schedule.slots[this.pendingSlot].actions.length)return this.selectedSlot=this._revertPendingSlot(i),void this.dispatchEvent(new CustomEvent("update",{detail:{selectedSlot:this.selectedSlot}}));this.selectedSlot=this.selectedSlot!==i?i:null;const s=new CustomEvent("update",{detail:{selectedSlot:this.selectedSlot}});this.dispatchEvent(s)}_handleDragStart(e){e.preventDefault(),e.stopPropagation(),this._pushUndo();let t=e.target;for(;"DIV"!==t.tagName;)t=t.parentElement;const i=t.parentElement,s=Number(t.getAttribute("idx"));this._startBoundaryDrag(s,i)}_startBodyResizeDrag(e,t){const i=e.clientX,s=Number(t.getAttribute("idx"));this._bodyResizeDrag={startClientX:i,slotIdx:s,active:!1};const a=e=>{if(!this._bodyResizeDrag)return;const t=e.clientX-this._bodyResizeDrag.startClientX;if(this._bodyResizeDrag.active||Math.abs(t)<5)return;this._bodyResizeDrag.active=!0,window.removeEventListener("pointermove",a),window.removeEventListener("pointerup",o),window.removeEventListener("pointercancel",o);const i=this.schedule.slots;let n=t>0===!("rtl"===getComputedStyle(this).direction)?s:s-1;if(n<0||n>i.length-2||void 0===i[n+1].stop)return void(this._bodyResizeDrag=void 0);this._suppressNextClick=!0,this._pushUndo();const r=this.shadowRoot.querySelector(".bar");this._startBoundaryDrag(n,r),this._bodyResizeDrag=void 0},o=()=>{window.removeEventListener("pointermove",a),window.removeEventListener("pointerup",o),window.removeEventListener("pointercancel",o),this._bodyResizeDrag=void 0};window.addEventListener("pointermove",a),window.addEventListener("pointerup",o),window.addEventListener("pointercancel",o)}_startBoundaryDrag(e,t){const i=t.getBoundingClientRect(),s=this._zoom>=4?1:this.config.time_step||15,a=60*s;let o=e>0?Te(this.schedule.slots[e-1].stop||this.schedule.slots[e-1].start,this.hass)+a:a,n=(Te(this.schedule.slots[e+1].stop||this.schedule.slots[e+1].start,this.hass)||86400)-a;void 0===this.schedule.slots[e+1].stop&&(n=(Te(this.schedule.slots[e+2].stop||this.schedule.slots[e+2].start,this.hass)||86400)-a);const r=De(this.schedule.slots[e+1].start).mode;if([we.Sunrise,we.Sunset].includes(r)){let t=De(this.schedule.slots[e+1].start),i=Te(Object.assign(Object.assign({},t),{hours:4,minutes:0}),this.hass),s=Te(Object.assign(Object.assign({},t),{hours:-4,minutes:0}),this.hass);s>o&&(o=s),i<n&&(n=i)}let d=t=>{let a;t.preventDefault(),a="undefined"!=typeof TouchEvent&&t instanceof TouchEvent?t.changedTouches[0].pageX:t.pageX;a="rtl"===getComputedStyle(this).direction?i.right-(t instanceof TouchEvent?t.changedTouches[0].pageX:t.pageX):(t instanceof TouchEvent?t.changedTouches[0].pageX:t.pageX)-i.left,a>i.width&&(a=i.width),a<0&&(a=0);let d=Math.round(a/i.width*86400);d<o?d=o:d>n&&(d=n);const l=Math.floor(d/3600),c=Math.round((d-3600*l)/60);let h={mode:we.Fixed,hours:l,minutes:c};if([we.Sunrise,we.Sunset].includes(r)){const e=r==we.Sunrise?this.hass.states["sun.sun"].attributes.next_rising:this.hass.states["sun.sun"].attributes.next_setting,t=ao(h,e);h={mode:r,hours:t.hours,minutes:t.minutes}}h=Ee(h,s);const u=He(h);let p=[...this.schedule.slots];if(p=Object.assign(p,{[e]:Object.assign(Object.assign({},p[e]),{stop:u}),[e+1]:Object.assign(Object.assign({},p[e+1]),{start:He(h)})}),void 0===p[e+1].stop){const t=He(Ce(h,{minutes:1}));p=Object.assign(p,{[e+2]:Object.assign(Object.assign({},p[e+2]),{start:t})})}this.schedule=Object.assign(Object.assign({},this.schedule),{slots:p});const m=new CustomEvent("update",{detail:{slots:p}});this.dispatchEvent(m)};const l=e=>{e.preventDefault()},c=()=>{window.removeEventListener("mousemove",d),window.removeEventListener("touchmove",d),window.removeEventListener("mouseup",c),window.removeEventListener("touchend",c),window.removeEventListener("blur",c),window.removeEventListener("dragstart",l),d=()=>{}};window.addEventListener("mouseup",c),window.addEventListener("touchend",c),window.addEventListener("blur",c),window.addEventListener("dragstart",l),window.addEventListener("mousemove",d),window.addEventListener("touchmove",d)}static get styles(){return r`
      :host {
        display: block;
        max-width: 100%;
        overflow: hidden;
      }
      .zoom-controls {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin-bottom: 4px;
      }
      .zoom-level {
        font-size: 0.75rem;
        color: var(--secondary-text-color);
        min-width: 3em;
        text-align: center;
        cursor: pointer;
        user-select: none;
      }
      .viewport {
        width: 100%;
        overflow: hidden;
        position: relative;
        touch-action: none;
        /* A block wider than its container overflow-anchors based on its
           PARENT's direction (this element), not its own. Forcing ltr here
           gives zoom-content a fixed, direction-independent anchor; see the
           comment in render(). Real direction is restored further down. */
        direction: ltr;
      }
      .zoom-content {
        position: relative;
      }
      .slots-wrapper {
        width: 100%;
        position: relative;
      }
      .boundaries {
        position: relative;
        width: 100%;
        transition: height 0.15s ease-in-out;
      }
      .boundary {
        position: absolute;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
      }
      .boundary.start {
        align-items: flex-start;
      }
      .boundary.end {
        align-items: flex-end;
      }
      .boundary-label {
        font-size: 0.8rem;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
        color: var(--primary-text-color);
        margin-bottom: 3px;
      }
      .boundary-label.on {
        color: rgb(var(--rgb-state-active-color, 67, 160, 71));
      }
      .boundary-label.off {
        color: rgb(211, 47, 47);
      }
      .boundary-label.empty {
        color: var(--secondary-text-color);
      }
      .boundary-label.pending {
        color: rgb(156, 39, 176);
      }
      .boundary-line {
        display: block;
        width: 1px;
        background: var(--divider-color, rgba(127, 127, 127, 0.5));
        transition: height 0.15s ease-in-out;
      }
      .bar {
        width: 100%;
        height: 60px;
        display: flex;
        position: relative;
      }
      .create-overlay {
        position: absolute;
        top: 0;
        height: 100%;
        box-sizing: border-box;
        background: rgba(var(--rgb-secondary-text-color), 0.45);
        border: 2px solid rgb(156, 39, 176);
        border-radius: 4px;
        pointer-events: none;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3;
      }
      .create-overlay span {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
      }
      .slot.pending {
        background: rgba(var(--rgb-secondary-text-color), 0.5);
        border: 2px solid rgb(156, 39, 176);
      }
      .slot.pending:hover {
        background: rgba(var(--rgb-secondary-text-color), 0.65);
      }
      .slot.pending.selected {
        border: 3px solid rgb(156, 39, 176);
      }
      .time-bar {
        width: 100%;
        height: 18px;
        display: flex;
      }
      .time-bar span {
        display: flex;
        justify-content: center;
        white-space: nowrap;
      }
      .time-bar span.left {
        justify-content: flex-start;
      }
      .time-bar span.right {
        justify-content: flex-end;
      }

      .slot {
        display: flex;
        height: 100%;
        box-sizing: border-box;
        cursor: pointer;
        background: rgba(var(--rgb-primary-color), 0.7);
        color: var(--text-primary-color);
        font-weight: 500;
        align-items: center;
        justify-content: center;
        word-break: break-all;
        white-space: normal;
        margin-inline-end: 3px;
      }
      .slot:hover {
        background: rgba(var(--rgb-primary-color), 0.85);
      }
      .slot.selected {
        border: 3px solid rgba(var(--rgb-primary-color), 0.85);
      }
      .slot.selected:hover {
        border: 3px solid rgba(var(--rgb-primary-color), 1);
      }
      .slot:first-child {
        border-start-start-radius: 10px;
        border-end-start-radius: 10px;
      }
      .slot:last-child {
        border-start-end-radius: 10px;
        border-end-end-radius: 10px;
        margin-inline-end: 0px;
      }
      .slot.on {
        background: rgba(var(--rgb-state-active-color, 67, 160, 71), 0.75);
      }
      .slot.on:hover {
        background: rgba(var(--rgb-state-active-color, 67, 160, 71), 0.9);
      }
      .slot.on.selected {
        border: 3px solid rgba(var(--rgb-state-active-color, 67, 160, 71), 0.9);
      }
      .slot.on.selected:hover {
        border: 3px solid rgba(var(--rgb-state-active-color, 67, 160, 71), 1);
      }
      .slot.off {
        background: rgba(211, 47, 47, 0.7);
      }
      .slot.off:hover {
        background: rgba(211, 47, 47, 0.85);
      }
      .slot.off.selected {
        border: 3px solid rgba(211, 47, 47, 0.85);
      }
      .slot.off.selected:hover {
        border: 3px solid rgba(211, 47, 47, 1);
      }
      .slot.empty {
        background: rgba(var(--rgb-secondary-text-color), 0.5);
        border: 2px solid rgb(156, 39, 176);
      }
      .slot.empty:hover {
        background: rgba(var(--rgb-secondary-text-color), 0.65);
      }
      .slot.empty.selected {
        border: 3px solid rgb(156, 39, 176);
      }
      .slot .marker {
        width: 24px;
        height: 24px;
        background: rgba(var(--rgb-primary-color), 0.85);
        margin-top: -80px;
        position: absolute;
        transform: rotate(45deg);
        border-radius: 12px 12px 0px 12px;
      }
      .slot .marker:hover {
        background: rgba(var(--rgb-primary-color), 1);
      }
      .slot.on .marker {
        background: rgba(var(--rgb-state-active-color, 67, 160, 71), 0.9);
      }
      .slot.on .marker:hover {
        background: rgba(var(--rgb-state-active-color, 67, 160, 71), 1);
      }
      .slot.off .marker {
        background: rgba(211, 47, 47, 0.85);
      }
      .slot.off .marker:hover {
        background: rgba(211, 47, 47, 1);
      }
      .slot.empty .marker {
        background: rgba(var(--rgb-secondary-text-color), 0.85);
      }
      .slot.empty .marker:hover {
        background: rgba(var(--rgb-secondary-text-color), 1);
      }
      .handle {
        display: flex;
        width: 36px;
        height: 100%;
        align-content: center;
        align-items: center;
        justify-content: center;
        margin-inline-start: -18px;
        margin-inline-end: -18px;
        visibility: visible;
      }
      .handle.hidden {
        visibility: hidden;
      }
      .handle span {
        background: var(--card-background-color);
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        z-index: 5;
      }
      .handle ha-icon-button {
        --mdc-icon-button-size: 36px;
        margin-top: -12px;
        margin-inline-start: -12px;
      }
      .handle.center span {
        margin-inline-end: -2px;
      }
    `}};t([le({attribute:!1})],no.prototype,"config",void 0),t([ce()],no.prototype,"schedule",void 0),t([ce()],no.prototype,"selectedSlot",void 0),t([ce()],no.prototype,"_width",void 0),t([ce()],no.prototype,"_zoom",void 0),t([ce()],no.prototype,"_panPx",void 0),t([ce()],no.prototype,"_createRange",void 0),t([ce()],no.prototype,"pendingSlot",void 0),t([le({type:Boolean})],no.prototype,"large",void 0),no=t([re("scheduler-timeslot-editor")],no);const ro=e=>{let t=60*e.hours+e.minutes;return t>240?e=Object.assign(Object.assign({},e),{hours:4,minutes:0}):t<-240&&(e=Object.assign(Object.assign({},e),{hours:-4,minutes:0})),e};let lo=class extends oe{constructor(){super(...arguments),this.hours=0,this.minutes=0,this.mode=we.Fixed,this.autoValidate=!0,this.required=!0,this.disabled=!1,this.label="",this.useAmPm=!1,this.large=!1,this.stepSize=10}set time(e){const t=De(e);this.mode=t.mode,this.hours=t.hours,this.minutes=t.minutes}render(){return R`
      <div class="time-input-wrap">
        <div class="input">
          ${this.label?R`<span class="label">${this.label}</span>`:q}
          ${this.large?q:this._renderTimeMode()}
          <div class="hours">
            ${this.large?R`
            <ha-button
              appearance="plain"
              @click=${()=>this._addTimeOffset({hours:1})}
              ?disabled=${this.mode!=we.Fixed&&4==this.hours}
            >
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </ha-button>
            `:q}
            <ha-input
              id="hour"
              inputmode="numeric"
              .value=${this.formatHours()}
              label=""
              name="hours"
              @change=${this._hoursChanged}
              @focusin=${this._onFocus}
              .required=${this.required}
              .autoValidate=${this.autoValidate}
              maxlength="2"
              max=${this.mode==we.Fixed?this.useAmPm?12:23:4}
              min=${this.mode==we.Fixed||this.large?0:-4}
              .disabled=${this.disabled}
              .validityTransform=${(e,t)=>{let i=null!==e.match(/^[1|2]?[0-9]$/);return{valid:i,customError:!i}}}
            >
            </ha-input>
            ${this.large?R`
            <ha-button
              appearance="plain"
              @click=${()=>this._addTimeOffset({hours:-1})}
              ?disabled=${this.mode!=we.Fixed&&-4==this.hours}
            >
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </ha-button>
            `:q}
          </div>
          <div class="time-separator">:</div>
          <div class="minutes">
            ${this.large?R`
            <ha-button
              appearance="plain"
              @click=${()=>this._addTimeOffset({minutes:this.stepSize})}
              ?disabled=${this.mode!=we.Fixed&&4==this.hours}
            >
              <ha-icon icon="mdi:chevron-up"></ha-icon>
            </ha-button>
            `:q}
            <ha-input
              id="min"
              inputmode="numeric"
              .value=${this.formatMinutes()}
              label=""
              @change=${this._minutesChanged}
              @focusin=${this._onFocus}
              name="minutes"
              .required=${this.required}
              .autoValidate=${this.autoValidate}
              maxlength="2"
              max="59"
              min="0"
              .disabled=${this.disabled}
              .validityTransform=${(e,t)=>{let i=null!==e.match(/^[0-5]?[0-9]$/);return{valid:i,customError:!i}}}
            >
            </ha-input>
            ${this.large?R`
            <ha-button
              appearance="plain"
              @click=${()=>this._addTimeOffset({minutes:-this.stepSize})}
              ?disabled=${this.mode!=we.Fixed&&-4==this.hours}
            >
              <ha-icon icon="mdi:chevron-down"></ha-icon>
            </ha-button>
            `:q}
          </div>
          ${this._renderSuffix()}
          ${this.large?this._renderTimeMode():q}
        </div>
      </div>
    `}_renderTimeMode(){if(!this.hass.states["sun.sun"])return q;if(this.large){const e=()=>{let e=this._convertTimeMode();e.mode!=we.Fixed&&(e=ro(e)),this.mode=e.mode,this.hours=e.hours,this.minutes=e.minutes,this._valueChanged()};return R`
        <div class="mode">
          ${this.hass.states["sun.sun"]?R`
          <ha-button
            appearance="${this.mode==we.Fixed?"plain":"accent"}"
            variant="${this.mode==we.Fixed?"neutral":"brand"}"
            @click=${e}
          >
            <ha-icon icon="mdi:theme-light-dark"></ha-icon>
          </ha-button>
          `:q}
        </div>
      `}{let e=[we.Fixed,we.Sunrise,we.Sunset];const t={[we.Fixed]:ns("ui.components.selectors.selector.types.time",this.hass),[we.Sunrise]:ns("ui.panel.config.automation.editor.triggers.type.sun.sunrise",this.hass),[we.Sunset]:ns("ui.panel.config.automation.editor.triggers.type.sun.sunset",this.hass)},i={[we.Fixed]:"mdi:clock-outline",[we.Sunrise]:"mdi:weather-sunset-up",[we.Sunset]:"mdi:weather-sunset-down"},s={[we.Fixed]:"M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z",[we.Sunrise]:"M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,16.3L15.82,19.41C16.21,19.8 16.21,20.43 15.82,20.82C15.43,21.21 14.8,21.21 14.41,20.82L12,18.41L9.59,20.82C9.2,21.21 8.57,21.21 8.18,20.82C7.79,20.43 7.79,19.8 8.18,19.41L11.29,16.3C11.5,16.1 11.74,16 12,16C12.26,16 12.5,16.1 12.71,16.3Z",[we.Sunset]:"M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,20.71L15.82,17.6C16.21,17.21 16.21,16.57 15.82,16.18C15.43,15.79 14.8,15.79 14.41,16.18L12,18.59L9.59,16.18C9.2,15.79 8.57,15.79 8.18,16.18C7.79,16.57 7.79,17.21 8.18,17.6L11.29,20.71C11.5,20.9 11.74,21 12,21C12.26,21 12.5,20.9 12.71,20.71Z"},a=e=>{if(e==we.Fixed)return!1;const t=this._convertTimeMode(e);return Math.abs(60*t.hours+t.minutes)>240};return R`
      <ha-dropdown
        @wa-select=${e=>{const t=e.detail.item.value;if(this.mode==t)return;const i=this._convertTimeMode(t);this.hours=i.hours,this.minutes=i.minutes,this.mode=t,this._valueChanged()}}
        @wa-after-hide=${e=>{e.target.firstElementChild.blur()}}
        ?disabled=${this.disabled}
      >
        <ha-icon-button
          slot="trigger"
          .path=${s[this.mode]}
          ?disabled=${this.disabled}
        >
        </ha-icon-button>
        ${e.map(e=>R`
        <ha-dropdown-item
          ?noninteractive=${this.mode==e}
          ?disabled=${a(e)&&this.mode!=e}
          value="${e}"
        >
          <ha-icon
            icon="${i[e]}"
          ></ha-icon>
          ${t[e]}
        </ha-dropdown-item>
        `)}
      </ha-dropdown>
    `}}_renderSuffix(){if(this.large){const e=()=>{let e=Ie(this.hours).am_pm;const t=Ie(this.hours).hours;this.hours=Re(t,"AM"==e?Ne.PM:Ne.AM),this._valueChanged()},t=()=>{0!=this.hours?this.hours=-this.hours:this.minutes=-this.minutes,this._valueChanged()},i=()=>{this.mode=this.mode==we.Sunrise?we.Sunset:we.Sunrise,this._valueChanged()};return R`
        <div class="suffix">
        ${this.useAmPm&&this.mode==we.Fixed?R`
            <ha-button appearance="plain" @click=${e}>
              <span class="large">
                ${Ie(this.hours).am_pm==Ne.AM?"AM":"PM"}
              </span>
            </ha-button>
          `:q}
        ${this.mode!=we.Fixed?R`
            <ha-button appearance="plain" size="large" @click=${t}>
              <span class="large">
              ${this.hours<0||this.minutes<0?this.hass.localize("ui.panel.config.automation.editor.conditions.type.sun.before").trim().toLowerCase():this.hass.localize("ui.panel.config.automation.editor.conditions.type.sun.after").trim().toLowerCase()}
              </span>
            </ha-button>
            <ha-button appearance="plain" @click=${i}>
              <ha-icon icon="${this.mode==we.Sunrise?"mdi:weather-sunny":"mdi:weather-night"}"></ha-icon>
            </ha-button>
         `:q}
        </div>
      `}return this.useAmPm&&this.mode==we.Fixed?R`
        <ha-select
          .required=${this.required}
          .value=${Ie(this.hours).am_pm==Ne.AM?"AM":"PM"}
          .disabled=${this.disabled}
          name="amPm"
          naturalMenuWidth
          fixedMenuPosition
          @selected=${this._amPmChanged}
          @closed=${e=>{e.stopPropagation()}}
        >
          <ha-dropdown-item value="AM">AM</ha-dropdown-item>
          <ha-dropdown-item value="PM">PM</ha-dropdown-item>
        </ha-select>
      `:q}_convertTimeMode(e){const t=this.hass.states["sun.sun"].attributes.next_rising,i=this.hass.states["sun.sun"].attributes.next_setting;if(e&&e!=we.Fixed||this.mode==we.Fixed){const s=ao({hours:this.hours,minutes:this.minutes},t),a=ao({hours:this.hours,minutes:this.minutes},i),o=60*s.hours+s.minutes,n=60*a.hours+a.minutes;let r=e||(Math.abs(o)<=Math.abs(n)?we.Sunrise:we.Sunset),d=r==we.Sunrise?s:a;return{mode:r,hours:d.hours,minutes:d.minutes}}{let e=this.mode==we.Sunrise?De(t):De(i);return e=Ce(e,{hours:this.hours,minutes:this.minutes}),{mode:we.Fixed,hours:e.hours,minutes:e.minutes}}}_hoursChanged(e){let t=Number(e.target.value);if(this.useAmPm){const e=Ie(this.hours).am_pm;t=Re(t,e)}this.hours=t,this._valueChanged()}_minutesChanged(e){const t=Number(e.target.value);this.minutes=t,this._valueChanged()}_amPmChanged(e){const t=e.detail.value;if(Ie(this.hours).am_pm==t)return;const i=Ie(this.hours).hours;this.hours=Re(i,"AM"==t?Ne.AM:Ne.PM),this._valueChanged()}_addTimeOffset(e){let t={mode:this.mode,hours:this.hours,minutes:this.minutes};t=Ce(t,e),e.minutes&&(t=Ee(t,this.stepSize)),this.mode!=we.Fixed&&(t=ro(t)),this.hours=t.hours,this.minutes=t.minutes,this._valueChanged()}_valueChanged(){const e={mode:this.mode,hours:this.hours,minutes:this.minutes};Rs(this,"value-changed",{value:e})}_onFocus(e){e.currentTarget.select()}formatHours(){const e=this.hours<0||this.minutes<0;let t=this.useAmPm&&this.mode==we.Fixed?Ie(this.hours).hours:this.hours;return e&&!this.large?"-"+Math.abs(t).toFixed():this.mode==we.Fixed||this.large?this.large?Math.abs(t):t.toFixed():"+"+Math.abs(t).toFixed()}formatMinutes(){return Math.abs(this.minutes).toString().padStart(2,"0")}};lo.styles=r`
    :host {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      column-gap: 4px;
      align-items: center;
    }
    .time-input-wrap {
      display: flex;
      border-radius: var(--mdc-shape-small, 4px) var(--mdc-shape-small, 4px) 0 0;
      overflow: hidden;
      position: relative;
      direction: ltr;
    }
    :host([large]) .time-input-wrap {
      width: 100%;
    }
    div.input {
      display: flex;
    }
    :host([large]) div.input {
      width: 100%;
    }
    div.hours, div.minutes {
      display: flex;
      flex-direction: column;
      width: min-content;
    }
    div.hours ha-icon, div.minutes ha-icon {
      --mdc-icon-size: 42px;
    }
    .time-separator {
      background-color: var(--ha-color-form-background);
      color: var(--ha-color-text-secondary);
      border-bottom: 1px solid var(--ha-color-border-neutral-loud);
      box-sizing: border-box;
      height: 56px;
      width: 9px;
      display: flex;
      align-items: center;
      align-self: center;
      justify-content: center;
      font-size: 16px;
      font-weight: 600;
    }
    :host([disabled]) .time-separator {
      background-color: var(--ha-color-form-background-disabled);
      opacity: 0.5;
    }
    :host([large]) .time-separator {
      background: none;
      border: none;
      font-size: 36px;
    }
    ha-input {
      width: 40px;
      --mdc-shape-small: 0;
      --text-field-appearance: none;
      --text-field-padding-top: 0;
      --text-field-padding-bottom: 0;
      --text-field-padding-start: 4px;
      --text-field-padding-end: 4px;
      --text-field-suffix-padding-left: 2px;
      --text-field-suffix-padding-right: 0;
      --ha-input-text-align: center;
      --ha-input-padding-top: 0px;
      --ha-input-padding-bottom: 0px;
    }
    ha-input::part(wa-input) {
      text-align: center;
    }
    ha-input::part(wa-hint) {
      height: 0;
      min-height: 0;
    }
    ha-input::part(wa-base) {
      padding: var(--ha-space-1);
    }
    ha-input#hour::part(wa-base) {
      border-top-right-radius: 0px;
    }
    ha-input#min::part(wa-base) {
      border-top-left-radius: 0px;
    }
    :host([large]) ha-input#hour::part(wa-base),
    :host([large]) ha-input#min::part(wa-base) {
      border-top-right-radius: var(--ha-border-radius-sm);
      border-top-left-radius: var(--ha-border-radius-sm);
    }
    :host([large]) ha-input {
      width: 75px;
      --wa-form-control-value-font-size: 42px;
    }
    div.suffix {
      display: flex;
      flex-direction: row;
      flex-grow: 1;
      align-items: center;
      flex-wrap: wrap;
      align-content: center;
    }
    div.mode {
      display: flex;
      align-items: center;
    }
    :host([large]) div.suffix ha-icon, :host([large]) div.mode ha-icon {
      --mdc-icon-size: 32px;
    }
    ha-select {
      --mdc-shape-small: 0;
      width: 90px;
    }
    .label {
      display: flex;
      justify-content: center;
      align-self: center;
      white-space: nowrap;
    }
    ha-dropdown-menu {
      display: flex;
      align-items: flex-end;
      margin-right: 4px;
      padding-bottom: 4px;
    }
    ha-dropdown-menu ha-icon-button {
      color: var(--secondary-text-color);
    }
    ha-dropdown-item[disabled] ha-icon {
      color: var(--disabled-text-color);
    }
    ha-dropdown-item[noninteractive] {
      background-color: rgba(var(--rgb-primary-color), 0.12);
      color: var(--sidebar-selected-text-color);
    }
    ha-dropdown-item[noninteractive] ha-icon {
      color: var(--sidebar-selected-text-color);
    }
    ha-button {
      --ha-button-border-radius: 8px;
      --button-color-fill-loud-hover: var(--ha-color-primary-50);
    }
    ha-button span.large {
      font-size: 16px;
      text-transform: uppercase;
    }
    @media all and (max-width: 450px), all and (max-height: 500px) {
      ha-button {
        --wa-form-control-padding-inline: 10px;
      }
    }
  `,t([le({attribute:!1})],lo.prototype,"hass",void 0),t([ce()],lo.prototype,"hours",void 0),t([ce()],lo.prototype,"minutes",void 0),t([ce()],lo.prototype,"mode",void 0),t([le({type:Boolean})],lo.prototype,"autoValidate",void 0),t([le({type:Boolean})],lo.prototype,"required",void 0),t([le({type:Boolean})],lo.prototype,"disabled",void 0),t([le({type:String})],lo.prototype,"label",void 0),t([le({type:Boolean})],lo.prototype,"useAmPm",void 0),t([le({type:Boolean})],lo.prototype,"large",void 0),t([le({attribute:!1})],lo.prototype,"stepSize",void 0),lo=t([re("scheduler-time-picker")],lo);let co=class extends oe{constructor(){super(...arguments),this.weekdayTypeCustomSelected=!1,this.selectedWeekdays=[]}async showDialog(e){this._params=e,await this.updateComplete,this.selectedWeekdays=this._params.weekdays.filter(e=>![_e.Daily,_e.Weekend,_e.Workday].includes(e)),this.weekdayTypeCustomSelected=this.selectedWeekdays.length>0&&this._params.weekdays.length==this.selectedWeekdays.length}async closeDialog(){this._params&&this._params.cancel(),this._params=void 0}render(){return this._params?R`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        width="small"
      >
        <ha-dialog-header slot="header">
          ${this.weekdayTypeCustomSelected?R`
          <ha-icon-button
            slot="navigationIcon"
            .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
            .path=${Fs}
            @click=${this.backClick}
          ></ha-icon-button>
            `:R`
          <ha-icon-button
            slot="navigationIcon"
            data-dialog="close"
            .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
            .path=${Bs}
          ></ha-icon-button>
          `};
          <div slot="title">
              ${Yi("ui.dialog.weekday_picker.title",this.hass)}
          </div>
        </ha-dialog-header>
        <div class="wrapper">
          <ha-list>
          ${this._renderWeekdayOptions()}
          </ha-list>
        </div>

        <ha-dialog-footer slot="footer">
          <ha-button
            appearance="plain"
            slot="secondaryAction"
            @click=${this.cancelClick}
            data-dialog="close"
          >
            ${ns("ui.common.cancel",this.hass)}
          </ha-button>
          <ha-button
            appearance="accent"
            slot="primaryAction"
            @click=${this.confirmClick}
            data-dialog="close"
            ?disabled=${!this._params.weekdays.length}
          >
            ${ns("ui.common.ok",this.hass)}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `:R``}_renderWeekdayOptions(){let e=[];if(this.weekdayTypeCustomSelected){e=[_e.Sunday,_e.Monday,_e.Tuesday,_e.Wednesday,_e.Thursday,_e.Friday,_e.Saturday];e=((e,t)=>e.concat(e).slice(t,t+e.length))(e,As(this.hass))}else e=[_e.Daily,_e.Workday,_e.Weekend,"Custom"];const t=e=>{var t,i;return"Custom"==e?null===(t=this._params)||void 0===t?void 0:t.weekdays.some(e=>![_e.Daily,_e.Weekend,_e.Workday].includes(e)):null===(i=this._params)||void 0===i?void 0:i.weekdays.includes(e)};return e.map(e=>R`
        <ha-list-item
          graphic="icon"
          @click=${this._toggleSelectOption}
          option="${e}"
          ?hasMeta=${"Custom"==e}
        >
          ${t(e)?R`<ha-icon slot="graphic" icon="mdi:check"></ha-icon>`:""}
          ${"Custom"==e?R`
            ${os(Yi("ui.dialog.weekday_picker.choose",this.hass))}
            ${this.selectedWeekdays.length?R`<span class="badge">${this.selectedWeekdays.length}</span>`:""}
            `:os(Es(e,"long",this.hass))}

          ${"Custom"==e?R`<ha-icon slot="meta" icon="mdi:chevron-right"></ha-icon>`:""}
        </ha-list-item>
    `)}_toggleSelectOption(e){const t=e.target.getAttribute("option");let i=[...this._params.weekdays];"Custom"==t?(i=this.selectedWeekdays,this.weekdayTypeCustomSelected=!0):[_e.Daily,_e.Weekend,_e.Workday].includes(t)?(i.includes(t)?i.length>1&&(i=i.filter(e=>e!=t)):i=[t],this.weekdayTypeCustomSelected=!1):i=i.includes(t)?i.filter(e=>e!=t):[...i,t],this._params=Object.assign(this._params,{weekdays:i}),e.target.blur(),this.requestUpdate()}confirmClick(){const e=Array.from(new Set(this._params.weekdays));this._params.confirm(e)}cancelClick(){this._params.cancel()}backClick(){this.weekdayTypeCustomSelected=!1,this.selectedWeekdays=this._params.weekdays.filter(e=>![_e.Daily,_e.Weekend,_e.Workday].includes(e))}static get styles(){return r`
      div.wrapper {
        color: var(--primary-text-color);
        padding: 0px 12px;
      }
      ha-list {
        --mdc-list-vertical-padding: 0px;
      }
      ha-list-item[disabled] {
        color: var(--disabled-text-color);
      }
      ha-list-item.nested {
        --mdc-list-side-padding: 36px;
      }
      .badge {
        height: 24px;
        border-radius: 12px;
        background: rgba(var(--rgb-primary-color), 0.3);
        line-height: 1.25rem;
        font-size: 0.875rem;
        font-weight: 400;
        padding: 0px 12px;
        display: inline-flex;
        align-items: center;
        box-sizing: border-box;
        margin: 0px 16px;
      }
    `}};t([le({attribute:!1})],co.prototype,"hass",void 0),t([ce()],co.prototype,"_params",void 0),t([ce()],co.prototype,"weekdayTypeCustomSelected",void 0),t([ce()],co.prototype,"selectedWeekdays",void 0),co=t([re("dialog-select-weekdays")],co);var ho=Object.freeze({__proto__:null,get DialogSelectWeekdays(){return co}});const uo=(e,t)=>((e,t)=>e<t?-1:e>t?1:0)(e.toLowerCase(),t.toLowerCase()),po=(e,t,i)=>{const s=Object.keys(e.services).includes(t)?Object.keys(e.services[t]).filter(e=>{if(!Object.keys(ls).includes(t))return!1;let s=Object.keys(ls[t]).includes(e);if(!s&&Object.keys(ls[t]).includes("{entity_id}")){if("script"==t&&["turn_on","turn_off","reload","toggle","test"].includes(e))return!1;s=is(`${t}.${e}`,i)}return s}):[],a=t=>ns(`component.${t}.title`,e,!1)||t.replace(/_/g," "),o=s=>{let o=os(Os({service:`${t}.${s}`,service_data:{}},e,i.customize));return"script"==t?Object.keys(i.customize||{}).includes(`${t}.${s}`)&&Ke(i.customize[`${t}.${s}`].name)?i.customize[`${t}.${s}`].name:`${os(Ms(`${t}.${s}`,e,i.customize))}: ${o}`:`${a(t)}: ${o}`},n=i=>{let s=ns(`component.${t}.services.${i}.description`,e,!1);return s||(s=e.services[t][i].description),s||"script"!=t||(s=ns(`component.${t}.services.turn_on.description`,e,!1)),s};let r=s.map(s=>{return{key:s,name:o(s),description:n(s),icon:(a=s,"script"==t&&Object.keys(i.customize||{}).includes(`${t}.${a}`)&&Ke(i.customize[`${t}.${a}`].icon)?i.customize[`${t}.${a}`].icon:Object.keys(fs).includes(t)&&Object.keys(fs[t].services).includes(a)?fs[t].services[a]:ea(t)),action:{service:s.includes(".")?s:`${t}.${s}`,service_data:{},target:e.services[t][s].target?{}:void 0}};var a}),d=(l=i.customize||{},c=t,Object.keys(l).filter(e=>{var t;return null===(t=l[e].exclude_actions)||void 0===t?void 0:t.length}).filter(e=>!c||!c.includes(".")&&ts(Qi(e),c)||ts(e,c)).map(e=>l[e].exclude_actions).flat().filter(Ke));var l,c;return d.length&&(r=r.filter(t=>!d.some(s=>uo(Ji(t.action.service),s)>0||uo(Os(t.action,e,i.customize),s)>0))),ps(i.customize||{},t).forEach(e=>{let i=e.service;for(;r.find(e=>e.key==i);)i+="_2";e.variables&&Object.entries(e.variables).forEach(([t,i])=>{let s=ks(i),a=Ra(s);!Ke(e.service_data[t])&&Ke(a)?e=Object.assign(Object.assign({},e),{service_data:Object.assign(Object.assign({},e.service_data),{[t]:a})}):Ke(e.service_data[t])||(e=Object.assign(Object.assign({},e),{service_data:Object.assign(Object.assign({},e.service_data),{[t]:null})}))}),r.push({key:i,name:`${a(t)}: ${mo(e.name||o(Ji(e.service)))}`,description:mo(e.name||""),icon:e.icon||ea(t),action:{service:e.service.includes(".")?e.service:`${t}.${e.service}`,service_data:e.service_data||{},target:e.target?e.target:void 0,name:e.name,icon:e.icon}})}),r},mo=e=>{if(null!==/<.+?>/g.exec(e)){e=(new DOMParser).parseFromString(e,"text/html").body.textContent||""}let t;for(;t=/\[([^\]]+)\]/.exec(e);)e=e.replace(t[0],"");for(;t=/\{([^\}]+)\}/.exec(e);)e=e.replace(t[0],"");return e};let _o=class extends oe{constructor(){super(...arguments),this._search="",this._filter="",this.timer=0,this.lockDomain=!1,this.showAll=!1}async showDialog(e){this._params=e,this.lockDomain=void 0!==e.domainFilter,this.showAll=!1,this.selectedEntity=void 0,await this.updateComplete}async closeDialog(){this._params&&this._params.cancel(),this._params=void 0,this._clearSearch(),this._height=void 0,this._width=void 0}async willUpdate(){this.hass.loadBackendTranslation("title"),this.hass.loadBackendTranslation("services")}render(){return this._params?R`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        @wa-after-show=${this._opened}
      >
        <div slot="header">
          <ha-dialog-header>
            ${void 0!==this.selectedEntity||void 0!==this._params.domainFilter&&!this.lockDomain?R`
            <ha-icon-button
              slot="navigationIcon"
              .label=${ns("ui.common.back",this.hass)}
              .path=${Fs}
              @click=${this._navigateBack}
            ></ha-icon-button>
            `:R`
            <ha-icon-button
              slot="navigationIcon"
               data-dialog="close"
              .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
              .path=${Bs}
            ></ha-icon-button>
            `}
            <div slot="title">
              ${Yi("ui.dialog.action_picker.title",this.hass)}
            </div>
            ${!this.lockDomain&&Ke(this._params.cardConfig.include)?R`
            <ha-dropdown
              placement="bottom-end"
              slot="actionItems"
              @wa-after-hide=${e=>{e.target.firstElementChild.blur()}}
            >
              <ha-icon-button slot="trigger" .label=${this.hass.localize("ui.common.menu")} .path=${Us}>
              </ha-icon-button>
              <ha-dropdown-item @click=${this._toggleShowAll}>
                <ha-icon
                  icon="mdi:check"
                  style="${this.showAll?"":"visibility: hidden"}"
                ></ha-icon>
                ${Yi("ui.dialog.action_picker.show_all",this.hass)}
              </ha-dropdown-item>
            </ha-dropdown>`:""}
          </ha-dialog-header>

          <ha-input
            dialogInitialFocus
            .placeholder=${ns("ui.common.search",this.hass)}
            aria-label=${ns("ui.common.search",this.hass)}
            @input=${this._handleSearchChange}
            .value=${this._search}
            icon
            .iconTrailing=${this._search}
          >
            <div class="trailing" slot="trailingIcon">
              ${this._search&&R`
                <ha-icon-button
                  @click=${this._clearSearch}
                  .label=${ns("ui.common.clear",this.hass)}
                  .path=${Bs}
                  class="clear-button"
                ></ha-icon-button>
              `}
              <slot name="suffix"></slot>
            </div>
          </ha-input>
        </div>
        
        <ha-list
          style=${na({minWidth:this._width+"px",height:this._height?Math.min(468,this._height)+"px":"auto"})}
        >
          ${this._renderOptions()}
        </ha-list>
      </ha-dialog>
    `:R``}_opened(){var e;const t=null===(e=this.shadowRoot.querySelector("ha-list"))||void 0===e?void 0:e.getBoundingClientRect();this._width=null==t?void 0:t.width,this._height=null==t?void 0:t.height}_handleSearchChange(e){const t=e.currentTarget.value;this._search=t,clearTimeout(this.timer),this.timer=window.setTimeout(()=>{this._filter=this._search},100)}_renderOptions(){var e,t,i;if(null===(e=this._params)||void 0===e?void 0:e.domainFilter){if(!(null===(t=this._params.entityFilter)||void 0===t?void 0:t.length)&&void 0===this.selectedEntity){const e=this._computeEntitiesForDomains(this._params.domainFilter);if(e.length>1)return this._renderEntityList(e);1===e.length&&(this.selectedEntity=e[0])}return this._renderDomainActions()}let s=Object.assign({},null===(i=this._params)||void 0===i?void 0:i.cardConfig);this.showAll&&(s=Object.assign(Object.assign({},s),{include:void 0,exclude:void 0}));const a=ta(this.hass,s);return 1===a.length?(this._params=Object.assign(Object.assign({},this._params),{domainFilter:[a[0].key]}),this._renderOptions()):this._renderDomainList(a)}_computeEntitiesForDomains(e){const t=e.filter(e=>!["script","notify"].includes(e));let i=Object.assign({},this._params.cardConfig);return this.showAll&&(i=Object.assign(Object.assign({},i),{include:void 0,exclude:void 0})),Object.keys(this.hass.states).filter(e=>t.includes(Qi(e))).filter(e=>is(e,i))}_renderEntityList(e){let t=e.map(e=>({key:e,name:Ms(e,this.hass,this._params.cardConfig.customize),icon:pa(e,this._params.cardConfig.customize,this.hass)}));return t.sort((e,t)=>as(e.name,t.name)),this._filter&&(t=t.filter(e=>{const t=this._filter.toLowerCase().trim().split(" ");return t.every(t=>e.name.toLowerCase().includes(t))||t.every(t=>e.key.toLowerCase().includes(t))})),t.length?t.map(e=>R`
      <ha-list-item
        graphic="icon"
        hasMeta
        @click=${()=>this._handleEntityClick(e.key)}
      >
        <ha-icon slot="graphic" icon="${e.icon}"></ha-icon>
        <ha-icon slot="meta" icon="mdi:chevron-right"></ha-icon>
        <span>${e.name}</span>
      </ha-list-item>
    `):R`
        <ha-list-item disabled>
          ${ns("ui.components.combo-box.no_match",this.hass)}
        </ha-list-item>
      `}_handleEntityClick(e){this.selectedEntity=e,this._clearSearch()}_renderDomainList(e){e.sort((e,t)=>as(e.name,t.name)),this._filter&&(e=e.filter(e=>{const t=this._filter.toLowerCase().trim().split(" ");return t.every(t=>e.name.toLowerCase().includes(t))||t.every(t=>e.key.toLowerCase().includes(t))}));let t=[];for(var i=e.length;i<7;i++)t.push(0);return Object.keys(e).length?R`
      ${Object.keys(e).map(t=>R`
        <ha-list-item
          graphic="icon"
          hasMeta
          @click=${()=>this._handleDomainClick(e[t].key)}
        >
          <ha-icon slot="graphic" icon="${e[t].icon}"></ha-icon>
          <ha-icon slot="meta" icon="mdi:chevron-right"></ha-icon>
          <span>${e[t].name}</span>
        </ha-list-item>`)}
        ${t.map(e=>R`
        <ha-list-item
          graphic="icon"
          hasMeta
          noninteractive
        >
        </ha-list-item>
        `)}
      `:R`
          <ha-list-item disabled>
            ${ns("ui.components.combo-box.no_match",this.hass)}
          </ha-list-item>
        `}_renderDomainActions(){var e;let t=Object.assign({},null===(e=this._params)||void 0===e?void 0:e.cardConfig);this.showAll&&(t=Object.assign(Object.assign({},t),{include:void 0,exclude:void 0}));let i=this._params.domainFilter.map(e=>po(this.hass,e,t)).flat();const s=[...this._params.entityFilter||[],...void 0!==this.selectedEntity?[this.selectedEntity]:[]];if(s.length&&(i=i.filter(e=>s.every(t=>{const i=ms(e.action,this._params.cardConfig.customize),s=this.hass.states[t];return!(i.supported_features&&!((s.attributes.supported_features||0)&i.supported_features))&&((!Object.keys(e.action.service_data).includes("entity_id")||e.action.service_data.entity_id==t)&&(!Object.keys(e.action.target||{}).includes("entity_id")||(e.action.target||{}).entity_id==t))}))),!this._filter&&2===i.length){const e=i.map(e=>Ji(e.action.service));if(e.includes("turn_on")&&e.includes("turn_off")){const t=i[e.indexOf("turn_on")],s=i[e.indexOf("turn_off")];return R`
          <div class="onoff-picker">
            <button class="onoff on" @click=${()=>this._handleActionClick(t)}>
              <ha-icon icon="mdi:power-on"></ha-icon>
              ${t.name}
            </button>
            <button class="onoff off" @click=${()=>this._handleActionClick(s)}>
              <ha-icon icon="mdi:power-off"></ha-icon>
              ${s.name}
            </button>
          </div>
        `}}return this._filter&&(i=i.filter(e=>{const t=this._filter.toLowerCase().trim().split(" ");return t.every(t=>e.name.toLowerCase().includes(t))||t.every(t=>e.key.toLowerCase().includes(t))})),Object.keys(i).length?Object.keys(i).map(e=>R`
        <ha-list-item
          graphic="icon"
          @click=${()=>this._handleActionClick(i[e])}
          twoline
        >
          <ha-icon slot="graphic" icon="${i[e].icon}"></ha-icon>
          <span>${i[e].name}</span>
          <span slot="secondary">${i[e].description}</span>
        </ha-list-item>
    `):R`
          <ha-list-item disabled>
            ${ns("ui.components.combo-box.no_match",this.hass)}
          </ha-list-item>
        `}_handleDomainClick(e){this._params=Object.assign(Object.assign({},this._params),{domainFilter:[e]}),this._clearSearch()}_clearDomain(){this._params=Object.assign(Object.assign({},this._params),{domainFilter:void 0}),this.selectedEntity=void 0,this._clearSearch()}_navigateBack(){void 0!==this.selectedEntity?(this.selectedEntity=void 0,this._clearSearch()):this._clearDomain()}_handleActionClick(e){let t=e.action;void 0===this.selectedEntity||["script","notify"].includes(Qi(t.service))||(t=Object.assign(Object.assign({},t),{target:Object.assign(Object.assign({},t.target||{}),{entity_id:this.selectedEntity})})),this._params.confirm(t),this._params=void 0,this.selectedEntity=void 0,this._clearSearch()}_clearSearch(){this._search="",this._filter=""}_toggleShowAll(){this.showAll?this.showAll=!1:(this.showAll=!0,this.lockDomain||this._clearDomain())}static get styles(){return r`
      ha-dialog {
        --dialog-content-padding: 0;
        --ha-dialog-width-md: 480px;
      }
      ha-input {
        display: block;
        margin: 0 16px;
      }
      ha-list {
        min-height: 300px;
      }
      ha-list-item:not([twoline]) {
        height: 56px;
      }
      .onoff-picker {
        display: flex;
        flex-direction: row;
        gap: 12px;
        padding: 24px 16px;
      }
      .onoff {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 96px;
        font-size: 1rem;
        font-weight: 500;
        font-family: inherit;
        color: var(--text-primary-color);
        border: none;
        border-radius: 12px;
        cursor: pointer;
      }
      .onoff ha-icon {
        --mdc-icon-size: 32px;
      }
      .onoff.on {
        background: rgba(var(--rgb-state-active-color, 67, 160, 71), 0.85);
      }
      .onoff.on:hover {
        background: rgb(var(--rgb-state-active-color, 67, 160, 71));
      }
      .onoff.off {
        background: rgba(211, 47, 47, 0.85);
      }
      .onoff.off:hover {
        background: rgb(211, 47, 47);
      }
    `}};t([le({attribute:!1})],_o.prototype,"hass",void 0),t([ce()],_o.prototype,"_params",void 0),t([ce()],_o.prototype,"_search",void 0),t([ce()],_o.prototype,"_filter",void 0),t([ce()],_o.prototype,"_width",void 0),t([ce()],_o.prototype,"_height",void 0),t([ce()],_o.prototype,"lockDomain",void 0),t([ce()],_o.prototype,"showAll",void 0),t([ce()],_o.prototype,"selectedEntity",void 0),_o=t([re("dialog-select-action")],_o);var go=Object.freeze({__proto__:null,get DialogSelectAction(){return _o}});let vo=class extends oe{constructor(){super(...arguments),this.showPrefix=!1}render(){return R`
      ${this.showPrefix?R`
      <div class="prefix-wrap">
        <div class="prefix"><slot name="prefix"></slot></div>
        <div class="body">
          <div class="heading"><slot name="heading"></slot></div>
          <div class="secondary"><slot name="description"></slot></div>
        </div>
      </div>
      `:R`
      <div class="body">
        <div class="heading"><slot name="heading"></slot></div>
        <div class="secondary"><slot name="description"></slot></div>
      </div>
      `}
      <div class="content"><slot></slot></div>
    `}static get styles(){return r`

    :host {
      display: flex;
      padding: 0px;
      align-content: normal;
      align-self: auto;
      align-items: center;
    }
    .body {
      padding-top: 0px;
      padding-bottom: 0px;
      padding-left: 0;
      padding-inline-start: 0;
      padding-right: 16x;
      padding-inline-end: 16px;
      overflow: hidden;
      align-content: center;
    }
    .body > * {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .content {
      display: flex;
      justify-content: flex-end;
      flex: 1;
      padding: 8px 0;
    }
    // .content ::slotted(*) {
    //   width: var(--settings-row-content-width);
    // }
    .prefix-wrap {
      display: flex;
      flex-direction: row;
    }
    .prefix {
      display: flex;
      width: 48px;
    }
    .heading, .heading ::slotted(*) {
      display: flex;
      align-items: center;
      width: 150px;
    }
    @media all and (max-width: 450px) {
      :host {
        align-items: normal;
        flex-direction: column;
        border-top: 1px solid var(--divider-color);
        padding: 8px 16px;
      }
      .prefix-wrap {
        display: flex;
        align-items: center;
      }
      .content ::slotted(*) {
        width: 100%;
      }
    `}};t([le({type:Boolean})],vo.prototype,"showPrefix",void 0),vo=t([re("scheduler-settings-row")],vo);let fo=class extends oe{constructor(){super(...arguments),this.selectedSlot=null,this.large=!1,this.selectedEntry=0}shouldUpdate(e){return e.get("schedule")&&this.dispatchEvent(new CustomEvent("change",{detail:{schedule:this.schedule}})),!0}render(){return R`
    ${this.schedule.entries.map((e,t)=>R`
      
      <div class="editor-header">
        <div class="weekdays">
          <span>
            ${Yi("ui.panel.editor.repeated_days",this.hass)}:
            ${Ts(e.weekdays,"short",this.hass)}
          </span>
          <ha-icon-button .path=${Ks} @click=${e=>this._showWeekdayDialog(e,t)}></ha-icon-button>
        </div>
        <div class="weekdays-actions">
        <ha-button appearance="plain" size="small" @click=${this.toggleViewMode}>
          ${this.viewMode==me.Scheme?Yi("ui.panel.editor.toggle_single_mode",this.hass):Yi("ui.panel.editor.toggle_scheme_mode",this.hass)}
          <ha-icon slot="end" icon="mdi:swap-horizontal"></ha-icon>
        </ha-button>
        </div>
      </div>

      ${this.viewMode==me.Scheme?R`
      <div class="editor-header">
        <div class="weekdays">
          ${this.hass.localize("ui.dialogs.helper_settings.input_datetime.time")}:
        </div>
        ${this.renderActionButtons()}
      </div>
      <scheduler-timeslot-editor
        .hass=${this.hass}
        .config=${this.config}
        .schedule=${e}
        .selectedSlot=${this.selectedSlot}
        @update=${e=>this._handleUpdate(e,t)}
        .large=${this.large}
      >
      </scheduler-timeslot-editor>
      `:R`
          ${this.hass.localize("ui.dialogs.helper_settings.input_datetime.time")}:
          <scheduler-time-picker
            .hass=${this.hass}
            .time=${this.schedule.entries[this.selectedEntry].slots[this.selectedSlot].start}
            @value-changed=${this._startTimeChanged}
            ?useAmPm=${Le(this.hass.locale)}
            .stepSize=${this.config.time_step||15}
            large
          >
          </scheduler-time-picker>
      `}
    `)}

    ${this.renderSlot()}
    `}toggleViewMode(){const e=this.viewMode==me.Scheme?me.Single:me.Scheme;this.dispatchEvent(new CustomEvent("setViewMode",{detail:e}))}renderActionButtons(){if(null===this.selectedSlot||null===this.selectedEntry)return R``;const e=this.schedule.entries[this.selectedEntry].slots[this.selectedSlot].start,t=this.schedule.entries[this.selectedEntry].slots[this.selectedSlot].stop||e,i=Te(e,this.hass),s=(Te(t,this.hass)||86400)-i;return R`
      <div class="actions">
        <ha-icon-button .path=${Fs} @click=${e=>{this._updateSelectedSlot(this.selectedSlot-1),e.target.blur()}} ?disabled=${null===this.selectedSlot||this.selectedSlot<1}>
        </ha-icon-button> 
        <ha-icon-button .path=${"M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"} @click=${e=>{this._updateSelectedSlot(this.selectedSlot+1),e.target.blur()}} ?disabled=${null===this.selectedSlot||this.selectedSlot>this.schedule.entries[this.selectedEntry].slots.length-2}>
        </ha-icon-button> 
        <ha-icon-button .path=${"M19,6H22V8H19V11H17V8H14V6H17V3H19V6M17,17V14H19V19H3V6H11V8H5V17H17Z"} @click=${this._addTimeslot} ?disabled=${s<1800}>
        </ha-icon-button>
        <ha-icon-button .path=${Ys} @click=${this._removeTimeslot} ?disabled=${this.schedule.entries[this.selectedEntry].slots.length<=2}>
        </ha-icon-button> 
      </div>
    `}renderSlot(){if(null===this.selectedEntry||null===this.selectedSlot)return R`
        <div class="slot-placeholder"> 
          ${Yi("ui.panel.editor.select_timeslot",this.hass)}
        </div>
      `;const e=this.schedule.entries[this.selectedEntry].slots[this.selectedSlot],t=this.selectedSlot===this.schedule.entries[this.selectedEntry].slots.length-1;let i=e.stop;return!i&&this.selectedSlot<this.schedule.entries[this.selectedEntry].slots.length-1&&(i=this.schedule.entries[this.selectedEntry].slots[this.selectedSlot+1].start),i||(i=e.start),R`
      ${this.viewMode==me.Scheme?R`
      <div class="two-column">
        <div class="column">
          <scheduler-time-picker
            .hass=${this.hass}
            label="${Yi("ui.panel.editor.start_time",this.hass)}:"
            ?disabled=${0==this.selectedSlot}
            .time=${e.start}
            @value-changed=${this._startTimeChanged}
            ?useAmPm=${Le(this.hass.locale)}
          >
          </scheduler-time-picker>
        </div>
        <div class="column">
          <scheduler-time-picker
            .hass=${this.hass}
            label="${Yi("ui.panel.editor.stop_time",this.hass)}:"
            ?disabled=${t}
            .time=${i}
            @value-changed=${this._stopTimeChanged}
            ?useAmPm=${Le(this.hass.locale)}
          >
          </scheduler-time-picker>
        </div>
      </div>`:""}

      ${Yi("ui.panel.editor.action",this.hass)}:
      ${this._renderActionConfig()}
    `}_renderOnOffToggle(e,t){var i,s;const a=Wa(t)?t:Ua(t),o=Ba(t)?t:Ua(t),n=this.selectedSlot>0?this.schedule.entries[this.selectedEntry].slots[this.selectedSlot-1]:void 0,r=null!==e?null:(null===(i=null==n?void 0:n.actions)||void 0===i?void 0:i.length)&&Wa(n.actions[0])?"off":(null===(s=null==n?void 0:n.actions)||void 0===s?void 0:s.length)&&Ba(n.actions[0])?"on":null,d=t=>{t!==e&&this._updateSlot({actions:["on"===t?a:o]})};return R`
      <div class="onoff-inline">
        <button
          class="onoff-btn on ${"on"===e?"active":""} ${"on"===r?"suggested":""}"
          @click=${()=>d("on")}
        >
          <ha-icon icon="mdi:power-on"></ha-icon>
          ${Yi("services.generic.turn_on",this.hass)}
        </button>
        <button
          class="onoff-btn off ${"off"===e?"active":""} ${"off"===r?"suggested":""}"
          @click=${()=>d("off")}
        >
          <ha-icon icon="mdi:power-off"></ha-icon>
          ${Yi("services.generic.turn_off",this.hass)}
        </button>
      </div>
    `}_findOnOffReference(){for(const e of this.schedule.entries[this.selectedEntry].slots)if(e.actions.length&&null!==Ua(e.actions[0]))return e.actions[0]}_renderActionConfig(){var e,t,i,s;const a=Object.assign({},this.schedule.entries[this.selectedEntry].slots[this.selectedSlot]),o=a.actions.length?a.actions[0]:void 0;if(!o){const e=this._findOnOffReference();return R`
      <div>
        ${e?this._renderOnOffToggle(null,e):""}
        <ha-button appearance="plain"
          @click=${this._showActionDialog}
        >
          <ha-icon slot="start" icon="mdi:plus"></ha-icon>
          ${Yi("ui.panel.editor.add_action",this.hass)}
        </ha-button>
      </div>
    `}const n=ms(o,this.config.customize),r=(null===(e=n.target)||void 0===e?void 0:e.domain)||Qi(o.service),d=Ke(null===(t=null==n?void 0:n.target)||void 0===t?void 0:t.entity_id)||this.schedule.entries[this.selectedEntry].slots.some(e=>{var t,i;return e.actions.length&&Ke(null===(i=null===(t=ms(e.actions[0],this.config.customize))||void 0===t?void 0:t.target)||void 0===i?void 0:i.entity_id)});if(void 0===n)return R``;const l=Object.keys(n.fields||{}).filter(e=>za(o,e,this.hass,this.config.customize));let c="",h=[(null===(i=o.target)||void 0===i?void 0:i.entity_id)||[]].flat();!h.length&&["notify","script"].includes(r)&&(h=[o.service]),h.length&&(c+=h.map(e=>Ms(e,this.hass,this.config.customize)).join(", "),c+=": "),c+=Os(o,this.hass,this.config.customize,!1,!0);const u=null!==Ua(o);return R`
      ${u?this._renderOnOffToggle(Wa(o)?"on":"off",o):""}
      <scheduler-collapsible-section
        ?expanded=${!0}
        ?disabled=${!0}
      >
        <div slot="header" class="header">
          <ha-icon slot="icon" icon="${Fa(o,this.config.customize)}"></ha-icon>
          <span>${os(c)}</span>
        </div>

        <ha-dropdown
          slot="contextMenu" 
          @wa-select=${this._actionItemOptionsClick}
          @wa-after-hide=${e=>{e.target.firstElementChild.blur()}}
          placement="bottom-end"
        >
          <ha-icon-button slot="trigger" .path=${Us}>
          </ha-icon-button>
          <ha-dropdown-item value="change_type">
            <ha-icon icon="mdi:pencil"></ha-icon>
            ${ns("ui.panel.lovelace.editor.card.conditional.change_type",this.hass)}
          </ha-dropdown-item>
          <ha-dropdown-item variant="danger" value="delete">
            <ha-icon icon="mdi:delete"></ha-icon>
            ${ns("ui.common.delete",this.hass)}
          </ha-dropdown-item>
        </ha-dropdown>

        <div slot="content">

          ${n.target?R`
          <scheduler-settings-row>
            <span slot="heading">${ns("ui.components.entity.entity-picker.entity",this.hass)}</span>
            <scheduler-entity-picker
              .hass=${this.hass}
              .config=${this.config}
              .domain=${r}
              .filterFunc=${e=>!n.supported_features||((e.attributes.supported_features||0)&n.supported_features)>0}
              @value-changed=${this._selectEntity}
              .value=${[(null===(s=o.target)||void 0===s?void 0:s.entity_id)||[]].flat()}
              ?multiple=${!0}
              ?disabled=${d}
            >
            </scheduler-entity-picker>
          </scheduler-settings-row>
          `:""}

          ${l.map(e=>{var t;const i=bs(o.service,null===(t=o.target)||void 0===t?void 0:t.entity_id,e,this.hass,this.config.customize);if(null===i)return"";let s=n.fields[e].optional||(i.number||{}).optional;const a=!s||Object.keys(o.service_data).includes(e);return R`
            <scheduler-settings-row ?showPrefix=${s}>
              ${s?R`
                <ha-checkbox
                  slot="prefix"
                  ?checked=${a}
                  @change=${t=>this._toggleOptionalField(t,e,i)}
                >
                </ha-checkbox>
              `:""}
              <span slot="heading">
                ${((e,t,i,s)=>{var a;const o=Qi(e.service),n=Ji(e.service);let r=ns(`component.${o}.services.${n}.fields.${t}.name`,i,!1);!r&&i.services[o]&&i.services[o][e.service]&&i.services[o][e.service].fields&&i.services[o][e.service].fields[t]&&(r=String(i.services[o][e.service].fields[t].name));const d=["script","notify"].includes(o)?[e.service]:[(null===(a=e.target)||void 0===a?void 0:a.entity_id)||[]].flat(),l=d.length?d[0]:e.service;let c=ps(s||{},l);if(c.length){let i=c.map(i=>{if(i.service!=e.service||!Object.keys(i.variables||{}).includes(t))return null;return(i.variables||{})[t].name}).filter(Ke);if(i.length)return i[0]}return r||(r=t.replace(/_/g," ")),r})(o,e,this.hass,this.config.customize)}
              </span>
              <scheduler-combo-selector
                .hass=${this.hass}
                .config=${i}
                ?disabled=${!a}
                .value=${Object.keys(o.service_data).includes(e)?o.service_data[e]:void 0}
                @value-changed=${t=>this._selectField(e,t)}
              >
              </scheduler-combo-selector>
            </scheduler-settings-row>
          `})}
        </div>
      </scheduler-collapsible-section>
    `}_selectField(e,t){const i=t.detail.value,s=Object.assign({},this.schedule.entries[this.selectedEntry].slots[this.selectedSlot]);let a=void 0!==i?Object.assign(Object.assign({},s.actions[0]),{service_data:Object.assign(Object.assign({},s.actions[0].service_data),{[e]:i})}):Object.assign(Object.assign({},s.actions[0]),{service_data:Object.fromEntries(Object.entries(s.actions[0].service_data).filter(([t])=>t!=e))});this._updateSlot({actions:[a]})}_toggleOptionalField(e,t,i){const s=e.target.checked,a=s?Ra(i):void 0;s?this._selectField(t,new CustomEvent("value-changed",{detail:{value:Ke(a)?a:null}})):this._selectField(t,new CustomEvent("value-changed",{detail:{value:void 0}}))}_selectEntity(e){const t=e.detail.value;t&&this.schedule.entries[this.selectedEntry].slots.forEach((e,i)=>{if(!e.actions.length)return;let s=Object.assign(Object.assign({},e.actions[0]),{target:{entity_id:t}});this._updateSlot({actions:[s]},i)})}_handleUpdate(e,t){this.selectedEntry=t,e.detail.hasOwnProperty("selectedSlot")?(this._updateSelectedSlot(e.detail.selectedSlot),this.selectedSlot=e.detail.selectedSlot):e.detail.hasOwnProperty("slots")&&this._updateEntry({slots:e.detail.slots})}_updateSelectedSlot(e){this.dispatchEvent(new CustomEvent("change",{detail:{selectedSlot:e}}))}_updateEntry(e){let t=Object.assign({},this.schedule.entries[this.selectedEntry]);t=Object.assign(Object.assign({},t),e),this.schedule=Object.assign(Object.assign({},this.schedule),{entries:Object.assign(this.schedule.entries,{[this.selectedEntry]:t})})}_updateSlot(e,t=this.selectedSlot){let i=Object.assign({},this.schedule.entries[this.selectedEntry].slots[t]);i=Object.assign(Object.assign({},i),e),this._updateEntry({slots:Object.assign(this.schedule.entries[this.selectedEntry].slots,{[t]:i})})}async _showWeekdayDialog(e,t){this.selectedEntry=t,await new Promise(i=>{const s={weekdays:[...this.schedule.entries[t].weekdays],cancel:()=>i(null),confirm:e=>i(e)};Rs(e.target,"show-dialog",{dialogTag:"dialog-select-weekdays",dialogImport:()=>Promise.resolve().then((function(){return ho})),dialogParams:s})}).then(e=>{e&&this._updateEntry({weekdays:e})})}async _showActionDialog(e){let t=[],i=[];this.schedule.entries.forEach(e=>{e.slots.forEach(e=>{e.actions.forEach(e=>{var s,a;i=[...i,...[(null===(s=e.target)||void 0===s?void 0:s.entity_id)||[]].flat()],t=[...t,...[Qi(e.service),...[(null===(a=e.target)||void 0===a?void 0:a.entity_id)||[]].flat()].map(Qi)]})})}),t=[...new Set(t)],i=[...new Set(i)],await new Promise(s=>{const a={cancel:()=>s(null),confirm:e=>s(e),domainFilter:t.length?t:void 0,entityFilter:i.length?i:void 0,cardConfig:this.config};Rs(e.target,"show-dialog",{dialogTag:"dialog-select-action",dialogImport:()=>Promise.resolve().then((function(){return go})),dialogParams:a})}).then(e=>{if(!e)return;Object.assign({},this.schedule.entries[this.selectedEntry].slots[this.selectedSlot]);const t=this.schedule.entries[this.selectedEntry].slots.find(e=>{var t;return e.actions.length?null===(t=e.actions[0].target)||void 0===t?void 0:t.entity_id:void 0});let i=Object.assign({},e);t&&i.target&&(i=Object.assign(Object.assign({},i),{target:t.actions[0].target})),this._updateSlot({actions:[i]})})}_actionItemOptionsClick(e){switch(e.detail.item.value){case"change_type":this._showActionDialog(e);break;case"delete":this._updateSlot({actions:[]})}}_stopTimeChanged(e){let t=e.detail.value,[i,s]=Ga([...this.schedule.entries[this.selectedEntry].slots],Number(this.selectedSlot),{stop:t},this.hass);this._updateEntry({slots:i}),s!=this.selectedSlot&&this._updateSelectedSlot(s)}_startTimeChanged(e){let t=e.detail.value,[i,s]=Ga([...this.schedule.entries[this.selectedEntry].slots],Number(this.selectedSlot),{start:t},this.hass);this._updateEntry({slots:i}),s!=this.selectedSlot&&this._updateSelectedSlot(s)}_addTimeslot(e){null!==this.selectedEntry&&null!==this.selectedSlot&&(this.schedule=((e,t,i,s)=>{let a=[...e.entries[t].slots],o=De(a[i].start),n=void 0===a[i].stop?o:De(a[i].stop);if(n.mode!==we.Fixed||n.hours||n.minutes||(n=Object.assign(Object.assign({},n),{hours:24})),[we.Sunrise,we.Sunset].includes(o.mode)){const e=o.mode==we.Sunrise?s.states["sun.sun"].attributes.next_rising:s.states["sun.sun"].attributes.next_setting;let t=De(e);o=Ce(t,{hours:o.hours,minutes:o.minutes})}const r=Te(o,s),d=(Te(n,s)-r)/2,l=Math.floor(d/3600),c=Math.round((d-3600*l)/60);let h=Ce(o,{hours:l,minutes:c});return h=Ee(h,15),a=[...a.slice(0,i),Object.assign(Object.assign({},a[i]),{stop:He(h)}),Object.assign(Object.assign({},a[i]),{start:He(h),stop:He(n),actions:[]}),...a.slice(i+1)],e=Object.assign(Object.assign({},e),{entries:Object.assign(e.entries,{[t]:Object.assign(Object.assign({},e.entries[t]),{slots:a})})})})(this.schedule,this.selectedEntry,this.selectedSlot,this.hass),e.target.blur())}_removeTimeslot(e){null!==this.selectedEntry&&null!==this.selectedSlot&&(this.schedule=((e,t,i)=>{let s=[...e.entries[t].slots];const a=i==s.length-1?i-1:i;return s=[...s.slice(0,a),Object.assign(Object.assign({},s[a+1]),{start:s[a].start,stop:s[a+1].stop}),...s.slice(a+2)],s=Va(s),e=Object.assign(Object.assign({},e),{entries:Object.assign(e.entries,{[t]:Object.assign(Object.assign({},e.entries[t]),{slots:s})})})})(this.schedule,this.selectedEntry,this.selectedSlot),this.selectedSlot>=this.schedule.entries[this.selectedEntry].slots.length&&(this.selectedSlot=this.schedule.entries[this.selectedEntry].slots.length-1),e.target.blur())}static get styles(){return r`
  :host {
    position: relative;
  }
  .two-column {
    display: flex;
    flex-direction: row;
    margin: 16px 0px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .two-column .column {
    display: flex;
    flex-direction: column;
    flex: 0 0 215px;
  }
  div.editor-header {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .weekdays {
    display: flex;
    flex: 1;
    align-items: center;
    white-space: nowrap;
  }
  .weekdays-actions {
    display: flex;
    align-items: center;
  }
  div.actions {
    display: flex;
    align-items: end;
    margin: -4px 0px 0px 0px;
  }
  @media all and (max-width: 150px) {
    div.editor-header {
      flex-direction: column;
      margin-top: 0px;
    }
    div.actions {
      align-self: flex-end;
    }
  }
  div.onoff-inline {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin: 8px 0px 12px 0px;
  }
  .onoff-btn {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 20px;
    font-size: 0.9rem;
    font-weight: 500;
    font-family: inherit;
    color: var(--primary-text-color);
    background: none;
    border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.4));
    border-radius: 8px;
    cursor: pointer;
  }
  .onoff-btn.on.active {
    background: rgba(var(--rgb-state-active-color, 67, 160, 71), 0.85);
    border-color: rgb(var(--rgb-state-active-color, 67, 160, 71));
    color: var(--text-primary-color);
  }
  .onoff-btn.off.active {
    background: rgba(211, 47, 47, 0.85);
    border-color: rgb(211, 47, 47);
    color: var(--text-primary-color);
  }
  .onoff-btn.on.suggested {
    border: 2px dashed rgb(var(--rgb-state-active-color, 67, 160, 71));
  }
  .onoff-btn.off.suggested {
    border: 2px dashed rgb(211, 47, 47);
  }
  div.slot-placeholder {
    padding: 20px 0px 0px 0px;
  }
  scheduler-collapsible-section .header ha-icon {
    margin-right: 6px;
  }
  scheduler-collapsible-section .header span {
    flex: 1;
  }
  ha-list-item.warning, ha-list-item.warning ha-icon {
    color: var(--error-color);
  }
    `}};t([le({attribute:!1})],fo.prototype,"hass",void 0),t([le({attribute:!1})],fo.prototype,"config",void 0),t([le({attribute:!1})],fo.prototype,"viewMode",void 0),t([le({attribute:!1})],fo.prototype,"selectedSlot",void 0),t([le({type:Boolean})],fo.prototype,"large",void 0),t([ce()],fo.prototype,"schedule",void 0),t([ce()],fo.prototype,"selectedEntry",void 0),fo=t([re("scheduler-main-panel")],fo);const bo=["January","February","March","April","May","June","July","August","September","October","November","December"];function yo(e){return e.toISOString().split("T")[0]}function wo(e){let t=new Date;const i=(e||"").match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})/);null!==i&&t.setFullYear(Number(i[1]),Number(i[2])-1,Number(i[3]));const s=(e||"").match(/([0-9]{2}):([0-9]{2})(:([0-9]{2}))?$/);return null!==s&&t.setHours(Number(s[1]),Number(s[2]),s.length>4?Number(s[4]):t.getSeconds()),t}const ko=(e,t)=>"select"in t&&null!==t.select?((e,t)=>{var i;return((null===(i=t.select)||void 0===i?void 0:i.options)||[]).some(t=>"object"==typeof t?t.value==e:t==e)})(String(e),t):"number"in t&&null!==t.number?((e,t)=>{var i,s;return!isNaN(e)&&(!(void 0!==(null===(i=t.number)||void 0===i?void 0:i.min)&&e<t.number.min)&&!(void 0!==(null===(s=t.number)||void 0===s?void 0:s.max)&&e>t.number.max))})(Number(e),t):!("text"in t)||null===t.text||String(e).length>0,xo=e=>null==e||Array.isArray(e)?e:[e];let $o=class extends oe{constructor(){super(...arguments),this._search="",this._filter="",this.timer=0,this.showAll=!1}async showDialog(e){this._params=e,this.showAll=!1,await this.updateComplete}async closeDialog(){this._params&&this._params.cancel(),this._params=void 0,this._clearSearch(),this._height=void 0,this._width=void 0}async willUpdate(){this.hass.loadBackendTranslation("title")}render(){return this._params?R`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        @wa-after-show=${this._opened}
      >
        <div slot="header">
          <ha-dialog-header>
            <ha-icon-button
              slot="navigationIcon"
              data-dialog="close"
              .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
              .path=${Bs}
            ></ha-icon-button>
            <div slot="title">
              ${Yi("ui.panel.options.conditions.add_condition",this.hass)}
            </div>
            ${Ke(this._params.domain)?"":R`
            <ha-dropdown
              placement="bottom-end"
              slot="actionItems"
              @wa-after-hide=${e=>{e.target.firstElementChild.blur()}}
            >
              <ha-icon-button slot="trigger" .label=${this.hass.localize("ui.common.menu")} .path=${Us}>
              </ha-icon-button>
              <ha-dropdown-item @click=${this._toggleShowAll}>
                <ha-icon
                  icon="mdi:check"
                  style="${this.showAll?"":"visibility: hidden"}"
                ></ha-icon>
                ${Yi("ui.dialog.action_picker.show_all",this.hass)}
              </ha-dropdown-item>
            </ha-dropdown>`}
          </ha-dialog-header>

          <ha-input
            dialogInitialFocus
            .placeholder=${ns("ui.common.search",this.hass)}
            aria-label=${ns("ui.common.search",this.hass)}
            @input=${this._handleSearchChange}
            .value=${this._search}
            icon
            .iconTrailing=${this._search}
          >
            <div class="trailing" slot="trailingIcon">
              ${this._search&&R`
                <ha-icon-button
                  @click=${this._clearSearch}
                  .label=${ns("ui.common.clear",this.hass)}
                  .path=${Bs}
                  class="clear-button"
                ></ha-icon-button>
              `}
              <slot name="suffix"></slot>
            </div>
          </ha-input>
        </div>

        <ha-list
          style=${na({minWidth:this._width+"px",height:this._height?Math.min(468,this._height)+"px":"auto"})}
        >
          ${this._renderOptions()}
        </ha-list>
      </ha-dialog>
    `:R``}_opened(){var e;const t=null===(e=this.shadowRoot.querySelector("ha-list"))||void 0===e?void 0:e.getBoundingClientRect();this._width=null==t?void 0:t.width,this._height=null==t?void 0:t.height}_handleSearchChange(e){const t=e.currentTarget.value;this._search=t,clearTimeout(this.timer),this.timer=window.setTimeout(()=>{this._filter=this._search},100)}_clearSearch(){this._search="",this._filter=""}_renderOptions(){var e;let t=Object.assign({},null===(e=this._params)||void 0===e?void 0:e.cardConfig);this.showAll&&(t=Object.assign(Object.assign({},t),{include:void 0,exclude:void 0}));let i=ua(this.hass,t);return i.sort((e,t)=>as(e.name,t.name)),this._filter&&(i=i.filter(e=>{const t=this._filter.toLowerCase().trim().split(" ");return t.every(t=>e.name.toLowerCase().includes(t))||t.every(t=>e.key.toLowerCase().includes(t))})),Object.keys(i).map(e=>R`
        <ha-list-item
          graphic="icon"
          @click=${()=>this._handleDomainClick(i[e].key)}
        >
          <ha-icon slot="graphic" icon="${i[e].icon}"></ha-icon>
          <span>${i[e].name}</span>
        </ha-list-item>
    `)}_handleDomainClick(e){this._params=Object.assign(Object.assign({},this._params),{domain:e}),this._params.confirm(e),this._params=void 0,this._clearSearch()}_toggleShowAll(){this.showAll?this.showAll=!1:this.showAll=!0}static get styles(){return r`
      ha-dialog {
        --dialog-content-padding: 0;
        --ha-dialog-width-md: 480px;
      }
      ha-input {
        display: block;
        margin: 0 16px;
      }
      ha-list {
        min-height: 300px;
      }
      ha-list-item:not([twoline]) {
        height: 56px;
      }
    `}};t([le({attribute:!1})],$o.prototype,"hass",void 0),t([ce()],$o.prototype,"_params",void 0),t([ce()],$o.prototype,"_search",void 0),t([ce()],$o.prototype,"_filter",void 0),t([ce()],$o.prototype,"_width",void 0),t([ce()],$o.prototype,"_height",void 0),t([ce()],$o.prototype,"showAll",void 0),$o=t([re("dialog-select-condition")],$o);var So=Object.freeze({__proto__:null,get DialogSelectCondition(){return $o}});let jo=class extends oe{constructor(){super(...arguments),this.conditionIdx=-1,this.conditionValid=!0,this.startDate="",this.endDate="",this.tags=[],this.customTagValue=""}async firstUpdated(){var e,t;(await window.loadCardHelpers()).importMoreInfoControl("input_datetime"),this.startDate=(null===(e=this.schedule)||void 0===e?void 0:e.start_date)||yo(new Date),this.endDate=(null===(t=this.schedule)||void 0===t?void 0:t.end_date)||yo(new Date);const i=(await qs(this.hass)).map(e=>e.name),s=[this.config.tags||[]].flat();this.tags=[...new Set([...i,...s.filter(e=>!i.includes(e)&&!["none","disabled","enabled"].includes(e))])]}shouldUpdate(e){return e.get("schedule")&&this.dispatchEvent(new CustomEvent("change",{detail:{schedule:this.schedule}})),!0}render(){const e={select:{options:this.tags,multiple:!0,custom_value:!0}};return R`
      <div class="header first">
        <span>${Yi("ui.panel.options.conditions.header",this.hass)}:</span>
        ${this.schedule.entries[0].slots[0].conditions.items.length?R`
        <ha-dropdown
          @wa-select=${this._conditionConfigOptionsClick}
          @wa-after-hide=${e=>{e.target.firstElementChild.blur()}}
          placement="bottom-end"
        >
          <ha-icon-button
            slot="trigger"
            .path=${"M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"}
          >
          </ha-icon-button>
          <ha-dropdown-item
            ?disabled=${this.schedule.entries[0].slots[0].conditions.items.length<2}
            value="or"
          >
            <ha-icon
              icon="mdi:check"
              style="${this.schedule.entries[0].slots[0].conditions.type==ge.Or?"":"visibility: hidden"}"
            ></ha-icon>
            ${Yi("ui.panel.options.conditions.options.logic_or",this.hass)}
          </ha-dropdown-item>
          <ha-dropdown-item
            ?disabled=${this.schedule.entries[0].slots[0].conditions.items.length<2}
            value="and"
          >
            <ha-icon
              icon="mdi:check"
              style="${this.schedule.entries[0].slots[0].conditions.type==ge.And?"":"visibility: hidden"}"
            ></ha-icon>
            ${Yi("ui.panel.options.conditions.options.logic_and",this.hass)}
          </ha-dropdown-item>
          <ha-dropdown-item value="track_changes">
            <ha-icon 
              icon="mdi:check" 
              style="${this.schedule.entries[0].slots[0].conditions.track_changes?"":"visibility: hidden"}"
            ></ha-icon>
            ${Yi("ui.panel.options.conditions.options.track_changes",this.hass)}
          </ha-dropdown-item>
        </ha-dropdown>
        `:""}
        </div>
        <scheduler-collapsible-group
          ?disabled=${!this.conditionValid}
          @openclose-changed=${this._updateActiveCondition}
          .openedItem=${this.conditionIdx}
        >
        ${this.renderConditions()}
        </scheduler-collapsible-group>

      <div>
        <ha-button appearance="plain"
          @click=${this._conditionAddClick}
        >
          <ha-icon slot="start" icon="mdi:plus"></ha-icon>
          ${Yi("ui.panel.options.conditions.add_condition",this.hass)}
        </ha-button>
      </div>


      <span class="header">${Yi("ui.panel.options.period.header",this.hass)}:</span>
      <div class="period">
        <div>
          <ha-checkbox
            ?checked=${"string"==typeof this.schedule.start_date}
            @change=${this.toggleEnableDateRange}
          >
          </ha-checkbox>
        </div>
        <div>
          <span>${Yi("ui.panel.options.period.start_date",this.hass)}</span>
        </div>
        <div class="input">
          <ha-date-input
            .locale=${this.hass.locale}
            value=${this.startDate}
            .label=${ns("ui.components.date-range-picker.start_date",this.hass)}
            @value-changed=${this._setStartDate}
            ?disabled=${!this.schedule.start_date}
          >
          </ha-date-input>
        </div>
        <div>
          <span>${Yi("ui.panel.options.period.end_date",this.hass)}</span>
        </div>
        <div class="input">
          <ha-date-input
            .locale=${this.hass.locale}
            value=${this.endDate}
            .label=${ns("ui.components.date-range-picker.end_date",this.hass)}
            @value-changed=${this._setEndDate}
            ?disabled=${!this.schedule.end_date}
          >
          </ha-date-input>
        </div>
      </div>

      <span class="header">${ns("ui.common.name",this.hass)}:</span>
      <div class="period">
        <ha-input
          value=${this.schedule.name||""}
          placeholder=${this.schedule.name?"":ns("ui.common.name",this.hass)}
          @input=${this.updateName}
        ></ha-input>
      </div>

      <span class="header">${Yi("ui.panel.options.tags",this.hass)}:</span>
      <div>
        <scheduler-combo-selector
          .hass=${this.hass}
          .config=${e}
          .value=${this.schedule.tags||[]}
          @value-changed=${this.tagsUpdated}
        >
        </scheduler-combo-selector>

        <ha-dropdown
          @wa-after-hide=${e=>{e.stopPropagation(),e.target.querySelector("ha-button").blur()}}
          @click=${e=>{e.preventDefault(),e.stopImmediatePropagation()}}
          @wa-after-show=${e=>{e.target.querySelector("ha-input").focus()}}
          placement="bottom-start"
        >
          <ha-button appearance="plain" slot="trigger">
            <ha-icon slot="start" icon="mdi:plus"></ha-icon>
            ${ns("ui.panel.config.tag.add_tag",this.hass)}
          </ha-button>

          <div style="display: flex; align-items: center; padding: 0px 2px 0px 8px">
            <ha-input
              .value=${this.customTagValue}
              .label=${ns("ui.panel.config.tag.add_tag",this.hass)}
              @input=${e=>{this.customTagValue=e.currentTarget.value}}
              @keydown=${e=>{"Enter"===e.key&&this._customTagConfirmClick(e)}}
              .placeholder=""
            ></ha-input> 
            <ha-button
              appearance="plain"
              @click=${this._customTagConfirmClick}
            >
              ${ns("ui.common.ok",this.hass)}
            </ha-button>
          </div>
        </ha-dropdown>
      </div>

      <span class="header">${Yi("ui.panel.options.repeat_type",this.hass)}:</span>
      <ha-button
        appearance="${this.schedule.repeat_type==ye.Repeat?"filled":"plain"}"
        variant="${this.schedule.repeat_type==ye.Repeat?"brand":"neutral"}"
        @click=${this.setRepeatType}
        value="${ye.Repeat}"
      >
        <ha-icon slot="start" icon="mdi:refresh"></ha-icon>
        ${ns("ui.components.calendar.event.repeat.label",this.hass)}
      </ha-button>
      <ha-button
        appearance="${this.schedule.repeat_type==ye.Pause?"filled":"plain"}"
        variant="${this.schedule.repeat_type==ye.Pause?"brand":"neutral"}"
        @click=${this.setRepeatType}
        value="${ye.Pause}"
      >
        <ha-icon slot="start" icon="mdi:stop"></ha-icon>
        ${ns("ui.dialogs.more_info_control.vacuum.stop",this.hass)}
      </ha-button>
      <ha-button
        appearance="${this.schedule.repeat_type==ye.Single?"filled":"plain"}"
        variant="${this.schedule.repeat_type==ye.Single?"brand":"neutral"}"
        @click=${this.setRepeatType}
        value="${ye.Single}"
      >
        <ha-icon slot="start" icon="mdi:trash-can-outline"></ha-icon>
        ${ns("ui.common.delete",this.hass)}
      </ha-button>
    `}renderConditions(){let e=this.schedule.entries[0].slots[0].conditions.items;return this.conditionIdx==e.length&&(e=[...e,{}]),e.map((e,t)=>{var i;const s=this.conditionIdx==t?this.selectedEntity||e.entity_id||"":e.entity_id||"",a=this.conditionIdx==t&&this.selectedDomain||Qi(s),o=ha(s||a,this.hass,this.config.customize),n=o&&o.hasOwnProperty("number")?[ve.Above,ve.Below]:[ve.Equal,ve.Unequal],r={[ve.Equal]:"mdi:equal",[ve.Unequal]:"mdi:not-equal-variant",[ve.Above]:"mdi:greater-than",[ve.Below]:"mdi:less-than"},d={[ve.Equal]:"ui.panel.options.conditions.types.equal_to",[ve.Unequal]:"ui.panel.options.conditions.types.unequal_to",[ve.Above]:"ui.panel.options.conditions.types.above",[ve.Below]:"ui.panel.options.conditions.types.below"};return this.conditionIdx!==t||this.selectedMatchType||(this.selectedMatchType=n[0]),R`
      <scheduler-collapsible-section idx="${t}">
        <div slot="header">
          ${e.entity_id&&void 0!==e.value?R`
          <ha-icon slot="icon" icon="${pa(e.entity_id,this.config.customize,this.hass)}"></ha-icon>
          ${os(Yi(d[e.match_type],this.hass,["{entity}","{value}"],[Ms(e.entity_id,this.hass,this.config.customize)||"",null!==(i=gs(e.value,o,this.hass))&&void 0!==i?i:""]))}
          `:Yi("ui.panel.options.conditions.add_condition",this.hass)}
        </div>
        <ha-dropdown
          slot="contextMenu"
          @wa-select=${e=>this._conditionItemOptionsClick(e,t)}
          ?disabled=${!this.conditionValid&&this.conditionIdx!==t&&-1!=this.conditionIdx}
          placement="bottom-end"
        >
          <ha-icon-button
            slot="trigger"
            .path=${Us}
            ?disabled=${!this.conditionValid&&this.conditionIdx!==t&&-1!=this.conditionIdx}
          >
          </ha-icon-button>
          <ha-dropdown-item value="change_type">
            <ha-icon icon="mdi:pencil"></ha-icon>
            ${ns("ui.panel.lovelace.editor.card.conditional.change_type",this.hass)}
          </ha-dropdown-item>
          <ha-dropdown-item variant="danger" value="delete">
            <ha-icon icon="mdi:delete"></ha-icon>
            ${ns("ui.common.delete",this.hass)}
          </ha-dropdown-item>
        </ha-dropdown>

        <div slot="content">

        <scheduler-settings-row>
          <span slot="heading">
            ${ns("ui.components.selectors.selector.types.entity",this.hass)}
          </span>
          <scheduler-entity-picker
            .hass=${this.hass}
            .config=${this.config}
            .domain=${a}
            @value-changed=${this._selectEntity}
            .value=${this.conditionIdx==t?xo(this.selectedEntity):xo(e.entity_id)}
            ?multiple=${!1}
          >
          </scheduler-entity-picker>
        </scheduler-settings-row>

        <scheduler-settings-row>
          <span slot="heading">
            ${os(Yi(d[this.conditionIdx==t?this.selectedMatchType:e.match_type],this.hass,["{entity}","{value}"],["",""]))}
            <ha-dropdown
              @wa-select=${this._selectMatchType}
              @wa-after-hide=${e=>{e.target.firstElementChild.blur()}}
            >
              <ha-icon-button slot="trigger" .path=${Ks}>
              </ha-icon-button>
              ${n.map(i=>R`
                <ha-dropdown-item 
                  ?noninteractive=${this.conditionIdx==t?this.selectedMatchType==i:e.match_type==i}
                  value="${i}"
                >
                  <ha-icon icon="${r[i]}"></ha-icon>
                  ${os(Yi(d[i],this.hass,["{entity}","{value}"],["",""]))}
                </ha-dropdown-item>
              `)}
            </ha-dropdown>
          </span>
          <scheduler-combo-selector
            .hass=${this.hass}
            .config=${o}
            .value=${this.conditionIdx==t?this.conditionValue:e.value}
            @value-changed=${this._conditionValueChanged}
          >
          </scheduler-combo-selector>
        </scheduler-settings-row>
        </div>
      </scheduler-collapsible-section>
    `})}_updateActiveCondition(e){const t=e.detail.item;if(t<0)return void(this.conditionIdx=-1);if(t===this.conditionIdx)return;this.conditionIdx=t;const i=this.schedule.entries[0].slots[0].conditions.items[t];this.selectedEntity=i?i.entity_id:void 0,this.selectedMatchType=i?i.match_type:void 0,this.conditionValue=i?i.value:void 0}_conditionItemOptionsClick(e,t){switch(e.detail.item.value){case"change_type":this._showConditionDialog(e).then(e=>{e&&(this.conditionIdx=t,this.selectedDomain=e,this.selectedEntity=void 0,this.selectedMatchType=void 0,this.conditionValue=void 0,this.conditionValid=!1)});break;case"delete":const i=this.schedule.entries[0].slots[0].conditions.items.filter((e,i)=>i!==t),s=e=>Object.assign(e,{conditions:Object.assign(Object.assign({},e.conditions),{items:i})}),a=e=>Object.assign(e,{slots:e.slots.map(s)});this.schedule=Object.assign(Object.assign({},this.schedule),{entries:this.schedule.entries.map(a)}),t===this.conditionIdx?this.conditionIdx=-1:void 0!==this.conditionIdx&&t<this.conditionIdx&&(this.conditionIdx=this.conditionIdx-1),this.conditionValid=!0}}_selectMatchType(e){const t=e.detail.item.value;this.selectedMatchType=t,this._validateCondition()}_conditionValueChanged(e){this.conditionValue=e.detail.value,this._validateCondition()}async _showConditionDialog(e){return new Promise(t=>{const i={cancel:()=>t(null),confirm:e=>t(e),domain:void 0,cardConfig:this.config};Rs(e.target,"show-dialog",{dialogTag:"dialog-select-condition",dialogImport:()=>Promise.resolve().then((function(){return So})),dialogParams:i})})}_selectEntity(e){const t=e.detail.value;if(this.selectedEntity=t?t.pop():void 0,this.selectedEntity){const e=ha(this.selectedEntity,this.hass,this.config.customize),t=e&&e.hasOwnProperty("number")?[ve.Above,ve.Below]:[ve.Equal,ve.Unequal];this.selectedMatchType&&t.includes(this.selectedMatchType)||(this.selectedMatchType=t[0])}this._validateCondition()}_validateCondition(){if(this.conditionValid=!1,!this.selectedEntity||!Ke(this.conditionValue)||!this.selectedMatchType||void 0===this.conditionIdx)return;const e=ha(this.selectedEntity,this.hass,this.config.customize);if(!ko(this.conditionValue,e))return;this.conditionValid=!0;const t={entity_id:this.selectedEntity,match_type:this.selectedMatchType,value:this.conditionValue,attribute:"state"},i=Object.assign(this.schedule.entries[0].slots[0].conditions.items,{[this.conditionIdx]:t}),s=e=>Object.assign(e,{conditions:Object.assign(Object.assign({},e.conditions),{items:i})});this.schedule=Object.assign(Object.assign({},this.schedule),{entries:this.schedule.entries.map(e=>Object.assign(e,{slots:e.slots.map(s)}))})}_conditionAddClick(e){this._showConditionDialog(e).then(e=>{e&&(this.conditionIdx=this.schedule.entries[0].slots[0].conditions.items.length,this.selectedDomain=e,this.selectedEntity=void 0,this.selectedMatchType=void 0,this.conditionValue=void 0,this.conditionValid=!1)})}_conditionConfigOptionsClick(e){let t=Object.assign({},this.schedule.entries[0].slots[0].conditions);switch(e.detail.item.value){case"or":if(t.type==ge.Or)return;t=Object.assign(Object.assign({},t),{type:ge.Or});break;case"and":if(t.type==ge.And)return;t=Object.assign(Object.assign({},t),{type:ge.And});break;case"track_changes":const e=!this.schedule.entries[0].slots[0].conditions.track_changes;t=Object.assign(Object.assign({},t),{track_changes:e})}const i=e=>Object.assign(e,{conditions:t});this.schedule=Object.assign(Object.assign({},this.schedule),{entries:this.schedule.entries.map(e=>Object.assign(e,{slots:e.slots.map(i)}))})}_setStartDate(e){const t=String(e.detail.value);if(!t)return;wo(t)>wo(this.endDate)&&(this.schedule=Object.assign(Object.assign({},this.schedule),{end_date:t}),this.endDate=t),this.schedule=Object.assign(Object.assign({},this.schedule),{start_date:t}),this.startDate=t}_setEndDate(e){const t=String(e.detail.value);if(!t)return;wo(this.startDate)>wo(t)&&(this.schedule=Object.assign(Object.assign({},this.schedule),{start_date:t}),this.startDate=t),this.schedule=Object.assign(Object.assign({},this.schedule),{end_date:t}),this.endDate=t}toggleEnableDateRange(e){const t=e.target.checked;this.schedule=Object.assign(Object.assign({},this.schedule),{start_date:t?this.startDate:void 0,end_date:t?this.endDate:void 0,repeat_type:t?this.schedule.repeat_type==ye.Repeat?ye.Pause:this.schedule.repeat_type:this.schedule.repeat_type==ye.Pause?ye.Repeat:this.schedule.repeat_type})}updateName(e){const t=e.target.value;this.schedule=Object.assign(Object.assign({},this.schedule),{name:t.trim()})}tagsUpdated(e){let t=e.detail.value;t=t.map(e=>e.trim()),t=t.filter(e=>!["none","disabled","enabled"].includes(e)),this.schedule=Object.assign(Object.assign({},this.schedule),{tags:t})}_customTagConfirmClick(e){let t=e.target;t=t.parentElement,t=t.parentElement;t.querySelector("ha-button").click(),e.preventDefault();let i=String(this.customTagValue).trim();if(i.length){let e=this.schedule.tags||[];e=[...new Set([...e,i])],e=e.filter(e=>!["none","disabled","enabled"].includes(e)),this.schedule=Object.assign(Object.assign({},this.schedule),{tags:e})}this.customTagValue=""}setRepeatType(e){const t=e.target.getAttribute("value");this.schedule=Object.assign(Object.assign({},this.schedule),{repeat_type:t})}static get styles(){return r`
      ha-icon-button {
        align-self: center;
      }
      ha-dropdown-item[disabled] ha-icon {
        color: var(--disabled-text-color);
      }
      ha-dropdown-item[noninteractive] {
        background-color: rgba(var(--rgb-primary-color), 0.12);
        color: var(--sidebar-selected-text-color);
      }
      ha-dropdown-item[noninteractive] ha-icon {
        color: var(--sidebar-selected-text-color);
      }
      div.period {
        display: flex;
        width: 100%;
        flex-direction: row;
        align-items: center;
        gap: 5px;
      }
      div.period > div {
        display: flex;
      }
      div.period > div.input {
        position: relative;
        overflow: hidden;
        flex: 1;
      }
      ha-date-input, ha-input {
        width: 100%;
      }
      .header {
        display: flex;
        margin-top: 5px;
        width: 100%;
        align-items: center;
      }
      .header.first {
        margin-top: 0px;
        padding-bottom: 4px;
        align-items: flex-end;
        justify-content: space-between;
      }
      .header > * {
        display: flex;
      }
      .header ha-dropdown {
        margin-bottom: -10px;
      }
    `}};t([le({attribute:!1})],jo.prototype,"hass",void 0),t([le({attribute:!1})],jo.prototype,"config",void 0),t([ce()],jo.prototype,"schedule",void 0),t([ce()],jo.prototype,"conditionIdx",void 0),t([ce()],jo.prototype,"selectedDomain",void 0),t([ce()],jo.prototype,"selectedEntity",void 0),t([ce()],jo.prototype,"selectedMatchType",void 0),t([ce()],jo.prototype,"conditionValue",void 0),t([ce()],jo.prototype,"conditionValid",void 0),t([ce()],jo.prototype,"startDate",void 0),t([ce()],jo.prototype,"endDate",void 0),t([le()],jo.prototype,"tags",void 0),t([ce()],jo.prototype,"customTagValue",void 0),jo=t([re("scheduler-options-panel")],jo);let Oo=class extends oe{async showDialog(e){this._params=e,await this.updateComplete}async closeDialog(){this._params&&this._params.cancel(),this._params=void 0}render(){return this._params?R`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        width="small"
      >
        <ha-dialog-header slot="header">
          <ha-icon-button
            slot="navigationIcon"
            data-dialog="close"
            .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
            .path=${Bs}
          ></ha-icon-button>
          <div slot="title">
            ${this._params.title}
          </div>
        </ha-dialog-header>
        <div class="wrapper">
          ${this._params.description}
        </div>

        <ha-dialog-footer slot="footer">
          ${this._params.secondaryButtonLabel?R`
            <ha-button
              appearance="plain"
              slot="secondaryAction"
              @click=${this.cancelClick}
              data-dialog="close"
            >
              ${this._params.secondaryButtonLabel}
            </ha-button>
              `:""}
          <ha-button
            appearance="accent"
            slot="primaryAction"
            @click=${this.confirmClick}
            data-dialog="close"
          >
            ${this._params.primaryButtonLabel}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `:R``}confirmClick(){this._params.confirm()}cancelClick(){this._params.cancel()}};t([le({attribute:!1})],Oo.prototype,"hass",void 0),t([ce()],Oo.prototype,"_params",void 0),Oo=t([re("scheduler-generic-dialog")],Oo);var zo=Object.freeze({__proto__:null,get GenericDialog(){return Oo}});let Co=class extends oe{constructor(){super(...arguments),this.large=!1,this.selectedEntry=0,this.selectedSlot=null,this._panel="main",this._viewMode=me.Single}set viewMode(e){if(this._viewMode=e,e==me.Single){let e=this.schedule.entries[this.selectedEntry].slots.findIndex(e=>e.actions.length);this.selectedSlot=e>=0?e:1}}shouldUpdate(e){return 1!=e.size||!e.has("hass")||!Ke(this.hass)}async showDialog(e){var t;this._params=e,this.schedule=e.schedule,this._panel="main",this.large=!1;const i=this.schedule.entries[this.selectedEntry].slots.filter(e=>e.actions.length&&Ke(e.stop)).length>0||this.schedule.entries[this.selectedEntry].slots.filter(e=>e.actions.length).length>1||this.schedule.entries[this.selectedEntry].slots.length>3;let s=this.schedule.entries[this.selectedEntry].slots.findIndex(e=>e.actions.length);this.selectedSlot=s>=0?s:null,this.viewMode=i?me.Scheme:(null===(t=this._params)||void 0===t?void 0:t.cardConfig.default_editor)||me.Single,await this.updateComplete}async closeDialog(){this._params=void 0}willUpdate(){this.hass.loadBackendTranslation("config")}render(){var e;return this._params?R`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        width="${this.large?"full":"medium"}"
        prevent-scrim-close
      >
        <ha-dialog-header slot="header">
          ${"main"==this._panel?R`
          <ha-icon-button
            slot="navigationIcon"
            data-dialog="close"
            .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
            .path=${Bs}
          ></ha-icon-button>
          <ha-icon-button
            slot="actionItems"
            .label=""
            .path=${Ws}
            @click=${()=>{this._panel="options"}}
          ></ha-icon-button>
          `:R`
          <ha-icon-button
            slot="navigationIcon"
            .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
            .path=${"M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"}
            @click=${()=>{this._panel="main"}}
          ></ha-icon-button>
          `}
          <div slot="title" @click=${()=>this.large=!this.large}>
            ${this._params.editItem?this.schedule.name?null===(e=this.schedule)||void 0===e?void 0:e.name:Yi("ui.panel.common.default_name",this.hass,"{id}",this._params.editItem):Yi("ui.panel.common.new_schedule",this.hass)}
          </div>
        </ha-dialog-header>

        <div class="content">

          ${"main"==this._panel?R`
          <scheduler-main-panel
            .hass=${this.hass}
            .config=${this._params.cardConfig}
            .schedule=${this.schedule}
            .large=${this.large}
            @change=${this._updateSchedule}
            @setViewMode=${this._setViewMode}
            .viewMode=${this._viewMode}
            .selectedSlot=${this.selectedSlot}
          >
          </scheduler-main-panel>
            `:R`
          <scheduler-options-panel
            .hass=${this.hass}
            .config=${this._params.cardConfig}
            .schedule=${this.schedule}
            @change=${this._updateSchedule}
          >
          </scheduler-options-panel>
        `}
        </div>

          <div class="buttons" slot="footer">
            <ha-button appearance="plain" @click=${this._handleDeleteClick} variant="danger" ?disabled=${!this.schedule.entity_id}>
              ${ns("ui.common.delete",this.hass)}
            </ha-button>
            <ha-button appearance="plain" @click=${this._handleSaveClick}>
              ${ns("ui.common.save",this.hass)}
            </ha-button>
          </div>
      </ha-dialog>
    `:R``}_updateSchedule(e){let t=Object.keys(e.detail);if(t.includes("schedule")){let t=e.detail.schedule;this.schedule=t}t.includes("selectedSlot")&&(this.selectedSlot=e.detail.selectedSlot)}async _handleSaveClick(e){const t=Ea(this.schedule,this.hass,this._params.cardConfig.customize);if(t)await new Promise(i=>{const s={cancel:()=>i(!1),confirm:()=>i(!0),title:ns("state_badge.default.error",this.hass),description:Yi("ui.panel.editor.validation_errors."+t,this.hass),primaryButtonLabel:ns("ui.common.ok",this.hass)};Rs(e.target,"show-dialog",{dialogTag:"scheduler-generic-dialog",dialogImport:()=>Promise.resolve().then((function(){return zo})),dialogParams:s})});else if(this.schedule.schedule_id){const t=qe(await Is(this.hass,this.schedule.schedule_id),this.hass);if(ue(this.schedule,t))return void this.closeDialog();if(!t.enabled){await new Promise(t=>{const i={title:Yi("ui.dialog.enable_schedule.title",this.hass),description:Yi("ui.dialog.enable_schedule.description",this.hass),primaryButtonLabel:ns("ui.common.yes",this.hass),secondaryButtonLabel:ns("ui.common.no",this.hass),cancel:()=>{t(!1)},confirm:()=>{t(!0)}};Rs(e.target,"show-dialog",{dialogTag:"scheduler-generic-dialog",dialogImport:()=>Promise.resolve().then((function(){return zo})),dialogParams:i})})&&this.hass.callService("switch","turn_on",{entity_id:t.entity_id})}Ia(this.hass,this.schedule).catch(e=>La(e,this,this.hass)).then(()=>{this.closeDialog()})}else Aa(this.hass,this.schedule).catch(e=>La(e,this,this.hass)).then(()=>{this.closeDialog()})}async _handleDeleteClick(e){await new Promise(t=>{const i={cancel:()=>t(!1),confirm:()=>t(!0),title:Yi("ui.dialog.confirm_delete.title",this.hass),description:Yi("ui.dialog.confirm_delete.description",this.hass),primaryButtonLabel:ns("ui.common.ok",this.hass),secondaryButtonLabel:ns("ui.common.cancel",this.hass)};Rs(e.target,"show-dialog",{dialogTag:"scheduler-generic-dialog",dialogImport:()=>Promise.resolve().then((function(){return zo})),dialogParams:i})}).then(e=>{e&&Na(this.hass,this._params.editItem).catch(e=>La(e,this,this.hass)).then(()=>{this.closeDialog()})})}_setViewMode(e){let t=e.detail;const i=this.schedule.entries[this.selectedEntry].slots.filter(e=>e.actions.length).length>1;if(t!=me.Scheme)if(t!=me.Single||i)new Promise(t=>{const i={title:Yi("ui.dialog.confirm_migrate.title",this.hass),description:Yi("ui.dialog.confirm_migrate.description",this.hass),primaryButtonLabel:this.hass.localize("ui.common.yes"),secondaryButtonLabel:this.hass.localize("ui.common.no"),cancel:()=>{t(!1)},confirm:()=>{t(!0)}};Rs(e.target,"show-dialog",{dialogTag:"scheduler-generic-dialog",dialogImport:()=>Promise.resolve().then((function(){return zo})),dialogParams:i})}).then(e=>{e&&(this.schedule=(e=>{const t=e=>{let t=e.findIndex(e=>e.actions.length);t<0&&(t=Math.floor(e.length/2));let i=Object.assign(Object.assign({},e[t]),{stop:void 0});const s=i.conditions,a=i.start;return e=[{start:"00:00:00",stop:a,actions:[],conditions:s},i,{start:He(Ce(De(a),{minutes:1})),stop:"00:00:00",actions:[],conditions:s}]};return e=Object.assign(Object.assign({},e),{entries:e.entries.map(e=>Object(Object.assign(Object.assign({},e),{slots:t(e.slots)})))})})(this.schedule),this.viewMode=t)});else{if(ue([...this.schedule.entries],[...Ue.entries]))this.schedule=Object.assign(Object.assign({},this.schedule),{entries:[...Ze.entries]});else{let e=Object.assign(Object.assign({},this.schedule),{entries:this.schedule.entries.map(e=>{let t=e.slots.findIndex(e=>e.actions.length);return t<0&&(t=Math.floor(e.slots.length/2)),Object.assign(Object.assign({},e),{slots:e.slots.map((e,i)=>i==t?Object.assign(Object.assign({},e),{stop:void 0}):null).filter(Ke)})})});this.schedule=qe(e,this.hass)}this.viewMode=t}else{this.viewMode=t;if(ue([...this.schedule.entries],[...Ze.entries]))this.schedule=Object.assign(Object.assign({},this.schedule),{entries:[...Ue.entries]});else{this.schedule.entries.some(e=>e.slots.some(e=>void 0===e.stop))&&(this.schedule=Object.assign(Object.assign({},this.schedule),{entries:this.schedule.entries.map(e=>Object.assign(Object.assign({},e),{slots:e.slots.map((e,t,i)=>{if(void 0!==e.stop)return e;const s=i[t+1];return Object.assign(Object.assign({},e),{stop:s?s.start:"00:00:00"})})}))}))}}}};Co.styles=Oa,t([le({attribute:!1})],Co.prototype,"hass",void 0),t([ce()],Co.prototype,"_params",void 0),t([le({type:Boolean,reflect:!0})],Co.prototype,"large",void 0),t([ce()],Co.prototype,"schedule",void 0),t([ce()],Co.prototype,"selectedEntry",void 0),t([ce()],Co.prototype,"selectedSlot",void 0),t([ce()],Co.prototype,"_panel",void 0),t([ce()],Co.prototype,"_viewMode",void 0),Co=t([re("dialog-scheduler-editor")],Co);var Eo=Object.freeze({__proto__:null,get DialogSchedulerEditor(){return Co}});const Ao=e=>{if(!e)return null;const t=new Date(e);return isNaN(t.valueOf())?null:t},Do=(e,t,i)=>{var s,a,o;const n=De(e),r=1e3*(3600*n.hours+60*n.minutes);switch(n.mode){case we.EntityDay:{const e=Ao(n.entity_id?null===(s=t.states[n.entity_id])||void 0===s?void 0:s.state:void 0);if(!e)return null;const i=new Date(e);return i.setHours(n.hours,n.minutes,0,0),i}case we.Entity:{const e=Ao(n.entity_id?null===(a=t.states[n.entity_id])||void 0===a?void 0:a.state:void 0);return e?new Date(e.getTime()+r):null}case we.Sunrise:case we.Sunset:{const e=n.mode==we.Sunrise?"next_rising":"next_setting",i=Ao(null===(o=t.states["sun.sun"])||void 0===o?void 0:o.attributes[e]);return i?new Date(i.getTime()+r):null}default:{if(!i)return null;const e=new Date(i);return e.setHours(n.hours,n.minutes,0,0),e.getTime()<i.getTime()&&e.setDate(e.getDate()+1),e}}},To="sensor.jewish_calendar_upcoming_candle_lighting",Mo="sensor.jewish_calendar_upcoming_havdalah",Po=e=>"group:"+e,Lo=e=>"detach:"+e,No=()=>({type:ge.Or,items:[],track_changes:!1}),Io=e=>e.actions.flatMap(e=>{var t;return[(null===(t=e.target)||void 0===t?void 0:t.entity_id)||[]].flat()}).filter((e,t,i)=>e&&i.indexOf(e)===t),Ro=(e,t)=>Object.assign(Object.assign({},e),{target:{entity_id:t}}),Ho=(e,t)=>{var i;return null===(i=e.devices)||void 0===i?void 0:i[t]},qo=(e,t)=>({service:`${e.split(".")[0]}.turn_${t?"on":"off"}`,service_data:{}}),Vo=e=>{const t={};return e.forEach(e=>{var i;[(null===(i=e.target)||void 0===i?void 0:i.entity_id)||[]].flat().forEach(i=>{i&&(t[i]=Object.assign(Object.assign({},e),{target:void 0}))})}),t},Fo=e=>{const t=(e||"").match(/^([a-z_]+\.[a-z0-9_]+)[-+@]/);return t?t[1]:void 0},Bo=(e,t)=>{const i=[];return e.groups.forEach(e=>{e.cubes.forEach(t=>{i.push({start:t.start,stop:t.stop,name:t.name||void 0,color:t.color,enforce:t.enforce,track:e.track,priority:0,actions:e.entities.filter(e=>((e,t)=>Boolean(e.devices&&t in e.devices))(t,e)).map(e=>Ro(t.devices[e],[e])),conditions:No()})})}),e.detaches.forEach(e=>{i.push({start:e.start,stop:e.stop,name:e.name||void 0,track:e.track,priority:1,start_date:e.start_date,end_date:e.end_date,actions:[Ro(e.action,[e.entity])],conditions:No()})}),Object.assign(Object.assign({},t),{name:e.name,repeat_type:ye.Repeat,entries:[{weekdays:[_e.Daily],slots:i}],tags:[...new Set([...t.tags||[],"shabbat-plan"])]})},Wo=e=>(e.tags||[]).includes("shabbat-plan"),Uo=e=>{var t;const i=e.service_data||{};return{brightness:null!==(t=i.brightness_pct)&&void 0!==t?t:void 0!==i.brightness?Math.round(i.brightness/255*100):void 0,kelvin:i.color_temp_kelvin,degrees:i.temperature}},Zo={groups:[],devices:[],kinds:[]},Ko=["light","switch","fan","climate","input_boolean","media_player"],Xo=e=>Ko.includes(e.split(".")[0]),Go=(e,t)=>{var i;return((null===(i=e.groups.find(e=>e.name==t))||void 0===i?void 0:i.devices)||[]).filter(Xo)},Yo=[{key:"meal_eve",when:"sunset",time:"01:30",before:!1,on:!0},{key:"sleep",when:"clock",time:"23:00",on:!1},{key:"morning",when:"clock",time:"07:00",on:!0},{key:"meal_day",when:"clock",time:"12:00",on:!0},{key:"nap",when:"clock",time:"14:30",on:!1},{key:"close",when:"end",time:"00:30",before:!0,on:!0}],Jo=!0,Qo=()=>({plainColours:Jo,moments:Yo.map(e=>Object.assign({},e))}),en=()=>{var e;const t=Qo();try{const i=null===(e=window.localStorage)||void 0===e?void 0:e.getItem("scheduler-card.plan-prefs");if(!i)return t;const s=JSON.parse(i);"boolean"==typeof(null==s?void 0:s.plainColours)&&(t.plainColours=s.plainColours);const a=new Map((Array.isArray(null==s?void 0:s.moments)?s.moments:[]).map(e=>[null==e?void 0:e.key,e]));t.moments=Yo.map(e=>((e,t)=>{if(!e||"object"!=typeof e)return Object.assign({},t);const i=["clock","sunset","end"].includes(e.when)?e.when:t.when;return{key:t.key,when:i,time:/^\d{1,2}:\d{2}$/.test(e.time)?e.time:t.time,before:"boolean"==typeof e.before?e.before:t.before,on:"boolean"==typeof e.on?e.on:t.on}})(a.get(e.key),e))}catch(e){return Qo()}return t},tn=["#43a047","#7cb342","#fdd835","#fb8c00","#f4511e","#e53935","#d81b60","#8e24aa","#3949ab","#1e88e5","#00897b","#6d4c41"],sn=()=>({entries:[{weekdays:[_e.Daily],slots:[]}],repeat_type:ye.Repeat,next_entries:[],timestamps:[],enabled:!0,tags:[]}),an=(e,t)=>e.toDateString()==t.toDateString();let on=class extends oe{constructor(){super(...arguments),this._selected=null,this._error=null,this._help=!1,this._wizardStep=null,this._offerWizard=!1,this._wizard={entities:[],onAtCandleLighting:!0,moments:[],hold:!0},this._wizardAdvanced=!1,this._history=[],this._future=[],this._keys=!1,this._book=Zo,this._bookOpen=!1,this._newGroup="",this._prefs=en(),this._plainColours=this._prefs.plainColours,this._settingsOpen=!1,this._helpKey=null,this._membersAdvanced=!1,this._report=null,this._saved=!1,this._base=sn(),this._drag=null,this._handleKeyDown=async e=>{if(!this._params)return;const t=e.composedPath()[0],i=t instanceof HTMLElement&&(["input","textarea","select"].includes(t.tagName.toLowerCase())||t.isContentEditable),s=e.ctrlKey||e.metaKey,a=e.key.toLowerCase();if(s&&"z"==a&&!e.shiftKey)return e.preventDefault(),void this._undo();if(s&&("y"==a||"z"==a&&e.shiftKey))return e.preventDefault(),void this._redo();if(s&&"s"==a)return e.preventDefault(),void await this._save();if(i)return;if(null!==this._wizardStep)return;if("escape"==a&&(this._keys||this._report))return e.preventDefault(),this._keys=!1,void(this._report=null);if("?"==a||e.shiftKey&&"/"==a)return e.preventDefault(),void(this._keys=!this._keys);const o=this._selectedCube(),n=this._selectedDetach();switch(a){case"delete":case"backspace":return e.preventDefault(),void(o?this._removeCube(o.group,o.cube):n&&this._rejoinGroup(n.track));case"arrowright":case"arrowleft":return e.preventDefault(),void(e.shiftKey||e.altKey?this._nudgeBoundary("arrowright"==a?1:-1,e.altKey):this._step("arrowright"==a?1:-1));case"arrowdown":case"arrowup":return e.preventDefault(),void this._stepRow("arrowdown"==a?1:-1);case"n":case"+":return e.preventDefault(),void(o&&this._splitCube(o.group,o.cube));case"o":return e.preventDefault(),void this._toggleSelectedState();case"h":return e.preventDefault(),void(o&&this._updateCube(o.group.track,o.cube.id,{enforce:!o.cube.enforce}));case"g":return e.preventDefault(),void this._addGroup();case"r":return e.preventDefault(),void this._toggleReport();case"w":return e.preventDefault(),void(this._wizardStep=0);case"enter":return e.preventDefault(),void this._focusName()}if(o&&/^[0-9]$/.test(a)){e.preventDefault();const t=Number(a)-1;this._updateCube(o.group.track,o.cube.id,{color:t<0?void 0:tn[t]})}}}async showDialog(e){var t,i,s;this._params=e,this._base=e.schedule?Object.assign({},e.schedule):sn(),this._plan=e.schedule?(e=>{var t,i,s,a;const o=((null===(i=null===(t=null==e?void 0:e.entries)||void 0===t?void 0:t[0])||void 0===i?void 0:i.slots)||[]).filter(e=>e.actions.length),n=new Map;o.forEach(e=>{const t=e.track||Po("");n.has(t)||n.set(t,[]),n.get(t).push(e)});const r=[],d=[];n.forEach((e,t)=>{if(t.startsWith("detach:")){const i=t.slice("detach:".length);e.forEach((e,s)=>{d.push({track:t,name:e.name||"",entity:i,start:e.start,stop:e.stop||e.start,action:e.actions[0],start_date:e.start_date,end_date:e.end_date}),s&&(d[d.length-1].track=`${t}#${s}`)})}else r.push({track:t,name:t.startsWith("group:")?t.slice("group:".length):t,entities:[...new Set(e.flatMap(Io))],cubes:e.map((e,i)=>({id:`${t}#${i}`,name:e.name||"",start:e.start,stop:e.stop||e.start,color:e.color,enforce:e.enforce,devices:Vo(e.actions)}))})});const l=null===(s=r[0])||void 0===s?void 0:s.cubes[0],c=null===(a=r[0])||void 0===a?void 0:a.cubes[r[0].cubes.length-1];return{name:(null==e?void 0:e.name)||"",startAnchor:Fo(null==l?void 0:l.start)||To,endAnchor:Fo(null==c?void 0:c.stop)||Mo,groups:r,detaches:d}})(e.schedule):this._blankPlan(),this._selected=null!==(s=null===(i=null===(t=this._plan.groups[0])||void 0===t?void 0:t.cubes[0])||void 0===i?void 0:i.id)&&void 0!==s?s:null,this._error=null,this._help=!1,this._helpKey=null,this._wizardStep=null,this._wizardAdvanced=!1,this._membersAdvanced=!1,this._history=[],this._future=[],this._report=null,this._saved=!1,this._keys=!1,this._prefs=en(),this._plainColours=this._prefs.plainColours,this._wizard={entities:[],onAtCandleLighting:!0,moments:[],hold:!0},this._offerWizard=!e.schedule,this._bookOpen=!1,this._loadBook(),await this.updateComplete}async closeDialog(){this._params=void 0}connectedCallback(){super.connectedCallback(),window.addEventListener("keydown",this._handleKeyDown)}disconnectedCallback(){window.removeEventListener("keydown",this._handleKeyDown),super.disconnectedCallback()}_t(e,t,i){return Yi("ui.panel.plan."+e,this.hass,t||[],i||[])}_helpFor(e){return R`
      <button
        class="icon-only help-toggle ${this._helpKey==e?"active":""}"
        title=${this._t("help.open")}
        @click=${()=>{this._helpKey=this._helpKey==e?null:e}}
      ><ha-svg-icon .path=${Zs}></ha-svg-icon></button>
    `}_helpText(e){return this._helpKey!=e?q:R`<p class="help-note">${this._t("help."+e)}</p>`}_updatePrefs(e){this._prefs=Object.assign(Object.assign({},this._prefs),e),(e=>{var t;try{null===(t=window.localStorage)||void 0===t||t.setItem("scheduler-card.plan-prefs",JSON.stringify(e))}catch(e){}})(this._prefs)}_setPlainColours(e){this._plainColours=e,this._updatePrefs({plainColours:e})}_setDefaultMoment(e,t){this._updatePrefs({moments:this._prefs.moments.map(i=>i.key==e?Object.assign(Object.assign({},i),t):i)})}_resetDefaultMoments(){this._updatePrefs({moments:Yo.map(e=>Object.assign({},e))})}_blankPlan(){return((e,t)=>{const i=To,s=Mo;return{name:e,startAnchor:i,endAnchor:s,groups:[{track:Po(t[5]||"group"),name:t[5]||"group",entities:[],cubes:[{id:"c0",name:t[0],start:i+"+00:00:00",stop:i+"@22:30:00",devices:{},enforce:!0,suggestOn:!0},{id:"c1",name:t[1],start:i+"@22:30:00",stop:s+"@06:30:00",devices:{},enforce:!0,suggestOn:!1},{id:"c2",name:t[2],start:s+"@06:30:00",stop:s+"@13:00:00",devices:{},enforce:!0,suggestOn:!0},{id:"c3",name:t[3],start:s+"@13:00:00",stop:s+"-00:30:00",devices:{},enforce:!0,suggestOn:!1},{id:"c4",name:t[4],start:s+"-00:30:00",stop:s+"+01:30:00",devices:{},enforce:!0,suggestOn:!0}]}],detaches:[]}})(this._t("title"),[this._t("cube.welcome"),this._t("cube.night"),this._t("cube.morning"),this._t("cube.afternoon"),this._t("cube.close"),this._t("group.default")])}get _rows(){return[...this._plan.groups.map(e=>({track:e.track,ids:e.cubes.map(e=>e.id)})),...this._plan.detaches.map(e=>({track:e.track,ids:[e.track]}))]}_step(e){var t,i;const s=this._rows.find(e=>e.ids.includes(this._selected||""));if(!s)return void(this._selected=null!==(i=null===(t=this._rows[0])||void 0===t?void 0:t.ids[0])&&void 0!==i?i:null);const a=s.ids.indexOf(this._selected)+e;a>=0&&a<s.ids.length&&(this._selected=s.ids[a])}_stepRow(e){const t=this._rows,i=t.findIndex(e=>e.ids.includes(this._selected||"")),s=t[Math.min(t.length-1,Math.max(0,i+e))];s&&(this._selected=s.ids[0])}_nudgeBoundary(e,t){const i=this._selectedCube();if(!i)return;const{group:s,cube:a}=i,o=s.cubes.findIndex(e=>e.id==a.id),n=t?o+1:o,r=t?a.stop:a.start,d=this._moment(r);if(!d)return;const l=new Date(d.getTime()+5*e*6e4);if(n>0&&n<s.cubes.length)return void this._moveBoundary(s.track,n,this._boundaryFromDate(l),"nudge");const c=s.cubes.map(e=>e.id!=a.id?e:Object.assign(Object.assign({},e),{[t?"stop":"start"]:this._boundaryFromDate(l)}));this._setCubes(s.track,c,"nudge")}_toggleSelectedState(){const e=this._selectedCube();if(e)return void this._updateCube(e.group.track,e.cube.id,{devices:this._invertDevices(e.cube)});const t=this._selectedDetach();if(t){const e=t.action.service.split(".")[0],i=Ba(t.action)?"turn_on":"turn_off";this._updateDetach(t.track,{action:Object.assign(Object.assign({},t.action),{service:`${e}.${i}`})})}}async _focusName(){var e;await this.updateComplete;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector(".cube-title");null==t||t.focus(),null==t||t.select()}_showReport(){this._report=((e,t)=>{const i=Do(e.startAnchor+"+00:00:00",t),s=Do(e.endAnchor+"+01:30:00",t),a=e=>Do(e,t,i||void 0),o=[],n=[],r=e=>{var i;return(null===(i=t.states[e])||void 0===i?void 0:i.attributes.friendly_name)||e};return e.groups.forEach(t=>{t.entities.length||o.push(t.name),t.cubes.forEach((i,s)=>{const o=a(i.start),d=a(i.stop);n.push({key:i.id,group:t.name,name:i.name||"#"+(s+1),from:o,to:d,holds:Boolean(i.enforce),devices:t.entities.map(t=>{const s=Ho(i,t);if(!s)return{entity_id:t,name:r(t),state:"untouched",own:!1};const{brightness:n,kelvin:l,degrees:c}=Uo(s),h=e.detaches.find(e=>{if(e.entity!=t)return!1;const i=a(e.start);return Boolean(i&&o&&d&&i>=o&&i<d)});return Object.assign(Object.assign(Object.assign(Object.assign({entity_id:t,name:r(t),state:Ba(s)?"off":"on"},"light"==t.split(".")[0]?{brightness:n,kelvin:l}:{}),"climate"==t.split(".")[0]?{degrees:c}:{}),{own:!0}),h?{takenOverBy:h.name}:{})})})})}),e.detaches.forEach(e=>{const t=e.action,{brightness:i,kelvin:s,degrees:o}=Uo(t);n.push({key:e.track,group:r(e.entity),name:e.name,from:a(e.start),to:a(e.stop),holds:!1,devices:[Object.assign(Object.assign(Object.assign({entity_id:e.entity,name:r(e.entity),state:Ba(t)?"off":"on"},"light"==e.entity.split(".")[0]?{brightness:i,kelvin:s}:{}),"climate"==e.entity.split(".")[0]?{degrees:o}:{}),{own:!0})]})}),n.sort((e,t)=>{var i,s;return((null===(i=e.from)||void 0===i?void 0:i.getTime())||0)-((null===(s=t.from)||void 0===s?void 0:s.getTime())||0)}),{opens:i,closes:s,stretches:n,problems:o}})(this._plan,this.hass)}_toggleReport(){if(this._report)return this._report=null,void(this._saved=!1);this._showReport()}get _bandStart(){return Do(this._plan.startAnchor+"+00:00:00",this.hass)}get _bandEnd(){return Do(this._plan.endAnchor+"+01:30:00",this.hass)}_moment(e){const t=Do(e,this.hass,this._bandStart||void 0);if(!t)return t;const i=De(e);return i.mode!=we.Sunset&&i.mode!=we.Sunrise?t:this._onBandDay(t.getHours(),t.getMinutes())||t}_onBandDay(e,t){const i=e>=16?this._bandStart:this._bandEnd;if(!i)return null;const s=new Date(i);return s.setHours(e,t,0,0),s}_position(e){const t=this._bandStart,i=this._bandEnd;if(!t||!i)return null;const s=i.getTime()-t.getTime();if(s<=0)return null;const a=this._moment(e);return a?Math.min(1,Math.max(0,(a.getTime()-t.getTime())/s)):null}_formatMoment(e){var t;const i=this._moment(e);return i?new Intl.DateTimeFormat((null===(t=this.hass.locale)||void 0===t?void 0:t.language)||"en",{weekday:"short",hour:"2-digit",minute:"2-digit"}).format(i):"—"}_hourTicks(){const e=this._bandStart,t=this._bandEnd;if(!e||!t)return[];const i=[],s=t.getTime()-e.getTime(),a=new Date(e);for(a.setMinutes(0,0,0),a.setHours(a.getHours()+1);a.getTime()<t.getTime();)a.getHours()%3==0&&i.push({at:(a.getTime()-e.getTime())/s,label:String(a.getHours()).padStart(2,"0")}),a.setHours(a.getHours()+1);return i}_boundaryParts(e){const t=De(e),i=t.entity_id||"",s=0==t.hours&&0==t.minutes;return{anchor:i,mode:i?t.mode==we.EntityDay?"clock":s?"exact":"offset":"clock",hours:Math.abs(t.hours),minutes:Math.abs(t.minutes),before:t.hours<0||t.minutes<0}}_boundaryString(e){if(!e.anchor)return He({mode:we.Fixed,hours:e.hours,minutes:e.minutes});if("exact"==e.mode)return He({mode:we.Entity,hours:0,minutes:0,entity_id:e.anchor});if("clock"==e.mode)return He({mode:we.EntityDay,hours:e.hours,minutes:e.minutes,entity_id:e.anchor});const t=e.before?-1:1;return He({mode:we.Entity,hours:t*e.hours,minutes:t*e.minutes,entity_id:e.anchor})}_boundaryFromDate(e){const t=this._moment(this._plan.startAnchor+"+00:00:00"),i=this._moment(this._plan.endAnchor+"+00:00:00"),s=t=>He({mode:we.EntityDay,hours:e.getHours(),minutes:e.getMinutes(),entity_id:t});if(t&&an(e,t))return s(this._plan.startAnchor);if(i&&an(e,i))return s(this._plan.endAnchor);const a=[{anchor:this._plan.startAnchor,base:t},{anchor:this._plan.endAnchor,base:i}].filter(e=>e.base);for(const t of a.sort((t,i)=>Math.abs(e.getTime()-t.base.getTime())-Math.abs(e.getTime()-i.base.getTime()))){const i=Math.round((e.getTime()-t.base.getTime())/6e4);if(Math.abs(i)<1440)return this._boundaryString({anchor:t.anchor,mode:"offset",hours:Math.floor(Math.abs(i)/60),minutes:Math.abs(i)%60,before:i<0})}return s(this._plan.endAnchor)}_dateFromPointer(e,t){const i=this._bandStart,s=this._bandEnd;if(!i||!s)return null;const a=e.getBoundingClientRect(),o="rtl"==getComputedStyle(this).direction,n=Math.min(1,Math.max(0,(o?a.right-t:t-a.left)/a.width)),r=new Date(i.getTime()+n*(s.getTime()-i.getTime()));return r.setMinutes(5*Math.round(r.getMinutes()/5),0,0),r}_handleDragStart(e,t,i){const s=e.currentTarget.parentElement;s&&(e.preventDefault(),e.currentTarget.setPointerCapture(e.pointerId),this._drag={row:t,index:i,track:s})}_handleDragMove(e){if(!this._drag)return;const t=this._dateFromPointer(this._drag.track,e.clientX);t&&this._moveBoundary(this._drag.row,this._drag.index,this._boundaryFromDate(t),`drag:${this._drag.row}:${this._drag.index}`)}_handleDragEnd(){this._drag=null}_moveBoundary(e,t,i,s){const a=this._plan.groups.find(t=>t.track==e),o=this._moment(i);if(!a||!o)return;const n=e=>{var t,i;return null!==(i=null===(t=this._moment(e))||void 0===t?void 0:t.getTime())&&void 0!==i?i:null},r=a.cubes.map(e=>Object.assign({},e));r[t]=Object.assign(Object.assign({},r[t]),{start:i}),t>0&&(r[t-1]=Object.assign(Object.assign({},r[t-1]),{stop:i}));let d=o.getTime();for(let e=t;e<r.length;e++){const t=n(r[e].stop);if(null===t||t>=d+3e5)break;d+=3e5;const i=this._boundaryFromDate(new Date(d));r[e]=Object.assign(Object.assign({},r[e]),{stop:i}),e+1<r.length&&(r[e+1]=Object.assign(Object.assign({},r[e+1]),{start:i}))}d=o.getTime();for(let e=t-1;e>=0;e--){const t=n(r[e].start);if(null===t||t<=d-3e5)break;d-=3e5;const i=this._boundaryFromDate(new Date(d));r[e]=Object.assign(Object.assign({},r[e]),{start:i}),e>0&&(r[e-1]=Object.assign(Object.assign({},r[e-1]),{stop:i}))}this._setCubes(e,r,s)}_setCubes(e,t,i){this._updatePlan({groups:this._plan.groups.map(i=>i.track==e?Object.assign(Object.assign({},i),{cubes:this._resolveOverlaps(t)}):i)},i),this._keepSelectionValid()}_resolveOverlaps(e){const t=e=>{var t,i;return null!==(i=null===(t=this._moment(e))||void 0===t?void 0:t.getTime())&&void 0!==i?i:null};let i=e.filter(e=>{const i=t(e.start),s=t(e.stop);return null===i||null===s||s-i>=3e5});return i.length?(i=i.map((e,t)=>t<i.length-1?Object.assign(Object.assign({},e),{stop:i[t+1].start}):e),i):e.slice(0,1)}_updatePlan(e,t){const i=this._plan;void 0!==t&&t===this._lastChange||(this._history=[...this._history.slice(-49),i]),this._lastChange=t,this._future=[],this._plan=Object.assign(Object.assign({},i),e)}_undo(){if(!this._history.length)return;const e=this._history[this._history.length-1];this._history=this._history.slice(0,-1),this._future=[...this._future,this._plan],this._plan=e,this._lastChange=void 0,this._keepSelectionValid()}_redo(){if(!this._future.length)return;const e=this._future[this._future.length-1];this._future=this._future.slice(0,-1),this._history=[...this._history,this._plan],this._plan=e,this._lastChange=void 0,this._keepSelectionValid()}_keepSelectionValid(){var e,t,i;this._selectedCube()||this._selectedDetach()||(this._selected=null!==(i=null===(t=null===(e=this._plan.groups[0])||void 0===e?void 0:e.cubes[0])||void 0===t?void 0:t.id)&&void 0!==i?i:null)}_updateCube(e,t,i){this._updatePlan({groups:this._plan.groups.map(s=>s.track!=e?s:Object.assign(Object.assign({},s),{cubes:s.cubes.map(e=>e.id==t?Object.assign(Object.assign({},e),i):e)}))})}_updateDetach(e,t){this._updatePlan({detaches:this._plan.detaches.map(i=>i.track==e?Object.assign(Object.assign({},i),t):i)})}_selectedCube(){for(const e of this._plan.groups){const t=e.cubes.find(e=>e.id==this._selected);if(t)return{group:e,cube:t}}return null}_selectedDetach(){return this._plan.detaches.find(e=>e.track==this._selected)||null}_addGroup(){const e=this._t("group.new","{n}",String(this._plan.groups.length+1)),t=this._blankPlan().groups[0],i=Object.assign(Object.assign({},t),{track:Po(e),name:e,cubes:t.cubes.map((t,i)=>Object.assign(Object.assign({},t),{id:`${Po(e)}#${i}`}))});this._updatePlan({groups:[...this._plan.groups,i]}),this._selected=i.cubes[0].id}_removeGroup(e){var t,i,s;this._updatePlan({groups:this._plan.groups.filter(t=>t.track!=e)}),this._selected=null!==(s=null===(i=null===(t=this._plan.groups[0])||void 0===t?void 0:t.cubes[0])||void 0===i?void 0:i.id)&&void 0!==s?s:null}_splitCube(e,t){const i=e.cubes.findIndex(e=>e.id==t.id),s=this._moment(t.start),a=this._moment(t.stop);if(!s||!a||a.getTime()-s.getTime()<6e5)return;const o=new Date((s.getTime()+a.getTime())/2);o.setMinutes(5*Math.round(o.getMinutes()/5),0,0);const n=this._boundaryFromDate(o),r=Object.assign(Object.assign({},t),{id:`${e.track}#new${i}${e.cubes.length}`,name:"",color:void 0,start:n,devices:this._invertDevices(t)}),d=[...e.cubes];d.splice(i,1,Object.assign(Object.assign({},t),{stop:n}),r),this._setCubes(e.track,d),this._selected=r.id}_invertDevices(e){const t={};return Object.entries(e.devices||{}).forEach(([e,i])=>{t[e]=Ua(i)||i}),t}_removeCube(e,t){if(e.cubes.length<2)return;const i=e.cubes.findIndex(e=>e.id==t.id),s=e.cubes.filter(e=>e.id!=t.id);i>0?s[i-1]=Object.assign(Object.assign({},s[i-1]),{stop:t.stop}):s[0]=Object.assign(Object.assign({},s[0]),{start:t.start}),this._selected=s[Math.max(0,i-1)].id,this._setCubes(e.track,s)}_detachDevice(e,t){let i=Lo(t),s=1;for(;this._plan.detaches.some(e=>e.track==i);)i=`${Lo(t)}#${s++}`;const a=e.cubes[Math.min(2,e.cubes.length-1)],o={track:i,name:this._t("detach.name"),entity:t,start:a.start,stop:a.stop,action:{service:t.split(".")[0]+".turn_on",service_data:{}}};this._updatePlan({detaches:[...this._plan.detaches,o]}),this._selected=i}_rejoinGroup(e){var t,i,s;this._updatePlan({detaches:this._plan.detaches.filter(t=>t.track!=e)}),this._selected=null!==(s=null===(i=null===(t=this._plan.groups[0])||void 0===t?void 0:t.cubes[0])||void 0===i?void 0:i.id)&&void 0!==s?s:null}_setMembers(e,t){const i=t.filter(t=>!e.entities.includes(t)),s=e=>{const s=Object.assign({},e.devices||{});return i.forEach(t=>{s[t]=qo(t,!1!==e.suggestOn)}),Object.keys(s).forEach(e=>{t.includes(e)||delete s[e]}),Object.assign(Object.assign({},e),{devices:s})};this._updatePlan({groups:this._plan.groups.map(i=>i.track==e.track?Object.assign(Object.assign({},i),{entities:t,cubes:i.cubes.map(s)}):i),detaches:this._plan.detaches.filter(i=>t.includes(i.entity)||this._plan.groups.some(t=>t.track!=e.track&&t.entities.includes(i.entity)))})}async _save(){const e=this._plan.groups.find(e=>!e.entities.length);if(e)return void(this._error=this._t("error.no_entities","{group}",e.name));if(!this._bandStart||!this._bandEnd)return void(this._error=this._t("error.no_anchor"));const t=Bo(this._plan,this._base);try{t.schedule_id?await Ia(this.hass,t):await Aa(this.hass,t),this._saved=!0,this._showReport()}catch(e){this._reportError(e)}}async _delete(){this._base.schedule_id&&await Na(this.hass,this._base.schedule_id).catch(e=>this._reportError(e)),this.closeDialog()}_reportError(e){var t,i;this._error=(null===(t=null==e?void 0:e.body)||void 0===t?void 0:t.message)||(null==e?void 0:e.error)||String(e),(null===(i=null==e?void 0:e.body)||void 0===i?void 0:i.message)&&La(e,this,this.hass)}updated(){this.toggleAttribute("plain",this._plainColours)}render(){return this._params?R`
      <ha-dialog open @closed=${this.closeDialog} width="full" prevent-scrim-close>
        <ha-dialog-header slot="header">
          <ha-icon-button
            slot="navigationIcon"
            data-dialog="close"
            .label=${ns("ui.dialogs.more_info_control.dismiss",this.hass)}
            .path=${Bs}
            @click=${this.closeDialog}
          ></ha-icon-button>
          <div slot="title">${this._t("title")}</div>
        </ha-dialog-header>

        <div class="content">
          ${null!==this._wizardStep?this._renderWizard():this._renderEditor()}
          ${this._error?R`<div class="error">${this._error}</div>`:q}
        </div>

        ${null!==this._wizardStep?q:R`
        <div class="buttons" slot="footer">
          <ha-button appearance="plain" variant="danger" @click=${this._delete} ?disabled=${!this._base.schedule_id}>
            ${ns("ui.common.delete",this.hass)}
          </ha-button>
          <ha-button appearance="plain" @click=${this._save} class="save">
            ${ns("ui.common.save",this.hass)}
          </ha-button>
        </div>`}
      </ha-dialog>
    `:R``}_renderEditor(){return R`
      ${this._renderHeader()}
      ${this._offerWizard?this._renderWizardOffer():q}
      ${this._help?this._renderHelp():q}
      ${this._keys?this._renderKeys():q}
      ${this._settingsOpen?this._renderSettings():q}
      ${this._bookOpen?this._renderBook():q}
      ${this._report?this._renderReport(this._report):q}
      ${this._bandStart&&this._bandEnd?this._renderBand():this._renderMissingAnchors()}
      ${this._renderInspector()}
    `}_renderHeader(){return R`
      <div class="plan-header">
        <div class="plan-title">
          <input
            class="plan-name"
            .value=${this._plan.name}
            placeholder=${this._t("title")}
            @input=${e=>this._updatePlan({name:e.target.value})}
          />
          <button
            class="icon-only ${this._help?"active":""}"
            title=${this._t("help.open")}
            @click=${()=>{this._help=!this._help}}
          >
            <ha-svg-icon .path=${Zs}></ha-svg-icon>
          </button>
          <button
            class="icon-only"
            title=${this._t("history.undo")}
            ?disabled=${!this._history.length}
            @click=${this._undo}
          ><ha-svg-icon .path=${"M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z"}></ha-svg-icon></button>
          <button
            class="icon-only"
            title=${this._t("history.redo")}
            ?disabled=${!this._future.length}
            @click=${this._redo}
          ><ha-svg-icon .path=${"M10.5,7A6.5,6.5 0 0,0 4,13.5A6.5,6.5 0 0,0 10.5,20H14V18H10.5C8,18 6,16 6,13.5C6,11 8,9 10.5,9H16.17L13.09,12.09L14.5,13.5L20,8L14.5,2.5L13.08,3.91L16.17,7H10.5M18,18H16V20H18V18Z"}></ha-svg-icon></button>
          <button
            class="icon-only ${this._keys?"active":""}"
            title=${this._t("keys.open")}
            @click=${()=>{this._keys=!this._keys}}
          ><ha-svg-icon .path=${"M4,5A2,2 0 0,0 2,7V17A2,2 0 0,0 4,19H20A2,2 0 0,0 22,17V7A2,2 0 0,0 20,5H4M4,7H20V17H4V7M5,8V10H7V8H5M8,8V10H10V8H8M11,8V10H13V8H11M14,8V10H16V8H14M17,8V10H19V8H17M5,11V13H7V11H5M8,11V13H10V11H8M11,11V13H13V11H11M14,11V13H16V11H14M17,11V13H19V11H17M8,14V16H16V14H8Z"}></ha-svg-icon></button>
          <button
            class="ghost ${this._settingsOpen?"primary":""}"
            @click=${()=>{this._settingsOpen=!this._settingsOpen,this._bookOpen=!1}}
          >
            <ha-svg-icon .path=${Ws}></ha-svg-icon>${this._t("settings.open")}
          </button>
          <button class="ghost ${this._report?"primary":""}" @click=${this._toggleReport}>
            <ha-svg-icon .path=${"M21 11.11V5C21 3.9 20.11 3 19 3H14.82C14.4 1.84 13.3 1 12 1S9.6 1.84 9.18 3H5C3.9 3 3 3.9 3 5V19C3 20.11 3.9 21 5 21H11.11C12.37 22.24 14.09 23 16 23C19.87 23 23 19.87 23 16C23 14.09 22.24 12.37 21 11.11M12 3C12.55 3 13 3.45 13 4S12.55 5 12 5 11 4.55 11 4 11.45 3 12 3M5 19V5H7V7H17V5H19V9.68C18.09 9.25 17.08 9 16 9H7V11H11.1C10.5 11.57 10.04 12.25 9.68 13H7V15H9.08C9.03 15.33 9 15.66 9 16C9 17.08 9.25 18.09 9.68 19H5M16 21C13.24 21 11 18.76 11 16S13.24 11 16 11 21 13.24 21 16 18.76 21 16 21M16.5 16.25L19.36 17.94L18.61 19.16L15 17V12H16.5V16.25Z"}></ha-svg-icon>${this._t("report.open")}
          </button>
          <button class="ghost" @click=${()=>{this._wizardStep=0}}>
            <ha-svg-icon .path=${"M21 22H3V20H21V22M19 19H5L11.1 2.6C11.3 2.2 11.6 2 12 2L18 5H13.9L19 19M10 7.5L11.04 7.97L11.5 9L11.97 7.97L13 7.5L11.97 7.03L11.5 6L11.04 7.03L10 7.5M13 15L10.94 14.07L10 12L9.07 14.07L7 15L9.07 15.93L10 18L10.94 15.93L13 15M13.97 11.97L15 11.5L13.97 11.03L13.5 10L13.04 11.03L12 11.5L13.04 11.97L13.5 13L13.97 11.97M15.97 15.97L17 15.5L15.97 15.03L15.5 14L15.04 15.03L14 15.5L15.04 15.97L15.5 17L15.97 15.97Z"}></ha-svg-icon>${this._t("wizard.open")}
          </button>
        </div>
        <div class="anchors">
          <div class="anchor">
            <span class="anchor-label">${this._t("anchor.opens")}</span>
            <span class="anchor-value">${this._formatMoment(this._plan.startAnchor+"+00:00:00")}</span>
          </div>
          <div class="anchor-arrow"></div>
          <div class="anchor">
            <span class="anchor-label">${this._t("anchor.closes")}</span>
            <span class="anchor-value">${this._formatMoment(this._plan.endAnchor+"+00:00:00")}</span>
          </div>
        </div>
      </div>
    `}_renderWizardOffer(){return R`
      <div class="offer">
        <span>${this._t("wizard.offer")}</span>
        <div class="offer-actions">
          <button class="ghost primary" @click=${()=>{this._wizardStep=0}}>${this._t("wizard.offer_yes")}</button>
          <button class="ghost" @click=${()=>{this._offerWizard=!1}}>${this._t("wizard.offer_no")}</button>
        </div>
      </div>
    `}_renderHelp(){return R`
      <div class="help">
        <p>${this._t("help.band")}</p>
        <p>${this._t("help.rows")}</p>
        <p>${this._t("help.detach")}</p>
        <p>${this._t("help.keys")}</p>
      </div>
    `}_renderKeys(){const e=[["← →",this._t("keys.select")],["↑ ↓",this._t("keys.row")],["⇧ ← →",this._t("keys.move_start")],["⌥ ← →",this._t("keys.move_stop")],["N",this._t("cube.split")],["⌫",ns("ui.common.delete",this.hass)],["O",this._t("keys.state")],["H",this._t("enforce.label")],["1…9 / 0",this._t("keys.colour")],["G",this._t("group.add")],["R",this._t("report.open")],["W",this._t("wizard.open")],["↵",this._t("keys.rename")],["⌘Z / Ctrl Z",this._t("history.undo")],["⌘Y / Ctrl Y",this._t("history.redo")],["⌘S / Ctrl S",ns("ui.common.save",this.hass)],["?",this._t("keys.open")]];return R`
      <div class="keys">
        ${e.map(([e,t])=>R`
          <div class="key-row"><kbd>${e}</kbd><span>${t}</span></div>`)}
      </div>
    `}_renderReport(e){const t=e=>{var t;return e?new Intl.DateTimeFormat((null===(t=this.hass.locale)||void 0===t?void 0:t.language)||"en",{weekday:"short",hour:"2-digit",minute:"2-digit"}).format(e):"—"};return R`
      <div class="report">
        <div class="report-head">
          <span class="report-title">${this._t("report.title")}</span>
          <span class="report-band">${t(e.opens)} → ${t(e.closes)}</span>
          ${this._helpFor("report")}
          <button class="icon-only" @click=${()=>{this._report=null}}>
            <ha-svg-icon .path=${Bs}></ha-svg-icon>
          </button>
        </div>
        ${this._helpText("report")}

        ${this._saved?R`<div class="report-saved">${this._t("report.saved")}</div>`:q}

        ${e.problems.length?R`<div class="report-problem">
            ${this._t("error.no_entities","{group}",e.problems.join(", "))}
          </div>`:q}

        <ol class="report-list">
          ${e.stretches.map(e=>R`
          <li>
            <span class="report-at">${t(e.from)}</span>
            <div class="report-what">
              <span class="report-name">
                ${e.name}
                <span class="report-group">${e.group}</span>
                ${e.holds?R`<span class="beta">${this._t("enforce.on")}</span>`:q}
              </span>
              <div class="report-devices">
                ${e.devices.map(e=>R`
                <span class="report-device ${e.state}">
                  ${e.name}
                  <b>${this._t("untouched"==e.state?"device.untouched":"on"==e.state?"state.on":"state.off")}</b>
                  ${void 0!==e.brightness?R`<i>${e.brightness}%</i>`:q}
                  ${void 0!==e.kelvin?R`<i>${e.kelvin}K</i>`:q}
                  ${void 0!==e.degrees?R`<i>${e.degrees}°</i>`:q}
                  ${e.takenOverBy?R`<em>${this._t("report.taken","{name}",e.takenOverBy)}</em>`:q}
                </span>`)}
              </div>
            </div>
          </li>`)}
        </ol>
      </div>
    `}_renderSettings(){return R`
      <div class="book">
        <div class="book-head">
          <span class="report-title">${this._t("settings.title")}</span>
          <span class="report-band">${this._t("settings.hint")}</span>
          <button class="icon-only" @click=${()=>{this._settingsOpen=!1}}>
            <ha-svg-icon .path=${Bs}></ha-svg-icon>
          </button>
        </div>
        <div class="book-body">
          <div class="field">
            <span class="field-label">
              ${this._t("settings.colours")}${this._helpFor("colours")}
            </span>
            ${this._helpText("colours")}
            <div class="segmented">
              <button class=${this._plainColours?"active":""}
                @click=${()=>this._setPlainColours(!0)}>${this._t("settings.colours_plain")}</button>
              <button class=${this._plainColours?"":"active"}
                @click=${()=>this._setPlainColours(!1)}>${this._t("settings.colours_action")}</button>
            </div>
            <span class="field-resolved">${this._t("settings.colours_hint")}</span>
          </div>

          ${this._renderDefaultTimes()}

          <div class="field">
            <span class="field-label">
              ${this._t("book.title")}${this._helpFor("book")}
            </span>
            ${this._helpText("book")}
            <button class="ghost" @click=${()=>{this._bookOpen=!0,this._settingsOpen=!1}}>
              <ha-svg-icon .path=${"M9,1H19A2,2 0 0,1 21,3V19L19,18.13V3H7A2,2 0 0,1 9,1M15,20V7H5V20L10,17.82L15,20M15,5C16.11,5 17,5.9 17,7V23L10,20L3,23V7A2,2 0 0,1 5,5H15Z"}></ha-svg-icon>${this._t("book.open")}
            </button>
            <span class="field-resolved">${this._t("book.hint")}</span>
          </div>
        </div>
      </div>
    `}_renderDefaultTimes(){return R`
      <div class="field">
        <span class="field-label">
          ${this._t("settings.times")}${this._helpFor("times")}
        </span>
        ${this._helpText("times")}
        <div class="moments defaults">
          ${this._prefs.moments.map(e=>R`
          <div class="moment">
            <span class="moment-fixed-name">${this._t("wizard.preset."+e.key)}</span>
            ${this._endPicker(e,t=>this._setDefaultMoment(e.key,t))}
            <div class="segmented states">
              <button class="on ${e.on?"active":""}"
                @click=${()=>this._setDefaultMoment(e.key,{on:!0})}>
                ${this._t("state.on")}
              </button>
              <button class="off ${e.on?"":"active"}"
                @click=${()=>this._setDefaultMoment(e.key,{on:!1})}>
                ${this._t("state.off")}
              </button>
            </div>
            <span class="moment-at">${this._formatMoment(this._momentBoundary(e))}</span>
          </div>`)}
        </div>
        <button class="ghost small" @click=${this._resetDefaultMoments}>
          ${this._t("settings.times_reset")}
        </button>
        <span class="field-resolved">${this._t("settings.times_hint")}</span>
      </div>
    `}async _loadBook(){try{const t=await(e=this.hass,e.callWS({type:"scheduler/device_book"}));this._book={groups:(null==t?void 0:t.groups)||[],devices:(null==t?void 0:t.devices)||[],kinds:(null==t?void 0:t.kinds)||[]}}catch(e){this._book=Zo}var e}_renderBook(){return R`
      <div class="book">
        <div class="book-head">
          <span class="report-title">${this._t("book.title")}</span>
          <span class="report-band">${this._t("book.hint")}</span>
          ${this._helpFor("book")}
          <button class="icon-only" @click=${()=>{this._bookOpen=!1}}>
            <ha-svg-icon .path=${Bs}></ha-svg-icon>
          </button>
        </div>
        ${this._helpText("book")}

        <div class="book-body">
          <div class="book-groups">
            ${this._book.groups.map(e=>R`
            <div class="book-group">
              <span class="book-group-name">${e.name}</span>
              <span class="book-group-count">
                ${this._t("group.members","{n}",String(e.devices.length))}
              </span>
              <button class="ghost small" @click=${()=>this._useGroup(e.name)}>
                ${this._t("book.use")}
              </button>
              <button class="ghost small danger" @click=${()=>this._saveGroup(e.name,[])}>
                ${ns("ui.common.delete",this.hass)}
              </button>
            </div>`)}

            <div class="book-group new">
              <input
                class="moment-name"
                .value=${this._newGroup}
                placeholder=${this._t("book.new_group")}
                @input=${e=>{this._newGroup=e.target.value}}
              />
              <button
                class="ghost small"
                ?disabled=${!this._newGroup.trim()||!this._selectedGroupEntities().length}
                @click=${()=>this._saveGroup(this._newGroup.trim(),this._selectedGroupEntities())}
              >${this._t("book.from_selection")}</button>
            </div>
          </div>

          <div class="book-devices">
            ${this._selectedGroupEntities().map(e=>this._renderBookDevice(e))}
          </div>
        </div>
      </div>
    `}_renderBookDevice(e){var t;const i=this._book.devices.find(t=>t.entity_id==e),s=this._book.kinds.length?this._book.kinds:["light","switch","climate","other"];return R`
      <div class="device-row">
        <span class="device-label">${(null===(t=this.hass.states[e])||void 0===t?void 0:t.attributes.friendly_name)||e}</span>
        <input
          class="moment-name"
          .value=${(null==i?void 0:i.alias)||""}
          placeholder=${this._t("book.name_it")}
          @change=${t=>this._nameDevice(e,{name:t.target.value.trim()||null})}
        />
        <select @change=${t=>this._nameDevice(e,{kind:t.target.value})}>
          ${s.map(t=>R`
            <option value=${t} ?selected=${((null==i?void 0:i.kind)||e.split(".")[0])==t}>
              ${this._t("book.kind."+t)||t}
            </option>`)}
        </select>
      </div>
    `}_selectedGroupEntities(){var e,t;return(null===(e=this._selectedCube())||void 0===e?void 0:e.group.entities)||(null===(t=this._plan.groups[0])||void 0===t?void 0:t.entities)||[]}async _saveGroup(e,t){try{this._book=await((e,t,i)=>e.callWS({type:"scheduler/device_book/group",group:t,devices:i}))(this.hass,e,t),this._newGroup=""}catch(e){this._reportError(e)}}async _nameDevice(e,t){try{this._book=await((e,t,i)=>e.callWS(Object.assign({type:"scheduler/device_book/device",entity_id:t},i)))(this.hass,e,t)}catch(e){this._reportError(e)}}_useGroup(e){const t=this._selectedCube(),i=(null==t?void 0:t.group)||this._plan.groups[0];if(!i)return;const s=Go(this._book,e);this._setMembers(i,[...new Set([...i.entities,...s])])}_renderMissingAnchors(){return R`
      <div class="empty">
        <div class="empty-title">${this._t("error.no_anchor")}</div>
        <div class="empty-body">
          ${this._t("error.no_anchor_hint",["{start}","{end}"],[To,Mo])}
        </div>
      </div>
    `}_renderBand(){return R`
      <div class="band">
        <div class="ruler">
          ${this._hourTicks().map(e=>R`<span class="tick" style="inset-inline-start:${(100*e.at).toFixed(3)}%">${e.label}</span>`)}
        </div>

        ${this._plan.groups.map(e=>this._renderGroupRow(e))}
        ${this._plan.detaches.map(e=>this._renderDetachRow(e))}

        <div class="row-actions">
          <button class="ghost" @click=${this._addGroup}>
            <ha-svg-icon .path=${Xs}></ha-svg-icon>${this._t("group.add")}
          </button>
        </div>
      </div>
    `}_renderGroupRow(e){return R`
      <div class="row">
        <div class="row-label">
          <span class="row-name">${e.name}</span>
          <span class="row-meta">${this._t("group.members","{n}",String(e.entities.length))}</span>
        </div>
        <div
          class="track"
          @pointermove=${this._handleDragMove}
          @pointerup=${this._handleDragEnd}
          @pointercancel=${this._handleDragEnd}
        >
          ${e.cubes.map(t=>this._renderCube(e,t))}
          ${e.cubes.slice(1).map((t,i)=>this._renderHandle(e,i+1,t))}
        </div>
      </div>
    `}_renderHandle(e,t,i){const s=this._position(i.start);return null===s?q:R`
      <div
        class="handle"
        style="inset-inline-start:${(100*s).toFixed(3)}%"
        title=${this._formatMoment(i.start)}
        @pointerdown=${i=>this._handleDragStart(i,e.track,t)}
        @pointermove=${this._handleDragMove}
        @pointerup=${this._handleDragEnd}
      ></div>
    `}_cubeTone(e){const t=Object.values(e.devices||{});if(!t.length)return"empty";const i=t.filter(Ba).length;return i===t.length?"off":0===i?"on":"mixed"}_cubeStyle(e){if(e.color)return`background:${e.color};color:#fff`;if(this._plainColours)return"";const t=Object.values(e.devices||{}),i=t.filter(e=>!Ba(e));if(i.length===t.length&&i.length){const e=eo(i[0]);if(e){const[t,i,s]=e.rgb;return`background:rgba(${t},${i},${s},${e.alpha})`}}return""}_renderCube(e,t){const i=this._position(t.start),s=this._position(t.stop);if(null===i||null===s||s<=i)return q;const a=this._cubeTone(t),o=this._selected==t.id;return R`
      <button
        class="cube tone-${a} ${this._plainColours?"plain":""} ${o?"selected":""}"
        style="inset-inline-start:${(100*i).toFixed(3)}%;width:${(100*(s-i)).toFixed(3)}%;${this._cubeStyle(t)}"
        title="${this._formatMoment(t.start)} – ${this._formatMoment(t.stop)}"
        @click=${()=>{this._selected=t.id}}
      >
        <span class="cube-name">${t.name||this._t("cube.unnamed")}</span>
        ${o?R`
        <span class="cube-tools">
          <span
            class="cube-tool"
            title=${this._t("cube.split")}
            @click=${i=>{i.stopPropagation(),this._splitCube(e,t)}}
          ><ha-svg-icon .path=${Xs}></ha-svg-icon></span>
          ${e.cubes.length>1?R`
          <span
            class="cube-tool"
            title=${ns("ui.common.delete",this.hass)}
            @click=${i=>{i.stopPropagation(),this._removeCube(e,t)}}
          ><ha-svg-icon .path=${Bs}></ha-svg-icon></span>`:q}
        </span>`:q}
      </button>
    `}_renderDetachRow(e){var t;const i=this._position(e.start),s=this._position(e.stop),a=(null===(t=this.hass.states[e.entity])||void 0===t?void 0:t.attributes.friendly_name)||e.entity;return R`
      <div class="row detached">
        <div class="row-label">
          <span class="row-name">${a}</span>
          <span class="row-meta">${this._t("detach.row")}</span>
        </div>
        <div class="track">
          ${null===i||null===s||s<=i?q:R`
          <button
            class="cube detach ${this._selected==e.track?"selected":""}"
            style="inset-inline-start:${(100*i).toFixed(3)}%;width:${(100*(s-i)).toFixed(3)}%"
            title="${this._formatMoment(e.start)} – ${this._formatMoment(e.stop)}"
            @click=${()=>{this._selected=e.track}}
          >
            <span class="cube-name">${e.name||this._t("detach.name")}</span>
          </button>
        `}
        </div>
      </div>
    `}_renderInspector(){const e=this._selectedCube(),t=this._selectedDetach();if(t)return this._renderDetachInspector(t);if(!e)return q;const{group:i,cube:s}=e;return R`
      <div class="inspector">
        <div class="inspector-head">
          <input
            class="cube-title"
            .value=${s.name}
            placeholder=${this._t("cube.unnamed")}
            @input=${e=>this._updateCube(i.track,s.id,{name:e.target.value})}
          />
          <div class="inspector-actions">
            ${this._helpFor("cube")}
            <button class="ghost" @click=${()=>this._splitCube(i,s)}>
              <ha-svg-icon .path=${"M14,4L16.29,6.29L13.41,9.17L14.83,10.59L17.71,7.71L20,10V4M10,4H4V10L6.29,7.71L11,12.41V20H13V11.59L7.71,6.29"}></ha-svg-icon>${this._t("cube.split")}
            </button>
            <button
              class="ghost danger"
              ?disabled=${i.cubes.length<2}
              @click=${()=>this._removeCube(i,s)}
            >
              <ha-svg-icon .path=${Ys}></ha-svg-icon>${ns("ui.common.delete",this.hass)}
            </button>
          </div>
        </div>

        ${this._helpText("cube")}

        <div class="fields">
          ${this._renderStartField(i,s)}
          ${this._renderBoundaryField(this._t("boundary.to"),s.stop,e=>this._setCubeEnd(i,s,e))}
          ${this._nextCube(i,s)?R`<span class="hint spans">
              ${this._t("boundary.pushes","{name}",this._nextCube(i,s).name||this._t("cube.unnamed"))}
            </span>`:q}
          ${this._renderAllDevicesField(i,s)}
          ${this._renderColorField(s.color,e=>this._updateCube(i.track,s.id,{color:e}))}
          ${this._renderEnforceField(s.enforce,e=>this._updateCube(i.track,s.id,{enforce:e}))}
        </div>

        ${this._renderOverrides(i,s)}

        <div class="members">
          <label>${this._t("group.devices")}${this._helpFor("group")}</label>
          ${this._helpText("group")}
          ${this._book.groups.length?R`
          <div class="member-chips">
            ${this._book.groups.map(e=>R`
              <button class="chip" @click=${()=>this._useGroup(e.name)}>
                <ha-svg-icon .path=${Xs}></ha-svg-icon>${e.name}
                <span class="chip-action">
                  ${this._t("group.members","{n}",String(e.devices.length))}
                </span>
              </button>`)}
          </div>`:q}
          ${this._book.devices.length?R`
          <div class="member-chips">
            ${this._book.devices.map(e=>{var t;const s=i.entities.includes(e.entity_id);return R`
              <button
                class="chip device ${s?"on":""}"
                @click=${()=>this._setMembers(i,s?i.entities.filter(t=>t!=e.entity_id):[...i.entities,e.entity_id])}
              >
                <span class="device-dot ${s?"":"none"}"></span>
                ${e.alias||(null===(t=this.hass.states[e.entity_id])||void 0===t?void 0:t.attributes.friendly_name)||e.entity_id}
              </button>`})}
          </div>`:q}
          <button class="ghost small" @click=${()=>{this._membersAdvanced=!this._membersAdvanced}}>
            ${this._t(this._membersAdvanced?"wizard.devices.simple":"wizard.devices.advanced")}
          </button>
          ${this._membersAdvanced?R`
          <scheduler-entity-picker
            .hass=${this.hass}
            .config=${this._params.cardConfig}
            .value=${i.entities}
            multiple
            @value-changed=${e=>this._setMembers(i,e.detail.value)}
          ></scheduler-entity-picker>`:q}
          ${i.entities.length?R`
          <span class="hint">${this._t("detach.hint")}</span>
          <div class="member-chips">
            ${i.entities.map(e=>{var t;return R`
              <button class="chip" @click=${()=>this._detachDevice(i,e)}>
                ${(null===(t=this.hass.states[e])||void 0===t?void 0:t.attributes.friendly_name)||e}
                <span class="chip-action">${this._t("detach.action")}</span>
              </button>
            `})}
          </div>`:q}
          ${this._plan.groups.length>1?R`<button class="ghost danger" @click=${()=>this._removeGroup(i.track)}>
              ${this._t("group.remove")}
            </button>`:q}
        </div>
      </div>
    `}_renderDetachInspector(e){var t;const i=(null===(t=this.hass.states[e.entity])||void 0===t?void 0:t.attributes.friendly_name)||e.entity;return R`
      <div class="inspector detached">
        <div class="inspector-head">
          <input
            class="cube-title"
            .value=${e.name}
            placeholder=${this._t("detach.name")}
            @input=${t=>this._updateDetach(e.track,{name:t.target.value})}
          />
          <div class="inspector-actions">
            <button class="ghost" @click=${()=>this._rejoinGroup(e.track)}>
              <ha-svg-icon .path=${"M13.5,7A6.5,6.5 0 0,1 20,13.5A6.5,6.5 0 0,1 13.5,20H10V18H13.5C16,18 18,16 18,13.5C18,11 16,9 13.5,9H7.83L10.91,12.09L9.5,13.5L4,8L9.5,2.5L10.92,3.91L7.83,7H13.5M6,18H8V20H6V18Z"}></ha-svg-icon>${this._t("detach.rejoin")}
            </button>
          </div>
        </div>
        <div class="detach-note">${this._t("detach.note","{device}",i)}</div>

        <div class="fields">
          ${this._renderBoundaryField(this._t("boundary.from"),e.start,t=>this._updateDetach(e.track,{start:t}))}
          ${this._renderBoundaryField(this._t("boundary.to"),e.stop,t=>this._updateDetach(e.track,{stop:t}))}
          ${this._renderStateField(Ba(e.action),t=>this._updateDetach(e.track,{action:Object.assign(Object.assign({},e.action),{service:`${e.action.service.split(".")[0]}.${t?"turn_off":"turn_on"}`})}))}
          ${this._renderLightFields(e.action,t=>this._updateDetach(e.track,{action:t}))}
          <label class="field once">
            <span class="field-label">${this._t("detach.once")}</span>
            <input
              type="date"
              .value=${e.end_date||""}
              @change=${t=>{const i=t.target.value||void 0;this._updateDetach(e.track,{start_date:i,end_date:i})}}
            />
            <span class="field-resolved">${this._t("detach.once_hint")}</span>
          </label>
        </div>
      </div>
    `}_anchorOptions(e){var t;const i=[{value:this._plan.startAnchor,label:this._t("anchor.opens")},{value:this._plan.endAnchor,label:this._t("anchor.closes")}];return e&&!i.some(t=>t.value==e)&&i.push({value:e,label:(null===(t=this.hass.states[e])||void 0===t?void 0:t.attributes.friendly_name)||e}),i.push({value:"",label:this._t("anchor.fixed")}),i}_renderStartField(e,t){const i=e.cubes.findIndex(e=>e.id==t.id),s=e.cubes[i-1];return R`
      <div class="field">
        <span class="field-label">${this._t("boundary.from")}</span>
        <span class="field-value fixed">${this._formatMoment(t.start)}</span>
        <span class="field-resolved">
          ${s?this._t("boundary.starts_after","{name}",s.name||this._t("cube.unnamed")):this._t("boundary.starts_open")}
        </span>
      </div>
    `}_nextCube(e,t){return e.cubes[e.cubes.findIndex(e=>e.id==t.id)+1]}_setCubeEnd(e,t,i){const s=e.cubes.findIndex(e=>e.id==t.id);s<0||(s+1<e.cubes.length?this._moveBoundary(e.track,s+1,i,`end:${e.track}:${s}`):this._setCubes(e.track,e.cubes.map((e,t)=>t==s?Object.assign(Object.assign({},e),{stop:i}):e),`end:${e.track}:${s}`))}_renderBoundaryField(e,t,i){const s=this._boundaryParts(t),a=e=>i(this._boundaryString(Object.assign(Object.assign({},s),e))),o=[{value:"exact",label:this._t("boundary.exact")},{value:"offset",label:this._t("boundary.offset")},{value:"clock",label:this._t("boundary.clock")}];return R`
      <div class="field boundary">
        <span class="field-label">${e}</span>

        <select
          class="anchor-select"
          @change=${e=>{const t=e.target.value;a({anchor:t,mode:t?s.mode:"clock"})}}
        >
          ${this._anchorOptions(s.anchor).map(e=>R`<option value=${e.value} ?selected=${e.value==s.anchor}>${e.label}</option>`)}
        </select>

        ${s.anchor?R`
        <div class="segmented modes">
          ${o.map(e=>R`
            <button
              class=${s.mode==e.value?"active":""}
              @click=${()=>a({mode:e.value})}
            >${e.label}</button>`)}
        </div>`:q}

        ${s.anchor&&"exact"==s.mode?q:R`
        <div class="field-row">
          ${s.anchor&&"offset"==s.mode?R`
          <button
            class="sign ${s.before?"before":"after"}"
            @click=${()=>a({before:!s.before})}
          >${s.before?this._t("boundary.before"):this._t("boundary.after")}</button>`:q}
          <input
            type="time"
            class="time-input"
            .value=${`${String(s.hours).padStart(2,"0")}:${String(s.minutes).padStart(2,"0")}`}
            @change=${e=>{const[t,i]=e.target.value.split(":").map(Number);a({hours:t||0,minutes:i||0})}}
          />
        </div>`}

        <span class="field-resolved">→ ${this._formatMoment(t)}</span>
      </div>
    `}_renderStateField(e,t){return R`
      <div class="field">
        <span class="field-label">${this._t("state.label")}</span>
        <div class="segmented">
          <button class="${e?"":"active"}" @click=${()=>t(!1)}>${this._t("state.on")}</button>
          <button class="${e?"active":""}" @click=${()=>t(!0)}>${this._t("state.off")}</button>
        </div>
      </div>
    `}_renderOverrides(e,t){return e.entities.length?R`
      <div class="overrides">
        <label>${this._t("override.label")}${this._helpFor("devices")}</label>
        ${this._helpText("devices")}
        <div class="device-rows">
          ${e.entities.map(i=>this._renderDeviceRow(e,t,i))}
        </div>
        <span class="hint">${this._t("override.hint")}</span>
      </div>
    `:q}_renderDeviceRow(e,t,i){return this._deviceRow(i,Ho(t,i),s=>this._setDeviceAction(e,t,i,s),()=>this._clearDeviceAction(e,t,i))}_deviceRow(e,t,i,s){var a;const o=e.split(".")[0],n=!t,r=!!t&&Ba(t),d=t||qo(e,!0),l=e=>i(Object.assign(Object.assign({},d),e));return R`
      <div class="device-row ${n?"untouched":""}">
        <span class="device-label">
          <span class="device-dot ${n?"none":r?"off":"on"}"></span>
          ${(null===(a=this.hass.states[e])||void 0===a?void 0:a.attributes.friendly_name)||e}
          ${n?R`<em class="follows">${this._t("device.untouched_hint")}</em>`:q}
        </span>

        <div class="segmented states">
          <button class="on ${n||r?"":"active"}" @click=${()=>l({service:o+".turn_on"})}>${this._t("state.on")}</button>
          <button class="off ${!n&&r?"active":""}" @click=${()=>l({service:o+".turn_off",service_data:{}})}>${this._t("state.off")}</button>
          <button class="none ${n?"active":""}" title=${this._t("device.untouched_hint")}
            @click=${s}>${this._t("device.untouched")}</button>
        </div>

        ${n||r?q:this._renderDeviceParameters(o,d,l)}
      </div>
    `}_renderDeviceParameters(e,t,i){var s;const a=t.service_data||{},o=e=>{const t=Object.assign(Object.assign({},a),e);Object.keys(t).forEach(e=>{void 0===t[e]&&delete t[e]}),i({service_data:t})};if("light"==e){const e=null!==(s=a.brightness_pct)&&void 0!==s?s:void 0!==a.brightness?Math.round(a.brightness/255*100):void 0,t=a.color_temp_kelvin;return R`
        <label class="param">
          <input type="checkbox" ?checked=${void 0!==e}
            @change=${e=>o({brightness_pct:e.target.checked?100:void 0,brightness:void 0})} />
          ${this._t("light.brightness")}
          <input type="range" min="1" max="100" .value=${String(null!=e?e:100)}
            ?disabled=${void 0===e}
            @input=${e=>o({brightness_pct:Number(e.target.value),brightness:void 0})} />
          <span class="field-value">${void 0===e?"—":e+"%"}</span>
        </label>
        <label class="param">
          <input type="checkbox" ?checked=${void 0!==t}
            @change=${e=>o({color_temp_kelvin:e.target.checked?2700:void 0})} />
          ${this._t("light.warmth")}
          <input class="kelvin" type="range" min="2000" max="6500" step="100"
            .value=${String(null!=t?t:2700)} ?disabled=${void 0===t}
            @input=${e=>o({color_temp_kelvin:Number(e.target.value)})} />
          <span class="field-value">${void 0===t?"—":t+"K"}</span>
        </label>`}if("climate"==e){const e=a.temperature;return R`
        <label class="param">
          <input type="checkbox" ?checked=${void 0!==e}
            @change=${e=>{const t=e.target.checked;i({service:t?"climate.set_temperature":"climate.turn_on",service_data:t?Object.assign(Object.assign({},a),{temperature:24}):{}})}} />
          ${this._t("climate.degrees")}
          <input type="range" min="16" max="30" step="1"
            .value=${String(null!=e?e:24)} ?disabled=${void 0===e}
            @input=${e=>i({service:"climate.set_temperature",service_data:Object.assign(Object.assign({},a),{temperature:Number(e.target.value)})})} />
          <span class="field-value">${void 0===e?"—":e+"°"}</span>
        </label>`}return q}_setDeviceAction(e,t,i,s){this._updateCube(e.track,t.id,{devices:Object.assign(Object.assign({},t.devices||{}),{[i]:s})})}_clearDeviceAction(e,t,i){const s=Object.assign({},t.devices||{});delete s[i],this._updateCube(e.track,t.id,{devices:s})}_toggleOverride(e,t,i){const s=Ho(t,i);if(!s)return void this._setDeviceAction(e,t,i,qo(i,!0));const a=Ua(s);a?this._setDeviceAction(e,t,i,a):this._clearDeviceAction(e,t,i)}_renderLightFields(e,t){var i;if(Ba(e))return q;const s=e.service_data||{},a=null!==(i=s.brightness_pct)&&void 0!==i?i:void 0!==s.brightness?Math.round(s.brightness/255*100):void 0,o=s.color_temp_kelvin,n=i=>{const a=Object.assign(Object.assign({},s),i);Object.keys(a).forEach(e=>{void 0===a[e]&&delete a[e]}),t(Object.assign(Object.assign({},e),{service_data:a}))};return R`
      <div class="field">
        <span class="field-label">${this._t("light.brightness")}</span>
        <div class="field-row">
          <input
            type="range" min="1" max="100" step="1"
            .value=${String(null!=a?a:100)}
            ?disabled=${void 0===a}
            @input=${e=>n({brightness_pct:Number(e.target.value),brightness:void 0})}
          />
          <span class="field-value">${void 0===a?"—":a+"%"}</span>
          <button
            class="ghost small"
            @click=${()=>n({brightness_pct:void 0===a?100:void 0,brightness:void 0})}
          >${void 0===a?this._t("light.set"):this._t("light.clear")}</button>
        </div>
      </div>

      <div class="field">
        <span class="field-label">${this._t("light.warmth")}</span>
        <div class="field-row">
          <input
            class="kelvin"
            type="range" min="2000" max="6500" step="100"
            .value=${String(null!=o?o:2700)}
            ?disabled=${void 0===o}
            @input=${e=>n({color_temp_kelvin:Number(e.target.value)})}
          />
          <span class="field-value">
            ${void 0===o?"—":`${o}K · ${this._t(o<=3200?"light.warm":o<=4800?"light.neutral":"light.cool")}`}
          </span>
          <button
            class="ghost small"
            @click=${()=>n({color_temp_kelvin:void 0===o?2700:void 0})}
          >${void 0===o?this._t("light.set"):this._t("light.clear")}</button>
        </div>
      </div>
    `}_renderEnforceField(e,t){return R`
      <div class="field">
        <span class="field-label">
          ${this._t("enforce.label")} <span class="beta">${this._t("enforce.beta")}</span>
        </span>
        <div class="segmented">
          <button class=${e?"":"active"} @click=${()=>t(!1)}>
            ${this._t("enforce.off")}
          </button>
          <button class=${e?"active":""} @click=${()=>t(!0)}>
            ${this._t("enforce.on")}
          </button>
        </div>
        <span class="field-resolved">${this._t("enforce.hint")}</span>
      </div>
    `}_renderAllDevicesField(e,t){const i=i=>{const s={};e.entities.forEach(e=>{const t=i(e);t&&(s[e]=t)}),this._updateCube(e.track,t.id,{devices:s})};return R`
      <div class="field">
        <span class="field-label">${this._t("device.all")}</span>
        <div class="segmented states">
          <button class="on" @click=${()=>i(e=>qo(e,!0))}>
            ${this._t("state.on")}
          </button>
          <button class="off" @click=${()=>i(e=>qo(e,!1))}>
            ${this._t("state.off")}
          </button>
          <button class="none" @click=${()=>i(()=>null)}>
            ${this._t("device.untouched")}
          </button>
        </div>
        <span class="field-resolved">${this._t("device.all_hint")}</span>
      </div>
    `}_renderColorField(e,t){return R`
      <div class="field">
        <span class="field-label">${this._t("color.label")}</span>
        <div class="swatches">
          <button
            class="swatch auto ${e?"":"active"}"
            title=${this._t("color.auto")}
            @click=${()=>t(void 0)}
          >A</button>
          ${tn.map(i=>R`
            <button
              class="swatch ${e==i?"active":""}"
              style="background:${i}"
              @click=${()=>t(i)}
            ></button>`)}
        </div>
      </div>
    `}get _wizardSteps(){return["intro","devices","opening","moments","settings","hold","review"]}_momentBoundary(e){const[t,i]=e.time.split(":").map(Number);if("end"==e.when)return this._boundaryString({anchor:this._plan.endAnchor,mode:"offset",hours:t||0,minutes:i||0,before:!1!==e.before});if("sunset"==e.when){const s=e.before?-1:1;return He({mode:we.Sunset,hours:s*(t||0),minutes:s*(i||0)})}const s=(t||0)>=16;return this._boundaryString({anchor:s?this._plan.startAnchor:this._plan.endAnchor,mode:"clock",hours:t||0,minutes:i||0,before:!1})}_momentCaution(e){const t=this._moment(this._momentBoundary(e)),i=this._bandStart,s=this._bandEnd;if(!t||!i||!s)return this._t("wizard.caution.unknown");if(t<=i||t>=s){const t=this._formatMoment(this._momentBoundary(e));return this._t("sunset"==e.when?"wizard.caution.estimate":"wizard.caution.outside","{time}",t)}if("clock"!=e.when)return null;return Math.min((t.getTime()-i.getTime())/36e5,(s.getTime()-t.getTime())/36e5)<1.5?this._t("wizard.caution.tight","{time}",e.time):this._t("wizard.caution.hard","{time}",e.time)}_wizardProblems(){const e=[],t=[],i=this._bandStart,s=this._bandEnd,a=e=>e.name||this._t("cube.unnamed"),o=this._wizard.moments.map(e=>({moment:e,boundary:this._momentBoundary(e),at:this._moment(this._momentBoundary(e))}));o.forEach(({moment:o,boundary:n,at:r})=>{if(!/^\d{1,2}:\d{2}$/.test(o.time||""))return void e.push(this._t("wizard.problem.no_time","{name}",a(o)));if(!r)return void t.push(this._t("wizard.problem.unknown","{name}",a(o)));if(!i||!s||r>i&&r<s)return;const d=this._t("wizard.problem.outside",["{name}","{time}"],[a(o),this._formatMoment(n)]);"sunset"==o.when?t.push(d):e.push(d)});const n=new Map;o.forEach(({moment:e,at:t})=>{if(!t)return;const i=Math.floor(t.getTime()/6e4);n.set(i,[...n.get(i)||[],a(e)])}),n.forEach(t=>{t.length>1&&e.push(this._t("wizard.problem.collide","{names}",t.join(" · ")))});const r=o.filter(e=>"clock"==e.moment.when);return r.length&&t.push(this._t("wizard.problem.hard","{names}",r.map(e=>a(e.moment)).join(" · "))),r.forEach(({moment:e,at:o})=>{if(!o||!i||!s)return;const n=Math.min(o.getTime()-i.getTime(),s.getTime()-o.getTime())/36e5;n>0&&n<1.5&&t.push(this._t("wizard.problem.tight",["{name}","{hours}"],[a(e),n.toFixed(1)]))}),{blocking:e,warnings:t}}_wizardBlocked(e){return"devices"==e?!this._wizard.entities.length:"moments"==e&&this._wizardProblems().blocking.length>0}_wizardTimeline(){const e=this._bandStart,t=this._bandEnd,i=this._wizard.moments.map(i=>{const s=this._momentBoundary(i),a=this._moment(s);return{moment:i,boundary:s,at:a,inside:!!(a&&e&&t&&a>e&&a<t)||!(!a||"sunset"!=i.when)}});return{inside:i.filter(e=>e.inside).sort((e,t)=>e.at.getTime()-t.at.getTime()),outside:i.filter(e=>!e.inside)}}_updateMoment(e,t){this._wizard=Object.assign(Object.assign({},this._wizard),{moments:this._wizard.moments.map(i=>i.id==e?Object.assign(Object.assign({},i),t):i)})}_addMoment(e){const t={id:`m${this._wizard.moments.length}-${(null==e?void 0:e.key)||"new"}`,name:e?this._t("wizard.preset."+e.key):"",when:(null==e?void 0:e.when)||"clock",time:(null==e?void 0:e.time)||"12:00",before:null==e?void 0:e.before,on:!e||e.on};this._wizard=Object.assign(Object.assign({},this._wizard),{moments:[...this._wizard.moments,t]})}_removeMoment(e){this._wizard=Object.assign(Object.assign({},this._wizard),{moments:this._wizard.moments.filter(t=>t.id!=e)})}_renderWizard(){const e=this._wizardSteps[this._wizardStep],t=this._wizardStep==this._wizardSteps.length-1,i=this._wizardBlocked(e);return R`
      <div class="wizard">
        <div class="wizard-progress">
          ${this._wizardSteps.map((e,t)=>R`<span class="dot ${t<=this._wizardStep?"done":""}"></span>`)}
        </div>

        <h2 class="wizard-title">
          ${this._t(`wizard.${e}.title`)}
          <span class="wizard-count">
            ${this._t("wizard.step_of",["{n}","{total}"],[String(this._wizardStep+1),String(this._wizardSteps.length)])}
          </span>
          ${this._helpFor("step_"+e)}
        </h2>
        <p class="wizard-body">${this._t(`wizard.${e}.body`)}</p>
        ${this._helpText("step_"+e)}

        ${"devices"==e?this._renderWizardDevices():q}
        ${"opening"==e?this._renderWizardOpening():q}
        ${"moments"==e?this._renderWizardMoments():q}
        ${"settings"==e?this._renderWizardSettings():q}
        ${"hold"==e?this._renderWizardHold():q}
        ${"review"==e?this._renderWizardReview():q}

        <div class="wizard-buttons">
          <button class="ghost" @click=${()=>{this._wizardStep>0?this._wizardStep=this._wizardStep-1:this._wizardStep=null}}>
            ${this._wizardStep>0?this._t("wizard.back"):ns("ui.common.cancel",this.hass)}
          </button>
          <button
            class="ghost primary"
            ?disabled=${i}
            title=${i?this._t("wizard.blocked"):""}
            @click=${()=>t?this._finishWizard():this._wizardStep=this._wizardStep+1}
          >
            ${t?this._t("wizard.finish"):this._t("wizard.next")}
          </button>
        </div>
      </div>
    `}_renderWizardDevices(){const e=new Set(this._wizard.entities),t=e=>{this._wizard=Object.assign(Object.assign({},this._wizard),{entities:[...new Set(e)]})},i=(e,t)=>{var i;return t||(null===(i=this.hass.states[e])||void 0===i?void 0:i.attributes.friendly_name)||e};return R`
      <div class="wizard-devices">
        ${this._book.groups.length?R`
        <div class="field">
          <span class="field-label">
            ${this._t("wizard.devices.groups")}${this._helpFor("book_groups")}
          </span>
          ${this._helpText("book_groups")}
          <div class="member-chips">
            ${this._book.groups.map(e=>{const i=Go(this._book,e.name);return R`
            <button class="chip" @click=${()=>t([...this._wizard.entities,...i])}>
              <ha-svg-icon .path=${Xs}></ha-svg-icon>${e.name}
              <span class="chip-action">
                ${this._t("group.members","{n}",String(i.length))}
              </span>
            </button>`})}
          </div>
        </div>`:q}

        <div class="field">
          <span class="field-label">
            ${this._t("wizard.devices.book")}${this._helpFor("book_devices")}
          </span>
          ${this._helpText("book_devices")}
          ${this._book.devices.length?R`
          <div class="member-chips">
            ${this._book.devices.map(s=>R`
            <button
              class="chip device ${e.has(s.entity_id)?"on":""}"
              @click=${()=>t(e.has(s.entity_id)?this._wizard.entities.filter(e=>e!=s.entity_id):[...this._wizard.entities,s.entity_id])}
            >
              <span class="device-dot ${e.has(s.entity_id)?"":"none"}"></span>
              ${i(s.entity_id,s.alias)}
            </button>`)}
          </div>`:R`<p class="wizard-empty">${this._t("wizard.devices.no_book")}</p>`}
        </div>

        <button class="ghost small" @click=${()=>{this._wizardAdvanced=!this._wizardAdvanced}}>
          ${this._t(this._wizardAdvanced?"wizard.devices.simple":"wizard.devices.advanced")}
        </button>

        ${this._wizardAdvanced?R`
        <div class="field">
          <span class="field-resolved">${this._t("wizard.devices.advanced_hint")}</span>
          <scheduler-entity-picker
            .hass=${this.hass}
            .config=${this._params.cardConfig}
            .value=${this._wizard.entities}
            multiple
            @value-changed=${e=>t(e.detail.value)}
          ></scheduler-entity-picker>
        </div>`:q}

        <p class="wizard-empty">
          ${this._wizard.entities.length?this._t("wizard.devices.chosen","{n}",String(this._wizard.entities.length)):this._t("wizard.devices.none")}
        </p>
      </div>
    `}_renderWizardOpening(){return R`
      <div class="field">
        <span class="field-label">
          ${this._t("wizard.opening.label")}${this._helpFor("opening")}
        </span>
        ${this._helpText("opening")}
        <div class="segmented big states">
          <button class="on ${this._wizard.onAtCandleLighting?"active":""}"
            @click=${()=>{this._wizard=Object.assign(Object.assign({},this._wizard),{onAtCandleLighting:!0})}}>
            ${this._t("state.on")}
          </button>
          <button class="off ${this._wizard.onAtCandleLighting?"":"active"}"
            @click=${()=>{this._wizard=Object.assign(Object.assign({},this._wizard),{onAtCandleLighting:!1})}}>
            ${this._t("state.off")}
          </button>
        </div>
        <span class="field-resolved">
          ${this._t("wizard.opening.at","{time}",this._formatMoment(this._plan.startAnchor+"+00:00:00"))}
        </span>
      </div>
    `}_renderWizardHold(){var e;const t=null===(e=this._wizard.hold)||void 0===e||e;return R`
      <div class="field">
        <span class="field-label">
          ${this._t("enforce.label")} <span class="beta">${this._t("enforce.beta")}</span>
          ${this._helpFor("hold")}
        </span>
        ${this._helpText("hold")}
        <div class="segmented big">
          <button class=${t?"active":""}
            @click=${()=>{this._wizard=Object.assign(Object.assign({},this._wizard),{hold:!0})}}>
            ${this._t("enforce.on")}
          </button>
          <button class=${t?"":"active"}
            @click=${()=>{this._wizard=Object.assign(Object.assign({},this._wizard),{hold:!1})}}>
            ${this._t("enforce.off")}
          </button>
        </div>
        <span class="field-resolved">${this._t("enforce.hint")}</span>
      </div>
    `}_renderWizardMoments(){const e=new Set(this._wizard.moments.map(e=>e.name)),t=this._prefs.moments.filter(t=>!e.has(this._t("wizard.preset."+t.key)));return R`
      <div class="moment-presets">
        ${t.map(e=>R`
          <button class="chip" @click=${()=>this._addMoment(e)}>
            <ha-svg-icon .path=${Xs}></ha-svg-icon>${this._t("wizard.preset."+e.key)}
          </button>`)}
      </div>

      ${this._wizard.moments.length?R`
      <div class="moments">
        ${this._wizard.moments.map(e=>this._renderWizardMoment(e))}
      </div>`:R`<p class="wizard-empty">${this._t("wizard.moments.empty")}</p>`}

      <button class="ghost" @click=${()=>this._addMoment()}>
        <ha-svg-icon .path=${Xs}></ha-svg-icon>${this._t("wizard.moments.add")}
      </button>

      ${this._renderWizardProblems()}
    `}_renderWizardProblems(){const{blocking:e,warnings:t}=this._wizardProblems();return e.length||t.length?R`
      <div class="wizard-checks">
        ${e.map(e=>R`
        <p class="wizard-warning blocking">
          <span class="mark">✕</span>${e}
        </p>`)}
        ${t.map(e=>R`
        <p class="wizard-warning">
          <span class="mark">⚠</span>${e}
        </p>`)}
      </div>
    `:q}_endPicker(e,t){return R`
      <select
        title=${this._t("wizard.when.hint")}
        @change=${e=>t({when:e.target.value})}
      >
        <option value="clock" ?selected=${"clock"==e.when}>${this._t("wizard.when.clock")}</option>
        <option value="sunset" ?selected=${"sunset"==e.when}>${this._t("wizard.when.sunset")}</option>
        <option value="end" ?selected=${"end"==e.when}>${this._t("wizard.when.end")}</option>
      </select>
      ${"clock"==e.when?q:R`
      <div class="segmented modes">
        <button class=${e.before?"active":""} @click=${()=>t({before:!0})}>
          ${this._t("boundary.before")}
        </button>
        <button class=${e.before?"":"active"} @click=${()=>t({before:!1})}>
          ${this._t("boundary.after")}
        </button>
      </div>`}
      <input
        type="time"
        class="time-input"
        .value=${e.time}
        @change=${e=>t({time:e.target.value})}
      />
    `}_renderWizardMoment(e){const t=this._moment(this._momentBoundary(e)),i=this._momentCaution(e),s=!!(t&&this._bandStart&&this._bandEnd&&(t<=this._bandStart||t>=this._bandEnd)&&"sunset"!=e.when);return R`
      <div class="moment ${s?"wrong":""}">
        <input
          class="moment-name"
          .value=${e.name}
          placeholder=${this._t("wizard.moments.name")}
          @input=${t=>this._updateMoment(e.id,{name:t.target.value})}
        />
        ${this._endPicker(e,t=>this._updateMoment(e.id,t))}
        <div class="segmented states">
          <button class="on ${e.on?"active":""}"
            @click=${()=>this._updateMoment(e.id,{on:!0})}>
            ${this._t("state.on")}
          </button>
          <button class="off ${e.on?"":"active"}"
            @click=${()=>this._updateMoment(e.id,{on:!1})}>
            ${this._t("state.off")}
          </button>
        </div>
        <span class="moment-at">${t?this._formatMoment(this._momentBoundary(e)):"—"}</span>
        ${i?R`<span class="moment-caution ${s?"wrong":""}" title=${i}>
            ${s?"✕":"⚠"}
          </span>`:q}
        <button class="icon-only" title=${ns("ui.common.delete",this.hass)}
          @click=${()=>this._removeMoment(e.id)}>
          <ha-svg-icon .path=${Bs}></ha-svg-icon>
        </button>
      </div>
    `}_renderWizardSettings(){const e=this._wizardTimeline().inside,t=e=>e.split(".")[0],i=[{id:"",name:this._t("cube.welcome"),on:this._wizard.onAtCandleLighting,overrides:this._wizard.openingOverrides,at:this._plan.startAnchor+"+00:00:00"},...e.map(e=>({id:e.moment.id,name:e.moment.name||this._t("cube.unnamed"),on:e.moment.on,overrides:e.moment.overrides,at:e.boundary}))];return R`
      <div class="wizard-settings">
        ${i.map(e=>R`
        <div class="wizard-moment">
          <div class="wizard-moment-head">
            <span class="review-name">${e.name}</span>
            <span class="review-at">${this._formatMoment(e.at)}</span>
            <div class="segmented states">
              <button class="on ${e.on?"active":""}"
                @click=${()=>this._setMomentDefault(e.id,!0)}>${this._t("state.on")}</button>
              <button class="off ${e.on?"":"active"}"
                @click=${()=>this._setMomentDefault(e.id,!1)}>${this._t("state.off")}</button>
            </div>
          </div>
          <div class="device-rows">
            ${this._wizard.entities.map(i=>{var s;const a=null===(s=e.overrides)||void 0===s?void 0:s[i];return this._deviceRow(i,a||((e,i)=>({service:`${t(i)}.turn_${e?"on":"off"}`,service_data:{}}))(e.on,i),t=>this._setMomentDevice(e.id,i,t),()=>this._setMomentDevice(e.id,i,null))})}
          </div>
        </div>`)}
      </div>
    `}_setMomentDefault(e,t){e?this._updateMoment(e,{on:t}):this._wizard=Object.assign(Object.assign({},this._wizard),{onAtCandleLighting:t})}_setMomentDevice(e,t,i){const s=e=>{const s=Object.assign({},e||{});return i?s[t]=i:delete s[t],Object.keys(s).length?s:void 0};if(!e)return void(this._wizard=Object.assign(Object.assign({},this._wizard),{openingOverrides:s(this._wizard.openingOverrides)}));const a=this._wizard.moments.find(t=>t.id==e);this._updateMoment(e,{overrides:s(null==a?void 0:a.overrides)})}_renderWizardReview(){const{inside:e,outside:t}=this._wizardTimeline(),i=this._t(this._wizard.onAtCandleLighting?"state.on":"state.off");return R`
      <ol class="review">
        <li>
          <span class="review-at">${this._formatMoment(this._plan.startAnchor+"+00:00:00")}</span>
          <span class="review-name">${this._t("cube.welcome")}</span>
          <span class="review-state ${this._wizard.onAtCandleLighting?"on":"off"}">${i}</span>
        </li>
        ${e.map(e=>R`
        <li>
          <span class="review-at">${this._formatMoment(e.boundary)}</span>
          <span class="review-name">${e.moment.name||this._t("cube.unnamed")}</span>
          <span class="review-state ${e.moment.on?"on":"off"}">
            ${this._t(e.moment.on?"state.on":"state.off")}
          </span>
        </li>`)}
        <li class="review-end">
          <span class="review-at">${this._formatMoment(this._plan.endAnchor+"+00:00:00")}</span>
          <span class="review-name">${this._t("anchor.closes")}</span>
        </li>
      </ol>

      ${t.length?R`<p class="wizard-warning">
            <span class="mark">⚠</span>
            ${this._t("wizard.review.outside","{names}",t.map(e=>e.moment.name||this._t("cube.unnamed")).join(", "))}
          </p>`:q}

      ${this._renderWizardProblems()}
    `}_finishWizard(){const e=this._wizard,t=[{at:this._plan.startAnchor+"+00:00:00",on:e.onAtCandleLighting,name:this._t("cube.welcome"),overrides:e.openingOverrides},...this._wizardTimeline().inside.map(e=>({at:e.boundary,on:e.moment.on,name:e.moment.name||this._t("cube.unnamed"),overrides:e.moment.overrides}))],i=Po(this._t("group.default")),s=t.map((s,a)=>{var o;const n={};return e.entities.forEach(e=>{var t;n[e]=(null===(t=s.overrides)||void 0===t?void 0:t[e])||((e,t)=>qo(t,e))(s.on,e)}),{id:`${i}#${a}`,name:s.name,start:s.at,stop:a+1<t.length?t[a+1].at:this._plan.endAnchor+"+01:30:00",devices:n,enforce:null===(o=e.hold)||void 0===o||o}});this._updatePlan({groups:[{track:i,name:this._t("group.default"),entities:e.entities,cubes:s}],detaches:[]}),this._selected=s[0].id,this._wizardStep=null,this._offerWizard=!1}static get styles(){return r`
      :host {
        --plan-radius: 14px;
        --plan-on: var(--rgb-state-active-color, 67, 160, 71);
        --plan-off: var(--rgb-secondary-text-color, 114, 114, 114);
        --plan-detach: 245, 158, 11;
      }
      ha-dialog {
        --dialog-content-padding: 0px;
        --dialog-surface-padding: 0px;
      }
      .content {
        padding: 20px 24px 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }

      /* --- header --- */
      .plan-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .plan-title { display: flex; align-items: center; gap: 8px; }
      .plan-name {
        font-size: 24px;
        font-weight: 600;
        letter-spacing: -0.01em;
        color: var(--primary-text-color);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 2px 0;
        min-width: 180px;
        outline: none;
      }
      .plan-name:hover { border-bottom-color: var(--divider-color); }
      .plan-name:focus { border-bottom-color: var(--primary-color); }

      .anchors { display: flex; align-items: center; gap: 12px; }
      .anchor {
        display: flex;
        flex-direction: column;
        padding: 8px 14px;
        border-radius: 999px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.09);
      }
      .anchor-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .anchor-value {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        font-variant-numeric: tabular-nums;
      }
      /* reads the same whichever way the page runs */
      .anchor-arrow {
        width: 28px;
        height: 2px;
        border-radius: 2px;
        background: repeating-linear-gradient(
          to right,
          rgba(var(--rgb-primary-color, 3, 169, 244), 0.5) 0 4px,
          transparent 4px 8px
        );
      }

      /* --- the offer and the help --- */
      .offer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        padding: 12px 16px;
        border-radius: var(--plan-radius);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08);
        font-size: 14px;
        color: var(--primary-text-color);
      }
      .offer-actions { display: flex; gap: 8px; }
      .help {
        border-inline-start: 3px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
        border-radius: 8px;
        padding: 12px 16px;
        font-size: 13px;
        line-height: 1.6;
        color: var(--primary-text-color);
      }
      .help p { margin: 0 0 8px 0; }
      .help p:last-child { margin-bottom: 0; }

      /* the answer to a "?" asked somewhere in particular */
      .help-toggle { --mdc-icon-size: 16px; }
      .help-toggle ha-svg-icon { width: 16px; height: 16px; }
      .help-toggle.active { color: var(--primary-color); }
      .help-note {
        align-self: stretch;
        margin: 0;
        padding: 10px 14px;
        border-inline-start: 3px solid var(--primary-color);
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.06);
        border-radius: 8px;
        font-size: 13px;
        line-height: 1.65;
        color: var(--primary-text-color);
        max-width: 62ch;
      }

      /* --- the band --- */
      .band {
        border-radius: var(--plan-radius);
        padding: 12px 14px 14px 14px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .ruler {
        position: relative;
        height: 18px;
        margin-inline-start: 132px;
        border-bottom: 1px solid var(--divider-color);
      }
      .tick {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        font-size: 11px;
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
      }
      .row { display: flex; align-items: stretch; gap: 8px; min-height: 52px; }
      .row-label {
        width: 124px;
        flex: 0 0 124px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
      }
      .row-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .row-meta { font-size: 11px; color: var(--secondary-text-color); }
      .track {
        position: relative;
        flex: 1;
        border-radius: 10px;
        touch-action: none;
        background: repeating-linear-gradient(
          to right,
          rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.05) 0 1px,
          transparent 1px 60px
        );
      }
      .row.detached .track {
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.04);
        border: 1px dashed var(--divider-color);
      }

      .cube {
        position: absolute;
        top: 4px;
        bottom: 4px;
        border: none;
        border-radius: 10px;
        padding: 0 8px;
        cursor: pointer;
        font: inherit;
        color: var(--text-primary-color, #fff);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        overflow: hidden;
        transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
      }
      .cube:hover { filter: brightness(1.06); }
      /* plain on/off: unmistakable at a glance, not a matter of shade */
      .cube.tone-on { background: linear-gradient(160deg, rgba(var(--plan-on), 0.95), rgba(var(--plan-on), 0.78)); }
      .cube.tone-off { background: linear-gradient(160deg, rgba(var(--plan-off), 0.5), rgba(var(--plan-off), 0.34)); }
      .cube.tone-mixed {
        background: repeating-linear-gradient(
          135deg,
          rgba(var(--plan-on), 0.85) 0 10px,
          rgba(var(--plan-off), 0.5) 10px 20px
        );
      }
      .cube.tone-empty {
        background: repeating-linear-gradient(
          135deg,
          rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.18) 0 6px,
          transparent 6px 12px
        );
        color: var(--secondary-text-color);
        border: 1px dashed var(--divider-color);
      }
      :host([plain]) .segmented button.on.active { background: rgb(var(--plan-on)); }
      :host([plain]) .segmented button.off.active { background: rgba(var(--plan-off), 0.85); }
      .segmented button.none.active {
        background: repeating-linear-gradient(
          135deg,
          var(--divider-color) 0 5px,
          transparent 5px 10px
        );
        color: var(--secondary-text-color);
      }
      .device-row.untouched { opacity: 0.62; border-style: dashed; }
      .device-row.untouched .device-label { color: var(--secondary-text-color); }
      .device-dot.none {
        background: transparent;
        border: 1px dashed var(--secondary-text-color);
      }
      :host([plain]) .device-dot.on { background: rgb(var(--plan-on)); }
      :host([plain]) .device-dot.off { background: rgba(var(--plan-off), 0.55); }
      .report-device.untouched {
        background: transparent;
        border: 1px dashed var(--divider-color);
        color: var(--secondary-text-color);
      }

      .cube.on {
        background: linear-gradient(160deg, rgba(var(--plan-on), 0.95), rgba(var(--plan-on), 0.75));
      }
      .cube.off {
        background: linear-gradient(160deg, rgba(var(--plan-off), 0.55), rgba(var(--plan-off), 0.38));
      }
      .cube.detach {
        background: linear-gradient(160deg, rgba(var(--plan-detach), 0.95), rgba(var(--plan-detach), 0.7));
        color: #1a1200;
      }
      .cube.selected {
        box-shadow: 0 0 0 2px var(--card-background-color), 0 0 0 4px var(--primary-color);
        transform: translateY(-1px);
      }
      .cube-name {
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cube-tools { display: inline-flex; gap: 2px; flex: 0 0 auto; }
      .cube-tool {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 6px;
        background: rgba(0, 0, 0, 0.22);
      }
      .cube-tool:hover { background: rgba(0, 0, 0, 0.38); }
      .cube-tool ha-svg-icon { --mdc-icon-size: 14px; width: 14px; height: 14px; }

      /* the grab line between two stretches, as on the ordinary time bar */
      .handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 14px;
        margin-inline-start: -7px;
        cursor: ew-resize;
        touch-action: none;
        z-index: 2;
      }
      .handle::after {
        content: '';
        position: absolute;
        top: 8px;
        bottom: 8px;
        inset-inline-start: 6px;
        width: 2px;
        border-radius: 2px;
        background: transparent;
      }
      .handle:hover::after { background: rgba(255, 255, 255, 0.85); }

      .row-actions { margin-inline-start: 132px; }

      /* --- inspector --- */
      .inspector {
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.03);
      }
      .inspector.detached {
        background: rgba(var(--plan-detach), 0.06);
        border-color: rgba(var(--plan-detach), 0.35);
      }
      .inspector-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cube-title {
        font-size: 18px;
        font-weight: 600;
        color: var(--primary-text-color);
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 2px 0;
        outline: none;
        min-width: 160px;
      }
      .cube-title:hover { border-bottom-color: var(--divider-color); }
      .cube-title:focus { border-bottom-color: var(--primary-color); }
      .inspector-actions { display: flex; gap: 8px; }
      .detach-note { font-size: 13px; color: var(--secondary-text-color); margin-top: -8px; }
      .hint { font-size: 12px; color: var(--secondary-text-color); }

      .fields { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field.boundary {
        padding: 10px 12px;
        border-radius: 10px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
      }
      .field-label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .field-row { display: flex; gap: 6px; align-items: center; }
      .field-resolved {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      select, input[type="time"], input[type="date"] {
        font: inherit;
        font-size: 13px;
        color: var(--primary-text-color);
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 7px 9px;
        outline: none;
      }
      select:focus, input:focus { border-color: var(--primary-color); }
      .time-input { font-variant-numeric: tabular-nums; }

      .segmented {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
        align-self: flex-start;
      }
      .segmented button {
        font: inherit;
        font-size: 13px;
        border: none;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
        padding: 7px 12px;
        cursor: pointer;
        white-space: nowrap;
      }
      .segmented button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-weight: 600;
      }
      .segmented.big button { font-size: 15px; padding: 12px 28px; }
      .segmented.modes button { font-size: 12px; padding: 6px 10px; }
      .sign {
        font: inherit;
        font-size: 13px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        padding: 7px 10px;
        cursor: pointer;
      }

      .overrides { display: flex; flex-direction: column; gap: 8px; }
      .overrides > label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .device-rows { display: flex; flex-direction: column; gap: 6px; }
      .device-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        padding: 8px 12px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }
      .device-row.own { border-color: rgba(var(--plan-detach), 0.55); }
      .device-label {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 190px;
        font-size: 13px;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .follows { font-style: normal; font-size: 11px; font-weight: 400; color: var(--secondary-text-color); }
      .link {
        font: inherit;
        font-size: 11px;
        font-weight: 600;
        border: none;
        background: none;
        padding: 0;
        cursor: pointer;
        color: rgba(var(--plan-detach), 1);
      }
      .param {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .param input[type="range"] { width: 96px; }
      .chip.device { gap: 8px; }
      .device-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(var(--plan-off), 0.5);
        flex: 0 0 auto;
      }
      .chip.device.on .device-dot { background: rgb(var(--plan-on)); }
      .chip.device.overridden {
        border-color: rgba(var(--plan-detach), 0.8);
        box-shadow: inset 0 0 0 1px rgba(var(--plan-detach), 0.35);
      }
      .device-state { font-size: 11px; color: var(--secondary-text-color); font-weight: 600; }

      input[type="range"] { width: 150px; accent-color: var(--primary-color); }
      input[type="range"].kelvin {
        accent-color: #ffb060;
        background: linear-gradient(to right, #ffb060, #ffffff);
        border-radius: 999px;
      }
      input[type="range"][disabled] { opacity: 0.35; }
      .field-value {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 72px;
      }
      /* a start is read back, not asked for: the stretch before it decides */
      .field-value.fixed {
        font-size: 15px;
        font-weight: 600;
        color: var(--primary-text-color);
        padding: 6px 0;
      }
      .hint.spans { flex-basis: 100%; max-width: 62ch; }
      .ghost.small { font-size: 11px; padding: 4px 8px; }
      .beta {
        font-size: 9px;
        letter-spacing: 0.04em;
        padding: 1px 5px;
        border-radius: 4px;
        background: rgba(var(--plan-detach), 0.2);
        color: var(--primary-text-color);
      }

      .book {
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        overflow: hidden;
      }
      .book-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
      }
      .book-body { display: flex; flex-wrap: wrap; gap: 20px; padding: 14px 16px; }
      .book-groups { display: flex; flex-direction: column; gap: 6px; min-width: 260px; }
      .book-group {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 8px;
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.06);
      }
      .book-group.new { background: none; border: 1px dashed var(--divider-color); }
      .book-group-name { font-size: 13px; font-weight: 600; flex: 1; }
      .book-group-count { font-size: 11px; color: var(--secondary-text-color); }
      .book-devices { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 280px; }

      .swatches { display: flex; flex-wrap: wrap; gap: 6px; max-width: 240px; }

      /* --- shortcuts and the report --- */
      .keys {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 6px 20px;
        padding: 14px 16px;
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }
      .key-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
      .key-row span { color: var(--secondary-text-color); }
      kbd {
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        min-width: 62px;
        text-align: center;
        padding: 3px 6px;
        border-radius: 6px;
        border: 1px solid var(--divider-color);
        border-bottom-width: 2px;
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.06);
        color: var(--primary-text-color);
      }

      .report {
        border-radius: var(--plan-radius);
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
        overflow: hidden;
      }
      .report-head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--divider-color);
      }
      .report-title { font-size: 15px; font-weight: 600; color: var(--primary-text-color); }
      .report-band {
        flex: 1;
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .report-saved {
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        color: rgb(var(--plan-on));
        background: rgba(var(--plan-on), 0.1);
      }
      .report-problem {
        padding: 10px 16px;
        font-size: 13px;
        color: var(--error-color, #db4437);
        background: rgba(219, 68, 55, 0.08);
      }
      .report-list { list-style: none; margin: 0; padding: 0; }
      .report-list li {
        display: flex;
        gap: 14px;
        padding: 10px 16px;
        border-top: 1px solid var(--divider-color);
      }
      .report-list li:first-child { border-top: none; }
      .report-at {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 96px;
        padding-top: 2px;
      }
      .report-what { display: flex; flex-direction: column; gap: 6px; flex: 1; }
      .report-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .report-group { font-size: 11px; font-weight: 400; color: var(--secondary-text-color); }
      .report-devices { display: flex; flex-wrap: wrap; gap: 6px; }
      .report-device {
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 10px;
        border-radius: 999px;
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.1);
        color: var(--primary-text-color);
      }
      :host([plain]) .report-device.off { background: rgba(var(--plan-off), 0.18); }
      :host([plain]) .report-device.on { background: rgba(var(--plan-on), 0.15); }
      .report-device b { font-weight: 700; }
      .report-device i { font-style: normal; color: var(--secondary-text-color); }
      .report-device em {
        font-style: normal;
        font-size: 11px;
        color: rgba(var(--plan-detach), 1);
        font-weight: 600;
      }
      .icon-only[disabled] { opacity: 0.35; cursor: default; }

      .swatch {
        width: 26px;
        height: 26px;
        border-radius: 8px;
        border: 1px solid var(--divider-color);
        cursor: pointer;
        padding: 0;
        font: inherit;
        font-size: 11px;
        font-weight: 700;
        color: var(--secondary-text-color);
        background: var(--card-background-color);
      }
      .swatch.active { box-shadow: 0 0 0 2px var(--card-background-color), 0 0 0 4px var(--primary-color); }

      .members { display: flex; flex-direction: column; gap: 8px; }
      .members > label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
      }
      .member-chips { display: flex; flex-wrap: wrap; gap: 6px; }
      .chip {
        font: inherit;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 999px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        padding: 5px 12px;
        cursor: pointer;
      }
      .chip:hover { border-color: rgba(var(--plan-detach), 0.8); }
      .chip-action { font-size: 11px; color: rgba(var(--plan-detach), 1); font-weight: 600; }

      .ghost, .icon-only {
        font: inherit;
        font-size: 13px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        background: none;
        color: var(--primary-text-color);
        padding: 6px 12px;
        cursor: pointer;
      }
      .icon-only { padding: 6px; }
      .icon-only.active { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15); }
      .ghost:hover, .icon-only:hover { background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.08); }
      .ghost[disabled] { opacity: 0.4; cursor: default; }
      .ghost.danger { color: var(--error-color, #db4437); }
      .ghost.primary {
        background: var(--primary-color);
        border-color: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-weight: 600;
      }
      .ghost ha-svg-icon, .icon-only ha-svg-icon {
        --mdc-icon-size: 18px;
        width: 18px;
        height: 18px;
      }

      /* --- wizard --- */
      .wizard {
        display: flex;
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
        min-height: 320px;
        padding: 8px 0;
        /* the buttons belong beside the question, not at the far edge of a
           wide dialog */
        width: 100%;
        max-width: 640px;
        margin-inline: auto;
      }
      .wizard-settings {
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 14px;
        max-height: 46vh;
        overflow-y: auto;
      }
      .wizard-moment {
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        padding: 10px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .wizard-moment-head {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .wizard-moment-head .review-name { flex: 1; }
      .wizard-progress { display: flex; gap: 6px; }
      .dot {
        width: 28px;
        height: 4px;
        border-radius: 2px;
        background: var(--divider-color);
      }
      .dot.done { background: var(--primary-color); }
      .wizard-title {
        font-size: 22px;
        font-weight: 600;
        margin: 0;
        color: var(--primary-text-color);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .wizard-count {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        letter-spacing: 0.02em;
      }
      .wizard-devices {
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .wizard-body {
        font-size: 15px;
        line-height: 1.6;
        margin: 0;
        color: var(--secondary-text-color);
        max-width: 52ch;
      }
      .wizard-row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
      .wizard-empty { font-size: 13px; color: var(--secondary-text-color); margin: 0; }
      .wizard-warning {
        font-size: 13px;
        line-height: 1.6;
        margin: 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(var(--plan-detach), 0.12);
        color: var(--primary-text-color);
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .wizard-warning .mark { flex: none; font-weight: 700; }
      /* a blocking problem is not a shade of warning: it stops the wizard */
      .wizard-warning.blocking {
        background: rgba(var(--rgb-error-color, 229, 57, 53), 0.14);
        border-inline-start: 3px solid var(--error-color, #e53935);
      }
      .wizard-warning.blocking .mark { color: var(--error-color, #e53935); }
      .wizard-checks {
        align-self: stretch;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .moment-presets { display: flex; flex-wrap: wrap; gap: 6px; }
      .moment-presets .chip ha-svg-icon {
        --mdc-icon-size: 14px;
        width: 14px;
        height: 14px;
      }
      .moments { display: flex; flex-direction: column; gap: 8px; align-self: stretch; }
      .moment {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px 10px;
        border-radius: 10px;
        border: 1px solid var(--divider-color);
        background: var(--card-background-color);
      }
      .moment-name {
        font: inherit;
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        background: none;
        border: none;
        border-bottom: 1px solid transparent;
        outline: none;
        min-width: 120px;
        flex: 1;
        padding: 4px 0;
      }
      .moment-name:hover { border-bottom-color: var(--divider-color); }
      .moment-name:focus { border-bottom-color: var(--primary-color); }
      .moment-at {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 92px;
      }
      /* a moment that cannot be built is marked as such, where it is typed */
      .moment.wrong {
        border-color: var(--error-color, #e53935);
        background: rgba(var(--rgb-error-color, 229, 57, 53), 0.06);
      }
      .moment-caution {
        font-size: 14px;
        line-height: 1;
        cursor: help;
        color: rgb(var(--plan-detach));
      }
      .moment-caution.wrong { color: var(--error-color, #e53935); font-weight: 700; }
      .moment-fixed-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--primary-text-color);
        min-width: 120px;
        flex: 1;
      }
      .moments.defaults .moment { background: transparent; }

      .review {
        align-self: stretch;
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
      }
      .review li {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-inline-start: 2px solid var(--divider-color);
      }
      .review li:first-child { border-start-start-radius: 8px; }
      .review-at {
        font-size: 12px;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        min-width: 96px;
      }
      .review-name { font-size: 14px; font-weight: 600; flex: 1; color: var(--primary-text-color); }
      .review-state {
        font-size: 12px;
        font-weight: 600;
        padding: 3px 10px;
        border-radius: 999px;
      }
      .review-state {
        background: rgba(var(--rgb-secondary-text-color, 114, 114, 114), 0.12);
        color: var(--secondary-text-color);
      }
      :host([plain]) .review-state.on {
        background: rgba(var(--plan-on), 0.18);
        color: rgb(var(--plan-on));
      }
      :host([plain]) .review-state.off {
        background: rgba(var(--plan-off), 0.18);
        color: var(--secondary-text-color);
      }
      .review-end { opacity: 0.7; }
      .wizard-buttons {
        display: flex;
        gap: 8px;
        margin-top: auto;
        padding-top: 16px;
        align-self: stretch;
        justify-content: space-between;
      }

      .empty {
        border: 1px dashed var(--divider-color);
        border-radius: var(--plan-radius);
        padding: 28px;
        text-align: center;
      }
      .empty-title { font-size: 16px; font-weight: 600; color: var(--primary-text-color); }
      .empty-body { font-size: 13px; color: var(--secondary-text-color); margin-top: 6px; }

      .error { color: var(--error-color, #db4437); font-size: 13px; }
      .buttons {
        box-sizing: border-box;
        display: flex;
        padding: 16px 24px;
        justify-content: space-between;
        border-top: 1px solid var(--divider-color);
      }
    `}};t([le({attribute:!1})],on.prototype,"hass",void 0),t([ce()],on.prototype,"_params",void 0),t([ce()],on.prototype,"_plan",void 0),t([ce()],on.prototype,"_selected",void 0),t([ce()],on.prototype,"_error",void 0),t([ce()],on.prototype,"_help",void 0),t([ce()],on.prototype,"_wizardStep",void 0),t([ce()],on.prototype,"_offerWizard",void 0),t([ce()],on.prototype,"_wizard",void 0),t([ce()],on.prototype,"_wizardAdvanced",void 0),t([ce()],on.prototype,"_history",void 0),t([ce()],on.prototype,"_future",void 0),t([ce()],on.prototype,"_keys",void 0),t([ce()],on.prototype,"_book",void 0),t([ce()],on.prototype,"_bookOpen",void 0),t([ce()],on.prototype,"_newGroup",void 0),t([ce()],on.prototype,"_prefs",void 0),t([ce()],on.prototype,"_plainColours",void 0),t([ce()],on.prototype,"_settingsOpen",void 0),t([ce()],on.prototype,"_helpKey",void 0),t([ce()],on.prototype,"_membersAdvanced",void 0),t([ce()],on.prototype,"_report",void 0),t([ce()],on.prototype,"_saved",void 0),on=t([re("dialog-scheduler-plan")],on);var nn=Object.freeze({__proto__:null,get DialogSchedulerPlan(){return on}});
/**
     * @license
     * Copyright 2017 Google LLC
     * SPDX-License-Identifier: BSD-3-Clause
     */class rn extends oa{constructor(e){if(super(e),this.et=q,e.type!==sa)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===q||null==e)return this.ft=void 0,this.et=e;if(e===H)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.et)return this.ft;this.et=e;const t=[e];return t.raw=t,this.ft={_$litType$:this.constructor.resultType,strings:t,values:[]}}}rn.directiveName="unsafeHTML",rn.resultType=1;const dn=aa(rn);var ln=window&&window.__assign||function(){return(ln=Object.assign||function(e){for(var t,i=1,s=arguments.length;i<s;i++)for(var a in t=arguments[i])Object.prototype.hasOwnProperty.call(t,a)&&(e[a]=t[a]);return e}).apply(this,arguments)};var cn={second:45,minute:45,hour:22,day:5};const hn=(e,t,i)=>{if(i===Pe.am_pm||!i&&t.time_format===Pe.am_pm){const t=Ie(e.getHours()).am_pm;return`${Ie(e.getHours()).hours}:${String(e.getMinutes()).padStart(2,"0")} ${t}`}return i===Pe.twenty_four||!i&&t.time_format===Pe.twenty_four?`${String(e.getHours()).padStart(2,"0")}:${String(e.getMinutes()).padStart(2,"0")}`:(()=>{try{(new Date).toLocaleTimeString("i")}catch(e){return"RangeError"===e.name}return!1})()?e.toLocaleTimeString(t.language,{hour:"numeric",minute:"2-digit",hour12:Le(t)}):Le(t)?hn(e,t,Pe.am_pm):hn(e,t,Pe.twenty_four)};let un=class extends oe{constructor(){super(...arguments),this.updateInterval=60,this.timer=0}startRefreshTimer(e){clearInterval(this.timer),this.timer=window.setInterval(()=>{this.requestUpdate()},1e3*e),this.updateInterval=e}set hass(e){this._hass=e,this.startRefreshTimer(this.updateInterval)}relativeTime(e){if(!this._hass)return"";const t=new Date;let i=(t.getTime()-e.getTime())/1e3;const s=i>=0?"past":"future";i=Math.abs(i);const a=Math.round(i);if("future"==s&&a>0){if(i/3600>=6){const i=t.setHours(0,0,0,0),s=Math.floor((e.valueOf()-i.valueOf())/864e5);let a="";s>14?a=function(e,t){const i=()=>{try{(new Date).toLocaleDateString("i")}catch(e){return"RangeError"===e.name}return!1},s=(e,t)=>{switch(t){case"year":return e.getFullYear();case"month":return bo[e.getMonth()];case"day":return e.getDate()}};return e.getFullYear()==(new Date).getFullYear()?i()?new Intl.DateTimeFormat(t.language,{month:"long",day:"numeric"}).format(e):`${s(e,"month")} ${s(e,"day")}`:i()?new Intl.DateTimeFormat(t.language,{year:"numeric",month:"long",day:"numeric"}).format(e):`${s(e,"month")} ${s(e,"day")}, ${s(e,"year")}`}(e,this._hass.locale):s>7?a=Yi("ui.components.date.next_week_day",this._hass,"{weekday}",Es(e,"long",this._hass)):1==s?a=Yi("ui.components.date.tomorrow",this._hass):s>0&&(a=Es(e,"long",this._hass));let o=Yi("ui.components.time.absolute",this._hass,"{time}",hn(e,this._hass.locale));return 12==e.getHours()&&0==e.getMinutes()?o=Yi("ui.components.time.at_noon",this._hass):0==e.getHours()&&0==e.getMinutes()&&(o=Yi("ui.components.time.at_midnight",this._hass)),String(a+" "+o).trim()}if(Math.round(i/60)>60&&Math.round(i/60)<120){const e=Math.round(i/60-60),t=ns("ui.common.and",this._hass);return`${new Intl.RelativeTimeFormat(this._hass.language,{numeric:"auto"}).format(1,"hour")} ${t} ${Intl.NumberFormat(this._hass.locale.language,{style:"unit",unit:"minute",unitDisplay:"long"}).format(e)}`}if(Math.round(i)>60&&Math.round(i)<120){const e=Math.round(i-60),t=ns("ui.common.and",this._hass);return`${new Intl.RelativeTimeFormat(this._hass.language,{numeric:"auto"}).format(1,"minute")} ${t} ${Intl.NumberFormat(this._hass.locale.language,{style:"unit",unit:"second",unitDisplay:"long"}).format(e)}`}}const o=function(e,t,i){void 0===t&&(t=Date.now()),void 0===i&&(i={});var s=ln(ln({},cn),i||{}),a=(+e-+t)/1e3;if(Math.abs(a)<s.second)return{value:Math.round(a),unit:"second"};var o=a/60;if(Math.abs(o)<s.minute)return{value:Math.round(o),unit:"minute"};var n=a/3600;if(Math.abs(n)<s.hour)return{value:Math.round(n),unit:"hour"};var r=a/86400;if(Math.abs(r)<s.day)return{value:Math.round(r),unit:"day"};var d=new Date(e),l=new Date(t),c=d.getFullYear()-l.getFullYear();if(Math.round(Math.abs(c))>0)return{value:Math.round(c),unit:"year"};var h=12*c+d.getMonth()-l.getMonth();if(Math.round(Math.abs(h))>0)return{value:Math.round(h),unit:"month"};var u=a/604800;return{value:Math.round(u),unit:"week"}}(e);return new Intl.RelativeTimeFormat(this._hass.language,{numeric:"auto"}).format(o.value,o.unit)}render(){if(!this._hass||!this.datetime)return R``;const e=new Date,t=Math.round((this.datetime.valueOf()-e.valueOf())/1e3);let i=60;return Math.abs(t)<=150&&(i=Math.max(Math.ceil(Math.abs(t))/10,2)),this.updateInterval!=i&&this.startRefreshTimer(i),R`
      ${os(this.relativeTime(this.datetime))}
    `}};t([le()],un.prototype,"_hass",void 0),t([le()],un.prototype,"datetime",void 0),un=t([re("scheduler-relative-time")],un);let pn=class extends oe{render(){var e,t,i,s,a;try{const o=this.hass.states[this.schedule.entity_id];if(!o)return R``;const n=["off","completed"].includes(o.state),r=this.schedule.entries[0].slots[this.schedule.next_entries[0]||0].actions[0];let d=Fa(r,this.config.customize);if("entity"==(null===(e=this.config.display_options)||void 0===e?void 0:e.icon)){let e=[(null===(t=r.target)||void 0===t?void 0:t.entity_id)||[]].flat().shift();["script","notify"].includes(Qi(r.service))&&(e=r.service),e&&(d=pa(e,this.config.customize,this.hass))}const l=![(null===(i=r.target)||void 0===i?void 0:i.entity_id)||[]].flat().every(e=>Object.keys(this.hass.states).includes(e));return l&&(d="mdi:help"),R`
      <ha-icon
        icon="${d}"
        @click=${this._handleIconClick}
        class="${n?"disabled":""}"
      ></ha-icon>

      <div
        class="info ${n?"disabled":""} ${l?"defective":""}"
        @click=${this._handleItemClick}
      >
        ${this.renderDisplayItem((null===(s=this.config.display_options)||void 0===s?void 0:s.primary_info)||"default")}
        <div class="secondary">
        ${this.renderDisplayItem((null===(a=this.config.display_options)||void 0===a?void 0:a.secondary_info)||Fe)}
        </div>
      </div>
      <div class="state">
        ${!1!==this.config.show_toggle_switches?R`<ha-switch
              ?checked=${["on","triggered"].includes(o.state||"")}
              ?disabled=${"completed"==o.state}
              @change=${this._toggleEnableDisable}
            ></ha-switch>`:""}
      </div>

    `}catch(e){return R`
        <hui-warning .hass=${this.hass} @click=${this._handleItemClick}>
          <span style="white-space: normal">
            Failed to display schedule ${this.schedule.entity_id}.
            Reason: ${e}
          </span>
        </hui-warning>
      `}}renderDisplayItem(e){const t=e=>{const t=e.split("<relative-time></relative-time>");if(t.length>1){const e=this.schedule.timestamps[this.schedule.next_entries[0]||0];return R`
          ${t[0]?dn(t[0]):""}
          <scheduler-relative-time
            .hass=${this.hass}
            .datetime=${new Date(e)}
          >
          </scheduler-relative-time>
          ${t[1]?dn(t[1]):""}
        `}if(null!==e.match(/^(<tag>[^<]*<\/tag>)+$/)){let t=e.split(/<tag>([^<]*)<\/tag>/).filter(e=>e);return R`
          <div class="tags">
            ${null==t?void 0:t.map(e=>R`<span class="tag">${e}</span>`)}
          </div>`}return dn(e)};return Ps(this.schedule,e,this.hass,this.config.customize).filter(e=>e.length).map(e=>R`${t(e)}<br/>`)}_handleItemClick(e){const t=new CustomEvent("editClick",{detail:{schedule_id:this.schedule_id}});this.dispatchEvent(t)}_handleIconClick(e){const t=new CustomEvent("editClick",{detail:{schedule_id:this.schedule_id}});this.dispatchEvent(t)}_toggleEnableDisable(e){const t=e.target.checked;this.hass.callService("switch",t?"turn_on":"turn_off",{entity_id:this.schedule.entity_id})}static get styles(){return r`
      :host {
        display: flex;
        align-items: center;
        flex-direction: row;
      }
      .info {
        margin-left: 16px;
        margin-right: 8px;
        margin-inline-start: 16px;
        margin-inline-end: 8px;
        flex: 1 1 30%;
        transition: color 0.2s ease-in-out;
        cursor: pointer;
        line-height: var(--ha-line-height-normal);
      }
      .info,
      .info > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .flex ::slotted(*) {
        margin-left: 8px;
        margin-inline-start: 8px;
        margin-inline-end: initial;
        min-width: 0;
      }
      .flex ::slotted([slot="secondary"]) {
        margin-left: 0;
        margin-inline-start: 0;
        margin-inline-end: initial;
      }
      .secondary,
      ha-relative-time {
        color: var(--secondary-text-color);
        transition: color 0.2s ease-in-out;
      }
      .state {
        text-align: var(--float-end);
      }
      .value {
        direction: ltr;
      }
      ha-icon {
        display: flex;
        flex: 0 0 40px;
        color: var(--state-icon-color);
        transition: color 0.2s ease-in-out;
        cursor: pointer;
        align-items: center;
        justify-content: center;
      }
      ha-icon.disabled {
        color: var(--disabled-text-color);
      }
      div.disabled {
        --primary-text-color: var(--disabled-text-color);
        --secondary-text-color: var(--disabled-text-color);
        --state-icon-color: var(--disabled-text-color);
        color: var(--disabled-text-color);
      }
      div.tags {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
      }
      span.tag {
        height: 28px;
        border-radius: 14px;
        background: rgba(var(--rgb-primary-color), 0.40);
        color: var(--primary-text-color);
        line-height: 1.25rem;
        font-size: 0.875rem;
        padding: 0px 12px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
      }
      .defective {
        text-decoration: line-through;
      }
    `}};t([le()],pn.prototype,"hass",void 0),t([le()],pn.prototype,"schedule_id",void 0),t([le()],pn.prototype,"schedule",void 0),t([le()],pn.prototype,"config",void 0),pn=t([re("scheduler-item-row")],pn);const mn=[_e.Sunday,_e.Monday,_e.Tuesday,_e.Wednesday,_e.Thursday,_e.Friday,_e.Saturday],_n=(e,t=new Date)=>{const i=mn[t.getDay()],s=i===_e.Friday||i===_e.Saturday,a=e.findIndex(e=>e.weekdays.includes(i)),o=a>=0?a:e.findIndex(e=>s?e.weekdays.includes(_e.Weekend):e.weekdays.includes(_e.Workday)),n=o>=0?o:e.findIndex(e=>e.weekdays.includes(_e.Daily)),r=n>=0?n:0;return{entry:e[r],index:r}},gn=[_e.Sunday,_e.Monday,_e.Tuesday,_e.Wednesday,_e.Thursday,_e.Friday,_e.Saturday],vn=(e,t)=>{const i=gn[t.getDay()],s=i===_e.Friday||i===_e.Saturday;return!!e.weekdays.includes(_e.Daily)||(!!e.weekdays.includes(i)||(!(!s||!e.weekdays.includes(_e.Weekend))||!(s||!e.weekdays.includes(_e.Workday))))};let fn=null;const bn=e=>{fn=e},yn="scheduler-overview-slot-select";let wn=class extends oe{constructor(){super(...arguments),this.zoom=1,this.panPx=0,this.viewportWidth=0,this.editable=!0,this.selectedSlot=null,this._onExternalSelect=e=>{var t;(null===(t=e.detail)||void 0===t?void 0:t.source)!==this&&null!==this.selectedSlot&&(this.selectedSlot=null,this.dispatchEvent(new CustomEvent("slot-selected",{detail:{index:null},bubbles:!0,composed:!0})))},this._handleKeyDown=e=>{var t,i;if(!this.editable)return;if(null===this.selectedSlot)return;const s="ArrowLeft"===e.key||"ArrowRight"===e.key;if("Delete"!==e.key&&"Backspace"!==e.key&&!s)return;const a=e.composedPath()[0];if(a instanceof HTMLElement&&(["input","textarea","select"].includes(a.tagName.toLowerCase())||a.isContentEditable))return;if(s)return e.preventDefault(),void this._nudgeSelected("ArrowRight"===e.key?1:-1);const o=this._slots;if(o.length<=2)return;const n=this.selectedSlot,r=n===o.length-1?n-1:n;if(void 0===(null===(t=o[r])||void 0===t?void 0:t.stop)||void 0===(null===(i=o[r+1])||void 0===i?void 0:i.stop))return;e.preventDefault();let d=[...o.slice(0,r),Object.assign(Object.assign({},o[r+1]),{start:o[r].start,stop:o[r+1].stop}),...o.slice(r+2)];d=Va(d),this._liveSlots=d,this.selectedSlot=null,this.dispatchEvent(new CustomEvent("slot-selected",{detail:{index:null},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("slots-changed",{detail:{slots:d},bubbles:!0,composed:!0}))}}get _slots(){return this._liveSlots||this.slots}get _contentWidth(){return this.viewportWidth*this.zoom}connectedCallback(){super.connectedCallback(),document.addEventListener(yn,this._onExternalSelect),window.addEventListener("keydown",this._handleKeyDown)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener(yn,this._onExternalSelect),window.removeEventListener("keydown",this._handleKeyDown)}_nudgeSelected(e){var t;const i=this._slots,s=this.selectedSlot,a="rtl"===getComputedStyle(this).direction?e<0:e>0,o=s<i.length-1?s:s-1;if(o<0||!(null===(t=i[o])||void 0===t?void 0:t.stop)||!i[o+1])return;if([we.Sunrise,we.Sunset].includes(De(i[o+1].start).mode))return;const n=60*this._dragStepSize,r=Te(i[o].stop,this.hass),d=o>0?Te(i[o-1].stop||i[o-1].start,this.hass)+n:n,l=(Te(i[o+1].stop||i[o+1].start,this.hass)||86400)-n,c=Math.min(Math.max(r+(a?n:-n),d),l);if(c===r)return;const h={mode:we.Fixed,hours:Math.floor(c/3600),minutes:Math.round(c%3600/60)},u=He(Ee(h,this._dragStepSize)),p=Object.assign([...i],{[o]:Object.assign(Object.assign({},i[o]),{stop:u}),[o+1]:Object.assign(Object.assign({},i[o+1]),{start:u})});this._liveSlots=p,this.dispatchEvent(new CustomEvent("slots-changed",{detail:{slots:p},bubbles:!0,composed:!0}))}updated(e){var t;e.has("slots")&&(this._liveSlots=void 0);const i=null===(t=this.shadowRoot)||void 0===t?void 0:t.querySelector(".content-inner");i&&(i.style.direction=getComputedStyle(this).direction)}_handleWheel(e){if(!this.viewportWidth||!this.editable)return;const t=e.ctrlKey||e.metaKey||Math.abs(e.deltaY)>=Math.abs(e.deltaX);e.preventDefault();const i=e.currentTarget.getBoundingClientRect(),s=e.clientX-i.left;if(t){const t=Math.pow(2,-e.deltaY/60);this.dispatchEvent(new CustomEvent("overview-zoom",{detail:{anchorPx:s,factor:t},bubbles:!0,composed:!0}))}else this.dispatchEvent(new CustomEvent("overview-pan",{detail:{deltaPx:e.deltaX},bubbles:!0,composed:!0}))}_touchDistance(e){const t=e[0].clientX-e[1].clientX,i=e[0].clientY-e[1].clientY;return Math.hypot(t,i)}_handlePinchStart(e){if(2!==e.touches.length)return;e.preventDefault();const t=this.getBoundingClientRect();this._pinch={distance:this._touchDistance(e.touches),midpointX:(e.touches[0].clientX+e.touches[1].clientX)/2-t.left}}_handlePinchMove(e){if(!this._pinch||2!==e.touches.length)return;e.preventDefault();const t=this._touchDistance(e.touches),i=t/this._pinch.distance;this.dispatchEvent(new CustomEvent("overview-zoom",{detail:{anchorPx:this._pinch.midpointX,factor:i},bubbles:!0,composed:!0})),this._pinch.distance=t}_handlePinchEnd(e){e.touches.length<2&&(this._pinch=void 0)}render(){var e;if(!this.hass||!(null===(e=this.slots)||void 0===e?void 0:e.length)||!this.viewportWidth)return R``;const t=this._slots,i=io(t,this.hass,this._contentWidth,2),s=Le(this.hass.locale),{boundaries:a,maxTier:o}=so(t,i,s,2),n="rtl"===getComputedStyle(this).direction?"50%":"-50%",r=15+13*o;return R`
      <div
        class="viewport"
        @wheel=${this._handleWheel}
        @touchstart=${this._handlePinchStart}
        @touchmove=${this._handlePinchMove}
        @touchend=${this._handlePinchEnd}
        @touchcancel=${this._handlePinchEnd}
      >
        <div
          class="zoom-content"
          style=${na({width:this._contentWidth+"px",transform:`translateX(${-this.panPx}px)`})}
        >
          <div class="content-inner">
            <div class="boundaries" style=${na({height:r+"px"})}>
              ${a.map(e=>R`
                <div
                  class="boundary ${e.align}"
                  style=${na(Object.assign(Object.assign({},"end"===e.align?{insetInlineEnd:this._contentWidth-e.position+"px"}:{insetInlineStart:e.position+"px"}),"middle"===e.align?{transform:`translateX(${n})`}:{}))}
                >
                  <span class="boundary-label ${e.state}" style=${na(e.color?{color:e.color}:{})}>${e.label}</span>
                  <span class="boundary-line" style=${na({height:4+13*e.tier+"px"})}></span>
                </div>
              `)}
            </div>
            <div class="bar">
              ${t.map((e,s)=>{const a=e.actions.length?Ba(e.actions[0])?"off":Wa(e.actions[0])?"on":"":"empty",o=e.actions.length?eo(e.actions[0]):null,n=t[s+1];return R`
                  <div
                    class="seg ${a} ${this.selectedSlot===s?"selected":""}"
                    style=${na(Object.assign({width:i[s]+"px"},o?{background:`rgba(${o.rgb.join(", ")}, ${o.alpha})`}:{}))}
                    @pointerdown=${e=>this._handleSegPointerDown(e,s)}
                  ></div>
                  ${s<t.length-1&&e.stop?R`
                    <div
                      class="handle ${this.selectedSlot===s||this.selectedSlot===s+1?"":"hidden"} ${n&&!n.stop?"center":""}"
                      @mousedown=${e=>this._handleDragStart(e,s)}
                      @touchstart=${e=>this._handleDragStart(e,s)}
                    >
                      <span><ha-svg-icon .path=${Js}></ha-svg-icon></span>
                    </div>
                  `:""}
                `})}
              ${void 0!==this.now?R`
                <div
                  class="now-line"
                  style=${na({insetInlineStart:(3600*this.now.getHours()+60*this.now.getMinutes()+this.now.getSeconds())/86400*this._contentWidth+"px"})}
                ></div>
              `:""}
              ${this._createRange?R`
                <div
                  class="create-overlay"
                  style=${na({insetInlineStart:this._createRange.ts0/86400*this._contentWidth+"px",width:(this._createRange.ts1-this._createRange.ts0)/86400*this._contentWidth+"px"})}
                ></div>
              `:""}
            </div>
          </div>
        </div>
      </div>
    `}_selectSlot(e,t){e.stopPropagation(),this.selectedSlot=this.selectedSlot===t?null:t,null!==this.selectedSlot&&document.dispatchEvent(new CustomEvent(yn,{detail:{source:this}})),this.dispatchEvent(new CustomEvent("slot-selected",{detail:{index:this.selectedSlot},bubbles:!0,composed:!0}))}_clientXToTs(e){const t=this.shadowRoot.querySelector(".bar").getBoundingClientRect();let i="rtl"===getComputedStyle(this).direction?t.right-e:e-t.left;i<0&&(i=0),i>t.width&&(i=t.width);const s=60*this._dragStepSize;return Math.round(Math.round(i/t.width*86400)/s)*s}_handleSegPointerDown(e,t){if(void 0!==e.button&&0!==e.button)return;const i=performance.now(),s=void 0!==this._lastSegTap&&i-this._lastSegTap.time<400&&Math.abs(e.clientX-this._lastSegTap.x)<("touch"===e.pointerType?50:10);if(this._lastSegTap={time:i,x:e.clientX},s)return void(this.editable&&this._startCreateDrag(e));if("touch"===e.pointerType)return void this._startTouchPan(e);const a=e.clientX;if(!this.editable)return void this._selectSlot(e,t);this._bodyResizeDrag={startClientX:a,slotIdx:t,active:!1};const o=e=>{if(!this._bodyResizeDrag)return;const i=e.clientX-this._bodyResizeDrag.startClientX;if(this._bodyResizeDrag.active||Math.abs(i)<5)return;this._bodyResizeDrag.active=!0,window.removeEventListener("pointermove",o),window.removeEventListener("pointerup",n),window.removeEventListener("pointercancel",n);const s=this._slots,a=i>0===!("rtl"===getComputedStyle(this).direction)?t:t-1;this._bodyResizeDrag=void 0,a<0||a>s.length-2||void 0===s[a+1].stop||this._startBoundaryDrag(a)},n=()=>{var i;window.removeEventListener("pointermove",o),window.removeEventListener("pointerup",n),window.removeEventListener("pointercancel",n),(null===(i=this._bodyResizeDrag)||void 0===i?void 0:i.active)||this._selectSlot(e,t),this._bodyResizeDrag=void 0};window.addEventListener("pointermove",o),window.addEventListener("pointerup",n),window.addEventListener("pointercancel",n)}_startTouchPan(e){let t=e.clientX;const i=e=>{if(this._pinch)return;const i=e.clientX-t;t=e.clientX,this.dispatchEvent(new CustomEvent("overview-pan",{detail:{deltaPx:-i},bubbles:!0,composed:!0}))},s=()=>{window.removeEventListener("pointermove",i),window.removeEventListener("pointerup",s),window.removeEventListener("pointercancel",s)};window.addEventListener("pointermove",i),window.addEventListener("pointerup",s),window.addEventListener("pointercancel",s)}_startCreateDrag(e){const t=e.clientX;this._createDrag={ts0:this._clientXToTs(e.clientX),active:!1};const i=e=>{if(!this._createDrag)return;if(!this._createDrag.active&&Math.abs(e.clientX-t)<5)return;this._createDrag.active=!0;const i=this._clientXToTs(e.clientX);this._createRange={ts0:Math.min(this._createDrag.ts0,i),ts1:Math.max(this._createDrag.ts0,i)}},s=e=>e.preventDefault(),a=()=>{window.removeEventListener("pointermove",i),window.removeEventListener("pointerup",a),window.removeEventListener("pointercancel",a),window.removeEventListener("dragstart",s);const e=this._createDrag,t=this._createRange;this._createDrag=void 0,this._createRange=void 0,(null==e?void 0:e.active)&&t&&(t.ts1-t.ts0<60*this._dragStepSize||this._commitCreate(t.ts0,t.ts1))};window.addEventListener("pointermove",i),window.addEventListener("pointerup",a),window.addEventListener("pointercancel",a),window.addEventListener("dragstart",s)}_commitCreate(e,t){let[i,s]=Ja(this._slots,e,t,this.hass);const a=[i[s-1],i[s+1]].find(e=>{var t;return(null===(t=null==e?void 0:e.actions)||void 0===t?void 0:t.length)&&null!==Ua(e.actions[0])}),o=a?Ua(a.actions[0]):null;o&&(i=Object.assign([...i],{[s]:Object.assign(Object.assign({},i[s]),{actions:[o]})}),this._liveSlots=i,this.selectedSlot=s,document.dispatchEvent(new CustomEvent(yn,{detail:{source:this}})),this.dispatchEvent(new CustomEvent("slot-selected",{detail:{index:s},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("slots-changed",{detail:{slots:i},bubbles:!0,composed:!0})))}get _dragStepSize(){var e;return this.zoom>=4?1:(null===(e=this.config)||void 0===e?void 0:e.time_step)||15}_handleDragStart(e,t){e.preventDefault(),e.stopPropagation(),this._startBoundaryDrag(t)}_startBoundaryDrag(e){if(!this.editable)return;const t=this._slots;if([we.Sunrise,we.Sunset].includes(De(t[e+1].start).mode))return;const i=this.shadowRoot.querySelector(".bar").getBoundingClientRect(),s=this._dragStepSize,a=60*s;let o=e>0?Te(t[e-1].stop||t[e-1].start,this.hass)+a:a,n=(Te(t[e+1].stop||t[e+1].start,this.hass)||86400)-a;void 0===t[e+1].stop&&(n=(Te(t[e+2].stop||t[e+2].start,this.hass)||86400)-a);const r="rtl"===getComputedStyle(this).direction,d=a=>{a.preventDefault();const d=a instanceof TouchEvent?a.changedTouches[0].clientX:a.clientX;let l=r?i.right-d:d-i.left;l>i.width&&(l=i.width),l<0&&(l=0);let c=Math.round(l/i.width*86400);c<o?c=o:c>n&&(c=n);const h=Math.floor(c/3600),u=Math.round((c-3600*h)/60);let p={mode:we.Fixed,hours:h,minutes:u};p=Ee(p,s);const m=He(p);let _=[...t];_=Object.assign(_,{[e]:Object.assign(Object.assign({},_[e]),{stop:m}),[e+1]:Object.assign(Object.assign({},_[e+1]),{start:m})}),this._liveSlots=_},l=e=>e.preventDefault(),c=()=>{window.removeEventListener("mousemove",d),window.removeEventListener("touchmove",d),window.removeEventListener("mouseup",c),window.removeEventListener("touchend",c),window.removeEventListener("pointercancel",c),window.removeEventListener("dragstart",l),this._liveSlots&&this.dispatchEvent(new CustomEvent("slots-changed",{detail:{slots:this._liveSlots},bubbles:!0,composed:!0}))};window.addEventListener("mousemove",d),window.addEventListener("touchmove",d),window.addEventListener("mouseup",c),window.addEventListener("touchend",c),window.addEventListener("pointercancel",c),window.addEventListener("dragstart",l)}static get styles(){return r`
      :host {
        display: block;
        width: 100%;
      }
      .viewport {
        width: 100%;
        overflow: hidden;
        position: relative;
        touch-action: none;
        /* A block wider than its container overflow-anchors based on its
           PARENT's direction, not its own - force ltr here for a fixed,
           direction-independent anchor for the pan/zoom math, then restore
           the true direction on .content-inner below. */
        direction: ltr;
      }
      .zoom-content {
        position: relative;
      }
      .content-inner {
        position: relative;
      }
      .boundaries {
        position: relative;
        width: 100%;
        transition: height 0.15s ease-in-out;
      }
      .boundary {
        position: absolute;
        bottom: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
      }
      .boundary.start {
        align-items: flex-start;
      }
      .boundary.end {
        align-items: flex-end;
      }
      .boundary-label {
        font-size: 0.62rem;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
        color: var(--primary-text-color);
        margin-bottom: 2px;
      }
      .boundary-label.on {
        color: rgb(var(--rgb-state-active-color, 67, 160, 71));
      }
      .boundary-label.off {
        color: rgb(211, 47, 47);
      }
      .boundary-label.empty {
        color: var(--secondary-text-color);
      }
      .boundary-line {
        display: block;
        width: 1px;
        background: var(--divider-color, rgba(127, 127, 127, 0.5));
        transition: height 0.15s ease-in-out;
      }
      .bar {
        display: flex;
        width: 100%;
        height: 22px;
        position: relative;
        /* No selectable text here - a stray selection lets the browser
           start a native drag that cancels an in-progress edit. */
        user-select: none;
        -webkit-user-select: none;
      }
      .seg {
        height: 100%;
        cursor: pointer;
        box-sizing: border-box;
      }
      .seg.on {
        background: rgba(var(--rgb-state-active-color, 67, 160, 71), 0.75);
      }
      .seg.off {
        background: rgba(211, 47, 47, 0.7);
      }
      .seg.empty {
        background: rgba(var(--rgb-secondary-text-color), 0.4);
      }
      .seg:first-child {
        border-start-start-radius: 6px;
        border-end-start-radius: 6px;
      }
      .seg:last-child {
        border-start-end-radius: 6px;
        border-end-end-radius: 6px;
      }
      .seg.selected {
        border: 2px solid var(--primary-color);
      }
      .handle {
        display: flex;
        width: 14px;
        height: 100%;
        align-items: center;
        justify-content: center;
        margin-inline-start: -7px;
        margin-inline-end: -7px;
        visibility: visible;
        z-index: 4;
        cursor: ew-resize;
      }
      .handle.hidden {
        visibility: hidden;
      }
      .now-line {
        position: absolute;
        top: -3px;
        bottom: -3px;
        width: 2px;
        margin-inline-start: -1px;
        background: var(--primary-color);
        border-radius: 1px;
        pointer-events: none;
        z-index: 5;
      }
      .now-line::before {
        content: '';
        position: absolute;
        top: -3px;
        inset-inline-start: -2px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--primary-color);
      }
      .create-overlay {
        position: absolute;
        top: 0;
        height: 100%;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.35);
        border: 1px solid var(--primary-color);
        box-sizing: border-box;
        border-radius: 4px;
        pointer-events: none;
        z-index: 6;
      }
      .handle span {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
        border-radius: 50%;
        width: 12px;
        height: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        z-index: 5;
      }
      .handle:hover span {
        border-color: var(--primary-color);
      }
      .handle ha-svg-icon {
        --mdc-icon-size: 10px;
        width: 10px;
        height: 10px;
        color: var(--secondary-text-color);
      }
      .handle.center span {
        margin-inline-end: -1px;
      }
    `}};t([le({attribute:!1})],wn.prototype,"hass",void 0),t([le({attribute:!1})],wn.prototype,"config",void 0),t([le({attribute:!1})],wn.prototype,"slots",void 0),t([le({type:Number})],wn.prototype,"zoom",void 0),t([le({type:Number})],wn.prototype,"panPx",void 0),t([le({type:Number})],wn.prototype,"viewportWidth",void 0),t([le({type:Boolean})],wn.prototype,"editable",void 0),t([le({attribute:!1})],wn.prototype,"now",void 0),t([ce()],wn.prototype,"selectedSlot",void 0),t([ce()],wn.prototype,"_liveSlots",void 0),t([ce()],wn.prototype,"_createRange",void 0),wn=t([re("scheduler-overview-bar")],wn);let kn=class extends oe{_fire(e){this.dispatchEvent(new CustomEvent("action-changed",{detail:{action:e}}))}_setOnOff(e){const t=Qi(this.entityId);this._fire({service:`${t}.${e?"turn_on":"turn_off"}`,service_data:{},target:{entity_id:this.entityId}})}_setParam(e,t){if(!this.action)return;const i=Object.assign(Object.assign({},this.action.service_data),{[e]:t});"color_temp_kelvin"===e&&delete i.rgb_color,this._fire(Object.assign(Object.assign({},this.action),{service_data:i}))}_setColor(e){if(!this.action)return;const t=[1,3,5].map(t=>parseInt(e.substr(t,2),16)),i=Object.assign(Object.assign({},this.action.service_data),{rgb_color:t});delete i.color_temp_kelvin,this._fire(Object.assign(Object.assign({},this.action),{service_data:i}))}_renderParams(){var e,t,i,s;const a=this.action;if(!a||"light"!==Qi(a.service)||!Wa(a))return q;const o=(null===(t=null===(e=this.hass.states[this.entityId])||void 0===e?void 0:e.attributes)||void 0===t?void 0:t.supported_color_modes)||[],n=o.includes("color_temp"),r=["hs","rgb","rgbw","rgbww","xy"].some(e=>o.includes(e)),d=a.service_data||{},l=d.rgb_color,c=Array.isArray(l)&&l.length>=3?"#"+l.slice(0,3).map(e=>Math.round(e).toString(16).padStart(2,"0")).join(""):"#ffb46b";return R`
      <div class="params">
        <label>
          <span>${Yi("ui.panel.overview.brightness",this.hass)}</span>
          <input
            type="range" min="1" max="255"
            .value=${String(null!==(i=d.brightness)&&void 0!==i?i:255)}
            @input=${e=>this._setParam("brightness",Number(e.target.value))}
          />
        </label>
        ${n?R`
          <label>
            <span>${Yi("ui.panel.overview.color_temp",this.hass)}</span>
            <input
              type="range" min="2000" max="6500" step="100"
              .value=${String(null!==(s=d.color_temp_kelvin)&&void 0!==s?s:4e3)}
              @input=${e=>this._setParam("color_temp_kelvin",Number(e.target.value))}
            />
          </label>
        `:q}
        ${r?R`
          <label>
            <span>${Yi("ui.panel.overview.color",this.hass)}</span>
            <input
              type="color"
              .value=${c}
              @input=${e=>this._setColor(e.target.value)}
            />
          </label>
        `:q}
      </div>
    `}render(){if(!this.hass||!this.entityId)return R``;const e=!!this.action&&Wa(this.action),t=!!this.action&&Ba(this.action);return R`
      <div class="action-panel">
        <div class="act-group">
          <button class="act on ${e?"active":""}" @click=${()=>this._setOnOff(!0)}>
            <ha-svg-icon .path=${"M16.56,5.44L15.11,6.89C16.84,7.94 18,9.83 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12C6,9.83 7.16,7.94 8.88,6.88L7.44,5.44C5.36,6.88 4,9.28 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12C20,9.28 18.64,6.88 16.56,5.44M13,3H11V13H13"}></ha-svg-icon>
            ${Yi("ui.panel.overview.turn_on",this.hass)}
          </button>
          <button class="act off ${t?"active":""}" @click=${()=>this._setOnOff(!1)}>
            <ha-svg-icon .path=${"M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3M12,19A7,7 0 0,1 5,12A7,7 0 0,1 12,5A7,7 0 0,1 19,12A7,7 0 0,1 12,19Z"}></ha-svg-icon>
            ${Yi("ui.panel.overview.turn_off",this.hass)}
          </button>
        </div>
        ${this._renderParams()}
      </div>
    `}static get styles(){return r`
      :host { display: block; }
      /* One panel directly under the selected slot's bar, so the action and
         its settings read as a single popover attached to that slot. */
      .action-panel {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 8px 14px;
        margin-top: 8px;
        padding: 7px 10px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
        border-radius: 10px;
        background: var(--card-background-color);
      }
      .act-group {
        display: flex;
        gap: 4px;
      }
      .act {
        display: flex;
        align-items: center;
        gap: 2px;
        font-family: inherit;
        font-size: 0.62rem;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
        border-radius: 12px;
        padding: 1px 8px 1px 4px;
        cursor: pointer;
        background: var(--card-background-color);
        color: var(--secondary-text-color);
      }
      .act ha-svg-icon {
        --mdc-icon-size: 13px;
      }
      .act.on.active {
        background: rgb(var(--rgb-state-active-color, 67, 160, 71));
        border-color: transparent;
        color: var(--text-primary-color, #fff);
      }
      .act.off.active {
        background: rgb(211, 47, 47);
        border-color: transparent;
        color: var(--text-primary-color, #fff);
      }
      .params {
        display: flex;
        gap: 14px;
        align-items: center;
        flex-wrap: wrap;
      }
      .params label {
        display: flex;
        align-items: center;
        gap: 5px;
        font-size: 0.62rem;
        color: var(--secondary-text-color);
      }
      .params input[type='range'] {
        width: 92px;
        accent-color: var(--primary-color);
      }
      .params input[type='color'] {
        width: 26px;
        height: 18px;
        padding: 0;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
        border-radius: 4px;
        background: none;
        cursor: pointer;
      }
    `}};t([le({attribute:!1})],kn.prototype,"hass",void 0),t([le({attribute:!1})],kn.prototype,"action",void 0),t([le()],kn.prototype,"entityId",void 0),kn=t([re("scheduler-overview-action-panel")],kn);let xn=class extends oe{constructor(){super(...arguments),this.zoom=1,this.panPx=0,this.viewportWidth=0,this.editable=!0,this.spanDays=1,this._saveState=null,this._selectedSlot=null,this._undoStack=[]}render(){var e,t,i;try{const s=this.hass.states[this.schedule.entity_id];if(!s)return R``;const a=["off","completed"].includes(s.state),{entry:o,index:n}=_n(this.schedule.entries,this.date),r=this.date||new Date,d=vn(o,r),l=new Date(r.getTime()+864e5),c=2===this.spanDays?_n(this.schedule.entries,l):null,h=!!c&&vn(c.entry,l),u=2===this.spanDays?this.viewportWidth/2:this.viewportWidth,p=null===(e=o.slots.find(e=>e.actions.length))||void 0===e?void 0:e.actions[0];let m="mdi:calendar-clock";if(p){let e=[(null===(t=p.target)||void 0===t?void 0:t.entity_id)||[]].flat().shift();["script","notify"].includes(Qi(p.service))&&(e=p.service),e&&(m=pa(e,this.config.customize,this.hass))}const _=p?Ms(["script","notify"].includes(Qi(p.service))?p.service:[(null===(i=p.target)||void 0===i?void 0:i.entity_id)||[]].flat()[0]||"",this.hass,this.config.customize):this.schedule.name||this.schedule.entity_id;return R`
        <div class="row ${a?"disabled":""} ${d?"":"not-today"}">
          <div class="device">
            <ha-icon
              icon="${m}"
              class="toggle"
              title=${Yi("ui.panel.overview.tap_icon_to_toggle",this.hass)}
              @click=${this._handleToggle}
            ></ha-icon>
            <span class="label" @click=${this._handleEditClick}>${_}</span>
            <ha-icon-button
              class="duplicate"
              .path=${"M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"}
              .label=${Yi("ui.panel.overview.duplicate",this.hass)}
              title=${Yi("ui.panel.overview.duplicate",this.hass)}
              @click=${this._handleDuplicate}
            ></ha-icon-button>
            ${this._saveState?R`
              <button
                class="save-pill ${this._saveState}"
                ?disabled=${"reset"!==this._saveState}
                title=${"reset"===this._saveState?Yi("ui.panel.overview.reset_hint",this.hass):""}
                @click=${this._handlePillClick}
              >
                ${"saved"===this._saveState?Yi("ui.panel.overview.saved",this.hass):Yi("ui.panel.overview.undo",this.hass)}
              </button>
            `:""}
          </div>
          <div class="bar-wrap ${2===this.spanDays?"split":""}">
            <scheduler-overview-bar
              .hass=${this.hass}
              .config=${this.config}
              .slots=${o.slots}
              .zoom=${this.zoom}
              .panPx=${this.panPx}
              .viewportWidth=${u}
              .editable=${this.editable&&1===this.spanDays}
              .now=${this.now}
              @slots-changed=${e=>this._handleSlotsChanged(e,n)}
              @slot-selected=${this._handleSlotSelected}
            ></scheduler-overview-bar>
            ${c?R`
              <scheduler-overview-bar
                class="${h?"":"not-today"}"
                .hass=${this.hass}
                .config=${this.config}
                .slots=${c.entry.slots}
                .zoom=${this.zoom}
                .panPx=${this.panPx}
                .viewportWidth=${u}
                .editable=${!1}
              ></scheduler-overview-bar>
            `:""}
            ${1===this.spanDays?this._renderActionPanel(o.slots,n):""}
          </div>
        </div>
      `}catch(e){return R``}}_handleSlotSelected(e){e.stopPropagation(),this._selectedSlot=e.detail.index}_renderActionPanel(e,t){var i,s,a,o;const n=this._selectedSlot;if(!this.editable||null===n||!e[n])return"";const r=e[n].actions[0];if(r&&!Wa(r)&&!Ba(r))return"";const d=[(null===(i=null==r?void 0:r.target)||void 0===i?void 0:i.entity_id)||[]].flat()[0]||[(null===(o=null===(a=null===(s=e.find(e=>e.actions.length))||void 0===s?void 0:s.actions[0])||void 0===a?void 0:a.target)||void 0===o?void 0:o.entity_id)||[]].flat()[0];return d?R`
      <scheduler-overview-action-panel
        .hass=${this.hass}
        .entityId=${d}
        .action=${r}
        @action-changed=${i=>this._handleActionChanged(i,e,t)}
      ></scheduler-overview-action-panel>
    `:""}_handleActionChanged(e,t,i){e.stopPropagation();const s=this._selectedSlot;if(null===s)return;const a=Object.assign([...t],{[s]:Object.assign(Object.assign({},t[s]),{actions:[e.detail.action]})});this._handleSlotsChanged(new CustomEvent("slots-changed",{detail:{slots:a}}),i)}_handleDuplicate(e){e.stopPropagation();const t=Object.assign({},this.schedule);delete t.schedule_id,delete t.entity_id,Promise.resolve(Aa(this.hass,t)).catch(e=>La(e,this,this.hass))}_handleToggle(e){e.stopPropagation();const t=this.hass.states[this.schedule.entity_id];if(!t)return;const i=["off","completed"].includes(t.state);this.hass.callService("switch",i?"turn_on":"turn_off",{entity_id:this.schedule.entity_id})}_handleEditClick(e){e.stopPropagation(),this.dispatchEvent(new CustomEvent("editClick",{detail:{schedule_id:this.schedule_id}}))}_handleSlotsChanged(e,t){e.stopPropagation(),this._undoStack.push({slots:this.schedule.entries[t].slots,entryIndex:t}),bn(()=>this._performUndo()),this._saveAndSet(t,e.detail.slots,!0)}_saveAndSet(e,t,i=!1){const s=Object.assign([...this.schedule.entries],{[e]:Object.assign(Object.assign({},this.schedule.entries[e]),{slots:t})}),a=Object.assign(Object.assign({},this.schedule),{entries:s});this.schedule=a;const o=a.schedule_id?Ia(this.hass,a):Aa(this.hass,a);return Promise.resolve(o).then(()=>{i&&this._showSaved()}).catch(e=>{this._clearSaveState(),La(e,this,this.hass)})}_showSaved(){clearTimeout(this._saveStateTimer),this._saveState="saved",this._saveStateTimer=window.setTimeout(()=>{this._saveState="reset"},500)}_handlePillClick(){"reset"===this._saveState&&this._performReset()}_performUndo(){const e=this._undoStack.pop();e&&(this._undoStack.length?bn(()=>this._performUndo()):this._clearSaveState(),this._saveAndSet(e.entryIndex,e.slots))}_performReset(){const e=this._undoStack[0];e&&(this._undoStack=[],this._clearSaveState(),this._saveAndSet(e.entryIndex,e.slots))}_clearSaveState(){bn(null),clearTimeout(this._saveStateTimer),this._saveState=null}static get styles(){return r`
      :host {
        display: block;
      }
      .row {
        display: flex;
        /* The bar's own boundary-marker row sits above its colored strip,
           making it taller than the device label - bottom-align so the
           label lines up with the colored strip itself, not the middle of
           the whole (taller) block. */
        align-items: flex-end;
        gap: 12px;
        padding: 7px 0;
      }
      .device {
        display: flex;
        align-items: center;
        gap: 8px;
        /* Must add up (with the .row gap) to OVERVIEW_SPACER_WIDTH in
           scheduler-overview-ruler, so the ruler and every bar line up. */
        flex: 0 0 146px;
        min-width: 0;
        padding-bottom: 2px;
      }
      ha-icon.toggle {
        flex: 0 0 24px;
        color: var(--state-icon-color);
        cursor: pointer;
        border-radius: 50%;
        padding: 3px;
        margin: -3px;
        box-sizing: content-box;
      }
      ha-icon.toggle:hover {
        background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.08);
      }
      .label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.85rem;
        color: var(--primary-text-color);
        cursor: pointer;
      }
      .label:hover {
        text-decoration: underline;
      }
      .row.not-today .bar-wrap,
      .row.not-today .device {
        opacity: 0.45;
      }
      ha-icon-button.duplicate {
        flex: 0 0 auto;
        --mdc-icon-button-size: 26px;
        --mdc-icon-size: 15px;
        color: var(--secondary-text-color);
        opacity: 0;
        transition: opacity 0.12s ease-in-out;
      }
      .row:hover ha-icon-button.duplicate,
      ha-icon-button.duplicate:focus-visible {
        opacity: 1;
      }
      .row.disabled ha-icon,
      .row.disabled .label {
        color: var(--disabled-text-color);
      }
      .bar-wrap {
        flex: 1;
        min-width: 0;
        position: relative;
      }
      .bar-wrap.split {
        display: flex;
        align-items: flex-end;
        gap: 0;
      }
      .bar-wrap.split::after {
        content: '';
        position: absolute;
        inset-inline-start: 50%;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--divider-color, rgba(127, 127, 127, 0.5));
        pointer-events: none;
      }
      .bar-wrap.split scheduler-overview-bar {
        flex: 1 1 0;
        min-width: 0;
      }
      .bar-wrap.split scheduler-overview-bar.not-today {
        opacity: 0.45;
      }
      .row.disabled .bar-wrap {
        opacity: 0.5;
      }
      .save-pill {
        /* Lives in the device column, not over the bar: the bar's own
           boundary time labels occupy every free spot above it, and the
           strip itself must not be covered. */
        flex: 0 0 auto;
        font-size: 0.68rem;
        font-weight: 500;
        font-family: inherit;
        line-height: 1;
        color: var(--text-primary-color, #fff);
        border: none;
        border-radius: 11px;
        padding: 4px 9px;
        cursor: default;
        white-space: nowrap;
        z-index: 6;
      }
      .save-pill.saved {
        background: rgb(var(--rgb-state-active-color, 67, 160, 71));
        animation: save-pulse 1.6s ease-in-out;
        opacity: 1;
      }
      .save-pill.reset {
        cursor: pointer;
        background: var(--primary-color);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
      }
      .save-pill.reset:hover {
        filter: brightness(1.1);
      }
      @keyframes save-pulse {
        0% { opacity: 0.35; }
        50% { opacity: 1; }
        100% { opacity: 0.75; }
      }
    `}};t([le()],xn.prototype,"hass",void 0),t([le()],xn.prototype,"schedule_id",void 0),t([le()],xn.prototype,"schedule",void 0),t([le()],xn.prototype,"config",void 0),t([le({attribute:!1})],xn.prototype,"date",void 0),t([le({type:Number})],xn.prototype,"zoom",void 0),t([le({type:Number})],xn.prototype,"panPx",void 0),t([le({type:Number})],xn.prototype,"viewportWidth",void 0),t([le({type:Boolean})],xn.prototype,"editable",void 0),t([le({attribute:!1})],xn.prototype,"now",void 0),t([le({type:Number})],xn.prototype,"spanDays",void 0),t([ce()],xn.prototype,"_saveState",void 0),t([ce()],xn.prototype,"_selectedSlot",void 0),xn=t([re("scheduler-overview-row")],xn);let $n=class extends oe{constructor(){super(...arguments),this.zoom=1,this.panPx=0,this.minZoom=1,this.maxZoom=48,this.spanDays=1,this._width=0}get _contentWidth(){return this._width*this.zoom}connectedCallback(){super.connectedCallback(),this._resizeObserver=new ResizeObserver(e=>{for(const t of e){const e=Math.max(0,t.contentRect.width-158);e!==this._width&&(this._width=e,this.dispatchEvent(new CustomEvent("viewport-width-changed",{detail:{width:e},bubbles:!0,composed:!0})))}}),this._resizeObserver.observe(this)}disconnectedCallback(){var e;super.disconnectedCallback(),null===(e=this._resizeObserver)||void 0===e||e.disconnect()}_fireZoom(e){this.dispatchEvent(new CustomEvent("overview-zoom",{detail:e,bubbles:!0,composed:!0}))}_fireReset(){this.dispatchEvent(new CustomEvent("overview-zoom-reset",{bubbles:!0,composed:!0}))}_handleWheel(e){if(!this._width||2===this.spanDays)return;const t=e.ctrlKey||e.metaKey||Math.abs(e.deltaY)>=Math.abs(e.deltaX);e.preventDefault();const i=e.currentTarget.getBoundingClientRect(),s=e.clientX-i.left;if(t){const t=Math.pow(2,-e.deltaY/60);this._fireZoom({anchorPx:s,factor:t})}else this.dispatchEvent(new CustomEvent("overview-pan",{detail:{deltaPx:e.deltaX},bubbles:!0,composed:!0}))}_handlePanStart(e){this.zoom<=this.minZoom||(e.currentTarget.setPointerCapture(e.pointerId),this._panDrag={pointerId:e.pointerId,startX:e.clientX})}_handlePanMove(e){if(!this._panDrag||this._panDrag.pointerId!==e.pointerId)return;const t=e.clientX-this._panDrag.startX;this._panDrag.startX=e.clientX,this.dispatchEvent(new CustomEvent("overview-pan",{detail:{deltaPx:-t},bubbles:!0,composed:!0}))}_handlePanEnd(){this._panDrag=void 0}_touchDistance(e){const t=e[0].clientX-e[1].clientX,i=e[0].clientY-e[1].clientY;return Math.hypot(t,i)}_handlePinchStart(e){if(2!==e.touches.length)return;e.preventDefault();const t=this.getBoundingClientRect();this._pinch={distance:this._touchDistance(e.touches),midpointX:(e.touches[0].clientX+e.touches[1].clientX)/2-t.left-158}}_handlePinchMove(e){if(!this._pinch||2!==e.touches.length)return;e.preventDefault();const t=this._touchDistance(e.touches),i=t/this._pinch.distance;this._fireZoom({anchorPx:this._pinch.midpointX,factor:i}),this._pinch.distance=t}_handlePinchEnd(e){e.touches.length<2&&(this._pinch=void 0)}render(){if(!this.hass)return R``;const e=Le(this.hass.locale),t=2===this.spanDays?[...to(this._contentWidth/2,e),...to(this._contentWidth/2,e)].map(e=>Object.assign(Object.assign({},e),{widthPct:e.widthPct/2})):to(this._contentWidth,e),i=Math.round(100*this.zoom),s=void 0!==this.now&&1===this.spanDays?Math.round(this.now.getHours()+this.now.getMinutes()/60)%24:null;return R`
      ${2===this.spanDays?"":R`
      <div class="zoom-controls">
        <ha-icon-button
          .disabled=${this.zoom<=this.minZoom}
          @click=${()=>this._fireZoom({anchorPx:this._width/2,factor:1/3,animate:!0})}
        >
          <ha-icon icon="mdi:magnify-minus-outline"></ha-icon>
        </ha-icon-button>
        <span class="zoom-level" @click=${this._fireReset}>${i}%</span>
        <ha-icon-button
          .disabled=${this.zoom>=this.maxZoom}
          @click=${()=>this._fireZoom({anchorPx:this._width/2,factor:3,animate:!0})}
        >
          <ha-icon icon="mdi:magnify-plus-outline"></ha-icon>
        </ha-icon-button>
      </div>`}
      <div
        class="viewport"
        @wheel=${this._handleWheel}
        @touchstart=${this._handlePinchStart}
        @touchmove=${this._handlePinchMove}
        @touchend=${this._handlePinchEnd}
        @touchcancel=${this._handlePinchEnd}
      >
        <div class="spacer"></div>
        <div
          class="ruler-viewport"
          style=${na({cursor:this.zoom>this.minZoom?"grab":"default"})}
          @pointerdown=${this._handlePanStart}
          @pointermove=${this._handlePanMove}
          @pointerup=${this._handlePanEnd}
          @pointercancel=${this._handlePanEnd}
        >
          <div class="ruler" style=${na({width:this._contentWidth+"px",transform:`translateX(${-this.panPx}px)`})}>
            ${2===this.spanDays?R`<div class="day-split">
                ${(this.dayLabels||[]).map(e=>R`<span class="day-name">${e}</span>`)}
              </div>`:""}
            ${t.map(t=>{const i={mode:we.Fixed,hours:t.hour,minutes:0},a=He(i,{seconds:!1,am_pm:e}),o="left"===t.align?"left":"right"===t.align?"right":"",n=t.hour===s||0===t.hour&&24===s;return R`
                <span class="${o} ${n?"now":""}" style=${na({width:t.widthPct+"%"})}>${a}</span>
              `})}
          </div>
        </div>
      </div>
    `}static get styles(){return r`
      :host {
        display: block;
        width: 100%;
      }
      .zoom-controls {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        margin-bottom: 2px;
      }
      .zoom-level {
        font-size: 0.72rem;
        color: var(--secondary-text-color);
        min-width: 3em;
        text-align: center;
        cursor: pointer;
        user-select: none;
      }
      .viewport {
        display: flex;
        width: 100%;
        font-size: 0.72rem;
        color: var(--secondary-text-color);
        padding-bottom: 2px;
        touch-action: none;
      }
      .spacer {
        flex: 0 0 158px;
      }
      .ruler-viewport {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        position: relative;
        /* Forces a fixed, direction-independent overflow anchor for the
           scaled .ruler (see scheduler-overview-bar for the full
           explanation); true direction restored on the ruler itself. */
        direction: ltr;
      }
      .ruler {
        display: flex;
        position: relative;
      }
      .ruler span {
        display: flex;
        justify-content: center;
        white-space: nowrap;
      }
      .ruler span.left {
        justify-content: flex-start;
      }
      .ruler span.right {
        justify-content: flex-end;
      }
      .day-split {
        position: absolute;
        top: -13px;
        inset-inline-start: 0;
        width: 100%;
        display: flex;
        pointer-events: none;
      }
      .day-split .day-name {
        flex: 1 1 50%;
        justify-content: center;
        font-weight: 600;
        color: var(--primary-text-color);
      }
      .ruler span.now {
        font-weight: 700;
        color: var(--primary-color);
      }
    `}updated(){var e;const t=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector(".ruler");t&&(t.style.direction=getComputedStyle(this).direction)}};t([le({attribute:!1})],$n.prototype,"hass",void 0),t([le({attribute:!1})],$n.prototype,"now",void 0),t([le({type:Number})],$n.prototype,"zoom",void 0),t([le({type:Number})],$n.prototype,"panPx",void 0),t([le({type:Number})],$n.prototype,"minZoom",void 0),t([le({type:Number})],$n.prototype,"maxZoom",void 0),t([le({type:Number})],$n.prototype,"spanDays",void 0),t([le({attribute:!1})],$n.prototype,"dayLabels",void 0),t([ce()],$n.prototype,"_width",void 0),$n=t([re("scheduler-overview-ruler")],$n);const Sn=()=>({type:ge.Or,items:[],track_changes:!1}),jn=e=>({service:Qi(e)+".turn_on",service_data:{},target:{entity_id:e}}),On=e=>({service:Qi(e)+".turn_off",service_data:{},target:{entity_id:e}});let zn=class extends oe{constructor(){super(...arguments),this.zoom=1,this.panPx=0,this.viewportWidth=0,this.editable=!0,this._picking=!1,this._entityId=null,this._slots=[],this._selectedSlot=null,this._saving=!1}_reset(){this._picking=!1,this._entityId=null,this._slots=[],this._selectedSlot=null}_startPicking(){this._picking=!0}_handleEntityPicked(e){var t;const i=null===(t=e.detail)||void 0===t?void 0:t.value,s=Array.isArray(i)?i[i.length-1]:i;s&&(this._entityId=s,this._picking=!1,this._slots=[{start:"00:00:00",stop:"08:00:00",actions:[On(s)],conditions:Sn()},{start:"08:00:00",stop:"16:00:00",actions:[jn(s)],conditions:Sn()},{start:"16:00:00",stop:"00:00:00",actions:[On(s)],conditions:Sn()}],this._selectedSlot=null)}_handleSlotsChanged(e){e.stopPropagation(),this._slots=e.detail.slots}_handleSlotSelected(e){e.stopPropagation(),this._selectedSlot=e.detail.index}_handleActionChanged(e){const t=this._selectedSlot;null!==t&&(this._slots=Object.assign([...this._slots],{[t]:Object.assign(Object.assign({},this._slots[t]),{actions:[e.detail.action]})}))}async _save(){if(!this._slots.length)return;this._saving=!0;const e={entries:[{weekdays:[_e.Daily],slots:this._slots}],repeat_type:ye.Repeat,next_entries:[],timestamps:[],enabled:!0};try{await Aa(this.hass,e),this._reset()}catch(e){La(e,this,this.hass)}finally{this._saving=!1}}render(){var e,t;if(!this.hass)return R``;const i=this._selectedSlot;return R`
      <div class="row">
        <div class="device">
          ${null!==this._entityId||this._picking?this._picking?R`
            <scheduler-entity-picker
              .hass=${this.hass}
              .config=${this.config}
              @value-changed=${this._handleEntityPicked}
            ></scheduler-entity-picker>
          `:R`
            <div class="draft-device">
              <span class="draft-label">${(null===(e=this.hass.states[this._entityId])||void 0===e?void 0:e.attributes.friendly_name)||this._entityId}</span>
              <ha-icon-button .path=${Bs} @click=${this._reset} class="cancel"></ha-icon-button>
              <ha-icon-button
                .path=${"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"}
                @click=${this._save}
                .disabled=${this._saving}
                class="confirm"
              ></ha-icon-button>
            </div>
          `:R`
            <button class="add-affordance" @click=${this._startPicking}>
              <ha-svg-icon .path=${Xs}></ha-svg-icon>
              <span>${Yi("ui.panel.overview.add_schedule",this.hass)}</span>
            </button>
          `}
        </div>
        <div class="bar-wrap">
          ${this._slots.length?R`
            <scheduler-overview-bar
              .hass=${this.hass}
              .config=${this.config}
              .slots=${this._slots}
              .zoom=${this.zoom}
              .panPx=${this.panPx}
              .viewportWidth=${this.viewportWidth}
              .editable=${this.editable}
              @slots-changed=${this._handleSlotsChanged}
              @slot-selected=${this._handleSlotSelected}
            ></scheduler-overview-bar>
            ${null!==i?R`
              <scheduler-overview-action-panel
                .hass=${this.hass}
                .entityId=${this._entityId}
                .action=${null===(t=this._slots[i])||void 0===t?void 0:t.actions[0]}
                @action-changed=${this._handleActionChanged}
              ></scheduler-overview-action-panel>
            `:q}
          `:q}
        </div>
      </div>
    `}static get styles(){return r`
      :host { display: block; }
      .row {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        padding: 7px 0;
      }
      .device {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 146px;
        min-width: 0;
        padding-bottom: 2px;
      }
      .add-affordance {
        display: flex;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        padding: 0;
        cursor: pointer;
        color: var(--primary-color);
        font-family: inherit;
        font-size: 0.85rem;
      }
      .add-affordance ha-svg-icon {
        --mdc-icon-size: 22px;
        border-radius: 50%;
        border: 1px dashed currentColor;
        padding: 1px;
      }
      .add-affordance span {
        white-space: nowrap;
      }
      scheduler-entity-picker {
        flex: 1;
        min-width: 0;
      }
      .draft-device {
        display: flex;
        align-items: center;
        gap: 2px;
        width: 100%;
      }
      .draft-label {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 0.85rem;
        color: var(--primary-text-color);
      }
      .draft-device ha-icon-button {
        --mdc-icon-button-size: 30px;
        --mdc-icon-size: 20px;
      }
      .draft-device .confirm {
        color: rgb(var(--rgb-state-active-color, 67, 160, 71));
      }
      .draft-device .cancel {
        color: var(--secondary-text-color);
      }
      .bar-wrap {
        flex: 1;
        min-width: 0;
        position: relative;
      }
    `}};t([le({attribute:!1})],zn.prototype,"hass",void 0),t([le({attribute:!1})],zn.prototype,"config",void 0),t([le({type:Number})],zn.prototype,"zoom",void 0),t([le({type:Number})],zn.prototype,"panPx",void 0),t([le({type:Number})],zn.prototype,"viewportWidth",void 0),t([le({type:Boolean})],zn.prototype,"editable",void 0),t([ce()],zn.prototype,"_picking",void 0),t([ce()],zn.prototype,"_entityId",void 0),t([ce()],zn.prototype,"_slots",void 0),t([ce()],zn.prototype,"_selectedSlot",void 0),t([ce()],zn.prototype,"_saving",void 0),zn=t([re("scheduler-overview-add-row")],zn);let Cn=class extends oe{constructor(){super(...arguments),this.date=new Date,this.spanDays=1}_select(e){this.dispatchEvent(new CustomEvent("date-changed",{detail:{date:e},bubbles:!0,composed:!0}))}_toggleSpan(){this.dispatchEvent(new CustomEvent("span-changed",{detail:{spanDays:2===this.spanDays?1:2},bubbles:!0,composed:!0}))}render(){if(!this.hass)return R``;const e=new Date;e.setHours(0,0,0,0);const t=As(this.hass),i=(e.getDay()-t+7)%7,s=new Date(e.getTime()-864e5*i),a=Array.from({length:7},(e,t)=>new Date(s.getTime()+864e5*t)),o=new Date(this.date);return o.setHours(0,0,0,0),R`
      <div class="daybar">
        <div class="days">
          ${a.map(t=>{var i;const s=t.getTime()===o.getTime(),a=t.getTime()===e.getTime(),n=t.toLocaleDateString((null===(i=this.hass.locale)||void 0===i?void 0:i.language)||void 0,{weekday:"short"});return R`
              <button
                class="day ${s?"selected":""} ${a?"today":""}"
                title=${a?Yi("ui.panel.overview.today",this.hass):""}
                @click=${()=>this._select(t)}
              >${n}</button>
            `})}
        </div>
        <button class="span ${2===this.spanDays?"active":""}" @click=${this._toggleSpan}>
          ${Yi("ui.panel.overview.two_days",this.hass)}
        </button>
      </div>
    `}static get styles(){return r`
      :host { display: block; }
      .daybar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 6px;
      }
      .days {
        display: flex;
        gap: 3px;
        flex-wrap: wrap;
      }
      .day, .span {
        font-family: inherit;
        font-size: 0.68rem;
        line-height: 1;
        padding: 4px 8px;
        border-radius: 11px;
        border: 1px solid var(--divider-color, rgba(127, 127, 127, 0.5));
        background: none;
        color: var(--secondary-text-color);
        cursor: pointer;
        white-space: nowrap;
      }
      /* Today keeps its place in the week rather than jumping to the front,
         so it needs marking out. */
      .day.today {
        font-weight: 700;
        color: var(--primary-text-color);
        border-color: var(--primary-color);
      }
      .day.today.selected {
        color: var(--text-primary-color, #fff);
      }
      .day.selected {
        background: var(--primary-color);
        border-color: transparent;
        color: var(--text-primary-color, #fff);
      }
      .span.active {
        background: var(--primary-color);
        border-color: transparent;
        color: var(--text-primary-color, #fff);
      }
      .day:hover, .span:hover {
        border-color: var(--primary-color);
      }
    `}};t([le({attribute:!1})],Cn.prototype,"hass",void 0),t([le({attribute:!1})],Cn.prototype,"date",void 0),t([le({type:Number})],Cn.prototype,"spanDays",void 0),Cn=t([re("scheduler-overview-daybar")],Cn);e.SchedulerCard=class extends oe{constructor(){super(...arguments),this._config={},this.showDiscovered=!1,this.overviewMode=!0,this._overviewZoom=1,this._overviewPanPx=0,this._overviewViewportWidth=0,this._now=new Date,this._viewDate=new Date,this._spanDays=1,this.translationsLoaded=!1,this.connectionError=!1,this._handleUndoKeyDown=e=>{if("z"!==e.key.toLowerCase()||!e.ctrlKey&&!e.metaKey||e.shiftKey)return;const t=e.composedPath()[0];if(t instanceof HTMLElement&&(["input","textarea","select"].includes(t.tagName.toLowerCase())||t.isContentEditable))return;const i=(()=>{const e=fn;return fn=null,e})();i&&(e.preventDefault(),i())}}get _quickAddEnabled(){return!1!==this._config.show_quick_add}get _overviewEditingEnabled(){return!1!==this._config.overview_editing}get _isToday(){const e=new Date(this._viewDate);e.setHours(0,0,0,0);const t=new Date;return t.setHours(0,0,0,0),e.getTime()===t.getTime()}_dayLabel(e){var t,i;return new Date(this._viewDate.getTime()+24*e*3600*1e3).toLocaleDateString((null===(i=null===(t=this.hass)||void 0===t?void 0:t.locale)||void 0===i?void 0:i.language)||void 0,{weekday:"long"})}async setConfig(e){e=(e=>{let t=[];Xe(e,"include")&&!et(e.include)&&t.push("'include' must be a list of strings"),Xe(e,"exclude")&&!et(e.exclude)&&t.push("'exclude' must be a list of strings"),Xe(e,"discover_existing")&&!Ge(e.discover_existing)&&t.push("'discover_existing' must be a boolean"),!Xe(e,"title")||Ge(e.title)||Je(e.title)||t.push("'title' must be a boolean or string"),Xe(e,"time_step")&&(!Ye(e.time_step)||Number(e.time_step)<1||Number(e.time_step)>30)&&t.push("'time_step' must be a number between 1 and 30"),Xe(e,"show_header_toggle")&&!Ge(e.show_header_toggle)&&t.push("'show_header_toggle' must be a boolean"),Xe(e,"show_add_button")&&!Ge(e.show_add_button)&&t.push("'show_add_button' must be a boolean"),Xe(e,"show_toggle_switches")&&!Ge(e.show_toggle_switches)&&t.push("'show_toggle_switches' must be a boolean"),Xe(e,"default_view")&&!["overview","list"].includes(e.default_view)&&t.push("'default_view' must be either 'overview' or 'list'");for(const i of["show_view_toggle","show_clock","overview_editing","show_quick_add"])Xe(e,i)&&!Ge(e[i])&&t.push(`'${i}' must be a boolean`);if(Xe(e,"display_options")&&(Qe(e.display_options)?(!Xe(e.display_options,"primary_info")||Je(e.display_options.primary_info)||et(e.display_options.primary_info)||t.push("in 'display_options': 'primary_info' must be a string or list of strings"),!Xe(e.display_options,"secondary_info")||Je(e.display_options.secondary_info)||et(e.display_options.secondary_info)||t.push("in 'display_options': 'secondary_info' must be a string or list of strings"),!Xe(e.display_options,"icon")||Je(e.display_options.icon)&&["action","entity"].includes(e.display_options.icon)||t.push("in 'display_options': 'icon' must be a set to either 'action' or 'entity' ")):t.push("'display_options' must be a struct")),!Xe(e,"sort_by")||Je(e.sort_by)||et(e.sort_by)||t.push("'sort_by' must be a string or list of strings"),Xe(e,"customize")&&!Qe(e.customize))t.push("'customize' must be a struct");else if(Xe(e,"customize")){let i=Object.entries(e.customize).map(([e,t])=>tt(e,t)).filter(Ke);i.length&&t.push(...i)}if(!Xe(e,"tags")||Je(e.tags)||et(e.tags)||t.push("'tags' must be a string or list of strings"),!Xe(e,"exclude_tags")||Je(e.tags)||et(e.tags)||t.push("'exclude_tags' must be a string or list of strings"),t.length)throw new Error(`Invalid configuration provided (${t.length} error${t.length>1?"s":""}): ${t.join(", ")}.`);return e})(e),this._config=Object.assign({},e),e.default_view&&(this.overviewMode=e.default_view===pe.Overview)}async firstUpdated(){await(async()=>{if(customElements.get("ha-checkbox")&&customElements.get("ha-slider")&&customElements.get("ha-generic-picker"))return;await customElements.whenDefined("partial-panel-resolver");const e=document.createElement("partial-panel-resolver");e.hass={panels:[{url_path:"tmp",component_name:"config"}]},e._updateRoutes(),await e.routerOptions.routes.tmp.load(),await customElements.whenDefined("ha-panel-config");const t=document.createElement("ha-panel-config");await t.routerOptions.routes.automation.load()})();document.querySelector("home-assistant")._loadFragmentTranslations(this.hass.language,"config"),await Hs(this.hass).then(e=>{e=Object.fromEntries(Object.entries(e).filter(([e])=>is(e,this._config))),this._config=Object.assign(Object.assign({},this._config),{customize:Object.assign(Object.assign({},e),this._config.customize||{})})})}willUpdate(){this.hass.loadBackendTranslation("services")}__checkSubscribed(){void 0===this.__unsubs&&this.isConnected&&void 0!==this.hass&&(this.__unsubs=this.hassSubscribe())}connectedCallback(){super.connectedCallback(),this.__checkSubscribed(),window.addEventListener("keydown",this._handleUndoKeyDown),this._clockInterval=window.setInterval(()=>{this._now=new Date},3e4)}disconnectedCallback(){if(super.disconnectedCallback(),window.removeEventListener("keydown",this._handleUndoKeyDown),this._clockInterval&&clearInterval(this._clockInterval),this.__unsubs){for(;this.__unsubs.length;){const e=this.__unsubs.pop();e instanceof Promise?e.then(e=>e()):e()}this.__unsubs=void 0}}updated(e){super.updated(e),e.has("hass")&&this.__checkSubscribed()}hassSubscribe(){return this.loadSchedules(),[this.hass.connection.subscribeMessage(e=>this.handleScheduleItemUpdated(e),{type:"scheduler_updated"})]}shouldUpdate(e){const t=e.get("hass"),i=e.get("_config");if(i&&this._config){Object.keys(i).filter(e=>i[e]!==this._config[e]).some(e=>["tags","discover_existing","sort_by","display_options"].includes(e))&&(async()=>{await this.loadSchedules()})()}return!this.translationsLoaded&&ns("component.input_boolean.services.turn_on.name",this.hass,!1).length&&ns("ui.panel.config.automation.editor.conditions.type.sun.sunrise",this.hass,!1).length?(this.translationsLoaded=!0,!0):!t||1!=e.size||!this.schedules||Object.values(this.schedules).some(e=>JSON.stringify(t.states[e.entity_id])!==JSON.stringify(this.hass.states[e.entity_id]))}render(){let e=[...this.schedules||[]],t=e.filter(e=>ss(e,this._config)),i=e.filter(e=>!ss(e,this._config));const s=this.showDiscovered?e.some(e=>{var t;return["on","triggered"].includes((null===(t=this.hass.states[e.entity_id])||void 0===t?void 0:t.state)||"")}):t.some(e=>{var t;return["on","triggered"].includes((null===(t=this.hass.states[e.entity_id])||void 0===t?void 0:t.state)||"")});return R`
      <ha-card>
        <div class="card-header">
          <div class="name">
            ${!Ke(this._config.title)||"boolean"==typeof this._config.title&&this._config.title?Yi("ui.panel.common.title",this.hass):"boolean"==typeof this._config.title?"":this._config.title}
          </div>

          ${this.overviewMode&&!1!==this._config.show_clock?R`<div class="clock">${this._formatClock()}</div>`:""}

          <div class="header-actions">
          <ha-icon-button
            class="plan-button"
            .path=${"M12.5,2C10.84,2 9.5,5.34 9.5,7A3,3 0 0,0 12.5,10A3,3 0 0,0 15.5,7C15.5,5.34 14.16,2 12.5,2M12.5,6.5A1,1 0 0,1 13.5,7.5A1,1 0 0,1 12.5,8.5A1,1 0 0,1 11.5,7.5A1,1 0 0,1 12.5,6.5M10,11A1,1 0 0,0 9,12V20H7A1,1 0 0,1 6,19V18A1,1 0 0,0 5,17A1,1 0 0,0 4,18V19A3,3 0 0,0 7,22H19A1,1 0 0,0 20,21A1,1 0 0,0 19,20H16V12A1,1 0 0,0 15,11H10Z"}
            .label=${Yi("ui.panel.plan.open",this.hass)}
            @click=${this._planClick}
          >
          </ha-icon-button>
          ${!1!==this._config.show_view_toggle?R`
          <ha-icon-button
            class="view-toggle"
            .path=${this.overviewMode?"M3 5V19H21V5H3M19 7V9H5V7H19M19 11V13H5V11H19M5 17V15H19V17H5Z":"M21 18H2V20H21V18M19 10V14H4V10H19M20 8H3C2.45 8 2 8.45 2 9V15C2 15.55 2.45 16 3 16H20C20.55 16 21 15.55 21 15V9C21 8.45 20.55 8 20 8M21 4H2V6H21V4Z"}
            .label=${this.overviewMode?Yi("ui.panel.overview.list_view",this.hass):Yi("ui.panel.overview.overview_view",this.hass)}
            @click=${()=>{this.overviewMode=!this.overviewMode}}
          >
          </ha-icon-button>
          `:""}
          ${Object.keys(this.schedules||{}).length&&this._config.show_header_toggle?R`
          <ha-switch
            ?checked=${s}
            @change=${this.toggleDisableAll}
          >
          </ha-switch>
          `:""}
          </div>
        </div>

        <div
          class="card-content"
          id="states"
          @viewport-width-changed=${this._handleOverviewWidthChanged}
          @overview-zoom=${this._handleOverviewZoom}
          @overview-zoom-reset=${this._handleOverviewZoomReset}
          @overview-pan=${this._handleOverviewPan}
        >

    ${this.overviewMode&&!this.connectionError&&(t.length||this._quickAddEnabled)?R`
          <scheduler-overview-daybar
            .hass=${this.hass}
            .date=${this._viewDate}
            .spanDays=${this._spanDays}
            @date-changed=${e=>{this._viewDate=e.detail.date}}
            @span-changed=${e=>{this._spanDays=e.detail.spanDays,this._overviewZoom=1,this._overviewPanPx=0}}
          ></scheduler-overview-daybar>
          <scheduler-overview-ruler
            .hass=${this.hass}
            .now=${this._isToday?this._now:void 0}
            .spanDays=${this._spanDays}
            .dayLabels=${[this._dayLabel(0),this._dayLabel(1)]}
            .zoom=${this._overviewZoom}
            .panPx=${this._overviewPanPx}
            .minZoom=${1}
            .maxZoom=${48}
          ></scheduler-overview-ruler>
        `:""}
    ${this.connectionError?R`
        <div>
          <hui-warning .hass=${this.hass}>
            <span style="white-space: normal">
              ${Yi("ui.panel.overview.backend_error",this.hass)}
            </span>
          </hui-warning>
        </div>
      `:Object.keys(e).length?t.map(e=>this._renderRow(e)):R`
        <div>
          ${Yi("ui.panel.overview.no_entries",this.hass)}
        </div>
        `}

      ${this.overviewMode&&!this.connectionError&&this._quickAddEnabled?R`
          <scheduler-overview-add-row
            .hass=${this.hass}
            .config=${this._config}
            .editable=${this._overviewEditingEnabled}
            .zoom=${this._overviewZoom}
            .panPx=${this._overviewPanPx}
            .viewportWidth=${this._overviewViewportWidth}
          ></scheduler-overview-add-row>
        `:""}

      ${Object.keys(e).length>t.length&&!1!==this._config.discover_existing?this.showDiscovered?R`

          ${i.map(e=>this._renderRow(e))}

              <div>
                <ha-button
                  appearance="plain"
                  @click=${()=>{this.showDiscovered=!1}}
                >
                  ${Yi("ui.panel.overview.hide_excluded",this.hass)}
                </ha-button>
              </div>
            `:R`
              <div>
                <ha-button
                  appearance="plain"
                  @click=${()=>{this.showDiscovered=!0}}
                >
                  +
                  ${Yi("ui.panel.overview.excluded_items",this.hass,"{number}",Object.keys(e).length-t.length)}
                </ha-button>
              </div>
            `:""}
        </div>
        ${!1!==this._config.show_add_button?R`
        <div class="card-actions">
          ${this.connectionError?R`
          <ha-button appearance="plain" variant="warning" @click=${this._retryConnection}
            >${ns("ui.common.refresh",this.hass)}
          </ha-button>
            `:R`
          <ha-button appearance="plain" @click=${this._addClick}
            >${ns("ui.common.add",this.hass)}
          </ha-button>
          `}
        </div>`:""}
      </ha-card>
    `}async loadSchedules(){Oe(this.hass).then(e=>{this.schedules=Ns(e,this._config,this.hass)}).catch(e=>{this.schedules=[],this.connectionError=!0})}async getCardSize(){return new Promise(e=>{let t=0;const i=setInterval(()=>{var s;if(t++,!this._config||!this.schedules&&!this.connectionError&&t<50)return;let a=this._config.title||this._config.show_header_toggle?3:1;this._config.show_add_button&&(a+=1);const o=(([(null===(s=this._config.display_options)||void 0===s?void 0:s.secondary_info)||[]].flat().length||2)+1)/2;this.schedules&&(a+=this.showDiscovered?Object.keys(this.schedules).length*o:Object.values(this.schedules).filter(e=>ss(e,this._config)).length*o),clearInterval(i),e(Math.round(a))},50)})}_retryConnection(){setTimeout(async()=>{await this.loadSchedules()},100),this.connectionError=!1,this.requestUpdate()}async handleScheduleItemUpdated(e){"scheduler_item_removed"!=e.event?Is(this.hass,e.schedule_id).then(t=>{const i=this.schedules.findIndex(t=>t.schedule_id==e.schedule_id),s=i>=0?this.schedules[i]:null;let a=[...this.schedules||[]];!t||!1===this._config.discover_existing&&!ss(t,this._config)?s&&(a=a.filter(t=>t.schedule_id!==e.schedule_id)):s?s.timestamps[s.next_entries[0]||0]==t.timestamps[t.next_entries[0]||0]?a=Object.assign(a,{[i]:t}):(a=Object.assign(a,{[i]:t}),a=Ns(a,this._config,this.hass)):a=Ns([...a,t],this._config,this.hass),this.schedules=[...a]}):this.schedules=(this.schedules||[]).filter(t=>t.schedule_id!==e.schedule_id)}_renderRow(e){return this.overviewMode?R`
        <scheduler-overview-row
          .hass=${this.hass}
          .config=${this._config}
          .schedule_id=${e.schedule_id}
          .schedule=${e}
          .zoom=${this._overviewZoom}
          .panPx=${this._overviewPanPx}
          .viewportWidth=${this._overviewViewportWidth}
          .editable=${this._overviewEditingEnabled}
          .date=${this._viewDate}
          .spanDays=${this._spanDays}
          .now=${this._isToday&&1===this._spanDays?this._now:void 0}
          @editClick=${t=>{this._handleEditClick(t,e)}}
        >
        </scheduler-overview-row>
      `:R`
        <scheduler-item-row
          .hass=${this.hass}
          .config=${this._config}
          .schedule_id=${e.schedule_id}
          .schedule=${e}
          @editClick=${t=>{this._handleEditClick(t,e)}}
        >
        </scheduler-item-row>
      `}_planClick(e){const t=(this.schedules||[]).find(Wo);this._openPlanDialog(e.target,t)}_openPlanDialog(e,t){const i={schedule:t,cardConfig:this._config};Rs(e,"show-dialog",{dialogTag:"dialog-scheduler-plan",dialogImport:()=>Promise.resolve().then((function(){return nn})),dialogParams:i})}_handleEditClick(e,t){if(!this.schedules)return;if(Wo(t))return void this._openPlanDialog(e.target,t);const i={schedule:qe(t,this.hass),cardConfig:this._config,editItem:t.schedule_id};Rs(e.target,"show-dialog",{dialogTag:"dialog-scheduler-editor",dialogImport:()=>Promise.resolve().then((function(){return Eo})),dialogParams:i})}_addClick(e){const t=[this._config.tags||[]].flat().filter(e=>!["none","disabled","enabled"].includes(e));let i=this._config.default_editor==me.Scheme?JSON.parse(JSON.stringify(Ue)):JSON.parse(JSON.stringify(Ze));const s={schedule:Object.assign(Object.assign({},i),{tags:1==t.length?t:[]}),cardConfig:this._config};Rs(this,"show-dialog",{dialogTag:"dialog-scheduler-editor",dialogImport:()=>Promise.resolve().then((function(){return Eo})),dialogParams:s})}_clampOverviewPan(e,t){const i=Math.max(0,this._overviewViewportWidth*t-this._overviewViewportWidth);return Math.min(Math.max(e,0),i)}_setOverviewZoom(e,t){const i=Math.min(Math.max(e,1),48),s=this._overviewViewportWidth*this._overviewZoom,a=this._overviewPanPx+t,o=(s>0?a/s:0)*(this._overviewViewportWidth*i)-t;this._overviewZoom=i,this._overviewPanPx=this._clampOverviewPan(o,i)}_handleOverviewWidthChanged(e){this._overviewViewportWidth=e.detail.width,this._overviewPanPx=this._clampOverviewPan(this._overviewPanPx,this._overviewZoom)}_handleOverviewZoom(e){const{anchorPx:t,factor:i,absolute:s,animate:a}=e.detail;this._overviewZoomAnimationFrame&&(cancelAnimationFrame(this._overviewZoomAnimationFrame),this._overviewZoomAnimationFrame=void 0);const o=void 0!==s?s:this._overviewZoom*(null!=i?i:1);if(!a)return void this._setOverviewZoom(o,t);const n=this._overviewZoom,r=Math.min(Math.max(o,1),48),d=performance.now(),l=e=>{const i=Math.min((e-d)/220,1),s=1-Math.pow(1-i,3);this._setOverviewZoom(n+(r-n)*s,t),this._overviewZoomAnimationFrame=i<1?requestAnimationFrame(l):void 0};this._overviewZoomAnimationFrame=requestAnimationFrame(l)}_handleOverviewZoomReset(){this._overviewZoomAnimationFrame&&cancelAnimationFrame(this._overviewZoomAnimationFrame);const e=this._overviewZoom,t=this._overviewPanPx,i=performance.now(),s=a=>{const o=Math.min((a-i)/220,1),n=1-Math.pow(1-o,3);this._overviewZoom=e+(1-e)*n,this._overviewPanPx=t+(0-t)*n,this._overviewZoomAnimationFrame=o<1?requestAnimationFrame(s):void 0};this._overviewZoomAnimationFrame=requestAnimationFrame(s)}_handleOverviewPan(e){this._overviewPanPx=this._clampOverviewPan(this._overviewPanPx+e.detail.deltaPx,this._overviewZoom)}_formatClock(){const e=Le(this.hass.locale);return this._now.toLocaleTimeString(void 0,{hour:"numeric",minute:"2-digit",hour12:e})}toggleDisableAll(e){if(!this.hass||!this.schedules)return;const t=e.target.checked;Object.values(this.schedules).filter(e=>this.showDiscovered||ss(e,this._config)).forEach(e=>{this.hass.callService("switch",t?"turn_on":"turn_off",{entity_id:e.entity_id})})}static getConfigElement(){return document.createElement("scheduler-card-editor")}},e.SchedulerCard.styles=r`
    .card-header {
      display: flex;
      justify-content: space-between;
    }
    .card-header .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
    }
    .card-header .header-actions {
      display: flex;
      align-items: center;
    }
    .card-header .clock {
      flex: 1;
      text-align: center;
      font-size: 0.95rem;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color);
      white-space: nowrap;
    }
    .card-header ha-switch {
      display: flex;
      align-self: center;
      margin: 0px 6px;
      line-height: 24px;
    }

    #states > * {
      margin: 8px 0;
    }
    #states > *:first-child {
      margin-top: 0;
    }
    #states > *:last-child {
      margin-bottom: 0;
    }
  
    button.show-more {
      color: var(--primary-color);
      text-align: left;
      cursor: pointer;
      background: none;
      border-width: initial;
      border-style: none;
      border-color: initial;
      border-image: initial;
      font: inherit;
    }
    button.show-more:focus {
      outline: none;
      text-decoration: underline;
    }
    .card-actions, .card-actions > * { 
      display: flex;
    }
  `,t([le({attribute:!1})],e.SchedulerCard.prototype,"hass",void 0),t([le()],e.SchedulerCard.prototype,"_config",void 0),t([ce()],e.SchedulerCard.prototype,"schedules",void 0),t([ce()],e.SchedulerCard.prototype,"showDiscovered",void 0),t([ce()],e.SchedulerCard.prototype,"overviewMode",void 0),t([ce()],e.SchedulerCard.prototype,"_overviewZoom",void 0),t([ce()],e.SchedulerCard.prototype,"_overviewPanPx",void 0),t([ce()],e.SchedulerCard.prototype,"_overviewViewportWidth",void 0),t([ce()],e.SchedulerCard.prototype,"_now",void 0),t([ce()],e.SchedulerCard.prototype,"_viewDate",void 0),t([ce()],e.SchedulerCard.prototype,"_spanDays",void 0),e.SchedulerCard=t([re("scheduler-card")],e.SchedulerCard),window.customCards=window.customCards||[],window.customCards.push({type:"scheduler-card",name:"Scheduler Card",description:"Card to manage schedule entities made with scheduler-component."}),console.info("%c  SCHEDULER-CARD  \n%c  Version: "+"v4.1.0".padEnd(7," "),"color: orange; font-weight: bold; background: black","color: white; font-weight: bold; background: dimgray")}({});
