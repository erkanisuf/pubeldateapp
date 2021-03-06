const User = require("../models/usersModel");
const bcrypt = require("bcrypt");
const moment = require("moment");
const pool = require("../db");
module.exports = function (app, passport, FacebookStrategy) {
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });

  passport.deserializeUser(async (user, cb) => {
    try {
      const finduser = await User.findByID(user);
      cb(null, finduser.rows[0].user_id);
    } catch (err) {
      console.log(err);
      cb(null, false);
    }
  });

  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FB_CLIENTID,
        clientSecret: process.env.FACEBOOK_CLIENTSECRET,
        callbackURL: "/users/auth/facebook/callback",
        profileFields: [
          "id",
          "displayName",
          "email",
          "birthday",
          "gender",
          // "profileUrl",
          // "name",
          // "displayName",
        ],
      },
      async (accessToken, refreshToken, profile, cb) => {
        console.log(profile);
        const dateBorn = moment(new Date(profile._json.birthday)).format(
          "YYYY/MM/DD"
        );
        console.log(dateBorn);

        const findUser = await User.findByEmail(profile._json.email);

        if (!findUser.rows.length) {
          let hashedPasssword = await bcrypt.hash(profile._json.id, 12);

          const saveFBUSER = await pool.query(
            `WITH ins1 AS(INSERT INTO userstable(username,password,email,created_on,typereg_id)
          VALUES($1,$2,$3,CURRENT_TIMESTAMP,$4)
         RETURNING user_id)
            INSERT INTO profile (userlog_id, age,fullname)
            SELECT user_id, $5,$6 FROM ins1
            RETURNING *`,
            [
              hashedPasssword,
              hashedPasssword,
              profile._json.email,
              2, // this 2 means its facebook made in DB

              dateBorn,
              profile._json.name,
            ]
          );

          const returnvalue = saveFBUSER.rows[0].userlog_id;
          return cb(null, returnvalue);
        } else {
          const checkUsername = await bcrypt.compareSync(
            profile._json.id,
            findUser.rows[0].username
          );
          const checkPassword = await bcrypt.compareSync(
            profile._json.id,
            findUser.rows[0].password
          );
          console.log(Boolean(checkUsername, checkPassword));
          if (!checkPassword || !checkUsername) {
            return cb(null, false);
          }
          return cb(null, findUser.rows[0].user_id);
        }
      }
    )
  );
};
