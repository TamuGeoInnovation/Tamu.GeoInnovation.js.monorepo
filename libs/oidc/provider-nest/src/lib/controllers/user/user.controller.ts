import { Controller, Get, Post, Param } from '@nestjs/common';

@Controller('user')
export class UserController {

    @Get()
    async getAuth() {
        return "/user/auth";
    }

    @Get()
    async getRegister() {
        
    }

}
