const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const User = require("../models/User");

// SIGNUP CONTROLLER
const signup = async (req, res) => {
  const { name, username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });

    if (existingUser)
      return res.status(409).json({
        message:
          "User already exists. Please login to gain access to your account.",
      });

    const existingEmail = await User.findOne({ email });

    if (existingEmail)
      return res.status(409).json({
        message:
          "A user with the same email already exists. Use another email.",
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    const tokenKey = process.env.TOKEN_KEY;
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      tokenKey,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User has been registered!",
      token: token,
      user: newUser,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "An error occurred while registering the user. Try again later.",
    });
  }
};

// LOGIN CONTROLLER
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({
        message: "Wrong Password.",
      });
    }

    const date = new Date();
    const time = `${date.getHours()}:${date.getMinutes()}`;

    console.log(`Logged in as ${user.name} at ${time}`);

    const tokenKey = process.env.TOKEN_KEY;
    const token = jwt.sign(
      { id: user._id, username: user.username },
      tokenKey,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: `Logged in successfully as ${user.name}`,
      token: token,
      user: user,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Could not login!. Try again later." });
  }
};

// CHANGE PASSWORD CONTROLLER
const changePassword = async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user)
      return res.status(500).json({
        message: "Cannot change password at the moment. Try again later.",
      });

    const isValidPassword = await bcrypt.compare(oldPassword, user.password);

    if (!isValidPassword)
      return res.status(400).json({
        message: "Wrong Password",
      });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Cannot change password at the moment. Try again later.",
    });
  }
};

// FORGOT PASSWORD CONTROLLER
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({
        message: "User not found!",
      });

    const tokenKey = process.env.TOKEN_KEY;
    const resetToken = jwt.sign(
      { id: user._id, username: user.username },
      tokenKey,
      { expiresIn: "10m" }
    );

    const appLink = process.env.APP_LINK;
    const resetLink = `${appLink}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Request",
      text: `Reset your password using this link (valid for 10 minutes):\n\n${resetLink}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: `Mail sent to ${user.name}'s email, ${user.email} successfully.`,
      token: resetToken,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Something unexpected happened. Please try again later.",
    });
  }
};

// RESET PASSWORD CONTROLLER
const resetPassword = async (req, res) => {
  try {
    const token = decodeURIComponent(req.query.token);
    const { newPassword } = req.body;

    if (!token)
      return res.status(400).json({
        message: "A token is required to recover the account.",
      });

    if (!newPassword)
      return res.status(400).json({
        message: "A new password is required to recover the account.",
      });

    const tokenKey = process.env.TOKEN_KEY;
    let decoded;
    try {
      decoded = jwt.verify(token, tokenKey);
    } catch (err) {
      res.status(400).json({
        message: "Token is either invalid or expired",
      });
    }

    const user = await User.findOne({ username: decoded.username });
    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated.",
    });
  } catch (err) {
    res.status(500).json({
      message: "An error occurred. Try again later.",
    });
  }
};

module.exports = {
  login,
  signup,
  changePassword,
  forgotPassword,
  resetPassword,
};
