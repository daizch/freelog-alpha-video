<template>
  <div class="video-player-wrapper" v-show="video.sources&&video.sources.length">
    <video id="video-player" class="video-js" data-setup="{}">
      <!--<source src="/resources/mock/videos/video_720x480_1mb.mp4" type='video/mp4'>-->
      <slot name="support">
        <p class="vjs-no-js">
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
        </p>
      </slot>
    </video>
    <div class="qp-video-meta">
      <div class="video-pv-meta">
        <i class="pv-icon">
          <svg class="svg_icon svg_icon_play_sm" viewBox="0 0 16 16" width="16" height="16">
            <path
              d="M10.83 8.309l-.001.023-4.079 2.539-.005.003-.048.03-.013-.005c-.072.051-.149.1-.245.1-.217 0-.376-.165-.412-.369l-.028-.011V5.461l.009-.005c0-.009-.009-.014-.009-.022 0-.24.197-.435.44-.435.096 0 .174.049.246.101l.032-.017 4.129 2.569v.016a.42.42 0 0 1 .153.318.414.414 0 0 1-.169.323zm3.493 2.605a.986.986 0 0 1-.948.742 1 1 0 0 1-1-1 .98.98 0 0 1 .094-.412l-.019-.01c.34-.675.549-1.427.549-2.235a5 5 0 1 0-5 5c.767 0 1.484-.186 2.133-.494l.014.03a.968.968 0 0 1 .416-.098 1 1 0 0 1 1 1 .986.986 0 0 1-.77.954 6.897 6.897 0 0 1-2.793.608 7 7 0 1 1 7-7c0 1.048-.26 2.025-.676 2.915z"></path>
          </svg>
        </i>
        <span>{{showPv}}次播放</span>
      </div>
      <h3>{{video.title}}</h3>
      <p>{{showDate}}</p>
    </div>
  </div>
</template>

<script>
  import VideoJs from 'video.js'

  require('video.js/dist/video-js.css')
  require('videojs-playbackrate-adjuster');
  // require('videojs-contrib-hls')

  window.VideoJs = VideoJs
  export default {
    name: 'video-app-player',
    data: function () {
      return {
        articles: [],
        pv: 0
      }
    },

    props: {
      video: Object,
      poster: String,
      config: {
        type: Object,
        default() {
          return {
            autoplay: true,
            controls: true,
            preload: 'auto',
            poster: ''
          }
        }
      },
      rates: {
        type: Array,
        default() {
          return [0.5, 1, 1.5, 2]
        }
      }
    },

    watch: {
      video() {
        this.resetVideo()
      }
    },
    computed: {
      showDate() {
        if (!this.video.createDate) {
          return ''
        }
        var d = new Date(this.video.createDate)
        return d.toLocaleDateString()
      },
      showPv() {
        var pv = this.pv < 1e4 ? this.pv : ((this.pv / 1e4).toFixed(1) + '万')
        return pv
      }
    },
    mounted() {
      var config = Object.assign({
        playbackRates: this.rates,
        sources: this.video.sources
      }, this.config);

      this.player = VideoJs('video-player', config);
    },
    methods: {
      queryPV(key) {
        window.QI.fetch(`/v1/customStores/${key}`).then(res => {
          return res.json()
        }).then(data => {
          var result = data.data
          if (result && result.value) {
            this.pv = result.value.pv || 1
          } else {
            this.pv = 1
          }
          this.updatePV(key, this.pv + 1)
        })
      },
      updatePV(key, pv) {
        return window.QI.fetch(`/v1/customStores/createOrUpdate`, {
          method: 'POST',
          data: {
            key: key,
            nodeId: 10016,
            value: {
              pv: pv
            }
          }
        }).then(res => {
          return res.json()
        })
      },
      resetVideo() {
        var key = `node_10016_videopv_${this.video.presentableId}`
        this.queryPV(key)
        this.video.sources.forEach(source => {
          this.player.src(source)
          this.player.play()
        })
      }
    }
  }
</script>


<style lang="less" scoped>
  @import "player.less";
</style>
