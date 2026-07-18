#pragma once
#include <string>

namespace MebliX {

struct EditAction {
    std::string actionType;   // e.g. "WidthChange", "HeightChange", "DepthChange"
    std::string description;  // Human-readable description
    int oldValue;
    int newValue;
};

} // namespace MebliX
