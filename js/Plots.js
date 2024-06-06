/**
 * Created by 世莲 on 2019/1/15. 
 */
if (!L.PlotTypes)
    //初始化类型
    L.PlotTypes = {
        STRAIGHT_ARROW: "straightarrow",//直箭头
        ASSAULT_DIRECTION: "assaultdirection",//突击方向
        ATTACK_ARROW: "attackarrow",//进攻方向
        TAILED_ATTACK_ARROW: "tailedattackarrow",//进攻方向（尾）
        SQUAD_COMBAT: "squadcombat",//分队战斗行动
        TAILED_SQUAD_COMBAT: "tailedsquadcombat",//分队战斗行动（尾）
        FINE_ARROW: "finearrow",//细直箭头        
        DOUBLE_ARROW: "doublearrow", //钳击 
        GATHERING_PLACE: "gatheringplace",//聚集地    
    };
L.PlotFactory = {};
L.PlotFactory.createPlot = function (type, points, options) {
    switch (type) {
        case L.PlotTypes.ELLIPSE:
            return new L.Plot.Ellipse(points, options);
        case L.PlotTypes.CURVE:
            return new L.Plot.Curve(points, options);
        case L.PlotTypes.CLOSED_CURVE:
            return new L.Plot.ClosedCurve(points, options);
        case L.PlotTypes.LUNE:
            return new L.Plot.Lune(points, options);
        case L.PlotTypes.SECTOR:
            return new L.Plot.Sector(points, options);
        case L.PlotTypes.GATHERING_PLACE:
            return new L.Plot.GatheringPlace(points, options);
        case L.PlotTypes.STRAIGHT_ARROW:
            return new L.Plot.StraightArrow(points, options);
        case L.PlotTypes.ASSAULT_DIRECTION:
            return new L.Plot.AssaultDirection(points, options);
        case L.PlotTypes.ATTACK_ARROW:
            return new L.Plot.AttackArrow(points, options);
        case L.PlotTypes.FINE_ARROW:
            return new L.Plot.FineArrow(points, options);
        case L.PlotTypes.CIRCLE:
            return new L.Plot.Circle(points, options);
        case L.PlotTypes.DOUBLE_ARROW:
            return new L.Plot.DoubleArrow(points, options);
        case L.PlotTypes.TAILED_ATTACK_ARROW:
            return new L.Plot.TailedAttackArrow(points, options);
        case L.PlotTypes.SQUAD_COMBAT:
            return new L.Plot.SquadCombat(points, options);
        case L.PlotTypes.TAILED_SQUAD_COMBAT:
            return new L.Plot.TailedSquadCombat(points, options);
    }
    return null;
}

L.Plot = {
    isPlot: function () {
        return true;
    },
    getBaseType: function () {
        let geojson = this.toGeoJSON()
        let type = geojson.geometry.type
        if (type == 'MultiLineString' || type == 'LineString') {
            type = 'Polyline'
        }
        return type
    },
    //设置绘制图形需要的点
    setPoints: function (latlngs) {
        this._bounds = new L.LatLngBounds();
        this._setLatLngs([])
        this._points = this._convertLatLngs(latlngs) || [];
        this._proPoints = L.PlotUtils.proPoints(this._points);
        if (this.getPointCount() >= 1)
            this.generate();
    },
    //设置投影点并更新对应的坐标点
    setProPoints: function (proPts) {
        var latlngs = L.PlotUtils.unProPoints(proPts);
        this.setPoints(latlngs);
    },
    //获取控制点坐标
    getCtrlPoints: function() {
        let ctrlPts = []
        switch (this.type) {
            case L.PlotTypes.SECTOR:
            case L.PlotTypes.ARC:
                ctrlPts = this.getPoints();
                if (ctrlPts.length < 3) {
                    ctrlPts = this._ctrlPnts;
                }
                break;
            case L.PlotTypes.CIRCLE:
                ctrlPts = this.getPoints();
                if (ctrlPts.length < 2) {
                    ctrlPts = this._ctrlPnts;
                }
                break;
            default:
                ctrlPts = this.getPoints();
        }
        return ctrlPts;
    },
    //获取输入点
    getPoints: function () {
        return this._points;
    },
    //获取输入点对应的投影点
    getProPoints: function () {
        return this._proPoints;
    },
    //获取输入的点个数
    getPointCount: function () {
        return this._proPoints.length || 0;
    },
    toPlotJSON: function () {
        let setting = {
            type: this.type,
            points: this.getPoints(),
            options: this.options,
        }
        return setting
    },
    //结束绘制
    finishDrawing: function () {

    }
}
//聚集地
L.Plot.GatheringPlace = L.Polygon.extend({
    includes: L.Plot,
    options: {
        t: 0.4,
        fixPointCount: 3
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.GATHERING_PLACE;
        this.setPoints(latlngs);
    },
    generate: function () {
        var pnts = this._proPoints.concat([]);
        if (pnts.length < 2) {
            this._setLatLngs([])
            return;
        }
        if (this.getPointCount() == 2) {
            var mid = L.PlotUtils.mid(pnts[0], pnts[1]);
            var d = L.PlotUtils.distance(pnts[0], mid) / 0.9;
            var pnt = L.PlotUtils.getThirdPoint(pnts[0], mid, L.PlotConstants.HALF_PI, d, true);
            pnts = [pnts[0], pnt, pnts[1]];
        }
        var mid = L.PlotUtils.mid(pnts[0], pnts[2]);
        pnts.push(mid, pnts[0], pnts[1]);
        var normals = [];
        for (var i = 0; i < pnts.length - 2; i++) {
            var pnt1 = pnts[i];
            var pnt2 = pnts[i + 1];
            var pnt3 = pnts[i + 2];
            var normalPoints = L.PlotUtils.getBisectorNormals(this.options.t, pnt1, pnt2, pnt3);
            normals = normals.concat(normalPoints);
        }
        var count = normals.length;
        normals = [normals[count - 1]].concat(normals.slice(0, count - 1));
        var pList = [];
        for (i = 0; i < pnts.length - 2; i++) {
            pnt1 = pnts[i];
            pnt2 = pnts[i + 1];
            pList.push(pnt1);
            for (var t = 0; t <= L.PlotConstants.FITTING_COUNT; t++) {
                var pnt = L.PlotUtils.getCubicValue(t / L.PlotConstants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
                pList.push(pnt);
            }
            pList.push(pnt2);
        }
        this._setLatLngs([L.PlotUtils.unProPoints(pList)]);
        this.redraw();
    }
})
L.Plot.gatheringPlace = function (latlngs, options) {
    return new L.Plot.GatheringPlace(latlngs, options);
};
//=================箭头=======================
/**
 * 直箭头
 */
L.Plot.StraightArrow = L.Polyline.extend({
    includes: L.Plot,
    options: {
        fixPointCount: 2,
        maxArrowLength: 3000000,
        arrowLengthScale: 5
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.STRAIGHT_ARROW;
        this.setPoints(latlngs)
    },
    //生成图形
    generate: function () {
        if (this.getPointCount() < 2) {
            return;
        }
        var pnts = this._proPoints;
        var pnt1 = pnts[0];
        var pnt2 = pnts[1];
        var distance = L.PlotUtils.distance(pnt1, pnt2);
        var len = distance / this.options.arrowLengthScale;
        len = len > this.options.maxArrowLength ? this.options.maxArrowLength : len;
        var leftPnt = L.PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, false);
        var rightPnt = L.PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI / 6, len, true);
        let proPts = [pnt1, pnt2, leftPnt, pnt2, rightPnt]
        this._setLatLngs(L.PlotUtils.unProPoints(proPts));
        this.redraw();
    }
});
L.Plot.straightArrow = function (latlngs, options) {
    return new L.Plot.StraightArrow(latlngs, options);
};
/**
 * 细直箭头
 */
L.Plot.FineArrow = L.Polygon.extend({
    includes: L.Plot,
    options: {
        tailWidthFactor: 0.15,//尾部宽度倍数
        neckWidthFactor: 0.2,//颈部宽度倍数
        headWidthFactor: 0.25,//头部宽度倍数
        headAngle: Math.PI / 8.5,//头部角度
        neckAngle: Math.PI / 13,//颈部角度
        fixPointCount: 2
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.FINE_ARROW;
        this.setPoints(latlngs)
    },
    //生成图形
    generate: function () {
        if (this.getPointCount() < 2) {
            this._setLatLngs([])
            return;
        }
        var pnts = this._proPoints;
        var pnt1 = pnts[0];
        var pnt2 = pnts[1];
        var len = L.PlotUtils.getBaseLength(pnts);//pnt1和pnt2的距离的0.99次幂
        var tailWidth = len * this.options.tailWidthFactor;
        var neckWidth = len * this.options.neckWidthFactor;
        var headWidth = len * this.options.headWidthFactor;
        var tailLeft = L.PlotUtils.getThirdPoint(pnt2, pnt1, L.PlotConstants.HALF_PI, tailWidth, true);
        var tailRight = L.PlotUtils.getThirdPoint(pnt2, pnt1, L.PlotConstants.HALF_PI, tailWidth, false);
        var headLeft = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.options.headAngle, headWidth, false);
        //L.marker(L.PlotUtils.unProPoint(headLeft)).addTo(map)
        var headRight = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.options.headAngle, headWidth, true);
        var neckLeft = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.options.neckAngle, neckWidth, false);
        var neckRight = L.PlotUtils.getThirdPoint(pnt1, pnt2, this.options.neckAngle, neckWidth, true);
        var pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
        this._setLatLngs([L.PlotUtils.unProPoints(pList)]);
        this.redraw();
    }
});
L.Plot.fineArrow = function (latlngs, options) {
    return new L.Plot.FineArrow(latlngs, options);
};
/**
 * 突击方向
 */
L.Plot.AssaultDirection = L.Plot.FineArrow.extend({
    options: {
        tailWidthFactor: 0.2,
        neckWidthFactor: 0.25,
        headWidthFactor: 0.3,
        headAngle: Math.PI / 4,
        neckAngle: Math.PI * 0.17741,
        fixPointCount: 2
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.ASSAULT_DIRECTION;
        this.setPoints(latlngs)
    }
});
L.Plot.assaultDirection = function (latlngs, options) {
    return new L.Plot.AssaultDirection(latlngs, options);
};

/**
 * 进攻方向
 */
L.Plot.AttackArrow = L.Polygon.extend({
    includes: L.Plot,
    options: {
        headHeightFactor: 0.18,
        headWidthFactor: 0.3,
        neckHeightFactor: 0.85,
        neckWidthFactor: 0.15,
        headTailFactor: 0.8
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.ATTACK_ARROW;
        this.setPoints(latlngs)
    },
    //生成图形
    generate: function () {
        if (this.getPointCount() < 2) {
            this._setLatLngs([])
            return;
        }
        if (this.getPointCount() == 2) {
            this._setLatLngs(this._points);
            this.redraw();
            return;
        }
        var pnts = this._proPoints;
        // 计算箭尾
        var tailLeft = pnts[0];
        var tailRight = pnts[1];
        if (L.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
            tailLeft = pnts[1];
            tailRight = pnts[0];
        }
        var midTail = L.PlotUtils.mid(tailLeft, tailRight);
        var bonePnts = [midTail].concat(pnts.slice(2));
        // 计算箭头
        var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var tailWidthFactor = L.PlotUtils.distance(tailLeft, tailRight) / L.PlotUtils.getBaseLength(bonePnts);
        // 计算箭身
        var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
        // 整合
        var count = bodyPnts.length;
        var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);

        leftPnts = L.PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = L.PlotUtils.getQBSplinePoints(rightPnts);

        var pList = leftPnts.concat(headPnts, rightPnts.reverse());
        //pList = bodyPnts;
        this._setLatLngs([L.PlotUtils.unProPoints(pList)]);
        this.redraw();
    },
    //获取箭头部分的点
    getArrowHeadPoints: function (points, tailLeft, tailRight) {
        var len = L.PlotUtils.getBaseLength(points);
        var headHeight = len * this.options.headHeightFactor;
        var headPnt = points[points.length - 1];
        len = L.PlotUtils.distance(headPnt, points[points.length - 2]);
        var tailWidth = L.PlotUtils.distance(tailLeft, tailRight);
        if (headHeight > tailWidth * this.options.headTailFactor) {
            headHeight = tailWidth * this.options.headTailFactor;
        }
        var headWidth = headHeight * this.options.headWidthFactor;
        var neckWidth = headHeight * this.options.neckWidthFactor;
        headHeight = headHeight > len ? len : headHeight;
        var neckHeight = headHeight * this.options.neckHeightFactor;
        var headEndPnt = L.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        //L.marker(L.PlotUtils.unProPoint(headEndPnt)).bindPopup("headEndPnt").addTo(map)
        var neckEndPnt = L.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        //L.marker(L.PlotUtils.unProPoint(neckEndPnt)).bindPopup("neckEndPnt").addTo(map)

        var headLeft = L.PlotUtils.getThirdPoint(headPnt, headEndPnt, L.PlotConstants.HALF_PI, headWidth, false);
        var headRight = L.PlotUtils.getThirdPoint(headPnt, headEndPnt, L.PlotConstants.HALF_PI, headWidth, true);
        var neckLeft = L.PlotUtils.getThirdPoint(headPnt, neckEndPnt, L.PlotConstants.HALF_PI, neckWidth, false);
        var neckRight = L.PlotUtils.getThirdPoint(headPnt, neckEndPnt, L.PlotConstants.HALF_PI, neckWidth, true);
        return [neckLeft, headLeft, headPnt, headRight, neckRight];
    },
    //获取箭身部分的点
    getArrowBodyPoints: function (points, neckLeft, neckRight, tailWidthFactor) {
        var allLen = L.PlotUtils.wholeDistance(points);
        var len = L.PlotUtils.getBaseLength(points);
        var tailWidth = len * tailWidthFactor;
        var neckWidth = L.PlotUtils.distance(neckLeft, neckRight);
        var widthDif = (tailWidth - neckWidth) / 2;
        var tempLen = 0, leftBodyPnts = [], rightBodyPnts = [];
        for (var i = 1; i < points.length - 1; i++) {
            var angle = L.PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
            tempLen += L.PlotUtils.distance(points[i - 1], points[i]);
            var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
            var left = L.PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
            //L.marker(L.PlotUtils.unProPoint(left)).bindPopup("left").addTo(map)
            var right = L.PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
            //L.marker(L.PlotUtils.unProPoint(right)).bindPopup("right").addTo(map)

            leftBodyPnts.push(left);
            rightBodyPnts.push(right);
        }
        return leftBodyPnts.concat(rightBodyPnts);
    }
})
L.Plot.attackArrow = function (latlngs, options) {
    return new L.Plot.AttackArrow(latlngs, options);
};

/**
 * 进攻方向（尾）
 */
L.Plot.TailedAttackArrow = L.Plot.AttackArrow.extend({
    options: {
        tailWidthFactor: 0.1,
        swallowTailFactor: 1,
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.TAILED_ATTACK_ARROW;
        this.swallowTailPnt = null;
        this.setPoints(latlngs)
    },
    //生成图形
    generate: function () {
        if (this.getPointCount() < 2) {
            this._setLatLngs([])
            return;
        }
        if (this.getPointCount() == 2) {
            this._setLatLngs(this._points);
            this.redraw();
            return;
        }
        var pnts = this._proPoints;
        // 计算箭尾
        var tailLeft = pnts[0];
        var tailRight = pnts[1];
        if (L.PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
            tailLeft = pnts[1];
            tailRight = pnts[0];
        }
        var midTail = L.PlotUtils.mid(tailLeft, tailRight);
        var bonePnts = [midTail].concat(pnts.slice(2));
        // 计算箭头
        var headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var tailWidth = L.PlotUtils.distance(tailLeft, tailRight);
        var allLen = L.PlotUtils.getBaseLength(bonePnts);
        var len = allLen * this.options.tailWidthFactor * this.options.swallowTailFactor;
        this.swallowTailPnt = L.PlotUtils.getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true);
        var factor = tailWidth / allLen;
        // 计算箭身
        var bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor);
        //整合
        var count = bodyPnts.length;
        var leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);

        leftPnts = L.PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = L.PlotUtils.getQBSplinePoints(rightPnts);
        var pList = leftPnts.concat(headPnts, rightPnts.reverse(), [this.swallowTailPnt, leftPnts[0]]);
        this._setLatLngs([L.PlotUtils.unProPoints(pList)]);
        this.redraw();
    }
})
L.Plot.tailedAttackArrow = function (latlngs, options) {
    return new L.Plot.TailedAttackArrow(latlngs, options);
};

//分队战斗行动
L.Plot.SquadCombat = L.Plot.AttackArrow.extend({
    options: {
        tailWidthFactor: 0.1
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.SQUAD_COMBAT;
        this.setPoints(latlngs)
    },
    generate: function () {
        if (this.getPointCount() < 2) {
            this._setLatLngs([])
            return;
        }
        var pnts = this._proPoints;
        //计算箭尾
        var tailPnts = this.getTailPoints(pnts);
        //计算箭头
        var headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        //计算箭身
        var bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.options.tailWidthFactor);
        //整合
        var count = bodyPnts.length;
        var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);

        leftPnts = L.PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = L.PlotUtils.getQBSplinePoints(rightPnts);

        var pList = leftPnts.concat(headPnts, rightPnts.reverse());
        this._setLatLngs([L.PlotUtils.unProPoints(pList)]);
        this.redraw();
    },
    getTailPoints: function (points) {
        var allLen = L.PlotUtils.getBaseLength(points);
        var tailWidth = allLen * this.options.tailWidthFactor;
        var tailLeft = L.PlotUtils.getThirdPoint(points[1], points[0], L.PlotConstants.HALF_PI, tailWidth, false);
        var tailRight = L.PlotUtils.getThirdPoint(points[1], points[0], L.PlotConstants.HALF_PI, tailWidth, true);
        return [tailLeft, tailRight];
    }
})
L.Plot.squadCombat = function (latlngs, options) {
    return new L.Plot.SquadCombat(latlngs, options);
};

//分队战斗行动（尾）
L.Plot.TailedSquadCombat = L.Plot.AttackArrow.extend({
    options: {
        tailWidthFactor: 0.1,
        swallowTailFactor: 1
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.TAILED_SQUAD_COMBAT;
        this.setPoints(latlngs)
    },
    generate: function () {
        if (this.getPointCount() < 2) {
            this._setLatLngs([])
            return;
        }
        var pnts = this._proPoints;
        //计算箭尾
        var tailPnts = this.getTailPoints(pnts);
        //计算箭头
        var headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[2]);
        //计算箭身
        var neckLeft = headPnts[0];
        var neckRight = headPnts[4];
        var bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.options.tailWidthFactor);
        //整合
        var count = bodyPnts.length;
        var leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        var rightPnts = [tailPnts[2]].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);

        leftPnts = L.PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = L.PlotUtils.getQBSplinePoints(rightPnts);

        var pList = leftPnts.concat(headPnts, rightPnts.reverse(), [tailPnts[1], leftPnts[0]]);
        this._setLatLngs([L.PlotUtils.unProPoints(pList)]);
        this.redraw();
    },
    getTailPoints: function (points) {
        var allLen = L.PlotUtils.getBaseLength(points);
        var tailWidth = allLen * this.options.tailWidthFactor;
        var tailLeft = L.PlotUtils.getThirdPoint(points[1], points[0], L.PlotConstants.HALF_PI, tailWidth, false);
        var tailRight = L.PlotUtils.getThirdPoint(points[1], points[0], L.PlotConstants.HALF_PI, tailWidth, true);
        var len = tailWidth * this.options.swallowTailFactor;
        var swallowTailPnt = L.PlotUtils.getThirdPoint(points[1], points[0], 0, len, true);
        return [tailLeft, swallowTailPnt, tailRight];
    }
})
L.Plot.tailedSquadCombat = function (latlngs, options) {
    return new L.Plot.TailedSquadCombat(latlngs, options);
};

//钳击
L.Plot.DoubleArrow = L.Polygon.extend({
    includes: L.Plot,
    options: {
        headHeightFactor: 0.25,
        headWidthFactor: 0.3,
        neckHeightFactor: 0.85,
        neckWidthFactor: 0.15,
        fixPointCount: 4
    },
    initialize: function (latlngs, options) {
        L.setOptions(this, options);
        this.type = L.PlotTypes.DOUBLE_ARROW;
        this.connPoint = null;
        this.tempPoint4 = null;
        this.setPoints(latlngs)
    },
    finishDrawing: function () {
        if (this.getPointCount() == 3 && this.tempPoint4 != null)
            this._proPoints.push(this.tempPoint4);
        if (this.connPoint != null)
            this._proPoints.push(this.connPoint);
    },
    generate: function () {
        var count = this.getPointCount();
        if (count < 2) {
            this._setLatLngs([]);
            return;
        }
        if (count == 2) {
            this._setLatLngs(this._points);
            this.redraw();
            return;
        }
        var pnt1 = this._proPoints[0];
        var pnt2 = this._proPoints[1];
        var pnt3 = this._proPoints[2];
        var count = this.getPointCount();
        if (count == 3)
            this.tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
        else
            this.tempPoint4 = this._proPoints[3];
        if (count == 3 || count == 4)
            this.connPoint = L.PlotUtils.mid(pnt1, pnt2);
        else
            this.connPoint = this._proPoints[4];
        var leftArrowPnts, rightArrowPnts;
        if (L.PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
            leftArrowPnts = this.getArrowPoints(pnt1, this.connPoint, this.tempPoint4, false);
            rightArrowPnts = this.getArrowPoints(this.connPoint, pnt2, pnt3, true);
        } else {
            leftArrowPnts = this.getArrowPoints(pnt2, this.connPoint, pnt3, false);
            rightArrowPnts = this.getArrowPoints(this.connPoint, pnt1, this.tempPoint4, true);
        }
        var m = leftArrowPnts.length;
        var t = (m - 5) / 2;

        var llBodyPnts = leftArrowPnts.slice(0, t);
        var lArrowPnts = leftArrowPnts.slice(t, t + 5);
        var lrBodyPnts = leftArrowPnts.slice(t + 5, m);

        var rlBodyPnts = rightArrowPnts.slice(0, t);
        var rArrowPnts = rightArrowPnts.slice(t, t + 5);
        var rrBodyPnts = rightArrowPnts.slice(t + 5, m);

        rlBodyPnts = L.PlotUtils.getBezierPoints(rlBodyPnts);
        var bodyPnts = L.PlotUtils.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
        lrBodyPnts = L.PlotUtils.getBezierPoints(lrBodyPnts);

        var pList = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts);
        this._setLatLngs([L.PlotUtils.unProPoints(pList)]);
        this.redraw();
    },
    getArrowPoints: function (pnt1, pnt2, pnt3, clockWise) {
        var midPnt = L.PlotUtils.mid(pnt1, pnt2);
        var len = L.PlotUtils.distance(midPnt, pnt3);
        var midPnt1 = L.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
        var midPnt2 = L.PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
        //var midPnt3=PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.7, true);
        midPnt1 = L.PlotUtils.getThirdPoint(midPnt, midPnt1, L.PlotConstants.HALF_PI, len / 5, clockWise);
        midPnt2 = L.PlotUtils.getThirdPoint(midPnt, midPnt2, L.PlotConstants.HALF_PI, len / 4, clockWise);
        //midPnt3=PlotUtils.getThirdPoint(midPnt, midPnt3, Constants.HALF_PI, len / 5, clockWise);

        var points = [midPnt, midPnt1, midPnt2, pnt3];
        // 计算箭头部分
        var arrowPnts = this.getArrowHeadPoints(points, this.options.headHeightFactor, this.options.headWidthFactor, this.options.neckHeightFactor, this.options.neckWidthFactor);
        var neckLeftPoint = arrowPnts[0];
        var neckRightPoint = arrowPnts[4];
        // 计算箭身部分
        var tailWidthFactor = L.PlotUtils.distance(pnt1, pnt2) / L.PlotUtils.getBaseLength(points) / 2;
        var bodyPnts = this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
        var n = bodyPnts.length;
        var lPoints = bodyPnts.slice(0, n / 2);
        var rPoints = bodyPnts.slice(n / 2, n);
        lPoints.push(neckLeftPoint);
        rPoints.push(neckRightPoint);
        lPoints = lPoints.reverse();
        lPoints.push(pnt2);
        rPoints = rPoints.reverse();
        rPoints.push(pnt1);
        return lPoints.reverse().concat(arrowPnts, rPoints);
    },
    getArrowHeadPoints: function (points, tailLeft, tailRight) {
        var len = L.PlotUtils.getBaseLength(points);
        var headHeight = len * this.options.headHeightFactor;
        var headPnt = points[points.length - 1];
        var tailWidth = L.PlotUtils.distance(tailLeft, tailRight);
        var headWidth = headHeight * this.options.headWidthFactor;
        var neckWidth = headHeight * this.options.neckWidthFactor;
        var neckHeight = headHeight * this.options.neckHeightFactor;
        var headEndPnt = L.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        var neckEndPnt = L.PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        var headLeft = L.PlotUtils.getThirdPoint(headPnt, headEndPnt, L.PlotConstants.HALF_PI, headWidth, false);
        var headRight = L.PlotUtils.getThirdPoint(headPnt, headEndPnt, L.PlotConstants.HALF_PI, headWidth, true);
        var neckLeft = L.PlotUtils.getThirdPoint(headPnt, neckEndPnt, L.PlotConstants.HALF_PI, neckWidth, false);
        var neckRight = L.PlotUtils.getThirdPoint(headPnt, neckEndPnt, L.PlotConstants.HALF_PI, neckWidth, true);
        return [neckLeft, headLeft, headPnt, headRight, neckRight];
    },
    getArrowBodyPoints: function (points, neckLeft, neckRight, tailWidthFactor) {
        var allLen = L.PlotUtils.wholeDistance(points);
        var len = L.PlotUtils.getBaseLength(points);
        var tailWidth = len * tailWidthFactor;
        var neckWidth = L.PlotUtils.distance(neckLeft, neckRight);
        var widthDif = (tailWidth - neckWidth) / 2;
        var tempLen = 0, leftBodyPnts = [], rightBodyPnts = [];
        for (var i = 1; i < points.length - 1; i++) {
            var angle = L.PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
            tempLen += L.PlotUtils.distance(points[i - 1], points[i]);
            var w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
            var left = L.PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
            var right = L.PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
            leftBodyPnts.push(left);
            rightBodyPnts.push(right);
        }
        return leftBodyPnts.concat(rightBodyPnts);
    },
    // 计算对称点
    getTempPoint4: function (linePnt1, linePnt2, point) {
        var midPnt = L.PlotUtils.mid(linePnt1, linePnt2);
        var len = L.PlotUtils.distance(midPnt, point);
        var angle = L.PlotUtils.getAngleOfThreePoints(linePnt1, midPnt, point);
        var symPnt, distance1, distance2, mid;
        if (angle < L.PlotConstants.HALF_PI) {
            distance1 = len * Math.sin(angle);
            distance2 = len * Math.cos(angle);
            mid = L.PlotUtils.getThirdPoint(linePnt1, midPnt, L.PlotConstants.HALF_PI, distance1, false);
            symPnt = L.PlotUtils.getThirdPoint(midPnt, mid, L.PlotConstants.HALF_PI, distance2, true);
        }
        else if (angle >= L.PlotConstants.HALF_PI && angle < Math.PI) {
            distance1 = len * Math.sin(Math.PI - angle);
            distance2 = len * Math.cos(Math.PI - angle);
            mid = L.PlotUtils.getThirdPoint(linePnt1, midPnt, L.PlotConstants.HALF_PI, distance1, false);
            symPnt = L.PlotUtils.getThirdPoint(midPnt, mid, L.PlotConstants.HALF_PI, distance2, false);
        }
        else if (angle >= Math.PI && angle < Math.PI * 1.5) {
            distance1 = len * Math.sin(angle - Math.PI);
            distance2 = len * Math.cos(angle - Math.PI);
            mid = L.PlotUtils.getThirdPoint(linePnt1, midPnt, L.PlotConstants.HALF_PI, distance1, true);
            symPnt = L.PlotUtils.getThirdPoint(midPnt, mid, L.PlotConstants.HALF_PI, distance2, true);
        }
        else {
            distance1 = len * Math.sin(Math.PI * 2 - angle);
            distance2 = len * Math.cos(Math.PI * 2 - angle);
            mid = L.PlotUtils.getThirdPoint(linePnt1, midPnt, L.PlotConstants.HALF_PI, distance1, true);
            symPnt = L.PlotUtils.getThirdPoint(midPnt, mid, L.PlotConstants.HALF_PI, distance2, false);
        }
        return symPnt;
    }

})
L.Plot.doubleArrow = function (latlngs, options) {
    return new L.Plot.DoubleArrow(latlngs, options);
};