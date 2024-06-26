﻿L.PlotConstants = {
  TWO_PI: Math.PI * 2,
  HALF_PI: Math.PI / 2,
  FITTING_COUNT: 100,
  ZERO_TOLERANCE: 0.0001
};

if (!L.PlotUtils) L.PlotUtils = {};
//==================依托Leaflet类库的方法========================
//将地理坐标转为平面坐标（标绘时的位置计算全部基于平面坐标）
L.PlotUtils.proPoints = function (latlngs) {
  let proPts = [];
  for (let i = 0; i < latlngs.length; i++) {
      let proPt = this.proPoint(latlngs[i])//转为平面坐标            
      proPts.push([proPt.x, proPt.y])
  }
   return proPts;
};
L.PlotUtils.proPoint = function (latlng) {
  return L.Projection.Mercator.project(latlng)//转为平面坐标 ;
};
//将平面坐标转为地理坐标（计算完成，转换坐标）
L.PlotUtils.unProPoints = function (proPts) {
  let latlngs = [];
  for (let i = 0; i < proPts.length; i++) {
      let pt = this.unProPoint(proPts[i])//转为地理坐标
      latlngs.push(pt)
  }
  return latlngs;
};
L.PlotUtils.unProPoint = function (proPt) {
  return L.Projection.Mercator.unproject(L.point(proPt))//转为平面坐标 ;
};
//=================不依托Leaflet类库的方法========================
//两点之间的平面距离
L.PlotUtils.distance = function (pnt1, pnt2) {
  return Math.sqrt(Math.pow((pnt1[0] - pnt2[0]), 2) + Math.pow((pnt1[1] - pnt2[1]), 2));
}
//获取方位角
L.PlotUtils.getAzimuth = function (startPnt, endPnt) {
  var azimuth;
  var angle = Math.asin(Math.abs(endPnt[1] - startPnt[1]) / L.PlotUtils.distance(startPnt, endPnt));
  if (endPnt[1] >= startPnt[1] && endPnt[0] >= startPnt[0])
      azimuth = angle + Math.PI;//第一象限
  else if (endPnt[1] >= startPnt[1] && endPnt[0] < startPnt[0])
      azimuth = L.PlotConstants.TWO_PI - angle;//第四象限
  else if (endPnt[1] < startPnt[1] && endPnt[0] < startPnt[0])
      azimuth = angle;//第三象限
  else if (endPnt[1] < startPnt[1] && endPnt[0] >= startPnt[0])
      azimuth = Math.PI - angle;//第二象限
  return azimuth;
};
//获取第三点（起点到终点的连线上，以终点为轴，旋转angle后，距离终点distance的点）
L.PlotUtils.getThirdPoint = function (startPnt, endPnt, angle, distance, clockWise) {
  var azimuth = L.PlotUtils.getAzimuth(startPnt, endPnt);//获取终点相对于起点的方位角
  var alpha = clockWise ? azimuth + angle : azimuth - angle;
  var dx = distance * Math.cos(alpha);
  var dy = distance * Math.sin(alpha);
  return [endPnt[0] + dx, endPnt[1] + dy];
};
//获取所有点的总长度
L.PlotUtils.wholeDistance = function (points) {
  var distance = 0;
  for (var i = 0; i < points.length - 1; i++)
      distance += L.PlotUtils.distance(points[i], points[i + 1]);
  return distance;
};
//获取所有点总长度的0.99次幂
//???为什么要多进行一步0.99次幂
L.PlotUtils.getBaseLength = function (points) {
  return Math.pow(L.PlotUtils.wholeDistance(points), 0.99);
  //return L.PlotUtils.wholeDistance(points);
};
//是否是顺时针的
L.PlotUtils.isClockWise = function (pnt1, pnt2, pnt3) {
  return ((pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]));
};
//计算中点
L.PlotUtils.mid = function (pnt1, pnt2) {
  return [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2];
};
L.PlotUtils.getCircleCenterOfThreePoints = function (pnt1, pnt2, pnt3) {
  var pntA = [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2];
  var pntB = [pntA[0] - pnt1[1] + pnt2[1], pntA[1] + pnt1[0] - pnt2[0]];
  var pntC = [(pnt1[0] + pnt3[0]) / 2, (pnt1[1] + pnt3[1]) / 2];
  var pntD = [pntC[0] - pnt1[1] + pnt3[1], pntC[1] + pnt1[0] - pnt3[0]];
  return L.PlotUtils.getIntersectPoint(pntA, pntB, pntC, pntD);
};
L.PlotUtils.getIntersectPoint = function (pntA, pntB, pntC, pntD) {
  if (pntA[1] == pntB[1]) {
      var f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
      var x = f * (pntA[1] - pntC[1]) + pntC[0];
      var y = pntA[1];
      return [x, y];
  }
  if (pntC[1] == pntD[1]) {
      var e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
      x = e * (pntC[1] - pntA[1]) + pntA[0];
      y = pntC[1];
      return [x, y];
  }
  e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1]);
  f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1]);
  y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f);
  x = e * y - e * pntA[1] + pntA[0];
  return [x, y];
};

//获取二次贝塞尔曲线点
L.PlotUtils.getQBSplinePoints = function (points) {
  if (points.length <= 2)
      return points;

  var n = 2;

  var bSplinePoints = [];
  var m = points.length - n - 1;
  bSplinePoints.push(points[0]);
  for (var i = 0; i <= m; i++) {
      for (var t = 0; t <= 1; t += 0.05) {
          var x = y = 0;
          for (var k = 0; k <= n; k++) {
              var factor = L.PlotUtils.getQuadricBSplineFactor(k, t);
              x += factor * points[i + k][0];
              y += factor * points[i + k][1];
          }
          bSplinePoints.push([x, y]);
      }
  }
  bSplinePoints.push(points[points.length - 1]);
  return bSplinePoints;
};
//二次贝塞尔曲线的倍数
L.PlotUtils.getQuadricBSplineFactor = function (k, t) {
  if (k == 0)
      return Math.pow(t - 1, 2) / 2;
  if (k == 1)
      return (-2 * Math.pow(t, 2) + 2 * t + 1) / 2;
  if (k == 2)
      return Math.pow(t, 2) / 2;
  return 0;
};
//以pntB为原点，计算三个点连线的夹角即∠ABC
L.PlotUtils.getAngleOfThreePoints = function (pntA, pntB, pntC) {
  var angle = L.PlotUtils.getAzimuth(pntB, pntA) - L.PlotUtils.getAzimuth(pntB, pntC);
  return (angle < 0 ? angle + L.PlotConstants.TWO_PI : angle);
};
//获取曲线点
L.PlotUtils.getCurvePoints = function (t, controlPoints) {
  var leftControl = L.PlotUtils.getLeftMostControlPoint(controlPoints);
  var normals = [leftControl];
  for (var i = 0; i < controlPoints.length - 2; i++) {
      var pnt1 = controlPoints[i];
      var pnt2 = controlPoints[i + 1];
      var pnt3 = controlPoints[i + 2];
      var normalPoints = L.PlotUtils.getBisectorNormals(t, pnt1, pnt2, pnt3);
      normals = normals.concat(normalPoints);
  }
  var rightControl = L.PlotUtils.getRightMostControlPoint(controlPoints);
  normals.push(rightControl);
  var points = [];
  for (i = 0; i < controlPoints.length - 1; i++) {
      pnt1 = controlPoints[i];
      pnt2 = controlPoints[i + 1];
      points.push(pnt1);
      for (var t = 0; t < L.PlotConstants.FITTING_COUNT; t++) {
          var pnt = L.PlotUtils.getCubicValue(t / L.PlotConstants.FITTING_COUNT, pnt1, normals[i * 2], normals[i * 2 + 1], pnt2);
          points.push(pnt);
      }
      points.push(pnt2);
  }
  return points;
};
L.PlotUtils.getLeftMostControlPoint = function (controlPoints) {
  var pnt1 = controlPoints[0];
  var pnt2 = controlPoints[1];
  var pnt3 = controlPoints[2];
  var pnts = L.PlotUtils.getBisectorNormals(0, pnt1, pnt2, pnt3);
  var normalRight = pnts[0];
  var normal = L.PlotUtils.getNormal(pnt1, pnt2, pnt3);
  var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  if (dist > L.PlotConstants.ZERO_TOLERANCE) {
      var mid = L.PlotUtils.mid(pnt1, pnt2);
      var pX = pnt1[0] - mid[0];
      var pY = pnt1[1] - mid[1];

      var d1 = L.PlotUtils.distance(pnt1, pnt2);
      // normal at midpoint
      var n = 2.0 / d1;
      var nX = -n * pY;
      var nY = n * pX;

      // upper triangle of symmetric transform matrix
      var a11 = nX * nX - nY * nY
      var a12 = 2 * nX * nY;
      var a22 = nY * nY - nX * nX;

      var dX = normalRight[0] - mid[0];
      var dY = normalRight[1] - mid[1];

      // coordinates of reflected vector
      var controlX = mid[0] + a11 * dX + a12 * dY;
      var controlY = mid[1] + a12 * dX + a22 * dY;
  }
  else {
      controlX = pnt1[0] + t * (pnt2[0] - pnt1[0]);
      controlY = pnt1[1] + t * (pnt2[1] - pnt1[1]);
  }
  return [controlX, controlY];
};
L.PlotUtils.getRightMostControlPoint = function (controlPoints) {
  var count = controlPoints.length;
  var pnt1 = controlPoints[count - 3];
  var pnt2 = controlPoints[count - 2];
  var pnt3 = controlPoints[count - 1];
  var pnts = L.PlotUtils.getBisectorNormals(0, pnt1, pnt2, pnt3);
  var normalLeft = pnts[1];
  var normal = L.PlotUtils.getNormal(pnt1, pnt2, pnt3);
  var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  if (dist > L.PlotConstants.ZERO_TOLERANCE) {
      var mid = L.PlotUtils.mid(pnt2, pnt3);
      var pX = pnt3[0] - mid[0];
      var pY = pnt3[1] - mid[1];

      var d1 = L.PlotUtils.distance(pnt2, pnt3);
      // normal at midpoint
      var n = 2.0 / d1;
      var nX = -n * pY;
      var nY = n * pX;

      // upper triangle of symmetric transform matrix
      var a11 = nX * nX - nY * nY
      var a12 = 2 * nX * nY;
      var a22 = nY * nY - nX * nX;

      var dX = normalLeft[0] - mid[0];
      var dY = normalLeft[1] - mid[1];

      // coordinates of reflected vector
      var controlX = mid[0] + a11 * dX + a12 * dY;
      var controlY = mid[1] + a12 * dX + a22 * dY;
  }
  else {
      controlX = pnt3[0] + t * (pnt2[0] - pnt3[0]);
      controlY = pnt3[1] + t * (pnt2[1] - pnt3[1]);
  }
  return [controlX, controlY];
};
//获取弧线上的点
L.PlotUtils.getArcPoints = function (center, radius, startAngle, endAngle) {
  var x, y, pnts = [];
  var angleDiff = endAngle - startAngle;
  angleDiff = angleDiff < 0 ? angleDiff + L.PlotConstants.TWO_PI : angleDiff;
  for (var i = 0; i <= L.PlotConstants.FITTING_COUNT; i++) {
      var angle = startAngle + angleDiff * i / L.PlotConstants.FITTING_COUNT;
      x = center[0] + radius * Math.cos(angle);
      y = center[1] + radius * Math.sin(angle);
      pnts.push([x, y]);
  }
  return pnts;
};
L.PlotUtils.getBezierPoints = function (points) {
  if (points.length <= 2)
      return points;
  var bezierPoints = [];
  var n = points.length - 1;
  for (var t = 0; t <= 1; t += 0.01) {
      var x = y = 0;
      for (var index = 0; index <= n; index++) {
          var factor = L.PlotUtils.getBinomialFactor(n, index);
          var a = Math.pow(t, index);
          var b = Math.pow((1 - t), (n - index));
          x += factor * a * b * points[index][0];
          y += factor * a * b * points[index][1];
      }
      bezierPoints.push([x, y]);
  }
  bezierPoints.push(points[n]);
  return bezierPoints;
}
L.PlotUtils.getBinomialFactor = function (n, index) {
  return L.PlotUtils.getFactorial(n) / (L.PlotUtils.getFactorial(index) * L.PlotUtils.getFactorial(n - index));
};
L.PlotUtils.getFactorial = function (n) {
  if (n <= 1)
      return 1;
  if (n == 2)
      return 2;
  if (n == 3)
      return 6;
  if (n == 4)
      return 24;
  if (n == 5)
      return 120;
  var result = 1;
  for (var i = 1; i <= n; i++)
      result *= i;
  return result;
};
//获取平分线的法线（pnt1 pnt2 pnt3顺次连接组成的以pnt2为原点的夹角的角平分线的垂线）
L.PlotUtils.getBisectorNormals = function (t, pnt1, pnt2, pnt3) {
  var normal = L.PlotUtils.getNormal(pnt1, pnt2, pnt3);
  // L.marker(L.PlotUtils.unProPoint(normal)).addTo(tempGuidelinesLy)
  var dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1]);
  var uX = normal[0] / dist;
  var uY = normal[1] / dist;
  var d1 = L.PlotUtils.distance(pnt1, pnt2);
  var d2 = L.PlotUtils.distance(pnt2, pnt3);
  if (dist > L.PlotConstants.ZERO_TOLERANCE) {
      if (L.PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
          var dt = t * d1;
          var x = pnt2[0] - dt * uY;
          var y = pnt2[1] + dt * uX;
          var bisectorNormalRight = [x, y];
          dt = t * d2;
          x = pnt2[0] + dt * uY;
          y = pnt2[1] - dt * uX;
          var bisectorNormalLeft = [x, y];
      }
      else {
          dt = t * d1;
          x = pnt2[0] + dt * uY;
          y = pnt2[1] - dt * uX;
          bisectorNormalRight = [x, y];
          dt = t * d2;
          x = pnt2[0] - dt * uY;
          y = pnt2[1] + dt * uX;
          bisectorNormalLeft = [x, y];
      }
  }
  else {
      x = pnt2[0] + t * (pnt1[0] - pnt2[0]);
      y = pnt2[1] + t * (pnt1[1] - pnt2[1]);
      bisectorNormalRight = [x, y];
      x = pnt2[0] + t * (pnt3[0] - pnt2[0]);
      y = pnt2[1] + t * (pnt3[1] - pnt2[1]);
      bisectorNormalLeft = [x, y];
  }
  return [bisectorNormalRight, bisectorNormalLeft];
};
//获取法线？？？
L.PlotUtils.getNormal = function (pnt1, pnt2, pnt3) {
  var dX1 = pnt1[0] - pnt2[0];
  var dY1 = pnt1[1] - pnt2[1];
  var d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1);
  dX1 /= d1;
  dY1 /= d1;

  var dX2 = pnt3[0] - pnt2[0];
  var dY2 = pnt3[1] - pnt2[1];
  var d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2);
  dX2 /= d2;
  dY2 /= d2;

  var uX = dX1 + dX2;
  var uY = dY1 + dY2;
  return [uX, uY];
};
//获取三次贝塞尔曲线点的坐标
L.PlotUtils.getCubicValue = function (t, startPnt, cPnt1, cPnt2, endPnt) {
  t = Math.max(Math.min(t, 1), 0);
  var tp = 1 - t;
  var t2 = t * t;
  var t3 = t2 * t;
  var tp2 = tp * tp;
  var tp3 = tp2 * tp;
  var x = (tp3 * startPnt[0]) + (3 * tp2 * t * cPnt1[0]) + (3 * tp * t2 * cPnt2[0]) + (t3 * endPnt[0]);
  var y = (tp3 * startPnt[1]) + (3 * tp2 * t * cPnt1[1]) + (3 * tp * t2 * cPnt2[1]) + (t3 * endPnt[1]);
  return [x, y];
};