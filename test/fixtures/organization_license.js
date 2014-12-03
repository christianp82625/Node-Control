/**
 * Created by aldo on 1/28/14.
 */
var moment = require('moment');

module.exports = OrganizationLicense = {

  orgLic_active: {
    organization_name: 'Redwolf Security',
    license_start_epoch_s: Math.round(moment().add('days', -4)/1000), // Today - 4 days,
    license_end_epoch_s: Math.round(moment().add('days', 5)/1000), // Today + 5 days
    license_enabled: true,
    purchase_order: '23456',
    maximum_bandwidth_allowed_gigabits_per_second: 450000,
    maximum_agents_allowed_across_all_theatres: 10
  },
  orgLic_notstarted: {
    organization_name: 'Redwolf Security Inactive',
    license_start_epoch_s: Math.round(moment().add('days', 4)/1000), // Today - 4 days,
    license_end_epoch_s: Math.round(moment().add('days', 9)/1000), // Today + 5 days
    license_enabled: true,
    purchase_order: '23456',
    maximum_bandwidth_allowed_gigabits_per_second: 450000,
    maximum_agents_allowed_across_all_theatres: 10
  },
  orgLic_expired: {
    organization_name: 'Redwolf Security',
    license_start_epoch_s: Math.round(moment().add('days', -5)/1000), // Today - 4 days,
    license_end_epoch_s: Math.round(moment().add('days', -2)/1000), // Today + 5 days
    license_enabled: true,
    purchase_order: '23456',
    maximum_bandwidth_allowed_gigabits_per_second: 450000,
    maximum_agents_allowed_across_all_theatres: 10
  },
  orgLic_invalid: { // start > end
    organization_name: 'Redwolf Security',
    license_start_epoch_s: Math.round(moment().add('days', 7)/1000), // Today + 7 days,
    license_end_epoch_s: Math.round(moment().add('days', 5)/1000), // Today + 5 days
    license_enabled: true,
    purchase_order: '23456',
    maximum_bandwidth_allowed_gigabits_per_second: 450000,
    maximum_agents_allowed_across_all_theatres: 10
  }

}
