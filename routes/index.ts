import express, { Request, Response } from "express";
import executeDBScript from "../connectDB";
import DBConnect from "../connectDB";
const router = express.Router();
// Search
router.get("/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  const db = new DBConnect();
  const result = await db
    .connectDB()
    .then(async (res) => {
      return res.queryScript(`
    SELECT t0.username, t0.fullname, t0.role, t0.activeyn, array_agg(json_build_object('id', t1.id, 'project_name', t1.project_name)) as project
    FROM users_jwat as t0
    JOIN projects_jwat as t1 ON t0.username = t1.username
    WHERE t0.username = '${username}'
    GROUP BY t0.username, t0.fullname, t0.role, t0.activeyn`);
    })
    .then((res) => {
      res.disconnectDB();
      return { message: "success", data: res.getResult() };
    })
    .catch((err) => ({ message: err, data: [] }));
  res.send(result);
});
// Insert
router.post("/", async (req: Request, res: Response) => {
  const body = req.body;
  const user_project = body.project.map(
    (p: string) => `('${body.username}', '${p}')`
  );
  const db = new DBConnect();
  const result = await db
    .connectDB()
    .then(async (res) => {
      return res.queryScript(`
    WITH new_user AS (
      INSERT INTO users_jwat (username, fullname,role, activeyn)
      VALUES ('${body.username}', '${body.fullname}', '${body.role}', true)
    ON CONFLICT (username) DO NOTHING
    )
      INSERT INTO projects_jwat (username, project_name)
      VALUES ${user_project.join(",")}
    
    `);
    })
    .then((res) => {
      res.disconnectDB();
      return { message: "success" };
    })
    .catch(() => ({ message: "fail" }));

  return res.send(result);
});
// Update
router.patch("/", async (req: Request, res: Response) => {
  const body = req.body;
  const user_project = body.project.map(
    (p: { [id: string]: [project_name: string] }) =>
      `('${p.id}','${body.username}', '${p.project_name}')`
  );

  const db = new DBConnect();
  const result = await db
    .connectDB()
    .then(async (res) => {
      return res.queryScript(`
    WITH new_user AS (
      INSERT INTO users_jwat (username, fullname,role, activeyn)
      VALUES ('${body.username}', '${body.fullname}', '${body.role}', ${
        body.activeyn
      })
    ON CONFLICT (username) DO UPDATE SET fullname = excluded.fullname, role = excluded.role, activeyn   = excluded.activeyn
    )
      INSERT INTO projects_jwat (id,username, project_name)
      VALUES ${user_project.join(",")}
      ON CONFLICT (id) DO UPDATE SET project_name = excluded.project_name
    
    `);
    })
    .then((res) => {
      res.disconnectDB();
      return { message: "success" };
    })
    .catch(() => ({ message: "fail" }));
  return res.send(result);
});
// Delete
router.delete("/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  const db = new DBConnect();
  const result = await db
    .connectDB()
    .then(async (res) => {
      return res.queryScript(`With detele_project AS (
    DELETE FROM projects_jwat WHERE username = '${username}'

  )
    DELETE FROM users_jwat WHERE username = '${username}'
  
  `);
    })
    .then((res) => {
      res.disconnectDB();
      return { message: "success" };
    })
    .catch(() => ({ message: "fail" }));
  return res.send(result);
});

export default router;
