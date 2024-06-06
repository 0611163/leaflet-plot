import { PlotEdit } from "./PlotEdit.js";
import { drawPaneBottom, drawPaneBelow, drawPane } from "./map.js";

let PlotDraw = (function () {

    function PlotDraw(map) {
        this.map = map;
        this.editing = false;
        this.points = [];
        this.plot = undefined;
        this.plotType = undefined;

        this.plotLayer = L.layerGroup();
        this.map.addLayer(this.plotLayer);

        this.color = "#f84400";
        this.fillColor = "#99ff99";

        this.plotOptions = {
            stroke: true,
            color: this.color,
            weight: 2,
            fill: true,
            fillColor: this.fillColor,
            fillOpacity: 0.5,
            pane: drawPaneBottom,
        };

        this.plotEdit = new PlotEdit(map);
    }

    PlotDraw.prototype.startDraw = function (plotType) {
        this.editing = true;
        this.plotType = plotType;
        this.points = [];
        this.plot = undefined;

        this.plotEdit.deactivate();
        this.map.addEventListener("click", this.mapClick, this);
        this.map.addEventListener("dblclick", this.mapDblClick, this);
        this.map.addEventListener("mousemove", this.mapMouseMove, this);
        this.map.addEventListener("mousedown", this.mapMouseDown, this);
    }

    PlotDraw.prototype.mapClick = function (e) {
        if (!this.editing) return;

        let lng = e.latlng.lng;
        let lat = e.latlng.lat;

        if (this.points.length > 0) {
            if (L.PlotUtils.distance([lat, lng], this.points[this.points.length - 1]) < L.PlotConstants.ZERO_TOLERANCE) return;
        }

        this.points.push([lat, lng]);

        if (!this.plot) {
            if (this.plotType == L.PlotTypes.STRAIGHT_ARROW) { // 直箭头
                this.plot = L.PlotFactory.createPlot(this.plotType, this.points, {
                    stroke: true,
                    color: this.color,
                    weight: 2,
                    pane: drawPaneBottom,
                });
                this.plotLayer.addLayer(this.plot);
            } else {
                this.plot = L.PlotFactory.createPlot(this.plotType, this.points, this.plotOptions);
                this.plotLayer.addLayer(this.plot);
            }
        }

        if (this.plot.options.fixPointCount == this.plot.getPointCount()) {
            if (this.plotType == L.PlotTypes.DOUBLE_ARROW) { // 钳击
                let lng = (this.points[0][1] + this.points[1][1]) / 2;
                let lat = (this.points[0][0] + this.points[1][0]) / 2;
                this.points.push([lat, lng]);
                this.plot.setPoints(this.points);
            }

            this.mapDblClick(e);
        }
    }

    PlotDraw.prototype.mapMouseMove = function (e) {
        if (!this.editing) return;

        let lng = e.latlng.lng;
        let lat = e.latlng.lat;

        if (this.points.length > 0) {
            if (L.PlotUtils.distance([lat, lng], this.points[this.points.length - 1]) < L.PlotConstants.ZERO_TOLERANCE) return;
        }

        let points = [...this.points, [lat, lng]];

        if (this.plot) {
            this.plot.setPoints(points);
        }
    };

    // 双击结束编辑
    PlotDraw.prototype.mapDblClick = function (e) {
        this.stopDraw();

        this.plotEdit.deactivate();
        this.plotEdit.activate(this.plot); // 开始编辑
    }

    // 右击地图结束编辑
    PlotDraw.prototype.mapMouseDown = function (e) {
        if (e.originalEvent.button == 2) { // 右键
            this.mapDblClick(e);
        }
    }

    PlotDraw.prototype.stopDraw = function () {
        this.editing = false;
        this.map.removeEventListener("click", this.mapClick, this); // 注意：添加的时候传了this，移除的时候必需要传this，否则移除不掉
        this.map.removeEventListener("dblclick", this.mapDblClick, this);
        this.map.removeEventListener("mousemove", this.mapMouseMove, this);
        this.map.removeEventListener("mousedown", this.mapMouseDown, this);
        this.plot.addEventListener("click", this.plotClick, this); // 单击图形，开始编辑
        this.plot.addEventListener("mouseover", this.plotEdit.plotMouseOverHandler, this.plotEdit);
        this.plot.addEventListener("mouseout", this.plotEdit.plotMouseOutHandler, this.plotEdit);
    }

    PlotDraw.prototype.plotClick = function (e) {
        this.plotEdit.deactivate();
        this.plot = e.sourceTarget;
        this.plotEdit.activate(this.plot); // 开始编辑
    }

    return PlotDraw;
})();

export { PlotDraw }
