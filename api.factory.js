'use strict'

var d3 = require('d3');

// d3chart libs
var core = require('d3chart.core/core.js');
var DoOnError = require('d3chart.core/error.js');
var V_GETER = require('d3chart.core/const.js');


/*************************** API-Factory 通用方法 ***************************/

function _init () {
    var self = this;
    var opts = this.options;

    var store = {
            container: null
        };

    d3.select(self.element)
        //
        .classed(V_GETER('CLASSNAME_CHART'), true)
        //标识当前图表的类型
        .classed([V_GETER('CLASSNAME_CHART'), self._type].join('-'), true);

    core.isFunction(self.init) && self.init();
    //
    self.store = store;
}

function _setOption (keys, value) {
    core.isFunction(this.setOption) && this.setOption(keys, value);
}

/**
 * [CN] options 深度解构；递归解析 options，并生成 keys，类似 chart.itemStyle.normal...；然后调用内部 setOption 更新图表配置；
 * @param {[type]} opts [description]
 * @param {[type]} keys [description]
 */
function _setOptions (opts, keys) {
    if (!core.isPlainObject(opts)) {
        // build keys DONE
        return _setOption.call(this, keys, opts);
    }

    keys = core.isString(keys) ? [keys] : [];
    for (var key in opts) {
        _setOptions.call(this, opts[key], keys.concat([key]).join(V_GETER('KEY_SPLIT_FLAG')));
    }
}

/**
 * [CN] 更新数据
 * @param {[type]} dt       [description]
 * @param {[type]} notClean [description]
 */
function _setData (dt, notClean) {
    // check & merge TODO
    this.data = dt || false;
}

/**
 * [CN] 触发图表的绘制/重绘，可通过 options.autoRender=true 实现自动触发；
 */
function _render () {
    core.isFunction(this.render) && this.render();
}

/**
 * [CN] 重绘图表，主要是涉及到页面 resize 时，来 resize 图表；
 */
function _resize () {
    core.isFunction(this.resize) && this.resize();
}

/**
 * [CN] 销毁图表，释放占用的资源，及 DOM；
 */
function _destroy (api, real) {
    // check async job
    if (!real) {
        if (api.allPromises) {
            __doPromise.call(this, api, true);
            return;
        }
    }
    // clean dom TODO
    // clean ram TODO
    // clean API & instance TODO
}

/**
 * [CN] 图表异步绘制支持；当图表涉及到大数据量的计算及绘制时，提升性能；可通过 options.notAsync=false 关闭异步绘制；
 * @param  {Object} api  APIFactory 将要输出的对外接口集
 * @param  {Function} func 需要异步执行的逻辑组成的 Function；会自动加入到异步队列中，顺序执行；
 * @param  {[type]} arg1 @func 需要的第一个参数
 * @param  {[type]} arg2 @func 需要的第二个参数
 * @param  {[type]} arg3 @func 需要的第三个参数
 */
function __doPromise (api, func, arg1, arg2, arg3) {
    var self = this;
    var allPromises = api.allPromises;
    api.allPromises = new Promise(function (res, rej) {
        var f = function () {
            core.isFunction(func) && func.call(self, arg1, arg2, arg3);
            // api.allPromises = false;
            // 忽略所有的 reject 行为
            res();
        };
        allPromises ? allPromises.then(f, f) : f();
    });
}


/*************************** API-Factory Generate ***************************/

var APIFactory = function (self, extra) {
    var notAsync = self.notAsync;

    var api = {
        // asyncJob: null,
        allPromises: null,
        /**
         * [CN] 内部入口，会在图表实例化时尝试初始化图表
         * @return {API} 当前 API 用于支持链式调用；
         */
        _: function () {
            this._ = undefined;
            self.element && this.init(self.element);

            return this;
        },
        /**
         * [CN] 初始化图表的 API 入口；
         * @param  {DOM} element 必须要提供具有宽高的原生 DOM；
         * @return {API}         当前 API 用于支持链式调用；
         */
        init: function (element) {
            DoOnError(!core.isElement(element), '0000');
            //
            this.init = function () { DoOnError(true, '0000'); };
            //
            self.element = element;
            //
            notAsync ? _init.call(self) : __doPromise.call(self, this, _init);

            return this;
        },
        /**
         * [CN] 更新图表的配置；
         * @param {[type]} options [description]
         * @return {API}         当前 API 用于支持链式调用；
         */
        setOptions: function (options) {
            DoOnError(!self.store, '0000');
            // if (!core.isPlainObject(options)) { return this; }

            _setOptions.call(self, options);
            self.options.autoRender && this.render();

            return this;
        },
        /**
         * [CN] 更新图表的数据；
         * @param {[type]} data     [description]
         * @param {[type]} notClean [description]
         * @return {API}         当前 API 用于支持链式调用；
         */
        setData: function (data, notClean) {
            DoOnError(!self.store, '0000');

            _setData.call(self, data, notClean);
            self.options.autoRender && this.render();

            return this;
        },
        /**
         * [CN] 触发图表的绘制/重绘，可通过 options.autoRender=true 实现自动触发；
         * @return {API}         当前 API 用于支持链式调用；
         */
        render: function () {
            DoOnError(!self.store, '0000');

            notAsync ? _render.call(self) : __doPromise.call(self, this, _render);

            return this;
        },
        /**
         * [CN] 重绘图表，主要是涉及到页面 resize 时，来 resize 图表；
         * @return {API}         当前 API 用于支持链式调用；
         */
        resize: function () {
            DoOnError(!self.store, '0000');

            notAsync ? _resize.call(self) : __doPromise.call(self, this, _resize);

            return this;
        },
        /**
         * [CN] 主题相关；
         * @param {[type]} theme [description]
         * @return {API}         当前 API 用于支持链式调用；
         */
        setTheme: function (theme) {
            return this;
        },
        /**
         * [destroy description]
         * @return {[type]} [description]
         */
        destroy: function () {
            DoOnError(!self.store, '0000');

            _destroy.call(self, this);

            return true;
        },
        getOptions: function () {},
        getData: function () {},
        getNode: function () {}
    };

    return core.merge(api, extra)
                ._();
};


module.exports = APIFactory;
