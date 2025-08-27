set -e

mongosh -u $MONGO_INITDB_ROOT_USERNAME -p $MONGO_INITDB_ROOT_PASSWORD <<EOF
use production
db.createUser({
    user:   '$MONGO_USER',
    pwd:    '$MONGO_PASS',
    roles:  [{
        role: "readWrite",
        db: "production"
    }]
})

use dev
db.createUser({
    user:   '$MONGO_USER',
    pwd:    '$MONGO_PASS',
    roles: [{ 
        role: "readWrite",
        db: "dev"
    }]
})

use test
db.createUser({
    user:   '$MONGO_USER',
    pwd:    '$MONGO_PASS',
    roles: [{
        role: "readWrite",
        db: "test"
    }]
})
EOF