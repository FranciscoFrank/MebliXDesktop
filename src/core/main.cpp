#include <iostream>
#include <vector>
#include <limits.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <signal.h>
#include <thread>
#include <chrono>
#include "geometry/Panel.hpp"
#include "ipc/IpcServer.hpp"
#include "storage/ProjectManager.hpp"
#include "network/SyncClient.hpp"
#include "webview.h"

// Helper to parse JSON string array e.g. ["arg1", "arg2", ...]
std::vector<std::string> parseJsonArray(const std::string& jsonArrayStr) {
    std::vector<std::string> result;
    if (jsonArrayStr.empty() || jsonArrayStr.front() != '[' || jsonArrayStr.back() != ']') {
        return result;
    }
    
    std::string current = "";
    bool inString = false;
    bool escaped = false;
    
    for (size_t i = 1; i < jsonArrayStr.size() - 1; ++i) {
        char c = jsonArrayStr[i];
        if (escaped) {
            if (c == 'n') current += '\n';
            else if (c == 't') current += '\t';
            else if (c == 'r') current += '\r';
            else current += c;
            escaped = false;
        } else if (c == '\\') {
            escaped = true;
        } else if (c == '"') {
            if (inString) {
                result.push_back(current);
                current = "";
                inString = false;
            } else {
                inString = true;
            }
        } else if (inString) {
            current += c;
        }
    }
    return result;
}

// Helper to get executable directory path
std::string getExecutableDir() {
    char result[PATH_MAX];
    ssize_t count = readlink("/proc/self/exe", result, PATH_MAX);
    if (count == -1) {
        return "";
    }
    std::string path(result, count);
    size_t last_slash = path.find_last_of("/");
    if (last_slash == std::string::npos) {
        return "";
    }
    return path.substr(0, last_slash);
}

// RAII helper to manage the React/Vite development server process
class DevServerManager {
private:
    pid_t m_pid;
public:
    DevServerManager(pid_t pid) : m_pid(pid) {}
    ~DevServerManager() {
        if (m_pid > 0) {
            std::cout << "[Core Launcher] Stopping React Vite dev server (PID: " << m_pid << ")..." << std::endl;
            kill(m_pid, SIGTERM);
            int status;
            waitpid(m_pid, &status, 0);
            std::cout << "[Core Launcher] React Vite dev server stopped." << std::endl;
        }
    }
};

int main(int argc, char* argv[]) {
    bool disableSync = false;
    bool disableDevServer = false;

    // Parse command line arguments
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--offline" || arg == "--no-sync") {
            disableSync = true;
        } else if (arg == "--no-ui" || arg == "--no-dev-server") {
            disableDevServer = true;
        }
    }

    std::cout << "MebliX Desktop Core CAD Engine starting..." << std::endl;

    // Launch React/Vite development server if not disabled
    pid_t devServerPid = 0;
    if (!disableDevServer) {
        std::string uiDir = getExecutableDir() + "/../src/ui";
        std::cout << "[Core Launcher] Starting React Vite dev server in " << uiDir << "..." << std::endl;

        devServerPid = fork();
        if (devServerPid == 0) {
            // In child process: Redirect output to vite_dev.log to prevent console pollution
            FILE* log = fopen("vite_dev.log", "w");
            if (log) {
                int fd = fileno(log);
                dup2(fd, 1); // Redirect stdout
                dup2(fd, 2); // Redirect stderr
                fclose(log);
            }

            if (chdir(uiDir.c_str()) != 0) {
                std::cerr << "[Core Launcher Child] Failed to change directory to " << uiDir << std::endl;
                exit(1);
            }

            execlp("npm", "npm", "run", "dev", nullptr);
            std::cerr << "[Core Launcher Child] Failed to start npm run dev" << std::endl;
            exit(1);
        } else if (devServerPid < 0) {
            std::cerr << "[Core Launcher] Failed to fork process for React dev server." << std::endl;
        } else {
            std::cout << "[Core Launcher] React Vite dev server launched with PID: " << devServerPid << std::endl;
            std::cout << "[Core Launcher] Waiting for server to initialize..." << std::endl;
            // Wait for Vite server to bind to port 3001
            std::this_thread::sleep_for(std::chrono::milliseconds(2000));

            // Check if it exited early (e.g. npm install was not run)
            int status;
            pid_t result = waitpid(devServerPid, &status, WNOHANG);
            if (result == devServerPid) {
                std::cerr << "[Core Launcher] WARNING: React dev server process exited unexpectedly with code " << WEXITSTATUS(status) << std::endl;
                std::cerr << "[Core Launcher] Check 'vite_dev.log' for details. You may need to run 'npm install' in 'MebliXDesktop/src/ui' first." << std::endl;
            }
        }
    }

    // Instantiating the RAII manager to ensure the child process is terminated on exit
    DevServerManager devServer(devServerPid);

    // Initialize IPC Server
    MebliX::IpcServer ipc;
    ipc.init();

    // Initialize Local Storage Manager
    static MebliX::ProjectManager storage;
    
    // Initialize Cloud Sync Client
    static MebliX::SyncClient syncClient("ws://localhost:8080", disableSync);
    // Connect to Sync server in the background (mock)
    syncClient.connect();

    std::cout << "MebliX Desktop Core Engine successfully initialized." << std::endl;
    std::cout << "Spawning native window wrapper..." << std::endl;

    // Spawn native webview window container
    try {
        webview::webview w(true, nullptr);
        w.set_title("MebliX Desktop App");
        w.set_size(1280, 800, WEBVIEW_HINT_NONE);

        // Bind C++ Local Save
        w.bind("saveLocalProject", [](std::string req) -> std::string {
            auto args = parseJsonArray(req);
            if (args.size() < 4) {
                std::cerr << "[Binding Error] saveLocalProject requires 4 arguments." << std::endl;
                return "false";
            }
            std::string filePath = args[0];
            std::string projectJson = args[1];
            std::string undoJson = args[2];
            std::string redoJson = args[3];

            bool success = storage.saveProjectWithHistory(filePath, projectJson, undoJson, redoJson);
            return success ? "true" : "false";
        });

        // Bind C++ Local Load
        w.bind("loadLocalProject", [](std::string req) -> std::string {
            auto args = parseJsonArray(req);
            if (args.empty()) {
                std::cerr << "[Binding Error] loadLocalProject requires 1 argument." << std::endl;
                return "{}";
            }
            std::string filePath = args[0];
            return storage.loadProjectWithHistory(filePath);
        });

        // Bind C++ Cloud Sync Upload (delegated heavy operations)
        w.bind("triggerCloudSync", [](std::string req) -> std::string {
            auto args = parseJsonArray(req);
            if (args.size() < 3) {
                std::cerr << "[Binding Error] triggerCloudSync requires 3 arguments." << std::endl;
                return "{\"status\":\"error\",\"message\":\"Missing arguments\"}";
            }
            std::string projectId = args[0];
            std::string authToken = args[1];
            std::string projectDataJson = args[2];

            // Perform direct upload, gltf conversion, and thumbnail generation on core
            return syncClient.uploadProjectWithGltf(projectId, authToken, projectDataJson);
        });

        w.navigate("http://localhost:3001");
        w.run();
    } catch (const std::exception& e) {
        std::cerr << "Fatal error spawning WebView window: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
