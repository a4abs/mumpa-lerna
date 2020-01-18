/*
@ Server JS File ******
@ Date 21 September 2015
@ Update : 12 October 2015
@ Auther : Technocube(INDIA)
*/
/*
@ Mumpa Application Server required Dependencies or Modules
*/

var express = require("express");
var mysql = require("mysql");
var cors = require("cors");
var bodyParser = require("body-parser");
var wrench = require("wrench");
var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var walk = require("walk");
var fse = require("fs-extra");
var multipart = require("connect-multiparty");
var multipartMiddleware = multipart();
var crypto = require("crypto");
var nodemailer = require("nodemailer");
var randtoken = require("rand-token");

var cookieParser = require("cookie-parser");
var jwt = require("jsonwebtoken");
var requestify = require("requestify");
var schedule = require("node-schedule");
/***
@ Application Initialization
***/
var app = express();

app.use(cors());

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: false
  })
);

app.use(
  bodyParser.json({
    limit: "50mb"
  })
);

app.use(cookieParser());
app.use(multipartMiddleware);

var isAuthorized = function(req, res, next) {
  if (req.headers && req.headers.authorization) {
    var token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, "shhhhhhared-secret");
    req.profile = decoded;
    //console.log(decoded);
    if (decoded && decoded.email) {
      next();
    } else {
      res.status(401).json({ error: "not authorized" });
    }
  } else {
    res.status(401).json({ error: "not authorized" });
  }
};

var isAdmin = function(req, res, next) {
  if (req.headers && req.headers.authorization) {
    var token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, "shhhhhhared-secret");
    req.profile = decoded;
    //console.log(decoded);
    if (decoded && decoded.role === "admin") {
      next();
    } else {
      console.log("not authorized");
      res.status(401).json({ error: "not authorized" });
    }
  } else {
    console.log("not authorized");
    res.status(401).json({ error: "not authorized" });
  }
};

var isDealer = function(req, res, next) {
  if (req.headers && req.headers.authorization) {
    var token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, "shhhhhhared-secret");
    req.profile = decoded;
    //console.log(decoded);
    if (decoded && decoded.role === "dealer") {
      next();
    } else {
      console.log("not authorized");
      res.status(401).json({ error: "not authorized" });
    }
  } else {
    console.log("not authorized");
    res.status(401).json({ error: "not authorized" });
  }
};

var isApprover = function(req, res, next) {
  if (req.headers && req.headers.authorization) {
    var token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, "shhhhhhared-secret");
    req.profile = decoded;
    //console.log(decoded);
    if (decoded && decoded.role === "approver") {
      next();
    } else {
      console.log("not authorized");
      res.status(401).json({ error: "not authorized" });
    }
  } else {
    console.log("not authorized");
    res.status(401).json({ error: "not authorized" });
  }
};

app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/category", express.static(__dirname + "/category"));

/***
@ Database connection : create connection to Database
***/
var connection = mysql.createConnection({
  host: "104.131.75.147",
  user: "aakash",
  password: "envigo123",
  database: "mumpa_prod"
});

/*var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mumpa123',
    database: 'mumpa123'
});*/

/*var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'mumpa123',
    password: ''
});*/

/***
@ Database Connection Test: Test Database connection
***/
connection.connect(function(err) {
  if (!err) {
    console.log("Database is connected ... \n\n");
  } else {
    console.log("Error connecting database ... \n\n");
  }
});

/***
@ Mailer configuration
***/
var done = false;
var transporter = nodemailer.createTransport({
  service: "Gmail",
  /*auth: {
        user: 'ankur.sharma@technocube.in',
        pass: 'ankur123'
    }*/
  auth: {
    user: "hello@mumpa.in",
    pass: "hellomumpa123"
  }
});

app.get("/loggedin", function(req, res) {
  if (req.headers && req.headers.authorization) {
    var token = req.headers.authorization.split(" ")[1];
    var decoded = jwt.verify(token, "shhhhhhared-secret");
    req.profile = decoded;
    console.log(decoded);
    if (decoded && decoded.email) {
      res.json(req.Profile);
    } else {
      res.json(false);
    }
  } else {
    res.json(false);
  }
});

app.get("/getMyDetails", isAuthorized, function(req, res) {
  connection.query(
    "select name,email,city,gender,role_id,refer_id,mobile from user where email=?",
    [req.profile.email],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        console.log(rows[0]);
        res.json({ success: true, mydetails: rows[0] });
      }
    }
  );
});

app.put("/updateMe", isAuthorized, function(req, res) {
  connection.query(
    "update user set name=?,gender=?,mobile=?,city=? where email=?",
    [
      req.body.name,
      req.body.gender,
      req.body.mobile,
      req.body.city,
      req.profile.email
    ],
    function(err, result) {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});

/**
 *** DASHBOARD - LOGIN
 **/
app.post("/dashboardUserAuthenticate", function(req, res) {
  console.log("email ", req.body.email);
  console.log("password ", req.body.password);

  connection.query(
    'SELECT * FROM user WHERE email = "' + req.body.email + '"',
    function(err, rows, fields) {
      console.log("===========================================");
      console.log(rows);
      console.log(rows.length);
      if (err || !rows.length || !rows[0].salt) {
        console.log(err);
        res.json({
          success: false
        });
      } else {
        console.log("rows ", rows);
        var salt = new Buffer(rows[0].salt, "base64");
        console.log(salt);
        var hash = crypto
          .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
          .toString("base64");
        console.log(hash);
        if (
          hash === rows[0].hashed_password &&
          (rows[0].role_id === "dealer" ||
            rows[0].role_id === "approver" ||
            rows[0].role_id === "admin")
        ) {
          var profile = {
            name: rows[0].name,
            email: rows[0].email,
            role: rows[0].role_id
          };

          var token = jwt.sign(profile, "shhhhhhared-secret", {
            expiresInMinutes: 6000 * 5
          });
          res.json({
            success: true,
            user: rows[0],
            token: token
          });
        } else {
          res.json({
            success: false
          });
        }
      }
    }
  );
});

app.get("/logout", function(req, res) {
  req.session.destroy(function() {
    //res.redirect('/');
    res.json({
      success: true
    });
  });
});

/***
@ Global Function/Methods
***/

/***
@ Method
@ FUNCTION FOR GENERATING RANDOM NUMBER
***/
exports.randomString = function() {
  var chars = "0123456789";
  var string_length = 4;
  var randomstring = "";
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
};

exports.randomPassword = function() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var string_length = 8;
  var randomstring = "";
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
};

/**
@ CHECK USER 
**/
app.get("/checkUser/email/:email", function(req, res) {
  connection.query(
    'SELECT * from user WHERE email = "' + req.params.email + '"',
    function(err, rows, fields) {
      //connection.end();
      if (!err) {
        if (rows.length) {
          res.json({
            success: true,
            rows: rows
          });
        } else {
          res.json({
            success: false
          });
        }
      } else {
        console.log("Error while performing Query.");
      }
    }
  );
});

/***
@ Send Feedback Mail
***/
app.post("/sendfeedbackmail", function(req, res) {
  var mailData = req.body.feedback;
  var sender = req.body.email;
  console.log(sender);

  var mailOptions = {
    from: "Mumpa Feedback<appmumpa@gmail.com>", // sender address
    to:
      "ankur.sharma@technocube.in, kshama.sheetal@technocube.in,appmumpa@gmail.com", // list of receivers
    subject: "Mumpa Feedback Mail", // Subject line
    text: mailData, // plaintext body
    html: mailData // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
});

/***
@ FORGOT PASSWORD 
***/
app.get("/resetpassword/email/:email", function(req, res) {
  // Create a token generator with the default settings:
  var uid = randtoken.uid;
  req.token = uid(80);
  console.log(req.params.email);
  connection.query(
    'SELECT * from user WHERE email = "' + req.params.email + '"',
    function(err, rows, fields) {
      //connection.end();
      if (err) {
        console.log(err);
        res.json({
          success: false
        });
      } else {
        console.log(rows);
        if (rows.length) {
          req.rows = rows;
          console.log(rows);

          var query_st =
            'INSERT INTO user_reset_password (email, token) values("' +
            req.params.email +
            '","' +
            req.token +
            '") on duplicate key update token = "' +
            req.token +
            '"';

          connection.query(query_st, function(err, result) {
            if (err) {
              console.log(err);
              res.send({
                success: false
              });
            } else {
              // SEND THE MAIL
              console.log("req.token ", req.token);
              console.log("send mail to user");

              var mailOptions = {
                from: "Mumpa Suppot<hello@mumpa.in>", // sender address
                to: req.params.email, // list of receivers
                subject: "Mumpa Reset Password", // Subject line
                text: "", // plaintext body
                html:
                  '<html> <body style="background-color:#eff0f2; text-align:left;padding:0px;"> <table width="651" align="center" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;-webkit-box-shadow:10px 10px 43px-3px rgba(207,203,207,1);-moz-box-shadow:10px 10px 43px -3px rgba(207,203,207,1);box-shadow:10px 10px 43px -3px rgba(207,203,207,1);font-family:Arial,Helvetica,sans-serif;"> <tbody> <tr> <td valign="top" align="center" width="651" style="padding:40px 15px 0px; display:block;"> <a href="http://mumpa.in" target="_blank"><img src="http://mumpa.in/images/emailer/decmumpa15/Mumpa-Logo.png" alt="Mumpa" width="159" height="76" style="display:block;" border="0"></a> </td> <tr/> <tr> <td valign="top" align="left" width="651" style="padding:10px 30px; display:block;color:#6f6d6d;font-size:18px; line-height:30px;"> <p style="font-weight:bold;line-height:48px;">Hi ' +
                  req.rows[0].name +
                  ',</p> <p style="font-size:25px;line-height:30px;color:#565555;font-weight:bold;">We received a request to reset the password for your account.</p> <p style="line-height:26px;">If you requested for a password reset, click the button below. If you did not make this request, kindly ignore this email and your password will remain unchanged.</p> </td> <tr/> <tr> <td valign="middle" align="left" width="651" style="padding:15px 30px; display:block;"> <a href="http://www.mumpa.in/reset_password/reset/#/reset/email/' +
                  req.params.email +
                  "/token/" +
                  req.token +
                  '"><img src="http://mumpa.in/images/emailer/decmumpa15/resetpwdbtn1.png" alt="Reset password" width="248" height="69" style="display:block;" /></a> </td> </tr> <tr> <td valign="top" align="left" width="651" style="padding:30px 30px 40px; display:block;color:#6f6d6d;font-size:18px; line-height:18px;"> <p>From</p> <p style="font-weight:bold;">The Mumpa Team</p> </td> <tr/> <tr height="30px" style="background-color:#eff0f2"> <td valign="top" align="left" width="651"> <p>&nbsp;</p> </td> <tr/> <tr> <td valign="top" align="left" width="651" style="padding:30px 30px 40px; display:block;color:#817c7c;font-size:16px; line-height:22px;background-color:#e2dbf3;"> <p>You received this email because it was requested by a Mumpa user. It is a part and parcel of the procedure for creating a new password.</p> </td> <tr/> </tbody> </table> </body> </html> '
              };

              transporter.sendMail(mailOptions, function(err, info) {
                if (err) {
                  console.log(err);
                  res.send({
                    success: false
                  });
                } else {
                  res.send({
                    success: true
                  });
                }
              });
            }
          });
        } else {
          res.json({
            success: false
          });
        }
      }
    }
  );
});

/***
@ MANUALLY SET NEW PASSWORD
***/
app.post("/manualsetpassword", function(req, res) {
  console.log("email ", req.body.email);
  console.log("password ", req.body.password);

  req.body.salt = crypto.randomBytes(16).toString("base64");
  var salt = new Buffer(req.body.salt, "base64");
  req.body.hashed_password = crypto
    .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
    .toString("base64");
  console.log(req.body.salt, "  ", req.body.hashed_password);

  var query_st = "UPDATE user SET salt=?, hashed_password=? WHERE email=?";
  connection.query(
    query_st,
    [req.body.salt, req.body.hashed_password, req.body.email],
    function(err, result) {
      if (err) {
        console.log(err);
        res.json({
          success: false
        });
      } else {
        res.json({
          success: true
        });
      }
    }
  );
});

/***
@ SET NEW PASSWORD FROM EMAIL
***/
app.post("/setpassword", function(req, res) {
  console.log("email ", req.body.email);
  console.log("token ", req.body.token);
  console.log("password ", req.body.password);

  req.body.salt = crypto.randomBytes(16).toString("base64");
  var salt = new Buffer(req.body.salt, "base64");
  req.body.hashed_password = crypto
    .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
    .toString("base64");
  console.log(req.body.salt, "  ", req.body.hashed_password);

  var query_st1 =
    'SELECT * from user_reset_password WHERE email ="' +
    req.body.email +
    '" and token = "' +
    req.body.token +
    '"';
  connection.query(query_st1, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      if (rows.length) {
        var query_st2 =
          "UPDATE user SET salt=?, hashed_password=? WHERE email=?";
        connection.query(
          query_st2,
          [req.body.salt, req.body.hashed_password, req.body.email],
          function(err, result) {
            if (err) {
              console.log(err);
              res.send({
                success: false
              });
            } else {
              res.send({
                success: true
              });
            }
          }
        );
      } else {
        console.log("Token Email Match Not Found!");
        console.log(err);
        res.send({
          success: false
        });
      }
    }
  });
});

/***
@ CHANGE PASSWORD
***/
app.post("/changepassword", isAuthorized, function(req, res) {
  console.log("email ", req.body.email);
  console.log("newpassword ", req.body.newpassword);
  console.log("oldpassword ", req.body.oldpassword);

  connection.query(
    'SELECT * from user WHERE email = "' + req.profile.email + '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: true
        });
      } else {
        if (rows.length) {
          console.log(rows);
          var salt = new Buffer(rows[0].salt, "base64");
          var hash = crypto
            .pbkdf2Sync(req.body.oldpassword, salt, 10000, 64, "sha512")
            .toString("base64");

          if (hash === rows[0].hashed_password) {
            console.log("old password match");
            req.body.salt = crypto.randomBytes(16).toString("base64");
            var salt = new Buffer(req.body.salt, "base64");
            req.body.hashed_password = crypto
              .pbkdf2Sync(req.body.newpassword, salt, 10000, 64, "sha512")
              .toString("base64");

            var query_st =
              "UPDATE user SET salt=?, hashed_password=? WHERE email=?";
            connection.query(
              query_st,
              [req.body.salt, req.body.hashed_password, req.profile.email],
              function(err, result) {
                if (err) {
                  console.log(err);
                  res.send({
                    success: false
                  });
                } else {
                  res.send({
                    success: true
                  });
                }
              }
            );
          } else {
            console.log("old password did not match");
            res.send({
              success: false
            });
          }
        }
      }
    }
  );
});

/**
 ************************************************************************************************************************
 *********************************************DASHBOARD SERVICES START*****************************************************
 ************************************************************************************************************************
 **/

app.get("/homeDetailsDashboard", isAdmin, function(req, res) {
  var user_query =
    "select count(*) as total, count( case when role_id='admin' then 1 end) as admin, count( case when role_id='dealer' then 1 end) as dealer,count( case when role_id='user' then 1 end) as user from user";
  var list_query =
    "select count(*) as total, count( case when approved = 0 and rejected = 0 then 1 end) as approval, count( case when approved = 1 and rejected = 0 then 1 end) as approved, count( case when approved = 0 and rejected = 1 then 1 end) as rejected  from listing_details;";
  var deal_query =
    "select count(*) as total, count( case when valid_from < now() and valid_to > now() then 1 end) as active, count( case when  valid_to < now() then 1 end) as inactive from deal_voucher";
  var cat_query =
    "select lc.category_id,lc.category, count(lc.category_id) as list_count from listing_category lc left outer join (select ld.*,lcd.category_id from listing_details ld left outer join listing_category_details lcd on ld.listing_id = lcd.listing_id) lcdd on lc.category_id = lcdd.category_id group by lc.category_id";

  connection.query(user_query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({
        success: false
      });
    }
    req.user_details = rows[0];

    connection.query(list_query, function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.json({
          success: false
        });
      }
      req.list_details = rows[0];

      connection.query(deal_query, function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({
            success: false
          });
        }
        req.deal_details = rows[0];

        connection.query(cat_query, function(err, rows, fields) {
          if (err) {
            console.log(err);
            res.json({
              success: false
            });
          }
          res.json({
            success: true,
            user_details: req.user_details,
            list_details: req.list_details,
            deal_details: req.deal_details,
            category_details: rows
          });
        });
      });
    });
  });
});

app.get("/homeDetailsDashboard/:email", isDealer, function(req, res) {
  console.log("*********************************************************");
  console.log(req.profile);

  var list_query =
    'select ll.* from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) ll where ll.assigned_to = "' +
    req.params.email +
    '"';

  var deal_query =
    'select dd.* from (select dv.voucher_id,dv.listing_id,dv.deal_creater_email as creator,dv.bs_name,dv.short_desc,dv.price, uu.role_id, dv.inventory as availablevoucher, (dv.total_inventory - dv.inventory) as claimedvoucher, dv.valid_to as expiry from deal_voucher dv left outer join user uu on uu.email = dv.deal_creater_email) dd where dd.creator= "' +
    req.params.email +
    '"';

  console.log(req.headers);

  connection.query(list_query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({
        success: false
      });
    }
    req.list_details = rows;

    connection.query(deal_query, function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.json({
          success: false
        });
      }
      res.json({
        success: true,
        list_details: req.list_details,
        deal_details: rows
      });
    });
  });
});

app.put("/listAssignment/:lid/:assigned_to", function(req, res) {
  connection.query(
    "select * from listing_details where listing_id=?",
    [req.params.lid],
    function(err, rows, result) {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        req.listObj = rows[0];
        connection.query(
          "select * from user where email=?",
          [req.params.assigned_to],
          function(err, rows, result) {
            if (err) {
              console.log(err);
              res.json({ success: false });
            } else {
              if (rows.length > 0) {
                req.userObj = rows[0];
                exports.assign_list_to_old_user(req, res);
              } else {
                exports.assign_list_to_new_user(req, res);
              }
            }
          }
        );
      }
    }
  );
});

exports.assign_list_to_old_user = function(req, res) {
  var query_change_role =
    'Update user SET role_id = "dealer" where email = "' +
    req.params.assigned_to +
    '"';
  var query =
    'UPDATE listing_details SET assigned_to ="' +
    req.params.assigned_to +
    '" where listing_id =' +
    req.params.lid;

  connection.query(query_change_role, function(err, result) {
    if (err) {
      console.log(err);
      res.json({
        success: false
      });
    } else {
      connection.query(query, function(err, result) {
        if (err) {
          console.log(err);
          res.json({
            success: false
          });
        } else {
          var mailOptions = {
            from: "Mumpa<hello@mumpa.in>", // sender address
            to: req.params.assigned_to, // list of receivers
            subject: "Manage your store listing on Mumpa", // Subject line
            text: "", // plaintext body
            html:
              '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <HTML><HEAD><META content="IE=5.0000" http-equiv="X-UA-Compatible"> <META http-equiv="Content-Type" content="text/html; charset=utf-8"> <META name="GENERATOR" content="MSHTML 11.00.10240.16603"></HEAD> <BODY style="padding: 0px; text-align: left; background-color: rgb(239, 240, 242);"> <TABLE width="651" align="center" style="font-family: Arial,Helvetica,sans-serif; box-shadow: 10px 10px 43px -3px rgba(207,203,207,1); background-color: rgb(255, 255, 255); -webkit-box-shadow: 10px 10px 43px-3px rgba(207, 203, 207, 1); -moz-box-shadow: 10px 10px 43px -3px rgba(207, 203, 207, 1);" border="0" cellspacing="0" cellpadding="0"> <TBODY> <TR> <TD width="651" align="center" valign="top" style="padding: 40px 15px 0px; display: block;"><A href="http://mumpa.in/" target="_blank"><IMG width="159" height="76" style="display: block;" alt="Mumpa" src="http://mumpa.in/images/emailer/decmumpa15/Mumpa-Logo.png" border="0"></A> </TD> <TR> <TR> <TD width="651" align="left" valign="top" style="padding: 5px 30px; color: rgb(111, 109, 109); line-height: 36px; font-size: 18px; display: block;"> <P style="font-weight: bold;">Hi <span style="text-transform:capitalize">' +
              req.userObj.name +
              '</span>,</P> <P style="color: rgb(86, 85, 85); font-size: 25px; font-weight: bold;">Welcome aboard Mumpa.</P> <P>Mumpa is a listing service for products and services relevant to parents. <span style="text-transform:capitalize"><b>' +
              req.listObj.business_name +
              '</b></span>, a listing on Mumpa has been assigned to you. Please use the details mentioned below to access the dealer panel.<BR><SPAN style="font-weight: bold;">Username:</SPAN> <a href="#" style="color:#6f6d6d; text-decoration:none;"><font face="Arial, Helvetica, sans-serif" color="#6f6d6d">' +
              req.userObj.email +
              '</font></a><BR><SPAN style="font-weight: bold;">Password:</SPAN> Please use the same password that you created to log into Mumpa app.</P></TD> <TR> <TR> <TD width="651" align="left" valign="middle" style="padding: 15px 30px; display: block;"><a href="http://www.mumpa.in/dashboard"><IMG width="286" height="48" style="display: block;" alt="Go to" src="http://mumpa.in/images/emailer/decmumpa15/gotobtn.png"></a></TD></TR> <TR> <TD width="651" align="left" valign="top" style="padding: 5px 30px; color: rgb(111, 109, 109); line-height: 36px; font-size: 18px; display: block;"> <P>Through the admin panel you can</P></TD> <TR> <TD width="651"> <TABLE style="padding: 20px 30px;" border="0" cellspacing="0" cellpadding="0"> <TBODY> <TR> <TD width="172" align="center" style="padding: 8px 0px;"><IMG width="121" style="border: 0px currentColor; border-image: none; display: block;" alt="" src="http://mumpa.in/images/emailer/decmumpa15/icon1.png"></TD> <TD width="423" align="left" style="padding: 8px 0px; text-align: left; color: rgb(86, 85, 85); line-height: 36px; font-size: 30px; font-weight: bold;"> <P>Manage your listing</P></TD></TR> <TR> <TD width="172" align="center" style="padding: 8px 0px;"><IMG width="121" style="border: 0px currentColor; border-image: none; display: block;" alt="" src="http://mumpa.in/images/emailer/decmumpa15/icon2-1.png"></TD> <TD width="423" align="left" style="padding: 8px 0px; text-align: left; color: rgb(86, 85, 85); line-height: 36px; font-size: 30px; font-weight: bold;"> <P>Create Deals</P></TD></TR> <TR> <TD width="172" align="center" style="padding: 8px 0px;"><IMG width="121" style="border: 0px currentColor; border-image: none; display: block;" alt="" src="http://mumpa.in/images/emailer/decmumpa15/icon3.png"></TD> <TD width="423" align="left" style="padding: 8px 0px; text-align: left; color: rgb(86, 85, 85); line-height: 36px; font-size: 30px; font-weight: bold;"> <P>Communicate with your<BR>target audience</P></TD></TR></TBODY></TABLE></TD></TR> <TR> <TD width="651" align="left" valign="top" style="padding: 5px 30px; color: rgb(111, 109, 109); line-height: 36px; font-size: 18px; display: block;"> <P>If you did not request access to this listing on Mumpa please ignore this email.</P></TD> <TR> <TR> <TD width="651" align="left" valign="top" style="padding: 30px 30px 40px; color: rgb(111, 109, 109); line-height: 18px; font-size: 18px; display: block;"> <P>From</P> <P style="font-weight: bold;">The Mumpa Team</P></TD> <TR></TR></TBODY></TABLE></BODY></HTML>  '
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, function(error, info) {
            if (!error) {
              res.send({
                success: true
              });
            }
          });
        }
      });
    }
  });
};

exports.assign_list_to_new_user = function(req, res) {
  var uid = randtoken.uid;
  req.body.password = uid(8);

  var mailOptions = {
    from: "Mumpa<hello@mumpa.in>", // sender address
    to: req.params.assigned_to, // list of receivers
    subject: "Manage your store listing on Mumpa", // Subject line
    text: "", // plaintext body
    html:
      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"> <!-- saved from url=(0057)http://mumpa.in/images/emailer/decmumpa15/pass_index.html --> <HTML><HEAD><META content="IE=5.0000" http-equiv="X-UA-Compatible"> <META http-equiv="Content-Type" content="text/html; charset=utf-8"> <META name="GENERATOR" content="MSHTML 11.00.10240.16603"></HEAD> <BODY style="padding: 0px; text-align: left; background-color: rgb(239, 240, 242);"> <TABLE width="651" align="center" style="font-family: Arial,Helvetica,sans-serif; box-shadow: 10px 10px 43px -3px rgba(207,203,207,1); background-color: rgb(255, 255, 255); -webkit-box-shadow: 10px 10px 43px-3px rgba(207, 203, 207, 1); -moz-box-shadow: 10px 10px 43px -3px rgba(207, 203, 207, 1);" border="0" cellspacing="0" cellpadding="0"> <TBODY> <TR> <TD width="651" align="center" valign="top" style="padding: 40px 15px 0px; display: block;"><A href="http://mumpa.in/" target="_blank"><IMG width="159" height="76" style="display: block;" alt="Mumpa" src="http://mumpa.in/images/emailer/decmumpa15/Mumpa-Logo.png" border="0"></A> </TD> <TR> <TR> <TD width="651" align="left" valign="top" style="padding: 5px 30px; color: rgb(111, 109, 109); line-height: 36px; font-size: 18px; display: block;"> <P style="font-weight: bold;">Hi <a href="#" style="color:#6f6d6d; text-decoration:none;"><font face="Arial, Helvetica, sans-serif" color="#6f6d6d">' +
      req.params.assigned_to +
      '</font></a>,</P> <P style="color: rgb(86, 85, 85); font-size: 25px; font-weight: bold;">Welcome aboard Mumpa.</P> <P>Mumpa is a listing service for products and services relevant to parents. <span style="text-transform:capitalize"><b>' +
      req.listObj.business_name +
      '</b></span>, a listing on Mumpa has been assigned to this email id. Please use the details mentioned below to access the dealer panel.<BR><SPAN style="font-weight: bold;">Username:</SPAN> <a href="#" style="color:#6f6d6d; text-decoration:none;"><font face="Arial, Helvetica, sans-serif" color="#6f6d6d">' +
      req.params.assigned_to +
      '</font></a><BR><SPAN style="font-weight: bold;">Password:</SPAN> ' +
      req.body.password +
      '</P></TD> <TR> <TR> <TD width="651" align="left" valign="middle" style="padding: 15px 30px; display: block;"><a href="http://www.mumpa.in/dashboard"><IMG width="286" height="48" style="display: block;" alt="Go to" src="http://mumpa.in/images/emailer/decmumpa15/gotobtn.png"></a></TD></TR> <TR> <TD width="651" align="left" valign="top" style="padding: 5px 30px; color: rgb(111, 109, 109); line-height: 36px; font-size: 18px; display: block;"> <P>Through the admin panel you can</P></TD> <TR> <TD width="651"> <TABLE style="padding: 20px 30px;" border="0" cellspacing="0" cellpadding="0"> <TBODY> <TR> <TD width="172" align="center" style="padding: 8px 0px;"><IMG width="121" style="border: 0px currentColor; border-image: none; display: block;" alt="" src="http://mumpa.in/images/emailer/decmumpa15/icon1.png"></TD> <TD width="423" align="left" style="padding: 8px 0px; text-align: left; color: rgb(86, 85, 85); line-height: 36px; font-size: 30px; font-weight: bold;"> <P>Manage your listing</P></TD></TR> <TR> <TD width="172" align="center" style="padding: 8px 0px;"><IMG width="121" style="border: 0px currentColor; border-image: none; display: block;" alt="" src="http://mumpa.in/images/emailer/decmumpa15/icon2-1.png"></TD> <TD width="423" align="left" style="padding: 8px 0px; text-align: left; color: rgb(86, 85, 85); line-height: 36px; font-size: 30px; font-weight: bold;"> <P>Create Deals</P></TD></TR> <TR> <TD width="172" align="center" style="padding: 8px 0px;"><IMG width="121" style="border: 0px currentColor; border-image: none; display: block;" alt="" src="http://mumpa.in/images/emailer/decmumpa15/icon3.png"></TD> <TD width="423" align="left" style="padding: 8px 0px; text-align: left; color: rgb(86, 85, 85); line-height: 36px; font-size: 30px; font-weight: bold;"> <P>Communicate with your<BR>target audience</P></TD></TR></TBODY></TABLE></TD></TR> <TR> <TD width="651" align="left" valign="top" style="padding: 5px 30px; color: rgb(111, 109, 109); line-height: 36px; font-size: 18px; display: block;"> <P>If you did not request access to this listing on Mumpa please ignore this email.</P></TD> <TR> <TR> <TD width="651" align="left" valign="top" style="padding: 30px 30px 40px; color: rgb(111, 109, 109); line-height: 18px; font-size: 18px; display: block;"> <P>From</P> <P style="font-weight: bold;">The Mumpa Team</P></TD> <TR></TR></TBODY></TABLE></BODY></HTML>   '
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      res.json({ success: false });
    } else {
      exports.create_new_user_for_list_assignment(req, res);
    }
  });
};

exports.create_new_user_for_list_assignment = function(req, res) {
  req.body.referid =
    req.params.assigned_to.toLowerCase().substr(0, 4) + exports.randomString();
  console.log(req.body.referid);
  connection.query(
    'select * from user where refer_id ="' + req.body.referid + '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        if (rows.length) {
          //WHEN REFERID ALREADY EXISTS
          exports.create_new_user_for_list_assignment(req, res);
        } else {
          // WHEN IT DOESN'T EXIST ALREADY

          req.body.salt = crypto.randomBytes(16).toString("base64");
          console.log("salt ", req.body.salt, " password ", req.body.password);
          var salt = new Buffer(req.body.salt, "base64");
          req.body.hashed_password = crypto
            .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
            .toString("base64");
          console.log("hashed_password ", req.body.hashed_password);

          connection.query(
            'insert into user (email, role_id, salt, hashed_password, refer_id) values ("' +
              req.params.assigned_to +
              '","dealer","' +
              req.body.salt +
              '","' +
              req.body.hashed_password +
              '","' +
              req.body.referid +
              '")',
            function(err, rows, fields) {
              //connection.end();
              if (err) {
                console.log(err);
                res.send({
                  success: false
                });
              } else {
                var query =
                  'UPDATE listing_details SET assigned_to ="' +
                  req.params.assigned_to +
                  '" where listing_id =' +
                  req.params.lid;
                console.log(query);

                connection.query(query, function(err, result) {
                  if (err) {
                    console.log(err);
                    res.json({
                      success: false
                    });
                  } else {
                    res.json({ success: true });
                  }
                });
              }
            }
          );
        }
      }
    }
  );
};

app.get("/allUsersEmail", function(req, res) {
  connection.query("select email from user", function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({
        success: false
      });
    }
    res.json({
      success: true,
      emails: rows
    });
  });
});

/**
@ Remove Image from database
**/
app.post("/removeprofileimage", function(req, res) {
  console.log(req.body);
  var rm_query =
    'update user set image = NULL where email = "' + req.body.email + '"';
  connection.query(rm_query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
});

/**
 *** DASHBOARD - ADD DEALER
 **/

app.post("/adddealer", function(req, res) {
  console.log(req.body);
  exports.adddealer(req, res);
});

exports.adddealer = function(req, res) {
  console.log(req.body);

  req.body.referid =
    req.body.name.toLowerCase().substr(0, 4) + exports.randomString();
  console.log(req.body.referid);
  connection.query(
    'select * from user where refer_id ="' + req.body.referid + '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        if (rows.length) {
          //WHEN REFERID ALREADY EXISTS
          exports.adddealer(req, res);
        } else {
          // WHEN IT DOESN'T EXIST ALREADY

          connection.query(
            'select * from user where email ="' + req.body.email + '"',
            function(err, rows, fields) {
              if (err) {
                console.log(err);
                res.send(err);
              } else {
                if (rows.length == 0) {
                  req.body.salt = crypto.randomBytes(16).toString("base64");
                  console.log("salt ", req.body.salt);
                  var salt = new Buffer(req.body.salt, "base64");
                  req.body.hashed_password = crypto
                    .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
                    .toString("base64");
                  console.log("hashed_password ", req.body.hashed_password);

                  connection.query(
                    'insert ignore into user (name, email, role_id, salt, hashed_password, refer_id) values ("' +
                      req.body.name +
                      '","' +
                      req.body.email +
                      '","dealer","' +
                      req.body.salt +
                      '","' +
                      req.body.hashed_password +
                      '","' +
                      req.body.referid +
                      '")',
                    function(err, rows, fields) {
                      //connection.end();
                      if (err) {
                        console.log(err);
                        res.send({
                          success: false
                        });
                      } else {
                        res.send({
                          success: true
                        });
                      }
                    }
                  );
                } else {
                  res.json({
                    success: false,
                    message: "Duplicate"
                  });
                }
              }
            }
          );
        }
      }
    }
  );
};

/**
 *** DASHBOARD - ADD DEALER/ADMIN BY SUPER_ADMIN
 **/

app.post("/adduserbysuperadmin", function(req, res) {
  console.log(req.body);
  exports.adduserbysuperadmin(req, res);
});

exports.adduserbysuperadmin = function(req, res) {
  console.log(req.body);

  req.body.referid =
    req.body.name.toLowerCase().substr(0, 4) + exports.randomString();
  console.log(req.body.referid);
  connection.query(
    'select * from user where refer_id ="' + req.body.referid + '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        if (rows.length) {
          //WHEN REFERID ALREADY EXISTS
          exports.adduserbysuperadmin(req, res);
        } else {
          // WHEN IT DOESN'T EXIST ALREADY

          connection.query(
            'select * from user where email ="' + req.body.email + '"',
            function(err, rows, fields) {
              if (err) {
                console.log(err);
                res.send(err);
              } else {
                if (rows.length == 0) {
                  req.body.password = exports.randomPassword();
                  req.body.salt = crypto.randomBytes(16).toString("base64");
                  console.log("salt ", req.body.salt);
                  var salt = new Buffer(req.body.salt, "base64");
                  req.body.hashed_password = crypto
                    .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
                    .toString("base64");
                  console.log("hashed_password ", req.body.hashed_password);

                  connection.query(
                    'insert ignore into user (name, email, role_id, salt, hashed_password, refer_id) values ("' +
                      req.body.name +
                      '","' +
                      req.body.email +
                      '","' +
                      req.body.role +
                      '","' +
                      req.body.salt +
                      '","' +
                      req.body.hashed_password +
                      '","' +
                      req.body.referid +
                      '")',
                    function(err, rows, fields) {
                      //connection.end();
                      if (err) {
                        console.log(err);
                        res.send({
                          success: false
                        });
                      } else {
                        // SEND MAIL WITH RANDOM PASSWORD GENERATED ABOVE.
                        console.log("user created and mailing credentials now");
                        exports.sendCredentials(req, res);
                      }
                    }
                  );
                } else {
                  res.json({
                    success: false,
                    message: "Duplicate"
                  });
                }
              }
            }
          );
        }
      }
    }
  );
};

exports.sendCredentials = function(req, res) {
  var mailOptions = {
    from: "Team Mumpa<appmumpa@gmail.com>", // sender address
    to: req.body.email, // list of receivers
    subject: "Mumpa Account Notification", // Subject line
    text: "", // plaintext body
    html:
      '<h1 style="font-size:50px"><center>Hi ' +
      req.body.name +
      '</center></h1><p style="font-size:20px;padding:0 20px;"><center>Your account is created on Mumpa App (a parenting aid).</center></p><p style="font-size:20px;padding:0 20px;"><center>Please login on the Mumpa admin panel using following credentials.</center></p><p><center><span style="margin-left:20px"><b>E-mail -</b></span><span style="margin-left:20px">' +
      req.body.email +
      '</span></center></p><p><center><span style="margin-left:20px"><b>Password -</b></span><span style="margin-left:20px">' +
      req.body.password +
      '</span></center></p><p style="font-size:20px; margin:-15px; padding-left:20px;"><center>Team Mumpa</center></p>'
  };

  transporter.sendMail(mailOptions, function(err, info) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
};

/**
 *** DASHBOARD - DEACTIVATE USER BY SUPER_ADMIN
 **/
app.put("/deactivateUser/email/:email", function(req, res) {
  var query =
    'UPDATE user SET status = "inactive" WHERE email = "' +
    req.params.email +
    '"';

  connection.query(query, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
});

/**
 *** DASHBOARD - DEACTIVATE USER BY SUPER_ADMIN
 **/
app.put("/activateUser/email/:email", function(req, res) {
  var query =
    'UPDATE user SET status = "active" WHERE email = "' +
    req.params.email +
    '"';

  connection.query(query, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
});

/**
 *** DASHBOARD - GET ALL CATEGORY
 **/
app.get("/getAllUsers", function(req, res) {
  var query =
    "select u.name,u.refer_id, u.role_id as role, u.status, u.created, us.* from user u left outer join user_activity_based_score us on u.email = us.email";
  connection.query(query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        users: rows
      });
    }
  });
});

app.get("/getUserDetails/:email", function(req, res) {
  var query =
    'select * from (select u.name, u.role_id as role, u.status, u.created, us.* from user u left outer join user_activity_based_score us on u.email = us.email) aa where aa.email = "' +
    req.params.email +
    '"';
  connection.query(query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      console.log(rows[0]);
      res.send({
        success: true,
        userObj: rows[0]
      });
    }
  });
});

app.get("/getAllUsers/regexp/:regexp", function(req, res) {
  var search_words = req.params.regexp;

  var query =
    "select *  from (select u.name, u.role_id as role, u.status, us.* from user u left outer join user_activity_based_score us on u.email = us.email) aa where aa.name REGEXP " +
    search_words +
    " OR aa.email REGEXP " +
    search_words;

  connection.query(query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        users: rows
      });
    }
  });
});

/**
 *** DASHBOARD - GET ALL CATEGORY
 **/
app.get("/getallcategory", function(req, res) {
  connection.query(
    "SELECT category, category_id from listing_category where category_id!=24 order by category",
    function(err, rows, fields) {
      if (!err) {
        res.json({
          success: true,
          categories: rows
        });
      } else {
        console.log("Error while performing Query.");
        res.json({
          success: false
        });
      }
    }
  );
});

/**
 *** DASHBOARD - ADD LIST
 **/
/*app.post("/addlist/email/:email", function (req, res) {
    console.log(req.body);
    console.log(req.params.email);

    connection.query('INSERT IGNORE INTO listing_details (creator, business_name, description, bussines_email, address, address2, city, state, pin, location, phone_no, phone_no2, website, cash, card, owner_id, latitude, longitude) values("' + (req.params.email || null) + '","' + (req.body.name || null) + '","' + (req.body.description || null) + '","' + (req.body.email || null) + '","' + (req.body.address || null) + '","' + (req.body.address2 || null) + '","' + (req.body.city || null) + '","' + (req.body.state || null) + '",' + (req.body.pin || null) + ',"' + (req.body.location || null) + '","' + (req.body.phone_no || null) + '","' + (req.body.phone_no2 || null) + '","' + (req.body.website || null) + '","' + (req.body.cash || null) + '","' + (req.body.card || null) + '","' + (req.body.owner_id || null) + '",' + (req.body.latitude || null) + ',' + (req.body.longitude || null) + ')', function (err, result) {
        if (err) {
            console.log(err);
            res.json({
                success: false
            });
        } else {
            connection.query('SELECT MAX(listing_id) as newid from listing_details', function (err, rows, result) {
                if (err) {
                    console.log(err);
                    res.json({
                        success: false
                    });
                } else {

                    // ARRAY OF CATEGORY_ID IS INSERTED IN LISTING_CATEGORY_DETAILS WITH ABOVE INSERTED LISTING_ID
                    console.log('listing_id ', rows[0].newid);
                    req.body.listing_id = rows[0].newid;
                    var category_st = 'INSERT IGNORE INTO listing_category_details (listing_id, category_id) values';

                    req.body.category = JSON.parse(req.body.category);
                    console.log('length ', req.body.category.length);
                    for (var i = 0; i < req.body.category.length; i++) {
                        category_st = category_st + '(' + req.body.listing_id + ',' + req.body.category[i] + '),';
                    }
                    category_st = category_st.substr(0, category_st.length - 1) + ';';
                    console.log('category_st');
                    console.log(category_st);

                    connection.query(category_st, function (err, result) {
                        if (err) {
                            console.log(err);
                            res.json({
                                success: false
                            });
                        } else {

                            //TIME_OPEN_CLOSE DETAILS INSERTION
                            var time_st = 'INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values';

                            req.body.timeObj = JSON.parse(req.body.timeObj);
                            console.log('length ', req.body.timeObj.length);
                            for (var i = 0; i < req.body.timeObj.length; i++) {
                                time_st = time_st + '(' + (req.body.listing_id || null) + ',"' + (req.body.timeObj[i].day || null) + '","' + (req.body.timeObj[i].open || null) + '","' + (req.body.timeObj[i].close || null) + '"),'
                            }
                            time_st = time_st.substr(0, time_st.length - 1) + ';';
                            console.log('time_st');
                            console.log(time_st);

                            connection.query(time_st, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    res.send({
                                        success: false
                                    });
                                } else {
                                    //SOCIAL TABLE DATA INSERT
                                    if (req.body.facebook || req.body.twitter || req.body.instagram) {
                                        req.body.facebook = req.body.facebook || "";
                                        req.body.twitter = req.body.twitter || "";
                                        req.body.instagram = req.body.instagram || "";

                                        var social_St = 'INSERT IGNORE INTO listing_social (listing_id,facebook, twitter, instagram) values(?,?,?,?);';
                                        connection.query(social_St, [req.body.listing_id, req.body.facebook, req.body.twitter, req.body.instagram], function (err, result) {
                                            if (err) {
                                                console.log(err);
                                                res.send({
                                                    success: false
                                                });
                                            } else {
                                                res.send({
                                                    success: true
                                                });
                                            }
                                        })
                                    } else {
                                        res.send({
                                            success: true
                                        });
                                    }
                                }
                            })
                        }
                    })
                }

            })
        }
    })
});*/

app.post("/addlist", function(req, res) {
  console.log(req.body);
  if (req.body.payment.card) {
    var pymntcr = "card";
  } else {
    var pymntcr = "";
  }
  if (req.body.payment.cash) {
    var pymntcs = "cash";
  } else {
    var pymntcs = "";
  }
  if (req.body.deliver.yes) {
    var delivers = "Y";
  }
  if (req.body.deliver.no) {
    var delivers = "N";
  }
  connection.query(
    'INSERT IGNORE INTO listing_details (creator, business_name,bussines_email,address, address2, pin,phone_no,delivers, website, cash, card,latitude, longitude) values("' +
      (req.body.creater || null) +
      '","' +
      (req.body.name || null) +
      '","' +
      (req.body.email || null) +
      '","' +
      (req.body.address.line1 || null) +
      '","' +
      (req.body.address.line2 || null) +
      '",' +
      (req.body.address.pincode || null) +
      ',"' +
      (req.body.number || null) +
      '","' +
      delivers +
      '","' +
      (req.body.address.website || null) +
      '","' +
      (pymntcs || null) +
      '","' +
      (pymntcr || null) +
      '",' +
      (req.body.latitude || null) +
      "," +
      (req.body.longitude || null) +
      ")",
    function(err, result) {
      if (err) {
        console.log(err);
        res.json({
          success: false
        });
      } else {
        connection.query(
          "SELECT MAX(listing_id) as newid from listing_details",
          function(err, rows, result) {
            if (err) {
              console.log(err);
              res.json({
                success: false
              });
            } else {
              // ARRAY OF CATEGORY_ID IS INSERTED IN LISTING_CATEGORY_DETAILS WITH ABOVE INSERTED LISTING_ID
              console.log("adding category");
              req.body.listing_id = rows[0].newid;
              var category_st =
                "INSERT IGNORE INTO listing_category_details (listing_id, category_id) values";
              console.log(req.body.ctr);
              //req.body.category = JSON.parse(req.body.ctr);
              req.body.category = req.body.ctr;
              for (var i in req.body.category) {
                if (req.body.category[i]) {
                  category_st =
                    category_st + "(" + req.body.listing_id + "," + i + "),";
                }
              }
              category_st = category_st.substr(0, category_st.length - 1) + ";";
              connection.query(category_st, function(err, result) {
                if (err) {
                  console.log(err);
                  res.json({
                    success: false
                  });
                } else {
                  exports.addListingTime(req, res);
                  /*  if (req.body.facebook || req.body.twitter || req.body.instagram) {
                                  exports.addListSocial(req, res);
                              } else {
                                  if (req.body.timeObj) {
                                      exports.addListingTime(req, res);
                                  } else {
                                      res.send({
                                          success: true
                                      });
                                  }
                              }*/
                }
              });
            }
          }
        );
      }
    }
  );
});

exports.addListSocial = function(req, res) {
  console.log("adding social");
  req.body.facebook = req.body.facebook || "";
  req.body.twitter = req.body.twitter || "";
  req.body.instagram = req.body.instagram || "";

  var social_St =
    "INSERT IGNORE INTO listing_social (listing_id,facebook, twitter, instagram) values(?,?,?,?);";
  connection.query(
    social_St,
    [
      req.body.listing_id,
      req.body.facebook,
      req.body.twitter,
      req.body.instagram
    ],
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        if (req.body.timeObj) {
          exports.addListingTime(req, res);
        } else {
          res.send({
            success: true
          });
        }
      }
    }
  );
};

exports.addListingTime = function(req, res) {
  console.log("adding time");
  console.log(req.body.opendays);
  //TIME_OPEN_CLOSE DETAILS INSERTION
  var time_st =
    "INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values";
  if (!req.body.opendays.all.day) {
    console.log("for all days");
    var time_st =
      "INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values (" +
      req.body.listing_id +
      ',"Mon","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Tue","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Wed","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Thu","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Fri","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Sat","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Sun","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '")';
  } else {
    console.log("not for all days");
    for (i in req.body.opendays) {
      if (req.body.opendays[i].day && i != "all") {
        time_st =
          time_st +
          "(" +
          (req.body.listing_id || null) +
          ',"' +
          (i || null) +
          '","' +
          (req.body.opendays[i].open || null) +
          '","' +
          (req.body.opendays[i].close || null) +
          '"),';
      }
    }
    time_st = time_st.substr(0, time_st.length - 1) + ";";
  }
  console.log("time_st");
  console.log(time_st);

  connection.query(time_st, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
};

/**
 *** DASHBOARD - DEACTIVATE LISTING BY SUPER_ADMIN
 **/
app.put("/deactivateListing/id/:id", function(req, res) {
  var query =
    'UPDATE listing_details SET status = "inactive" WHERE listing_id =' +
    req.params.id +
    ";";

  connection.query(query, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
});

/**
 *** DASHBOARD - DEACTIVATE LISTING BY SUPER_ADMIN
 **/
app.put("/activateListing/id/:id", function(req, res) {
  var query =
    'UPDATE listing_details SET status = "active" WHERE listing_id =' +
    req.params.id +
    ";";

  connection.query(query, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
});

/**
 *** DASHBOARD - GET ALL LIST WHICH ARE YET TO BE ACCEPTED AND REJECTED
 **/
app.get("/alllistforaproval", function(req, res) {
  connection.query(
    "SELECT * from   listing_details where approved = 0 and rejected = 0",
    function(err, rows, fields) {
      if (!err) {
        res.json({
          success: true,
          rows: rows
        });
      } else {
        console.log(err);
        res.json({
          success: false
        });
      }
    }
  );
});

/**
 *** DASHBOARD - REJECTING A LIST
 **/
app.get("/rejectlist/id/:id", function(req, res) {
  connection.query(
    'update listing_details set rejected = 1 where listing_id ="' +
      req.params.id +
      '"',
    function(err, result) {
      if (!err) {
        res.json({
          success: true
        });
      } else {
        console.log(err);
        res.json({
          success: false
        });
      }
    }
  );
});

/**
 *** DASHBOARD - ACCEPTING A LIST
 **/
app.get("/acceptList/id/:id", function(req, res) {
  connection.query(
    'update listing_details set approved = 1, status="active" where listing_id ="' +
      req.params.id +
      '"',
    function(err, result) {
      if (!err) {
        res.json({
          success: true
        });
        exports.pushStoreListedByUserGetApproved(req.params.id);
      } else {
        console.log(err);
        res.json({
          success: false
        });
      }
    }
  );
});

/**
 *** DASHBOARD - DELETING IMAGE FILE OF A LISTING
 **/

app.get("/deleteImageFromList/id/:id/image/:image", function(req, res) {
  var targetPath = path.resolve(
    __dirname,
    "uploads",
    req.params.id,
    "images",
    req.params.image
  );
  console.log(targetPath);

  path.exists(targetPath, function(exists) {
    if (exists) {
      console.log("EXISTS");
      fse.remove(targetPath, function(err) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          console.log("IMAGE REMOVED");
          exports.deleteImageFromDB(req, res);
        }
      });
    } else {
      console.log("NOT EXISTS");
      exports.deleteImageFromDB(req, res);
    }
  });
});

exports.deleteImageFromDB = function(req, res) {
  var query_st =
    'select * from listing_gallery where resource_type="image" and resource_name = "' +
    req.params.image +
    '" and listing_id = ' +
    req.params.id +
    "";
  var query_st1 =
    'delete from listing_gallery where resource_type="image" and resource_name = "' +
    req.params.image +
    '" and listing_id = ' +
    req.params.id +
    "";

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      if (rows.length) {
        connection.query(query_st1, function(err, result) {
          if (err) {
            console.log(err);
            res.send({
              success: false
            });
          } else {
            console.log("VIDEO DELETED FROM DB");
            res.send({
              success: true
            });
          }
        });
      } else {
        res.send({
          success: true
        });
      }
    }
  });
};

/**
 *** DASHBOARD - DELETING VIDEO FILE OF A LISTING
 **/

app.get("/deleteVideoFromList/id/:id/video/:video", function(req, res) {
  var targetPath = path.resolve(
    __dirname,
    "uploads",
    req.params.id,
    "videos",
    req.params.video
  );
  console.log(targetPath);

  path.exists(targetPath, function(exists) {
    if (exists) {
      console.log("EXISTS");
      fse.remove(targetPath, function(err) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          console.log("VIDEO REMOVED");
          exports.deleteVideoFromDB(req, res);
        }
      });
    } else {
      console.log("NOT EXISTS");
      exports.deleteVideoFromDB(req, res);
    }
  });
});

exports.deleteVideoFromDB = function(req, res) {
  var query_st =
    'select * from listing_gallery where resource_type="video" and resource_name = "' +
    req.params.video +
    '" and listing_id = ' +
    req.params.id +
    "";
  var query_st1 =
    'delete from listing_gallery where resource_type="video" and resource_name = "' +
    req.params.video +
    '" and listing_id = ' +
    req.params.id +
    "";

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      if (rows.length) {
        connection.query(query_st1, function(err, result) {
          if (err) {
            console.log(err);
            res.send({
              success: false
            });
          } else {
            console.log("VIDEO DELETED FROM DB");
            res.send({
              success: true
            });
          }
        });
      } else {
        res.send({
          success: true
        });
      }
    }
  });
};

/**
 *** DASHBOARD- Admin - GETTING ALL LIST FOR DEALS (ID AND NAME)
 **/
app.get("/getAllListingForDeals", function(req, res) {
  var query_st = "select listing_id,business_name,address from listing_details";

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

/**
 *** DASHBOARD- Dealer - GETTING ALL LIST FOR DEALS (ID AND NAME)
 **/
app.get("/getAllListingForDeals/:email", function(req, res) {
  var query_st =
    'select listing_id,business_name,address from listing_details where assigned_to="' +
    req.params.email +
    '"';

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

/**
 *** DASHBOARD - GETTING ALL DETAILS OF A LISTING
 **/
app.get("/getAllListing", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) ";

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

app.get("/getAllListing/pagenum/:pagenum", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) limit 0," +
    req.params.pagenum * 10;

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

/**
 *** DASHBOARD - GETTING ALL DETAILS OF A LISTING FOR APPROVAL
 **/
app.get("/getAllListingForApproval", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 0";

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

app.get("/getAllListingForApproval/pagenum/:pagenum", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 0  limit 0," +
    req.params.pagenum * 10;

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

app.get(
  "/getAllListingForApproval/searchtxt/:searchtxt/user_type/:user_type/cid/:cid/status/:status/pagenum/:pagenum",
  function(req, res) {
    console.log("hello");
    if (req.params.searchtxt != "all") {
      console.log("expression");
      var query_st =
        'select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 0 and lcdddss.business_name REGEXP "' +
        req.params.searchtxt +
        '"';
    } else {
      console.log("Np expression");

      var query_st =
        "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 0 ";
    }

    if (
      req.params.user_type &&
      req.params.user_type != "undefined" &&
      req.params.user_type != "All"
    ) {
      query_st += ' and lcdddss.role ="' + req.params.user_type + '" ';
    }
    if (
      req.params.status &&
      req.params.status != "undefined" &&
      req.params.status != "All"
    ) {
      query_st += ' and lcdddss.status ="' + req.params.status + '" ';
    }
    if (
      req.params.cid &&
      req.params.cid != "undefined" &&
      req.params.cid != 24
    ) {
      query_st += " and lcdddss.category_id =" + req.params.cid + " ";
    }
    query_st += " limit 0," + req.params.pagenum * 10;
    console.log(query_st);

    connection.query(query_st, function(err, rows, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          listing_details: rows
        });
      }
    });
  }
);

/**
 *** DASHBOARD - GETTING ALL DETAILS OF A LISTING  WHICH ARE APPROVED
 **/
app.get("/getAllApprovedListing", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 1 and lcdddss.rejected = 0";

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

app.get("/getAllApprovedListing/pagenum/:pagenum", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 1 and lcdddss.rejected = 0 limit 0," +
    req.params.pagenum * 10;

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

app.get(
  "/getAllApprovedListing/searchtxt/:searchtxt/user_type/:user_type/cid/:cid/status/:status/pagenum/:pagenum",
  function(req, res) {
    console.log(req.params);
    if (req.params.searchtxt != "all") {
      var query_st =
        'select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 1 and lcdddss.rejected = 0 and lcdddss.business_name REGEXP "' +
        req.params.searchtxt +
        '"';
    } else {
      var query_st =
        "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 1 and lcdddss.rejected = 0 ";
    }

    if (
      req.params.user_type &&
      req.params.user_type != "undefined" &&
      req.params.user_type != "All"
    ) {
      query_st += ' and lcdddss.role ="' + req.params.user_type + '" ';
    }
    if (
      req.params.status &&
      req.params.status != "undefined" &&
      req.params.status != "All"
    ) {
      query_st += ' and lcdddss.status ="' + req.params.status + '" ';
    }
    if (
      req.params.cid &&
      req.params.cid != "undefined" &&
      req.params.cid != 24
    ) {
      query_st += " and lcdddss.category_id =" + req.params.cid + " ";
    }
    query_st += " limit 0," + req.params.pagenum * 10;
    console.log(query_st);

    connection.query(query_st, function(err, rows, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          listing_details: rows
        });
      }
    });
  }
);

/**
 *** DASHBOARD - GETTING ALL DETAILS OF A LISTING  WHICH ARE REJECTED
 **/
app.get("/getAllRejectedListing", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 1";

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

app.get("/getAllRejectedListing/pagenum/:pagenum", function(req, res) {
  var query_st =
    "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 1 limit 0," +
    req.params.pagenum * 10;

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        listing_details: rows
      });
    }
  });
});

app.get(
  "/getAllRejectedListing/searchtxt/:searchtxt/user_type/:user_type/cid/:cid/status/:status/pagenum/:pagenum",
  function(req, res) {
    if (req.params.searchtxt != "all") {
      var query_st =
        'select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 1 and lcdddss.business_name REGEXP "' +
        req.params.searchtxt +
        '" ';
    } else {
      var query_st =
        "select * from ( select lld.*,lccd.category,lccd.category_id from (select ld.*, u.role_id as role from listing_details ld left outer join user u on ld.creator = u.email) lld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = lld.listing_id ) lcdddss where lcdddss.approved = 0 and lcdddss.rejected = 1 ";
    }

    if (
      req.params.user_type &&
      req.params.user_type != "undefined" &&
      req.params.user_type != "All"
    ) {
      query_st += ' and lcdddss.role ="' + req.params.user_type + '" ';
    }
    if (
      req.params.status &&
      req.params.status != "undefined" &&
      req.params.status != "All"
    ) {
      query_st += ' and lcdddss.status ="' + req.params.status + '" ';
    }
    if (
      req.params.cid &&
      req.params.cid != "undefined" &&
      req.params.cid != 24
    ) {
      query_st += " and lcdddss.category_id =" + req.params.cid + " ";
    }
    query_st += " limit 0," + req.params.pagenum * 10;
    console.log(query_st);

    connection.query(query_st, function(err, rows, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          listing_details: rows
        });
      }
    });
  }
);

/**
 *** DASHBOARD - GETTING ALL DETAILS OF A LISTING
 **/
app.get("/getAllDetailsOfList/id/:id", isAuthorized, function(req, res) {
  if (req.profile.role === "admin" || req.profile.role === "approver") {
    exports.getAllDetailsOfList(req, res);
  } else if (req.profile.role === "dealer") {
    connection.query(
      "Select * from listing_details where listing_id =? and assigned_to =?",
      [req.params.id, req.profile.email],
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({ success: false });
        } else {
          if (rows.length > 0) {
            exports.getAllDetailsOfList(req, res);
          } else {
            console.log("FORBIDDEN");
            res.status(403).json({ error: "forbidden" });
          }
        }
      }
    );
  }
});

exports.getAllDetailsOfList = function(req, res) {
  var query_listing_details =
    "SELECT * FROM listing_details where listing_id =" + req.params.id + ";";

  var query_listing_category =
    "select lcdd.category_id, lcdd.category from (select lcd.listing_id, lcd.category_id, lc.category from listing_category_details lcd left outer join listing_category lc on lcd.category_id = lc.category_id) lcdd where lcdd.listing_id =" +
    req.params.id +
    ";";

  var query_listing_date_time_details =
    "select day, open, close from listing_open_close_time where listing_id = " +
    req.params.id +
    ' order by case day when "Mon" then 0 when "Tue" then 1 when "Wed" then 2 when "Thu" then 3 when "Fri" then 4 when "Sat" then 5 when "Sun" then 6 end';

  connection.query(query_listing_details, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      req.body.listing_details = rows;

      connection.query(query_listing_category, function(err, rows, result) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          req.body.category_details = rows;

          connection.query(query_listing_date_time_details, function(
            err,
            rows,
            result
          ) {
            if (err) {
              console.log(err);
              res.send({
                success: false
              });
            } else {
              req.body.open_close_details = rows;
              res.send({
                success: true,
                listing_details: req.body.listing_details,
                category_details: req.body.category_details,
                open_close_details: req.body.open_close_details
              });
            }
          });
        }
      });
    }
  });
};

/**
 *** DASHBOARD - ADDING CATEGORY IN A LISTING
 **/

app.post("/addingCategoryinList", function(req, res) {
  connection.query(
    "INSERT INTO listing_category_details (listing_id, category_id) values (?,?)",
    [req.body.listing_id, req.body.category_id],
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true
        });
      }
    }
  );
});

/**
 *** DASHBOARD - REMOVING CATEGORY FROM A LISTING
 **/
app.post("/removingCategoryFromList", function(req, res) {
  var query_st =
    "DELETE FROM listing_category_details where listing_id = " +
    req.body.listing_id +
    " and category_id = " +
    req.body.category_id +
    ";";

  connection.query(query_st, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
});

/***
@ Query: Fetching All Deals
@ Join on Listing_details, Listing_category,deal_voucher
***/

app.get("/getAllDeals/pagenum/:pagenum", function(req, res) {
  console.log(req.params.email, req.params.pagenum);
  var query_st =
    "select ld.business_name,ld.address, dv.voucher_id,dv.listing_id,dv.value,dv.title,dv.description,dv.price,dv.inventory,dv.initial_inventory,dv.type,dv.valid_to from deal_voucher dv ,listing_details ld where ld.listing_id = dv.listing_id and dv.valid_to > now() limit 0," +
    req.params.pagenum * 10;
  connection.query(query_st, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

/**
 *** DASHBOARD - GET ALL ACCEPTED LIST OF A USER
 **/
app.get("/adminlist/email/:email", function(req, res) {
  if (req.params.email) {
    connection.query(
      'SELECT listing_id,business_name from  listing_details where creator = "' +
        req.params.email +
        '" and approved = 1',
      function(err, rows, fields) {
        //connection.end();
        if (!err) {
          console.log(rows.length);
          res.json({
            success: true,
            rows: rows
          });
        } else {
          console.log(err);
          res.json({
            success: false
          });
        }
      }
    );
  }
});

app.post("/updateListDashboard", isAuthorized, function(req, res) {
  if (req.profile.role === "admin") {
    exports.updateListDashboard(req, res);
  } else if (req.profile.role === "dealer") {
    connection.query(
      "Select * from listing_details where listing_id =? and assigned_to =?",
      [req.body.listingObj.listing_details.listing_id, req.profile.email],
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({ success: false });
        } else {
          if (rows.length > 0) {
            exports.updateListDashboard(req, res);
          } else {
            console.log("FORBIDDEN");
            res.status(403).json({ error: "forbidden" });
          }
        }
      }
    );
  }
});

exports.updateListDashboard = function(req, res) {
  console.log(req.body.listingObj);
  if (req.body.listingObj.listing_details.card) {
    var pymntcr = "card";
  } else {
    var pymntcr = "";
  }
  if (req.body.listingObj.listing_details.cash) {
    var pymntcs = "cash";
  } else {
    var pymntcs = "";
  }
  if (req.body.listingObj.listing_details.delivers) {
    var delivers = "Y";
  } else {
    var delivers = "N";
  }

  var query1 =
    'UPDATE listing_details SET  business_name = "' +
    req.body.listingObj.listing_details.business_name +
    '", bussines_email = "' +
    req.body.listingObj.listing_details.bussines_email +
    '", address = "' +
    req.body.listingObj.listing_details.address +
    '",address2 = "' +
    req.body.listingObj.listing_details.address2 +
    '", pin = ' +
    req.body.listingObj.listing_details.pin +
    ' , phone_no ="' +
    req.body.listingObj.listing_details.phone_no +
    '",phone_no2 = "' +
    req.body.listingObj.listing_details.phone_no2 +
    '",delivers = "' +
    delivers +
    '",city = "' +
    req.body.listingObj.listing_details.city +
    '",website = "' +
    req.body.listingObj.listing_details.website +
    '",cash = "' +
    pymntcs +
    '",card = "' +
    pymntcr +
    '",latitude = ' +
    req.body.listingObj.listing_details.latitude +
    ",longitude = " +
    req.body.listingObj.listing_details.longitude +
    " WHERE listing_id =" +
    req.body.listingObj.listing_details.listing_id;
  console.log("Query1", query1);

  connection.query(query1, function(err, result) {
    if (err) {
      console.log(err);
      res.json({
        success: false
      });
    } else {
      console.log("list updated");

      var query2 =
        "delete from listing_category_details where listing_id =" +
        req.body.listingObj.listing_details.listing_id;
      console.log("Query2 ", query2);
      connection.query(query2, function(err, result) {
        if (err) {
          console.log(err);
          res.json({
            success: false
          });
        } else {
          console.log("category deleted");
          var query3 =
            "INSERT IGNORE INTO listing_category_details (listing_id, category_id) values";
          for (
            var i = 0;
            i < req.body.listingObj.category_details.length;
            i++
          ) {
            query3 =
              query3 +
              "(" +
              req.body.listingObj.listing_details.listing_id +
              "," +
              req.body.listingObj.category_details[i].category_id +
              "),";
          }
          query3 = query3.substr(0, query3.length - 1) + ";";
          console.log("Query3 ", query3);

          connection.query(query3, function(err, result) {
            if (err) {
              console.log(err);
              res.json({
                success: false
              });
            } else {
              console.log("category added");
              var query4 =
                "delete from listing_open_close_time where listing_id =" +
                req.body.listingObj.listing_details.listing_id;
              console.log("Query4 ", query4);

              connection.query(query4, function(err, result) {
                if (err) {
                  console.log(err);
                  res.json({
                    success: false
                  });
                } else {
                  console.log("listing_open_close_time deleted");
                  var query5 =
                    "INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values";
                  for (i in req.body.listingObj.open_close_details) {
                    if (req.body.listingObj.open_close_details[i].list_open) {
                      query5 =
                        query5 +
                        "(" +
                        (req.body.listingObj.listing_details.listing_id ||
                          null) +
                        ',"' +
                        (req.body.listingObj.open_close_details[i].day ||
                          null) +
                        '","' +
                        (req.body.listingObj.open_close_details[i].open ||
                          null) +
                        '","' +
                        (req.body.listingObj.open_close_details[i].close ||
                          null) +
                        '"),';
                    }
                  }
                  query5 = query5.substr(0, query5.length - 1) + ";";
                  console.log("Query5 ", query5);

                  connection.query(query5, function(err, result) {
                    if (err) {
                      console.log(err);
                      res.json({
                        success: false
                      });
                    } else {
                      console.log("listing_open_close_time updated");
                      res.json({
                        success: true
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    }
  });
};

app.post("/addListDashboard", function(req, res) {
  console.log(req.body);
  if (req.body.payment.card) {
    var pymntcr = "card";
  } else {
    var pymntcr = "";
  }
  if (req.body.payment.cash) {
    var pymntcs = "cash";
  } else {
    var pymntcs = "";
  }
  if (req.body.delivery) {
    var delivers = "Y";
  } else {
    var delivers = "N";
  }
  connection.query(
    'INSERT IGNORE INTO listing_details (creator, business_name,bussines_email,address, address2,city,state, pin,phone_no,phone_no2,delivers, website,description, cash, card,latitude, longitude) values("' +
      (req.body.creator || null) +
      '","' +
      (req.body.name || null) +
      '","' +
      (req.body.email || null) +
      '","' +
      (req.body.address.line1 || null) +
      '","' +
      (req.body.address.line2 || null) +
      '","' +
      (req.body.address.city || null) +
      '","' +
      (req.body.address.state || null) +
      '",' +
      (req.body.address.pincode || null) +
      ',"' +
      (req.body.phone_no || null) +
      '","' +
      (req.body.phone_no2 || null) +
      '","' +
      delivers +
      '","' +
      (req.body.address.website || null) +
      '","' +
      (req.body.description || null) +
      '","' +
      (pymntcs || null) +
      '","' +
      (pymntcr || null) +
      '",' +
      (req.body.latitude || null) +
      "," +
      (req.body.longitude || null) +
      ")",
    function(err, result) {
      if (err) {
        console.log(err);
        res.json({
          success: false
        });
      } else {
        console.log("list added");
        connection.query(
          "SELECT MAX(listing_id) as newid from listing_details",
          function(err, rows, result) {
            if (err) {
              console.log(err);
              res.json({
                success: false
              });
            } else {
              // ARRAY OF CATEGORY_ID IS INSERTED IN LISTING_CATEGORY_DETAILS WITH ABOVE INSERTED LISTING_ID
              console.log("adding category");
              req.body.listing_id = rows[0].newid;
              var category_st =
                "INSERT IGNORE INTO listing_category_details (listing_id, category_id) values";
              //req.body.category = JSON.parse(req.body.ctr);
              req.body.category = req.body.ctr;
              for (var i = 0; i < req.body.category_details.length; i++) {
                category_st =
                  category_st +
                  "(" +
                  req.body.listing_id +
                  "," +
                  req.body.category_details[i].category_id +
                  "),";
              }
              category_st = category_st.substr(0, category_st.length - 1) + ";";
              connection.query(category_st, function(err, result) {
                if (err) {
                  console.log(err);
                  res.json({
                    success: false
                  });
                } else {
                  exports.addListingTimeDashboard(req, res);
                }
              });
            }
          }
        );
      }
    }
  );
});

exports.addListingTimeDashboard = function(req, res) {
  console.log("adding time");
  console.log(req.body.opendays);
  //TIME_OPEN_CLOSE DETAILS INSERTION
  var time_st =
    "INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values";
  if (!req.body.opendays.all.day) {
    console.log("for all days");
    var time_st =
      "INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values (" +
      req.body.listing_id +
      ',"Mon","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Tue","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Wed","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Thu","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Fri","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Sat","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '"),(' +
      req.body.listing_id +
      ',"Sun","' +
      req.body.opendays.all.open +
      '","' +
      req.body.opendays.all.close +
      '")';
  } else {
    console.log("not for all days");
    for (i in req.body.opendays) {
      if (req.body.opendays[i].day && i != "all") {
        time_st =
          time_st +
          "(" +
          (req.body.listing_id || null) +
          ',"' +
          (i || null) +
          '","' +
          (req.body.opendays[i].open || null) +
          '","' +
          (req.body.opendays[i].close || null) +
          '"),';
      }
    }
    time_st = time_st.substr(0, time_st.length - 1) + ";";
  }
  console.log("time_st");
  console.log(time_st);

  connection.query(time_st, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
};

/***********************DEALS DASHBOARD SERVICES**************************************************/

app.post("/createDeal", function(req, res) {
  console.log(req.body);

  /*var query  = 'INSERT IGNORE INTO deal_voucher (deal_creater_email, listing_id, bs_name, short_desc, description, value, price, type, inventory, total_inventory ,valid_from, valid_to) values ("'+req.body.creator+'",'+req.body.deal.listing_id+',"'+req.body.deal.bs_name+'","'+req.body.deal.short_desc+'","'+req.body.deal.description+'",'+req.body.deal.value+','+req.body.deal.price+',"'+req.body.deal.type+'",'+req.body.deal.inventory+','+req.body.deal.inventory+',"'+req.body.deal.valid_from+'","'+req.body.deal.valid_to+'")';

    console.log(query);*/

  connection.query(
    "INSERT IGNORE INTO deal_voucher (deal_creater_email, listing_id, bs_name, short_desc, description, value, price, type, inventory, total_inventory ,valid_from, valid_to) values (?,?,?,?,?,?,?,?,?,?,?,?)",
    [
      req.body.creator,
      req.body.deal.listing_id,
      req.body.deal.bs_name,
      req.body.deal.short_desc,
      req.body.deal.description,
      req.body.deal.value,
      req.body.deal.price,
      req.body.deal.type,
      req.body.deal.inventory,
      req.body.deal.inventory,
      req.body.deal.valid_from,
      req.body.deal.valid_to
    ],
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true
        });
      }
    }
  );
});

app.get("/db/getalldeal", function(req, res) {
  /*var db_alldealquery = 'select dv.voucher_id,dv.listing_id,dv.bs_name,dv.short_desc,dv.price, uu.role_id, dv.inventory as availablevoucher, (dv.total_inventory - dv.inventory) as claimedvoucher, dv.valid_to as expiry from deal_voucher dv left outer join user uu on uu.email = dv.deal_creater_email';*/

  var db_alldealquery =
    "select dd.*,(dd.total_inventory - dd.claimedvoucher)as availablevoucher  from (select dv.*,  COALESCE(uv.claimedvoucher,0) as claimedvoucher from ( select v.voucher_id,v.listing_id,v.bs_name, v.short_desc,v.price, v.total_inventory, valid_to as expiry,u.role_id from deal_voucher v left outer join user u on u.email = v.deal_creater_email)dv left outer join (select voucher_id, count(voucher_id) as claimedvoucher from user_vouchers group by voucher_id) uv on uv.voucher_id = dv.voucher_id) dd";
  connection.query(db_alldealquery, function(err, rows, fields) {
    if (err) {
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        deals: rows,
        success: true
      });
    }
  });
});

/*app.get('/db/getalldeal', function(req, res) {
    var db_alldealquery = 'select dv.voucher_id,dv.listing_id,dv.bs_name,dv.short_desc,dv.price, uu.role_id, dv.inventory as availablevoucher, (dv.total_inventory - dv.inventory) as claimedvoucher, dv.valid_to as expiry from deal_voucher dv left outer join user uu on uu.email = dv.deal_creater_email where dv.valid_to >= CAST(CURRENT_TIMESTAMP AS DATE)';
    connection.query(db_alldealquery, function(err, rows, fields) {
        if (err) {
            res.send({
                success: false,
                error: err
            })
        } else {
            res.send({
                deals: rows,
                success: true
            })

        }
    })
})*/

app.get("/db/getdealview/did/:did", isAuthorized, function(req, res) {
  if (req.profile.role === "admin") {
    exports.getdealview(req, res);
  } else if (req.profile.role === "dealer") {
    connection.query(
      "Select * from deal_voucher where voucher_id =? and deal_creater_email =?",
      [req.params.did, req.profile.email],
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({ success: false });
        } else {
          console.log(rows);
          if (rows.length > 0) {
            exports.getdealview(req, res);
          } else {
            console.log("FORBIDDEN");
            res.status(403).json({ error: "forbidden" });
          }
        }
      }
    );
  }
});

exports.getdealview = function(req, res) {
  /*var db_dealdeatailquery = 'select dv.short_desc,dv.voucher_id as dealid ,(dv.total_inventory - dv.inventory)as ppplclamined, dv.bs_name,dv.inventory, dv.total_inventory,dv.valid_to as validity,dv.valid_to,dv.valid_from,dv.price,dv.value as cost,dv.description as description, dv.type as currencytype from deal_voucher dv where dv.voucher_id = ' + req.params.did + '';*/

  var db_dealdeatailquery =
    "select dd.*,(dd.total_inventory - dd.ppplclamined)as inventory  from (select dv.*, uv.ppplclamined from (select short_desc,voucher_id as dealid ,bs_name, total_inventory, valid_to as validity,valid_to,valid_from,price,value as cost,description as description, type as currencytype from deal_voucher)dv left outer join (select voucher_id, count(voucher_id) as ppplclamined from user_vouchers group by voucher_id) uv on uv.voucher_id = dv.dealid)dd where dealid=" +
    req.params.did;
  connection.query(db_dealdeatailquery, function(err, rows, fields) {
    if (err) {
      res.send({
        success: false,
        error: err
      });
    } else {
      var dl_details = rows[0];
      var db_claimeduser_details =
        "select uu.name, uu.email, uu.mobile,uu.city,uv.created as claimed from user_vouchers uv left outer join user uu on uv.user_email = uu.email where uv.voucher_id = " +
        req.params.did +
        "";
      connection.query(db_claimeduser_details, function(err, rows, fields) {
        if (err) {
          res.send({
            success: false,
            error: err
          });
        } else {
          res.send({
            deals: {
              details: dl_details,
              user: rows
            },
            success: true
          });
        }
      });
    }
  });
};

app.get("/getdealDetails/did/:did", function(req, res) {
  var db_dealdeatailquery =
    "select * from deal_voucher dv where dv.voucher_id = " +
    req.params.did +
    "";
  connection.query(db_dealdeatailquery, function(err, rows, fields) {
    if (err) {
      res.send({
        success: false,
        error: err
      });
    } else {
      res.send({
        dealdetails: rows[0],
        success: true
      });
    }
  });
});

/*app.post('/db/updatedeal', function(req, res) {
    var db_updatedeal = 'UPDATE deal_voucher SET inventory='+req.body.inventory+',short_desc="'+req.body.desc+'",value='+req.body.cost+',type="'+req.body.costtype+'" WHERE voucher_id='+req.body.vid+'';
    connection.query(db_updatedeal, function(err, rows, fields) {
        if (err) {
            res.send({
                success: false,
                error: err
            })
        } else {

            res.send({
                "success": true
            })
        }
    })
})*/

app.post("/updateDeal", isAuthorized, function(req, res) {
  if (req.profile.role === "admin") {
    exports.updateDeal(req, res);
  } else if (req.profile.role === "dealer") {
    connection.query(
      "Select * from deal_voucher where voucher_id =? and deal_creater_email =?",
      [req.body.deal.voucher_id, req.profile.email],
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({ success: false });
        } else {
          console.log(rows);
          if (rows.length > 0) {
            exports.updateDeal(req, res);
          } else {
            console.log("FORBIDDEN");
            res.status(403).json({ error: "forbidden" });
          }
        }
      }
    );
  }
});

exports.updateDeal = function(req, res) {
  var query =
    'UPDATE deal_voucher SET  short_desc = "' +
    req.body.deal.short_desc +
    '", description = "' +
    req.body.deal.description +
    '", value = ' +
    req.body.deal.value +
    ",price = " +
    req.body.deal.price +
    ', type = "' +
    req.body.deal.type +
    '" , inventory =' +
    req.body.deal.inventory +
    ",total_inventory =" +
    req.body.deal.total_inventory +
    ',valid_from = "' +
    req.body.deal.valid_from +
    '",valid_to = "' +
    req.body.deal.valid_to +
    '" WHERE voucher_id =' +
    req.body.deal.voucher_id;
  console.log(query);

  connection.query(query, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true
      });
    }
  });
};

app.get("/getAllDiscussionDetailsDashBoard", isAdmin, function(req, res) {
  var query =
    "select dduc.*,ddr.latest_reply_time  from (select ddu.*, count(ddc.d_id) as comment_count,ddc.comment, ddc.created as latest_comment_time from (select u.name as d_creator_name,u.email d_creator_email, dd.id as d_id,dd.title ,dd.description,dd.created as discussion_create_time, dd.hidden from discussion_details dd left outer join user u on u.email = dd.user_email) ddu left outer join  (select * from discussion_comments order by created desc ) ddc on ddu.d_id = ddc.d_id group by ddc.d_id ) dduc left outer join (select id, max(created) as latest_reply_time from discussion_comments_reply group by id ) ddr on dduc.d_id = ddr.id";

  connection.query(query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      res.json({ success: true, all_discussions: rows });
    }
  });
});

app.get("/getDiscussionDetailsDashBoard/:did", isAdmin, function(req, res) {
  connection.query(
    "Select * from discussion_details where id =?",
    [req.params.did],
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        console.log(rows);
        if (rows.length > 0) {
          exports.comment_details_of_discussion(req, res);
        } else {
          console.log("FORBIDDEN");
          res.status(403).json({ error: "forbidden" });
        }
      }
    }
  );
});

exports.comment_details_of_discussion = function(req, res) {
  /*var query = 'select * from ( select ddu.* , ddc.c_creator_name, ddc.c_creator_email, ddc.comment_id, ddc.comment, ddc.comment_time  from (select u.name as d_creator_name,u.email as d_creator_email, dd.id as d_id,dd.title ,dd.description,dd.created as discussion_create_time from discussion_details dd left outer join user u on u.email = dd.user_email) ddu left outer join (select u.name as c_creator_name,dc.user_email as c_creator_email, dc.d_id, dc.comment_id, dc.comment, dc.created as comment_time   from discussion_comments dc left outer join user u  on dc.user_email = u.email) ddc on ddu.d_id = ddc.d_id) dduc  where dduc.d_id ='+req.params.did+' order by dduc.comment_time desc';*/

  var discussion_query =
    "select * from (select u.name as d_creator_name,u.email d_creator_email, dd.id as d_id,dd.title ,dd.description,dd.created as discussion_create_time, dd.hidden from discussion_details dd left outer join user u on u.email = dd.user_email) did where did.d_id =" +
    req.params.did;

  var comment_query =
    "select * from (select u.name as c_creator_name,dc.user_email as c_creator_email, dc.d_id, dc.comment_id, dc.comment, dc.created as comment_time, dc.hidden from discussion_comments dc left outer join user u  on dc.user_email = u.email)  dduc  where dduc.d_id =" +
    req.params.did +
    " order by dduc.comment_time desc";

  connection.query(discussion_query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      req.discussion_details = rows[0];
      connection.query(comment_query, function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({ success: false });
        } else {
          req.discussion_comments = rows;
          req.replies = [];
          exports.getReplies(req, res, 0);
        }
      });
    }
  });
};

exports.getReplies = function(req, res, index) {
  var reply_query =
    "select rr.* from (select u.name as replier_name,u.email as replier_email,dcr.id as d_id, dcr.comment_id, dcr.reply_id, dcr.reply, dcr.created as reply_time, dcr.hidden from discussion_comments_reply dcr left outer join user u on u.email = dcr.user_email)rr where rr.d_id =" +
    req.params.did +
    " and rr.comment_id =" +
    req.discussion_comments[index].comment_id +
    " order by rr.reply_time desc";

  connection.query(reply_query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      req.replies[index] = {};
      req.replies[index].replies = rows;
      if (index === req.discussion_comments.length - 1) {
        res.json({
          success: true,
          discussion_details: req.discussion_details,
          discussion_comments: req.discussion_comments,
          replyObj: req.replies
        });
      } else {
        index += 1;
        exports.getReplies(req, res, index);
      }
    }
  });
};

app.get("/getDiscussionCommentDetailsDashBoard/:cid", isAdmin, function(
  req,
  res
) {
  var query =
    "select * from ( select dduc.*, ddr.r_creator_name, ddr.r_creator_email, ddr.reply_id, ddr.reply, ddr.reply_time from ( select ddu.* , ddc.c_creator_name, ddc.c_creator_email, ddc.comment_id, ddc.comment, ddc.comment_time  from (select u.name as d_creator_name,u.email as d_creator_email, dd.id as d_id,dd.title ,dd.description,dd.created as discussion_create_time from discussion_details dd left outer join user u on u.email = dd.user_email) ddu left outer join (select u.name as c_creator_name,dc.user_email as c_creator_email, dc.d_id, dc.comment_id, dc.comment, dc.created as comment_time   from discussion_comments dc left outer join user u  on dc.user_email = u.email) ddc on ddu.d_id = ddc.d_id) dduc left outer join (select u.name as r_creator_name, u.email as r_creator_email, dcr.id as d_id, dcr.comment_id, dcr.reply_id, dcr.reply, dcr.created as reply_time from discussion_comments_reply dcr left outer join user u on u.email = dcr.user_email) ddr on dduc.comment_id = ddr.comment_id) ddd where ddd.comment_id =" +
    req.params.cid +
    " order by ddd.reply_time desc";

  connection.query(query, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({ success: false });
    } else {
      res.json({ success: true, comment_details: rows });
    }
  });
});

app.put("/toggleDiscussion/:did/:hidden", isAdmin, function(req, res) {
  console.log(req.params.did);
  console.log(req.params.hidden);
  var hidden;
  req.params.hidden == "true" ? (hidden = "false") : (hidden = "true");
  connection.query(
    "update discussion_details set hidden =? where id =?",
    [hidden, req.params.did],
    function(err, result) {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true });
        /*connection.query('delete from discussion_comments where d_id =?',[req.params.did],function (err, result){
                if(err){
                    console.log(err);
                    res.json({success:false});
                }else{
                    connection.query('delete from discussion_comments_reply where id =?',[req.params.did],function (err, result){
                        if(err){
                            console.log(err);
                            res.json({success:false});
                        }else{
                            res.json({success:true});
                        }
                    })
                }
            })*/
      }
    }
  );
});

app.put("/toggleComment/:comment_id/:hidden", isAdmin, function(req, res) {
  var hidden;
  req.params.hidden == "true" ? (hidden = "false") : (hidden = "true");
  connection.query(
    "update discussion_comments set hidden =? where comment_id =?",
    [hidden, req.params.comment_id],
    function(err, result) {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true });
        /*connection.query('delete from discussion_comments_reply where comment_id =?',[req.params.comment_id],function (err, result){
                if(err){
                    console.log(err);
                    res.json({success:false});
                }else{
                    res.json({success:true});
                }
            })*/
      }
    }
  );
});

app.put("/toggleReply/:reply_id/:hidden", isAdmin, function(req, res) {
  var hidden;
  req.params.hidden == "true" ? (hidden = "false") : (hidden = "true");
  connection.query(
    "update discussion_comments_reply  set hidden =? where reply_id =?",
    [hidden, req.params.reply_id],
    function(err, result) {
      if (err) {
        console.log(err);
        res.json({ success: false });
      } else {
        res.json({ success: true });
      }
    }
  );
});

/**
 ************************************************************************************************************************
 *********************************************DASHBOARD SERVICES END*****************************************************
 ************************************************************************************************************************
 **/

/**
 ************************************************************************************************************************
 *********************************************APPLICATION SERVICE START*****************************************************
 ************************************************************************************************************************
 **/

/**
@ ADD USER TO DATABASE
**/
app.post("/adduser/", function(req, res) {
  exports.adduser(req, res);
});

exports.adduser = function(req, res) {
  console.log(req.body);

  req.body.referid =
    req.body.name.toLowerCase().substr(0, 4) + exports.randomString();
  console.log(req.body.referid);
  connection.query(
    'select * from user where refer_id ="' + req.body.referid + '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        if (rows.length) {
          //WHEN REFERID ALREADY EXISTS
          exports.adduser(req, res);
        } else {
          // WHEN IT DOESN'T EXIST ALREADY
          connection.query(
            'select * from user where email ="' + req.body.email + '"',
            function(err, rows, fields) {
              if (err) {
                console.log(err);
                res.send(err);
              } else {
                if (rows.length == 0) {
                  req.body.salt = crypto.randomBytes(16).toString("base64");
                  var salt = new Buffer(req.body.salt, "base64");
                  req.body.hashed_password = crypto
                    .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
                    .toString("base64");

                  connection.query(
                    'INSERT INTO user (name,email,gender,kids_age,fb,gplus,refer_id,salt,hashed_password) values("' +
                      req.body.name +
                      '","' +
                      req.body.email +
                      '","' +
                      (req.body.gender || "") +
                      '","' +
                      req.body.age +
                      '","' +
                      (req.body.fb || "") +
                      '","' +
                      (req.body.gplus || "") +
                      '","' +
                      req.body.referid +
                      '","' +
                      req.body.salt +
                      '","' +
                      req.body.hashed_password +
                      '")',
                    function(err, result) {
                      if (err) {
                        console.log(err);
                        res.send(err);
                      } else {
                        connection.query(
                          'select * from user where email = "' +
                            req.body.email +
                            '"',
                          function(err, rows, fields) {
                            if (err) {
                              console.log(err);
                            } else {
                              console.log("add");
                              res.json({
                                success: true,
                                user: rows[0]
                              });
                            }
                          }
                        );
                      }
                    }
                  );
                } else {
                  res.json({
                    success: false,
                    message: "Duplicate"
                  });
                }
              }
            }
          );
        }
      }
    }
  );
};

/**
@ USER MANUAL LOGIN 
**/
app.post("/appuserauthenticate/", function(req, res) {
  console.log("email ", req.body.email);
  console.log("password ", req.body.password);

  connection.query(
    'SELECT * from user WHERE email = "' + req.body.email + '"',
    function(err, rows, fields) {
      if (err || !rows.length || !rows[0].salt) {
        console.log(err);
        res.json({
          success: false
        });
      } else {
        console.log(rows);
        var salt = new Buffer(rows[0].salt, "base64");
        console.log(salt);
        var hash = crypto
          .pbkdf2Sync(req.body.password, salt, 10000, 64, "sha512")
          .toString("base64");
        console.log(hash);
        if (hash === rows[0].hashed_password) {
          res.json({
            success: true,
            user: rows[0]
          });
        } else {
          res.json({
            success: false
          });
        }
      }
    }
  );
});

/**
@ USER LOGIN THROUGH FACEBOOK ACCOUNT 
**/
app.post("/fblogintoapp", function(req, res) {
  console.log(req.body.userobj);
  connection.query(
    'SELECT * from user WHERE email = "' + req.body.userobj.email + '"',
    function(err, rows, fields) {
      if (!err) {
        console.log(rows);
        if (!rows.length) {
          console.log("no rows");
          res.json({
            success: false
          });
        } else {
          if (!rows[0].fb) {
            console.log("regestered but not with fb");
            connection.query(
              'update user set fb ="' +
                req.body.userobj.fb +
                '" WHERE email = "' +
                req.body.userobj.email +
                '"',
              function(err, result) {
                if (err) {
                  res.send(err);
                }
                if (result) {
                  res.json({
                    success: true,
                    user: rows[0]
                  });
                }
              }
            );
          } else {
            if (rows[0].fb === req.body.userobj.fb) {
              console.log("success");
              res.json({
                success: true,
                user: rows[0]
              });
            } else {
              console.log("fbiderror");
              res.json({
                success: false,
                fbiderror: true
              });
            }
          }
        }
      } else {
        console.log("Error while performing Query.");
      }
    }
  );
});

/**
@ USER LOGIN THROUGH GOOGLE ACCOUNT 
**/
app.post("/gpluslogintoapp", function(req, res) {
  console.log(req.body.userobj);
  connection.query(
    'SELECT * from user WHERE email = "' + req.body.userobj.email + '"',
    function(err, rows, fields) {
      if (!err) {
        console.log(rows);
        if (!rows.length) {
          console.log("no rows");
          res.json({
            success: false
          });
        } else {
          if (!rows[0].gplus) {
            console.log("regestered but not with gplus");
            connection.query(
              'update user set gplus ="' +
                req.body.userobj.gplus +
                '" WHERE email = "' +
                req.body.userobj.email +
                '"',
              function(err, result) {
                if (err) {
                  res.send(err);
                }
                if (result) {
                  res.json({
                    success: true,
                    user: rows[0]
                  });
                }
              }
            );
          } else {
            if (rows[0].gplus === req.body.userobj.gplus) {
              console.log("success");
              res.json({
                success: true,
                user: rows[0]
              });
            } else {
              console.log("gplusiderror");
              res.json({
                success: false,
                gplusiderror: true
              });
            }
          }
        }
      } else {
        console.log("Error while performing Query.");
        res.json({
          success: false,
          gplusiderror: true
        });
      }
    }
  );
});
/***
    @ Fetch All List
    **/
app.get("/fetchalllist/email/:email/pagenum/:pagenum", function(req, res) {
  var query_st =
    'select  tb1.*, tb2.listing_type from (select tb3.*, tb4.ratings from (select ls1.*,ls2.user_email,ls2.fav,ls2.been_here from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) ls1 left outer join (select * from listing_favourites where user_email = "' +
    req.params.email +
    '") ls2 on ls1.listing_id = ls2.listing_id) tb3 left outer join (select listing_id, round(avg(rating))as ratings from listing_rev_rat group by listing_id) tb4 on tb3.listing_id = tb4.listing_id) tb1 left outer join (select listing_id,valid_from,valid_to, (case  when valid_from > now() or valid_to < now() THEN NULL ELSE rank END) as rank,(case  when (valid_from > now() or valid_to < now()) THEN NULL ELSE listing_type  END) as listing_type, category_id from listing_premium where (category_id = 24 and active = 1) order by -listing_type DESC, -rank DESC) tb2 on  tb1.listing_id = tb2.listing_id  Order by  (CASE tb2.listing_type WHEN "featured" THEN 0 WHEN "premium" THEN 1 END) desc, tb2.rank, COALESCE(tb2.rank,9999) limit 0,' +
    req.params.pagenum * 10;

  connection.query(query_st, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

/***
@ Fetch All List
**/
app.get("/fetchfavlist/email/:email/pagenum/:pagenum", function(req, res) {
  // var query_st = 'select  * from (select tb3.*, tb4.ratings from (select ls1.*,ls2.user_email,ls2.fav,ls2.been_here from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) ls1 left outer join (select * from listing_favourites where user_email = "'+req.params.email+'") ls2 on ls1.listing_id = ls2.listing_id) tb3 left outer join (select listing_id, round(avg(rating))as ratings from listing_rev_rat group by listing_id) tb4 on tb3.listing_id = tb4.listing_id) tb1 left outer join (select listing_id,valid_from,valid_to, (case  when valid_from > now() or valid_to < now() THEN NULL ELSE rank END) as rank,(case  when (valid_from > now() or valid_to < now()) THEN NULL ELSE listing_type  END) as listing_type, category_id from listing_premium order by -listing_type DESC, -rank DESC) tb2 on tb1.category_id = tb2.category_id and tb1.listing_id = tb2.listing_id where tb1.fav = 1 Order by  (CASE tb2.listing_type WHEN "featured" THEN 0 WHEN "premium" THEN 1 END) desc, tb2.rank, COALESCE(tb2.rank,9999) limit 0,'+req.params.pagenum*10;
  console.log(req.params.email, req.params.pagenum);
  var query_st =
    'select  tb1.*, tb2.listing_type from (select tb3.*, tb4.ratings from (select ls1.*,ls2.user_email,ls2.fav,ls2.been_here from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) ls1 left outer join (select * from listing_favourites where user_email = "' +
    req.params.email +
    '") ls2 on ls1.listing_id = ls2.listing_id) tb3 left outer join (select listing_id, round(avg(rating))as ratings from listing_rev_rat group by listing_id) tb4 on tb3.listing_id = tb4.listing_id) tb1 left outer join (select listing_id,valid_from,valid_to, (case  when valid_from > now() or valid_to < now() THEN NULL ELSE rank END) as rank,(case  when (valid_from > now() or valid_to < now()) THEN NULL ELSE listing_type  END) as listing_type, category_id from listing_premium order by -listing_type DESC, -rank DESC) tb2 on tb1.category_id = tb2.category_id and tb1.listing_id = tb2.listing_id where tb1.fav = 1 Order by  (CASE tb2.listing_type WHEN "featured" THEN 0 WHEN "premium" THEN 1 END) desc, tb2.rank, COALESCE(tb2.rank,9999) limit 0,' +
    req.params.pagenum * 10;

  connection.query(query_st, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      console.log(rows);
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

/***
@ Fetch Category List
**/
app.get("/fetchcategorylist/email/:email/cid/:cid/pagenum/:pagenum", function(
  req,
  res
) {
  var query_st =
    'select  tb1.*, tb2.listing_type from (select tb3.*, tb4.ratings from (select ls1.*,ls2.user_email,ls2.fav,ls2.been_here from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) ls1 left outer join (select * from listing_favourites where user_email = "' +
    req.params.email +
    '") ls2 on ls1.listing_id = ls2.listing_id) tb3 left outer join (select listing_id, round(avg(rating))as ratings from listing_rev_rat group by listing_id) tb4 on tb3.listing_id = tb4.listing_id) tb1 left outer join (select listing_id,valid_from,valid_to, (case  when valid_from > now() or valid_to < now() THEN NULL ELSE rank END) as rank,(case  when (valid_from > now() or valid_to < now()) THEN NULL ELSE listing_type  END) as listing_type, category_id from listing_premium where active = 1 order by -listing_type DESC, -rank DESC) tb2 on tb1.category_id = tb2.category_id and tb1.listing_id = tb2.listing_id where tb1.category_id = ' +
    req.params.cid +
    ' Order by  (CASE tb2.listing_type WHEN "featured" THEN 0 WHEN "premium" THEN 1 END) desc, tb2.rank, COALESCE(tb2.rank,9999) limit 0,' +
    req.params.pagenum * 10;

  connection.query(query_st, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

/***
@ Query: Fetching All Deals
@ Join on Listing_details, Listing_category,deal_voucher
***/

app.get("/getalldeal/email/:email/pagenum/:pagenum", function(req, res) {
  console.log(req.params.email, req.params.pagenum);
  var query_st =
    "select ld.business_name,ld.address, dv.voucher_id,dv.listing_id,dv.value,dv.title,dv.description,dv.price,dv.type,dv.valid_to from deal_voucher dv ,listing_details ld where ld.listing_id = dv.listing_id and dv.valid_to > now() limit 0," +
    req.params.pagenum * 10;
  connection.query(query_st, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

/***
@ Query: Fetching All Deals
@ Join on Listing_details, Listing_category,deal_voucher
***/

app.get("/getdealdetails/email/:email/did/:did", function(req, res) {
  var query_st =
    'select tb3.*, lf.fav,lf.been_here from (select tb1.*,tb2.ratings , tb2.reviews from (select ld.business_name,ld.address,ld.phone_no,dv.value, dv.inventory,dv.voucher_id,dv.listing_id,dv.title,dv.description,dv.price,dv.type,dv.valid_to from deal_voucher dv ,listing_details ld where ld.listing_id = dv.listing_id and dv.valid_to > now()) tb1 left outer join (select lr.listing_id, round(avg(lr.rating))as ratings, round(count(lr.listing_id))as reviews  from listing_rev_rat lr group by lr.listing_id ) tb2 on tb2.listing_id = tb1.listing_id) tb3 left outer join (select listing_id, fav,user_email,been_here from listing_favourites where user_email = "' +
    req.params.email +
    '") lf on lf.listing_id = tb3.listing_id where  tb3.voucher_id = ' +
    req.params.did +
    "";
  connection.query(query_st, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

app.get("/cancelreferid/email/:email", function(req, res) {
  console.log(req.params.email);
  connection.query(
    'update user set refer_flag = 0 WHERE email = "' + req.params.email + '"',
    function(err, result) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        res.send({
          success: true
        });
      }
    }
  );
});

/***
@ Send Refer ID 
***/
app.get("/sendreferid/referid/:referid/email/:email", function(req, res) {
  connection.query(
    'SELECT * FROM user WHERE refer_id = "' + req.params.referid + '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        if (rows.length) {
          req.referrer_email = rows[0].email; //REFERRER'S EMAIL

          // GETTING POINTS TO REFER AND GET REFERRED
          var query_st =
            "SELECT activity,points_assigned FROM activity_points where activity = 'refer' or activity= 'getreferred'";
          connection.query(query_st, function(err, rows, fields) {
            if (err) {
              console.log(err);
              res.send({
                success: false
              });
            } else {
              req.refer_points = rows[0].points_assigned;
              req.getreferred_points = rows[1].points_assigned;

              connection.query(
                'INSERT INTO referral_points(refer_id, referrer_email, referee_email, referrer_points, referee_points) values("' +
                  req.params.referid +
                  '","' +
                  req.referrer_email +
                  '","' +
                  req.params.email +
                  '",' +
                  req.refer_points +
                  "," +
                  req.getreferred_points +
                  ")",
                function(err, result) {
                  if (err) {
                    console.log(err);
                    res.send({
                      success: false
                    });
                  } else {
                    res.send({
                      success: true
                    });
                  }
                }
              );
            }
          });
        } else {
          console.log("invalid refer_id");
          res.send({
            success: false,
            msg: "Your refer code is invalid!"
          });
        }
      }
    }
  );
});

/***
@ get Refer Point 
***/
app.get("/getreferpoint", function(req, res) {
  connection.query(
    'SELECT points_assigned FROM activity_points where activity = "refer"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          referpoint: rows[0].points_assigned
        });
      }
    }
  );
});

/***
@ Get User Profile 
***/
app.get("/getuserprofile/email/:email/", function(req, res) {
  connection.query(
    'select name,city,image from user where email = "' + req.params.email + '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          user: rows[0]
        });
      }
    }
  );
});

/***
@ Add or Update Profile Picture
***/
app.post("/addprofilepicture/email/:email", function(req, res) {
  console.log(req.params.email);
  console.log(req.body);
  connection.query(
    'UPDATE user SET image="' +
      req.body.img +
      '" WHERE email= "' +
      req.params.email +
      '"',
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        connection.query(
          'SELECT image FROM user where email = "' + req.params.email + '"',
          function(err, rows, fields) {
            if (err) {
              console.log(err);
              res.send({
                success: false
              });
            } else {
              res.send({
                success: true,
                image: rows[0].image
              });
            }
          }
        );
      }
    }
  );
});

/***
@ Add or Updae Profile information
***/
app.post("/addprofileinfo/email/:email/", function(req, res) {
  console.log(req.params.email);
  console.log(req.body);
  connection.query(
    'UPDATE user SET name="' +
      req.body.name +
      '", city="' +
      req.body.city +
      '" WHERE email = "' +
      req.params.email +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true
        });
      }
    }
  );
});

/***
@ Update List Favorite
***/
app.post("/updatelistfav/id/:id/email/:email/favorite/:favorite", function(
  req,
  res
) {
  console.log(req.params.favorite);
  connection.query(
    'insert into listing_favourites (user_email,listing_id,fav) values("' +
      req.params.email +
      '",' +
      req.params.id +
      "," +
      req.params.favorite +
      ")  on duplicate key update fav = " +
      req.params.favorite +
      "",
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        if (req.params.favorite) {
          exports.notification(
            req,
            res,
            "listing_fav",
            req.params.id,
            req.params.email,
            null
          );
        } else {
          res.send({
            success: true
          });
        }
      }
    }
  );
});

/***
@ Update List Been Here
***/
app.post("/updatelistbeenhere/id/:id/email/:email/bhere/:bhere", function(
  req,
  res
) {
  console.log(req.params.bhere);

  connection.query(
    'insert into listing_favourites (user_email,listing_id,been_here) values("' +
      req.params.email +
      '",' +
      req.params.id +
      "," +
      req.params.bhere +
      ")  on duplicate key update been_here = " +
      req.params.bhere +
      "",
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true
        });
      }
    }
  );
});

app.get("/fetchlistdetails/email/:email/id/:id", function(req, res) {
  var query_st =
    'select tb3.*, tb4.ratings from (select ls1.*,ls2.user_email,ls2.fav,ls2.been_here from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) ls1 left outer join (select * from listing_favourites where user_email = "' +
    req.params.email +
    '") ls2 on ls1.listing_id = ls2.listing_id) tb3 left outer join (select listing_id, round(avg(rating))as ratings from listing_rev_rat group by listing_id) tb4 on tb3.listing_id = tb4.listing_id where tb3.listing_id =' +
    req.params.id;

  var query_st2 =
    "select day, open, close from listing_open_close_time where listing_id = " +
    req.params.id +
    ' order by case day when "Mon" then 0 when "Tue" then 1 when "Wed" then 2 when "Thu" then 3 when "Fri" then 4 when "Sat" then 5 when "Sun" then 6 end';

  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      var listingObj = rows[0];
      connection.query(query_st2, function(err, rows, result) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          res.send({
            success: true,
            listing: listingObj,
            timeobj: rows
          });
        }
      });
    }
  });
});

/***
@ Add-Image To Listing Gallery
***/
app.post("/addimagetogallery", function(req, res) {
  var data = "data:image/jpeg;base64," + req.body.img;
  var imageBuffer = function(data) {
    var matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};
    if (matches.length !== 3) {
      return new Error("Invalid input string");
    }
    response.type = matches[1];
    response.data = new Buffer(matches[2], "base64");
    return response;
  };

  var targetPath0 = imageBuffer(data);
  var folderid = req.body.id.toString();
  targetPath = path.resolve(__dirname, "uploads", folderid, "images");

  mkdirp(targetPath, function(err) {
    if (err) return res.send(500).send("can not upload  picture");
    targetPath = path.resolve(targetPath, req.body.name.toString() + ".jpeg");

    var resource_name = req.body.name.toString() + ".jpeg";
    console.log(targetPath);
    fs.writeFile(targetPath, targetPath0.data, function(err) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        var query_st =
          "INSERT INTO listing_gallery (listing_id, user_email, resource_type, resource_name) values(?,?,?,?)";
        connection.query(
          query_st,
          [req.body.id, req.body.email, "image", resource_name],
          function(err, result) {
            if (err) {
              console.log(err);
              res.send({
                success: false
              });
            } else {
              res.send({
                success: true
              });
            }
          }
        );
      }
    });
  });
});

/**
 *** GETTING ALL IMAGE FILES OF A LISTING
 **/
app.get("/getallimagesources/id/:id", function(req, res) {
  var query_st =
    'select resource_name from listing_gallery where resource_type="image" and listing_id = ' +
    req.params.id +
    "";
  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err, rows, result);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        images: rows
      });
    }
  });
});

/**
 *** GETTING ALL VIDEO FILES OF A LISTING
 **/
app.get("/getallvideosources/id/:id", function(req, res) {
  var query_st =
    'select resource_name from listing_gallery where resource_type="video" and listing_id = ' +
    req.params.id +
    "";
  connection.query(query_st, function(err, rows, result) {
    if (err) {
      console.log(err, rows, result);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        videos: rows
      });
    }
  });
});

/***
@ Send Report Error Mail 
***/
app.post("/reporterrormail", function(req, res) {
  console.log(req.body);
  var mailData = req.body.msg;
  var sender = req.body.email;

  var mailOptions = {
    from: "Mumpa Report Error<appmumpa@gmail.com>", // sender address
    to: "ankur.sharma@technocube.in", // list of receivers
    subject: "Mumpa Report Error Mail", // Subject line
    text: mailData, // plaintext body
    html: '<b style="color:green">' + mailData // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info) {
    if (!error) {
      res.send({
        success: true
      });
    }
  });
});

/***
@ Get All Review and rating for a listing
***/
app.get("/getallreviewrating/id/:id", function(req, res) {
  console.log(req.params.id);
  connection.query(
    "select us.name,ls.review,ls.rating from listing_rev_rat ls left outer join user us on us.email = ls.user_email where ls.listing_id = " +
      req.params.id +
      "",
    function(err, rows, fields) {
      if (err) {
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          reviews: rows
        });
      }
    }
  );
});

app.get("/getpreviousreview/id/:id/email/:email", function(req, res) {
  connection.query(
    'select review, rating from listing_rev_rat where user_email = "' +
      req.params.email +
      '" and listing_id = ' +
      req.params.id +
      "",
    function(err, rows, fields) {
      if (err) {
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          result: rows
        });
      }
    }
  );
});

app.post("/addreviewrate/", function(req, res) {
  console.log(req.body.id);
  console.log(req.body.email);
  console.log(req.body.description);
  console.log(req.body.rate);
  connection.query(
    "insert into listing_rev_rat (listing_id, user_email, review, rating) values(" +
      req.body.id +
      ',"' +
      req.body.email +
      '","' +
      req.body.description +
      '",' +
      req.body.rate +
      ') on duplicate key update review="' +
      req.body.description +
      '", rating = ' +
      req.body.rate +
      "",
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        exports.notification(
          req,
          res,
          "listing_review",
          req.body.id,
          req.body.email,
          null
        );
      }
    }
  );
});

app.post("/mydatapoints/email/:email", function(req, res) {
  console.log("checkEntries");
  connection.query(
    'SELECT email, PointsForListing, PointsForReview, PointsForStartingDiscussion, PointsForComments, PointsForReply, PointsForDiscussionLikes, PointsForCommentLikes, PointsForRefer, PointsForGetReferred, Total FROM user_activity_based_score WHERE email =  "' +
      req.params.email +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.post("/finduserpointsearned/email/:email", function(req, res) {
  connection.query(
    'select (uabs.total - (case  when usp.points IS NULL then 0 when usp.points then usp.points end)) as netpoints from user_activity_based_score uabs left outer join user_spent_points usp on uabs.email =  usp.email where uabs.email = "' +
      req.params.email +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.get("/getuserbypoint", function(req, res) {
  connection.query(
    "SELECT uu.email,uu.city,uu.name,uu.gender,pp.Total AS TotalPointsEarned  FROM user_activity_based_score as pp left outer join user uu  on pp.email = uu.email group by pp.email order by -TotalPointsEarned limit 10",
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

/************************************************************************************************************************/

app.get("/alldiscussion/email/:email/page_num/:page_num", function(req, res) {
  connection.query(
    'SELECT t1.id,t1.title,t1.description, t1.likes, t1.dislikes, t1.comments, (select t2.user_email from `discussion_fav` `t2` where (`t2`.`fav_id` = `t1`.`id` && `t2`.`user_email` = "' +
      req.params.email +
      '") && `t2`.`fav` = 1) AS `isFav`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 0)) AS `isDislike`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 1)) AS `isLike` FROM discussion_activity t1 Group by id order by t1.id DESC limit ' +
      req.params.page_num +
      "",
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.get("/allFavouritediscussion/email/:email", function(req, res) {
  connection.query(
    'select * from (SELECT t1.id,t1.title,t1.description, t1.likes, t1.dislikes, t1.comments, (select t2.user_email from `discussion_fav` `t2` where (`t2`.`fav_id` = `t1`.`id` && `t2`.`user_email` = "' +
      req.params.email +
      '")  && `t2`.`fav` = 1) AS `isFav`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 0)) AS `isDislike`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 1)) AS `isLike` FROM discussion_activity t1 Group by id order by t1.id DESC) as nn where nn.isFav = "' +
      req.params.email +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.put("/discussionsfeedback/id/:id/email/:email/feedback/:feedback", function(
  req,
  res
) {
  connection.query(
    'insert into discussion_feedback (discussion_id, user_email_feedback, feedback) values("' +
      req.params.id +
      '","' +
      req.params.email +
      '","' +
      req.params.feedback +
      '") on duplicate key update feedback = 1',
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        if (req.params.feedback) {
          exports.notification(
            req,
            res,
            "discussion_like",
            req.params.id,
            req.params.email,
            null
          );
        } else {
          res.send({
            success: true
          });
        }
      }
    }
  );
});

app.put(
  "/discussionsdislikefeedback/id/:id/email/:email/feedback/:feedback",
  function(req, res) {
    connection.query(
      'insert into discussion_feedback (discussion_id, user_email_feedback, feedback) values("' +
        req.params.id +
        '","' +
        req.params.email +
        '","' +
        req.params.feedback +
        '") on duplicate key update feedback = 0',
      function(err, result) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          res.send({
            success: true
          });
        }
      }
    );
  }
);

app.put(
  "/updatediscussionfavourite/id/:id/email/:email/f_value/:f_value",
  function(req, res) {
    connection.query(
      'insert into discussion_fav(fav_id, user_email, fav) values("' +
        req.params.id +
        '","' +
        req.params.email +
        '","' +
        req.params.f_value +
        '") on duplicate key update fav = "' +
        req.params.f_value +
        '"',
      function(err, result) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          if (req.params.f_value) {
            exports.notification(
              req,
              res,
              "discussion_fav",
              req.params.id,
              req.params.email,
              null
            );
          } else {
            res.send({
              success: true
            });
          }
        }
      }
    );
  }
);

app.get("/getdiscussiondetails/id/:id/email/:email", function(req, res) {
  connection.query(
    'SELECT t1.id,t1.title,t1.description, t1.likes, t1.dislikes, t1.comments, (select t2.user_email from `discussion_fav` `t2` where (`t2`.`fav_id` = `t1`.`id` && `t2`.`user_email` = "' +
      req.params.email +
      '") && `t2`.`fav` = 1) AS `isFav`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 0)) AS `isDislike`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 1)) AS `isLike` FROM discussion_activity t1 where id = ' +
      req.params.id +
      "",
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.get("/getdiscussioncomments/id/:id", function(req, res) {
  connection.query(
    "select count(case when a.feedback = 1 then 1 else null end) as likes,count(case when a.feedback = 0 then 1 else null end) as dislikes,comment_id,d_id,name,comment from (select * from ( select * from discussion_comment_likes ) as p right join (select u.name, d.d_id, d.comment_id, d.comment from user u, discussion_comments d where u.email = d.user_email and d.d_id = " +
      req.params.id +
      " ) as q on p.comment_id1=q.comment_id) a group by comment_id",
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.post("/addcomment", function(req, res) {
  connection.query(
    'insert into discussion_comments (d_id, user_email,comment) values ("' +
      req.body.id +
      '","' +
      req.body.email +
      '","' +
      req.body.comment +
      '")',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        exports.notification(
          req,
          res,
          "discussion_comment",
          req.body.id,
          req.body.email,
          rows
        );
      }
    }
  );
});

app.get("/getreply/cid/:cid/did/:did", function(req, res) {
  connection.query(
    'select U.name, D.comment_id,D.reply, D.id, D.user_email from user U, discussion_comments_reply D where U.email = D.user_email and comment_id = "' +
      req.params.cid +
      '" and D.id = "' +
      req.params.did +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.post("/startdiscussion", function(req, res) {
  var arr = req.body.splitTag.split(",");
  var i = 0;
  var container_tags = "";
  var tag_or = "";
  arr.forEach(function(batch_tags) {
    if (i == arr.length - 1) {
      container_tags += '("' + arr[i] + '")';
      tag_or += '(tag_title ="' + arr[i] + '") ';
    } else {
      container_tags += '("' + arr[i] + '"),';
      tag_or += '(tag_title = "' + arr[i] + '") OR';
    }
    i = i + 1;
  });

  console.log(tag_or);

  console.log(container_tags);

  var statement =
    "INSERT IGNORE INTO discussion_taglist (`tag_title`) VALUES " +
    container_tags;
  connection.query(statement, function(errify, resultify) {
    if (errify) {
      console.log(errify);
      res.send({
        success: false
      });
    } else {
      connection.query(
        'insert into discussion_details (title,description,user_email) values("' +
          req.body.title +
          '","' +
          req.body.description +
          '","' +
          req.body.email +
          '")',
        function(err, result) {
          if (err) {
            console.log(err);
            res.send({
              success: false
            });
          } else {
            var statement_tag =
              "SELECT tags_id FROM discussion_taglist Where " + tag_or;
            connection.query(statement_tag, function(err, result_tag) {
              if (err) {
                console.log(err);
                res.send({
                  success: false
                });
              } else {
                for (var i = 0; i < result_tag.length; i++) {
                  var s1 =
                    "INSERT INTO discussion_details_tag_list(`id`, `tags_id`) values('" +
                    result.insertId +
                    "'" +
                    "," +
                    "'" +
                    result_tag[i].tags_id +
                    "')";
                  console.log(s1);
                  connection.query(s1, function(err, result) {
                    if (err) {
                      console.log(err);
                      res.send({
                        success: false
                      });
                    } else {
                      console.log(result);
                    }
                  });
                }
                res.send({
                  success: true
                });
              }
            });
          }
        }
      );
    }
  });
});

app.post(
  "/addcommentreply/cid/:cid/did/:did/email/:email/reply/:reply",
  function(req, res) {
    connection.query(
      'insert into discussion_comments_reply (id, user_email,reply,comment_id) values ("' +
        req.params.did +
        '","' +
        req.params.email +
        '","' +
        req.params.reply +
        '","' +
        req.params.cid +
        '")',
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          exports.notification(
            req,
            res,
            "comment_reply",
            req.params.did,
            req.params.email,
            rows
          );
        }
      }
    );
  }
);

app.put(
  "/commentslikefeedback/did/:did/id/:id/email/:email/feedback/:feedback",
  function(req, res) {
    connection.query(
      'insert into  discussion_comment_likes (comment_id1, user_email, feedback) values("' +
        req.params.id +
        '","' +
        req.params.email +
        '","' +
        req.params.feedback +
        '") on duplicate key update feedback = 1',
      function(err, result) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          if (req.params.feedback) {
            exports.notification(
              req,
              res,
              "comment_like",
              req.params.did,
              req.params.email,
              null
            );
          } else {
            res.send({
              success: true
            });
          }
        }
      }
    );
  }
);

app.put(
  "/commentsdislikefeedback/did/:did/id/:id/email/:email/feedback/:feedback",
  function(req, res) {
    connection.query(
      'insert into  discussion_comment_likes (comment_id1, user_email, feedback) values("' +
        req.params.id +
        '","' +
        req.params.email +
        '","' +
        req.params.feedback +
        '") on duplicate key update feedback = 0',
      function(err, result) {
        if (err) {
          console.log(err);
          res.send({
            success: false
          });
        } else {
          res.send({
            success: true
          });
        }
      }
    );
  }
);

app.post("/MyDiscussion/email/:email", function(req, res) {
  connection.query(
    'SELECT `title`, description FROM discussion_details WHERE user_email = "' +
      req.params.email +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

//code to find trending discussions
app.post("/findTrending/email/:email", function(req, res) {
  connection.query(
    'SELECT discussion_activity.id, discussion_activity.title, discussion_activity.description, discussion_activity.likes, discussion_activity.dislikes, discussion_activity.favorites,(select t2.user_email from `discussion_fav` `t2` where (`t2`.`fav_id` = `t1`.`id` && `t2`.`user_email` = "' +
      req.params.email +
      '") && `t2`.`fav` = 1) AS `isFav`, (ActivityScore+TotalViewScore) AS Score, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 0)) AS `isDislike`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
      req.params.email +
      '" && `t3`.`feedback` = 1)) AS `isLike` FROM `trending_score` t1 LEFT JOIN discussion_activity ON discussion_activity.id = t1.id ORDER BY score DESC',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

/***
@ Search within parentship
***/
app.post("/searchall/query/:query/email/:email", function(req, res) {
  var arr = req.params.query.split(" ");
  var i = 0;
  var container_tags = "";
  var search_words = "";
  arr.forEach(function(batch_tags) {
    if (arr.length - 1 == 0) {
      search_words += '"' + arr[i] + '" ';
    } else if (i == arr.length - 1) {
      search_words += arr[i] + '" ';
    } else if (i == 0) {
      search_words += '"' + arr[i] + "| ";
    } else {
      search_words += arr[i] + "|";
    }
    i = i + 1;
  });
  var discussionQuery =
    "select t.fav,u.dislikes,u.likes,u.title,u.id,u.no_of_comments,u.description from (select * from discussion_fav where user_email='" +
    req.params.email +
    "') as t right join (select r.title,r.likes,r.dislikes,r.id,s.no_of_comments,r.description from (select count(dc.comment_id) as no_of_comments,dd.title,dd.description,dd.id from discussion_details dd left join discussion_comments dc on dd.id=dc.d_id group by dd.id) as s left join (select q.dislikes,p.likes,p.title,p.description,p.id from (select count(df.feedback) as likes,dd.title,dd.description,dd.id from discussion_details dd left join discussion_feedback df on dd.id=discussion_id and df.feedback=1 group by dd.id) as p inner join (select count(df.feedback) as dislikes,dd.title,dd.description,dd.id from discussion_details dd left join discussion_feedback df on dd.id=discussion_id and df.feedback=0 group by dd.id) as q on p.id=q.id) as r on s.id=r.id) as u on t.fav_id=u.id WHERE u.title REGEXP " +
    search_words +
    " OR u.description REGEXP " +
    search_words +
    " order by u.id limit 5";
  connection.query(discussionQuery, function(err, rows, fields) {
    //connection.end();
    if (err) {
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

//My reviews
app.post("/MyReviews/email/:email", function(req, res) {
  console.log("checkReviews");
  connection.query(
    'SELECT user_email, review, ld.business_name FROM listing_rev_rat as lrr LEFT OUTER JOIN listing_details ld ON ld.listing_id = lrr.listing_id WHERE lrr.user_email = "' +
      req.params.email +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

app.post("/testnotification", function(req, res) {
  exports.notification(
    req,
    res,
    req.body.notification_object,
    req.body.notification_instance,
    req.body.actor
  );
});

exports.notification = function(
  req,
  res,
  notification_object,
  notification_instance,
  actor,
  response_rows
) {
  //NOTIFICATION_OBJECT_INSERTION
  var query_notification_object =
    "INSERT IGNORE INTO  notification_object (object, object_instance) values(?,?)";
  connection.query(
    query_notification_object,
    [notification_object, notification_instance],
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        connection.query(
          "SELECT MAX(object_id) as object_id from notification_object",
          function(err, rows, fields) {
            if (err) {
              console.log(err);
              res.send({
                success: false
              });
            } else {
              req.object_id = rows[0].object_id;
              var query_notification_change =
                "INSERT INTO  notification_change (object_id, verb, actor) values(?,?,?)";
              connection.query(
                query_notification_change,
                [req.object_id, notification_object, actor],
                function(err, result) {
                  if (err) {
                    console.log(err);
                    res.send({
                      success: false
                    });
                  } else {
                    console.log("---------------change_id entry-------");
                    connection.query(
                      "SELECT MAX(change_id) as change_id from notification_change",
                      function(err, rows, fields) {
                        if (err) {
                          console.log(err);
                          res.send({
                            success: false
                          });
                        } else {
                          req.change_id = rows[0].change_id;
                          if (notification_object.substr(0, 4) === "list") {
                            var query1 =
                              "select  user_email from listing_favourites where listing_id = " +
                              notification_instance +
                              " union select creator from listing_details where listing_id = " +
                              notification_instance +
                              " union select user_email from listing_rev_rat where listing_id =" +
                              notification_instance +
                              "";
                          } else {
                            var query1 =
                              "select user_email from discussion_details where id = " +
                              notification_instance +
                              " union select user_email from discussion_fav where fav_id = " +
                              notification_instance +
                              " union select user_email from discussion_comments where d_id = " +
                              notification_instance +
                              " union select user_email_feedback from discussion_feedback where discussion_id = " +
                              notification_instance +
                              " union select user_email from discussion_comments_reply where id =  " +
                              notification_instance +
                              "";
                          }
                          connection.query(query1, function(err, rows, fields) {
                            if (err) {
                              console.log(err);
                              res.send({
                                success: false
                              });
                            } else {
                              var query_notification_user =
                                "INSERT INTO notification_user (object_id, change_id, affected_user_email) values";
                              for (var i = 0; i < rows.length; i++) {
                                query_notification_user +=
                                  "(" +
                                  req.object_id +
                                  "," +
                                  req.change_id +
                                  ',"' +
                                  rows[i].user_email +
                                  '"),';
                              }
                              query_notification_user =
                                query_notification_user.substr(
                                  0,
                                  query_notification_user.length - 1
                                ) + ";";
                              connection.query(
                                query_notification_user,
                                function(err, result) {
                                  if (err) {
                                    console.log(err);
                                    res.send({
                                      success: false
                                    });
                                  } else {
                                    if (response_rows) {
                                      res.send({
                                        success: true,
                                        rows: response_rows
                                      });
                                    } else {
                                      res.send({
                                        success: true
                                      });
                                    }
                                  }
                                }
                              );
                            }
                          });
                        }
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

//My Entries
app.post("/MyEntries/email/:email", function(req, res) {
  console.log("checkEntries");
  connection.query(
    'SELECT `business_name`, description FROM listing_details WHERE creator = "' +
      req.params.email +
      '"',
    function(err, rows, fields) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        res.send({
          success: true,
          rows: rows
        });
      }
    }
  );
});

//My Notifications
app.get("/notifications/email/:email", function(req, res) {
  var query_notification =
    'select tb1.*, uu.name from (select  nch.verb,nch.actor from notification_user nu left outer join notification_change nch on nu.change_id = nch.change_id where nu.affected_user_email = "' +
    req.params.email +
    '" and nch.actor != "' +
    req.params.email +
    '") tb1 left outer join user uu on uu.email = tb1.actor';
  connection.query(query_notification, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        success: true,
        rows: rows
      });
    }
  });
});

/***
@ Search in All App for display hints to user 
***/
app.get("/displayhints/query/:query", function(req, res) {
  var arr = req.params.query.split(" ");
  var i = 0;
  var container_tags = "";
  var search_words = "";
  arr.forEach(function(batch_tags) {
    if (arr.length - 1 == 0) {
      search_words += '"' + arr[i] + '" ';
    } else if (i == arr.length - 1) {
      search_words += arr[i] + '" ';
    } else if (i == 0) {
      search_words += '"' + arr[i] + "| ";
    } else {
      search_words += arr[i] + "|";
    }
    i = i + 1;
  });

  //Returns stores and discussion details with the entered keywords
  var listingSearchQuery =
    "select ls1.business_name,ls1.category,ls1.description,ls1.listing_id from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) ls1 WHERE ls1.category REGEXP " +
    search_words +
    " OR ls1.business_name REGEXP " +
    search_words +
    " OR ls1.description REGEXP" +
    search_words +
    "limit 5";

  connection.query(listingSearchQuery, function(err, result) {
    if (err) res.send(err);
    if (result) {
      console.log(result);
      var discussionSearchQuery =
        "SELECT id, title, description FROM discussion_details WHERE title REGEXP " +
        search_words +
        " OR description REGEXP " +
        search_words +
        "limit 5";
      connection.query(discussionSearchQuery, function(errify, resultify) {
        if (errify) {
          //console.log(resultify);
          res.send(errify);
        }
        if (resultify) {
          //console.log(resultify);
          res.send({
            success: true,
            listing: result,
            discussion: resultify
          });
        }
      });
    }
  });
});

/***
@ Response all searched data of user based on query string
***/
app.get("/getallsearchresults/email/:email/query/:query", function(req, res) {
  console.log(req.params.email, req.params.query);
  var arr = req.params.query.split(" ");
  var i = 0;
  var container_tags = "";
  var search_words = "";
  arr.forEach(function(batch_tags) {
    if (arr.length - 1 == 0) {
      search_words += '"' + arr[i] + '" ';
    } else if (i == arr.length - 1) {
      search_words += arr[i] + '" ';
    } else if (i == 0) {
      search_words += '"' + arr[i] + "| ";
    } else {
      search_words += arr[i] + "|";
    }
    i = i + 1;
  });

  //Returns stores and discussion details with the entered keywords
  var listingSearchQuery =
    "select * from (select tb3.*,tb4.category from (select tb1.business_name,tb1.address,tb1.description, tb1.listing_id,tb1.location,tb2.ratings from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) tb1 left outer join (select listing_id, round(avg(rating))as ratings from listing_rev_rat group by listing_id) tb2  on tb2.listing_id = tb1.listing_id) tb3 left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id ) tb4 on tb4.listing_id = tb3.listing_id) tb5 WHERE tb5.category REGEXP " +
    search_words +
    " OR tb5.business_name REGEXP " +
    search_words +
    " OR tb5.description REGEXP" +
    search_words +
    "limit 20";

  connection.query(listingSearchQuery, function(err, result) {
    if (err) res.send(err);
    if (result) {
      console.log(result);
      var discussionSearchQuery =
        'select * from (SELECT t1.id,t1.title,t1.description, t1.likes, t1.dislikes, t1.comments, (select t2.user_email from `discussion_fav` `t2` where (`t2`.`fav_id` = `t1`.`id` && `t2`.`user_email` = "' +
        req.params.email +
        '") && `t2`.`fav` = 1) AS `isFav`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
        req.params.email +
        '" && `t3`.`feedback` = 0)) AS `isDislike`, (select t3.user_email_feedback from `discussion_feedback` `t3` where (`t3`.`discussion_id` = `t1`.`id` && `t3`.`user_email_feedback` = "' +
        req.params.email +
        '" && `t3`.`feedback` = 1)) AS `isLike` FROM discussion_activity t1 Group by id order by t1.id DESC) tb1 WHERE tb1.title REGEXP ' +
        search_words +
        " OR tb1.description REGEXP " +
        search_words +
        " limit 20";
      connection.query(discussionSearchQuery, function(errify, resultify) {
        if (errify) {
          res.send(errify);
        }
        if (resultify) {
          res.send({
            success: true,
            listing: result,
            discussion: resultify
          });
        }
      });
    }
  });
});

/***
voucher code character genrator
**/
exports.randomAlphabates = function() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var string_length = 4;
  var randomstring = "";
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
};

exports.convertInToSixDigit = function(num, maxstr) {
  num = num.toString();
  return num.length < maxstr
    ? exports.convertInToSixDigit("0" + num, maxstr)
    : num;
};

/***
@ Genrate Voucher and save in user voucher and update inventory
***/
app.get(
  "/genratevoucher/email/:email/price/:price/voucherid/:voucherid",
  function(req, res) {
    var alphacode = exports.randomAlphabates();
    var uid = randtoken.uid;
    var voucherCode = uid(8);
    console.log(alphacode);

    connection.query(
      "select inventory from deal_voucher where voucher_id =" +
        req.params.voucherid +
        "",
      function(err, rows, fields) {
        if (err) {
          res.send({
            success: false,
            error: "No inventory"
          });
        } else {
          if (rows[0].inventory) {
            var query_maxcount = "select max(id) as lcount from user_vouchers";
            connection.query(query_maxcount, function(err, rows, fields) {
              if (err) {
                console.log(err);
                res.send({
                  success: false
                });
              } else {
                var codenumber = exports.convertInToSixDigit(
                  rows[0].lcount + 1,
                  6
                );
                var voucherCode = alphacode + codenumber;
                var query_st =
                  'INSERT INTO user_vouchers (voucher_code,user_email,voucher_id) values ("' +
                  voucherCode +
                  '","' +
                  req.params.email +
                  '",' +
                  req.params.voucherid +
                  ")";
                connection.query(query_st, function(err, rows, fields) {
                  if (err) {
                    console.log(err);
                    res.send({
                      success: false
                    });
                  } else {
                    var query_update_inventory =
                      "update  deal_voucher set inventory = (inventory - 1) where voucher_id = " +
                      req.params.voucherid +
                      "";
                    connection.query(query_update_inventory, function(
                      err,
                      rows,
                      fields
                    ) {
                      if (err) {
                        console.log(err);
                        res.send({
                          success: false
                        });
                      } else {
                        var query_update_spents =
                          'INSERT INTO user_spent_points (email,points) VALUES ("' +
                          req.params.email +
                          '",' +
                          req.params.price +
                          ") ON DUPLICATE KEY UPDATE points = points + " +
                          req.params.price +
                          "";
                        connection.query(query_update_spents, function(
                          err,
                          rows,
                          fields
                        ) {
                          if (err) {
                            console.log(err);
                            res.send({
                              success: false
                            });
                          } else {
                            res.send({
                              vouchercode: voucherCode,
                              success: true
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
            //var query_st = 'INSERT INTO user_vouchers (voucher_code,user_email,voucher_id) values ("' + voucherCode + '","' + req.params.email + '",' + req.params.voucherid + ')'
            /*                     connection.query(query_st, function (err, rows, fields) {
                                             if (err) {
                                                 console.log(err);
                                                 res.send({
                                                     success: false
                                                 })
                                             } else {
                                                 var query_update_inventory = 'update  deal_voucher set inventory = (inventory - 1) where voucher_id = ' + req.params.voucherid + ''
                                                 connection.query(query_update_inventory, function (err, rows, fields) {
                                                     if (err) {
                                                         console.log(err);
                                                         res.send({
                                                             success: false
                                                         })
                                                     } else {
                                                         var query_update_spents = 'INSERT INTO user_spent_points (email,points) VALUES ("' + req.params.email + '",' + req.params.price + ') ON DUPLICATE KEY UPDATE points = points + ' + req.params.price + ''
                                                         connection.query(query_update_spents, function (err, rows, fields) {
                                                             if (err) {
                                                                 console.log(err);
                                                                 res.send({
                                                                     success: false
                                                                 })
                                                             } else {
                                                                 res.send({
                                                                     vouchercode: voucherCode,
                                                                     success: true
                                                                 })
                                                             }
                                                         })
                                                     }
                                                 })
                                             }
                                         })*/
          } else {
            res.send({
              success: false,
              error: "No inventory"
            });
          }
        }
      }
    );

    /*var voucherCode = Math.random().toString(36).slice(2);*/
  }
);

/***
@ Get User Voucher Details
***/
app.get("/getuservoucher/email/:email", function(req, res) {
  var query_st =
    'select tb2.*,tb1.business_name from listing_details tb1 right outer join (select dv.voucher_id,dv.listing_id,dv.value,dv.price,dv.description,dv.valid_to,uv.voucher_code,uv.user_email from deal_voucher dv right outer join user_vouchers uv on uv.voucher_id = dv.voucher_id) tb2 on tb1.listing_id = tb2.listing_id where tb2.user_email = "' +
    req.params.email +
    '"';
  connection.query(query_st, function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      res.send({
        vouchers: rows,
        success: true
      });
    }
  });
});

/***
@ Search filters API SERVICE 
***/
app.post("/searchfilter", function(req, res) {
  console.log(req.body);
  connection.query(
    "CREATE TEMPORARY TABLE IF NOT EXISTS listing_view (listing_id int(100),business_name varchar(30),address varchar(125),city varchar(40),phone_no varchar(20),distance float,card varchar(50),cash varchar(50),fav TINYINT(4),category_id int(11),category varchar(50),user_email varchar(50),ratings int(10),delivers varchar(10))",
    function(err, rows, fields) {
      if (!err) {
        var query_st =
          'select  tb1.*, tb2.listing_type from (select tb3.*, tb4.ratings from (select ls1.*,ls2.user_email,ls2.fav,ls2.been_here from (select ld.*,lccd.category,lccd.category_id from listing_details ld left outer join (select lcd.listing_id,lc.category,lcd.category_id from listing_category_details lcd left outer join  listing_category lc on lc.category_id = lcd.category_id) lccd on lccd.listing_id = ld.listing_id) ls1 left outer join (select * from listing_favourites where user_email = "' +
          req.body.user_email +
          '") ls2 on ls1.listing_id = ls2.listing_id) tb3 left outer join (select listing_id, round(avg(rating))as ratings from listing_rev_rat group by listing_id) tb4 on tb3.listing_id = tb4.listing_id) tb1 left outer join (select listing_id,valid_from,valid_to, (case  when valid_from > now() or valid_to < now() THEN NULL ELSE rank END) as rank,(case  when (valid_from > now() or valid_to < now()) THEN NULL ELSE listing_type  END) as listing_type, category_id from listing_premium where (category_id = 24 and active = 1) order by -listing_type DESC, -rank DESC) tb2 on  tb1.listing_id = tb2.listing_id  Order by  (CASE tb2.listing_type WHEN "featured" THEN 0 WHEN "premium" THEN 1 END) desc, tb2.rank, COALESCE(tb2.rank,9999)';
        connection.query(query_st, function(err, rows, fields) {
          if (!err) {
            var query = "";

            function findDistance(lat1, lon1, lat2, lon2) {
              var R = 6371; // km
              var dLat = toRad(lat2 - lat1);
              var dLon = toRad(lon2 - lon1);
              var lat1 = toRad(lat1);
              var lat2 = toRad(lat2);
              var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) *
                  Math.sin(dLon / 2) *
                  Math.cos(lat1) *
                  Math.cos(lat2);
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              var d = R * c;
              return d;
            }

            function toRad(Value) {
              return (Value * Math.PI) / 180;
            }
            for (var i = 0; i < rows.length; i++) {
              var dis = findDistance(
                rows[i].latitude,
                rows[i].longitude,
                req.body.latitude,
                req.body.longitude
              );
              query =
                query +
                "(" +
                rows[i].listing_id +
                ',"' +
                rows[i].business_name +
                '","' +
                rows[i].address +
                '","' +
                rows[i].city +
                '","' +
                rows[i].phone_no +
                '",' +
                dis +
                ',"' +
                rows[i].card +
                '","' +
                rows[i].cash +
                '",' +
                rows[i].fav +
                "," +
                rows[i].category_id +
                ',"' +
                rows[i].category +
                '","' +
                rows[i].user_email +
                '",' +
                rows[i].ratings +
                ',"' +
                rows[i].delivers +
                '"),';
            }
            query = query.substring(0, query.length - 1);

            connection.query("TRUNCATE TABLE listing_view");
            connection.query(
              "insert into listing_view(listing_id,business_name,address,city,phone_no,distance,card,cash,fav,category_id,category,user_email,ratings,delivers) VALUES " +
                query +
                "",
              function(err, rows, fields) {
                if (!err) {
                  var temp_query_str = "";
                  var listingSearchQuery;
                  for (i in req.body) {
                    if (req.body[i]) {
                      if (i == "cash") {
                        temp_query_str = temp_query_str + "cash = 'Cash' AND ";
                      }
                      if (i == "card") {
                        temp_query_str = temp_query_str + "card = 'Card' AND ";
                      }
                      if (i == "favourite") {
                        temp_query_str = temp_query_str + "fav = 1 AND ";
                      }
                      if (i == "ratingsSliderValue") {
                        temp_query_str =
                          temp_query_str + "ratings =" + req.body[i] + " AND ";
                      }
                      if (i == "distanceSliderValue") {
                        temp_query_str =
                          temp_query_str +
                          "distance <=" +
                          req.body[i] +
                          " AND ";
                      }
                      if (i == "homedelivery") {
                        temp_query_str = temp_query_str + "delivers = 'Y' AND ";
                      }
                      if (i == "ctr") {
                        var catIN = "(";
                        for (j in req.body[i]) {
                          if (req.body[i][j]) {
                            catIN = catIN + j + ",";
                          }
                        }
                        if (catIN != "(") {
                          catIN = catIN.substring(0, catIN.length - 1);
                          catIN = catIN + ")";
                          temp_query_str =
                            temp_query_str +
                            "category_id IN " +
                            catIN +
                            " AND ";
                        }
                      }
                    }
                  }

                  temp_query_str = temp_query_str.substring(
                    0,
                    temp_query_str.length - 4
                  );
                  console.log(temp_query_str);
                  if (!temp_query_str) {
                    listingSearchQuery = "select * FROM listing_view limit 60";
                  } else {
                    listingSearchQuery =
                      "select * FROM listing_view where " + temp_query_str;
                  }

                  connection.query(listingSearchQuery, function(
                    err,
                    rows,
                    fields
                  ) {
                    if (!err) {
                      res.send({
                        success: true,
                        rows: rows
                      });
                    } else {
                      console.log(err);
                      res.send({
                        success: false
                      });
                    }
                  });
                } else {
                  console.log(err);
                  res.send({
                    success: false
                  });
                }
              }
            );
          } else {
            console.log(err);
            res.send({
              success: false
            });
          }
        });
      } else {
        console.log(err);
        res.send({
          success: false
        });
      }
    }
  );
});

/**
 ************************************************************************************************************************
 *********************************************APPLICATION SERVICE END*****************************************************
 ************************************************************************************************************************
 **/

app.get("/templistupdate", function(req, res) {
  connection.query("SELECT * FROM templist", function(err, rows, fields) {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        err: err
      });
    }

    req.templistObj = rows;
    exports.templist_details(req, res, 0);
  });
});

exports.templist_details = function(req, res, index) {
  var insert_list_query =
    'INSERT IGNORE INTO listing_details (creator, business_name, description, bussines_email, address, address2, city, state, pin, location, phone_no, phone_no2, website, cash, card) values("sugandh@mumpa.in","' +
    (req.templistObj[index].name || null) +
    '","' +
    (req.templistObj[index].description || null) +
    '","' +
    (req.templistObj[index].email || null) +
    '","' +
    (req.templistObj[index].address1 || null) +
    '","' +
    (req.templistObj[index].address2 || null) +
    '","' +
    (req.templistObj[index].city || null) +
    '","' +
    (req.templistObj[index].state || null) +
    '",' +
    (req.templistObj[index].pin || null) +
    ',"' +
    (req.templistObj[index].location || null) +
    '","' +
    (req.templistObj[index].phone_no || null) +
    '","' +
    (req.templistObj[index].phone_no2 || null) +
    '","' +
    (req.templistObj[index].website || null) +
    '","' +
    (req.templistObj[index].cash || null) +
    '","' +
    (req.templistObj[index].card || null) +
    '")';

  connection.query(insert_list_query, function(err, result) {
    if (err) {
      console.log(err);
      res.json({
        success: false
      });
    } else {
      connection.query(
        "SELECT MAX(listing_id) as newid from listing_details",
        function(err, rows, result) {
          if (err) {
            console.log(err);
            res.json({
              success: false
            });
          } else {
            console.log("listing_id ", rows[0].newid);
            req.body.listing_id = rows[0].newid;

            exports.templist_category(req, res, index);
          }
        }
      );
    }
  });
};

exports.templist_category = function(req, res, index) {
  var category = req.templistObj[index].category;

  var category_st =
    "INSERT IGNORE INTO listing_category_details (listing_id, category_id) values";

  if (category.indexOf(",") == -1) {
    var cat = category;
    connection.query(
      "Select category_id from listing_category where category=?",
      [cat],
      function(err, rows, fields) {
        if (err) {
          console.log(err);
          res.json({
            success: false
          });
        }
        var cat_id = rows[0].category_id;

        category_st =
          category_st + "(" + req.body.listing_id + "," + cat_id + "),";
      }
    );
  } else {
    category = category.split(",");
    for (var j = 0; j < category.length; j++) {
      var cat = category[j];
      connection.query(
        "Select category_id from listing_category where category=?",
        [cat],
        function(err, rows, fields) {
          if (err) {
            console.log(err);
            res.json({
              success: false
            });
          }
          var cat_id = rows[0].category_id;
          category_st =
            category_st + "(" + req.body.listing_id + "," + cat_id + "),";
        }
      );
    }
  }

  category_st = category_st.substr(0, category_st.length - 1) + ";";
  console.log("category_st");
  console.log(category_st);

  connection.query(category_st, function(err, result) {
    if (err) {
      console.log(err);
      res.json({
        success: false
      });
    } else {
      if (req.templistObj.day_open && req.templistObj.social) {
        exports.templist_time_social(req, res, index);
      } else if (req.templistObj.day_open) {
        exports.templist_time(req, res, index);
      } else if (req.templistObj.social) {
        exports.templist_social(req, res, index);
      }
    }
  });
};

exports.templist_time_social = function(req, res, index) {
  var day_array = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var day_open = req.templistObj[index].day_open;

  var time_st =
    "INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values";

  if (day_open.indexOf("-") === -1 && day_open.indexOf(",") === -1) {
    var short_day = day_open.substr(0, 3);
    time_st =
      time_st +
      "(" +
      (req.body.listing_id || null) +
      ',"' +
      (short_day || null) +
      '","' +
      (req.templistObj[index].open || null) +
      '","' +
      (req.templistObj[index].close || null) +
      '"),';
  } else if (day_open.indexOf("-") === -1 && day_open.indexOf(",") != -1) {
    day_open = day_open.split(",");

    console.log("DAYOPEN AFTER SPLIT ", day_open);

    for (var j = 0; j < day_open.length; j++) {
      var short_day = day_open[j].substr(0, 3);
      time_st =
        time_st +
        "(" +
        (req.body.listing_id || null) +
        ',"' +
        (short_day || null) +
        '","' +
        (req.templistObj[index].open || null) +
        '","' +
        (req.templistObj[index].close || null) +
        '"),';
    }
  } else if (day_open.indexOf("-") != -1 && day_open.indexOf(",") === -1) {
    day_open = day_open.split("-");
    console.log("DAYOPEN AFTER SPLIT ", day_open);

    var day_open1 = day_open[0].substr(0, 3);
    var day_open2 = day_open[1].substr(0, 3);

    var start = day_array.indexOf(day_open1);
    var end = day_array.indexOf(day_open2);
    console.log("START ", start, " END  ", end);

    if (start > end) {
      end = end + 7;
    }

    for (var j = start; j <= end; j++) {
      var x = j;
      if (x > 6) {
        x = x % 7;
      }
      var short_day = day_open[x].substr(0, 3);
      time_st =
        time_st +
        "(" +
        (req.body.listing_id || null) +
        ',"' +
        (short_day || null) +
        '","' +
        (req.templistObj[index].open || null) +
        '","' +
        (req.templistObj[index].close || null) +
        '"),';
    }
  }

  time_st = time_st.substr(0, time_st.length - 1) + ";";
  console.log("time_st");
  console.log(time_st);

  connection.query(time_st, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      exports.templist_social(req, res, index);
    }
  });
};

exports.templist_time = function(req, res, index) {
  var day_array = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var day_open = req.templistObj[index].day_open;

  var time_st =
    "INSERT IGNORE INTO listing_open_close_time (listing_id,day, open, close) values";

  if (day_open.indexOf("-") === -1 && day_open.indexOf(",") === -1) {
    var short_day = day_open.substr(0, 3);
    time_st =
      time_st +
      "(" +
      (req.body.listing_id || null) +
      ',"' +
      (short_day || null) +
      '","' +
      (req.templistObj[index].open || null) +
      '","' +
      (req.templistObj[index].close || null) +
      '"),';
  } else if (day_open.indexOf("-") === -1 && day_open.indexOf(",") != -1) {
    day_open = day_open.split(",");

    console.log("DAYOPEN AFTER SPLIT ", day_open);

    for (var j = 0; j < day_open.length; j++) {
      var short_day = day_open[j].substr(0, 3);
      time_st =
        time_st +
        "(" +
        (req.body.listing_id || null) +
        ',"' +
        (short_day || null) +
        '","' +
        (req.templistObj[index].open || null) +
        '","' +
        (req.templistObj[index].close || null) +
        '"),';
    }
  } else if (day_open.indexOf("-") != -1 && day_open.indexOf(",") === -1) {
    day_open = day_open.split("-");
    console.log("DAYOPEN AFTER SPLIT ", day_open);

    var day_open1 = day_open[0].substr(0, 3);
    var day_open2 = day_open[1].substr(0, 3);

    var start = day_array.indexOf(day_open1);
    var end = day_array.indexOf(day_open2);
    console.log("START ", start, " END  ", end);

    if (start > end) {
      end = end + 7;
    }

    for (var j = start; j <= end; j++) {
      var x = j;
      if (x > 6) {
        x = x % 7;
      }
      var short_day = day_open[x].substr(0, 3);
      time_st =
        time_st +
        "(" +
        (req.body.listing_id || null) +
        ',"' +
        (short_day || null) +
        '","' +
        (req.templistObj[index].open || null) +
        '","' +
        (req.templistObj[index].close || null) +
        '"),';
    }
  }

  time_st = time_st.substr(0, time_st.length - 1) + ";";
  console.log("time_st");
  console.log(time_st);

  connection.query(time_st, function(err, result) {
    if (err) {
      console.log(err);
      res.send({
        success: false
      });
    } else {
      if (index === req.templistObj.length - 1) {
        res.send({
          success: true
        });
      } else {
        index += 1;
        exports.templist_details(req, res, index);
      }
    }
  });
};

exports.templist_social = function(req, res, index) {
  req.body.facebook = req.templistObj[index].social || "";
  req.body.twitter = req.body.twitter || "";
  req.body.instagram = req.body.instagram || "";

  var social_St =
    "INSERT IGNORE INTO listing_social (listing_id,facebook, twitter, instagram) values(?,?,?,?);";
  connection.query(
    social_St,
    [
      req.body.listing_id,
      req.body.facebook,
      req.body.twitter,
      req.body.instagram
    ],
    function(err, result) {
      if (err) {
        console.log(err);
        res.send({
          success: false
        });
      } else {
        console.log("SOCIAL TABLE UPDATED ", index + 1);
        if (index === req.templistObj.length - 1) {
          res.send({
            success: true
          });
        } else {
          index += 1;
          exports.templist_details(req, res, index);
        }
      }
    }
  );
};

// push notification code for when user liting get approved

exports.pushStoreListedByUserGetApproved = function(listing_id) {
  var query =
    "select business_name, creator from listing_details where listing_id = " +
    listing_id +
    "";
  var business_name;
  var parse_id;
  connection.query(query, function(err, rows, fields) {
    if (err) {
      console.log(err);
    } else {
      console.log(rows[0].business_name);
      console.log(rows[0].creator);
      console.log(rows);
      business_name = rows[0].business_name;
      var query =
        'select parse_id, name from user where email = "' +
        rows[0].creator +
        '"';
      connection.query(query, function(err, rows, fields) {
        if (err) {
          console.log(err);
        } else {
          console.log(rows[0].parse_id);
          console.log(rows[0].name);
          console.log(rows);
          if (rows[0].parse_id) {
            requestify
              .request("https://api.parse.com/1/push", {
                method: "POST",
                headers: {
                  "X-Parse-Application-Id":
                    "6HPhd2ZpuDXuLyiKBDX3hrXIJaWEAFQZZfkcxgnZ",
                  "X-Parse-REST-API-Key":
                    "eVVGSKRYOt1S5uiLoyqv2AHmUzGKcQwjjo4oHs3s",
                  "Content-Type": "application/json",
                  host: "api.parse.com"
                },
                body: {
                  data: {
                    alert:
                      "Hi " +
                      rows[0].name +
                      " your listing " +
                      business_name +
                      "is approved. please add more for add more points"
                  },
                  where: {
                    objectId: rows[0].parse_id
                  }
                },
                dataType: "json"
              })
              .then(function(response) {
                // Get the response body (JSON parsed or jQuery object for XMLs)
                console.log(response);
                response.getBody();
                response.body;
              });
          }
        }
      });
    }
  });
};

var L = schedule.scheduleJob(
  {
    hour: 20,
    minute: 30,
    dayOfWeek: 1
  },
  function() {
    var query =
      "select t3.*,parse_id from (select t1.*,creator from (select count(listing_id),listing_id from listing_rev_rat where created > CAST(CURRENT_TIMESTAMP AS DATE) - 15 group by listing_id) t1 left outer join listing_details t2 on t1.listing_id = t2.listing_id) t3 left outer join  user t4 on t3.creator = t4.email";
    connection.query(query, function(err, rows, fields) {
      if (err) {
        console.log(err);
      } else {
        rows.forEach(function(data) {
          console.log(data);
        });
      }
    });
  }
);

/*app.listen(5000);
console.log('Rest Demo Listening on port 5000');*/

app.listen(4000);
console.log("Rest Demo Listening on port 4000");
