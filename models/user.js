//==============================================================================
//
//
//	This file defines our schema for storing users in mongodb.
//
//
//
//==============================================================================
// user.js
//==============================================================================
var mongoose = require('mongoose');
//==============================================================================


var userSchema = new mongoose.Schema({
  full_name : String,
  username : String,
	email: String,
	password: String
});


//==============================================================================
var User = mongoose.model('User', userSchema);
module.exports = User; // handle to DB.
//==============================================================================
