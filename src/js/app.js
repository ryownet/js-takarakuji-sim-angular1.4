
(function(w){
  "use strict";

//  var angular = require('angular');
  var myApp = angular.module('takarakujiApp', []);

  var $ = w.jQuery;
  var kujiUtil = require('./_kujiUtil');
  var judge = require('./_judge');


  // SharedSServiceでモデルデータをコントローラ間共有
  myApp.factory('appModel', function () {
    return {
      totalSpendMoney: 0,
      totalGetMoney: 0,
      totalKujiCount: 0,
      sagaku: 0,
      dispItems: []
    };
  });

  myApp.controller('appCtrl', function ($scope, appModel) {
    $scope.isMinus = false;
    $scope.data = appModel;
  })
  var appCtrlScope = angular.element('#js-app').scope();

  myApp.controller('actionCtrl', function ($scope, appModel) {
    $scope.isStop = true;
    $scope.isStart = false;
    $scope.data = appModel;

    $scope.start =  function (e) {
      $scope.isStop = false;
      $scope.isStart = true;

      kujiUtil.intervalID = setInterval( this.getKuji,  kujiUtil.INTERVAL );
    };
    $scope.stop = function (e) {
      $scope.isStop = true;
      $scope.isStart = false;
      clearInterval( kujiUtil.intervalID );
    };
    $scope.getKuji = function () {
      var k = new kujiUtil.Kuji();
      var j = judge(k, kujiUtil);
      $scope.data.totalKujiCount++;
      $scope.data.totalSpendMoney += kujiUtil.TANKA;
      $scope.dispResult(j);
    };
    $scope.dispResult = function (atariKuji){
      if( atariKuji.name ){
      // console.time('t')

        $scope.data.totalGetMoney += atariKuji.kingaku;
        $scope.data.dispItems.forEach(function(item){
          if (item.category === atariKuji.category){
            item.atariCount++;
          }
        });
      //console.timeEnd('t')
      }
      $scope.data.sagaku = $scope.data.totalGetMoney - $scope.data.totalSpendMoney;
      $scope.isMinus = $scope.data.sagaku < 0;
      $scope.$apply();
    }
  });





$(document).ready(function (){
  $.getJSON('setting/data.json', function (data){
    kujiUtil.atariArr = data;

    var l = kujiUtil.atariArr.length;
    var category = '';
    var items = [];
    for(var i=0; i< l; i++){
      if(kujiUtil.atariArr[i].category === category) continue;
      category = kujiUtil.atariArr[i].category;
      var atariVmData = {
        name: kujiUtil.atariArr[i].name,
        kingaku: kujiUtil.atariArr[i].kingaku,
        category: kujiUtil.atariArr[i].category,
        atariCount: 0
      };
      var appCtrlScope = angular.element('#js-app').scope();
      appCtrlScope.data.dispItems.push(atariVmData);
      appCtrlScope.$apply();
    }
  })
});


})(window);
