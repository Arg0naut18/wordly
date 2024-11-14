import { playWordle } from "./wordle.js";
export async function handleInteraction(commandName, interaction) {
    if (commandName === "wordle") {
        await playWordle(interaction);
    }
    else if (commandName === "ping") {
        await interaction.reply({ content: "Pong", ephemeral: true });
    }
}
