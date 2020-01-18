"use strict";

mumpaApp.service("dbServices", [
  "$http",
  function($http) {
    //var host = 'http://104.131.75.147';
    //var host = 'http://23.236.190.167';
    var host = "http://localhost";
    var port = "4000";
    var host_server = host + ":" + port;
    //var host_server = backend;

    //console.log('host_server',host_server);

    this.getAllUsers = function() {
      return $http.get(host_server + "/getAllUsers").then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getUserDetails = function(email) {
      return $http.get(host_server + "/getUserDetails/" + email).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.deactivateUser = function(email) {
      return $http.put(host_server + "/deactivateUser/email/" + email).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.activateUser = function(email) {
      return $http.put(host_server + "/activateUser/email/" + email).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getAllCategories = function(email) {
      return $http.get(host_server + "/getallcategory").then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getListingDetails = function(id) {
      //console.log(id);
      return $http.get(host_server + "/getAllDetailsOfList/id/" + id).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getMyDetails = function(id) {
      //console.log(id);
      return $http.get(host_server + "/getMyDetails").then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.updateMe = function(myobj) {
      //console.log(myobj);
      return $http
        .put(host_server + "/updateMe", {
          name: myobj.name,
          gender: myobj.gender,
          city: myobj.city,
          mobile: myobj.mobile
        })
        .then(
          function(response) {
            //console.log(response);
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.dashboardUserAuthenticate = function(email, password) {
      return $http
        .post(host_server + "/dashboardUserAuthenticate", {
          email: email,
          password: password
        })
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.logout = function() {
      return $http.get(host_server + "/logout").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getAllListing = function(email) {
      return $http.get(host_server + "/getAllListing").then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    /*this.getAllListingForApproval = function(pagenum){
        return $http.get(host_server+'/getAllListingForApproval').then(function (response) {
            //console.log(response);
            return response;
        }, function(err) {
            return err;
        });
    };

    this.getAllListingForApproval = function(pagenum){
        return $http.get(host_server+'/getAllListingForApproval/pagenum/'+pagenum).then(function (response) {
            //console.log(response);
            return response;
        }, function(err) {
            return err;
        });
    };*/

    this.getAllListingForApprovalWithFilter = function(
      searchtxt,
      user_type,
      cid,
      status,
      pagenum
    ) {
      // console.log(searchtxt, user_type, cid, status, pagenum);
      if (!searchtxt) {
        searchtxt = "all";
      }
      return $http
        .get(
          host_server +
            "/getAllListingForApproval/searchtxt/" +
            searchtxt +
            "/user_type/" +
            user_type +
            "/cid/" +
            cid +
            "/status/" +
            status +
            "/pagenum/" +
            pagenum
        )
        .then(
          function(response) {
            // console.log(response);
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    /*this.getAllApprovedListing = function(pagenum){
        return $http.get(host_server+'/getAllApprovedListing').then(function (response) {
            //console.log(response);
            return response;
        }, function(err) {
            return err;
        });
    };

    this.getAllApprovedListing = function(pagenum){
        return $http.get(host_server+'/getAllApprovedListing/pagenum/'+pagenum).then(function (response) {
            console.log(response);
            return response;
        }, function(err) {
            return err;
        });
    };*/

    this.getAllApprovedListingWithFilter = function(
      searchtxt,
      user_type,
      cid,
      status,
      pagenum
    ) {
      //console.log(user_type, cid, status, pagenum);
      if (!searchtxt) {
        searchtxt = "all";
      }
      return $http
        .get(
          host_server +
            "/getAllApprovedListing/searchtxt/" +
            searchtxt +
            "/user_type/" +
            user_type +
            "/cid/" +
            cid +
            "/status/" +
            status +
            "/pagenum/" +
            pagenum
        )
        .then(
          function(response) {
            //console.log(response);
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    /*this.getAllRejectedListing = function(email){
        return $http.get(host_server+'/getAllRejectedListing').then(function (response) {
            //console.log(response);
            return response;
        }, function(err) {
            return err;
        });
    };

    this.getAllRejectedListing = function(pagenum){
        return $http.get(host_server+'/getAllRejectedListing/pagenum/'+pagenum).then(function (response) {
            //console.log(response);
            return response;
        }, function(err) {
            return err;
        });
    };*/

    this.getAllRejectedListingWithFilter = function(
      searchtxt,
      user_type,
      cid,
      status,
      pagenum
    ) {
      //console.log(user_type, cid, status, pagenum);
      if (!searchtxt) {
        searchtxt = "all";
      }
      return $http
        .get(
          host_server +
            "/getAllRejectedListing/searchtxt/" +
            searchtxt +
            "/user_type/" +
            user_type +
            "/cid/" +
            cid +
            "/status/" +
            status +
            "/pagenum/" +
            pagenum
        )
        .then(
          function(response) {
            //console.log(response);
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.acceptList = function(lid) {
      return $http.get(host_server + "/acceptlist/id/" + lid).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.rejectList = function(lid) {
      return $http.get(host_server + "/rejectlist/id/" + lid).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.activateListing = function(lid) {
      return $http.put(host_server + "/activateListing/id/" + lid).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.deactivateListing = function(lid) {
      return $http.put(host_server + "/deactivateListing/id/" + lid).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.addYourList = function(data) {
      return $http.post(host_server + "/addListDashboard", data).then(
        function(response) {
          //console.log(response);
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.updateList = function(data) {
      console.log(data);
      return $http
        .post(host_server + "/updateListDashboard", {
          listingObj: data
        })
        .then(
          function(response) {
            //console.log(response);
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.getAllDeals = function() {
      return $http.get(host_server + "/db/getalldeal").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getAllDealsWithFilter = function(
      searchtxt,
      user_type,
      status,
      order_by,
      pagenum
    ) {
      console.log(searchtxt, user_type, status, order_by, pagenum);
      if (!searchtxt) {
        searchtxt = "all";
      }
      if (!user_type) {
        user_type = "all";
      }
      if (!status) {
        status = "all";
      }
      if (!order_by) {
        order_by = "created";
      }
      console.log(searchtxt, user_type, status, order_by, pagenum);
      return $http
        .get(
          host_server +
            "/getAllDealsWithFilter/searchtxt/" +
            searchtxt +
            "/user_type/" +
            user_type +
            "/status/" +
            status +
            "/order_by/" +
            order_by +
            "/pagenum/" +
            pagenum
        )
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.getcompletedealDetails = function(id) {
      return $http.get(host_server + "/db/getdealview/did/" + id).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getDealDetails = function(id) {
      return $http.get(host_server + "/getdealDetails/did/" + id).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getAllListingForDeals = function() {
      return $http.get(host_server + "/getAllListingForDeals").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getListingOfDealerForDeals = function(email) {
      return $http.get(host_server + "/getAllListingForDeals/" + email).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.createDeal = function(dealObj, email) {
      return $http
        .post(host_server + "/createDeal", {
          deal: dealObj,
          creator: email
        })
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.updateDeal = function(dealObj) {
      return $http
        .post(host_server + "/updateDeal", {
          deal: dealObj
        })
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.checkUser = function(email) {
      return $http.get(host_server + "/checkUser/email/" + email).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.resetPassword = function(email) {
      return $http.get(host_server + "/resetpassword/email/" + email).then(
        function(response) {
          return response;
        },
        function(error) {
          return error;
        }
      );
    };

    this.changePassword = function(old_password, new_password) {
      return $http
        .post(host_server + "/changepassword", {
          oldpassword: old_password,
          newpassword: new_password
        })
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.registerDealer = function(userObj) {
      return $http
        .post(host_server + "/adddealer", {
          name: userObj.name,
          password: userObj.password,
          email: userObj.email
        })
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.homeDetails = function() {
      return $http.get(host_server + "/homeDetailsDashboard").then(
        function(response) {
          return response;
        },
        function(error) {
          return error;
        }
      );
    };

    this.homeDetailsDealer = function(email) {
      return $http.get(host_server + "/homeDetailsDashboard/" + email).then(
        function(response) {
          return response;
        },
        function(error) {
          return error;
        }
      );
    };

    this.listAssignment = function(lid, assigned_to) {
      return $http
        .put(host_server + "/listAssignment/" + lid + "/" + assigned_to)
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.getAllUsersEmail = function() {
      return $http.get(host_server + "/allUsersEmail").then(
        function(response) {
          return response;
        },
        function(error) {
          return error;
        }
      );
    };

    /*************************DISCUSSION SERVICES*****************************************/

    this.getAllDiscussions = function() {
      return $http.get(host_server + "/getAllDiscussionDetailsDashBoard").then(
        function(response) {
          return response;
        },
        function(error) {
          return error;
        }
      );
    };

    this.getAllDiscussionComments = function(d_id) {
      return $http
        .get(host_server + "/getDiscussionDetailsDashBoard/" + d_id)
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.getAllDiscussionCommentReplies = function(c_id) {
      return $http
        .get(host_server + "/getDiscussionCommentDetailsDashBoard/" + c_id)
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.toggleDiscussion = function(d_id, hidden) {
      return $http
        .put(host_server + "/toggleDiscussion/" + d_id + "/" + hidden)
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.toggleComment = function(c_id, hidden) {
      return $http
        .put(host_server + "/toggleComment/" + c_id + "/" + hidden)
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.toggleReply = function(reply_id, hidden) {
      return $http
        .put(host_server + "/toggleReply/" + reply_id + "/" + hidden)
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.remindUserToReferMumpa = function(message) {
      return $http
        .post("http://104.131.75.147:3333/remindusertorefermumpa/", {
          message: message
        })
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
      /*return $http({
            method: 'POST',
            url: 'https://api.parse.com/1/push',
            headers: {
                'X-Parse-Application-Id': '6HPhd2ZpuDXuLyiKBDX3hrXIJaWEAFQZZfkcxgnZ',
                'X-Parse-REST-API-Key': 'eVVGSKRYOt1S5uiLoyqv2AHmUzGKcQwjjo4oHs3s',
                'Content-Type': 'application/json',
                'host': 'api.parse.com'
            },
            data: {
                "data": {
                    "alert": message
                },
                "channel": "Broadcast"
            }

        }).
        success(function(response, status, headers, config) {
            return response;
        }).
        error(function(data, status, headers, config) {
            return status;
        });*/
    };

    this.getAllStates = function() {
      return $http.get(host_server + "/getAllState").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getCitiesOfStates = function(state) {
      return $http.get(host_server + "/getAllCityOfState/state/" + state).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getAllCitiesOfList = function(state) {
      return $http.get(host_server + "/getAllCitiesOfList").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getReferDetails = function(pagenum, searchtxt) {
      if (!searchtxt) {
        searchtxt = "all";
      }

      console.log(searchtxt, pagenum);

      return $http
        .get(
          host_server +
            "/getAllReferDetails/pagenum/" +
            pagenum +
            "/searchtxt/" +
            searchtxt
        )
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.getAllList = function() {
      return $http.get(host_server + "/getAllList").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.getAllPreferentialListingWithFilter = function(
      cid,
      city,
      searchtxt,
      pagenum
    ) {
      console.log(searchtxt, cid, city, pagenum);
      if (!searchtxt) {
        searchtxt = "all";
      }
      if (!cid) {
        cid = "all";
      }
      if (!city) {
        city = "all";
      }
      return $http
        .get(
          host_server +
            "/preferentialListing/cid/" +
            cid +
            "/city/" +
            city +
            "/searchtxt/" +
            searchtxt +
            "/pagenum/" +
            pagenum
        )
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.checkPreferentialListing = function(listObj, preferentialObj) {
      console.log(
        listObj.city,
        preferentialObj.categoryObj.category_id,
        preferentialObj.listing_type,
        preferentialObj.rank,
        preferentialObj.valid_from,
        preferentialObj.valid_to
      );

      return $http
        .post(host_server + "/checkPreferentialListing", {
          listing_id: listObj.listing_id,
          city: listObj.city,
          category_id: preferentialObj.categoryObj.category_id,
          listing_type: preferentialObj.listing_type,
          rank: preferentialObj.rank,
          valid_from: preferentialObj.valid_from,
          valid_to: preferentialObj.valid_to
        })
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.addPreferentialListing = function(listObj, preferentialObj) {
      return $http
        .post(host_server + "/addPreferentialListing", {
          listing_id: listObj.listing_id,
          city: listObj.city,
          category_id: preferentialObj.categoryObj.category_id,
          listing_type: preferentialObj.listing_type,
          rank: preferentialObj.rank,
          valid_from: preferentialObj.valid_from,
          valid_to: preferentialObj.valid_to
        })
        .then(
          function(response) {
            return response;
          },
          function(error) {
            return error;
          }
        );
    };

    this.getPreferredListing = function(
      city,
      cid,
      listing_type,
      date,
      searchtxt
    ) {
      if (!searchtxt) {
        searchtxt = "all";
      }
      if (!cid) {
        cid = 24;
      }
      if (!listing_type) {
        listing_type = "Premium";
      }
      if (!date) {
        date = new Date();
      }
      if (!city) {
        city = "Gurgaon";
      }

      date = moment(date).format("YYYY-MM-DD");

      return $http
        .get(
          host_server +
            "/getPreferredListing/city/" +
            city +
            "/cid/" +
            cid +
            "/listing_type/" +
            listing_type +
            "/date/" +
            date +
            "/searchtxt/" +
            searchtxt
        )
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    // created for MR form
    this.addClient = function(data) {
      return $http.post("http://104.131.75.147:8888/addclient", data).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };
    this.viewClientList = function(data) {
      return $http.get("http://104.131.75.147:8888/getclient/all").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };
    this.deleteClient = function(id) {
      return $http.get("http://104.131.75.147:8888/deleteclient/id/" + id).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };
    this.updateClient = function(id, data) {
      return $http
        .post("http://104.131.75.147:8888/updateclient/id/" + id + "", data)
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };
    this.vewList = function(data) {
      return $http.get("http://104.131.75.147:8888/getform/all").then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };
    this.addMRForm = function(data) {
      return $http.post("http://104.131.75.147:8888/addform", data).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };

    this.addMRQuestion = function(id, data) {
      return $http
        .post("http://104.131.75.147:8888/addquestions/formid/" + id + "", data)
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };

    this.assignClient = function(id, data) {
      return $http
        .post("http://104.131.75.147:8888/assignform/id/" + id + "", data)
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };
    this.getClientsByFormId = function(id) {
      return $http
        .get("http://104.131.75.147:8888/getclients/formid/" + id)
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };
    this.unassignClientfromForm = function(id, data) {
      return $http
        .post("http://104.131.75.147:8888/unassignclient/id/" + id + "", data)
        .then(
          function(response) {
            return response;
          },
          function(err) {
            return err;
          }
        );
    };
    this.viewForm = function(id, data) {
      return $http.get("http://104.131.75.147:8888/getform/id/" + id).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };
    this.deleteMRForm = function(id) {
      return $http.get("http://104.131.75.147:8888/deleteform/id/" + id).then(
        function(response) {
          return response;
        },
        function(err) {
          return err;
        }
      );
    };
    this.uploadFileToUrl = function(id, file) {
      var fd = new FormData();
      fd.append("file", file);

      $http.post("http://104.131.75.147:8888/form_image_upload/" + id, fd, {
        transformRequest: angular.identity,
        headers: { "Content-Type": undefined }
      });
    };

    // MR form end here
  }
]);
