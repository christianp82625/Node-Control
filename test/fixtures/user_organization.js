/**
 * Created by aldo on 1/28/14.
 */
module.exports = UserOrganization = {

  userOrg: {
    organization_name: "Redwolf Security",
    user_contact_email: "aldo+1@satio.com.ar",
    roles: [ { role: 'site_administrator', hasRole: true }, { role: 'organization_administrator', hasRole: false }, { role: 'traffic_viewer', hasRole: false }, { role: 'attack_designer', hasRole: false }, { role: 'api_user', hasRole: false } ]
  },

  userOrg_noRoles: {
    organization_name: "Redwolf Security",
    user_contact_email: "aldo+1@satio.com.ar",
    roles: []
  }

}

