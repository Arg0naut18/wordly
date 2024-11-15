import { AttachmentBuilder, TextChannel } from "discord.js";
import { createCanvas } from '@napi-rs/canvas';
import { Game } from "./game.js";
async function drawBoxes(canvas, colors, texts, row, padding, rowPadding, boxWidth, boxHeight) {
    const ctx = canvas.getContext('2d');
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    colors.forEach((color, index) => {
        // Calculate the x position with padding
        const x = padding + index * (boxWidth + padding);
        const y = row * (boxHeight + rowPadding);
        // Draw rectangle with specified color
        ctx.fillStyle = color;
        ctx.fillRect(x, y, boxWidth, boxHeight);
        ctx.fillStyle = "#000000";
        ctx.fillText(texts[index], x + boxWidth / 2, y + boxHeight / 2);
    });
    return new AttachmentBuilder(await canvas.encode('png'), { 'name': 'box.png' });
}
async function initCanvas(canvas, padding, rowPadding, boxWidth, boxHeight) {
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
            const x = padding + j * (boxWidth + padding);
            const y = i * (boxHeight + rowPadding);
            ctx.fillRect(x, y, boxWidth, boxHeight);
        }
    }
    return new AttachmentBuilder(await canvas.encode('png'), { 'name': 'boxes.png' });
}
function isValidWord(arr, elem, n) {
    elem = elem.toLowerCase();
    let low = 0;
    let high = n - 1;
    let mid = 0;
    while (low <= high) {
        mid = (low + high) >> 1;
        let compVal = arr[mid].localeCompare(elem);
        if (compVal < 0) {
            low = mid + 1;
        }
        else if (compVal > 0) {
            high = mid - 1;
        }
        else {
            return true;
        }
    }
    return false;
}
function getAvailableChars(unavailable_words) {
    let availableWords = [];
    for (let i = 0; i < 26; i++) {
        if (unavailable_words[i] == 0) {
            availableWords.push(String.fromCharCode(i + 65));
        }
    }
    return availableWords;
}
export async function playWordle(interaction, allowed_words) {
    await interaction.deferReply({ ephemeral: true });
    const wordLen = allowed_words.length;
    console.log(`Loaded ${wordLen} words.`);
    if (wordLen === 0) {
        return;
    }
    const user = interaction.user;
    const channel = await interaction.channel?.fetch();
    if (!channel || !(channel instanceof TextChannel)) {
        console.error("Could not find channel");
        interaction.editReply("Channel not found!");
        return;
    }
    const game = new Game();
    await game.start();
    let unavailable_words = Array(26).fill(0);
    const canvasWidth = 550;
    const canvasHeight = 700;
    const boxCount = 5;
    const padding = 10;
    const rowPadding = 20;
    const boxHeight = 100;
    const boxWidth = (canvasWidth - (padding * (boxCount + 1))) / boxCount;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    interaction.editReply({ files: [await initCanvas(canvas, padding, rowPadding, boxWidth, boxHeight)] });
    for (let index = 0; index < 6; index++) {
        const filter = (response) => response.author.id === user.id && response.content.length === 5 && isValidWord(allowed_words, response.content, wordLen);
        const input = await channel.awaitMessages({ filter: filter, max: 1, time: 600000, dispose: true });
        const guess = input?.first()?.content;
        await input?.first()?.delete();
        if (guess === undefined) {
            interaction.editReply(`${user.displayName} did not play entirely!`);
            return;
        }
        let texts = Array.from(guess, (char) => {
            char = char.toUpperCase();
            unavailable_words[char.charCodeAt(0) - 65]++;
            return char;
        });
        let colors = await game.guess(guess);
        const attachment = await drawBoxes(canvas, colors, texts, index, padding, rowPadding, boxWidth, boxHeight);
        interaction.editReply({ files: [attachment], content: `Chars left:\n${getAvailableChars(unavailable_words).join(",")}` });
        if (game.guessed) {
            channel.send(`${user.displayName} found the word in ${6 - game.chances} guesses.`);
            return;
        }
    }
    if (game.chances === 0 || !game.guessed) {
        interaction.editReply(`The answer was ${game._answer}`);
        channel.send(`${user.displayName} could not find the word. Better luck next time!`);
    }
}
