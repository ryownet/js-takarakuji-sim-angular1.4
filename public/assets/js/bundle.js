/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	(function(w){
	  "use strict";

	//  var angular = require('angular');
	  var myApp = angular.module('takarakujiApp', []);

	  var $ = w.jQuery;
	  var kujiUtil = __webpack_require__(1);
	  var judge = __webpack_require__(2);


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


/***/ },
/* 1 */
/***/ function(module, exports) {

	//kujiUtil

	var kujiUtil = (function (){

	  /*
	ゼロうめ関数
	*/
	  var zeroPad = function (num, keta){
	    var zero = '';
	    for(var i = 0; i<keta; i++){
	      zero += '0';
	    }
	    return ( zero + num).substr(-keta);
	  };


	  /*
	くじクラス
	  Class Kuji
	*/
	  var KujiKlass = function () {
	    return {
	      // 組は2けたのゼロ埋め数字
	      kumi: zeroPad( Math.floor( Math.random() * 100 ), 2),
	      // 番号は6けたのゼロ埋め数字
	      bangou: zeroPad( Math.floor( Math.random() * 100000 ), 6 ),
	      name : function () {
	        return kumi + '組' + bangou + '番';
	      }
	    };
	  }

	  return {
	    intervalID: null,
	    TANKA: 300,
	    INTERVAL: 2,
	    atariArr: [],
	    zeroPad: zeroPad,
	    Kuji : KujiKlass
	  }
	})();

	module.exports = kujiUtil;



/***/ },
/* 2 */
/***/ function(module, exports) {

	
	  /*
	* 判定
	* @param Kuji
	* @return object
	* TODO: 高速化
	*/
	var judge = function ( kuji, kujiUtil) {
	  var isSameKumi = false;
	  var isSameBan = false;
	  var arr = kujiUtil.atariArr;
	  var l = arr.length;
	  for(var i=0; i<l; i++){
	    //各当選回ごとにジャッジをリセット
	    var isSameKumi_ = false;
	    var isSameBan_ = false;
	    if(arr[i].atari.kumi === kuji.kumi){
	      isSameKumi_ = true;
	    }else if(arr[i].atari.kumi === '##'){
	      isSameKumi_ = true;
	    }
	    if(!isSameKumi_) continue;
	    if(arr[i].atari.bangou === kuji.bangou){
	      isSameBan_ = true;
	    }else{
	      if(arr[i].atari.bangou.indexOf('#') !== -1){

	        // ＃の個数を数え、くじ番号で#の個数分を前方から削除して判定
	        var komeNum = arr[i].atari.bangou.split('#').length-1;

	        // くじ番号で#の個数分だけ消す
	        var kujiBanNumArr = kuji.bangou.split('');
	        for(var j=0; j<komeNum; j++){
	         kujiBanNumArr[j] = '';
	       }
	       var kujiBanNum = kujiBanNumArr.join('');
	       if(kujiBanNum ===  arr[i].atari.bangou.substr(komeNum)){
	          isSameBan_ = true;
	        }
	      }
	    }
	    if( isSameBan_ && isSameKumi_){
	      isSameKumi = isSameKumi_;
	      isSameBan = isSameBan_;
	      //あたり
	      return arr[i];
	    }
	  }

	  return {
	    hazure: true
	  };
	}

	module.exports = judge;

/***/ }
/******/ ]);