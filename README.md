com-element
===========

在项目中体验标签组件化的好处：以标签去模块化项目，而非JS。

基于seajs。目前不考虑requirejs，将来看ES6 Module普及情况。

## 引言

JS本身模块化从Node.js的CommondJS，到浏览器端的CMD\AMD，JS社区基本上已经普及了模块化开发，随之ES6加入Module部分，JS的模块化可能还会有较大发展。

而CSS的模块化开发，借助sea.js，scss、less之类的类库也能间接实现。

而HTML的模块化开发，即某个HTML标签代表了一个模块。HTML的模块化本质上是Web Component化，即HTML、CSS、JS一起模块化，模块间彼此解耦，相互独立。解耦能够提高项目的可维护性、可扩展性；独立性能够使开发者无需担心影响到他人的代码。

单纯的HTML模块化没有意义，借助iframe、JS异步加载可以实现。现在基于sea.js、requirejs的项目模块化开发，也是由JS端触发一段HTML的加载。这是有缺点的。

1. 在HTML代码中并无法知道模块化的具体情况，譬如哪个模块的HTML会被加载。必须阅读JS代码才能了解。
2. 模块间彼此由JS的require进行引入，需要知道路径才能引入。
3. JS需要重复多次的动作：加载HTML\CSS，插入DOM中，处理各种异步逻辑。非常繁琐。

尽管上面的一些缺点可以经过约定进行避免，但如果HTML层面能组件化，直接和标准对接，是最理想的。

上面是com-element的期望，而其本身算是一种约束和升级，目前并没有太多的技术亮点。对团队而言，更重要的是com-element能带来的组件化思想、以及项目中多人开发的低成本。

## 实现概述

###  解析流程

![](http://smallnewer.github.io/com-element/img/com-element%E6%B5%81%E7%A8%8B%E5%9B%BE.png)

### Hello World

参照`1.helloworld.html`。

先说调用，当我们写好的组件要被其他人调用，很简单。

假使我们写了一个nav组件，那么在HTML中写上<com-nav></com-nav>即可。

写上之后，我们还需要让`com-element.js`解析这些标签。我们调用start的方法即可：

````javascript
seajs.use("com_element", function (COM) {
	COM.start(document.body);
})
````

`start(document.body)`之后， `com-element.js`会把body中所有`com-`开头的标签全部按照组件形式进行加载。

### 一些规范和事项

#### 1. 组件命名规范

当`com-element.js`解析到`com-xx`标签时，会把xx作为组件名，这个组件名会有一些用处，因此必须遵循以下规范：

1. 只能由小写英文字母、数字、`-`组成。
2. 可以多个单词，单词间以`-`连接。

#### 2. 目录规范

`
|--index.html
|--xxx   // 组件名为目录名，譬如选项卡就是tab
|-----index.js
|-----index.css
|-----index.html
`

// TODO
暂时还没加指定目录基础路径功能。马上更新。

js\css\html都已index命名，`com-element.js`会默认加载这三个，即使为空，也要建立好，否则会出现加载错误。

#### 3. index.html
组件的模板，最终会被插入在<com-xx></com-xx>中。

#### 4. index.css
组件的样式，由于目前无法做到兼容的css作用域，目前又不打算引入scss、less，所以要求所有的class命名都已`.com-xx-`开头，譬如tab组件就是`.com-tab-`。

所有的`<com-xx></com-xx>`默认为`block`标签。

// TODO
如果index.css内部想操作`<com-xx></com-xx>`标签的样式，可以用`.com-xx-root`进行控制。
**注意，这样做会控制页面上所有的<com-xx>标签，不建议这么做。如果只想多个<com-xx>中的某一个应用单独的样式，请从其他css中控制，不要在index.css内部控制。从职责划分上来说应该这样，更有利于解耦。**

#### 5. index.js
这个相对有点恶心，不过目前难以完美解决。
要求代码必须按照以下形式书写

````javascript
define(function (require, exports, module) {
module.exports = {
    module : module,
    ready: ready
};

function ready (com) {
    /**
     * 代码在这开始写
     */
    // A
    /**
     * 公开在标签上的方法
     */
    return {
    }
}
});
````

外部套了两层函数，目前都是必须的。平时可以复制粘贴过来。真正的代码要在上述`A`位置开始写（函数ready内部）。

至于结尾的return 一个对象，作用是这样的，当代码如下：

````javascript
return {
    tip: function(){
         alert(1);
    }
}
````

返回出来对象的所有`方法`都会被赋在<com-xxx/>标签身上。因此我们可以实现如下写法：

````html
<com-test></com-test>
<script>
var test = document.getElementsByTagName("com-test")[0];
test.tip();   // 弹出1
</script>

````
这也正是`com-element.js`的优势，组件对外表现就是标签。JS只和标签交互，而不是和JS对象。


#### 6. 默认方法

接上，组件标签身上默认都已经有了`show`和`hide`方法。它们分别是把index.html生成的标签`插入`到`<com-xxx/>`和从`<com-xxx/>``移出` 。

可以利用上面的return覆盖这两个方法：

````javascript
return {
    show: function(){
        this.style.display = "block";  // this指向<com-xxx/>
    },
    hide: function(){
        this.style.display = "none";  // this指向<com-xxx/>
    }
}
````

#### 7. 默认事件

目前提供了一些事件，供外部使用：

* beforeshow


