const dataSource = require('../data-source');
const bcrypt = require('bcrypt');
const UserRepo = dataSource.getRepository('User');
const jwt = require('jsonwebtoken');
const { secret, expiresIn } = require('../config/jwtConfig');
// 注册用户
exports.register = async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await UserRepo.findOneBy({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = UserRepo.create({
      username,
      password_hash: hashedPassword,
      balance: 1000000.00,//初始余额
      created_at: new Date(),
    });

    const savedUser = await UserRepo.save(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: savedUser.user_id, username: savedUser.username },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// 登录用户
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await UserRepo.findOneBy({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { user_id: user.user_id, username: user.username },
      secret,
      { expiresIn }
    );

    res.status(200).json({
      message: 'Login successful',
      user: { id: user.user_id, username: user.username },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

