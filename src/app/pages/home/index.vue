<template>
  <div class="video-home-view">
    <div class="pop-player-overlay">
      <div class="quick-player-container" :style="videoStyle">
        <player :video="video"></player>
        <i class="next-icon" @click="playNextVideoHandler" :class="{disabled: currentVideoIndex===videos.length-1}">
          <svg id="svg_qp_icon_next" viewBox="0 0 22 43">
            <path
              d="M0.19 0.16a.9.9 0 0 0 .2 1.21l19.91 20.13-19.91 20.13a.9.9 0 0 0-.2 1.21.86.86 0 0 0 1.19-.21l20.4-20.63a.627.627 0 0 0 0-1l-20.4-20.63a.86.86 0 0 0-1.19-.21z"></path>
          </svg>
        </i>
      </div>
      <div class="quick-player-footer" ref="footer" v-show="videos.length">
        <div class="qp-videos-scroll-container">
          <div class="qp-videos-wrap" ref="videosWrap">
            <ul class="qp-video-list" :style="translateListStyle">
              <li class="qp-video-item" :class="{current: currentVideoIndex===index, 'locked': !video.token}"
                  v-for="(video, index) in videos"
                  @click="switchVideoHandler(video, index)">
                <div class="video-poster-holder">
                  <img :src="video.posterUrl" alt="">
                  <span class="video-duration-info">{{formatDuration(video.duration)}}</span>
                </div>
                <div class="qp-video-title">{{video.title}}</div>
              </li>
              <li class="qp-video-item last-item-holder" ref="lastItem">
                <div>END</div>
              </li>
            </ul>
          </div>
          <div class="qp-prev-btn" @click="prevHandler"></div>
          <div class="qp-next-btn" @click="nextHandler"></div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import Player from '../../components/player'
  import VideoJs from 'video.js'

  import {
    onloadVideos,
    resolveResourcePath,
    loadPresentableAuths,
    loadPresentableInfo
  } from '../../data'

  require('video.js/dist/video-js.css')
  require('videojs-playbackrate-adjuster');
  require('videojs-contrib-hls')
  export default {
    name: 'video-app-home',
    data: function () {
      return {
        video: {},
        videoPoster: '/resources/mock/images/post.jpg',
        videos: [],
        translateX: 0,
        playerWidth: 500,
        playerHeight: 300,
        currentVideoIndex: 0
      }
    },
    components: {
      Player
    },
    mounted() {
      // this.mock()
      // this.video = this.videos[0]

      this.loadVideos()
        .then(videos => {
          if (videos && videos.length) {
            this.videos = videos.reverse();
            this.video = this.videos[0]
          }
        })
      VideoJs('video-player', {
        playbackRates: [0.5, 1, 1.5, 2]
      });

      window.addEventListener('resize', this.recalculateHandler.bind(this))
      this.$nextTick(() => {
        this.recalculateHandler()
      });
    },
    computed: {
      translateListStyle() {
        return {transform: `translateX(${-this.translateX}px)`}
      },
      videoStyle() {
        return {
          width: `${this.playerWidth}px`,
          height: `${this.playerHeight}px`
        }
      }
    },
    methods: {
      loadVideos() {
        return new Promise((resolve, reject) => {
          onloadVideos(data => {
            if (data && Array.isArray(data)) {
              loadPresentableAuths(data.map(v => v.presentableId)).then(res => {
                var presentablesMap = res.data
                data.forEach(item => {
                  var presentable = presentablesMap[item.presentableId]
                  var token = presentable['freelog-sub-resource-auth-token']

                  Object.assign(item, item.resourceInfo.meta.profile);
                  item.authInfo = presentable
                  item.sources = [{
                    src: resolveResourcePath(item.presentableId),
                    type: 'video/mp4'
                  }];
                  if (item.poster && token) {
                    item.token = token
                    item.posterUrl = resolveResourcePath(item.poster, token)
                  } else {
                    item.posterUrl = ''
                  }
                });

                resolve(data)
              })
            } else {
              reject(data)
            }
          })
        })
      },
      mock() {
        var videos = [];
        var list = ['video_360x240_1mb.mp4', 'video_360x240_2mb.mp4',
          'video_640x360_1mb.mp4',
          'video_640x360_2mb.mp4',
          'video_720x480_1mb.mp4',
          'video_1280x720_1mb.mp4',
          'video_1280x720_2mb.mp4',
          'video_1280x720_5mb.mp4']
        var images = ['post.jpg', 'post1.png', 'post2.jpg']
        var len = Math.max(20, parseInt(Math.random() * 100));
        for (var i = 0; i < len; i++) {
          var video = {
            presentableId: i,
            poster: '/resources/mock/images/' + images[Math.floor(Math.random() * images.length)],
            title: '真人秀嘻嘻嘻嘻真人秀嘻嘻嘻嘻真人秀嘻嘻嘻嘻',
            date: '2018-03-28T08:04:26.720Z',
            duration: Math.round(Math.random() * 1e4),
            sources: [{
              src: '/resources/mock/videos/' + list[Math.floor(Math.random() * list.length)]
            }]
          };

          videos.push(video)
        }
        this.videos = videos
      },
      getElementStyle($el, prop) {
        return $el && getComputedStyle($el)[prop] || 0
      },
      recalculateHandler() {
        var footerHeight = parseInt(this.getElementStyle(this.$refs.footer, 'height')) || 160;
        this.playerHeight = window.innerHeight - footerHeight - 80;
        this.playerWidth = (this.playerHeight * 1.778).toFixed(2);
        this.offsetWidth = this.$refs.lastItem.offsetWidth;
      },
      prevHandler() {
        this.translateX = Math.max(this.translateX - this.offsetWidth, 0)
      },
      nextHandler() {
        if (!this.videos.length) {
          return
        }
        if (!this.offsetWidth) {
          this.offsetWidth = this.$refs.lastItem.offsetWidth;
        }
        var maxX = Math.max(this.$refs.lastItem.offsetLeft - this.$refs.videosWrap.offsetWidth + this.offsetWidth, 0)
        var tx = this.translateX + this.offsetWidth;
        this.translateX = Math.min(tx, maxX)
      },
      playNextVideoHandler() {
        var index = this.currentVideoIndex + 1;
        if (index < this.videos.length) {
          this.switchVideoHandler(this.videos[index], index)
          this.nextHandler()
        }
      },
      padNum(num) {
        num = num || ''
        return num.toString().padStart(2, '0') || '';
      },
      formatDuration(duration) {
        var interval = 60;
        var s = duration % interval;
        var m = parseInt(duration / interval);
        var h = parseInt(m / interval);
        var str = this.padNum(s);
        str = this.padNum(m % 60) + ':' + str;

        if (h) {
          str = this.padNum(h) + ':' + str;
        }

        return str
      },
      switchVideoHandler(video, index) {
        if (!video.token) {
          window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE',{response: video.authInfo})
          return
        }

        this.currentVideoIndex = index
        this.video = video
        this.videoPoster = video.poster
      }
    }
  }
</script>


<style lang="less" scoped>
  @import "index.less";
</style>
