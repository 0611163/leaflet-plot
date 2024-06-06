/**
 * 状态管理
 */

Vue.use(Vuex);

const CHANGE_MAP_TILE_TYPE = "changeMapTileType";

const state = {
    /** 1:电子地图 2:影像地图 */
    mapTileType: 1
}

const mutations = {
    changeMapTileType(state, newMapTileType) {
        state.mapTileType = newMapTileType;
    }
}

const vuexStore = new Vuex.Store({
    state,
    mutations
});

export { vuexStore, CHANGE_MAP_TILE_TYPE }
