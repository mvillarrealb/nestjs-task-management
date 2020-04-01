import { User } from './user.entity';
import * as bcrypt from 'bcryptjs';

describe('User Entity', () => {
    let user: User;
    beforeEach(() => {
        user = new User({
            username: 'jsmiedo',
            password: 'password',
            salt: 'salt',
        });
    });
    describe('validatePassword', () => {
        it('returns true as password is valid', async () => {
            jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => 'password');
            const result = await user.validatePassword('password');
            expect(result).toEqual(true);
        });
        it('returns false as password is invalid', async () => {
            jest.spyOn(bcrypt, 'hash').mockImplementationOnce(async () => 'noticual');
            const result = await user.validatePassword('password');
            expect(result).toEqual(false);
        });
    });

});
