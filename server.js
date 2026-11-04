import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import { Resend } from "resend";
import { randomUUID } from "node:crypto";
import { z } from "zod";

dotenv.config();

const {
  MONGO_URL,
  DB_NAME,
  RESEND_API_KEY,
  SENDER_EMAIL,
  OWNER_EMAIL,
  GITHUB_USER,
  CORS_ORIGINS,
  PORT,
} = process.env;

if (!MONGO_URL || !DB_NAME) {
  throw new Error("MONGO_URL and DB_NAME must be configured in .env");
}

const app = express();
const router = express.Router();
const mongoClient = new MongoClient(MONGO_URL, {
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 20000,
  maxIdleTimeMS: 60000,
});

let db;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const bareAddress = (value) => (value?.match(/<([^>]+)>/)?.[1] ?? value ?? "").trim();
if (RESEND_API_KEY) {
  for (const [name, value] of [["OWNER_EMAIL", OWNER_EMAIL], ["SENDER_EMAIL", SENDER_EMAIL]]) {
    if (!z.string().email().safeParse(bareAddress(value)).success) {
      console.warn(`${name} is missing or not a valid email address ("${value ?? ""}"): contact emails will fail.`);
    }
  }
}

app.use(cors({
  origin: CORS_ORIGINS === "*" ? "*" : CORS_ORIGINS.split(",").map((value) => value.trim()),
  credentials: CORS_ORIGINS !== "*",
}));
app.use(express.json({ limit: "1mb" }));

const contactCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  email: z.string().trim().email("Please enter a valid email address"),
  message: z.string().trim().min(1, "Message is required").max(4000, "Message must be 4000 characters or fewer"),
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function createAchievementHtml(payload) {
  const name = escapeHtml(payload.name);
  const email = escapeHtml(payload.email);
  const message = escapeHtml(payload.message).replace(/\n/g, "<br/>");

  return `
    <!DOCTYPE html>
    <html>
      <body style="
        margin: 0;
        padding: 0;
        background-color: #101810;
        font-family: Arial, Helvetica, sans-serif;
        color: #ffffff;
      ">

        <!-- Hidden preview text -->
        <div style="
          display: none;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
        ">
          A new player has entered your world! You received a new message.
        </div>

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          bgcolor="#101810"
          style="padding: 35px 12px;"
        >
          <tr>
            <td align="center">

              <!-- Main container -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                bgcolor="#1B281B"
                style="
                  max-width: 580px;
                  border: 3px solid #3F663D;
                  box-shadow: 0 0 0 3px #0B120B;
                "
              >

                <!-- Header -->
                <tr>
                  <td
                    align="center"
                    bgcolor="#263D26"
                    style="
                      padding: 28px 20px;
                      border-bottom: 4px solid #152515;
                    "
                  >
                    <div style="
                      font-size: 13px;
                      font-weight: bold;
                      letter-spacing: 3px;
                      color: #A8D58D;
                      margin-bottom: 12px;
                    ">
                      [ SYSTEM NOTIFICATION ]
                    </div>

                    <div style="
                      font-size: 38px;
                      line-height: 1.2;
                      margin-bottom: 10px;
                    ">
                      🏆
                    </div>

                    <div style="
                      color: #FFD700;
                      font-size: 23px;
                      font-weight: 900;
                      text-shadow: 2px 2px #725500;
                      margin-bottom: 8px;
                    ">
                      ACHIEVEMENT UNLOCKED!
                    </div>

                    <div style="
                      color: #FFFFFF;
                      font-size: 15px;
                      font-weight: bold;
                    ">
                      Someone discovered your world.
                    </div>
                  </td>
                </tr>

                <!-- Achievement badge -->
                <tr>
                  <td style="padding: 24px 20px 12px;">
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      bgcolor="#344B2E"
                      style="border: 2px solid #668B45;"
                    >
                      <tr>
                        <td width="65" align="center" style="padding: 15px 5px;">
                          <div style="font-size: 34px;">
                            💎
                          </div>
                        </td>

                        <td style="padding: 15px 10px;">
                          <div style="
                            color: #B8E986;
                            font-size: 11px;
                            font-weight: bold;
                            letter-spacing: 2px;
                          ">
                            NEW ACHIEVEMENT
                          </div>

                          <div style="
                            color: #FFFFFF;
                            font-size: 17px;
                            font-weight: bold;
                            margin-top: 5px;
                          ">
                            A Friendly Visitor
                          </div>

                          <div style="
                            color: #C5D5BC;
                            font-size: 12px;
                            margin-top: 5px;
                          ">
                            A new message has arrived!
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Sender information -->
                <tr>
                  <td style="padding: 20px 20px 10px;">
                    <div style="
                      color: #8FCB70;
                      font-size: 12px;
                      font-weight: bold;
                      letter-spacing: 2px;
                      margin-bottom: 15px;
                    ">
                      // PLAYER INFORMATION
                    </div>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      bgcolor="#131D13"
                      style="border: 2px solid #344B2E;"
                    >
                      <tr>
                        <td style="
                          padding: 14px;
                          border-bottom: 1px solid #344B2E;
                        ">
                          <div style="
                            color: #8FA78A;
                            font-size: 11px;
                            margin-bottom: 6px;
                          ">
                            PLAYER NAME
                          </div>

                          <div style="
                            color: #FFFFFF;
                            font-size: 15px;
                            font-weight: bold;
                          ">
                            ${name}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td style="padding: 14px;">
                          <div style="
                            color: #8FA78A;
                            font-size: 11px;
                            margin-bottom: 6px;
                          ">
                            PLAYER EMAIL
                          </div>

                          <div style="
                            color: #B8E986;
                            font-size: 14px;
                            word-break: break-word;
                          ">
                            ${email}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="padding: 20px 20px 25px;">
                    <div style="
                      color: #8FCB70;
                      font-size: 12px;
                      font-weight: bold;
                      letter-spacing: 2px;
                      margin-bottom: 15px;
                    ">
                      // MESSAGE FROM THE OVERWORLD
                    </div>

                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      bgcolor="#263326"
                      style="
                        border-left: 4px solid #78A94B;
                      "
                    >
                      <tr>
                        <td style="
                          padding: 20px;
                          color: #E5EDE0;
                          font-size: 14px;
                          line-height: 1.8;
                          word-break: break-word;
                        ">
                          ${message}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td
                    align="center"
                    bgcolor="#263D26"
                    style="
                      padding: 22px 15px;
                      border-top: 3px solid #152515;
                    "
                  >
                    <div style="
                      color: #B8E986;
                      font-size: 12px;
                      font-weight: bold;
                      margin-bottom: 8px;
                    ">
                      ⛏️ KEEP BUILDING YOUR WORLD
                    </div>

                    <div style="
                      color: #9EAF98;
                      font-size: 11px;
                      line-height: 1.7;
                    ">
                      This message was delivered from your portfolio.
                      <br/>
                      Made with ❤️ and a little bit of redstone.
                    </div>

                    <div style="
                      color: #667A60;
                      font-size: 10px;
                      margin-top: 15px;
                    ">
                      © ${new Date().getFullYear()} RIZKYYULLAH
                      | PORTFOLIO SYSTEM
                    </div>
                  </td>
                </tr>

              </table>
              <!-- End main container -->

            </td>
          </tr>
        </table>

      </body>
    </html>
  `;
}


const EMAIL_TIMEOUT_MS = 10000; 
const DELIVERY_CHECK_WINDOW_MS = 8000; 
const EMAIL_PHASE_BUDGET_MS = 15000; 
const DELIVERY_CHECK_INTERVAL_MS = 1000;
const DELIVERY_REQUEST_TIMEOUT_MS = 3000;

const DELIVERED_EVENTS = new Set(["delivered", "opened", "clicked", "complained"]);
const FAILED_EVENTS = new Set(["bounced", "failed", "canceled", "suppressed"]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function withTimeout(promise, ms, label) {
  let timerId;
  const timeout = new Promise((_, reject) => {
    timerId = setTimeout(() => {
      const error = new Error(`${label} timed out after ${ms} ms`);
      error.timedOut = true;
      reject(error);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
}

const isRestrictedKeyError = (error) =>
  error?.name === "restricted_api_key" || /restricted to only send emails/i.test(error?.message ?? "");

let warnedRestrictedKey = false;

async function checkDelivery(emailId, deadline) {
  while (Date.now() + DELIVERY_CHECK_INTERVAL_MS < deadline) {
    await sleep(DELIVERY_CHECK_INTERVAL_MS);

    try {
      const { data, error } = await withTimeout(
        resend.emails.get(emailId),
        Math.max(500, Math.min(DELIVERY_REQUEST_TIMEOUT_MS, deadline - Date.now())),
        "Resend status check",
      );

      if (error) {
        if (isRestrictedKeyError(error)) {
          if (!warnedRestrictedKey) {
            warnedRestrictedKey = true;
            console.warn(
              "RESEND_API_KEY is a \"Sending access\" key: delivery cannot be checked, so bounced emails will " +
                "look successful. Create a \"Full access\" key to get failure notices.",
            );
          }
          return "accepted";
        }
        console.warn("Resend status check failed:", error.message ?? error);
        continue; 
      }

      const lastEvent = data?.last_event ?? data?.lastEvent;
      if (DELIVERED_EVENTS.has(lastEvent)) return "delivered";
      if (FAILED_EVENTS.has(lastEvent)) {
        console.error(`Resend reports the email as "${lastEvent}". If OWNER_EMAIL has a typo, fix it in .env.`);
        return "failed";
      }
    } catch (error) {
      console.warn("Resend status check failed:", error.message);
    }
  }

  return "unconfirmed";
}

async function sendViaResend(payload) {
  if (!resend) {
    console.warn("RESEND_API_KEY not configured; message stored only.");
    return "failed";
  }

  const startedAt = Date.now();
  let emailId;

  try {
    const { data, error } = await withTimeout(
      resend.emails.send({
        from: SENDER_EMAIL,
        to: [OWNER_EMAIL],
        replyTo: payload.email,
        subject: `[Portfolio] New message from ${payload.name}`,
        html: createAchievementHtml(payload),
      }),
      EMAIL_TIMEOUT_MS,
      "Resend",
    );

    if (error) {
      console.error("Resend failed:", error);
      return "failed";
    }
    emailId = data?.id;
  } catch (error) {
    console.error("Resend failed:", error);
    return error.timedOut ? "unconfirmed" : "failed";
  }

  if (!emailId) return "unconfirmed";

  const deadline = Math.min(Date.now() + DELIVERY_CHECK_WINDOW_MS, startedAt + EMAIL_PHASE_BUDGET_MS);
  return checkDelivery(emailId, deadline);
}

router.get("/", (req, res) => {
  res.json({ message: "Hi, It's Rizkyyullah's Portfolio API" });
});

router.post("/contact", async (req, res) => {
  const validation = contactCreateSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(422).json({
      detail: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        msg: issue.message,
      })),
    });
  }

  const payload = validation.data;
  const contactMessage = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    message: payload.message,
    email_sent: false,
    email_status: "pending",
    created_at: new Date().toISOString(),
  };

  await db.collection("contact_messages").insertOne(contactMessage);

  const emailStatus = await sendViaResend(payload);
  const emailSent = emailStatus === "delivered" || emailStatus === "accepted";

  if (emailStatus === "failed" || emailStatus === "unconfirmed") {
    console.error(
      `Contact email ${emailStatus} (message ${contactMessage.id}). Check OWNER_EMAIL / SENDER_EMAIL and the Resend dashboard.`,
    );
  }

  res.status(200).json({
    id: contactMessage.id,
    name: contactMessage.name,
    email: contactMessage.email,
    message: contactMessage.message,
    email_sent: emailSent,
    email_status: emailStatus, // delivered | accepted | unconfirmed | failed
    created_at: contactMessage.created_at,
  });

  try {
    await db.collection("contact_messages").updateOne(
      { id: contactMessage.id },
      { $set: { email_sent: emailSent, email_status: emailStatus } },
    );
  } catch (error) {
    console.warn("Could not record the email outcome:", error.message);
  }
});

router.get("/github/repos", async (req, res) => {
  const cacheCollection = db.collection("repo_cache");
  const now = new Date();

  let cached = null;
  let cacheAvailable = true;
  try {
    cached = await cacheCollection.findOne({ _id: GITHUB_USER });
  } catch (error) {
    cacheAvailable = false;
    console.warn("repo_cache read failed:", error.message);
  }

  if (cached) {
    const fetchedAt = new Date(cached.fetched_at);
    const ageInSeconds = (now.getTime() - fetchedAt.getTime()) / 1000;

    if (ageInSeconds < 1800) {
      return res.json(cached.repos);
    }
  }

  let githubData;

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USER)}/repos?per_page=100&sort=updated`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "Rizkyyullah-Portfolio-API",
        },
        signal: AbortSignal.timeout(15000),
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    githubData = await response.json();
  } catch (error) {
    console.error("GitHub fetch failed:", error);

    if (cached) {
      return res.json(cached.repos);
    }

    return res.status(502).json({
      detail: "Unable to fetch GitHub repositories",
    });
  }

  const repos = githubData
    .filter((item) => !item.fork)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description ?? null,
      language: item.language ?? null,
      stars: item.stargazers_count ?? 0,
      forks: item.forks_count ?? 0,
      url: item.html_url,
      homepage: item.homepage || null,
      topics: item.topics ?? [],
      updated_at: item.updated_at ?? null,
    }));

  if (cacheAvailable) {
    try {
      await cacheCollection.updateOne(
        { _id: GITHUB_USER },
        {
          $set: {
            repos,
            fetched_at: now.toISOString(),
          },
        },
        { upsert: true },
      );
    } catch (error) {
      console.warn("repo_cache write failed:", error.message);
    }
  }

  return res.json(repos);
});

app.use("/api", router);

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({ detail: "Internal server error" });
});

async function startServer() {
  try {
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`Portfolio API is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await mongoClient.close();
    process.exit(1);
  }
}

async function shutdown() {
  console.log("Shutting down server...");
  await mongoClient.close();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();
