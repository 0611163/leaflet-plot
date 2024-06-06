/**
 * 消息提示
 */

let elId = '#message1026';
if ($(elId).length == 0) {
    $("body").append('<div id="message1026"></div>');
}

let loadingHandle;
let canShowLoading;

let msg = new Vue({
    el: elId,
    name: 'Msg',
    methods: {
        show: function (message) {
            this.$message(message);
        },
        alert: function (message, title) {
            this.$alert(message, title, {
                type: 'warning'
            });
        },
        info: function (message, title) {
            this.$alert(message, title, {
                type: 'info'
            });
        },
        confirm: function (message, title, okCallback, cancelCallback) {
            this.$confirm(message, title, {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                okCallback && okCallback();
            }).catch(() => {
                cancelCallback && cancelCallback();
            });
        },
        messageBox: function (message, title, callback) {
            this.$alert(message, title, {
                confirmButtonText: '确定',
                callback: action => {
                    callback && callback(action);
                }
            });
        },
        loading: function (msg) {
            canShowLoading = true;
            setTimeout(() => {
                if (canShowLoading) {
                    loadingHandle = this.$loading({
                        lock: true, //lock的修改符--默认是false
                        text: msg, //显示在加载图标下方的加载文案
                        spinner: 'el-icon-loading', //自定义加载图标类名
                        background: 'rgba(0, 0, 0, 0.7)', //遮罩层颜色
                        target: document.querySelector('#map') //loadin覆盖的dom元素节点
                    })
                }
            }, 10);
        },
        loadingClose: function () {
            canShowLoading = false;
            setTimeout(() => {
                loadingHandle && loadingHandle.close();
            }, 200);
        }
    }
});

export default msg;
