'use strict';

mumpaApp
    .controller('homeController', ['$scope', 'localStorageService', 'dbServices', '$rootScope', '$location', '$uibModal', '$cookies', '$window', '$timeout',
        function loginCtrl($scope, localStorageService, dbServices, $rootScope, $location, $modal, $cookies, $window, $timeout) {
            $scope.logout = function() {
                dbServices.logout().then(function(response) {
                    $cookies.remove('token');
                    localStorageService.clearAll();
                    $rootScope.loggedin = false;
                    $window.sessionStorage.sessionData = '';
                    $location.path('/login');
                });
            };

            $scope.goToHome = function() {
                $location.path('/home');
            };

            //INIT DETAILS FOR ADMIN
            $scope.init = function() {
                dbServices.homeDetails().then(function(response) {
                    $scope.home_details = response.data;
                });
            };

            //INIT DETAILS FOR ADMIN
            $scope.initDealer = function() {
                console.log($rootScope.user.email);
                dbServices.homeDetailsDealer($rootScope.user.email).then(function(response) {
                    $scope.home_details = response.data;
                    console.log($scope.home_details);
                    var date = new Date();
                    for (var i = 0; i < $scope.home_details.deal_details.length; i++) {
                        if (moment($scope.home_details.deal_details[i].expiry) > date) {
                            $scope.home_details.deal_details[i].status = 'Active';
                        } else {
                            $scope.home_details.deal_details[i].status = 'Expired';
                        }
                    }
                });
            };

            $scope.viewListingDetails = function(lid) {
                if (lid) {
                    $location.path('/listingDetails/' + lid);
                }
            };

            $scope.viewListingDetailsDealer = function(lid) {
                if (lid) {
                    $location.path('/listingDetailsDealer/' + lid);
                }
            };

            $scope.viewListingDetailsApprover = function(lid) {
                if (lid) {
                    $location.path('/listingDetailsApprover/' + lid);
                }
            };

            $scope.dealView = function(id) {
                if (id) {
                    $location.path('/dealdetails/' + id);
                }
            };

            $scope.groups = [{
                    open: false,
                    title: 'LISTING',
                    options: [{
                        title: 'FOR APPROVAL',
                        url: '#/listingsForApproval'
                    }, {
                        title: 'APPROVED LIST',
                        url: '#/listings'
                    }, {
                        title: 'REJECTED LIST',
                        url: '#/listingsRejected'
                    }, {
                        title: 'CREATE',
                        url: '#/createList'
                    }]
                }
                ,{
                    open:false,
                    title:'PREFERENTIAL LISTINGS',
                    options:[{
                        title:'PREFER A LIST',
                        url:'#/listing'
                    },{
                        title:'PREFERRED LIST',
                        url:'#/viewall'
                    }]
                }, {
                    open: false,
                    title: 'DEALS',
                    options: [{
                        title: 'LIST',
                        url: '#/deals'
                    }, {
                        title: 'CREATE',
                        url: '#/createdeals'
                    }]
                }, 
				{
                    open: false,
                    title: 'MR FORM',
                    options: [{
                        title: 'ADD CLIENT',
                        url: '#/addclient'
                    },
					{
                        title: 'CREATE FORM',
                        url: '#/createform'
                    },
					{
                        title: 'VIEW LIST',
                        url: '#/mrformlist'
                    }]
                },
				{
                    open: false,
                    title: 'DISCUSSIONS',
                    options: [{
                        title: 'LIST',
                        url: '#/discussions'
                    }]
                }, {
                    open: false,
                    title: 'USERS',
                    options: [{
                        title: 'USER LIST',
                        url: '#/users'
                    },{
                        title:'REFER LIST',
                        url:'#/referDetails'
                    }]
                }, {
                    open: false,
                    title: 'PUSH NOTIFICATION',
                    options: [{
                        title: 'Push',
                        url: '#/pushnotification'
                    }]
                }
            ];

            $scope.goToChangePassword = function() {
                $location.path('/changePassword');
            };

            $scope.goToMe = function() {
                $location.path('/me');
            };

            $scope.changePassword = function() {
                $scope.errorMsg = '';
                $scope.successMsg = '';
                if ($scope.new_password != $scope.new_confirm_password) {
                    $scope.errorMsg = 'New Password didn\'t match!';
                    $timeout(function() {
                        $scope.errorMsg = '';
                    }, 3000);
                } else {
                    $scope.errorMsg = '';
                    dbServices.changePassword($scope.old_password, $scope.new_password).then(function(response) {
                        if (response.data.success) {
                            $scope.successMsg = ' Your password has been changed successfully.';

                            $scope.new_password = '';
                            $scope.old_password = '';
                            $scope.new_confirm_password = '';
                            $timeout(function() {
                                $scope.successMsg = '';
                                $location.path('/');
                            }, 3000);
                        } else {
                            $scope.errorMsg = 'Invalid Old Password!';
                            $timeout(function() {
                                $scope.errorMsg = '';
                            }, 3000);
                        }
                    });
                }
            };


        }
    ])
    .controller('meController', ['$scope', 'localStorageService', 'dbServices', '$rootScope', '$location', '$uibModal', '$cookies', '$window', '$timeout',
        function loginCtrl($scope, localStorageService, dbServices, $rootScope, $location, $modal, $cookies, $window, $timeout) {
            $scope.getMyDetails = function() {
                dbServices.getMyDetails().then(function(response) {
                    if (response.data.success) {
                        $scope.mydetails = response.data.mydetails;
                    }
                });
            };

            $scope.goToEditMe = function() {
                $location.path('/editMe');
            };

            $scope.updateMe = function() {
                $scope.mydetails.gender = 'male';
                dbServices.updateMe($scope.mydetails).then(function(response) {
                    if (response.data.success) {
                        var session_data = JSON.parse($window.sessionStorage.sessionData);
                        session_data.user.name = $scope.mydetails.name;
                        $window.sessionStorage.sessionData = JSON.stringify(session_data);
                        $location.path('/me');
                    }
                });
            };

        }
    ])
    .controller('loginController', ['$scope', 'localStorageService', 'dbServices', '$rootScope', '$location', '$timeout', '$uibModal', '$cookies', '$window',
        function loginCtrl($scope, localStorageService, dbServices, $rootScope, $location, $timeout, $modal, $cookies, $window) {
            $scope.user = {};

            $scope.loginToDashboard = function() {

                console.log($scope.user.email, $scope.user.password);
                dbServices.dashboardUserAuthenticate($scope.user.email, $scope.user.password).then(function(response) {
                    console.log("login response", response)
                    if (response.data.success) {
                        console.log('loggedin')

                        $cookies.put('token', response.data.token);
                        $rootScope.loggedin = true;
                        localStorageService.set('loggedin', true);
                        localStorageService.set('name', response.data.user.name);
                        localStorageService.set('email', $scope.user.email);
                        localStorageService.set('role', response.data.user.role_id);

                        var session_data = {
                            'token': response.data.token,
                            'user': {
                                'name': response.data.user.name,
                                'role': response.data.user.role_id,
                                'email': response.data.user.email
                            }
                        };
                        $window.sessionStorage.sessionData = JSON.stringify(session_data);
                        console.log($window.sessionStorage.sessionData);
                        $location.path('/');
                    } else {
                        $scope.msg = 'Invalid Email or Password!'
                    }
                });
            };

            $scope.resetErrorMsg = null;
            $scope.resetPassword = function() {
                dbServices.checkUser($scope.email).then(function(response) {
                    $scope.resetErrorMsg = null;
                    $scope.email = null;
                    if (response.data.success) {
                        dbServices.resetPassword(response.data.rows[0].email).then(function(response) {
                            if (response.data.success) {
                                $scope.successMsg = 'A reset password link has been sent to your email ID.';
                                $timeout(function() {
                                    $scope.successMsg = null;
                                }, 3000);
                            }
                        });
                    } else {
                        $scope.resetErrorMsg = 'Invalid E-mail!';
                        $timeout(function() {
                            $scope.resetErrorMsg = null;
                        }, 3000);
                    }
                });
            };

            $scope.createUser = function() {
                if ($scope.user.confirmPassword != $scope.user.password) {
                    $scope.passwordErr = true;
                    $timeout(function() {
                        $scope.passwordErr = false;
                    }, 2000);
                } else {
                    $scope.passwordErr = false;
                    dbServices.checkUser($scope.user.email).then(function(response) {
                        if (response.data.success) {
                            $scope.emailErr = true;
                            $timeout(function() {
                                $scope.passwordErr = false;
                            }, 2000);
                        } else {
                            dbServices.registerDealer($scope.user).then(function(response) {
                                if (response.data.success) {
                                    $scope.successMsg = 'User Created Successfully!';
                                }
                            });
                        }
                    });
                }
            };
        }
    ])
    .controller('userController', ['$scope', '$location', '$rootScope', '$log', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $log, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {


            $scope.user_list_export_file_name = "user_list_" + moment(new Date).format('DD-MM-YYYY') + ".csv";

            $scope.getAllUsers = function() {
                dbServices.getAllUsers().then(function(response) {
                    console.log(response.data.users);
                    for (var i = 0; i < response.data.users.length; i++) {
                        response.data.users[i].s_no = i + 1;
                    }

                    //FORMAT FOR USERLIST EXPORT
                    $scope.exportUsers = [];
                    for (var i = 0; i < response.data.users.length; i++) {
                        $scope.exportUsers[i] = {
                            'name': response.data.users[i].name,
                            'email': response.data.users[i].email,
                            'role': response.data.users[i].role,
                            'Total': response.data.users[i].Total,
                            'created': moment(response.data.users[i].created).format('DD-MM-YYYY-MM-SS'),
                            'status': response.data.users[i].status
                        };
                    }

                    $scope.allUsers = response.data.users;
                    $scope.allUsers2 = response.data.users;
                    console.log($scope.allUsers);
                    $scope.filteredTableDate($scope.allUsers);
                });
            };

            $scope.filteredTableDate = function(allUsers) {
                $scope.$watch("filter.$", function() {
                    $scope.tableParams.reload();
                    $scope.tableParams.page(1);
                });

                var data = allUsers;
                $scope.tableParams = new ngTableParams({
                    page: 1, // show first page
                    count: 5 // count per page
                }, {
                    total: data.length, // length of data
                    getData: function($defer, params) {
                        params.settings().counts = [5, 10, 25, 50, 100];
                        var filteredData = $filter('filter')(data, $scope.filter);
                        var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    },
                    $scope: $scope
                });
            };

            $scope.filterUserType = function(role) {
                var temp = [];
                if (role === 'all') {
                    temp = $scope.allUsers2;
                } else {
                    for (var i = 0; i < $scope.allUsers2.length; i++) {
                        if (($scope.allUsers2[i].role === role)) {
                            temp.push($scope.allUsers2[i]);
                        }
                    };
                }
                console.log(temp);
                $scope.filteredTableDate(temp);
            };

            $scope.deactivateUser = function(userObj) {
                dbServices.deactivateUser(userObj.email).then(function(response) {
                    if (response.data.success) {
                        userObj.status = 'inactive';
                    }
                });
            };

            $scope.activateUser = function(userObj) {
                dbServices.activateUser(userObj.email).then(function(response) {
                    if (response.data.success) {
                        userObj.status = 'active';
                    }
                });
            };

            $scope.gotoUserDetails = function(email) {
                $location.path('/userPointDetails/' + email);
            };

            $scope.initUserDetails = function() {
                console.log($routeParams.email);
                dbServices.getUserDetails($routeParams.email).then(function(response) {
                    if (response.data.success) {
                        console.log(response.data);
                        $scope.userObj = response.data.userObj;
                    }
                });
            };
        }
    ])
    .controller('createListController', ['$scope', 'localStorageService', 'dbServices', '$rootScope', '$location', '$uibModal', 'geolocation', '$timeout', '$routeParams',
        function loginCtrl($scope, localStorageService, dbServices, $rootScope, $location, $modal, geolocation, $timeout, $routeParams) {


            /************************************************CREATE LIST*********************************************************************/
            $rootScope.getCordinatebtn = true;
            $scope.selection = [];

            $scope.getAllStates = function(){
                dbServices.getAllStates().then(function(response){
                    if(response.data.success){
                        $scope.allstates = response.data.states;
                        console.log($scope.allstates);
                    }
                });
            };

            $scope.getCitiesOfStates = function(state){
                dbServices.getCitiesOfStates(state).then(function(response){
                    if(response.data.success){
                        $scope.allcities = response.data.cities;
                    }
                });
            };




            $scope.toggleSelection = function(categoryName) {
                var idx = -1;
                for (var i = 0; i < $scope.selection.length; i++) {
                    if ($scope.selection[i].category_id === categoryName.category_id) {
                        idx = i;
                    }
                }
                if (idx > -1) {
                    $scope.selection.splice(idx, 1);
                } else {
                    $scope.selection.push(categoryName);
                }
            };

            $scope.listingObj = {
                delivery: false,
                payment: {
                    "cash": false,
                    "card": false
                },
                opendays: {
                    "mon": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    },
                    "tue": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    },
                    "wed": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    },
                    "thu": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    },
                    "fri": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    },
                    "sat": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    },
                    "sun": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    },
                    "all": {
                        "day": false,
                        "open": "8:00 AM",
                        "close": "8:30 PM"
                    }
                }
            };

            $scope.getAllCategories = function() {
                dbServices.getAllCategories().then(function(response) {
                    if (response.data.success) {
                        $scope.categories = response.data.categories;
                    }
                });
            };

            $scope.getGeoCoordinates = function(event) {

                navigator.geolocation.getCurrentPosition(onSuccess, Error, {
                    enableHighAccuracy: true
                });

                function onSuccess(position) {
                    console.log(position);
                    $scope.lat = Math.round(position.coords.latitude * 1000000) / 1000000;
                    $scope.lon = Math.round(position.coords.longitude * 1000000) / 1000000;
                    $scope.$apply(function() {
                        $scope.listingObj.longitude = $scope.lat;
                        $scope.listingObj.latitude = $scope.lon;
                        $rootScope.getCordinatebtn = false;
                    });
                }

                function onError(error) {
                    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                }
            };

            $scope.clearGeoCoordinates = function() {
                $rootScope.getCordinatebtn = true;
                $scope.listingObj.longitude = '';
                $scope.listingObj.latitude = '';
            };

            $scope.checkAll = function(val) {
                $scope.listingObj.opendays.mon.day = val;
                $scope.listingObj.opendays.tue.day = val;
                $scope.listingObj.opendays.wed.day = val;
                $scope.listingObj.opendays.thu.day = val;
                $scope.listingObj.opendays.fri.day = val;
                $scope.listingObj.opendays.sat.day = val;
                $scope.listingObj.opendays.sun.day = val;
            };

            $scope.addListToDb = function() {

                console.log($scope.listingObj);
                console.log($scope.selection);

                $scope.listingObj.category_details = $scope.selection;
                console.log($scope.listingObj);

                var flag = true;

                $scope.listingObj.creator = localStorageService.get('email');

                if (!$scope.listingObj.payment) {
                    $scope.noselectpayments = true;
                    $timeout(function() {
                        $scope.noselectpayments = false;
                    }, 1000);

                } else {
                    for (var i in $scope.listingObj.payment) {
                        if ($scope.listingObj.payment[i]) {
                            localStorageService.set('listingSaved', JSON.stringify($scope.listingObj));
                            $scope.listingObj = localStorageService.get('listingSaved');
                            console.log($scope.listingObj);

                            dbServices.addYourList($scope.listingObj).then( function (response) {
                                if (response.data.success) {
                                    $scope.listingObj = {};
                                    localStorageService.remove('listingSaved');
                                    alert('List is created successfully');

                                    if ($rootScope.user.role != 'dealer') {
                                        $location.path('/listings');
                                    } else {
                                        $location.path('/');
                                    }

                                }
                            });
                            flag = false;
                            break;

                        }

                    }
                    if (flag) {
                        $scope.noselectpayments = true;
                        $timeout(function() {
                            $scope.noselectpayments = false;
                        }, 1000);
                    }
                }
            };

            /************************************************EDIT LIST*********************************************************************/
            $scope.getListingDetails = function() {
                dbServices.getListingDetails($routeParams.lid).then(function(response) {
                    if (response.data.success) {
                        $scope.listing = {
                            listing_details: response.data.listing_details[0],
                            category_details: response.data.category_details,
                            open_close_details: response.data.open_close_details
                        };
                        console.log($scope.listing);
                        $scope.open_close_details = [{
                            "day": "Mon",
                            "open": "8:00 AM",
                            "close": "8:30 PM",
                            "list_open": false
                        }, {
                            "day": "Tue",
                            "open": "8:00 AM",
                            "close": "8:30 PM",
                            "list_open": false
                        }, {
                            "day": "Wed",
                            "open": "8:00 AM",
                            "close": "8:30 PM",
                            "list_open": false
                        }, {
                            "day": "Thu",
                            "open": "8:00 AM",
                            "close": "8:30 PM",
                            "list_open": false
                        }, {
                            "day": "Fri",
                            "open": "8:00 AM",
                            "close": "8:30 PM",
                            "list_open": false
                        }, {
                            "day": "Sat",
                            "open": "8:00 AM",
                            "close": "8:30 PM",
                            "list_open": false
                        }, {
                            "day": "Sun",
                            "open": "8:00 AM",
                            "close": "8:30 PM",
                            "list_open": false
                        }];

                        $scope.payment = {
                            'cash': false,
                            'card': false
                        };

                        if ($scope.listing.listing_details.cash && ($scope.listing.listing_details.cash!="null")) {
                            $scope.payment.cash = true;
                        }
                        if ($scope.listing.listing_details.card && ($scope.listing.listing_details.card!="null")) {
                            $scope.payment.card = true;
                        }
                        if ($scope.listing.listing_details.delivers == 'N') {
                            $scope.delivery = false;
                        } else if ($scope.listing.listing_details.delivers == 'Y') {
                            $scope.delivery = true;
                        }

                        console.log($scope.delivery);
                        for (var i = 0; i < $scope.listing.open_close_details.length; i++) {
                            if ($scope.listing.open_close_details[i].day == 'Mon') {
                                $scope.open_close_details[0].open = $scope.listing.open_close_details[i].open;
                                $scope.open_close_details[0].close = $scope.listing.open_close_details[i].close;
                                $scope.open_close_details[0].list_open = true;
                            } else if ($scope.listing.open_close_details[i].day == 'Tue') {
                                $scope.open_close_details[1].open = $scope.listing.open_close_details[i].open;
                                $scope.open_close_details[1].close = $scope.listing.open_close_details[i].close;
                                $scope.open_close_details[1].list_open = true;
                            } else if ($scope.listing.open_close_details[i].day == 'Wed') {
                                $scope.open_close_details[2].open = $scope.listing.open_close_details[i].open;
                                $scope.open_close_details[2].close = $scope.listing.open_close_details[i].close;
                                $scope.open_close_details[2].list_open = true;
                            } else if ($scope.listing.open_close_details[i].day == 'Thu') {
                                $scope.open_close_details[3].open = $scope.listing.open_close_details[i].open;
                                $scope.open_close_details[3].close = $scope.listing.open_close_details[i].close;
                                $scope.open_close_details[3].list_open = true;
                            } else if ($scope.listing.open_close_details[i].day == 'Fri') {
                                $scope.open_close_details[4].open = $scope.listing.open_close_details[i].open;
                                $scope.open_close_details[4].close = $scope.listing.open_close_details[i].close;
                                $scope.open_close_details[4].list_open = true;
                            } else if ($scope.listing.open_close_details[i].day == 'Sat') {
                                $scope.open_close_details[5].open = $scope.listing.open_close_details[i].open;
                                $scope.open_close_details[5].close = $scope.listing.open_close_details[i].close;
                                $scope.open_close_details[5].list_open = true;
                            } else if ($scope.listing.open_close_details[i].day == 'Sun') {
                                $scope.open_close_details[6].open = $scope.listing.open_close_details[i].open;
                                $scope.open_close_details[6].close = $scope.listing.open_close_details[i].close;
                                $scope.open_close_details[6].list_open = true;
                            }
                        }

                        $scope.selection = $scope.listing.category_details;
                        dbServices.getAllCategories().then(function(response) {
                            if (response.data.success) {
                                $scope.categories = response.data.categories;


                                for (var i = 0; i < $scope.categories.length; i++) {
                                    for (var j = 0; j < $scope.selection.length; j++) {
                                        if ($scope.categories[i].category_id === $scope.selection[j].category_id) {
                                            $scope.categories[i].preselected = true;
                                        } else {
                                            $scope.categories[i].preselected = false;
                                        }
                                    }
                                }

                                console.log($scope.categories);

                            }
                        });
                    }

                });
            };

            $scope.getGeoCoordinatesEdit = function(event) {
                navigator.geolocation.getCurrentPosition(onSuccess, Error, {
                    enableHighAccuracy: true
                });

                function onSuccess(position) {
                    console.log(position);
                    $scope.lat = Math.round(position.coords.latitude * 1000000) / 1000000;
                    $scope.lon = Math.round(position.coords.longitude * 1000000) / 1000000;
                    $scope.$apply(function() {
                        $scope.listing.listing_details.longitude = $scope.lat;
                        $scope.listing.listing_details.latitude = $scope.lon;
                        $rootScope.getCordinatebtn = false;
                    });
                }

                function onError(error) {
                    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                }
            };

            $scope.clearGeoCoordinatesEdit = function() {
                $rootScope.getCordinatebtn = true;
                $scope.listing.listing_details.longitude = '';
                $scope.listing.listing_details.latitude = '';
            };

            $scope.updateList = function() {
                $scope.listing.listing_details.delivers = $scope.delivery;
                $scope.listing.listing_details.cash = $scope.payment.cash;
                $scope.listing.listing_details.card = $scope.payment.card;

                console.log($scope.listing.listing_details);
                console.log($scope.open_close_details);
                console.log($scope.selection);

                var listingObj = {
                    listing_details: $scope.listing.listing_details,
                    open_close_details: $scope.open_close_details,
                    category_details: $scope.selection
                };

                dbServices.updateList(listingObj).then(function(response) {
                    if (response.data.success) {
                        alert('List is updated successfully');
                        if (!listingObj.listing_details.approved && listingObj.listing_details.rejected) {
                            $location.path('/listingsRejected');
                        } else if (listingObj.listing_details.approved && !listingObj.listing_details.rejected) {
                            $location.path('/listings');
                        } else if (!listingObj.listing_details.approved && !listingObj.listing_details.rejected) {
                            $location.path('/listingsForApproval');
                        }
                    }
                });
            };
        }
    ])
    .controller('listingController', ['$scope', '$location', '$rootScope', '$log', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $log, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {

            $scope.page = 0;
            $scope.getAllCategories = function() {
                dbServices.getAllCategories().then(function(response) {
                    if (response.data.success) {
                        $scope.categoriesDetails = response.data.categories;
                    }
                });
            };

            console.log($scope.sel_user_type + ' ' + $scope.sel_cid + ' ' + $scope.sel_status);

            $scope.getListingDetails = function() {
                console.log($rootScope.user);
                dbServices.getListingDetails($routeParams.lid).then(function(response) {
                    if (response.data.success) {
                        $scope.listing = {
                            listing_details: response.data.listing_details[0],
                            category_details: response.data.category_details,
                            open_close_details: response.data.open_close_details
                        };
                        console.log($scope.listing);
                    }
                });
            };


            $scope.getAllUsersEmail = function() {
                dbServices.getAllUsersEmail().then(function(response) {
                    $scope.emails = response.data.emails;
                    console.log(response);
                });
            };

            $scope.showAssignEdit = function() {
                $scope.assign_list = true;
                $scope.assign_list_new = false;
            };


            $scope.listAssignmentNewUser = function() {
                $scope.listAssignment($scope.new_assigned_to);
            };

            $scope.listAssignmentOldUser = function() {
                $scope.listAssignment($scope.assigned_to.email);
            };

            $scope.listAssignment = function(email) {
                console.log(email);
                dbServices.listAssignment($routeParams.lid, email).then(function(response) {
                    console.log(response.data);
                    if (response.data.success) {
                        $scope.listing.listing_details.assigned_to = email;
                        $scope.assign_list = false;
                    } else {
                        $scope.new_assigned_to = '';
                        $scope.assignErr = 'Invalid Email!';
                        $timeout(function() {
                            $scope.assignErr = '';
                        }, 3000);
                    }
                });
            };


            $scope.viewListingDetailsAdmin = function(lid) {
                if (lid) {
                    $location.path('/listingDetails/' + lid);
                }
            };

            $scope.viewListingDetailsForApproval = function(lid) {
                if (lid) {
                    $location.path('/listingDetailsForApproval/' + lid);
                }
            };

            $scope.goToEditListPage = function(lid) {
                console.log('goToEditListPage');
                if (lid) {
                    $location.path('/editListingDetails/' + lid);
                }
            };

            $scope.initializeAllListingForApproval = function() {
                dbServices.getAllListingForApprovalWithFilter($scope.searchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, 1).then(function(response) {
                    if (response.data.success) {
                        $scope.allListings = response.data.listing_details;
                    }
                });
            };

            $scope.scrollAllListingForApproval = function() {
                console.log('infinite scroll ');
                if (!$rootScope.infiniteLoader) {
                    $rootScope.infiniteLoader = true;
                    $scope.page += 1;
                    dbServices.getAllListingForApprovalWithFilter($scope.searchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, $scope.page).then(function(response) {
                        $rootScope.infiniteLoader = false;
                        if (response.data.success) {
                            $scope.allListings = response.data.listing_details;
                        }
                    });
                }
            };

            $scope.filterAllListingForApproval = function() {
                $scope.page = 1;
                console.log($scope.searchtxt);
                dbServices.getAllListingForApprovalWithFilter($scope.searchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, $scope.page).then(function(response) {
                    if (response.data.success) {
                        $scope.allListings = response.data.listing_details;
                    }
                });
            };


            $scope.initializeAllApprovedListing = function() {
                console.log('filter2');
                dbServices.getAllApprovedListingWithFilter($scope.approvedsearchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, 1).then(function(response) {
                    if (response.data.success) {
                        $scope.allApprovedListing = response.data.listing_details;
                    }
                });
            };

            $rootScope.infiniteLoader = false;
            $scope.scrollAllApprovedListing = function() {
                console.log('infinite scroll ');
                if (!$rootScope.infiniteLoader) {
                    $rootScope.infiniteLoader = true;
                    $scope.page += 1;
                    dbServices.getAllApprovedListingWithFilter($scope.approvedsearchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, $scope.page).then(function(response) {
                        $rootScope.infiniteLoader = false;
                        if (response.data.success) {
                            $scope.allApprovedListing = response.data.listing_details;
                        }
                    });
                }
            };

            $scope.filterAllApprovedListing = function() {
                $scope.page = 1;
                console.log('filter1');
                dbServices.getAllApprovedListingWithFilter($scope.approvedsearchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, $scope.page).then(function(response) {
                    if (response.data.success) {
                        $scope.allApprovedListing = response.data.listing_details;
                    }
                });
            };


            $scope.initializeAllRejectedListing = function() {
                dbServices.getAllRejectedListingWithFilter($scope.rejectedsearchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, 1).then(function(response) {
                    if (response.data.success) {
                        $scope.allRejectedListing = response.data.listing_details;
                    }
                });
            };

            $scope.scrollAllRejectedListing = function() {
                if (!$rootScope.infiniteLoader) {
                    $rootScope.infiniteLoader = true;
                    $scope.page += 1;
                    dbServices.getAllRejectedListingWithFilter($scope.rejectedsearchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, $scope.page).then(function(response) {
                        $rootScope.infiniteLoader = false;
                        if (response.data.success) {
                            $scope.allRejectedListing = response.data.listing_details;
                        }
                    });
                }
            };

            $scope.filterAllRejectedListing = function() {
                $scope.page = 1;
                console.log('filter3');
                dbServices.getAllRejectedListingWithFilter($scope.rejectedsearchtxt, $scope.sel_user_type, $scope.sel_cid, $scope.sel_status, $scope.page).then(function(response) {
                    if (response.data.success) {
                        $scope.allRejectedListing = response.data.listing_details;
                    }
                });
            };

            $scope.rejectList = function() {
                console.log($routeParams.lid);
                dbServices.rejectList($routeParams.lid).then(function(response) {
                    if (response.data.success) {
                        $location.path('/listingsForApproval');
                    }
                });
            };

            $scope.acceptList = function() {
                console.log($routeParams.lid);
                dbServices.acceptList($routeParams.lid).then(function(response) {
                    if (response.data.success) {
                        $location.path('/listingsForApproval');
                    }
                });
            };

            $scope.activateListing = function(listObj) {
                dbServices.activateListing(listObj.listing_id).then(function(response) {
                    if (response.data.success) {
                        listObj.status = 'active';
                    } else {
                        listObj.status = 'inactive';
                    }
                });
            };

            $scope.deactivateListing = function(listObj) {
                dbServices.deactivateListing(listObj.listing_id).then(function(response) {
                    if (response.data.success) {
                        listObj.status = 'inactive';
                    } else {
                        listObj.status = 'active';
                    }
                });
            };

        }
    ])
    .controller('dealController', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {

            $scope.deal_list_export_file_name = "deal_list_" + moment(new Date()).format('DD-MM-YYYY') + ".csv";
            $scope.alldeal_list_export_file_name = "all_deals_" + moment(new Date()).format('DD-MM-YYYY') + ".csv";

            $scope.page = 0;

            $scope.user_type = 'all';
            $scope.status = 'all';
            $scope.order_by = 'created';

            $scope.filterAllDeals = function(){
                 $scope.initializeAllDeals();
            };

            $scope.initializeAllDeals = function() {
                $scope.page = 1;

                dbServices.getAllDealsWithFilter($scope.searchtxt, $scope.user_type, $scope.status, $scope.order_by, $scope.page).then(function(response) {
                    if (response.data.success) {
                       $scope.deals = response.data.deals;
                       $scope.exportDeals = [];
                        for (var i = 0; i < $scope.deals.length; i++) {
                            $scope.exportDeals[i] = {
                                'listing_id': $scope.deals[i].listing_id,
                                'bs_name': $scope.deals[i].bs_name,
                                'short_desc': $scope.deals[i].short_desc,
                                'cost': $scope.deals[i].price || 'free',
                                'status': $scope.deals[i].status,
                                'creator': $scope.deals[i].role_id,
                                'availablevoucher': $scope.deals[i].availablevoucher,
                                'claimedvoucher': $scope.deals[i].claimedvoucher,
                                'created': moment($scope.deals[i].created).format('DD/MM/YYYY'),
                                'expiry': moment($scope.deals[i].expiry).format('DD/MM/YYYY')
                            };
                        }

                    }
                });
            };

            $scope.scrollAllDeals = function() {
                console.log('infinite scroll ');
                if (!$rootScope.infiniteLoader) {
                    $rootScope.infiniteLoader = true;
                    $scope.page += 1;
                    dbServices.getAllDealsWithFilter($scope.searchtxt, $scope.user_type, $scope.status, $scope.order_by, $scope.page).then(function(response) {
                        $rootScope.infiniteLoader = false;
                        if (response.data.success) {
                            $scope.deals = response.data.deals;
                            console.log($scope.deals);

                            $scope.exportDeals = [];
                            for (var i = 0; i < $scope.deals.length; i++) {
                                $scope.exportDeals[i] = {
                                    'listing_id': $scope.deals[i].listing_id,
                                    'bs_name': $scope.deals[i].bs_name,
                                    'short_desc': $scope.deals[i].short_desc,
                                    'cost': $scope.deals[i].price || 'free',
                                    'status': $scope.deals[i].status,
                                    'creator': $scope.deals[i].role_id,
                                    'availablevoucher': $scope.deals[i].availablevoucher,
                                    'claimedvoucher': $scope.deals[i].claimedvoucher,
                                    'created': moment($scope.deals[i].created).format('DD/MM/YYYY'),
                                    'expiry': moment($scope.deals[i].expiry).format('DD/MM/YYYY')
                                };
                            }
                        }
                    });
                }
            };

            $scope.getAllDeals = function() {
                dbServices.getAllDeals().then(function(response) {
                    if (response.data.success) {
                        $scope.alldeals = response.data.deals;
                        $scope.exportAllDeals = [];
                        for (var i = 0; i < $scope.alldeals.length; i++) {
                            $scope.exportAllDeals[i] = {
                                'listing_id': $scope.alldeals[i].listing_id,
                                'bs_name': $scope.alldeals[i].bs_name,
                                'short_desc': $scope.alldeals[i].short_desc,
                                'cost': $scope.alldeals[i].price || 'free',
                                'status': $scope.alldeals[i].status,
                                'creator': $scope.alldeals[i].role_id,
                                'availablevoucher': $scope.alldeals[i].availablevoucher,
                                'claimedvoucher': $scope.alldeals[i].claimedvoucher,
                                'created': moment($scope.alldeals[i].created).format('DD/MM/YYYY'),
                                'expiry': moment($scope.alldeals[i].expiry).format('DD/MM/YYYY')
                            };
                        }
                    }
                });
            };

            $scope.dealView = function(id) {
                if (id) {
                    $location.path('/dealdetails/' + id);
                }
            };

            $scope.getdealDetails = function() {
                dbServices.getcompletedealDetails($routeParams.id).then(function(response) {
                    console.log(response);
                    if (response.data.success) {
                        $scope.dealdetails = response.data.deals;
                    }
                });
            };

            $scope.initEdit = function() {
                dbServices.getDealDetails($routeParams.id).then(function(response) {
                    console.log(response.data);
                    if (response.data.success) {
                        $scope.dealdetails = response.data.dealdetails;
                        $scope.old_inventory = $scope.dealdetails.inventory;

                        $scope.dealdetails.valid_to = new Date($scope.dealdetails.valid_to);
                        $scope.dealdetails.valid_from = new Date($scope.dealdetails.valid_from);
                    }
                });
            };

            $scope.goToEditDealPage = function(id) {
                if (id) {
                    $location.path('/dealedit/' + id);
                }
            };

            $scope.goToDuplicateDealPage = function(id) {
                if (id) {
                    $location.path('/createdealsfromduplicate/' + id);
                }
            };

            $scope.initDuplicate = function() {
                dbServices.getDealDetails($routeParams.id).then(function(response) {
                    console.log(response.data);
                    if (response.data.success) {
                        $scope.dealdetails = response.data.dealdetails;
                        $scope.old_inventory = $scope.dealdetails.inventory;
                        $scope.dealdetails.valid_to = new Date($scope.dealdetails.valid_to);
                        $scope.dealdetails.valid_from = new Date($scope.dealdetails.valid_from);
                        $scope.list = {
                            business_name: $scope.dealdetails.bs_name,
                            listing_id: $scope.dealdetails.listing_id
                        }
;                    }
                });
            };

            $scope.getAllListingForDeals = function() {
                dbServices.getAllListingForDeals().then(function(response) {
                    if (response.data.success) {
                        $scope.allListings = response.data.listing_details;
                        console.log($scope.allListings);
                    }
                });
            };

            $scope.getListingOfDealerForDeals = function() {
                dbServices.getListingOfDealerForDeals($rootScope.user.email).then(function(response) {
                    if (response.data.success) {
                        $scope.allListings = response.data.listing_details;
                        console.log($scope.allListings);
                    }
                });
            };

            $scope.mydeal = {};
            $scope.createDeal = function() {
                console.log($rootScope.user.email, $scope.list);
                $scope.mydeal.listing_id = $scope.list.listing_id;
                $scope.mydeal.bs_name = $scope.list.business_name;
                $rootScope.creator = $rootScope.user.email;
                dbServices.createDeal($scope.mydeal, $rootScope.creator).then(function(response) {
                    if (response.data.success) {
                        alert('Deal created successfully');
                        if ($rootScope.user.role != 'admin') {
                            $location.path('/deals');
                        } else {
                            $location.path('/home');
                        }
                    }
                });
            };

            $scope.createDealFromDuplicate = function() {
                $scope.dealdetails.listing_id = $scope.list.listing_id;
                $scope.dealdetails.bs_name = $scope.list.business_name;
                $rootScope.creator = localStorageService.get('email');
                dbServices.createDeal($scope.dealdetails, $rootScope.creator).then(function(response) {
                    if (response.data.success) {
                        alert('Deal created successfully');
                        $location.path('/deals');
                    }
                });
            };

            $scope.updateDeal = function() {
                console.log($scope.dealdetails);
                console.log($scope.old_inventory);

                if ($scope.old_inventory > $scope.dealdetails.inventory) {
                    $scope.dealdetails.total_inventory -= ($scope.old_inventory - $scope.dealdetails.inventory);
                } else if ($scope.old_inventory < $scope.dealdetails.inventory) {
                    $scope.dealdetails.total_inventory += ($scope.dealdetails.inventory - $scope.old_inventory);
                }

                dbServices.updateDeal($scope.dealdetails).then(function(response) {
                    if (response.data.success) {
                        alert('Deal is updated');
                        $location.path('/deals');
                    }
                });
            };

            $scope.myDate = new Date();
        }
    ])
    .controller('discussionController', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {

            $scope.getAllDiscussions = function() {
                dbServices.getAllDiscussions().then(function(response) {
                    if (response.data.success) {
                        console.log(response.data);
                        $scope.all_discussions = response.data.all_discussions;
                    }
                    $scope.filteredTableDate($scope.all_discussions);
                })
            };

            $scope.filteredTableDate = function(allUsers) {
                $scope.$watch("filter.$", function() {
                    $scope.tableParams.reload();
                    $scope.tableParams.page(1);
                });

                var data = allUsers;
                $scope.tableParams = new ngTableParams({
                    page: 1, // show first page
                    count: 5 // count per page
                }, {
                    total: data.length, // length of data
                    getData: function($defer, params) {
                        params.settings().counts = [5, 10, 25, 50, 100];
                        var filteredData = $filter('filter')(data, $scope.filter);
                        var orderedData = params.sorting() ? $filter('orderBy')(filteredData, params.orderBy()) : filteredData;
                        $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                    },
                    $scope: $scope
                });
            }


            $scope.getAllDiscussionComments = function() {
                dbServices.getAllDiscussionComments($routeParams.did).then(function(response) {
                    if (response.data.success) {
                        console.log(response.data);
                        $scope.discussion_details = response.data.discussion_details;
                        $scope.discussion_comments = response.data.discussion_comments;
                        $scope.replyObj = response.data.replyObj;

                        $scope.discussion_details.discussion_create_time = moment($scope.discussion_details.discussion_create_time).format('DD-MM-YYYY,H:MM A');
                        for (var i = 0; i < $scope.discussion_comments.length; i++) {
                            $scope.discussion_comments[i].comment_time = moment($scope.discussion_comments[i].comment_time).format('DD-MM-YYYY,H:MM A');
                        }
                        for (var i = 0; i < $scope.replyObj.length; i++) {
                            for (var j = 0; j < $scope.replyObj[i].replies.length; j++) {
                                $scope.replyObj[i].replies[j].reply_time = moment($scope.replyObj[i].replies[j].reply_time).format('DD-MM-YYYY,H:MM A');
                            }
                        }
                    }
                })
            }

            $scope.toggleDiscussion = function(discussion) {

                dbServices.toggleDiscussion(discussion.d_id, discussion.hidden).then(function(response) {
                    if (response.data.success) {
                        alert('Discussion changed successfully!');
                        (discussion.hidden == 'true') ? (discussion.hidden = 'false') : (discussion.hidden = 'true');
                    }
                })
            }

            $scope.toggleComment = function(comment) {
                dbServices.toggleComment(comment.comment_id, comment.hidden).then(function(response) {
                    if (response.data.success) {
                        alert('Comment changed successfully!');
                        (comment.hidden == 'true') ? (comment.hidden = 'false') : (comment.hidden = 'true');
                    }
                })
            }

            $scope.toggleReply = function(reply) {
                dbServices.toggleReply(reply.reply_id, reply.hidden).then(function(response) {
                    if (response.data.success) {
                        alert('Reply changed successfully!');
                        (reply.hidden == 'true') ? (reply.hidden = 'false') : (reply.hidden = 'true');
                    }
                })
            }

            $scope.gotoDiscussionComments = function(did) {
                if (did) {
                    $location.path('/discussion_comments/' + did);
                }
            }
        }
    ])
    .controller('pushNotificationCtrl', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
            //search listings
            $scope.push;

            $scope.sendRemindForReferal = function() {
                if ($scope.push.remindermessage) {
                    dbServices.remindUserToReferMumpa($scope.push.remindermessage).then(function(response) {
                        if(response.data.success){
                            console.log('okk');
                            $scope.success_msg='Your push submitt successfully'
                            $timeout(function () {
                                $scope.success_msg = '';
                            },2000)
                        }
                    })
                }
            }

        }
    ])
    .controller('referController', ['$scope', 'localStorageService', 'dbServices', '$rootScope', '$location', '$uibModal', '$cookies', '$window', '$timeout',
        function loginCtrl($scope, localStorageService, dbServices, $rootScope, $location, $modal, $cookies, $window, $timeout) {
            
            
            $scope.getReferList = function(page, searchtxt){
                dbServices.getReferDetails(page, searchtxt).then(function(response){
                    console.log(response.data);
                    if(response.data.success){
                        $scope.refer_details = response.data.rows;
                    }
                })
            };

            $scope.initializeReferDetails = function(){
                console.log('init');
                $scope.pagenum = 1;
                $scope.getReferList($scope.pagenum, $scope.searchtxt);
            };

            $scope.scrollReferDetails = function(){
                console.log('scroll');
                $scope.pagenum += 1;
                $scope.getReferList($scope.pagenum, $scope.searchtxt);
            };



        }
    ])
    .controller('otherCtrl', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams','toastr',
        function($scope, $location, $rootScope, $mdDialog, $log, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams, toastr) {

            $scope.getAllList = function(){
                dbServices.getAllList().then(function(response) {
                    console.log(response.data);
                    if (response.data.success) {
                        $scope.all_list = response.data.rows;
                    }
                });
            }

            $scope.getAllCategories = function() {
                dbServices.getAllCategories().then(function(response) {
                    console.log(response.data);
                    if (response.data.success) {
                        $scope.categories = response.data.categories;
                    }
                });
            };

            $scope.getAllCitiesOfList = function(){
                dbServices.getAllCitiesOfList().then(function(response) {
                    console.log(response.data);
                    if (response.data.success) {
                        $scope.cities = response.data.cities;
                    }
                });
            }

            $scope.getAllPreferentialListing = function(){
                dbServices.getAllPreferentialListingWithFilter($scope.sel_cid,$scope.sel_city,$scope.searchtxt,$scope.pagenum)
                .then(function onSuccess(response){
                    console.log(response.data);
                    if(response.data.success){
                        $scope.allListings = response.data.rows;

                        for(var i=0; i<$scope.allListings.length;i++){
                            $scope.allListings[i].premiumList = {};
                            $scope.allListings[i].premiumList.valid_from = new Date();
                            $scope.allListings[i].premiumList.valid_to = new Date();

                            if($scope.allListings[i].category_details.length<2){
                                $scope.allListings[i].premiumList.categoryObj = $scope.allListings[i].category_details[0];
                            }
                        }
                    }
                },function onError(err){
                    console.log(err);
                })
            }

            $scope.initializePreferentailListing = function(){
                $scope.pagenum = 1;
                $scope.getAllPreferentialListing($scope.pagenum);
            }

            $scope.scrollPreferentailListing = function(){
                $scope.pagenum+=1;
                $scope.getAllPreferentialListing($scope.pagenum);
            }


            $scope.toggleAll = function(listObj, index){
                for(var i = 0; i<$scope.allListings.length;i++){
                    if(i!=index){
                        $scope.allListings[i].isCollapsed = true;
                    }
                    $scope.allListings[i].isPromoCheck = true;
                    $scope.allListings[i].isPromoCollapsed = true;
                }

                listObj.isCollapsed = !listObj.isCollapsed;
            }

            $scope.togglePromote = function(listObj, index){
                for(var i = 0; i<$scope.allListings.length;i++){
                    $scope.allListings[i].isPromoCheck = true;
                    $scope.allListings[i].isCollapsed = true;
                    if(i!=index){
                        $scope.allListings[i].isPromoCollapsed = true;
                    }
                }

                listObj.isPromoCollapsed = !listObj.isPromoCollapsed;
            }

            $scope.rankArray = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];

            $scope.checkPreferentialListing = function(listObj, preferentialObj){

                console.log(listObj,preferentialObj);

                if((preferentialObj)&&(preferentialObj.categoryObj)&&(preferentialObj.categoryObj && preferentialObj.listing_type && preferentialObj.rank && preferentialObj.valid_from && preferentialObj.valid_to)){
                    var valid_to = new Date(preferentialObj.valid_to);
                    var valid_from = new Date(preferentialObj.valid_from);

                    if(valid_to < valid_from){
                        toastr.error('Improper Date Range.',{closeButton:true});
                    }else{
                       dbServices.checkPreferentialListing(listObj, preferentialObj).then(function(response){
                            if(response.data.success){
                                if(response.data.check){
                                    listObj.isPromoCheck = false;
                                    toastr.success('This rank is available for the selected category and date range. Click activate to assign in to the listing.',{closeButton:true});
                                }else{
                                    toastr.error('This rank is not available for selected category in the date range.',{closeButton:true});
                                }
                            }
                        }) 
                    }
                }else{
                    toastr.error('Incomplete Form Data', 'Error', {closeButton: true})
                }              
            }

            $scope.addPreferentialListing = function(listObj, preferentialObj){

                console.log(listObj,preferentialObj);

                dbServices.addPreferentialListing(listObj, preferentialObj).then(function(response){
                    if(response.data.success){
                            listObj.preference_details = response.data.rows;
                            listObj.isPromoCheck = true;
                            toastr.success('This rank is allocated successfully to selected category and date range',{closeButton:true});
                    }
                })               
            }



            var today = new Date();
            $scope.minDate = new Date();
            $scope.maxDate = new Date();
            $scope.maxDate.setMonth(today.getMonth()+3);
            $scope.premiumList = {};
            $scope.premiumList.valid_from = new Date();
            $scope.premiumList.valid_to = new Date();

            

            $scope.initPreferred = function(){
                $scope.sel_city = "Gurgaon";
                $scope.sel_listing_type = "Premium";
                $scope.sel_date = new Date();
                $scope.sel_category = 24;
            };

            $scope.getPreferredListing = function(){

                console.log($scope.sel_category);
                dbServices.getPreferredListing($scope.sel_city,$scope.sel_category,$scope.sel_listing_type,$scope.sel_date,$scope.searchtxt).then(function(response){
                    console.log(response.data);
                    if(response.data.success){
                        $scope.all_preferred_listing = response.data.rows;
                    }
                })
            };

            $scope.initializePreferredListing = function(){
                $scope.getPreferredListing();
            }
        }
    ])
	/*created for MR form*/
	.controller('addClient', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
             var refresh = function(){
                 dbServices.viewClientList().then(function(response){
                    $scope.clientList = response.data.data;
                });
            };
            refresh();
            $scope.addNewClient = function(){
                dbServices.addClient($scope.client).then(function(response) {
                       refresh();
                    })
                return false;
            };
           $scope.updateClientStatus = function(id, st){
               var data = {'status':st}
               console.log(data)
               dbServices.updateClient(id, data).then(function(response){
                    console.log(response.data)
                    refresh();    
                })
                
           }
            $scope.deleteClient = function(id) {
                dbServices.deleteClient(id).then(function(response){
                        refresh();
                })
                
            };
        }
    ]).controller('createFormCtrl', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
           
           dbServices.viewClientList().then(function(response){
               $scope.clientList = response.data.data;
            });
            $scope.submit = function(){
                   var data1 = $scope.formdata;
                   dbServices.addMRForm(data1).then(function(response){
                           $scope.addFormData = JSON.parse(JSON.stringify(response.data));
                           $rootScope.formId = $scope.addFormData.data['id'];
                           $location.path('/addquestions/' + $rootScope.formId);                       
                    });
            }
        }
    ]).controller('addQuesCtrl', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
             $scope.question = [];
            $scope.question = [{
                    type :"",
                    description: ""
            }];
            $scope.categoryType = [
                {text: 'Radio', value: 'Radio'},
                {text: 'Textarea', value: 'Textarea'},
                {text: 'Checkbox', value: 'Checkbox'},
                {text: 'Input', value: 'Input'}
             ];
            $scope.addQuestion = function(project){
                 $scope.question.push({ 
                    description: "",
                    type :""
                   
                });
            };
            $scope.AnswerOptionRadio = [];
            $scope.addRadioOptions = function(){
               $scope.AnswerOptionRadio.push({});
               return false;
            };
            $scope.AnswerOptionCheckbox = [];
            $scope.addCheckboxOptions = function(){
               $scope.AnswerOptionCheckbox.push({});
               return false;
            };
           $scope.submit = function(){

           var data2 = $scope.question;
           
           var formQuestions= {};   

            angular.forEach(data2, function(value, index){
                    delete $scope.question[index].description;
                    delete $scope.question[index].type; 
            });
            var questions = JSON.parse(JSON.stringify(data2));

            angular.forEach(data2, function(value, key){
                if(value.question.options){
                        value.question.options = Object.keys(value.question.options).map(function(_) { return value.question.options[_]; })
                }   
                //formQuestions[key] = {'question':JSON.parse(JSON.stringify(value.question))};
                formQuestions[key] = JSON.parse(JSON.stringify(value.question));
                //formQuestions.push({'question': JSON.parse(JSON.stringify(value.question))});
            });
            var final = {'question':formQuestions}

            dbServices.addMRQuestion($routeParams.id, final).then(function(response){
                     $location.path('/uploadbanner/' + $routeParams.id);                       
                    

            })
        }

    }]).controller('uploadBannerCtrl', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
            
            $scope.submit = function(){
                   var formId = {'form_id' : $routeParams.id};
                   var data = new Array();
                   data.push($scope.upload);
                   data.push(formId);
                    dbServices.uploadBannerImage(data).then(function(response){
                           $location.path('/mrformlist/' + $routeParams.id);  

                    });
            }
        }
    ]).controller('uploadBannerCtrl', ['$scope', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
           
                $scope.uploadFile = function(){

                     var file = $scope.myFile;
                       dbServices.uploadFileToUrl($routeParams.id, file)
                       $location.path('/mrformlist/' + $routeParams.id)
                    };         
        }
    ])
    .controller('viewMRList', ['$scope', '$http', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $http, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
            var refresh = function(){
            dbServices.vewList().then(function(response){
                $scope.cllist = response.data.data;
            })
            };
           refresh();
            /*edited*/
            $scope.editForm = function (id) {
                $scope.cllist = index;
             };
            /*deleted*/
            $scope.deleteForm = function(id) {
                dbServices.deleteMRForm(id).then(function(response){
                        refresh();
                })
                
            };

        }
    ])
    .controller('viewFormCtrl', ['$scope', '$http', '$location', '$rootScope', '$mdDialog', '$log', 'localStorageService', '$q', '$timeout', 'dbServices', 'ngTableParams', '$filter', '$routeParams',
        function($scope, $http, $location, $rootScope, $mdDialog, $log, localStorageService, $q, $timeout, dbServices, ngTableParams, $filter, $routeParams) {
            dbServices.viewForm($routeParams.id).then(function(response){
                $scope.mrform = response.data.data;
                 $rootScope.formIdforImage = $scope.mrform.id;
            })
             var refreshClients = function(){
               dbServices.getClientsByFormId($routeParams.id).then(function(response){
                    $scope.assignedClients = response.data.data;
                    $rootScope.assignedClientList = response.data.data;
                     
                     dbServices.viewClientList().then(function(response){
                        var clients = response.data.data;
                        $scope.clientList = [];
                       
                          for(var i=0; i< clients.length; i++ ){
                               var foundMatch = false;
                               var clientAssigned = $rootScope.assignedClientList;

                                for(var j = 0; j<clientAssigned.length; j++){
                                    
                                     if(clients[i]['name']==clientAssigned[j]['name']){
                                       foundMatch = true;
                                      
                                        break;
                                    
                                    }
                                }
                               if (!foundMatch) {
                                 $scope.clientList.push({
                                    id:clients[i]['id'], 
                                    name:clients[i]['name'], 
                                     nbrItem: 1
                                 });
                                
                                }


                            }

                            
                    });
                });    



               
            };
            refreshClients();
            
            $scope.unAssignedClient=function(id){
                var data = {client_id:id}
                dbServices.unassignClientfromForm($routeParams.id, data).then(function(response){
                    refreshClients();
                });
               
            }
           
            $scope.assignClient = function(id){
                dbServices.assignClient($routeParams.id, {'clients':[id]}).then(function(response){
                        refreshClients();
                });
                
            };

            
        }
    ]).filter('uniqueFilter', function() {
          return function(collection, keyname) {
          var output = [], 
              keys = [];
           angular.forEach(collection, function(item) {
               var key = item[keyname];
              if(keys.indexOf(key) === -1) {
                  keys.push(key); 
                   output.push(item);
              }
          });
          // return our array which should be devoid of
          // any duplicates
          return output;
        }
    }).filter('difference', function(){
    return function(arr1, arr2){
        return arr1.filter(function(n) {
                   return arr2.indexOf(n) == -1
               });
    };
}).directive('fileModel', ['$parse', function ($parse) {
            return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                  var model = $parse(attrs.fileModel);
                  var modelSetter = model.assign;
                  
                  element.bind('change', function(){
                     scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                     });
                  });
               }
            };
}])
/*MR form end here*/
	
    .filter('filterDealOnUser', function() {
        return function(data, usertype) {
            var filterArr = []
            if (usertype == undefined || usertype == 'All') {

                return data;
            } else {
                var type = usertype.toLowerCase();
                angular.forEach(data, function(value, key) {
                    if (value.role_id == type) {
                        filterArr.push(value);
                    }
                });
                return filterArr;
            }

        }
    });