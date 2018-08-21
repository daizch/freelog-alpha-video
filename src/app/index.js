import Vue from 'vue'
import router from './router'
import './index.less'
import App from './pages/app'

var template = document.currentScript.parentNode.querySelector('template');
class FreelogAlphaVideo extends HTMLElement {
  constructor() {
    super()
  }

  initApp() {
    var app = new Vue({
      el: '#video-app',
      router,
      template: '<App/>',
      components: {App}
    });
  }

  connectedCallback() {
    this.innerHTML = template.innerHTML
    this.initApp()
  }

}


customElements.define('freelog-alpha-video', FreelogAlphaVideo);
