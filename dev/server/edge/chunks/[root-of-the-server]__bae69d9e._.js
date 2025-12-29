(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__bae69d9e._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/lib/supabase/server/server.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createAdminClient",
    ()=>createAdminClient,
    "createClient",
    ()=>createClient,
    "createClientFromJwt",
    ()=>createClientFromJwt,
    "getUser",
    ()=>getUser,
    "getUserId",
    ()=>getUserId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$headers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/headers.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/request/cookies.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wmnlriktsxnqsqnuhyzc.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbmxyaWt0c3hucXNxbnVoeXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkyNDMsImV4cCI6MjA4MTYyNTI0M30.CsvEtCGCq8j-BIq0Wyvh3ZFvy_GWzZpehGUw30O2xog"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>{
                        cookieStore.set(name, value, options);
                    });
                } catch  {
                // No-op
                }
            }
        }
    });
}
function createAdminClient() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wmnlriktsxnqsqnuhyzc.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
        global: {
            headers: {
                "x-service-role": "true"
            }
        },
        cookies: {
            getAll () {
                return [];
            },
            setAll () {
            // No-op
            }
        }
    });
}
async function createClientFromJwt(jwt) {
    if (!jwt) {
        console.error("No JWT provided");
        return;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wmnlriktsxnqsqnuhyzc.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbmxyaWt0c3hucXNxbnVoeXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkyNDMsImV4cCI6MjA4MTYyNTI0M30.CsvEtCGCq8j-BIq0Wyvh3ZFvy_GWzZpehGUw30O2xog"), {
        global: {
            headers: {
                Authorization: `Bearer ${jwt}`
            }
        },
        cookies: {
            getAll () {
                return [];
            },
            setAll () {
            // No-op
            }
        }
    });
}
async function getUser(supabase) {
    const { data: { user }, error: error } = await supabase.auth.getUser();
    if (error) {
        console.error("Error getting user:", error.message);
        return null;
    }
    return user;
}
async function getUserId(supabase) {
    const user = await getUser(supabase);
    if (!user) {
        console.error("No session found");
        return null;
    }
    return user.id || null;
}
}),
"[project]/lib/supabase/server/auth.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkAllRoles",
    ()=>checkAllRoles,
    "checkAuth",
    ()=>checkAuth,
    "checkRole",
    ()=>checkRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$server$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server/server.ts [middleware-edge] (ecmascript)");
;
async function checkAuth(supabase) {
    console.log("Checking auth...");
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error checking auth:", error.message);
        return false;
    }
    console.log("Session state:", {
        hasSession: !!session,
        sessionExpiresAt: session?.expires_at,
        sessionUser: session?.user?.email
    });
    return !!session;
}
async function checkRole(supabase, roles) {
    const userId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$server$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getUserId"])(supabase);
    if (!userId) {
        return false;
    }
    const { data, error } = await supabase.from("user_roles").select("roles(name)").eq("user_id", userId);
    if (error) {
        console.error("Error checking role:", error.message);
        return false;
    }
    if (!data || data.length === 0) {
        console.error("No roles found for user");
        return false;
    }
    const userRoles = data.flatMap((entry)=>{
        if (Array.isArray(entry.roles)) {
            return entry.roles.map((role)=>role.name);
        } else if (entry.roles && typeof entry.roles === "object") {
            return [
                entry.roles.name
            ];
        }
        return [];
    });
    console.log("User roles fetched:", userRoles);
    const hasExactRole = roles.some((requiredRole)=>userRoles.includes(requiredRole));
    if (hasExactRole) {
        console.log("User has the exact required role:", roles);
        return true;
    } else {
        console.error("User does not have any of the required roles:", roles);
        return false;
    }
}
async function checkAllRoles(supabase, roles) {
    const userId = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$server$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["getUserId"])(supabase);
    if (!userId) {
        console.error("User is not logged in");
        return false;
    }
    const { data, error } = await supabase.from("user_roles").select("roles(name)").eq("user_id", userId);
    if (error) {
        console.error("Error checking roles:", error.message);
        return false;
    }
    if (!data || data.length === 0) {
        console.error("No roles found for user");
        return false;
    }
    const userRoles = data.flatMap((entry)=>{
        const rolesField = entry.roles;
        if (Array.isArray(rolesField)) {
            return rolesField.map((role)=>role.name);
        } else if (rolesField && typeof rolesField === "object" && "name" in rolesField) {
            return [
                rolesField.name
            ];
        }
        return [];
    });
    console.log("User roles:", userRoles);
    const hasAllRoles = roles.every((requiredRole)=>userRoles.includes(requiredRole));
    if (hasAllRoles) {
        console.log("User has all the required roles");
        return true;
    } else {
        console.error("User does not have all the required roles");
        return false;
    }
}
}),
"[project]/lib/supabase/server/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateSession",
    ()=>updateSession
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server/auth.ts [middleware-edge] (ecmascript)");
;
;
;
/**
 * Protects a path by checking if the user is authenticated and has the required
 * roles. If the user is not authenticated or does not have the required roles,
 * they are redirected to the unauthorized path.
 *
 * @param supabase - The Supabase client.
 * @param roles - The roles required to access the path.
 * @param allRequired - Whether all roles are required.
 * @param unauthorizedPath - The path to redirect to if the user is not
 *                           authorized.
 *
 * @returns The path to redirect to if the user is not authorized, or null if
 *          the user is authorized.
 */ async function protectPath(supabase, roles, allRequired = false, unauthorizedPath = "/unauthorized") {
    let authorized = false;
    const isAuthenticated = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkAuth"])(supabase);
    if (!isAuthenticated) {
        return unauthorizedPath;
    }
    if (!roles || roles.length === 0) {
        return null;
    }
    if (allRequired) {
        authorized = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkAllRoles"])(supabase, roles);
    } else {
        authorized = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["checkRole"])(supabase, roles);
    }
    if (!authorized) {
        return unauthorizedPath;
    }
    return null;
}
const protectedRoutes = [
    {
        path: "/dashboard",
        roles: [],
        unauthorizedPath: "/unauthorized"
    }
];
async function updateSession(request) {
    let supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request
    });
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wmnlriktsxnqsqnuhyzc.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbmxyaWt0c3hucXNxbnVoeXpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNDkyNDMsImV4cCI6MjA4MTYyNTI0M30.CsvEtCGCq8j-BIq0Wyvh3ZFvy_GWzZpehGUw30O2xog"), {
        cookies: {
            getAll () {
                return request.cookies.getAll();
            },
            setAll (cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options })=>request.cookies.set(name, value));
                supabaseResponse = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request
                });
                cookiesToSet.forEach(({ name, value, options })=>supabaseResponse.cookies.set(name, value, options));
            }
        }
    });
    for (const route of protectedRoutes){
        if (request.nextUrl.pathname.startsWith(route.path)) {
            const unauthorizedPath = await protectPath(supabase, route.roles, false, route.unauthorizedPath);
            if (unauthorizedPath) {
                const redirectUrl = new URL(unauthorizedPath, request.url);
                const previousPage = request.headers.get("referer") || "/";
                redirectUrl.searchParams.set("from", previousPage);
                return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(redirectUrl);
            }
        }
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase/server/middleware.ts [middleware-edge] (ecmascript)");
;
async function middleware(request) {
    return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2f$server$2f$middleware$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["updateSession"])(request);
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */ "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__bae69d9e._.js.map