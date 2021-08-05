

//Check if email is already in user "database"
const getUserByEmail = function(email, database) {
  for (user in database) {
    if (email === database[user]['email']) {
      return user;
    }
  }
  return false;
};

//For future?
// module.exports = { generateRandomString, getUserByEmail, hashedPasswordLookup, userIDLookup, filterURLDatabase }

module.exports = { getUserByEmail };
