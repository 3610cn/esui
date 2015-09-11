/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file 自动补全TipLayer扩展
 * @author chuzhenyang (chuzhenyang@baidu.com)
 */
define(
    function (require) {
        require('../TipLayer');
        var u = require('underscore');
        var Extension = require('../Extension');
        var eoo = require('eoo');
        var esui = require('esui');
        var $ = require('jquery');

        /**
         * 自动补全TipLayer扩展
         *
         * 为某一个区域添加TipLayer
         *
         * 监听一个区域 为这个区域内带有data-role='tip'属性的节点添加tip
         * 默认监听'mouseover'事件 以及无delayTime
         * 在该区域内部所有的DOM节点里 若要添加tip提示 需配置以下属性
         * 1. data-role='tip' 所有具有该属性的节点都会增加tip提示
         * 2. data-tip-title='提示标题' 该节点所要显示的提示的标题内容
         * 3. data-tip-content='提示内容' 该节点所要显示的提示的内容
         * 一旦配置过以上属性 就可以自动为该区域内所有类似的节点添加相应的tip
         *
         * 默认会根据节点的attribute设置tip的title和content
         * 但有时可能想要针对不同的元素对其的title或者content进行更多方面的控制
         * 可以监听自身的tipbeforeshow事件，并preventDefault该事件
         * 该事件会暴露一个tipLayer的实例，以及默认的title和content
         *
         *
         * 使用方法如下所示：
         *
         * 假设DOM结构如下：
         * <esui-panel data-ui-id="main" data-ui-extension-autotiplayer-type="AutoTipLayer"
         *             data-ui-show-mode="over" data-ui-delay-time="1000">
         *      <button data-role="tip" data-tip-title="submit" data-tip-content="确认提示">确认</button>
         *      <button data-role="tip" data-tip-title="cancel" data-tip-content="取消提示">取消</button>
         * </div>
         *
         * 则JS中可以按照如下方式自定义设置tip的title和content
         * var panel = ui.get('main');
         * panel.on('tipbeforeshow', function (e) {
         *     if (e.title === 'submit') {
         *         this.setTitle('确认');
         *         this.setContent('确认后才可以点击！');
         *     }
         *     else {
         *         this.setContent('取消的提示！');
         *     }
         *     e.preventDefault();
         * });
         *
         * @class extension.AutoTipLayer
         * @extends Extension
         * @constructor
         */
        var AutoTipLayer = eoo.create(
            Extension,
            {

                /**
                 * 指定扩展类型，始终为`"AutoTipLayer"`
                 *
                 * @type {string}
                 */
                type: 'AutoTipLayer',

                /**
                 * 激活扩展
                 *
                 * @override
                 */
                activate: function () {
                    this.$super(arguments);
                    var target = this.target;
                    var showMode = target.showMode || 'over';
                    var delayTime = +target.delayTime || 0;
                    var tipNodes = $(this.target.main).find('[data-role="tip"]');

                    if (!tipNodes.length) {
                        return;
                    }

                    var tipLayer = esui.create('TipLayer', {
                        title: '这是提示标题',
                        content: '这是提示内容'
                    });

                    this.tipLayer = tipLayer;

                    // 将TipLayer控件attach到每一个需要添加tip的节点上
                    u.each(tipNodes, function (node) {
                        tipLayer.attachTo({
                            targetDOM: $(node),
                            showMode: showMode,
                            delayTime: delayTime,
                            positionOpt: {top: 'top', right: 'left'}
                        });
                    });

                    // 为防止delayTime时出现 tip还未hide就更改内容的情况 监听beforeshow事件 在此刻再进行更改
                    tipLayer.on('beforeshow', function (e) {
                        var title = e.title;
                        var content = e.content;
                        var event = target.fire('tipbeforeshow', {
                            tipLayer: this,
                            title: title,
                            content: content
                        });
                        if (!event.isDefaultPrevented()) {
                            this.setTitle(title);
                            this.setContent(content);
                        }
                    }, this);
                },

                /**
                 * 取消扩展的激活状态
                 *
                 * @override
                 */
                inactivate: function () {
                    this.tipLayer.dispose();
                    this.tipLayer = null;
                    this.$super(arguments);
                }
            }
        );

        esui.registerExtension(AutoTipLayer);
        return AutoTipLayer;
    }
);
