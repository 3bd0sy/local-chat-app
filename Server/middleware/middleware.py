"""
Middleware handlers for CORS and request processing
"""

from flask import Response, request


def setup_cors_headers(app):
    """Setup CORS headers middleware"""

    @app.after_request
    def after_request(response: Response) -> Response:
        """
        Add CORS headers to all responses
        This allows the frontend to make requests from a different origin
        """
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add(
            "Access-Control-Allow-Headers", "Content-Type,Authorization"
        )
        response.headers.add(
            "Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS"
        )
        response.headers.add("Access-Control-Max-Age", "3600")
        return response

    return after_request
