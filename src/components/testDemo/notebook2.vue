<template>
  <div>
    <button class="allEdit" @click="allEdit()">编辑</button>
    <button class="allDisedit" @click="allDisedit()">禁止编辑</button>
    <button class="addOnclick" @click="addOnclick()">添加点击事件</button>
    <button class="removeOnclick" @click="removeOnclick()">移除点击事件</button>
    <button class="changePplygon" @click="changePplygon()">将矩形置为顶层</button>
    <button class="resert" @click="resert()">重置矩形</button>
    <div id="map"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      map: "",
      drawObj: "",
      drawRadius: ""
    };
  },
  mounted() {
    this.initDate();
  },
  methods: {
    initDate() {
      this.map = L.map("map", {
        center: [40.02404009136253, 116.50641060224784], // 地图中心
        zoom: 14, //缩放比列
        zoomControl: false, //禁用 + - 按钮
        doubleClickZoom: false, // 禁用双击放大
        attributionControl: false // 移除右下角leaflet标识
      });
      let name = L.tileLayer(
        "http://mt0.google.cn/vt/lyrs=y@160000000&hl=zh-CN&gl=CN&src=app&y={y}&x={x}&z={z}&s=Ga"
      ).addTo(this.map);
      this.drawPolygon();
    },

    //绘制多边形矩形
    drawPolygon() {
      let latlngs = [
        [40.0214690112063, 116.50239229202272],
        [40.019694293123855, 116.50224208831787],
        [40.01979288978388, 116.50580406188966],
        [40.021436146476105, 116.50601863861085],
        [40.02253710631967, 116.50316476821901]
      ];
      // color：线段颜色
      // weight：线段宽度
      // opacity：线段透明度
      // dashArray：虚线间隔
      // fill：是否填充内部(true/false)
      // fillColor:内部填充颜色，如不设置，默认为color颜色
      // fillOpacity：内部填充透明度
      this.drawObj = L.polygon(latlngs, { color: "red" }).addTo(this.map);
      console.log("latlngs", this.drawObj.getLatLngs())
      this.drawObj.on("pm:edit", obj => {
        obj.target.setStyle({ color: "orange" });
        console.log(obj.target._latlngs[0]);
        console.log("latlngs", this.drawObj.getLatLngs())
      });
      this.drawRadius = L.circle([40.0224690112063, 116.51339229202272], {
        radius: 200
      }).addTo(this.map);
      this.drawRadius.on("pm:edit", obj => {
        obj.target.setStyle({ color: "orange" });
        console.log(obj.target._latlng);
      });
    },

    // 开启编辑按钮
    allEdit() {
      this.drawObj.pm.enable({
        allowSelfIntersection: false
      });
      this.drawRadius.pm.enable({
        allowSelfIntersection: false
      });
    },

    // 禁用编辑按钮
    allDisedit() {
      this.drawObj.pm.disable();
      this.drawRadius.pm.disable();
    },

    // 添加点击事件
    addOnclick() {
      this.drawObj.on("click", e => {
        alert("我是矩形点击事件");
      });
      this.drawRadius.on("click", e => {
        alert("我是圆形点击事件");
      });
      this.drawObj.on("contextmenu", e => {
        alert("我是矩形右键事件");
      });
      this.drawRadius.on("contextmenu", e => {
        alert("我是圆形右键事件");
      });
      /*
      click: 点击事件
      dblclick：双击	
      mousedown：按下鼠标按钮
      mouseup：释放鼠标按钮
      mouseover：鼠标进入
      mouseout：鼠标离开
      mousemove：鼠标移入
      contextmenu：鼠标右键
      preclick：点击之前
      */
    },

    // 移除点击事件
    removeOnclick() {
      this.drawObj.off("click");
      this.drawRadius.off("click");
      this.drawObj.off("contextmenu");
      this.drawRadius.off("contextmenu");
    },

    changePplygon() {
      this.drawRadius.bringToBack(); // 置为顶层
      //   this.drawObj.bringToFront(); // 置为底层
    },

    // 重置矩形
    resert() {
      this.drawObj.setLatLngs([
        [40.0214690112063, 116.50239229202272],
        [40.019694293123855, 116.50224208831787],
        [40.01979288978388, 116.50580406188966],
        [40.021436146476105, 116.50601863861085],
        [40.02253710631967, 116.50316476821901]
      ]);
      this.drawObj.setStyle({ color: "red" });
      this.drawObj.pm.disable();
    }
  }
};
</script>

<style lang="stylus" scoped>
#map {
  width: 100%;
  height: calc(100vh);
  z-index: 1;
}

.allEdit {
  display: flex;
  z-index: 2;
  width: 60px;
  height: 50px;
  position: absolute;
  left: 50px;
  justify-content: center;
  align-items: center;
}

.allDisedit {
  display: flex;
  z-index: 2;
  width: 60px;
  height: 50px;
  position: absolute;
  left: 200px;
  justify-content: center;
  align-items: center;
}

.addOnclick {
  display: flex;
  z-index: 2;
  width: 60px;
  height: 50px;
  position: absolute;
  left: 300px;
  justify-content: center;
  align-items: center;
}

.removeOnclick {
  display: flex;
  z-index: 2;
  width: 60px;
  height: 50px;
  position: absolute;
  left: 400px;
  justify-content: center;
  align-items: center;
}

.changePplygon {
  display: flex;
  z-index: 2;
  width: 60px;
  height: 50px;
  position: absolute;
  left: 500px;
  justify-content: center;
  align-items: center;
}

.resert {
  display: flex;
  z-index: 2;
  width: 60px;
  height: 50px;
  position: absolute;
  top: 100px;
  left: 60px;
  justify-content: center;
  align-items: center;
}
</style>