# Rescue Pawtrol
#HackTheKitty entry

## Inspiration
Stray animals in urban areas face constant dangers from busy streets, horrible people, and lack of immediate care. I wanted to build an empathy-driven game that highlights the urgency of animal rescue work, while delivering fun, challenging mechanics.

## Installation
``` bash
git clone https://github.com/Ronbc779/Rescue-Pawtrol.git
cd Rescue-Pawtrol
```
## Running the Project
### Option A — Python:
``` bash
python3 -m http.server 8000
```
Then open http://localhost:8000

### Option B — Node.js:
``` bash
npx serve .
```
Then open the URL it prints (typically http://localhost:3000)

### Option C — VS Code:
Install the "Live Server" extension, right-click index.html, and choose "Open with Live Server".

### Known Issues

- This project is still under active development. See the project report for the full testing matrix, including:
- Some sprites (e.g. the virus hazard in Level 2, or injured-cat art in Level 3) will fall back to a placeholder shape if the corresponding image isn't present in src/assets/ — double check those files exist if something looks wrong.
A handful of bugs were caught and fixed during testing but haven't had a full live re-test pass yet.

## Credits

- <ins>**Cat Sprites**</ins> - [32x32 Pixel Kittens Cats - Animated NPC](https://last-tick.itch.io/animated-pixel-kittens-cats-32x32) by [Last Tick](https://last-tick.itch.io/). Used and edited under the pack's free license.
- <ins>**Car Sprites**</ins> - [Top Down Cars Sprite Pack 1.0](https://tokka.itch.io/top-down-car) by [tokka](https://tokka.itch.io/). Used and edited under the pack's free license.