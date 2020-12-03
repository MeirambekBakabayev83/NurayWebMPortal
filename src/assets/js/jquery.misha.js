(function($){

    "use strict";

    $.setProductDatas = function (productObj) {
        window.angularComponentReference.zone.run(() => { window.angularComponentReference.setProductObj( productObj ) });    
    }    

})(jQuery);