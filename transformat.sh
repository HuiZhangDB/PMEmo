#!/bin/sh

# Transform MP3 to WAV for adapting requirememt of OpenSIMLE

echo "Please Enter the MP3Path -> "
read mpath
cd ${mpath}
mkdir 'wav'

for m in *.mp3
do
ffmpeg -i "${m}" "wav/${m%.mp3}.wav"
done

