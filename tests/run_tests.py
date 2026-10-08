# ============================================================
# tests/run_tests.py — Standard Library Test Suite Runner
# Executes test_ml_pipeline.py and test_api.py using unittest
# ============================================================

import os
import sys
import unittest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from tests.test_ml_pipeline import TestMLPipeline
from tests.test_api import TestAPIEndpoints

if __name__ == '__main__':
    print("============================================================")
    print("ColdChain OSMS — Automated Test Suite")
    print("============================================================")
    unittest.main(verbosity=2)
