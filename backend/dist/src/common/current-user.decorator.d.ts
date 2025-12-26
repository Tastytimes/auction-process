export type AuthenticatedUser = {
    userId: string;
    email: string;
    role: string;
    teamId?: string | null;
};
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
