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
        ctx.fillStyle = "#ffffff";
        ctx.fillText(texts[index], x + boxWidth / 2, y + boxHeight / 2);
    });
    return new AttachmentBuilder(await canvas.encode('png'), { 'name': 'boxes.png' });
}
export async function playWordle(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const user = interaction.user;
    const channel = await interaction.channel?.fetch();
    if (!channel || !(channel instanceof TextChannel)) {
        console.error("Could not find channel");
        interaction.editReply("Channel not found!");
        return;
    }
    const game = new Game();
    await game.start();
    const canvasWidth = 500;
    const canvasHeight = 700;
    const boxCount = 5;
    const padding = 10;
    const boxHeight = 100;
    const boxWidth = (canvasWidth - (padding * (boxCount + 1))) / boxCount;
    const canvas = createCanvas(canvasWidth, canvasHeight);
    for (let index = 0; index < 6; index++) {
        const filter = (response) => response.author.id === user.id && response.content.length === 5;
        let input = await channel.awaitMessages({ filter: filter, max: 1, time: 60000, dispose: true });
        if (input === undefined) {
            interaction.editReply(`${user.displayName} did not play entirely!`);
            return;
        }
        if (input.first() === undefined) {
            interaction.editReply(`${user.displayName} did not play entirely!`);
            return;
        }
        const guess = input.first()?.content;
        await input.first()?.delete();
        if (guess === undefined) {
            interaction.editReply(`${user.displayName} did not play entirely!`);
            return;
        }
        let texts = Array.from(guess, (char) => char.toUpperCase());
        let colors = await game.guess(guess);
        const attachment = await drawBoxes(canvas, colors, texts, index, padding, 20, boxWidth, boxHeight);
        interaction.editReply({ files: [attachment] });
        if (game.guessed) {
            channel.send(`${user.displayName} found the word in ${6 - game.chances} guesses.`);
            return;
        }
    }
    if (game.chances === 0 || !game.guessed) {
        channel.send(`${user.displayName} could not find the word. Better luck next time!`);
    }
}
