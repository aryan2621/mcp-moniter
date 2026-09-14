import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { MonitoredMcpServer } from "mcp-monitor-local-sdk";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { validateEnv } from "./config/env.js";

type Student = {
  id: string;
  name: string;
  rollNumber: string;
  createdAt: string;
};

type AttendanceStatus = "present" | "absent" | "late";

type AttendanceRecord = {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedAt: string;
};

type Store = {
  students: Student[];
  records: AttendanceRecord[];
};

const StatusSchema = z.enum(["present", "absent", "late"]);
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");
const StoreSchema = z.object({
  students: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      rollNumber: z.string().min(1),
      createdAt: z.string().min(1),
    })
  ),
  records: z.array(
    z.object({
      id: z.string().min(1),
      studentId: z.string().min(1),
      date: DateSchema,
      status: StatusSchema,
      markedAt: z.string().min(1),
    })
  ),
});

const storeFileUrl = new URL("./attendance.json", import.meta.url);
const store: Store = { students: [], records: [] };
let saveQueue: Promise<void> = Promise.resolve();
let persistEnabled = false;

async function loadStore(): Promise<void> {
  try {
    const raw = await readFile(storeFileUrl, "utf8");
    const parsed = StoreSchema.parse(JSON.parse(raw));
    store.students = parsed.students;
    store.records = parsed.records;
    persistEnabled = true;
  } catch (err) {
    const e = err as { code?: unknown };
    if (e && e.code === "ENOENT") {
      persistEnabled = true;
      return;
    }
    persistEnabled = false;
    throw err;
  }
}

function queueSave(): Promise<void> {
  if (!persistEnabled) {
    return Promise.resolve();
  }
  const snapshot: Store = {
    students: [...store.students],
    records: [...store.records],
  };
  saveQueue = saveQueue.then(async () => {
    await writeFile(
      storeFileUrl,
      JSON.stringify(snapshot, null, 2) + "\n",
      "utf8"
    );
  });
  return saveQueue;
}

function findStudent(id: string): Student | undefined {
  return store.students.find((s) => s.id === id);
}

function listStudentsText(): string {
  if (store.students.length === 0) return "No students.";
  return store.students
    .map((s) => `${s.rollNumber}  ${s.name}  (${s.id})`)
    .join("\n");
}

function listRecordsText(records: AttendanceRecord[]): string {
  if (records.length === 0) return "No attendance records.";
  return records
    .map((r) => {
      const student = findStudent(r.studentId);
      const label = student ? `${student.rollNumber} ${student.name}` : r.studentId;
      return `${r.date}  ${r.status.padEnd(7)}  ${label}`;
    })
    .join("\n");
}

async function main(): Promise<void> {
  const env = validateEnv();

  const server = new MonitoredMcpServer(
    { name: "attendance-mcp", version: "0.1.0" },
    {
      serverName: env.MCP_SERVER_NAME,
      instanceSecret: env.MCP_MONITOR_SECRET,
      metricsServerUrl: env.METRICS_SERVER_URL,
      logLevel: env.LOG_LEVEL,
    }
  );

  try {
    await loadStore();
  } catch (error) {
    process.stderr.write(
      `Failed to load attendance store: ${(error as Error).message}\n`
    );
  }

  server.registerTool(
    "students_add",
    {
      title: "Add student",
      description: "Register a student for attendance",
      inputSchema: {
        name: z.string().min(1),
        rollNumber: z.string().min(1),
      },
    },
    async ({ name, rollNumber }) => {
      const existing = store.students.find(
        (s) => s.rollNumber.toLowerCase() === rollNumber.toLowerCase()
      );
      if (existing) {
        return {
          content: [{ type: "text", text: `Roll already exists: ${rollNumber}` }],
          isError: true,
        };
      }
      const student: Student = {
        id: randomUUID(),
        name,
        rollNumber,
        createdAt: new Date().toISOString(),
      };
      store.students.push(student);
      await queueSave();
      return {
        content: [{ type: "text", text: `Added ${student.name} (${student.id})` }],
        structuredContent: { student },
      };
    }
  );

  server.registerTool(
    "students_list",
    {
      title: "List students",
      description: "List all registered students",
    },
    async () => {
      return {
        content: [{ type: "text", text: listStudentsText() }],
        structuredContent: { students: store.students },
      };
    }
  );

  server.registerTool(
    "students_remove",
    {
      title: "Remove student",
      description: "Remove a student and their attendance records",
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => {
      const index = store.students.findIndex((s) => s.id === id);
      if (index === -1) {
        return {
          content: [{ type: "text", text: `Not found: ${id}` }],
          isError: true,
        };
      }
      store.students.splice(index, 1);
      store.records = store.records.filter((r) => r.studentId !== id);
      await queueSave();
      return {
        content: [{ type: "text", text: `Removed ${id}` }],
        structuredContent: { removedId: id },
      };
    }
  );

  server.registerTool(
    "attendance_mark",
    {
      title: "Mark attendance",
      description: "Mark a student present, absent, or late for a date",
      inputSchema: {
        studentId: z.string().min(1),
        date: DateSchema,
        status: StatusSchema,
      },
    },
    async ({ studentId, date, status }) => {
      if (!findStudent(studentId)) {
        return {
          content: [{ type: "text", text: `Student not found: ${studentId}` }],
          isError: true,
        };
      }
      const existing = store.records.find(
        (r) => r.studentId === studentId && r.date === date
      );
      const record: AttendanceRecord = existing
        ? { ...existing, status, markedAt: new Date().toISOString() }
        : {
            id: randomUUID(),
            studentId,
            date,
            status,
            markedAt: new Date().toISOString(),
          };
      if (existing) {
        const i = store.records.findIndex((r) => r.id === existing.id);
        store.records[i] = record;
      } else {
        store.records.push(record);
      }
      await queueSave();
      return {
        content: [
          { type: "text", text: `Marked ${status} on ${date} for ${studentId}` },
        ],
        structuredContent: { record },
      };
    }
  );

  server.registerTool(
    "attendance_list",
    {
      title: "List attendance",
      description: "List attendance records, optionally by student or date",
      inputSchema: {
        studentId: z.string().min(1).optional(),
        date: DateSchema.optional(),
      },
    },
    async ({ studentId, date }) => {
      const records = store.records.filter((r) => {
        if (studentId && r.studentId !== studentId) return false;
        if (date && r.date !== date) return false;
        return true;
      });
      return {
        content: [{ type: "text", text: listRecordsText(records) }],
        structuredContent: { records },
      };
    }
  );

  server.registerTool(
    "attendance_summary",
    {
      title: "Attendance summary",
      description: "Count present, absent, and late for a date or student",
      inputSchema: {
        studentId: z.string().min(1).optional(),
        date: DateSchema.optional(),
      },
    },
    async ({ studentId, date }) => {
      const records = store.records.filter((r) => {
        if (studentId && r.studentId !== studentId) return false;
        if (date && r.date !== date) return false;
        return true;
      });
      const summary = {
        present: records.filter((r) => r.status === "present").length,
        absent: records.filter((r) => r.status === "absent").length,
        late: records.filter((r) => r.status === "late").length,
        total: records.length,
      };
      const text = `present=${summary.present} absent=${summary.absent} late=${summary.late} total=${summary.total}`;
      return {
        content: [{ type: "text", text }],
        structuredContent: { summary },
      };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);

  const shutdown = async () => {
    try {
      await server.close();
    } finally {
      process.exit(0);
    }
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((err) => {
  const error = err as Error;
  const output = {
    timestamp: new Date().toISOString(),
    level: "FATAL",
    message: "Failed to start attendance MCP server",
    error: error.message,
    stack: error.stack,
  };
  process.stderr.write(JSON.stringify(output) + "\n");
  process.exit(1);
});
