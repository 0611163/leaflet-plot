import { setMarkerDirection, markerIcon } from './icon.js'
import Msg from './msg.js'
import { map, deviceLayer } from "./map.js";

let markerMap = new Map();
let currentMarkerMap = new Map();

function createMarker(lng, lat, options) {

    let defaultOptions = {
        id: undefined,
        title: undefined,
        name: undefined,
        icon: undefined,
        direction: undefined
    }

    options = Object.assign(defaultOptions, options);

    let latlng = new L.LatLng(lat, lng);

    let marker = new L.Marker(latlng, options);

    if (options.icon) {
        marker.setIcon(options.icon);
    } else {
        marker.setIcon(markerIcon);
    }

    //marker.addEventListener("click", markerClick);

    if (options.direction) {
        setMarkerDirection(marker, options.direction);
    }

    return marker;
}

function markerClick(e) {
    let marker = e.sourceTarget;
    Msg.show(marker.options.name);
    //let point = map.latLngToContainerPoint(marker.getLatLng());
}

function refreshVillageMarkers() {
    //获取地图层级
    let mapZoom = map.getZoom();

    //点位完全显示层级
    let visibleZoom = 17;

    //获取地图可视区域
    let polygon = getMapBounds();

    //获取小区点位集合
    let villageMarkerArr = getVillageMarkerArr();

    //筛选出可视区域内的点位
    let visibleMarkerArr = [];
    for (let marker of villageMarkerArr) {
        if (!marker.options.rnd) {
            marker.options.rnd = Math.random();
        }

        let latLng = marker.getLatLng();
        let point = turf.point([latLng.lng, latLng.lat]);

        if (turf.booleanPointInPolygon(point, polygon)) {
            visibleMarkerArr.push(marker);
        }
    }

    //可视区域内的点位抽稀
    let forAdd = [];
    let visibleCount = 200;
    let ratio = 1;
    if (visibleMarkerArr.length > visibleCount) {
        ratio = visibleCount / visibleMarkerArr.length;
    }
    for (let marker of visibleMarkerArr) {
        if (mapZoom >= visibleZoom || marker.options.rnd < ratio) {
            forAdd.push(marker);
        }
    }

    //移除可视区域外的和被抽稀掉的点位
    for (let marker of currentMarkerMap.values()) {
        let latLng = marker.getLatLng();
        let point = turf.point([latLng.lng, latLng.lat]);

        if (!turf.booleanPointInPolygon(point, polygon) || (mapZoom < visibleZoom && marker.options.rnd >= ratio)) {
            deviceLayer.removeLayer(marker);
            currentMarkerMap.delete(marker.options.id);
        }
    }

    //可视区域内的点位添加到图层上
    for (let marker of forAdd) {
        deviceLayer.addLayer(marker);
        if (!currentMarkerMap.has(marker.options.id)) {
            currentMarkerMap.set(marker.options.id, marker);
        }
    }

    //打印
    console.info('实际显示点位数/可视区点位数(' + (currentMarkerMap.size == visibleMarkerArr.length ? '相等' : '不相等') + ')：' + currentMarkerMap.size + '/' + visibleMarkerArr.length)
}

function clearVillageMarkerArr() {
    for (let marker of markerMap.values()) {
        if (marker.options.type == 0) {
            deviceLayer.removeLayer(marker);
            markerMap.delete(marker.options.id);
        }
    }
}

function getVillageMarkerArr() {
    let villageMarkerArr = [];

    for (let marker of markerMap.values()) {
        if (marker.options.type == 0) {
            villageMarkerArr.push(marker);
        }
    }

    return villageMarkerArr;
}

//定位
function setLocation(markerArr) {
    if (markerArr.length > 0) {
        if (markerArr.length > 2) {
            let minLng = 180;
            let maxLng = 0;
            let minLat = 90;
            let maxLat = 0;

            for (let marker of markerArr) {
                let pos = marker.getLatLng();
                if (pos.lng < minLng) {
                    minLng = pos.lng;
                }
                if (pos.lng > maxLng) {
                    maxLng = pos.lng;
                }
                if (pos.lat < minLat) {
                    minLat = pos.lat;
                }
                if (pos.lat > maxLat) {
                    maxLat = pos.lat;
                }
            }

            if (minLat < 29.5) {
                minLat = 29.5;
            }
            if (maxLat > 33.5) {
                maxLat = 33.5;
            }
            if (minLng < 115.0) {
                minLng = 115.0;
            }
            if (maxLng > 120.0) {
                maxLng = 120.0;
            }

            let corner1 = L.latLng(minLat, minLng);
            let corner2 = L.latLng(maxLat, maxLng);
            let bounds = L.latLngBounds(corner1, corner2);

            map.flyToBounds(bounds, { duration: 0.15 });
        } else {
            map.flyTo(new L.LatLng(markerArr[0].getLatLng().lat, markerArr[0].getLatLng().lng), 17, { duration: 0.15 });
        }
    }
}

//获取地图可视区域
function getMapBounds() {
    let nw = map.getBounds().getNorthWest();
    let ne = map.getBounds().getNorthEast();
    let se = map.getBounds().getSouthEast();
    let sw = map.getBounds().getSouthWest();
    let polygon = turf.polygon([[
        [nw.lng, nw.lat],
        [ne.lng, ne.lat],
        [se.lng, se.lat],
        [sw.lng, sw.lat],
        [nw.lng, nw.lat]
    ]]);
    return polygon;
}

//获取临近的点位
function getNearMarkers(marker) {
    let result = [];
    for (let mk of markerMap.values()) {
        let latLng1 = marker.getLatLng();
        let latLng2 = mk.getLatLng();
        let point1 = turf.point([latLng1.lng, latLng1.lat]);
        let point2 = turf.point([latLng2.lng, latLng2.lat]);
        let distance = turf.distance(point1, point2, { units: 'kilometers' });
        if (distance <= 0.020 && mk.options.type == marker.options.type) {
            result.push(mk);
        }
    }
    return result;
}

//创建popup的tips
function getTips(nearMarkers, clickFunctionName) {
    let tips = '<div style="margin-right: 10px;">';
    for (let nearMarker of nearMarkers) {
        tips += '<span style="font-size:16px; margin-right:5px; line-height:25px;">●</span><a href="javascript:void(0)" style="font-family:微软雅黑,黑体; font-size:16px; line-height:25px;" onclick="' + clickFunctionName + '(' + nearMarker.options.id + ', true)" >' + nearMarker.options.name + '</a><br />';
    }
    tips += '</div>';
    return tips;
}

export { createMarker, refreshVillageMarkers, clearVillageMarkerArr, markerMap, setLocation, getNearMarkers, getTips }
