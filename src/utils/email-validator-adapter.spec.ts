import { EmailValidatorAdapter } from "./email-validator";
import validator from 'validator';

jest.mock('validator', () => ({
    isEmail (): boolean{
        return true;
    }
}))

const makeSut = (): EmailValidatorAdapter =>  {
    return new EmailValidatorAdapter();
}

describe('EmailValidator Adapter', () => {
    
    test('Should return false if validator returns false',() => {
            
        const sut = makeSut();
        jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false);
        const response = sut.isValid('invalid@mail.com');

        expect(response).toBe(false);
    });

    test('Should return true if validator returns true',() => {
            
        const sut = makeSut();
        const response = sut.isValid('valid_mail@mail.com');

        expect(response).toBe(true);
    });

    test('Should call validator.isEmail with correct values', () => {

        const sut = makeSut();
        const validatorSpy = jest.spyOn(validator, 'isEmail');

        sut.isValid('mail@mail.com');

        expect(validatorSpy).toHaveBeenCalledWith('mail@mail.com');
    });
})