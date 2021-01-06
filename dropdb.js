const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/test').then((v) => {
    v.connection.dropDatabase(() => process.exit(0))
})