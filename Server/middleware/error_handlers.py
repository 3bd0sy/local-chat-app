"""
Global error handlers for the application
"""

import logging
from flask import Flask, jsonify, request, send_from_directory, current_app

logger = logging.getLogger(__name__)


def register_error_handlers(app: Flask):
    """
    Register global error handlers with SPA support
    """

    @app.errorhandler(400)
    def bad_request(error):
        """Handle bad request errors"""
        # Skip JSON response for file uploads to maintain compatibility
        if request.path.startswith("/api/files/"):
            return error.get_response()

        return (
            jsonify(
                {
                    "success": False,
                    "error": "Bad request",
                    "message": "The request could not be understood by the server",
                }
            ),
            400,
        )

    @app.errorhandler(401)
    def unauthorized(error):
        """Handle unauthorized errors"""
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Unauthorized",
                    "message": "Authentication is required to access this resource",
                }
            ),
            401,
        )

    @app.errorhandler(403)
    def forbidden(error):
        """Handle forbidden errors"""
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Forbidden",
                    "message": "You don't have permission to access this resource",
                }
            ),
            403,
        )

    @app.errorhandler(404)
    def not_found(error):
        """
        Handle not found errors
        Serves index.html for non-API routes (SPA support)
        """
        path = request.path

        # If it's an API route, return JSON 404
        if path.startswith("/api/"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Not found",
                        "message": "The requested API endpoint was not found",
                    }
                ),
                404,
            )

        # If it's a static file request (has extension), return JSON 404
        if path != "/" and "." in path.split("/")[-1]:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "File not found",
                        "message": "The requested file was not found",
                    }
                ),
                404,
            )

        # For all other routes (SPA paths), serve index.html if exists
        try:
            # Check if static folder exists and contains index.html
            if hasattr(app, "static_folder") and app.static_folder:
                return send_from_directory(app.static_folder, "index.html")
            else:
                # Fallback for API-only servers
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": "Not found",
                            "message": "The requested resource was not found",
                        }
                    ),
                    404,
                )
        except Exception as e:
            logger.error(f"Error serving index.html from 404 handler: {str(e)}")
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Application error",
                        "message": "Could not load application",
                    }
                ),
                500,
            )

    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle method not allowed errors"""
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Method not allowed",
                    "message": f"The method {request.method} is not allowed for this URL",
                }
            ),
            405,
        )

    @app.errorhandler(413)
    def request_entity_too_large(error):
        """Handle payload too large errors"""
        max_size = current_app.config.get(
            "MAX_CONTENT_LENGTH", 16 * 1024 * 1024
        )  # Default 16MB
        max_size_mb = max_size / (1024 * 1024)
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Payload too large",
                    "message": f"The request payload exceeds the maximum allowed size of {max_size_mb:.1f}MB",
                }
            ),
            413,
        )

    @app.errorhandler(429)
    def too_many_requests(error):
        """Handle rate limit errors"""
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Too many requests",
                    "message": "Rate limit exceeded. Please try again later",
                }
            ),
            429,
        )

    @app.errorhandler(500)
    def internal_error(error):
        """Handle internal server errors"""
        logger.error(f"Internal server error: {str(error)}", exc_info=True)

        # In production, don't expose error details
        if current_app.config.get("ENV") == "production":
            message = "An unexpected error occurred. Please try again later"
        else:
            message = str(error)

        return (
            jsonify(
                {
                    "success": False,
                    "error": "Internal server error",
                    "message": message,
                }
            ),
            500,
        )

    @app.errorhandler(502)
    def bad_gateway(error):
        """Handle bad gateway errors"""
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Bad gateway",
                    "message": "The server received an invalid response from an upstream server",
                }
            ),
            502,
        )

    @app.errorhandler(503)
    def service_unavailable(error):
        """Handle service unavailable errors"""
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Service unavailable",
                    "message": "The service is temporarily unavailable. Please try again later",
                }
            ),
            503,
        )

    @app.errorhandler(504)
    def gateway_timeout(error):
        """Handle gateway timeout errors"""
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Gateway timeout",
                    "message": "The server did not receive a timely response",
                }
            ),
            504,
        )

    # Handle all unhandled exceptions
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Handle all unhandled exceptions"""
        logger.error(f"Unhandled exception: {str(error)}", exc_info=True)

        # If it's an HTTP exception, use its code
        if hasattr(error, "code"):
            code = error.code
        else:
            code = 500

        # In production, hide error details
        if current_app.config.get("ENV") == "production":
            message = "An unexpected error occurred"
        else:
            message = str(error)

        return (
            jsonify(
                {
                    "success": False,
                    "error": "Server error",
                    "message": message,
                }
            ),
            code,
        )
