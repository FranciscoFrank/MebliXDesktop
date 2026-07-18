#pragma once
#include <string>
#include <iostream>
#include <fstream>
#include "EditAction.hpp"

namespace MebliX {

class ProjectManager {
public:
    bool saveProjectWithHistory(const std::string& filePath, 
                                const std::string& projectJson, 
                                const std::string& undoStackJson, 
                                const std::string& redoStackJson) {
        std::cout << "[Project Manager] Saving dimensions and Undo/Redo stacks to: " << filePath << std::endl;
        std::cout << "  - Parameters: " << projectJson << std::endl;
        std::cout << "  - Undo size: " << undoStackJson << std::endl;
        std::cout << "  - Redo size: " << redoStackJson << std::endl;

        std::ofstream outFile(filePath);
        if (!outFile.is_open()) {
            std::cerr << "[Project Manager] Failed to open file for writing: " << filePath << std::endl;
            return false;
        }
        
        outFile << "[Dimensions]\n" << projectJson << "\n";
        outFile << "[UndoStack]\n" << undoStackJson << "\n";
        outFile << "[RedoStack]\n" << redoStackJson << "\n";
        outFile.close();
        return true;
    }

    std::string loadProjectWithHistory(const std::string& filePath) {
        std::cout << "[Project Manager] Loading dimensions and Undo/Redo stacks from: " << filePath << std::endl;
        std::ifstream inFile(filePath);
        if (!inFile.is_open()) {
            std::cerr << "[Project Manager] Failed to open file for reading: " << filePath << std::endl;
            return "{}";
        }

        std::string line;
        std::string currentSection = "";
        std::string projectJson = "{}";
        std::string undoStackJson = "[]";
        std::string redoStackJson = "[]";

        while (std::getline(inFile, line)) {
            if (line == "[Dimensions]") {
                currentSection = "dimensions";
            } else if (line == "[UndoStack]") {
                currentSection = "undo";
            } else if (line == "[RedoStack]") {
                currentSection = "redo";
            } else if (!line.empty()) {
                if (currentSection == "dimensions") {
                    projectJson = line;
                } else if (currentSection == "undo") {
                    undoStackJson = line;
                } else if (currentSection == "redo") {
                    redoStackJson = line;
                }
            }
        }
        inFile.close();

        std::string resultJson = "{\"dimensions\":" + projectJson + 
                                 ",\"undoStack\":" + undoStackJson + 
                                 ",\"redoStack\":" + redoStackJson + "}";
        return resultJson;
    }
};

} // namespace MebliX
