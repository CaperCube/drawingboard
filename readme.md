# A simple networked blackboard
Ever need to just draw a couple of things with a buddy but you don't want to make an account on some random site?
Spin up a server of this and draw some stuff!
- No hastle
- Simple UI
- Yeah

## Hosting a server:

Here's some beginner / intermediate level instructions to get this bot up and running:

1. Install dev environment (I like VSCode).
2. Install Node.js on your system.
3. Create a directory on your system and put the contents of the project here
4. Open VSCode and use *File > Open Folder...* to open this folder.
5. Click *Terminal > New Terminal*.
6. Run the command `npm init` and take note of the app entry name (i.e. `index.js`), make sure it matches the js file in the root folder of the project.
7. Run the command `npm install` in the terminal to install the project's node packages.
8. Create a file called `.env` in the main directory (where `package.json` is located).
9. Edit this file and write `PORT = ` followed by your desired server port (`8080` works fine).
10. Type `node .` in the terminal, and hit enter to start the server.
11. To connect to the game, open a browser and type in your IP address followed by the port the server's running from (example: `<your-ip>:8080`).
12. Close VSCode or click in the terminal and press `Ctrl + c` to stop the server.

**Note**
- Only the server operator should need to perfor this set-up, all connecting players only need to do step 11.
- You will likely need to port-forward for other off-network players to connect to your server.
