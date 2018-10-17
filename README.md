# freelog-alpha-video

> video widget for freelog

## Build Setup

``` bash
# install dependencies
npm install

# serve at localhost:9001
npm run dev

# build for production with minification
npm run build
```


## 使用

### resource数据

#### meta定义

- title: 视频标题
- duration: 视频时长，单位秒
- poster: 对应的视频封面图资源Id，图比例16:9

例如
```json
{
  "profile": {
    "title": "小明砸锅",
    "duration": "126",
    "poster": "1sdsasdf8sdfjakd"
  }
}
```


## config
package.json中freelogConfig字段可配置freelog资源相关的配置数据。
