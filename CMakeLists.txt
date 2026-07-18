cmake_minimum_required(VERSION 3.18)
project(MebliXDesktop VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Source files
set(SOURCES
    src/core/main.cpp
)

# Executable target
add_executable(MebliXDesktop ${SOURCES})

# Include directories
target_include_directories(MebliXDesktop PRIVATE
    src/core
    src/core/geometry
    src/core/ipc
    src/core/storage
    src/core/network
)

if(WIN32)
    # Automatically download WebView2 SDK if on Windows
    include(FetchContent)
    FetchContent_Declare(
        webview2_sdk
        URL "https://www.nuget.org/api/v2/package/Microsoft.Web.WebView2/1.0.1823.32"
        DOWNLOAD_NAME "webview2.zip"
    )
    FetchContent_MakeAvailable(webview2_sdk)
    
    # Get properties
    FetchContent_GetProperties(webview2_sdk SOURCE_DIR webview2_sdk_SOURCE_DIR)
    
    target_include_directories(MebliXDesktop PRIVATE
        "${webview2_sdk_SOURCE_DIR}/build/native/include"
    )
    
    if(CMAKE_SIZEOF_VOID_P EQUAL 8)
        set(WEBVIEW2_ARCH x64)
    else()
        set(WEBVIEW2_ARCH x86)
    endif()
    
    set(WEBVIEW2_LINK_LIB "${webview2_sdk_SOURCE_DIR}/build/native/${WEBVIEW2_ARCH}/WebView2Loader.dll.lib")
    set(WEBVIEW2_DLL "${webview2_sdk_SOURCE_DIR}/build/native/${WEBVIEW2_ARCH}/WebView2Loader.dll")
    
    target_link_libraries(MebliXDesktop PRIVATE
        "${WEBVIEW2_LINK_LIB}"
        ole32
        shell32
        shlwapi
        user32
        version
    )
    
    # Copy WebView2Loader.dll next to the executable
    add_custom_command(TARGET MebliXDesktop POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_if_different
        "${WEBVIEW2_DLL}"
        $<TARGET_FILE_DIR:MebliXDesktop>
    )
else()
    # Linux (GTK3 / WebKit2GTK)
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(GTK3 REQUIRED gtk+-3.0)
    pkg_check_modules(WEBKIT2GTK REQUIRED webkit2gtk-4.1)
    
    target_include_directories(MebliXDesktop PRIVATE
        ${GTK3_INCLUDE_DIRS}
        ${WEBKIT2GTK_INCLUDE_DIRS}
    )
    
    target_link_directories(MebliXDesktop PRIVATE
        ${GTK3_LIBRARY_DIRS}
        ${WEBKIT2GTK_LIBRARY_DIRS}
    )
    
    # WebView GTK compile flag
    target_compile_definitions(MebliXDesktop PRIVATE WEBVIEW_GTK)
    
    target_link_libraries(MebliXDesktop PRIVATE
        ${GTK3_LIBRARIES}
        ${WEBKIT2GTK_LIBRARIES}
    )
endif()

