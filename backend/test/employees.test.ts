import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { createTestApp, createUserAndToken, resetDb } from './helpers.js';

describe('Employees', () => {
  let app: FastifyInstance;
  let adminToken: string;
  let employeeToken: string;
  let employeeId: string;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb(app);
    const admin = await createUserAndToken(app, {
      email: 'admin@empresa.com',
      password: 'clave-admin-123',
      name: 'Admin',
      role: 'admin',
    });
    adminToken = admin.token;
    const employee = await createUserAndToken(app, {
      email: 'ana@empresa.com',
      password: 'clave-segura-123',
      name: 'Ana López',
      role: 'employee',
    });
    employeeId = employee.id;
    employeeToken = employee.token;
  });

  const auth = (token: string) => ({ authorization: `Bearer ${token}` });

  describe('GET /api/v1/employees', () => {
    it('admin obtiene solo usuarios con rol employee, sin contraseñas', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/employees',
        headers: auth(adminToken),
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({ email: 'ana@empresa.com', role: 'employee' });
      expect(body[0].password).toBeUndefined();
      expect(body[0].password_hash).toBeUndefined();
    });

    it('un empleado recibe 403', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/employees',
        headers: auth(employeeToken),
      });
      expect(res.statusCode).toBe(403);
      expect(res.json().error.code).toBe('FORBIDDEN');
    });

    it('sin token recibe 401', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/employees' });
      expect(res.statusCode).toBe(401);
    });
  });

  describe('POST /api/v1/employees', () => {
    const newEmployee = {
      name: 'Carlos Ruiz',
      email: 'carlos@empresa.com',
      password: 'password-de-carlos',
      department: 'IT',
      position: 'Desarrollador',
    };

    it('admin crea un empleado; la contraseña queda hasheada con bcrypt', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/employees',
        headers: auth(adminToken),
        payload: newEmployee,
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body).toMatchObject({
        name: 'Carlos Ruiz',
        email: 'carlos@empresa.com',
        role: 'employee',
        department: 'IT',
        position: 'Desarrollador',
      });
      expect(body.password).toBeUndefined();
      expect(body.password_hash).toBeUndefined();

      const { rows } = await app.pg.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [body.id]
      );
      expect(rows[0].password_hash).not.toBe(newEmployee.password);
      expect(await bcrypt.compare(newEmployee.password, rows[0].password_hash)).toBe(true);
    });

    it('no permite crear con rol admin aunque se envíe role en el body', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/employees',
        headers: auth(adminToken),
        payload: { ...newEmployee, role: 'admin' },
      });

      expect(res.statusCode).toBe(201);
      expect(res.json().role).toBe('employee');
    });

    it('devuelve 409 con email duplicado (sin distinguir mayúsculas)', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/employees',
        headers: auth(adminToken),
        payload: { ...newEmployee, email: 'ANA@empresa.com' },
      });

      expect(res.statusCode).toBe(409);
      expect(res.json().error.code).toBe('CONFLICT');
    });

    it('devuelve 400 con contraseña de menos de 8 caracteres', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/employees',
        headers: auth(adminToken),
        payload: { ...newEmployee, password: 'corta' },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('VALIDATION_ERROR');
    });

    it('un empleado recibe 403', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/employees',
        headers: auth(employeeToken),
        payload: newEmployee,
      });
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/v1/employees/:id', () => {
    it('admin puede ver cualquier empleado', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(adminToken),
      });
      expect(res.statusCode).toBe(200);
      expect(res.json().email).toBe('ana@empresa.com');
    });

    it('un empleado puede verse a sí mismo', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(employeeToken),
      });
      expect(res.statusCode).toBe(200);
    });

    it('un empleado NO puede ver a otro', async () => {
      const otro = await createUserAndToken(app, {
        email: 'otro@empresa.com',
        password: 'clave-de-otro-123',
      });
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/employees/${otro.id}`,
        headers: auth(employeeToken),
      });
      expect(res.statusCode).toBe(403);
    });

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/employees/00000000-0000-0000-0000-000000000000',
        headers: auth(adminToken),
      });
      expect(res.statusCode).toBe(404);
    });

    it('devuelve 400 con id que no es uuid', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/employees/no-es-uuid',
        headers: auth(adminToken),
      });
      expect(res.statusCode).toBe(400);
    });
  });

  describe('PATCH /api/v1/employees/:id', () => {
    it('admin actualiza campos del empleado', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(adminToken),
        payload: { department: 'Marketing', position: 'Líder' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toMatchObject({ department: 'Marketing', position: 'Líder' });
    });

    it('si se envía password, se re-hashea', async () => {
      await app.inject({
        method: 'PATCH',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(adminToken),
        payload: { password: 'nueva-clave-larga' },
      });

      const { rows } = await app.pg.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [employeeId]
      );
      expect(await bcrypt.compare('nueva-clave-larga', rows[0].password_hash)).toBe(true);
    });

    it('devuelve 400 con body vacío', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(adminToken),
        payload: {},
      });
      expect(res.statusCode).toBe(400);
    });

    it('un empleado recibe 403', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(employeeToken),
        payload: { name: 'Hackeado' },
      });
      expect(res.statusCode).toBe(403);
    });

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'PATCH',
        url: '/api/v1/employees/00000000-0000-0000-0000-000000000000',
        headers: auth(adminToken),
        payload: { name: 'Nadie' },
      });
      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/v1/employees/:id', () => {
    it('admin elimina un empleado', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(adminToken),
      });
      expect(res.statusCode).toBe(204);

      const { rows } = await app.pg.query('SELECT id FROM users WHERE id = $1', [
        employeeId,
      ]);
      expect(rows).toHaveLength(0);
    });

    it('un empleado recibe 403', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: `/api/v1/employees/${employeeId}`,
        headers: auth(employeeToken),
      });
      expect(res.statusCode).toBe(403);
    });

    it('devuelve 404 con id inexistente', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/api/v1/employees/00000000-0000-0000-0000-000000000000',
        headers: auth(adminToken),
      });
      expect(res.statusCode).toBe(404);
    });
  });
});
