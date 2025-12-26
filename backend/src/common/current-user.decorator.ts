import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthenticatedUser = {
  userId: string;
  email: string;
  role: string;
  teamId?: string | null;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request: { user?: unknown } = ctx.switchToHttp().getRequest();
    return request.user as AuthenticatedUser | undefined;
  },
);
