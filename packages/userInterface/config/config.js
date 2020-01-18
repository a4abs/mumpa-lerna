"use strict";

mumpaApp.config([
  "$routeProvider",
  "$locationProvider",
  "$httpProvider",
  function($routeProvider, $locationProvider, $httpProvider) {
    //delete $httpProvider.defaults.headers.common["X-Requested-With"];

    var checkLoggedin = function($q, $timeout, $location, $window) {
      var deferred = $q.defer();
      //console.log($window.sessionStorage.sessionData);

      if ($window.sessionStorage.sessionData) {
        if (JSON.parse($window.sessionStorage.sessionData).token) {
          $timeout(deferred.resolve);
        } else {
          $timeout(deferred.reject);
          $location.url("/login");
        }
      } else {
        $timeout(deferred.reject);
        $location.url("/login");
      }
      return deferred.promise;
    };

    var checkDealer = function($q, $timeout, $location, $window) {
      var deferred = $q.defer();
      //console.log($window.sessionStorage.sessionData);

      if ($window.sessionStorage.sessionData) {
        if (
          JSON.parse($window.sessionStorage.sessionData).user.role === "dealer"
        ) {
          //console.log(JSON.parse($window.sessionStorage.sessionData).user.role);
          $timeout(deferred.resolve);
        } else {
          $timeout(deferred.reject);
          $location.url("/login");
        }
      } else {
        $timeout(deferred.reject);
        $location.url("/login");
      }
      return deferred.promise;
    };

    var checkApprover = function($q, $timeout, $location, $window) {
      var deferred = $q.defer();
      //console.log($window.sessionStorage.sessionData);

      if ($window.sessionStorage.sessionData) {
        if (
          JSON.parse($window.sessionStorage.sessionData).user.role ===
          "approver"
        ) {
          //console.log(JSON.parse($window.sessionStorage.sessionData).user.role);
          $timeout(deferred.resolve);
        } else {
          $timeout(deferred.reject);
          $location.url("/login");
        }
      } else {
        $timeout(deferred.reject);
        $location.url("/login");
      }
      return deferred.promise;
    };

    var checkAdmin = function($q, $timeout, $location, $window) {
      var deferred = $q.defer();
      //console.log($window.sessionStorage.sessionData);

      if ($window.sessionStorage.sessionData) {
        if (
          JSON.parse($window.sessionStorage.sessionData).user.role === "admin"
        ) {
          //console.log(JSON.parse($window.sessionStorage.sessionData).user.role);
          $timeout(deferred.resolve);
        } else {
          $timeout(deferred.reject);
          $location.url("/login");
        }
      } else {
        $timeout(deferred.reject);
        $location.url("/login");
      }
      return deferred.promise;
    };

    var checkAD = function($q, $timeout, $location, $window) {
      var deferred = $q.defer();
      //console.log($window.sessionStorage.sessionData);

      if ($window.sessionStorage.sessionData) {
        if (
          JSON.parse($window.sessionStorage.sessionData).user.role ===
            "admin" ||
          JSON.parse($window.sessionStorage.sessionData).user.role === "dealer"
        ) {
          //console.log(JSON.parse($window.sessionStorage.sessionData).user.role);
          $timeout(deferred.resolve);
        } else {
          $timeout(deferred.reject);
          $location.url("/login");
        }
      } else {
        $timeout(deferred.reject);
        $location.url("/login");
      }
      return deferred.promise;
    };

    $httpProvider.interceptors.push("authInterceptor");
    $routeProvider
      .when("/", {
        templateUrl: "view/home_admin.html",
        controller: "homeController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/pushnotification", {
        templateUrl: "view/push_notification.html",
        controller: "pushNotificationCtrl",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/login", {
        templateUrl: "view/login.html",
        controller: "loginController"
      })
      .when("/resetPassword", {
        templateUrl: "view/password_reset.html",
        controller: "loginController"
      })
      .when("/home", {
        templateUrl: "view/home_dealer.html",
        controller: "homeController",
        resolve: {
          loggedin: checkDealer
        }
      })
      .when("/me", {
        templateUrl: "view/user_profile.html",
        controller: "meController",
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when("/editMe", {
        templateUrl: "view/user_profile_edit.html",
        controller: "meController",
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when("/changePassword", {
        templateUrl: "view/password_change.html",
        controller: "homeController",
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when("/createList", {
        templateUrl: "view/listing_create.html",
        controller: "createListController",
        resolve: {
          loggedin: checkAD
        }
      })
      .when("/editListingDetails/:lid", {
        templateUrl: "view/listing_edit.html",
        controller: "createListController",
        resolve: {
          loggedin: checkAD
        }
      })
      .when("/users", {
        templateUrl: "view/user_list.html",
        controller: "userController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/referDetails", {
        templateUrl: "view/refer_list.html",
        controller: "referController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/userPointDetails/:email", {
        templateUrl: "view/user_pointdetails.html",
        controller: "userController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/listings", {
        templateUrl: "view/listing_list_approved.html",
        controller: "listingController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/listingsApprover", {
        templateUrl: "view/listing_list_approved_approver.html",
        controller: "listingController",
        resolve: {
          loggedin: checkApprover
        }
      })
      .when("/listingsForApproval", {
        templateUrl: "view/listing_list_for_approval.html",
        controller: "listingController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/listingsRejected", {
        templateUrl: "view/listing_list_rejected.html",
        controller: "listingController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/listingDetails/:lid", {
        templateUrl: "view/listing_details.html",
        controller: "listingController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/listingDetailsDealer/:lid", {
        templateUrl: "view/listing_details_dealer.html",
        controller: "listingController",
        resolve: {
          loggedin: checkDealer
        }
      })
      .when("/listingDetailsApprover/:lid", {
        templateUrl: "view/listing_details_approver.html",
        controller: "listingController",
        resolve: {
          loggedin: checkApprover
        }
      })
      .when("/listingDetailsForApproval/:lid", {
        templateUrl: "view/listing_details_with_approval.html",
        controller: "listingController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/deals", {
        templateUrl: "view/deals_list.html",
        controller: "dealController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/dealdetails/:id", {
        templateUrl: "view/deals_details.html",
        controller: "dealController",
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when("/dealedit/:id", {
        templateUrl: "view/deals_edit.html",
        controller: "dealController",
        resolve: {
          loggedin: checkLoggedin
        }
      })
      .when("/createdeals", {
        templateUrl: "view/deals_create_admin.html",
        controller: "dealController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/createdeal", {
        templateUrl: "view/deals_create_dealer.html",
        controller: "dealController",
        resolve: {
          loggedin: checkDealer
        }
      })
      .when("/createdealsfromduplicate/:id", {
        templateUrl: "view/deals_create_from_duplicate.html",
        controller: "dealController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/discussions", {
        templateUrl: "view/discussion_list.html",
        controller: "discussionController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/discussion_comments/:did", {
        templateUrl: "view/discussion_comment_list.html",
        controller: "discussionController",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/listing", {
        templateUrl: "view/other_list.html",
        controller: "otherCtrl",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/viewall", {
        templateUrl: "view/viewlist.html",
        controller: "otherCtrl",
        resolve: {
          loggedin: checkAdmin
        }
      })

      // added for MR form
      .when("/addclient", {
        templateUrl: "view/addclient.html",
        controller: "addClient",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/createform", {
        templateUrl: "view/createform.html",
        controller: "createFormCtrl",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/addquestions/:id", {
        templateUrl: "view/addquestions.html",
        controller: "addQuesCtrl",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/uploadbanner/:id", {
        templateUrl: "view/uploadbanner.html",
        controller: "uploadBannerCtrl",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/mrformlist", {
        templateUrl: "view/mrformlist.html",
        controller: "viewMRList",
        resolve: {
          loggedin: checkAdmin
        }
      })
      .when("/viewform/:id", {
        templateUrl: "view/viewform.html",
        controller: "viewFormCtrl",
        resolve: {
          loggedin: checkAdmin
        }
      })
      // MR form end here

      .otherwise({
        redirectTo: "/"
      });
  }
]);

mumpaApp.run([
  "$location",
  "$rootScope",
  "$routeParams",
  "$window",
  "$http",
  "localStorageService",
  "$timeout",
  function(
    $location,
    $rootScope,
    $routeParams,
    $window,
    $http,
    localStorageService,
    $timeout
  ) {
    $rootScope.$on("$routeChangeStart", function() {
      //console.log($window.sessionStorage.sessionData );
      if (
        $window.sessionStorage.sessionData &&
        $location.path() != "/resetPassword"
      ) {
        $rootScope.loggedin = true;
        $rootScope.user = JSON.parse($window.sessionStorage.sessionData).user;
        if ($location.path() == "/login") {
          $location.path("/");
        } else if (
          $rootScope.user.role === "dealer" &&
          $location.path() == "/"
        ) {
          $location.path("/home");
        } else if (
          $rootScope.user.role === "approver" &&
          $location.path() == "/"
        ) {
          $location.path("/listingsApprover");
        } else if (
          $rootScope.user.role === "admin" &&
          $location.path() == "/home"
        ) {
          $location.path("/");
        }
      } else if ($location.path() == "/resetPassword") {
      } else {
        $rootScope.loggedin = false;
        $location.url("/login");
      }
    });
  }
]);

mumpaApp.factory("authInterceptor", [
  "$rootScope",
  "$q",
  "$cookies",
  "$window",
  "$location",
  "localStorageService",
  function($rootScope, $q, $cookies, $window, $location, localStorageService) {
    var numLoadings = 0;

    return {
      request: function(req) {
        numLoadings++;
        // Show loader
        $rootScope.$broadcast("loader_show");

        req.headers = req.headers || {};
        var token = $cookies.get("token");
        if (token) {
          req.headers.Authorization = "Bearer " + token;
        }
        //console.log('--------------REQUEST-------------------------------');
        return req;
      },
      response: function(res) {
        if (--numLoadings === 0) {
          // Hide loader
          $rootScope.$broadcast("loader_hide");
        }

        //console.log('--------------RESPONSE-------------------------------');
        //console.log(res);
        return res;
      },
      responseError: function(rejection) {
        if (!--numLoadings) {
          // Hide loader
          $rootScope.$broadcast("loader_hide");
        }

        console.log(rejection);
        if (rejection.status == 401) {
          //console.log('--------------NOT AUTHERIZED-------------------------------');
          $cookies.remove("token");
          localStorageService.clearAll();
          $rootScope.loggedin = false;
          $window.sessionStorage.sessionData = "";
          $location.path("/login");
        } else if (rejection.status == 403) {
          //console.log('--------------FORBIDDEN-------------------------------');
          $location.path("/");
        }
        return $q.reject(rejection);
      }
    };
  }
]);
