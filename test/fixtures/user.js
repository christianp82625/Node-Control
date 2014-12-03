/**
 * Created by aldo on 1/28/14.
 */
module.exports = User = {

  user_enabled: {
    user_contact_name_first: "Aldo",
    user_contact_name_last: "Nievas",
    user_contact_email: "aldo+1@satio.com.ar",
    password: "alduro",
    account_enable: true,
    user_timezone : 'EDT',
    address: {
      mime_type : "access_control/address",
      unit : "4",
      building : "",
      street : "Dupont St.",
      city : "Waterloo",
      state_or_province : "Ontario",
      country : "Canada",
      postal_code : "N2L 2X5"
    }
  },

  user_disabled: {
    user_contact_name_first: "Aldo",
    user_contact_name_last: "Nievas",
    user_contact_email: "aldo@satio.com.ar",
    password: "alduro",
    account_enable: false,
    user_timezone : 'EDT',
    address: {
      mime_type : "access_control/address",
      unit : "4",
      building : "",
      street : "Dupont St.",
      city : "Waterloo",
      state_or_province : "Ontario",
      country : "Canada",
      postal_code : "N2L 2X5"
    }
  }

}

