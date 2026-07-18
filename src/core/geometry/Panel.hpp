#pragma once
#include <string>
#include <vector>

namespace MebliX {

struct DrillHole {
    double x; // relative positions in mm
    double y;
    double depth;
    double diameter;
};

enum class EdgeBandType {
    None,
    Thin_04mm,
    Thick_20mm
};

struct Panel {
    std::string id;
    std::string name;
    double width;  // in mm
    double height; // in mm
    double thickness; // in mm
    std::string material;
    
    // Edge-banding parameters for 4 sides [Top, Right, Bottom, Left]
    EdgeBandType edgeBanding[4];

    // Joint drill holes
    std::vector<DrillHole> drillHoles;
};

} // namespace MebliX
