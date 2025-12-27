/**
 * Auth Service
 * Regras de negócio para autenticação e autorização
 */
import { RegisterInput, LoginInput } from '../lib/schemas';
export declare class AuthService {
    /**
     * Registra um novo psicólogo no sistema
     */
    register(data: RegisterInput): Promise<{
        accessToken: string;
        refreshToken: string;
        psychologist: {
            name: string;
            id: string;
            email: string;
            crp: string;
            planType: import("../generated/prisma").$Enums.PlanType;
            createdAt: Date;
        };
    }>;
    /**
     * Realiza login de um psicólogo
     */
    login(data: LoginInput): Promise<{
        accessToken: string;
        refreshToken: string;
        psychologist: {
            id: string;
            email: string;
            name: string;
            crp: string;
            planType: import("../generated/prisma").$Enums.PlanType;
        };
    }>;
    /**
     * Gera Access Token e Refresh Token
     */
    private generateTokens;
    /**
     * Renova o Access Token usando o Refresh Token
     */
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}
//# sourceMappingURL=AuthService.d.ts.map