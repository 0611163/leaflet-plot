import { DrawControl } from '../js/drawControl.js'
import { Measure } from '../js/measure.js'
import { loadHtml } from '../js/loadHtml.js'
import Msg from '../js/msg.js'
import { PlotDraw } from '../js/PlotDraw.js'

async function initPlotButtons(map) {
    await loadHtml('views/plotButtons.html', 'plotButtonsContainer');

    let plotDraw = new PlotDraw(map);

    // 直箭头
    $('#btnStraightArrow').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.STRAIGHT_ARROW);
    });
    // 细直箭头
    $('#btnFineArrow').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.FINE_ARROW);
    });
    // 突击方向
    $('#btnAssaultDirection').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.ASSAULT_DIRECTION);
    });
    // 进攻方向
    $('#btnAttackArrow').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.ATTACK_ARROW);
    });
    // 进攻方向(尾)
    $('#btnTailedAttackArrow').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.TAILED_ATTACK_ARROW);
    });
    // 分队战斗行动
    $('#btnSquadCombat').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.SQUAD_COMBAT);
    });
    // 分队战斗行动(尾)
    $('#btnTailedSquadCombat').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.TAILED_SQUAD_COMBAT);
    });
    // 钳击
    $('#btnDoubleArrow').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.DOUBLE_ARROW);
    });
    // 聚集地
    $('#btnGatheringplace').on('click', () => {
        plotDraw.startDraw(L.PlotTypes.GATHERING_PLACE);
    });
}

export { initPlotButtons }
