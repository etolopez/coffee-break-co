import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { addUser, findUserByEmail, getUserCount } from '../users';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role, companyName } = body;

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prevent admin role creation
    if (role === 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin role cannot be created through signup' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (role === 'seller' && !companyName) {
      return NextResponse.json(
        { success: false, error: 'Company name is required for sellers' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: (getUserCount() + 1).toString(),
      email,
      password: hashedPassword,
      name,
      role,
      companyName: role === 'seller' ? companyName : undefined,
      sellerId: role === 'seller' ? (getUserCount() + 1).toString() : undefined,
      createdAt: new Date().toISOString()
    };

    // Add user to shared storage
    addUser(newUser);

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
