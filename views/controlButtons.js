import { DrawControl } from '../js/drawControl.js'
import { Measure } from '../js/measure.js'
import { loadHtml } from '../js/loadHtml.js'
import Msg from '../js/msg.js'

async function initControlButtons(map) {
    await loadHtml('views/controlButtons.html', 'controlButtonsContainer');

    //绘制
    let drawControl = new DrawControl(map);
    drawControl.selectedFeatureCallback = (drawnFeature) => {
        console.log("selectedFeatureCallback", drawnFeature);
    };
    drawControl.updatedFeatureCallback = (drawnFeature) => {
        console.log("updatedFeatureCallback", drawnFeature);
    };
    $('#btnDrawMarker').on('click', () => {
        drawControl.drawMarker();
    });
    $('#btnDrawPolyline').on('click', () => {
        drawControl.drawPolyline();
    });
    $('#btnDrawBufferPolyline').on('click', () => {
        let val = $('#bufferValue').val();
        let reg = /^[1-9][0-9]{0,2}$/;
        if (!reg.test(val)) {
            Msg.alert("请输入3位以内的整数");
            return;
        }
        let bufferValue = parseFloat(val);
        drawControl.drawBufferPolyline(bufferValue);
    });
    $('#btnDrawPolygon').on('click', () => {
        drawControl.drawPolygon();
    });
    $('#btnDrawRectangle').on('click', () => {
        drawControl.drawRectangle();
    });
    $('#btnDrawCircle').on('click', () => {
        drawControl.drawCircle();
    });
    $('#btnStartEditFeature').on('click', () => {
        drawControl.startEdit();
    });
    $('#btnStopEditFeature').on('click', () => {
        drawControl.stopEdit();
    });
    $('#btnDeleteFeature').on('click', () => {
        drawControl.deleteSelected();
    });

    //量算
    let measure = new Measure(drawControl);
    $('#btnMeasureDistance').on('click', () => {
        measure.measureDistance();
    });
    $('#btnMeasureArea').on('click', () => {
        measure.measureArea();
    });
}

export { initControlButtons }
