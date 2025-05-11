echo apt-get update----------------------------------------------------- &> setup-dev.log
sudo apt-get update &>> setup-dev.log
echo npm ci------------------------------------------------------------- &>> setup-dev.log
sudo npm ci &>> setup-dev.log
echo npx playwright install-deps---------------------------------------- &>> setup-dev.log
sudo npx playwright install-deps &>> setup-dev.log
echo apt-get install---------------------------------------------------- &>> setup-dev.log
sudo apt-get install -y \
    libgtk-4-1 \
    libgraphene-1.0-0 \
    libwoff1 \
    libevent-2.1-7 \
    libopus0 \
    libgstreamer1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    libflite1 \
    libharfbuzz-icu0 \
    libsecret-1-0 \
    libhyphen0 \
    libmanette-0.2-0 \
    libgles2 &>> setup-dev.log
echo npx playwright install--------------------------------------------- &>> setup-dev.log
sudo npx playwright install &>> setup-dev.log

