@echo off
rem ---------------------------------------------------
rem  Run the FastAPI backend with automatic model download
rem ---------------------------------------------------

chcp 65001 >nul
set "PYTHONIOENCODING=utf-8"

rem Set the project root (folder containing "backend") as PYTHONPATH
set "PYTHONPATH=%~dp0"

rem Enable automatic download of .pth checkpoint files
set AUTO_DOWNLOAD_MODELS=1

rem Activate virtual environment automatically
if exist "%~dp0venv\Scripts\activate.bat" (
    call "%~dp0venv\Scripts\activate.bat"
    python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
) else if exist "%~dp0.venv\Scripts\activate.bat" (
    call "%~dp0.venv\Scripts\activate.bat"
    python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
) else (
    uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
)
pause
