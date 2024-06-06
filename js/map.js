/**
 * 地图(加载本地高德电子地图影像地图瓦片)
 */

import { tileUrl, tileUrlImage } from '../config/config.js'
import { getQueryVariable } from './utils.js'
import Msg from './msg.js'

/**
 * 电子地图
 */
let EMap = (function () {
    /**
     * 电子地图
     * @param centerLatLng 地图中心点
     * @param mapBounds 限制区域范围
     * @param tileUrl 电子地图URL
     * @param tileUrlImage 影像地图URL
     */
    function EMap(centerLatLng, mapBounds, tileUrl, tileUrlImage) {
        // 瓦片图层
        this.tileLayer = new L.TileLayer(tileUrl, { maxZoom: 18, coordType: 'gcj02' });
        this.tileLayerImage = new L.TileLayer(tileUrlImage, { maxZoom: 18, coordType: 'gcj02' });

        // 电子地图map
        this.map = new L.Map('map', {
            center: centerLatLng,
            zoom: 12,
            minZoom: 5,
            maxZoom: 18,
            maxBounds: mapBounds,
            layers: [this.tileLayer],
            attributionControl: false,
            doubleClickZoom: false,
            zoomControl: false
        });

        L.control.scale().addTo(this.map); //比例尺

        // 绘图Pane
        this.drawPaneBottom = this.map.createPane(
            "drawPaneBottom",
            this.map.getPane("overlayPane")
        );
        this.drawPaneBelow = this.map.createPane(
            "drawPaneBelow",
            this.map.getPane("overlayPane")
        );
        this.drawPane = this.map.createPane("drawPane", this.map.getPane("overlayPane"));

        // 显示经纬度和地图层级
        this.map.addEventListener("mousemove", e => {
            this.showMousePosition(e);
            this.showMapZoom();
        });
        this.map.addEventListener("zoomend", e => {
            this.showMapZoom();
        });

        // 禁用右键菜单
        window.oncontextmenu = function (e) {
            e.preventDefault();
        }

        // 复制经纬度keydown事件
        this.map.addEventListener("keydown", e => {
            if (e.originalEvent.ctrlKey && e.originalEvent.key == "c") {
                this.copyMousePosition();
            }
        });
    }

    /**
     * 底图切换
     * @param flag 0:电子地图 1:影像地图
     */
    EMap.prototype.switchMap = function (flag) {
        if (flag == 0) {
            this.tileLayerImage.remove();
            this.map.addLayer(this.tileLayer);

            let img1 = $('#switchMapControl > img:nth-child(1)');
            let img2 = $('#switchMapControl > img:nth-child(2)');
            img1.addClass('imgCurrent');
            img1.removeClass('img');
            img2.addClass('img');
            img2.removeClass('imgCurrent');
        }
        if (flag == 1) {
            this.tileLayer.remove();
            this.map.addLayer(this.tileLayerImage);

            let img1 = $('#switchMapControl > img:nth-child(1)');
            let img2 = $('#switchMapControl > img:nth-child(2)');
            img2.addClass('imgCurrent');
            img2.removeClass('img');
            img1.addClass('img');
            img1.removeClass('imgCurrent');
        }
    }

    /**
     * 显示地图层级
     */
    EMap.prototype.showMapZoom = function () {
        if (!this.mapZoomDiv) {
            this.mapZoomDiv = $("#mapzoom");
        }
        this.mapZoomDiv.text(this.map.getZoom().toString());
    }

    /**
     * 显示鼠标经纬度
     */
    EMap.prototype.showMousePosition = function (e) {
        if (!this.mousePositionDiv) {
            this.mousePositionDiv = $("#mouseposition");
        }
        this.mousePositionDiv.text(e.latlng.lng.toFixed(8) + ", " + e.latlng.lat.toFixed(8));
    }

    /**
     * 复制经纬度
     */
    EMap.prototype.copyMousePosition = function () {
        var str = $("#mouseposition").text();
        console.info("经纬度", str);
        navigator.clipboard.writeText(str); //复制到剪贴板
        Msg.show('经纬度已复制到剪贴板');
    }

    return EMap;
})();

// 地图中心点和限制区域范围
let centerLatLng = L.latLng(31.81593418, 117.22300529);
let mapBounds = L.latLngBounds(L.latLng(-5, 50.0), L.latLng(60, 170.0));

// 创建地图
let eMap = new EMap(centerLatLng, mapBounds, tileUrl, tileUrlImage);

// 地图变量
let map = eMap.map;
let drawPaneBottom = eMap.drawPaneBottom;
let drawPaneBelow = eMap.drawPaneBelow;
let drawPane = eMap.drawPane;

/**
 * 底图切换
 * @param flag 0:电子地图 1:影像地图
 */
function switchMap(flag) {
    eMap.switchMap(flag);
}
window.switchMap = switchMap;

// 根据参数切换底图
setTimeout(function () {
    let mapMode = getQueryVariable("mode");
    if (mapMode) {
        eMap.switchMap(parseInt(mapMode));
    }
}, 100);

// 设备图层
let deviceLayer = L.layerGroup();
map.addLayer(deviceLayer);

export { map, deviceLayer, drawPaneBottom, drawPaneBelow, drawPane }
