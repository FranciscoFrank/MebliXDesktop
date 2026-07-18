#include <iostream>
#include <vector>
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

int main() {
    std::cout << "MebliX Desktop Core CAD Engine starting..." << std::endl;

    // Initialize IPC Server
    MebliX::IpcServer ipc;
    ipc.init();

    // Initialize Local Storage Manager
    static MebliX::ProjectManager storage;
    
    // Initialize Cloud Sync Client
    static MebliX::SyncClient syncClient("ws://localhost:8080");
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
