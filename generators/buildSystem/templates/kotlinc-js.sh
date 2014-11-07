#!/bin/bash

set -e

module_path=$1; shift
module_name=$1; shift

if [ ! -d tools/kotlinc ]; then
    mkdir -p tools
    cd tools
    wget -q https://github.com/JetBrains/kotlin/releases/download/build-0.9.66/kotlin-compiler-0.9.66.zip
    unzip kotlin-compiler-0.9.66.zip
    cd ..
fi

kotlin_home=$(pwd)/tools/kotlinc

cd $module_path

find . -name '*.kt' | xargs $kotlin_home/bin/kotlinc-js -output ./build/$module_name.js -library-files ${kotlin_home}/lib/kotlin-jslib.jar -nowarn -output-prefix $kotlin_home/lib/kotlin.js
