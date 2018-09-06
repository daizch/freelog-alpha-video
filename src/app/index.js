import Vue from 'vue'
import router from './router'
import './index.less'
import App from './pages/app'

var html = require('./index.html')

class FreelogAlphaVideo extends HTMLElement {
  constructor() {
    super()
  }

  initApp() {
    var app = new Vue({
      el: this.querySelector('.alpha-video-app'),
      router,
      template: '<App/>',
      components: {App}
    });
  }

  connectedCallback() {
    this.innerHTML = html
    this.initApp()
  }
}

customElements.define('freelog-alpha-video', FreelogAlphaVideo);
// export default FreelogAlphaVideo;
