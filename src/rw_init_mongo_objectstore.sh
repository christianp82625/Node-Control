#!/bin/sh


echo "rw_init_mongo_objectstore -- Re-Create Mongo Object Store"

(
cat <<EOT
db.object.count();

db.dropDatabase();

db.createCollection("object");

db.object.ensureIndex({ "mime_type" : 1 });
db.object.ensureIndex({ "uri" : 1 });
db.object.ensureIndex({ "public_ip" : 1 }, {"sparse" : true });
db.object.ensureIndex({ "service_state" : 1 },{"sparse" : true });
db.object.ensureIndex({ "service_name" : 1 },{"sparse" : true });
db.object.ensureIndex({ "state_change_time_epoch_s" : 1 },{"sparse" : true });
db.object.ensureIndex({ "from" : 1 });
db.object.ensureIndex({ "to" : 1 });
db.object.ensureIndex({ "_t" : 1 });

db.object.count();
EOT
) >/tmp/mongo_init_script.js

mongo --verbose redwolf /tmp/mongo_init_script.js
