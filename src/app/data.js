function createLoader(loader) {
  var loading = false;
  var handles = [];
  var value;

  return function (callback) {
    if (value) {
      callback(value)
    } else if (loading) {
      handles.push(callback)
    } else {
      loading = true;
      handles.push(callback)
      loader(function (v) {
        value = v;
        let h;
        while ((h = handles.shift())) {
          h(v)
        }
      })
    }
  }
}

const nodeId = window.__auth_info__.__auth_node_id__

function loadResourcesByTags(tags) {
  return window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${nodeId}&tags=${tags}`).then(res => res.json())
    .then(res => {
      if (res.errcode === 0) {
        return res.data
      } else {
        return res
      }
    })
}

function loadBlogConfig() {
  return loadResourcesByTags('blog-config')
    .then(data => {
      if (data.errcode === undefined) {
        var presentable = data[0]
        if (presentable) {
          return requestPresentableData(presentable.presentableId).then(data => {
            return Object.assign(presentable, data)
          })
        } else {
          return null
        }
      } else {
        window.FreelogApp.trigger('HANDLE_INVALID_RESPONSE',{response: data})
      }
    })
}


var onloadVideos = createLoader(function (callback) {
  window.FreelogApp.QI.fetch(`/v1/presentables?nodeId=${nodeId}&resourceType=video`)
    .then(res => res.json())
    .then(res => {
      if (res.errcode === 0) {
        callback(res.data)
      } else {
        callback(res)
      }
    })
});

function loadPresentableInfo(presentableId) {
  return window.FreelogApp.QI.fetch(`/v1/auths/presentable/${presentableId}.info?nodeId=${nodeId}`).then(res => {
    var token = res.headers.get('freelog-sub-resource-auth-token') || null;
    var rids = res.headers.get('freelog-sub-resourceids') || ''
    rids = rids.split(',')
    return res.json().then(data => {
      data.token = token
      data.subResources = rids
      return data
    })
  })
}

function loadPresentableAuths(pids) {
  return window.FreelogApp.QI.fetch(`/qi/v1/presentables/auth.json?nodeId=${nodeId}`, {
    data: {
      pids: pids.join(',')
    }
  }).then(res => {
    return res.json()
  })
}


function requestPresentableData(presentableId) {
  return window.FreelogApp.QI.fetch(`/v1/auths/presentable/${presentableId}?nodeId=${nodeId}`)
    .then(res => {
      var meta = decodeURIComponent(res.headers.get('freelog-meta'))
      var token = decodeURIComponent(res.headers.get('freelog-sub-resource-auth-token'))
      var resource

      try {
        resource = JSON.parse(meta)
        token = JSON.parse(token)
      } catch (e) {
        resource = {}
      }
      if (!resource) {
        return res.json().then(errResponse => {
          return loadPresentableInfo(presentableId)
            .then(res => {
              resource = res.data.resourceInfo.meta || {}
              resource.presentableId = presentableId
              resource.error = errResponse
              resource.token = token
              return Object.assign(resource, res.data);
            })
        })
      } else {
        return res.text().then(content => {
          resource.content = content;
          resource.token = token
          return resource
        })
      }
    })
}

function getResourceToken(pid) {
  return window.FreelogApp.QI.fetch(`/v1/auths/presentable/${pid}?nodeId=${nodeId}`)
    .then(res => {
      var token = decodeURIComponent(res.headers.get('freelog-sub-resource-auth-token'))
      // var resourceIds = decodeURIComponent(res.headers.get('freelog-sub-resourceids'))

      return token
    });
}

function resolveResourcePath(id, token) {
  if (token) {
    return `/api/v1/auths/presentable/subResource/${id}?token=${token}`
  }
  return `/api/v1/auths/presentable/${id}?nodeId=${nodeId}`
}


var presentablesMap = {}

function onloadPresentableData(presentableId, disabledCache) {
  if (!disabledCache && presentablesMap[presentableId]) {
    return Promise.resolve(presentablesMap[presentableId])
  } else {
    return requestPresentableData(presentableId).then((resource) => {
      if (!resource.presentableId) {
        return loadPresentableInfo(presentableId)
          .then(res => {
            presentablesMap[presentableId] = resource
            return Object.assign(res.data, resource);
          })
      } else {
        presentablesMap[presentableId] = resource
        return resource
      }
    })
  }
}


//alias
var onloadResourceContent = onloadPresentableData

export {
  getResourceToken,
  resolveResourcePath,
  onloadVideos,
  loadBlogConfig,
  loadResourcesByTags,
  onloadPresentableData,
  onloadResourceContent,
  loadPresentableInfo,
  loadPresentableAuths
}
