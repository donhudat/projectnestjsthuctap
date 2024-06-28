import { ForbiddenException, Injectable } from "@nestjs/common";
import { User, note } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { AuthDTO } from "./dto";
import * as argon from 'argon2';
@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {

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
      return user;
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
    return "login success";
  }
}