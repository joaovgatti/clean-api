import { MissingParamError } from "../errors/missing-param-errors";
import { SignUpController } from "./signup";


describe('SignUp Controller', () => {

    test('should return an 400 error if no email is provided', () => {

        const sut = new SignUpController();

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

        const sut = new SignUpController();

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

        const sut = new SignUpController();

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

        const sut = new SignUpController();

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

    })
})
