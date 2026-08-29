"""
Rate limiting setup using slowapi.

Limits the number of requests per client IP to prevent brute-force
attacks and abuse of authentication endpoints.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
