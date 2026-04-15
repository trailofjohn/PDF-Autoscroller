# PDF Autoscroller for Obsidian

Human Text :

This is vibe coded.
efficiency is a dream here (probably)
when I use it the pdf scrolls. I have no idea why or how.
But it scrolls. Not bad for 20 mins and 3 prompts

AI Text :

Automatically scroll your PDF files inside Obsidian at a smooth, customizable pace. Experience smooth reading right from your workspace!

https://github.com/user-attachments/assets/demo.mp4 (Or view via `./demo/demo.mp4` locally)

## Features

- **Smooth Scrolling**: Engineered with `requestAnimationFrame` and fractional-pixel calculation, pushing standard interval-based scrolling aside to achieve visually perfect velocity.
- **Words Per Minute (WPM) Targeting**: Read optimally. Toggle the WPM mode to automatically calculate the required screen-velocity based on standardized mathematical conversions of your active PDF viewport!
- **Granular Speed Dial**: Want full control? Dial your speed natively using your scroll wheel up to practically unlimited ceilings.

## Screenshots

**WPM Toggle OFF** (Manual Drag Speed Mode)
![WPM Off](./demo/WPM%20toggle%20off.png)

**WPM Toggle ON** (Calculated Read Speed Mode)
![WPM On](./demo/WPM%20toggle%20on.png)

## The WPM Engine
Rather than relying on abstract guessing or raw zoom-level hardcoding, setting your reading speed to `WPM` invokes a scientifically backed extraction:
1. **Word Constraint Check**: Standard book-scale pages process around `250 words per page`. At `WPM`, completing one single page demands exactly `15000 / WPM` seconds.
2. **True-Box Extraction**: The plugin dives into the active `pdf.js` bounding layers in Obsidian. It isolates the primary `.page` container and determines its exact pixel `clientHeight` based on your exact layout and zoom parameters. 
3. **Velocity Matching**: It establishes pixel velocity using the formula: `Pixels_Per_Second = (Client_Height * Target_WPM) / 15000`.
This allows the scrolling velocity to be mathematically locked to your precise reading cadence!

## How to use

1. Open Obsidian and select any `.pdf` viewing pane.
2. Inside your left-hand ribbon menu, click the **Chevrons-Up** icon to instantly invoke the autoscroller. 
3. Click it again to halt scrolling.
4. Go to **Settings -> Plugin Options -> PDF Autoscroller** to dial in manual speed controls or configure your exact WPM threshold.

## Installation

Pending Official Community Release.
*(Currently, this can be manually installed by dropping the built files into a vault, or installed via Obsidian42 BRAT by pointing to this repository!)*

