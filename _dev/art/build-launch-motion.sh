#!/usr/bin/env bash
# The input is an original generated image. Keep it outside the production bundle.
set -euo pipefail
source_image=${1:?Pass the source image path}
mkdir -p assets/launch
ffmpeg -hide_banner -loglevel error -y -i "$source_image" -vf scale=640:960 -frames:v 1 -c:v libwebp -quality 80 assets/launch/chamber-still.webp
ffmpeg -hide_banner -loglevel error -y -loop 1 -framerate 10 -i "$source_image" -vf "scale=704:1056,zoompan=z='1.025+0.012*sin(2*PI*on/60)':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2+2*sin(2*PI*on/60)':d=1:s=640x960:fps=10" -t 6 -c:v libwebp_anim -quality 65 -compression_level 5 -loop 0 assets/launch/chamber-loop.webp
