import { AccountModel } from "@/domain/models/account";
import { AddAccount, AddAccountModel } from "@/domain/usecases/add-account";
import { InvalidParamError } from "../errors/invalid-param-error";
import { MissingParamError } from "../errors/missing-param-errors";
import { ServerError } from "../errors/server-error";
import { EmailValidator } from "../protocols/email-validator";
import { SignUpController } from "./signup";

interface SutTypes {
    sut: SignUpController
    emailValidatorStub: EmailValidator
    addAccountStub: AddAccount
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator{
        isValid(email: string): boolean {
            return true;
        };
    }
    return new EmailValidatorStub();
}

const makeAddAccount = (): AddAccount => {
    class AddAccountStub implements AddAccount{
        async add(account: AddAccountModel): Promise<AccountModel> {
            const fakeAccount = {
                id:'valid_id',
                name:'valid_name',
                email:'valid_mail@mail.com',
                password: 'valid_password'
            }
            return new Promise(resolve => resolve(fakeAccount));
        }
    }
    return new AddAccountStub();
}


const makeSut = (): SutTypes => {
    const emailValidatorStub  = makeEmailValidator();
    const addAccountStub = makeAddAccount();
    const sut = new SignUpController(emailValidatorStub, addAccountStub);
    return {
        sut,
        emailValidatorStub,
        addAccountStub
    }
}


describe('SignUp Controller', () => {

    test('should return an 400 error if no email is provided',async () => {

        const {sut}  =  makeSut();

        const req = {
            body: {
                name: "joao",
                password: "password",
                passwordConfirmation: "password"
            }
        }

        const response = await  sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError("email"));

    });


    test('should return an 400 error if no name is provided',async () => {

        const {sut}= makeSut();

        const req = {
            body: {
                email: "jon@mail.com",
                password: "password",
                passwordConfirmation: "password"
            }
        }

        const response = await sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError('name'));

    });

    test('should return an 400 error if no password is provided', async () => {

        const {sut} = makeSut();

        const req = {
            body: {
                email: "jon@mail.com",
                name: "name",
                passwordConfirmation: "password"
            }
        }

        const response = await sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError('password'));

    });

    test('should return an 400 error if no password confirmation is provided', async() => {

        const {sut} = makeSut();
        const req = {
            body: {
                email: "jon@mail.com",
                name: "name",
                password: "password"
            }
        }

        const response = await sut.handle(req);

        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new MissingParamError('passwordConfirmation'));

    });

    test('should return an 400 error if an invalid email is provided', async () => {
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

        const response = await sut.handle(req);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new InvalidParamError('email'));
    });

    test('should return an 400 error if password confirmations fails', async () => {
        const {sut, emailValidatorStub} = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);
        const req = {
            body: {
                email: 'mail@mail.com',
                name: 'john',
                password: 'password',
                passwordConfirmation: 'wrong_password'
            }
        }

        const response = await sut.handle(req);
        expect(response.statusCode).toBe(400);
        expect(response.body).toEqual(new InvalidParamError('passwordConfirmation'));
    });

    test('should call emailValidator with correct email', async () => {

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

        await sut.handle(req);
        expect(isValidSpy).toHaveBeenCalledWith('mail@mail.com');
    
    });

    test('should return 500 status code if emailValidator throws',async () => {

        const {sut, emailValidatorStub} = makeSut();

        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new ServerError();
        });

        const req = {
            body: {
                email: 'mail@mail.com',
                name: 'john',
                password: 'password',
                passwordConfirmation: 'password'
            }
        }

        const response = await sut.handle(req);
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual(new ServerError());
    });

    test('should call addAccount with correct values',async () => {

        const {sut, addAccountStub} = makeSut();

        const addAccountSpy = jest.spyOn(addAccountStub, 'add');

        
        const req = {
            body: {
                email: 'mail@mail.com',
                name: 'john',
                password: 'password',
                passwordConfirmation: 'password'
            }
        }

        await sut.handle(req);
        expect(addAccountSpy).toHaveBeenLastCalledWith({
                email: 'mail@mail.com',
                name: 'john',
                password: 'password',

        })
    
    });

    test('should return 500 status code if addAccount throws',async () => {

        const {sut, addAccountStub} = makeSut();

        jest.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
            throw new ServerError();
        });

        const req = {
            body: {
                email: 'mail@mail.com',
                name: 'john',
                password: 'password',
                passwordConfirmation: 'password'
            }
        }

        const response = await sut.handle(req);
        expect(response.statusCode).toBe(500);
        expect(response.body).toEqual(new ServerError());
    });

    test('should return an 200 if valid data is provided', async () => {
        
        const {sut} = makeSut();
        const req = {
            body: {
                email: 'valid_mail@mail.com',
                name: 'john',
                password: 'password',
                passwordConfirmation: 'password'
            }
        }

        const response =  await sut.handle(req);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
                id:'valid_id',
                name:'valid_name',
                email:'valid_mail@mail.com',
                password: 'valid_password'
        });
    });

  


})
