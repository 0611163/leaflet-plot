export const markerIcon = L.icon({
    iconUrl: 'images/marker.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const qiangjiIcon = L.icon({
    iconUrl: 'images/qiangji.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const villageIcon = L.icon({
    iconUrl: 'images/position_icon0.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const villageSelectedIcon = L.icon({
    iconUrl: 'images/position_icon1.png',
    iconSize: [48, 58],
    iconAnchor: [24, 58],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const villageRedIcon = L.icon({
    iconUrl: 'images/定位red1.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const villageSelectedRedIcon = L.icon({
    iconUrl: 'images/定位red2.png',
    iconSize: [48, 58],
    iconAnchor: [24, 58],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const vehicleCaptureIcon = L.icon({
    iconUrl: 'images/车辆抓拍机.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const vehicleCaptureSelectedIcon = L.icon({
    iconUrl: 'images/车辆抓拍机2.png',
    iconSize: [48, 58],
    iconAnchor: [24, 58],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const accessControlIcon = L.icon({
    iconUrl: 'images/门禁一体机.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const accessControlSelectedIcon = L.icon({
    iconUrl: 'images/门禁一体机2.png',
    iconSize: [48, 58],
    iconAnchor: [24, 58],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const faceCaptureIcon = L.icon({
    iconUrl: 'images/人脸抓拍机.png',
    iconSize: [30, 36],
    iconAnchor: [15, 36],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

export const faceCaptureSelectedIcon = L.icon({
    iconUrl: 'images/人脸抓拍机2.png',
    iconSize: [48, 58],
    iconAnchor: [24, 58],
    popupAnchor: [0, 0],
    shadowUrl: null,
    shadowSize: [0, 0],
    shadowAnchor: [0, 0]
});

/**
 * 设置marker朝向
 * @param {L.Marker} marker 
 * @param {Number} direction 1-东、2-西、3-南、4-北、5-东南、6-东北、7-西南、8-西北
 */
export function setMarkerDirection(marker, direction) {
    let angle;

    switch (direction) {
        case 1:
            angle = 0;
            break;
        case 2:
            angle = 180;
            break;
        case 3:
            angle = 90;
            break;
        case 4:
            angle = -90;
            break;
        case 5:
            angle = 45;
            break;
        case 6:
            angle = -45;
            break;
        case 7:
            angle = 135;
            break;
        case 8:
            angle = -135;
            break;
    }

    marker.setRotationOrigin('center center');
    marker.setRotationAngle(angle);
}

/**
 * 设置marker图标
 * @param {L.Marker} marker 
 * @param {Boolean} isSelected 是否处于选中状态
 */
export function setMarkerIcon(marker, isSelected) {
    if (marker) {
        if (isSelected) {
            if (marker.options.type == 0) {
                if (marker.options.state == 0) {
                    marker.setIcon(villageSelectedIcon);
                } else {
                    marker.setIcon(villageSelectedRedIcon);
                }
            }
            else if (marker.options.type == 1) {
                marker.setIcon(faceCaptureSelectedIcon);
            } else if (marker.options.type == 2) {
                marker.setIcon(accessControlSelectedIcon);
            }
            else if (marker.options.type == 3) {
                marker.setIcon(vehicleCaptureSelectedIcon);
            }
        } else {
            if (marker.options.type == 0) {
                if (marker.options.state == 0) {
                    marker.setIcon(villageIcon);
                } else {
                    marker.setIcon(villageRedIcon);
                }
            }
            else if (marker.options.type == 1) {
                marker.setIcon(faceCaptureIcon);
            } else if (marker.options.type == 2) {
                marker.setIcon(accessControlIcon);
            }
            else if (marker.options.type == 3) {
                marker.setIcon(vehicleCaptureIcon);
            }
        }
    }
}
