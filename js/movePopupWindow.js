let relatedMarker = {
    marker: undefined
};

function movePopupWindow(map, secondCall) {
    if (relatedMarker.marker) {
        let point = map.latLngToContainerPoint(relatedMarker.marker.getLatLng());
        if (point.x < 760) {
            point.x = point.x + 30;
        } else {
            point.x = point.x - $('#map-popup-window').width() - 70;
        }
        point.y = point.y - ($('#map-popup-window').height() + 30) / 2.0 - 20;
        if (point.y < 10) point.y = 10;
        let maxY = $('#map').height() - $('#map-popup-window').height() - 50;
        if (point.y > maxY) point.y = maxY;

        $('#map-popup-window').css('left', point.x + 'px').css('top', point.y + 'px');

        if (!secondCall) {
            setTimeout(() => {
                movePopupWindow(map, true);
            }, 1);
        }
    }
}

export { relatedMarker, movePopupWindow }
