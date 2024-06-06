import { DrawType } from './drawControl.js'
import Msg from './msg.js'

/**
 * 量算
 */
class Measure {

    drawControl

    constructor(drawControl) {
        this.drawControl = drawControl;
    }

    /**
     * 距离量算
     */
    measureDistance() {
        this.drawControl.drawPolyline(drawnFeature => {
            if (drawnFeature.type == DrawType.polyline) {
                let pointArr = [];
                drawnFeature.feature.getLatLngs().map(item => {
                    pointArr.push([item.lng, item.lat]);
                });
                if (pointArr.length > 1) {
                    let line = turf.lineString(pointArr);
                    let length = turf.length(line, { units: 'kilometers' });
                    if (length < 1) {
                        Msg.info((length * 1000).toFixed(2) + "米", "长度");
                    } else {
                        Msg.info(length.toFixed(5) + "公里", "长度");
                    }
                }
            }
        });
    }

    /**
     * 面积量算
     */
    measureArea() {
        this.drawControl.drawPolygon(drawnFeature => {
            if (drawnFeature.type == DrawType.polygon) {
                let pointArr = [];
                drawnFeature.feature.getLatLngs()[0].map(item => {
                    pointArr.push([item.lng, item.lat]);
                });
                if (pointArr.length > 0) {
                    pointArr.push(pointArr[0]);
                }
                if (pointArr.length > 3) {
                    let line = turf.lineString(pointArr);
                    let polygon = turf.lineToPolygon(line);
                    let unkinkPolygon = turf.unkinkPolygon(polygon);
                    let area = turf.area(unkinkPolygon);
                    if (area < 1000000) {
                        Msg.info(area.toFixed(4) + "平方米", "面积");
                    } else {
                        Msg.info((area / 1000000.0).toFixed(6) + "平方公里", "面积");
                    }
                }
            }
        });
    }
}

export { Measure }
