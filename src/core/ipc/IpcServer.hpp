#pragma once
#include <iostream>
#include <string>

namespace MebliX {

class IpcServer {
public:
    void init() {
        std::cout << "[IPC Server] Initializing Local WebView IPC Channel..." << std::endl;
    }

    void handleMessage(const std::string& jsonPayload) {
        std::cout << "[IPC Server] Received request from UI: " << jsonPayload << std::endl;
        // In production, parse JSON and execute CAD/Geometry modifications
    }

    void sendUpdateToUi(const std::string& jsonEvent) {
        std::cout << "[IPC Server] Dispatching event to WebView: " << jsonEvent << std::endl;
    }
};

} // namespace MebliX
