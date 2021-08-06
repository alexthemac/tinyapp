//Check if email is already in user "database"
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (email === database[user]['email']) {
      return user;
    }
  }
};

module.exports = { getUserByEmail };

//For future?
// module.exports = { generateRandomString, getUserByEmail, hashedPasswordLookup, userIDLookup, filterURLDatabase }