import subprocess
import sys
import time
import os
import uvicorn
from src.frontend_server import app

def main():
    print("[Orchestrator] Starting MCP Server...", flush=True)
    mcp_process = subprocess.Popen([sys.executable, "src/mcp_server.py"])
    
    # Wait for MCP server to bind (5 seconds should be enough)
    print("[Orchestrator] Waiting for MCP Server to initialize...", flush=True)
    time.sleep(5)
    
    print("[Orchestrator] Starting Voice Worker...", flush=True)
    # The voice worker has its own retry loop for the MCP server built-in now
    voice_process = subprocess.Popen([sys.executable, "src/voice_server.py", "dev"])
    
    # The frontend server binds to 0.0.0.0 and PORT (HF Gradio SDK automatically provides this, default 7860)
    port = int(os.environ.get("PORT", 7860))
    print(f"[Orchestrator] Starting Frontend Server on port {port}...", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    main()
