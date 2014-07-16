define(function (require, exports, module) {
	"use strict";

    /**
     * 开始解析某个标签内部的组件
     * @param  {dom} wrap   要解析内部组件的标签
     * @param  {Object} scopes 绑定的数据
     * @return {Null}        无返回
     */
    function start (wrap) {
        wrap = wrap || document.body;
        exports.parseHTML(wrap, function () {
            
        });
    }
	
    /**
     * 解析指定代码片段或标签
     * @param  {DOM || String}   domcode      待解析的代码片段或标签
     * @param  {Function} callback 解析结束的回调函数
     * @return {Null}            无返回
     */
    function parseHTML (domcode, callback) {
    	if (typeof domcode === 'string') {
    		var fragment = tpl2frag(domcode);
    	} else {
    		var fragment = domcode;
    	}

        // 得到内部所有COM
        var coms = getCOMs(fragment);

        var count = coms.sync.length;
        if (count === 0) {
            // 模拟'有组件'时的`异步`特征。
            setTimeout(function () {
                callback && callback();
            }, 0);
        } else {
            // 同步的组件
            var index = 0;
            for (var i = 0; i < count; i++) {
                // 解析自身内部
                parseSelf(coms.sync[i], function () {
                    index ++;
                    // 完全解析完毕
                    if (index >= count) {
                        callback && callback();
                    };
                });
            };
            
        }
        // 异步的组件
        for (var i = 0; i < coms.async.length; i++) {
            parseSelf(coms.async[i]);
        };
    }

    /**
     * 得到内部所有的第一层的COM
     * @param  {Node} node     要解析的节点
     * @return {Null}          返回空
     */
    function getCOMs (node) {
        var components = {
            sync: [],
            async: []
        };
        if (isCOM(node)) {
            var comName = node.tagName.slice(4).toLowerCase();
            var arr;
            if (node.hasAttribute("async")) {   // 异步组件,参考script的async
                arr = components.async;
            } else {
                arr = components.sync;
            }

            arr.push(new COM(comName, node));
            // 如果自身是组件，则内部的HTML交给组件处理，库不做处理
            return components;
        };

        var childs = node.childNodes;
        for (var i = 0; i < childs.length; i++) {
            var com1 = getCOMs(childs[i]);
            components.sync = components.sync.concat(com1.sync);
            components.async = components.async.concat(com1.async);
        };

        return components;
    }

    function isCOM (node) {
        return node.nodeType === 1 && node.tagName.toLowerCase().indexOf("com-") === 0;
    }

    var defaultRootStyle = '.com-root{display:block;}';
    /**
     * 解析自身
     */
    function parseSelf (component, callback) {
        // 1. 加载依赖的文件
        require.async([
                './' + component.name + '/index.html',
                'text!./' + component.name + '/index.css',
                './' + component.name + '/index.js'
            ],
            function (tpl, css, js) {
                // 2. 解析tpl为DOM
                var frag = component.frag;
                frag.appendChild(tpl2frag(tpl));
                // 3. css扔进DOM
                addStyle(frag, defaultRootStyle + css);
                component.root.className += " com-root ";
                // 4. 解析内部引用的com
                parseHTML(frag, function () {
                    // 5. 解析完毕后，把自身插入到文档树中
                    // component.root.appendChild(frag);
                    // 6. 塞回document中
                    component._insert();
                    // 7. 外部回调，必须保证自身已在document中
                    // 再进行下面的操作
                    callback && callback();
                    console.log(component)
                    
                    // 8. 触发ready
                    var exports = js.ready(component);

                    // 9. 把公开的方法都放在标签身上
                    method2com(component, exports);
                    
                    if (component.root.hasAttribute("hide")) {
                        // 前面insert这里remove是必须要的，
                        // 保证在ready执行的时候，能取到标签的宽高.
                        // 可能会闪。
                        component._remove();
                    } else {
                        // 之所以下面再次执行insert
                        // 保证ready中绑定的事件能够触发一次，且在ready之后。
                        component._insert();
                    }
                    
            });
        });
    }

    function addStyle (wrap, cssText) {
        var element = document.createElement('style');
        wrap.appendChild(element);
        // IE
        if (element.styleSheet !== undefined) {

            // http://support.microsoft.com/kb/262161
            if (document.getElementsByTagName('style').length > 31) {
                throw new Error('Exceed the maximal count of style tags in IE');
            }
  
            element.styleSheet.cssText += cssText;
        // W3C
        } else {
            element.appendChild(document.createTextNode(cssText))
        }
    }

    function tpl2frag (tpl) {
        var frag = document.createDocumentFragment();

        var div = document.createElement("div");
        div.innerHTML = tpl;

        while (div.firstChild) {
            frag.appendChild(div.firstChild);
        }

        div = null;
        return frag;
    }

    function method2com (com, exports) {
        if (exports && 
            isType(exports, "Object")) {
            for (var key in exports) {
                if (exports.hasOwnProperty(key) && 
                    isType(exports[key], "Function")) {
                    com.methods[key] = exports;
                };
            }
        };

        for (var key in com.methods) {
            com.root[key] = (function (cb) {
                return function () {
                    cb.call(com.root);
                }
            })(com.methods[key]);
        }
    }

    function isType (data, type) {
        return {}.toString.call(data) == "[object " + type + "]";
    }

    /**
     * 事件基类
     */
    var Event = {
        on : function (type, fn) {
            if (!this._events[type]) {
                this._events[type] = [];
            };

            ensure(this._events[type], fn);
        },
        off : function (type, fn) {
            var arr = this._events[type];

            if (arr) {
                var index = arr.indexOf(fn);
                arr.splice(index, 1);
            };
        },
        emit : function (type) {
            var arr = this._events[type];

            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    arr[i]();
                };
            };
        }
    }
    /**
     * com类
     * 暂不考虑继承
     */
    function COM (comName, rootNode) {
        this.name = comName;
        this.root = rootNode;
        this.frag = document.createDocumentFragment();
        this._remove();  // 先从document中拿出来，解析完再塞回来
        this.inDocument = false;
        this.methods = {};
        extendEvent(this.root);
        extendCOMElem(this);
    }

    extendEvent(COM.prototype);

    COM.prototype._insert = function () {
        if (!this.inDocument) {
            this.root.appendChild(this.frag);
            this.emit("inserted");
        };
    }

    COM.prototype._remove = function () {
        if (this.inDocument) {
            var childs = this.root.childNodes;
            while (childs[0]) {
                this.frag.appendChild(childs[0]);
            }

            this.emit("removed")
        };
    }

    function extendEvent (obj) {
        obj._events = {};
        obj.on = Event.on;
        obj.off = Event.off;
        obj.emit = Event.emit;
    }

    function extendCOMElem (com) {

        com.methods.show = function () {
            if (!com.inDocument) {
                this.emit("beforeshow");
                com._insert();
                com.inDocument = true;
                this.emit("show");
            };
        }

        com.methods.hide = function () {
            if (com.inDocument) {
                this.emit("beforehide");
                com._remove();
                com.inDocument = false;
                this.emit("hide");
            };
        }
    }

    function ensure (arr, item) {
        if (arr.indexOf(item) === -1) {
            arr.push(item);
        };
    }

    
    exports.start = start;
    exports.parseHTML = parseHTML;
});