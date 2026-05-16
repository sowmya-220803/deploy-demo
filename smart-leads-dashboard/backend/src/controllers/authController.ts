import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import { z } from 'zod';

const registerSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['Admin', 'Sales User']).optional()
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const { name, email, password, role } = validatedData;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Sales User'
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user._id as any).toString()),
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: (error as any).errors[0].message });
        } else {
            res.status(400).json({ message: error.message });
        }
    }
};

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const authUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user._id as any).toString()),
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: (error as any).errors[0].message });
        } else {
            res.status(401).json({ message: error.message || 'Invalid Credentials' });
        }
    }
};
