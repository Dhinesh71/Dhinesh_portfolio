import { createClient } from "@supabase/supabase-js";

const getEnv = (name, fallback = "") => process.env[name] || fallback;

const SUPABASE_URL = getEnv("SUPABASE_URL", getEnv("VITE_SUPABASE_URL"));
const SUPABASE_SERVICE_ROLE_KEY = getEnv("SUPABASE_SERVICE_ROLE_KEY");
const ADMIN_PASSCODE = getEnv("ADMIN_PASSCODE", getEnv("VITE_ADMIN_PASSCODE", "portfolio-admin"));
const SITE_CONTENT_TABLE = getEnv("SITE_CONTENT_TABLE", "site_content");
const SITE_CONTENT_ROW_ID = getEnv("SITE_CONTENT_ROW_ID", "primary");

const json = (res, statusCode, payload) => {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
};

const isConfigured = () => Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const createSupabaseAdmin = () =>
    createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

const readRequestBody = async (req) => {
    if (req.body && typeof req.body === "object") {
        return req.body;
    }

    if (typeof req.body === "string") {
        return JSON.parse(req.body);
    }

    const chunks = [];

    for await (const chunk of req) {
        chunks.push(chunk);
    }

    if (chunks.length === 0) {
        return {};
    }

    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

export default async function handler(req, res) {
    if (!isConfigured()) {
        return json(res, 503, {
            code: "remote_not_configured",
            error: "Remote persistence is not configured on the server.",
        });
    }

    const supabase = createSupabaseAdmin();

    if (req.method === "GET") {
        const { data, error } = await supabase
            .from(SITE_CONTENT_TABLE)
            .select("content, updated_at")
            .eq("id", SITE_CONTENT_ROW_ID)
            .maybeSingle();

        if (error) {
            return json(res, 500, {
                code: "load_failed",
                error: error.message || "Failed to load site content.",
            });
        }

        return json(res, 200, {
            content: data?.content ?? null,
            updatedAt: data?.updated_at ?? null,
        });
    }

    if (req.method === "PUT") {
        let body;

        try {
            body = await readRequestBody(req);
        } catch {
            return json(res, 400, {
                code: "invalid_json",
                error: "Request body must be valid JSON.",
            });
        }

        if ((body?.passcode || "").trim() !== ADMIN_PASSCODE) {
            return json(res, 401, {
                code: "invalid_passcode",
                error: "Authentication failed. Invalid admin passcode.",
            });
        }

        if (!body?.content || typeof body.content !== "object" || Array.isArray(body.content)) {
            return json(res, 400, {
                code: "invalid_content",
                error: "A valid content object is required.",
            });
        }

        const updatedAt = new Date().toISOString();
        const { error } = await supabase
            .from(SITE_CONTENT_TABLE)
            .upsert(
                {
                    id: SITE_CONTENT_ROW_ID,
                    content: body.content,
                    updated_at: updatedAt,
                },
                {
                    onConflict: "id",
                }
            );

        if (error) {
            return json(res, 500, {
                code: "save_failed",
                error: error.message || "Failed to save site content.",
            });
        }

        return json(res, 200, {
            ok: true,
            updatedAt,
        });
    }

    res.setHeader("Allow", "GET, PUT");
    return json(res, 405, {
        code: "method_not_allowed",
        error: "Method not allowed.",
    });
}
