import { map, deviceLayer } from './js/map.js'
import { createMarker } from './js/marker.js'
import { markerIcon, qiangjiIcon } from './js/icon.js'
import { initControlButtons } from './views/controlButtons.js'
import Msg from './js/msg.js'
import { initPlotButtons } from './views/plotButtons.js'

Vue.config.productionTip = false;

initControlButtons(map);
initPlotButtons(map);

//测试点位
let marker = createMarker(117.18060493, 31.81903928, {
    id: 1,
    title: '测试marker',
    name: '测试marker',
    icon: markerIcon
});

let rotatedMarker = createMarker(117.18007386, 31.81726155, {
    id: 2,
    title: '测试旋转marker',
    name: '测试旋转marker',
    icon: qiangjiIcon,
    direction: 6
});

marker.addEventListener("click", markerClick);
rotatedMarker.addEventListener("click", markerClick);

deviceLayer.addLayer(marker);
deviceLayer.addLayer(rotatedMarker);

function markerClick(e) {
    let marker = e.sourceTarget;
    Msg.show(marker.options.name);
}
