"use strict";
process.on("unhandledRejection", (reason, promise) => {
    console.log("Unhandled rejection at:", promise, "reason:", reason);
});
process.on("uncaughtException", (error) => {
    console.log("Uncaught exception:", error);
});
process.on("SIGINT", () => {
    console.log("📥 SIGINT (Ctrl+C) received, shutting down gracefully...");
    console.log("✅ Server closed successfully");
    process.exit(0);
});
process.on("SIGTERM", () => {
    console.log("📥 SIGTERM received, shutting down gracefully...");
    console.log("✅ Server closed successfully");
    process.exit(0);
});
//# sourceMappingURL=process.js.map