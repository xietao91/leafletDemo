<template>
  <div>
    <el-button class="draw" @click="draw()">绘制</el-button>
    <el-button class="disDraw" @click="disDraw()">关闭绘制</el-button>
    <el-button class="allEdit" @click="allEdit()">全体编辑</el-button>
    <el-button class="allDisedit" @click="allDisedit()">全体禁止编辑</el-button>
    <el-button class="changeEdit" @click="changeEdit()">全体切换编辑</el-button>
    <el-button class="isEdit" @click="isEdit()">是否启用编辑</el-button>
    <el-button class="changeDrag" @click="changeDrag()">启用拖拽</el-button>
    <el-button class="removalMode" @click="removalMode()">启用移除</el-button>
    <el-button class="cutMode" @click="cutMode()">启用切割</el-button>
    <el-select
      style="width: 150px;"
      v-model="markerType"
      placeholder="marker类型"
      @change="changeMarkerType"
    >
      <el-option label="默认" value="default"></el-option>
      <el-option label="皮卡丘" value="pikachu"></el-option>
    </el-select>
    <el-select
      style="width: 150px;"
      v-model="mapType"
      placeholder="选择地图"
      @change="changeMapType"
    >
      <el-option label="谷歌" value="google"></el-option>
      <el-option label="osm" value="osm"></el-option>
    </el-select>
    <el-switch
      v-model="showHeatMap"
      @change="changeHeatMapShow"
      active-text="显示热力图"
      inactive-text="隐藏热力图"
    >
    </el-switch>
    <el-switch
      @change="showRoute"
      v-model="hideMenu"
      active-text="隐藏轨迹"
      inactive-text="显示轨迹"
    >
    </el-switch>

    <div id="map"></div>
    <div class="menuBar" :class="{ hide: hideMenu }">
      <el-button type="button" value="开始" @click="startClick()">开始</el-button>
      <el-button type="button" value="暂停" @click="pauseClick()" >暂停</el-button>
      <el-button type="button" value="加速" @click="speetUp()" >加速</el-button>
      <el-button type="button" value="减速" @click="speetDown()" >减速</el-button>
      <el-button type="button" value="停止" @click="stopClick()" >停止</el-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import FromPopUp from '../../components/formPopUp.vue'
import HeatmapOverlay from 'leaflet-heatmap'
import '../js/AnimatedMarker'
export default {
  data() {
    return {
      map: '',
      markerType: '',
      mapType: '',
      googleMapUrl:
        'http://mt1.google.cn/vt/lyrs=y@160000000&hl=zh-CN&gl=CN&src=app&y={y}&x={x}&z={z}&s=Ga',
      osmMapUrl: 'http://tile.osm.org/{z}/{x}/{y}.png',
      tileLayer: null,
      showHeatMap: false,
      heatmapLayer: null,
      hideMenu: true,
      animatedMarker: null,
      realRouteLine: null,
      newLatlngs: [],
      speetX: 1,
      decorator: null,
      routeLine: null
    }
  },
  mounted() {
    this.initDate()
  },
  methods: {
    initDate() {
      this.map = L.map('map', {
        center: [40.02404009136253, 116.50641060224784], // 地图中心
        zoom: 14, // 缩放比列
        zoomControl: false, // 禁用 + - 按钮
        doubleClickZoom: false, // 禁用双击放大
        attributionControl: false, // 移除右下角leaflet标识
        preferCanvas: true // 强制使用canvas渲染
      })
      this.tileLayer = L.tileLayer(this.googleMapUrl)
      this.tileLayer.addTo(this.map)
      //   name.remove(this.map)
      //   this.map.removeLayer(name)
      this.map.pm.addControls({
        position: 'topleft',
        drawPolygon: true, // 添加绘制多边形
        drawMarker: true, // 添加按钮以绘制标记
        drawCircleMarker: true, // 添加按钮以绘制圆形标记
        drawPolyline: true, // 添加按钮绘制线条
        drawRectangle: true, // 添加按钮绘制矩形
        drawCircle: true, //  添加按钮绘制圆圈
        editMode: true, //  添加按钮编辑多边形
        dragMode: true, //   添加按钮拖动多边形
        cutPolygon: true, // 添加一个按钮以删除图层里面的部分内容
        removalMode: true // 清除图层
      })
      // 设置绘制线条颜色
      this.map.pm.setPathOptions({
        color: 'orange',
        fillColor: 'green',
        fillOpacity: 0.4
      })
      this.map.pm.setLang('zh') // 设置语言  en, de, it, ru, ro, es, fr, pt_br, zh , nl
      this.getlatLngs()
    },

    // 绘制
    draw() {
      this.map.pm.enableDraw('Polygon', {
        snappable: false,
        snapDistance: 10
      })
      //   this.map.pm.enableDraw("Marker", { snappable: false });
      //   this.map.pm.enableDraw("CircleMarker", { snappable: false });
      // this.getlatLngs()
    },

    // 禁止绘制
    disDraw() {
      let options = {
        templineStyle: {
          color: 'green'
        },

        hintlineStyle: {
          color: 'red',
          dashArray: [5, 5]
        }
      }
      this.map.pm.disableDraw('Polygon', options)
      //    this.map.pm.disableDraw('Marker');
      //    this.map.pm.disableDraw('CircleMarker');
    },

    // 获取绘制的坐标
    getlatLngs() {
      // pm:drawstart 开始第一个点的时候调用
      // pm:drawend  禁止绘制时调用
      // pm:create  创建完成时调用
      this.map.on('pm:drawstart', e => {
        console.log(e, 'first')
      })
      this.map.on('pm:drawend', e => {
        console.log(e, '禁止绘制')
      })
      this.map.on('pm:create', e => {
        console.log(e, '绘制完成时调用')
        if (e.shape === 'Marker') {
          console.log(e.layer._latlng, '绘制坐标')
          // alert('精度:' + e.layer._latlng.lat + ',纬度:' + e.layer._latlng.lng)
          const { marker } = e
          // marker.bindPopup('大家好我是皮卡丘').openPopup()
          this.bindMarkPopUp(marker)
        } else {
          console.log(e.layer._latlngs[0], '绘制坐标')
        }
        e.layer.pm.enable({
          allowSelfIntersection: false,
          preventMarkerRemoval: false // 禁止右键删除点
        })
        e.layer.on('pm:edit', e => {
          console.log(e, '拖动')
          console.log(e.target._latlngs[0], '拖动后的坐标')
        })
        e.layer.on('pm:vertexadded', e => {
          console.log(e, '添加顶点')
        })
        e.layer.on('pm:cut', e => {
          console.log(e, '切割')
        })
      })

      this.map.on('contextmenu', e => {
        console.log(e, '点击')
        this.$notify.info({
          title: '经纬度',
          message: '经度:  ' + e.latlng.lat + ',纬度:  ' + e.latlng.lng
        })
      })
    },

    // 开启全体编辑按钮
    allEdit() {
      this.map.pm.toggleGlobalEditMode()
    },

    // 禁用全局编辑按钮
    allDisedit() {
      this.map.pm.disableGlobalEditMode()
    },

    // 全局编辑切换
    changeEdit() {
      this.map.pm.toggleGlobalEditMode()
    },

    // 判断是否全局编辑
    isEdit() {
      alert(this.map.pm.globalEditEnabled())
    },

    // 切换拖拽
    changeDrag() {
      this.map.pm.toggleGlobalDragMode()
      // 是否启用全局拖动模式
      alert(this.map.pm.globalDragModeEnabled())
    },

    // 移除功能
    removalMode() {
      this.map.pm.toggleGlobalRemovalMode()
    },

    // 切割
    cutMode() {
      // 开始
      //   this.map.pm.Draw.Cut.enable({
      //     allowSelfIntersection: false
      //   });
      // 关闭
      //   this.map.pm.Draw.Cut.disable()
      // 切换
      this.map.pm.Draw.Cut.toggle()
    },
    pikachuMarker() {
      L.Icon.Default.mergeOptions({
        iconUrl: require('@/assets/pikachu.png'),
        iconRetinaUrl: require('@/assets/pikachu.png'),
        iconSize: [100, 100]
      })
      this.map.pm.disableDraw('Marker')
    },
    defaultMarker() {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        iconSize: null
      })
      this.map.pm.disableDraw('Marker')
    },
    bindMarkPopUp(marker) {
      marker.on('click', e => {
        console.log(e, '点击')
        L.popup()
          .setLatLng(e.latlng)
          .setContent(
            '<div id="mapDialog-container" style="width: 860px;height:400px"></div>'
          )
          .openOn(this.map)
      })
      this.map.on('popupopen', e => {
        console.log(e, '弹出')
        this.getDialog()
      })
    },
    getDialog(data) {
      // 创建构造器
      let Content = Vue.extend(FromPopUp)
      console.log(document.getElementById('mapDialog-container'))
      // 创建 Profile 实例，并挂载到一个元素上。
      new Content().$mount('#mapDialog-container')
    },
    changeMarkerType() {
      if (this.markerType === 'default') {
        this.defaultMarker()
      } else if (this.markerType === 'pikachu') {
        this.pikachuMarker()
      }
    },
    changeMapType() {
      if (this.mapType === 'google') {
        this.tileLayer.setUrl(this.googleMapUrl)
      }

      if (this.mapType === 'osm') {
        this.tileLayer.setUrl(this.osmMapUrl)
      }
    },
    addHeatMap() {
      const testData = {
        max: 100,
        data: [
          { lat: 40.03964, lng: 116.52161, count: 100, radius: 0.02 },
          {
            lat: 40.13481271222848,
            lng: 116.49842720009386,
            count: 100,
            radius: 0.03
          },
          {
            lat: 40.34243464259617,
            lng: 116.48147232762116,
            count: 100,
            radius: 0.05
          },
          {
            lat: 39.91966488264825,
            lng: 116.48233080217678,
            count: 100,
            radius: 0.1
          }
        ]
      }

      const cfg = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        radius: 0.002,
        maxOpacity: 0.8,
        // scales the radius based on map zoom
        scaleRadius: true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        useLocalExtrema: true,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'count'
      }

      this.heatmapLayer = new HeatmapOverlay(cfg)
      this.heatmapLayer.setData(testData)
      this.map.addLayer(this.heatmapLayer)
    },
    changeHeatMapShow() {
      if (this.showHeatMap) {
        this.addHeatMap()
      } else {
        this.map.removeLayer(this.heatmapLayer)
      }
    },
    showRoute() {
      if (!this.hideMenu) {
        this.map.panTo(new L.LatLng(39.924317, 116.390619))
        const latlngs = [
          [39.898457, 116.391844],
          [39.898595, 116.377947],
          [39.898341, 116.368001],
          [39.898063, 116.357144],
          [39.899095, 116.351934],
          [39.905871, 116.350670],
          [39.922329, 116.349800],
          [39.931017, 116.349671],
          [39.939104, 116.349225],
          [39.942233, 116.349910],
          [39.947263, 116.366892],
          [39.947568, 116.387537],
          [39.947764, 116.401988],
          [39.947929, 116.410824],
          [39.947558, 116.426740],
          [39.939700, 116.427338],
          [39.932404, 116.427919],
          [39.923109, 116.428377],
          [39.907094, 116.429583],
          [39.906858, 116.414040],
          [39.906622, 116.405321],
          [39.906324, 116.394954],
          [39.906308, 116.391264],
          [39.916611, 116.390748]
        ]
        const speedList = [1, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 4, 4, 4, 3, 2, 2, 1, 1, 1]
        // 轨迹线
        this.routeLine = L.polyline(latlngs, {
          weight: 8
        }).addTo(this.map)
        // 实时轨迹线
        this.realRouteLine = L.polyline([], {
          weight: 8,
          color: '#FF9900'
        }).addTo(this.map)
        // 轨迹方向箭头
        this.decorator = L.polylineDecorator(this.routeLine, {
          patterns: [{
            repeat: 50,
            symbol: L.Symbol.arrowHead({
              pixelSize: 5,
              headAngle: 75,
              polygon: false,
              pathOptions: {
                stroke: true,
                weight: 2,
                color: '#FFFFFF'
              }
            })
          }]
        }).addTo(this.map)

        const carIcon = L.icon({
          iconSize: [37, 26],
          iconAnchor: [19, 13],
          iconUrl: require('@/assets/car.png')
        })
        // 动态marker
        this.animatedMarker = L.animatedMarker(this.routeLine.getLatLngs(), {
          speedList: speedList,
          interval: 200, // 默认为100mm
          icon: carIcon,
          playCall: this.updateRealLine
        })
        this.animatedMarker.addTo(this.map)
        this.newLatlngs = [this.routeLine.getLatLngs()[0]]
      } else {
        debugger
        this.map.removeLayer(this.animatedMarker)
        this.map.removeLayer(this.decorator)
        this.map.removeLayer(this.realRouteLine)
        this.map.removeLayer(this.routeLine)
      }
    },
    updateRealLine(latlng) {
      this.newLatlngs.push(latlng)
      this.realRouteLine.setLatLngs(this.newLatlngs)
    },
    // 加速
    speetUp() {
      this.speetX = this.speetX * 2
      this.animatedMarker.setSpeetX(this.speetX)
    },
    // 减速
    speetDown() {
      this.speetX = this.speetX / 2
      this.animatedMarker.setSpeetX(this.speetX)
    },
    // 开始
    startClick() {
      this.animatedMarker.start()
    },
    // 暂停
    pauseClick() {
      this.animatedMarker.pause()
    },
    // 停止
    stopClick() {
      this.newLatlngs = []
      this.animatedMarker.stop()
    }
  }
}
</script>

<style lang="stylus" scoped>
#map {
  width: 100%;
  height: calc(100vh);
  z-index: 1;
}

.menuBar {
    width: 600px;
    position: fixed;
    text-align: center;
    top: 50px;
    left: 50px;
    padding: 5px;
    border-radius: 3px;
    z-index: 999;
    color: #ffffff;
    background-color: rgba(0, 168, 0, 1);

    &.hide {
      display: none;
    }
 }
</style>
