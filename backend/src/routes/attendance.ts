import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { conflict, forbidden, notFound } from '../lib/errors.js';
import type { AttendanceRecord } from '../types.js';

const ListQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha esperado: YYYY-MM-DD')
    .optional(),
  employee_id: z.string().uuid().optional(),
});

const IdParams = z.object({ id: z.string().uuid() });

const isUniqueViolation = (err: unknown): boolean =>
  typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505';

export const attendanceRoutes: FastifyPluginAsync = async (app) => {
  const employeeOnly = {
    preHandler: [
      app.authenticate,
      async (request: Parameters<typeof app.authenticate>[0]) => {
        if (request.currentUser.role !== 'employee') {
          throw forbidden('Solo los empleados fichan entrada y salida');
        }
      },
    ],
  };

  const tz = () => app.config.appTimezone;

  app.get('/attendance', { preHandler: [app.authenticate] }, async (request) => {
    const query = ListQuerySchema.parse(request.query);
    const conditions: string[] = [];
    const values: unknown[] = [];
    const add = (sql: string, value: unknown) => {
      values.push(value);
      conditions.push(sql.replace('?', `$${values.length}`));
    };

    if (request.currentUser.role === 'employee') {
      add('employee_id = ?', request.currentUser.id);
    } else if (query.employee_id) {
      add('employee_id = ?', query.employee_id);
    }
    if (query.date) {
      values.push(tz());
      const tzParam = `$${values.length}`;
      values.push(query.date);
      conditions.push(`(check_in AT TIME ZONE ${tzParam})::date = $${values.length}::date`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const { rows } = await app.pg.query<AttendanceRecord>(
      `SELECT * FROM attendance ${where} ORDER BY check_in DESC`,
      values
    );
    return rows;
  });

  app.post('/attendance/check-in', employeeOnly, async (request, reply) => {
    const { id: employeeId, name } = request.currentUser;

    const { rows: existing } = await app.pg.query(
      `SELECT id FROM attendance
       WHERE employee_id = $1
       AND (check_in AT TIME ZONE $2)::date = (now() AT TIME ZONE $2)::date`,
      [employeeId, tz()]
    );
    if (existing.length > 0) {
      throw conflict('Ya has fichado la entrada hoy');
    }

    try {
      const { rows } = await app.pg.query<AttendanceRecord>(
        `INSERT INTO attendance (employee_id, employee_name)
         VALUES ($1, $2)
         RETURNING *`,
        [employeeId, name]
      );
      return reply.code(201).send(rows[0]);
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw conflict('Tienes un fichaje abierto pendiente de cerrar');
      }
      throw err;
    }
  });

  app.post('/attendance/check-out', employeeOnly, async (request) => {
    const { rows } = await app.pg.query<AttendanceRecord>(
      `UPDATE attendance SET check_out = now()
       WHERE employee_id = $1
       AND check_out IS NULL
       AND (check_in AT TIME ZONE $2)::date = (now() AT TIME ZONE $2)::date
       RETURNING *`,
      [request.currentUser.id, tz()]
    );
    if (!rows[0]) {
      throw conflict('No hay un fichaje de entrada abierto hoy');
    }
    return rows[0];
  });

  app.post(
    '/attendance/:id/overtime/request',
    { preHandler: [app.authenticate] },
    async (request) => {
      const { id } = IdParams.parse(request.params);

      const { rows } = await app.pg.query<AttendanceRecord>(
        'SELECT * FROM attendance WHERE id = $1',
        [id]
      );
      const record = rows[0];
      if (!record) throw notFound('Registro de asistencia no encontrado');
      if (record.employee_id !== request.currentUser.id) {
        throw forbidden('Solo puedes solicitar horas extra sobre tu propio fichaje');
      }
      if (record.overtime_requested) {
        throw conflict('Las horas extra ya fueron solicitadas para este registro');
      }

      const { rows: updated } = await app.pg.query<AttendanceRecord>(
        'UPDATE attendance SET overtime_requested = true WHERE id = $1 RETURNING *',
        [id]
      );
      await app.pg.query(
        `INSERT INTO notifications (employee_id, employee_name, attendance_id, message, type)
         VALUES ($1, $2, $3, $4, 'overtime_request')`,
        [
          record.employee_id,
          record.employee_name,
          id,
          'Solicita autorización para trabajar horas extras',
        ]
      );
      return updated[0];
    }
  );

  app.post(
    '/attendance/:id/overtime/approve',
    { preHandler: [app.authenticate, app.requireAdmin] },
    async (request) => {
      const { id } = IdParams.parse(request.params);

      const { rows } = await app.pg.query<AttendanceRecord>(
        'SELECT * FROM attendance WHERE id = $1',
        [id]
      );
      const record = rows[0];
      if (!record) throw notFound('Registro de asistencia no encontrado');
      if (!record.overtime_requested) {
        throw conflict('El registro no tiene horas extra solicitadas');
      }

      const { rows: updated } = await app.pg.query<AttendanceRecord>(
        'UPDATE attendance SET overtime_approved = true WHERE id = $1 RETURNING *',
        [id]
      );
      await app.pg.query(
        `DELETE FROM notifications WHERE attendance_id = $1 AND type = 'overtime_request'`,
        [id]
      );
      return updated[0];
    }
  );
};
