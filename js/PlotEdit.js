import { drawPaneBottom, drawPaneBelow, drawPane } from "./map.js";

let PlotEdit = (function () {

    function PlotEdit(map) {
        this.map = map;
        this.activePlot = null;
        this.activeControlPointId = null;
        this.mouseOver = null;

        this.markerLayer = L.layerGroup();
        this.map.addLayer(this.markerLayer);

        this.HELPER_CONTROL_POINT_DIV = 'p-helper-control-point-div';
    };

    PlotEdit.prototype.activate = function (plot) {
        this.activePlot = plot;
        this.initControlPoints();
        this.map.addEventListener("click", this.mapClick, this);
    };

    PlotEdit.prototype.deactivate = function () {
        this.activePlot = null;
        this.activeControlPointId = null;
        this.markerLayer.getLayers().map(marker => {
            marker.removeEventListener("mousedown", this.controlPointMouseDownHandler, this);
            marker.removeEventListener("mouseover", this.controlPointMouseOverHandler, this);
            marker.removeEventListener("mouseout", this.controlPointMouseOutHandler, this);
        });
        this.markerLayer.clearLayers();
        this.map.removeEventListener("click", this.mapClick, this);
    }

    PlotEdit.prototype.mapClick = function () {
        if (this.plotMouseOver || this.controlPointMouseOver) return;
        this.deactivate();
    }

    PlotEdit.prototype.initControlPoints = function () {
        let points = this.activePlot.getPoints();
        for (let i = 0; i < points.length; i++) {
            let point = points[i];
            let id = this.HELPER_CONTROL_POINT_DIV + '-' + i;
            let divIcon = L.divIcon({
                html: '',
                className: this.HELPER_CONTROL_POINT_DIV,
                iconSize: [12, 12],
                iconAnchor: [6, 6],
            });
            let marker = new L.Marker(point, {
                id: id,
                index: i,
                icon: divIcon,
                pane: drawPaneBelow,
            });
            this.markerLayer.addLayer(marker);
            marker.addEventListener("mousedown", this.controlPointMouseDownHandler, this);
            marker.addEventListener("mouseover", this.controlPointMouseOverHandler, this);
            marker.addEventListener("mouseout", this.controlPointMouseOutHandler, this);
        }
    };

    PlotEdit.prototype.plotMouseOverHandler = function (e) {
        this.plotMouseOver = true;
    }

    PlotEdit.prototype.plotMouseOutHandler = function (e) {
        this.plotMouseOver = false;
    }

    PlotEdit.prototype.controlPointMouseOverHandler = function (e) {
        this.controlPointMouseOver = true;
    }

    PlotEdit.prototype.controlPointMouseOutHandler = function (e) {
        this.controlPointMouseOver = false;
    }

    PlotEdit.prototype.controlPointMouseDownHandler = function (e) {
        this.map.dragging.disable();
        this.map.addEventListener("mousemove", this.controlPointMouseMoveHandler, this);
        this.map.addEventListener("mouseup", this.controlPointMouseUpHandler, this);
        this.activeControlPointId = e.sourceTarget.options.id;
    }

    PlotEdit.prototype.controlPointMouseMoveHandler = function (e) {
        if (this.activeControlPointId) {
            let lng = e.latlng.lng;
            let lat = e.latlng.lat;
            let index = -1;
            this.markerLayer.getLayers().map(marker => {
                if (marker.options.id == this.activeControlPointId) {
                    index = marker.options.index;
                    marker.setLatLng(L.latLng(lat, lng));
                }
            });
            if (index >= 0) {
                let points = this.activePlot.getPoints();
                points[index] = [lat, lng];
                this.activePlot.setPoints(points);
            }
        }
    }

    PlotEdit.prototype.controlPointMouseUpHandler = function (e) {
        this.map.removeEventListener("mousemove", this.controlPointMouseMoveHandler, this); // 注意：添加的时候传了this，移除的时候必需要传this，否则移除不掉
        this.map.removeEventListener("mouseup", this.controlPointMouseUpHandler, this);
        this.activeControlPointId = undefined;
        this.map.dragging.enable();

    }

    return PlotEdit;
})();

export { PlotEdit }
