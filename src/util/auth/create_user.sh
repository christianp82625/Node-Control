echo "Create USER JSON"
echo "================"

read -p 'First name: ' user_contact_name_first
read -p 'Last name: ' user_contact_name_last
read -p 'User Email: ' user_contact_email
read -p 'Password: ' account_password
read -p 'Organization : ' organization
user_password_sha1=`echo SALT${account_password} | sha256sum | cut -d" " -f1`


( cat <<EOT
{
	"mime_type" : "access_control/account",
	"url_template" : "/users/[user_contact_email]",
	"url" : "/users/${user_contact_email}",
	"account_created_epoch_time_s" : `date +%s`,
	"organization" : "${organization}",
	"user_contact_name_first" : "${user_contact_name_first}",
	"user_contact_name_last" : "${user_contact_name_last}",
	"user_contact_email" : "${user_contact_email}",
	"user_password_sha256" : "${user_password_sha1}",
	"user_timezone" : "EDT",
	"account_enable" : true,
	"license_start_epoch_s" : 0,
	"license_end_epoch_s" : 1`date +%s`,
	"address" : {
		"mime_type" : "access_control/address",
		"unit" : "4",
		"building" : "",
		"street" : "Dupont St.",
		"city" : "Waterloo",
		"state_or_province" : "Ontario",
		"country" : "Canada",
		"postal_code" : "N2L 2X5"
	}
}
EOT
)
