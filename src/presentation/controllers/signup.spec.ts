import { InvalidParamError } from "../errors/invalid-param-error";
import { MissingParamError } from "../errors/missing-param-errors";
import { EmailValidator } from "../protocols/email-validator";
import { SignUpController } from "./signup";

interface SutTypes {
    sut: SignUpController
    emailValidatorStub: EmailValidator
}

const makeSut = (): SutTypes => {
    class EmailValidatorStub implements EmailValidator{
        isValid(email: string): boolean {
            return true;
        };

    }
    const emailValidatorStub  = new EmailValidatorStub();
    const sut = new SignUpController(emailValidatorStub);
    return {
        sut,
        emailValidatorStub
    }
}


describe('SignUp Controller', () => {

    test('should return an 400 error if no email is provided', () => {

        const {sut}  =  makeSut();

        const req = {
            body: {
                name: "joao",
                password: "password",
                passwordConfirmation: "password"
            }
        }

        const response = sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError("email"));

    });


    test('should return an 400 error if no name is provided', () => {

        const {sut}= makeSut();

        const req = {
            body: {
                email: "jon@mail.com",
                password: "password",
                passwordConfirmation: "password"
            }
        }

        const response = sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError('name'));

    });

    test('should return an 400 error if no password is provided', () => {

        const {sut} = makeSut();

        const req = {
            body: {
                email: "jon@mail.com",
                name: "name",
                passwordConfirmation: "password"
            }
        }

        const response = sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError('password'));

    });

    test('should return an 400 error if no password confirmation is provided', () => {

        const {sut} = makeSut();
        const req = {
            body: {
                email: "jon@mail.com",
                name: "name",
                password: "password"
            }
        }

        const response = sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError('passwordConfirmation'));

    });

    test('should return an 400 error if an invalid email is provided', () => {
        const {sut, emailValidatorStub} = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);
        const req = {
            body: {
                email: 'invalid_mail@mail.com',
                name: 'john',
                password: 'password',
                passwordConfirmation: 'password'
            }
        }

        const response = sut.handle(req);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new InvalidParamError('email'));
    });

    test('should call emailValidator with correct email', () => {

        const {sut, emailValidatorStub} = makeSut();

        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

        
        const req = {
            body: {
                email: 'mail@mail.com',
                name: 'john',
                password: 'password',
                passwordConfirmation: 'password'
            }
        }

        sut.handle(req);
        expect(isValidSpy).toHaveBeenCalledWith('mail@mail.com');
    
    })
})
