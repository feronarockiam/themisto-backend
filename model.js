const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user_data = new Schema({
    UserName: {
        type: String
    },
    Password: {
        type: String
    },
    LeadId: {
        type: Number
    }
});

const user_cred = mongoose.model("user_cred", user_data);
module.exports = user_cred;
