cmake_minimum_required(VERSION 3.15)
project(MebliXDesktop VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find GTK3 and WebKit2GTK using PkgConfig
find_package(PkgConfig REQUIRED)
pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
pkg_check_modules(WEBKIT2GTK REQUIRED webkit2gtk-4.1)

# Source files
set(SOURCES
    src/core/main.cpp
)

# Header search paths for CAD submodules
include_directories(
    src/core
    src/core/geometry
    src/core/ipc
    src/core/storage
    src/core/network
    ${GTK3_INCLUDE_DIRS}
    ${WEBKIT2GTK_INCLUDE_DIRS}
)

link_directories(
    ${GTK3_LIBRARY_DIRS}
    ${WEBKIT2GTK_LIBRARY_DIRS}
)

# Executable target
add_executable(MebliXDesktop ${SOURCES})

# WebView GTK compile flag
target_compile_definitions(MebliXDesktop PRIVATE WEBVIEW_GTK)

# Link GTK3 and WebKit2GTK libraries
target_link_libraries(MebliXDesktop PRIVATE
    ${GTK3_LIBRARIES}
    ${WEBKIT2GTK_LIBRARIES}
)
