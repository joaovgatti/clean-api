import { rejects } from 'assert/strict';
import bcrypt from 'bcrypt';
import { resolve } from 'path/posix';
import { BcryptAdapter } from './bcrypter-adapter';

describe('bcrypt adapter', () => {

    test('shoud call bcrypter with correct value', async () => {
        
        const salt = 12;

        const sut = new BcryptAdapter(salt);

        const bcrypterSpy = jest.spyOn(bcrypt, 'hash');

        await sut.encrypt('any_value');

        expect(bcrypterSpy).toHaveBeenCalledWith('any_value', salt);
    });

    test('should return encrypted value on success', async () => {
        
        const salt = 12;

        jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
            return new Promise(resolve => resolve('hash')); 
        });

        const sut = new BcryptAdapter(salt);

        const response = await sut.encrypt('any_value');

        expect(response).toBe('hash');
    });

    test('should throw is bcrypt throws', async () => {
        
        const sut = new BcryptAdapter(12);

        jest.spyOn(bcrypt, 'hash').mockImplementationOnce(() => {
            throw new Error();
        })

        const response = sut.encrypt('any_value');

        await expect(response).rejects.toThrow();
    });
})

