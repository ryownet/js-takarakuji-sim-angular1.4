
(function(w){
  "use strict";

//  var angular = require('angular');
  var myApp = angular.module('takarakujiApp', []);

  var $ = w.jQuery;
  var kujiUtil = require('./_kujiUtil');
  var judge = require('./_judge');

  //速度計測用. 10秒間のくじ判定数をアラート
  var isDebug = false;


  // SharedSServiceでモデルデータをコントローラ間共有
  myApp.factory('appModel', function () {
    return {
      totalSpendMoney: 0,
      totalGetMoney: 0,
      totalKujiCount: 0,
      sagaku: 0,
      isMinus: false,
      dispItems: []
    };
  });

  myApp.controller('appCtrl',['$scope', 'appModel', 'Jsondata', function ($scope, appModel, Jsondata) {
    $scope.data = appModel;
    Jsondata.getSampleData().then( function(res){
      kujiUtil.atariArr = res.data;
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
        $scope.data.dispItems.push(atariVmData);
      }
    });
  }]);
  var appCtrlScope = angular.element('#js-app').scope();

  myApp.controller('actionCtrl', function ($scope, appModel) {
    $scope.isStop = true;
    $scope.isStart = false;
    $scope.data = appModel;

    $scope.start =  function (e) {
      $scope.isStop = false;
      $scope.isStart = true;

      kujiUtil.intervalID = setInterval( this.getKuji,  kujiUtil.INTERVAL );
      if(isDebug){
        setTimeout(function (){
          clearInterval( kujiUtil.intervalID );
          $scope.isStop = true;
          window.alert($scope.data.totalKujiCount);
        }, 10000);
      }
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
        $scope.data.totalGetMoney += atariKuji.kingaku;
        $scope.data.dispItems.forEach(function(item){
          if (item.category === atariKuji.category){
            item.atariCount++;
          }
        });
      }
      $scope.data.sagaku = $scope.data.totalGetMoney - $scope.data.totalSpendMoney;
      $scope.data.isMinus = $scope.data.sagaku < 0;
      $scope.$apply();
    }
  });

  myApp.factory('Jsondata', function ($http) {
    return {
      getSampleData: function () {
        return $http.get('setting/data.json')
        .success(function(data, status, headers, config) {
          return data;
        });
      }
    }
  });

})(window);
