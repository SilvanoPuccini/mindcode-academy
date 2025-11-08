"""
Pytest configuration for tests.
"""
import os
import sys

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
