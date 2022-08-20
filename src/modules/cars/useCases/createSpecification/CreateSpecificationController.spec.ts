import { hash } from 'bcrypt';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { app } from '../../../../shared/infra/http/server';
import createConnection from '../../../../shared/infra/typeorm';

let connection: Connection;

describe('Create Specification Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidv4();
    const password = await hash('admin', 8);

    await connection.query(
      `INSERT INTO users(id, name, email, password, "isAdmin", driver_license, created_at)
      VALUES('${id}', 'Admin', 'admin@rentx.com.br', '${password}', true, 'XXXXXXX', now())
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a new specification', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const responseSpecification = await request(app)
      .post('/specifications')
      .send({
        name: 'New Specification',
        description: 'specification',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseSpecification.status).toBe(201);
    expect(responseSpecification.body).toHaveProperty('id');
  });

  it('should not be able to create specification with same name', async () => {
    const responseToken = await request(app).post('/sessions').send({
      email: 'admin@rentx.com.br',
      password: 'admin',
    });

    const { token } = responseToken.body;

    const responseSpecification = await request(app)
      .post('/specifications')
      .send({
        name: 'New Specification',
        description: 'sspecification with same name',
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseSpecification.status).toBe(400);
  });
});
