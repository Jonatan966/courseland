import { AppError } from '../../../../errors/AppError';
import { ICreateUserDTO } from '../../dtos/ICreateUserDTO';
import { UsersRepositoryInMemory } from '../../repositories/in-memory/UsersRepositoryInMemory';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;

describe('Authenticate user', () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      driver_license: '000123',
      email: 'user@test.com',
      password: '1234',
      name: 'User Test',
    };

    await createUserUseCase.execute(user);

    const authPayload = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(authPayload).toHaveProperty('token');
    expect(authPayload).toHaveProperty('user');
  });

  it('should not be able to authenticate a nonexistent user', () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: 'nonexistent@email.com',
        password: '123',
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to authenticate with incorrect password', () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        driver_license: '123456',
        email: 'user@user.com',
        password: '1234',
        name: 'User Test Error',
      };

      await createUserUseCase.execute(user);

      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'incorrect',
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
