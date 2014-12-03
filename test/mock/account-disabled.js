'use strict';

var crypto = require('crypto');

angular.module('mockedFeed', [])
  .value('disabledJSON', {
    query: {
      count: 1,
      created: Math.round(Date.now()/1000),
      lang: 'en-US',
      results: {
        entry: [
          {
            mime_type:  "access_control/account",
            uri_template : "/users/[user_contact_email]",
            account_created_epoch_time_s : Math.round(Date.now()/1000),
            user_timezone : 'EDT',
            account_enable : false,
            address: {
              mime_type : "access_control/address",
              unit : "4",
              building : "",
              street : "Dupont St.",
              city : "Waterloo",
              state_or_province : "Ontario",
              country : "Canada",
              postal_code : "N2L 2X5"
            },
            organization: "Redwolf Security",
            user_contact_name_first: "Aldo",
            user_contact_name_last: "Nievas",
            user_contact_email: "foo@bar.com",
            user_password_sha256: crypto.createHmac('sha256', 'development').update('bar').digest('hex'),
            uri: "/users/" + "foo@bar.com",
            license_start_epoch_s: Math.round(moment().add('days', -2)/1000),
            license_end_epoch_s: Math.round(moment().add('days', -1)/1000)
          }
        ]
      }
    }
  });