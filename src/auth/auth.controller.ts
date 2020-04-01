import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}
    @Post('/signup')
    signUp(@Body(ValidationPipe) authCredentiaslDTO: AuthCredentialsDTO): Promise<void> {
        return this.authService.signUp(authCredentiaslDTO);
    }
    @Post('/signin')
    signIn(@Body(ValidationPipe) authCredentiaslDTO: AuthCredentialsDTO): Promise<{ accessToken: string }> {
        return this.authService.signIn(authCredentiaslDTO);
    }
}
