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

1.  解析流程

![](http://smallnewer.github.io/com-element/img/com-element%E6%B5%81%E7%A8%8B%E5%9B%BE.png)

2. 




