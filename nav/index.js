define(function (require, exports, module) {
module.exports = {
    module : module,
    ready: ready
};

function ready (com) {
    /**
     * 代码在这开始写
     */
    var div = com.root.getElementsByTagName('div')[0];
    
    com.on("load", function () {
        init();
    });

    com.on("inserted", function () {
        // alert(1)
    });

    com.on("removed", function () {
        // alert(2)
    });

    com.root.on("show", function () {
        alert("haha")
    })

    com.root.on("beforehide", function () {
        alert("hehe")
    })

    /**
     * 公开在标签上的方法
     */
    return {
    }
}
});