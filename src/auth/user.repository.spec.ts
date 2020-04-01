import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { AuthCredentialsDTO } from './dto/auth-credentials.dto';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';

describe('UserRepository', () => {
    let userRepository: UserRepository;
    const mockCredentialsDTO: AuthCredentialsDTO = { username: 'mvillarrealb', password: 'casa1234'};
    beforeEach((async () => {
       const module = await Test.createTestingModule({
            providers: [
                UserRepository,
            ],
        })
        .compile();
       userRepository = module.get<UserRepository>(UserRepository);
    }));

    it('should be defined', () => {
        expect(userRepository).toBeDefined();
    });

    describe('signUp', () => {
        let save;

        beforeEach(() => {
          save = jest.fn();
          userRepository.create = jest.fn().mockReturnValue({ save });
        });

        it('signsup a new user correctly', async () => {
            save.mockResolvedValue(undefined);
            await expect(userRepository.signUp(mockCredentialsDTO)).resolves.not.toThrow();
        });
        it('throw an error when a user exists', async () => {
            save.mockRejectedValue( { code: '23505' });
            await expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(ConflictException);
        });
        it('catchs error when signUp up', async () => {
            save.mockRejectedValue( { code: '9999' });
            await expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(InternalServerErrorException);
        });
    });
    describe('validatePassword', () => {
        it('valid', async () => {
            userRepository.findOne = jest.fn().mockResolvedValue({
                validatePassword: async () => true,
                username: 'username',
            });
            const response = await userRepository.validateUserPassword(mockCredentialsDTO);
            expect(response).toEqual('username');
        });
        it('invalid Password', async () => {
            userRepository.findOne = jest.fn().mockResolvedValue({
                validatePassword: async () => false,
            });
            const response = await userRepository.validateUserPassword(mockCredentialsDTO);
            expect(response).toEqual(null);
        });
    });
});
