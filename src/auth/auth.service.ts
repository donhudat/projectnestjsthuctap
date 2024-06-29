import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, note } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from 'argon2';
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {

  }

  async register(authDTO: AuthDTO) {
    const hashedPassword = await argon.hash(authDTO.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: authDTO.email,
          hashedPassword: hashedPassword,
          firstName: '',
          lastName: '',
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          createdAt: true,
        }
      })
      return await this.signJwtToken(user.id, user.email);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException(error.message);
      }
      return {
        error
      }
    }
  }
  async login(authDTO: AuthDTO) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: authDTO.email
      }
    })
    const passwordMatched = await argon.verify(user.hashedPassword, authDTO.password)
    if (!user || !(await argon.verify(user.hashedPassword, authDTO.password))) {
      throw new ForbiddenException('Invalid credentials');
    }
    delete user.hashedPassword;
    return await this.signJwtToken(user.id, user.email);
  }
  async signJwtToken(userID: number, emai: string)
    : Promise<{ accessToken: String }> {
    const payload = {
      sub: userID,
      email: emai
    };
    const jwtString = await this.jwtService.sign(payload, {
      expiresIn: '10m',
      secret: this.configService.get('JWT_SECRET')
    });
    return {
      accessToken: jwtString,
    }
  }
}