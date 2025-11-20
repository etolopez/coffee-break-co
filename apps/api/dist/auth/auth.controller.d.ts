/**
 * Authentication Controller
 * Handles authentication endpoints (login, signup)
 */
import { AuthService, RegisterDto, LoginDto } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<import("./auth.service").AuthResponse>;
    login(loginDto: LoginDto): Promise<import("./auth.service").AuthResponse>;
}
//# sourceMappingURL=auth.controller.d.ts.map