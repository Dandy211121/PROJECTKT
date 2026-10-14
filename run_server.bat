@echo off
rem ---------------------------------------------------
rem  Run the FastAPI backend with automatic model download
rem ---------------------------------------------------

rem Set the project root (folder containing "backend") as PYTHONPATH
set "PYTHONPATH=%~dp0"

rem Enable automatic download of .pth checkpoint files
set AUTO_DOWNLOAD_MODELS=1

rem Activate a virtual environment if you have one (optional)
rem call venv\Scripts\activate

rem Install required packages (run once) – uncomment if needed
rem pip install -r backend\requirement.txt

rem Launch the server
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
