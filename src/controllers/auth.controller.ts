import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
        res.status(400).json({ message: 'Email already in use' });
        return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({ message: 'User created', userId: user._id });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err });
    return;
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid){
        res.status(401).json({ message: 'Invalid password' });
        return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    res.json({ token, userId: user._id, name: user.name });
    return;
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err });
    return;
  }
};
