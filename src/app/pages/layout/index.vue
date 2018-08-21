<template>
  <div class="blog-app-view">
    <main class="main-view">
      <transition name="slide-fade">
        <router-view class="body-view-wrap"></router-view>
      </transition>
    </main>
  </div>
</template>

<script>
  export default {
    name: 'video-app-layout',
    data: function () {
      return {}
    },
    components: {},
    mounted() {
    },

    methods: {}
  }
</script>


<style lang="less" scoped>
  @import "index.less";
</style>
