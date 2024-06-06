//异步加载 html 和 vue 文件

let regTmpl = /<template[^>]*>([\s\S]*)<\/template[^>]*>/;
let regStyle = /<style(?:(?!scoped))*>((?:(?!<\/style[^>]*>)[\s\S])*)<\/style[^>]*>/;
let regScopedStyle = /<style[^>]*scoped[^>]*>((?:(?!<\/style[^>]*>)[\s\S])*)<\/style[^>]*>/;
let regCssItem = /([^\{\}]*\{[^\{\}]*\})/ig;

/**
 * 请求文件
 * @param {string} url 文件地址
 */
function request(url) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'html',
            async: true,
            success: function (data) {
                resolve(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (XMLHttpRequest.responseText) {
                    console.error("网络请求出错：", XMLHttpRequest.responseText);
                } else {
                    console.error("网络请求出错：", XMLHttpRequest);
                }
            }
        });
    });
}

/**
 * 加载html
 * @param {string} url html的url地址
 * @param {string} containerId div容器id
 * @param {string} mountedElementId 挂载节点id,不传则挂在body下面
 */
async function loadHtml(url, containerId, mountedElementId = undefined) {
    const data = await request(url);

    if ($('#' + containerId).length == 0) {
        let containerDiv = '<div id="' + containerId + '"></div>';
        if (mountedElementId) {
            $('#' + mountedElementId).append(containerDiv);
        } else {
            $('body').append(containerDiv);
        }
        $('#' + containerId).html(data);
    }
}

/**
 * 加载vue文件
 * @param {string} url vue文件的url地址
 * @param {string} containerId div容器id
 * @param {string} mountedElementId 挂载节点id,不传则挂在body下面
 */
async function loadVue(url, containerId, mountedElementId = undefined) {
    const data = await request(url);

    let templateResult = regTmpl.exec(data);
    let syleResult = regStyle.exec(data);
    let scopedStyleResult = regScopedStyle.exec(data);

    if (templateResult) {
        if ($('#' + containerId).length == 0) {
            //加载template
            let containerDiv = '<div id="' + containerId + '"></div>';
            if (mountedElementId) {
                $('#' + mountedElementId).append(containerDiv);
            } else {
                $('body').append(containerDiv);
            }

            $('#' + containerId).html(templateResult[1]);

            //加载style
            if (syleResult) {
                let styleId = 'style-' + containerId;
                let style = '<style id="' + styleId + '" type="text/css">' + syleResult[1].trim() + '</style>';
                $('head').append(style);
            }

            //加载scoped style
            if (scopedStyleResult) {
                let css = '';
                let cssItems = [];
                if (scopedStyleResult[1].trim()) {
                    let cssItem;
                    while ((cssItem = regCssItem.exec(scopedStyleResult[1])) != null) {
                        cssItems.push(cssItem[1].trim());
                    }
                }

                cssItems.map(item => {
                    css += '#' + containerId + ' ' + item + '\r\n\r\n';
                });

                let styleId_1 = 'style-' + containerId + '-scoped';
                css = '<style id="' + styleId_1 + '" type="text/css">' + css.trim() + '</style>';
                $('head').append(css);
            }
        }
    } else {
        console.error("loadVue 方法正则表达式匹配失败");
    }
}

/**
 * 获取vue文件中的模板
 * @param {string} data vue文件内容
 * @param {string} componentName 组件名称
 */
function getVueTemplate(data, componentName) {
    let result = regTmpl.exec(data);
    if (result) {
        let template = regTmpl.exec(data)[1];
        template = '<div id="' + componentName + '">' + template + '</div>';

        return template;
    } else {
        console.error("loadVueTemplate 方法正则表达式匹配失败");
    }
}

/**获取vue文件中的css
 * @param {string} data vue文件内容
 * @param {string} componentName 组件名称
 */
function loadVueCss(data, componentName) {
    let result = regStyle.exec(data);
    if (result) {
        let style = result[1];
        let styleId = 'style-' + componentName;
        let css = '<style id="' + styleId + '" type="text/css">' + style + '</style>';
        if ($('#' + styleId).length == 0) {
            $('head').append(css);
        }
    }
}

/**
 * 获取vue文件中的css
 * @param {string} data vue文件内容
 * @param {string} componentName 组件名称
 */
function loadVueScopedCss(data, componentName) {
    let result = regScopedStyle.exec(data);
    if (result) {
        let style = result[1];
        let cssItems = [];
        if (style.trim()) {
            let cssItem;
            while ((cssItem = regCssItem.exec(style)) != null) {
                cssItems.push(cssItem[1].trim());
            }
        }

        let css = '';
        cssItems.map(item => {
            css += '#' + componentName + ' ' + item + '\r\n\r\n';
        });

        let styleId = 'style-' + componentName + '-scoped';
        css = '<style id="' + styleId + '" type="text/css">' + css.trim() + '</style>';
        if ($('#' + styleId).length == 0) {
            $('head').append(css);
        }
    }
}

export { request, loadHtml, loadVue, getVueTemplate, loadVueCss, loadVueScopedCss }
