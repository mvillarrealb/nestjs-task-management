import { JwtStrategy } from "./jwt.strategy";
import { Test } from "@nestjs/testing";
import { UserRepository } from "./user.repository";
import { User } from "./user.entity";
import { UnauthorizedException } from "@nestjs/common";

const mockUserRepository = () => ({
    findOne: jest.fn(),
});

describe('JwtStrategy', () => {
    let jwtStrategy: JwtStrategy;
    let userRepository;
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: UserRepository, useFactory: mockUserRepository },
            ],
        }).compile();
        jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
        userRepository = module.get<UserRepository>(UserRepository);
    });
    it('should be defined', () => {
        expect(jwtStrategy).toBeDefined();
    });
    describe('validate', () => {
        it('validates and returns user payload', async () => {
            const payload = { username: 'testuser' };
            const user = new User({ username: 'tesuser' });
            userRepository.findOne.mockResolvedValue(user);
            const result = await jwtStrategy.validate(payload);
            expect(result).toEqual(user);
            expect(userRepository.findOne).toHaveBeenCalledWith(payload);
        });
        it('throw an unauthorized exception when user is not found', async () => {
            const payload = { username: 'testuser' };
            userRepository.findOne.mockResolvedValue(null);
            expect(jwtStrategy.validate(payload)).rejects.toThrow(UnauthorizedException);
        });
    });
});
