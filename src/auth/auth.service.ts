import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2'
import { PrismaClientKnownRequestError } from "@prisma/client/runtime";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async signup(dto: AuthDto) { 
        // Generate the password hash
        const hash = await argon.hash(dto.password);

        // Save the new user in the database
        try {
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash
                }
            })
    
            delete user.hash
    
            // Return the saved user
            return user;
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ForbiddenException('Credentials taken')
                }
            }
        }
        
    }

    signin() {
        return { msg: 'I have signed in' }
    }
}
