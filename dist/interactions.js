import { playWordle } from "./wordle.js";
export async function handleInteraction(commandName, interaction, init_files) {
    console.log(`Received a ${commandName} request from ${interaction.user.tag}.`);
    if (commandName === "wordle") {
        await playWordle(interaction, init_files.get("wordle_words"));
    }
    else if (commandName === "ping") {
        await interaction.reply({ content: "Pong", ephemeral: true });
    }
}
